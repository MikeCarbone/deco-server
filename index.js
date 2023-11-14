import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { fileURLToPath } from "url";
import pgParse from "pgsql-parser";
import vhost from "vhost";
import morgan from "morgan";

const { parse, deparse } = pgParse;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const PORT = process.env.PORT || 3000;

const { Pool } = pg;
const client = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});
client.connect();

// Build apps.json if there is none
async function loadAppsJson() {
  try {
    const { endpoints } = await import(`./installs/deco-apps/app.js`);
    const execution = endpoints.paths["/"].get.execution;

    // This execution ONLY applies to this specific user app
    const executionOps = await execution();
    const { allApps } = await executeOperations(executionOps, CORE_APPS[CORE_KEYS.apps].id);
    return allApps.rows;
  } catch (error) {
    console.log("Error loading apps table. Assuming it doesn't exist...");
    // console.error(error);
    return null;
  }
}

function flattenOpenApiJson(paths) {
  // Create an array of operations
  const operations = [];
  for (const path in paths) {
    const methods = paths[path];
    for (const method in methods) {
      const operation = methods[method];
      operations.push({
        path: path,
        method: method,
        ...operation,
      });
    }
  }
  return operations;
}

function getTableIdentifier(tableName, id) {
  return `${tableName}_${id}`;
}

function editRelnameWithId(obj, id) {
  if (typeof obj === "object") {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        editRelnameWithId(obj[i], id);
      }
    } else {
      for (const key in obj) {
        if (key === "relname") {
          obj[key] = getTableIdentifier(obj[key], id);
        } else if (typeof obj[key] === "object") {
          editRelnameWithId(obj[key], id);
        }
      }
    }
  }
}

// Execute synchronous executions
async function executeOperations(operationsArr, appId, memory = {}, index = 0) {
  if (index === operationsArr.length) return memory;
  const executionLayer = operationsArr[index];
  if (!executionLayer) return memory;
  const statementOps = await executionLayer(memory);
  if (!statementOps) return;
  await Promise.all(
    statementOps.map(async (statementOp) => {
      const { statement, data_key, values = [] } = statementOp;

      // use AST to parse out table name and append app's designated uuid
      // multi-word table names have to use underscores or wrap the name in quotes
      // for meta endpoints, we'll use underscores as a standard
      const ast = parse(statement);

      // Append the appId to the referenced tables
      editRelnameWithId(ast, appId);
      const newStatement = deparse(ast);
      const transaction = await client.query(newStatement, values);
      memory[data_key] = transaction;
    })
  );
  return executeOperations(operationsArr, appId, memory, index + 1);
}

/**
 * This allows apps to interact with other apps
 * We can construct this per-route depending on granted permissions
 * This is essentially the interface how apps get to use other apps
 * We'll also want to enable access to root stuff here like logs, profile, etc
 * We don't want apps to know about other apps it doesnt have permission to access
 */
async function prepareEnvironmentInterface(app, apps, routeParams) {
  /**
   * Initial process is to take the granted_permissions and separate into each app
   * We fetch
   */

  /**
   * Create object that looks like
   * { appName: { permissions: [{ type: "operation", key: "getTodos" }] }, ... }
   * This will put all of an app's permissions in the same bucket
   * This will make the later import easier as we only have to do it once per app
   */
  const requiredModulesObj = app.granted_permissions.granted.reduce((acc, perm) => {
    const appName = perm.app_name;
    if (!acc[appName]) {
      acc[appName] = { permissions: [], app_name: appName };
    }
    acc[appName].permissions.push(perm);
    return acc;
  }, {});

  // Put that into an array and remove meta ones
  /**
   * Now we have an array like
   * [{ app_name: "something", permissions: [] }, ...]
   */
  const requiredModules = Object.keys(requiredModulesObj)
    .map((objKey) => ({ ...requiredModulesObj[objKey] }))
    .filter((perm) => perm.app_name !== "_meta");

  // Import module and append it to the object
  const models = await Promise.all(
    requiredModules.map(async (mod) => {
      const module = await import(`./installs/${mod.app_name}/app.js`);
      mod.module = module;
      mod.tables = await module.tables();
      return mod;
    })
  );

  /**
   * This should stay synchronous
   * when we tried to do this async, the accumulated object was really buggy
   * We tried different strategies to address this, but nothing worked so we
   * split the async operations and fetches out of this
   * if we have to append more async operations, do them above this before
   * this reducer
   */
  const environmentInterface = models.reduce((accumulator, model) => {
    const { module, tables, app_name: appName, permissions } = model;

    // Access potentially oriented object (we set this at the end)
    if (!accumulator[appName]) {
      accumulator[appName] = {
        operations: {},
        tables: {},
      };
    }

    const { endpoints } = module;
    const flatOperations = flattenOpenApiJson(endpoints.paths);

    // Let's find the app we're working within
    const referencedApp = apps.find((a) => a.app_name === appName);

    /**
     * This is where we'll be able to append operations to our 'apps' object
     * Right now it's simple operations, but I imagine this apps object growing significantly
     */
    permissions.forEach((perm) => {
      if (perm.type === "operation") {
        const operation = flatOperations.find((op) => op.operationId === perm.key);

        if (operation) {
          const possiblyRecursiveInterface = appName === app.app_name ? accumulator : prepareEnvironmentInterface(referencedApp, apps, routeParams);
          accumulator[appName].operations[operation.operationId] = async () => {
            // Don't want to create an infinite loop
            const operationsArr = await operation.execution({
              ...routeParams,
              apps: possiblyRecursiveInterface,
            });
            return executeOperations(operationsArr, referencedApp.id);
          };
        }
      }

      if (perm.type === "table") {
        const tableConfig = tables[perm.key];

        // If there is a table by the perm key name
        if (!accumulator[appName].tables[perm.key]) {
          accumulator[appName].tables[perm.key] = {};
        }

        accumulator[appName].tables[perm.key].getTableName = () => getTableIdentifier(tableConfig.table_name, app.id);
      }
    });

    return accumulator;
  }, {});

  // Let's append current app information too...
  environmentInterface["_current"] = {};
  environmentInterface["_current"].id = app.id;
  environmentInterface["_current"].secrets = [{}];

  return environmentInterface;
}

async function authenticationMiddleware(req, res, next) {
  // Determine route privacy
  // How do we determine route privacy?
  // We want it controllable per-user
  // If not protected, send info
  // If protected, break down cookie from request
}

// This will be passed to app middleware and execution functions
function getExecuteOperationFunctionInAppContext(appId) {
  return async (operation) => executeOperations([() => [operation]], appId);
}

/**
 * This function will construct our endpoints
 */
async function buildRouteSubset({ server }) {
  const apps = await loadAppsJson();

  // Flush old routes so that we can rebuild
  if (server._router) {
    server._router.stack = server._router.stack.filter((l) => {
      if (l.route) {
        if (l.route.path) {
          if (l.route?.path.substring(0, 6) === "/_meta") {
            return true;
          }
        }
      }
      if (l.name !== "bound dispatch") return true;
      return false;
    });
  }

  await Promise.all(
    apps.map(async (installedApp) => {
      const modulePath = path.resolve(`./installs/${installedApp.app_name}/app.js`);

      /**
       * TODO: Solve ESM dynamic import
       * Modules can only be loaded once per file execution
       * Rerunning this function does not matter because node caches the import, which cannot be cleaned
       * So if an app's file contents are updated while the server is running,
       * then that file's updates will not be reflected here
       * A full server restart is required to clear the import cache
       * Fucking gross and terrible node...
       * https://github.com/nodejs/node/issues/49442
       * https://ar.al/2021/02/22/cache-busting-in-node.js-dynamic-esm-imports/
       */
      const app = await import(modulePath);

      const endpoints = app.endpoints;
      const executeOperationInAppContext = getExecuteOperationFunctionInAppContext(installedApp.id);

      await Promise.all(
        Object.keys(endpoints.paths).map(async (routePath) => {
          const key = routePath;
          const routeObj = endpoints.paths[key];
          let formattedPathString = key.replaceAll("{", ":").replaceAll("}", "");
          if (formattedPathString === "/") {
            formattedPathString = "";
          }
          const methods = Object.keys(routeObj);
          await Promise.all(
            methods.map(async (method) => {
              const routeKey = `${installedApp.app_name}~${method}~${formattedPathString}`;
              const methodDef = routeObj[method];

              // Route middleware will run before any user executions has happened
              // This will be a good spot for logging
              const routeMiddleware = async (req, res, next) => {
                next();
              };

              const routeCallback = async (req, res) => {
                try {
                  const environmentInterface = await prepareEnvironmentInterface(installedApp, apps, { req, res });

                  // This is where we can execute pre-operations
                  const executionOps = await methodDef.execution({
                    req,
                    res,
                    apps: environmentInterface,
                    executeOperation: executeOperationInAppContext,
                  });

                  // If a response is sent from within an execution context,
                  // we don't want to resend anything
                  if (typeof executionOps === "object") {
                    // Check if it is of type `res`
                    if (executionOps.hasOwnProperty("_headerSent")) {
                      if (executionOps._headerSent) return;
                      return res.status(500).send({ message: "Bad application code returned a response, but did not sent to the client." });
                    }
                  }

                  // Make sure there is something to operate on
                  // if (executionOpsLength < 1)

                  const memory = await executeOperations(executionOps, installedApp.id);

                  if (methodDef.handleResponse) {
                    return await methodDef.handleResponse({
                      req,
                      res,
                      data: memory,
                      apps: environmentInterface,
                      executeOperations: executeOperationInAppContext,
                    });
                  }
                  res.status(200).send(memory);
                } catch (err) {
                  console.log(err);
                  res.status(500).send({ sucess: false });
                }
              };

              const nothingFn = (_req, _res, next) => next();
              const operationMiddleware =
                methodDef?.middleware && typeof methodDef?.middleware === "function"
                  ? (req, res, next) => methodDef?.middleware({ req, res, next, executeOperation: executeOperationInAppContext })
                  : nothingFn;

              // This is a dynamic way of setting express's routes
              // server.get('/items', callback())
              server[method](`/apps/${installedApp.app_name}${formattedPathString}`, routeMiddleware, operationMiddleware, routeCallback);

              console.log(`Built route ${method.toUpperCase()} /apps/${installedApp.app_name}${formattedPathString}`);
            })
          );
        })
      );
    })
  );
}

async function installApp(uri, opts = {}) {
  const { isLocal = false, coreKey, id } = opts;
  try {
    let manifest;

    if (!isLocal) {
      // Make a fetch request for manifest JSON from the provided URI
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error("Failed to fetch manifest JSON");
      }
      manifest = await response.json();
    } else {
      // Read the file
      const data = await fs.readFile(path.join(__dirname, uri), "utf-8");
      const jsonData = JSON.parse(data);
      manifest = jsonData;
    }

    // Before completing next steps, here is where we need to make a request for permissions
    // For now, let's assume all permissions are accepted automatically

    // Make a folder inside "installs," titled the same as the "name" field from the manifest
    const folderName = manifest.name;
    const installFolder = path.join(__dirname, "installs", folderName);

    // Create the folder if it doesn't exist
    await fs.mkdir(installFolder, { recursive: true });

    // Save manifest.json in the folder we created
    const filePath = path.join(installFolder, "manifest.json");
    const dataToWrite = JSON.stringify(manifest, null, 2);

    await fs.writeFile(filePath, dataToWrite, "utf8");

    // Find the package URI from the "package_uri" field in the manifest
    const packageUri = manifest.package_uri;

    let appCode;
    if (!isLocal) {
      // Make a fetch request to the JavaScript file and save it inside the folder we created
      const appResponse = await fetch(packageUri);
      if (!appResponse.ok) {
        throw new Error("Failed to fetch app.js");
      }

      appCode = await appResponse.text();
    } else {
      const navPieces = uri.split("/");
      const removedManifestPath = navPieces.slice(0, navPieces.length - 1);
      removedManifestPath.push(packageUri);
      const newPath = path.join(__dirname, removedManifestPath.join("/"));
      // Read the file
      appCode = await fs.readFile(newPath, "utf-8");
    }

    // Save app.js in the folder
    await fs.writeFile(path.join(installFolder, "app.js"), appCode);

    const apps = await loadAppsJson();
    const installations = await import("./installs/deco-apps/app.js");

    if (!apps) {
      const installOperations = await installations.onInstall({});
      await executeOperations(installOperations, id);
      const createExecution = installations.endpoints.paths["/"].post.execution;
      const createOperations = await createExecution({
        req: {
          body: {
            id,
            app_name: manifest.name,
            manifest_uri: uri,
            granted_permissions: [],
            core_key: coreKey,
          },
        },
        executeOperation: getExecuteOperationFunctionInAppContext(id),
      });
      const firstEntry = await executeOperations(createOperations, id);

      // Now that we have our table, let's run through the install again
      return await installApp(uri, { isLocal, coreKey, id });
    }

    // Theres a file called "apps.json" in this folder
    // Edit apps.json to append the necessary information

    const appPath = `${installFolder}/app.js`;

    // Load app package contents
    const appData = await import(appPath);

    const existingApp = apps.find((a) => a?.app_name === manifest.name);
    const appId = existingApp?.id || id || uuid();
    const installsAppId = CORE_APPS[CORE_KEYS.apps].id;

    const hasDependencies = manifest?.depends_on && manifest?.depends_on?.length > 0;

    // Install dependencies
    if (hasDependencies) {
      // await Promise.all(
      // 	manifest.depends_on.map(async (dep) => {
      // 		return installApp(dep.manifest_uri);
      // 	})
      // );
    }

    const tables = await appData.tables();

    const metaPermissions = manifest.meta_access.map((ma) => ({
      type: "meta",
      key: ma.key,
      app_name: "_meta",
    }));
    const depPermissions = !hasDependencies
      ? []
      : manifest.depends_on.map((dep) => {
          // No dependencies on yourself
          if (dep.manifest_uri === uri) {
            return [];
          }
          const referencedDep = apps.find((a) => a.manifest_uri === dep.manifest_uri);
          const manifestName = referencedDep.name;
          const tablePermissions = dep.requested_permissions.tables.map((depTable) => ({
            type: "table",
            key: depTable.id,
            app_name: manifestName,
          }));
          const operationsPermissions = dep.requested_permissions.operations.map((depOp) => ({
            type: "operation",
            key: depOp.id,
            app_name: manifestName,
          }));
          return [...tablePermissions, ...operationsPermissions];
        });

    const grantedPermissions = [...metaPermissions, ...depPermissions.flat()];
    const save = {
      id: appId,
      app_name: manifest.name,
      manifest_uri: uri,
      granted_permissions: grantedPermissions,
      core_key: coreKey || "",
    };

    // Remove existing version
    if (!!existingApp) {
      const update = installations.endpoints.paths["/{id}"].patch.execution;
      // This execution ONLY applies to this specific user app
      const updateExecutionOps = await update({
        req: {
          params: { id: appId },
          body: save,
        },
      });
      await executeOperations(updateExecutionOps, installsAppId);
    } else {
      const createExecution = installations.endpoints.paths["/"].post.execution;
      // This execution ONLY applies to this specific user app
      const creationExecutionOps = await createExecution({
        req: { body: save },
        executeOperation: getExecuteOperationFunctionInAppContext(installsAppId),
      });
      const results = await executeOperations(creationExecutionOps, installsAppId);
    }

    // Write the updated JSON content back to the file
    // The null and 2 parameters make the output pretty-printed with 2 spaces for indentation.
    // const output = JSON.stringify(apps, null, 2);
    // await fs.writeFile(APPS_FILE_PATH, output, "utf8");

    if (!existingApp) {
      // Execute the onInstall command
      if (appData.onInstall) {
        const installOperations = await appData.onInstall({});
        const data = await executeOperations(installOperations, appId);
      }
    }

    console.log("App installation successful.");
  } catch (error) {
    return Promise.reject(error);
  }
}

// Essential
// Install request
// Identification
// Profiles
// Notifications
// Apps installed / available routes
// Logs
// Permissions Requests

// Optional
// Open Inbox (email)
// Messages (between friends)
// Friends

// Apps with specific rules that have to be installed for the server to function correctly
const CORE_KEYS = {
  users: "users",
  apps: "apps",
  logs: "logs",
  permissionRequests: "permission-requests",
  permissions: "permissions",
  notifications: "notifications",
};

const CORE_APPS = {
  [CORE_KEYS.users]: {
    manifest: {
      path: "../deco-users/dist/manifest.json",
    },
  },
  [CORE_KEYS.apps]: {
    id: "aa3d07b0-3042-44ea-b6b9-b30e3437a449",
    manifest: {
      path: "../deco-apps/dist/manifest.json",
    },
  },
};

async function createOwnerIfNotThereAlready() {
  const apps = await loadAppsJson();
  const usersApp = apps.find((a) => a.core_key === CORE_KEYS.users);
  const { endpoints } = await import(`./installs/${usersApp.app_name}/app.js`);
  const getExecution = endpoints.paths["/"].get.execution;
  const getExecutionOps = await getExecution();
  const usersFetch = await executeOperations(getExecutionOps, usersApp.id);
  const allUsers = usersFetch.allUsers.rows;
  if (allUsers && allUsers?.length > 0) return;
  const postExecution = endpoints.paths["/"].post.execution;
  const postExecutionOps = await postExecution({ req: { body: { password: "kellykevinlindsaynickjill", subdomain: "root" } }, res: { locals: {} } });
  const results = await executeOperations(postExecutionOps, usersApp.id);
  console.log("New owner created.");
  return results;
}

async function buildRoutes(mainServer) {
  // For each user, let's build our route subset
  const apps = await loadAppsJson();
  const usersApp = apps.find((a) => a.core_key === CORE_KEYS.users);
  const { endpoints } = await import(`./installs/${usersApp.app_name}/app.js`);
  const execution = endpoints.paths["/"].get.execution;
  // This execution ONLY applies to this specific user app
  const executionOps = await execution();
  const results = await executeOperations(executionOps, usersApp.id);
  const users = results["allUsers"].rows;
  const subservers = await Promise.all(
    users.map(async (user) => {
      const hasSubdomain = !!user.subdomain && user.subdomain !== "root";
      const serverInstance = hasSubdomain ? express() : mainServer;

      // Here we have to generate per-user meta routes like
      // POST _meta/access-request
      // *    _meta/logs
      // GET  _meta/id /profile
      // *    _meta/installs /install-requests (if allowed)
      // *    _meta/ai

      serverInstance.use(morgan("tiny"));
      serverInstance.use(express.json());

      await buildRouteSubset({ server: serverInstance });

      // Append server instance to subdomain resolution
      if (hasSubdomain) {
        mainServer.use(vhost(`${user.subdomain}.localhost`, serverInstance));
      }

      return { server: serverInstance, user };
    })
  );
  return subservers;
}

const server = express();

try {
  await installApp(CORE_APPS[CORE_KEYS.apps].manifest.path, { isLocal: true, coreKey: CORE_KEYS.apps, id: CORE_APPS[CORE_KEYS.apps].id });
  await installApp(CORE_APPS[CORE_KEYS.users].manifest.path, { isLocal: true, coreKey: CORE_KEYS.users });
  await buildRoutes(server);
  await createOwnerIfNotThereAlready();
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
} catch (err) {
  console.log(err);
}

// This is where we setup meta endpoints at the server level (not per-user)
server.get("/_meta/directory", async (req, res) => {
  // What do we want to do for users?
  // roles? is_owner, is_admin, detailsJSON
  //    can store a flat object of "name.nickname" "address.primary.street_address_1"
  // Support for webID information, extendable
  // id, created_at, db_key, manage
  // root domain will be for owner
  // subdomains will be for tenants
  //
  // Steps
  // 1. generate admin / owner user
  // 2. allow only admins to create new users
  // 3. admin can edit user permissions
  // users shouldnt need a username, because the url is their username
  //
  // users will have to log in... how? link to personal?
  // log in flow...
  // enter your url endpoint
  // app go POST to url/authorize, get a URL in response
  // send user to URL
  // 		if logged in, user can grant permissions, etc
  // 		if logged out, log in then ^
  // after acceptance or denial, redirect user back to app
  //
  // Do we want other services to be able to create users?
  // How do we have things pass auth
  // Middleware only triggered on a request
});

// Imagine someone is looking through an app store and clicks "install"
// We can send a request to this endpoint
// Logic can be reused when an app requests an app be installed
server.get("/_meta/install", async (req, res) => {
  try {
    console.log("Installing app...");
    await installApp("http://localhost:4321/manifest.json");

    console.log("Rebuilding routes...");
    // At this point, we have to do a teardown and rebuild of the server routes

    await buildRoutes();

    console.log("Routes rebuilt successfully.");
    return res.status(200).send({ success: true });
  } catch (err) {
    console.log("App installation failed.");
    console.log(err);
    return res.status(500).send({ success: false });
  }
});

// admin dashboards
// control users
// auth + permissions
// login
