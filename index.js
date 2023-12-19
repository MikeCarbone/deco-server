import express from "express";
import dotenv from "dotenv";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import vhost from "vhost";
import morgan from "morgan";
import { createDecipheriv, randomUUID as uuid } from "crypto";
import cookie from "cookie";
import { client } from "./db/index.js";

import config from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const PORT = process.env.PORT || 3000;

const { PLUGIN_SECRET_ENCRYPTION_STRING, LOGIN_JWT_KEY, DEFAULT_USER_PASSWORD, INITIALIZE_CORE_PLUGIN_ID } = config;

function getInstallationsDir() {
  const currentDir = process.cwd();
  return path.join(currentDir, ".deco", "installs");
}

async function createInstallationsDir() {
  const installationsDir = getInstallationsDir();
  try {
    return await fs.access(installationsDir);
  } catch (_err) {
    return await fs.mkdir(installationsDir, { recursive: true });
  }
}

// Decryption function
export function decryptSecret(encryptedText, key, iv) {
  const decipher = createDecipheriv("aes-256-cbc", Buffer.from(key, "hex"), Buffer.from(iv, "hex"));
  let decrypted = decipher.update(encryptedText, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}

export async function loadPlugins() {
  try {
    const installationsDir = getInstallationsDir();
    const { endpoints } = await import(path.join(installationsDir, "deco-plugins", "app.js"));
    const execution = endpoints.paths["/"].get.execution;

    // This execution ONLY applies to this specific user plugin
    const executionOps = await execution();
    const { allPlugins } = await executeOperations(executionOps, CORE_PLUGINS[CORE_KEYS.plugins].id);
    return allPlugins.rows;
  } catch (error) {
    console.log("Error loading plugins table. Assuming it doesn't exist...");
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
  return `"${tableName}_${id}"`;
}

/**
 *
 * ON WHY WE'RE NOT PARSING AN AST TREE OF THE SQL STATEMENT:
 *
 * Okay so AST parsing doesn't work because when we reference other tables,
 * it tries to append the current plugin ID to the referenced table
 * Even though that should happen through a structured permission fetch and not be dynamic
 * So we get something like plugins_aa3d07b0-3042-44ea-b6b9-b30e3437a449_676b5013-12e3-4dba
 * Which is appending the current plugin ID dynamically onto the static one that was granted
 * So we'll need something else
 */
/**
 * This is a very manual way of parsing out SQL statements so we can append the IDs
 * It's very physical and notsuper reliable (not thoroughly tested)
 * Also not sure if it handles upper / lower casing correctly
 */
function formatStatement(statement, pluginId) {
  const stdStatement = statement.toUpperCase();
  statement = statement.replaceAll(";", "");

  if (
    stdStatement.startsWith("CREATE TABLE") ||
    stdStatement.startsWith("INSERT INTO") ||
    stdStatement.startsWith("DELETE FROM") ||
    stdStatement.startsWith("DROP TABLE") ||
    stdStatement.startsWith("ALTER TABLE")
  ) {
    const fragments = statement.split(" ");
    fragments[2] = getTableIdentifier(fragments[2], pluginId);
    const combined = fragments.join(" ");
    return combined;
  }

  if (stdStatement.startsWith("UPDATE")) {
    const fragments = statement.split(" ");
    fragments[1] = getTableIdentifier(fragments[1], pluginId);
    const combined = fragments.join(" ");
    return combined;
  }

  if (stdStatement.startsWith("SELECT")) {
    const fragments = statement.split(" ");
    const fromIndex = fragments.indexOf("FROM") > -1 ? fragments.indexOf("FROM") : fragments.indexOf("from");
    const tableNameIndex = fromIndex + 1;
    fragments[tableNameIndex] = getTableIdentifier(fragments[tableNameIndex], pluginId);
    const combined = fragments.join(" ");
    return combined;
  }
}

// Execute synchronous executions
export async function executeOperations(operationsArr, pluginId, memory = {}, index = 0) {
  if (!operationsArr?.length) return memory;
  if (index === operationsArr?.length) return memory;
  const executionLayer = operationsArr[index];
  if (!executionLayer) return memory;
  const statementOps = await executionLayer(memory);
  if (!statementOps) return;
  await Promise.all(
    statementOps.map(async (statementOp) => {
      const { statement, data_key, values = [] } = statementOp;

      // New approach, maybe temporary? See comments above about AST parsing approach
      const formattedStatement = formatStatement(statement, pluginId);

      const transaction = await client.query(formattedStatement, values);
      memory[data_key] = transaction;
    })
  );
  return executeOperations(operationsArr, pluginId, memory, index + 1);
}

/**
 * This allows plugins to interact with other plugins
 * We can construct this per-route depending on granted permissions
 * This is essentially the interface how plugins get to use other plugins
 * We'll also want to enable access to root stuff here like logs, profile, etc
 * We don't want plugins to know about other plugins it doesnt have permission to access
 */
export async function prepareEnvironmentInterface(plugin, plugins) {
  /**
   * Initial process is to take the permissions and separate into each plugin
   * We fetch
   */

  /**
   * Create object that looks like
   * { pluginName: { permissions: [{ type: "operation", key: "getTodos" }] }, ... }
   * This will put all of a plugin's permissions in the same bucket
   * This will make the later import easier as we only have to do it once per plugin
   */
  const requiredModulesObj = plugin.permissions.granted.reduce((acc, perm) => {
    const pluginName = perm.plugin_name;
    if (!acc[pluginName]) {
      acc[pluginName] = { permissions: [], plugin_name: pluginName };
    }
    acc[pluginName].permissions.push(perm);
    return acc;
  }, {});

  /**
   * Put that into an array and remove meta ones
   * This gives us an array like
   * [{ plugin_name: "something", permissions: [] }, ...]
   */
  const requiredModules = Object.keys(requiredModulesObj)
    .map((objKey) => ({ ...requiredModulesObj[objKey] }))
    .filter((perm) => perm.plugin_name !== "_meta");

  // Import module and append it to the object
  const models = await Promise.all(
    requiredModules.map(async (mod) => {
      const installationsDir = getInstallationsDir();
      const module = await import(path.join(installationsDir, mod.plugin_name, "app.js"));
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
    const { module, tables, plugin_name: pluginName, permissions } = model;

    // Access potentially oriented object (we set this at the end)
    if (!accumulator[pluginName]) {
      accumulator[pluginName] = {
        operations: {},
        tables: {},
      };
    }

    const { endpoints } = module;
    const flatOperations = flattenOpenApiJson(endpoints.paths);

    // Let's find the plugin we're working within
    const referencedPlugin = plugins.find((plug) => plug.name === pluginName);

    /**
     * This is where we'll be able to append operations to our 'plugins' object
     * Right now it's simple operations, but I imagine this plugins object growing significantly
     */
    permissions.forEach((perm) => {
      if (perm.type === "operation") {
        const operation = flatOperations.find((op) => op.operationId === perm.key);

        if (operation) {
          const possiblyRecursiveInterface = pluginName === plugin.name ? accumulator : prepareEnvironmentInterface(referencedPlugin, plugins);
          accumulator[pluginName].operations[operation.operationId] = async (routeParams) => {
            // Don't want to create an infinite loop
            const operationsArr = await operation.execution({
              ...routeParams,
              plugins: possiblyRecursiveInterface,
            });
            return executeOperations(operationsArr, referencedPlugin.id);
          };
        }
      }

      if (perm.type === "table") {
        const tableConfig = tables[perm.key];

        // If there is a table by the perm key name
        if (!accumulator[pluginName].tables[perm.key]) {
          accumulator[pluginName].tables[perm.key] = {};
        }
        const tableNameWithId = getTableIdentifier(tableConfig.table_name, referencedPlugin.id);
        accumulator[pluginName].tables[perm.key].getTableName = () => tableNameWithId;
      }
    });

    return accumulator;
  }, {});

  // Let's append current plugin information too...
  environmentInterface._currentPlugin = {};
  environmentInterface._currentPlugin.id = plugin.id;
  environmentInterface._currentPlugin.secrets = [{}];

  return environmentInterface;
}

/**
 * FOUR METHODS OF ACCESS
 * 1. public route as configured by owner
 * 2. cookie for local access
 * 3. per-domain authorization
 * 4. TODO: API token authorization header
 */
export async function authenticationMiddleware(req, res, next, plugin, permissionsPluginId, userPluginId) {
  const templateRoutePath = req.route.path;
  const formattedRoutePath = templateRoutePath.replace(/:(\w+)/g, "{$1}");
  const identifier = "/" + formattedRoutePath.split("/").slice(3).join("/");
  const activeRoute = plugin.routes.routes.filter((r) => r.path === identifier).find((r) => r.method.toUpperCase() === req.method.toUpperCase());
  const privacySetting = activeRoute.privacy;

  // Determine route privacy -- public or private
  const isPublicRoute = privacySetting.toUpperCase() === "PUBLIC";

  if (isPublicRoute) {
    return next();
  }

  // If private, continue authentication
  // This is the easiest way to get just the path /a/b/c without query info ?q=xyz
  const url = new URL(`${req.protocol}://${req.get("host")}${req.originalUrl}`);
  const resource = url.pathname;

  // Identify request source from req, including subdomains, not including protocol
  const requestSource = req.get("host").toUpperCase();

  // Check to see if permission record exists for this
  const installationsDir = getInstallationsDir();
  const { endpoints } = await import(path.join(installationsDir, "deco-permissions", "app.js"));
  const permissionFetch = endpoints.paths["/"].get.execution;
  // This execution ONLY applies to this specific user plugin
  const permissionFetchOps = await permissionFetch({
    req: {
      query: {
        domain: requestSource,
        resource: resource.toUpperCase(),
        method: req.method,
      },
    },
  });
  const { permissions } = await executeOperations(permissionFetchOps, permissionsPluginId);
  if (permissions?.rows?.length > 0) {
    const permissionDoc = permissions.rows[0];
    // Permission granted and expiration is in the future
    const expirationDate = new Date(permissionDoc.expires);
    const now = new Date();
    if (expirationDate > now) {
      console.log("Permission doc found, access granted.");
      return next();
    }
  }

  // Identify if there is a cookie in req.cookies
  const cookies = cookie.parse(req.headers.cookie || "");
  const cookieAuthToken = cookies["XSRF-TOKEN"];

  // If there is a cookie, validate it as jwt
  if (cookieAuthToken) {
    try {
      res.locals._server.login_jwt_key = LOGIN_JWT_KEY;
      const installationsDir = getInstallationsDir();
      const usersPlugin = await import(path.join(installationsDir, "deco-users", "app.js"));
      const validate = getParallelRouteExecutionContext(userPluginId);
      const { data, status } = await validate({ req, res }, usersPlugin.endpoints.paths["/authenticate"].get);
      if (status === 200) {
        res.locals._user.id = data.sub;
        return next();
      }
    } catch (error) {
      console.log(error);
      return res.status(401).json({ message: "Invalid token in cookie" });
    }
  }

  // If there is no cookie, check for bearer token in authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decodedToken = jwt.verify(token, "your-secret-key");
      req.user = decodedToken; // Attach the user to the request for further use
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid Bearer token" });
    }
  }

  // If there is not a token in authorization header, check if we have this domain saved
  // Replace the logic below with your actual logic for checking the domain
  if (requestSource === "allowedDomain") {
    return next();
  }

  // If none of the conditions are met, deny access
  return res.status(401).json({ message: "No pass. Unauthorized." });

  // Determine route privacy -- public or private
  // If public, return next()
  // If private, continue authentication
  // Identify request source from req, including subdomains, not including protocol
  // Identify if there is a cookie in req.cookies
  // If there is a cookie, validate it as jwt
  // If there is no cookie, check for bearer token in authorization header
  // If there is a token in authorization header, validate it as JWT
  // If there is not token in authorization header, check if we have this domain saved
  // If we do grant access
  //
  // How do we determine route privacy?
  // We want it controllable per-user
  // If not protected, send info
  // If protected, break down cookie from request
}

// This will be passed to plugin middleware and execution functions
// This lets us run execution for a single statement
export function getExecuteOperationFunctionInPluginContext(pluginId) {
  return async (operation) => executeOperations([() => [operation]], pluginId);
}

// Provides us with context to run a route statement from within an plugin
// Middleware will only run on routes, everything else should be ran via `execution`
export function getParallelRouteExecutionContext(pluginId) {
  // Pass in req, res, etc...
  // Plugins will be responsible for passing context
  // This gives plugins an opportunity to customize the context of a route execution
  // e.g. changing req.params or req.body
  return async (context, operation) => {
    // Here, instead of a funtion, operation should just be a route object
    if (operation.execution) {
      const operations = await operation.execution(context);
      // Memory object can be a valid return from execution
      // We check for array because executionOps should return array of database execution statements
      // Memory object is just { key: value }
      const memory = Array.isArray(operations) ? await executeOperations(operations, pluginId) : operations;
      if (operation.handleReturn) {
        const formatted = await operation.handleReturn({ ...context, memory });
        return formatted;
      }
      return memory;
    }
  };
}

/**
 * This function will construct our endpoints
 */
export async function buildRouteSubset({ server, user }) {
  const plugins = await loadPlugins();

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

  /**
   * When handling the core user plugin, we need to remember:
   * Users will live in a single table on the root admin database
   */

  await Promise.all(
    plugins.map(async (installedPlugin) => {
      const installationsDir = getInstallationsDir();
      const modulePath = path.join(installationsDir, installedPlugin.name, "/app.js");

      /**
       * TODO: Solve ESM dynamic import
       * Modules can only be loaded once per file execution
       * Rerunning this function does not matter because node caches the import, which cannot be cleaned
       * So if a plugin's file contents are updated while the server is running,
       * then that file's updates will not be reflected here
       * A full server restart is required to clear the import cache
       * Fucking gross and terrible node...
       * https://github.com/nodejs/node/issues/49442
       * https://ar.al/2021/02/22/cache-busting-in-node.js-dynamic-esm-imports/
       */
      const plugin = await import(modulePath);

      const endpoints = plugin.endpoints;
      const executeOperationInPluginContext = getExecuteOperationFunctionInPluginContext(installedPlugin.id);
      const executeParallelRoute = getParallelRouteExecutionContext(installedPlugin.id);

      // We only want to expose user stuff to the auth plugin
      // The core plugins sometimes require us to expose stuff we don't normally want to expose
      // Maybe in the future we can invent a better strategy for this, but for now this is good
      const exposeUserDetails = installedPlugin.core_key === CORE_KEYS.users;
      const exposeJwtKey = installedPlugin.core_key === CORE_KEYS.users;
      const exposeServerSecret = installedPlugin.core_key === CORE_KEYS.plugins;
      const exposeInstallFn = installedPlugin.core_key === CORE_KEYS.plugins;

      // Append metadata if needed
      const preAuthMiddleware = (exposeUser, exposeJwt, exposeServer) => {
        return (req, res, next) => {
          res.locals._user = {};
          res.locals._server = {};

          // Append user to res.locals to auth plugin
          if (exposeUser) {
            res.locals._user = user;
          }

          // We have to make an exception here because how can a user set a secret before logging in
          // All other secrets should be set via plugin secrets
          // Changing this will also log out all users
          if (exposeJwt) {
            res.locals._server.login_jwt_key = LOGIN_JWT_KEY;
          }

          // Necessary for encrypting plugin secrets
          if (exposeServer) {
            res.locals._server.encryption_string = PLUGIN_SECRET_ENCRYPTION_STRING;
          }

          return next();
        };
      };

      // Decrypt this plugin's secrets for this user
      const secrets = Object.fromEntries(
        Object.entries(installedPlugin.secrets).map(([key, value]) => [key, decryptSecret(value, PLUGIN_SECRET_ENCRYPTION_STRING, installedPlugin.initialization_vector)])
      );

      // Let's assemble our route's environment interface as a static object
      // We only have to do this once per plugin's route generation
      const environmentInterface = await prepareEnvironmentInterface(installedPlugin, plugins);

      await Promise.all(
        Object.keys(endpoints.paths).map(async (routePath) => {
          const routeObj = endpoints.paths[routePath];

          // Format OpenAPI params format `/{param}` into Express format `/:param`
          let formattedPathString = routePath.replaceAll("{", ":").replaceAll("}", "");
          if (formattedPathString === "/") {
            formattedPathString = "";
          }

          const methods = Object.keys(routeObj);
          await Promise.all(
            methods.map(async (method) => {
              const methodDef = routeObj[method];

              // Route middleware will run before any user executions has happened
              // This will be a good spot for logging
              const routeMiddleware = async (req, res, next) => {
                next();
              };

              const routeCallback = async (req, res) => {
                try {
                  const executionContext = {
                    req,
                    res,
                    plugins: environmentInterface,
                    secrets,
                    runStatement: executeOperationInPluginContext,
                    runRoute: executeParallelRoute,
                    installPlugin: exposeInstallFn ? installPlugin : undefined,
                  };

                  // This is where we can execute pre-operations
                  const executionOps = await methodDef.execution(executionContext);

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

                  // Memory object can be a valid return from execution
                  // We check for array because executionOps should return array of database execution statements
                  // Memory object is just { key: value }
                  const memory = Array.isArray(executionOps) ? await executeOperations(executionOps, installedPlugin.id) : executionOps;

                  const routeReturn = methodDef.handleReturn
                    ? await methodDef.handleReturn({
                        ...executionContext,
                        memory,
                      })
                    : { status: memory?.status || 200, data: memory?.data };

                  if (methodDef.handleResponse) {
                    return await methodDef.handleResponse({
                      ...executionContext,
                      memory,
                      returned: routeReturn,
                    });
                  }
                  res.status(routeReturn.status).send(routeReturn.data);
                } catch (err) {
                  console.log(err);
                  res.status(500).send({ success: false });
                }
              };

              const nothingFn = (_req, _res, next) => next();
              const operationMiddleware =
                methodDef?.middleware && typeof methodDef?.middleware === "function"
                  ? (req, res, next) => methodDef?.middleware({ req, res, next, runStatement: executeOperationInPluginContext, runRoute: executeParallelRoute })
                  : nothingFn;

              // Let's get this while we have everything here
              // Authentication middleware needs this ID because it has to execute a GET from the permissions plugin context
              // Might as well pas it in here while we have it
              const permissionsPluginId = plugins.find((a) => a.core_key === CORE_KEYS.permissions).id;
              const usersPluginId = plugins.find((a) => a.core_key === CORE_KEYS.users).id;

              // This is a dynamic way of setting express's routes
              // e.g. server.get('/items', callback())
              const route = `/plugins/${installedPlugin.name}${formattedPathString}`;
              server[method](
                route,
                preAuthMiddleware(exposeUserDetails, exposeJwtKey, exposeServerSecret),
                (req, res, next) => authenticationMiddleware(req, res, next, installedPlugin, permissionsPluginId, usersPluginId),
                routeMiddleware,
                operationMiddleware,
                routeCallback
              );
              console.log(`Built ${(methodDef?.privacy || "PRIVATE").toLowerCase()} route ${method.toUpperCase()} ${route}`);
            })
          );
        })
      );
    })
  );
}

/**
 * Options object for configuring the installation of a plugin.
 *
 * @typedef {Object} InstallPluginOptions
 * @property {boolean} [isLocal=false] - Indicates whether the plugin installation should be performed locally. Default is false.
 * @property {string} coreKey - The core key associated with the plugin installation.
 * @property {string} id - The identifier for the plugin being installed.
 */

/**
 * Installs a plugin with the specified URI and options.
 *
 * @param {string} uri - The URI of the plugin to be installed.
 * @param {InstallPluginOptions} [opts={}] - Options for configuring the plugin installation.
 * @returns {Promise<void>} A promise that resolves once the plugin is successfully installed.
 */
export async function installPlugin(uri, opts = {}) {
  const { isLocal = false, coreKey, id, rebuildAfterSuccess = false, installationsInProgress = [] } = opts;
  try {
    let manifest;

    console.log(`Installing ${uri}...`);

    if (installationsInProgress.includes(uri)) {
      console.log(`Skipping duplicate installation of ${uri}.`);
      return;
    }

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
    const installationsDir = getInstallationsDir();
    const folderName = manifest.name;
    const installFolder = path.join(installationsDir, folderName);

    // Create the folder if it doesn't exist
    await fs.mkdir(installFolder, { recursive: true });

    // Save manifest.json in the folder we created
    const filePath = path.join(installFolder, "manifest.json");
    const dataToWrite = JSON.stringify(manifest, null, 2);

    await fs.writeFile(filePath, dataToWrite, "utf8");

    // Find the package URI from the "package_uri" field in the manifest
    const packageUri = manifest.package_uri;

    let pluginCode;
    if (!isLocal) {
      // Make a fetch request to the JavaScript file and save it inside the folder we created
      const pluginResponse = await fetch(packageUri);
      if (!pluginResponse.ok) {
        throw new Error("Failed to fetch app.js");
      }

      pluginCode = await pluginResponse.text();
    } else {
      /**
       * For local installs, we're going to assume that app.js code is next to manifest
       * This simplifies the switch between local and remote plugins,
       * rather than dealing with relative app URLs in the manifest
       */
      const navPieces = uri.split("/");
      const removedManifestPath = navPieces.slice(0, navPieces.length - 1);
      removedManifestPath.push("./app.js");
      const newPath = path.join(__dirname, removedManifestPath.join("/"));
      // Read the file
      pluginCode = await fs.readFile(newPath, "utf-8");
    }

    // Save app.js in the folder
    await fs.writeFile(path.join(installFolder, "app.js"), pluginCode);

    let plugins = await loadPlugins();
    const installations = await import(path.join(installationsDir, "deco-plugins", "app.js"));

    /**
     * If there is no plugins data, that means this is the first install
     * and we need our plugins table before continuing
     * this if statement will create the table, short circuit the function, and start the installation over
     */
    if (!plugins) {
      const installOperations = await installations.onInstall({});
      await executeOperations(installOperations, id);
      const createExecution = installations.endpoints.paths["/"].post.execution;
      const createOperations = await createExecution({
        req: {
          body: {
            id,
            name: manifest.name,
            manifest_uri: uri,
            permissions: [],
            core_key: coreKey,
            routes: flattenOpenApiJson(installations.endpoints.paths),
          },
        },
        runStatement: getExecuteOperationFunctionInPluginContext(id),
        runRoute: getParallelRouteExecutionContext(id),
      });
      await executeOperations(createOperations, id);

      // Now that we have our table, let's run through the install again
      return await installPlugin(uri, { isLocal, coreKey, id });
    }

    // Relative path for import
    const appPath = path.join(installationsDir, manifest.name, "app.js");

    // Load app package contents
    const pluginData = await import(appPath);

    const existingPlugin = plugins.find((a) => a?.name === manifest.name);
    const pluginId = existingPlugin?.id || id || uuid();
    const installsPluginId = CORE_PLUGINS[CORE_KEYS.plugins].id;

    const hasDependencies = manifest?.depends_on && manifest?.depends_on?.length > 0;

    let depInstalled = false;

    // Install dependencies
    if (hasDependencies) {
      // Running into an async issue where this promise.all is resolving as complete
      // before dependent installations are finishing
      await Promise.all(
        manifest.depends_on.map(async (dep) => {
          // Check if it's already installed
          const alreadyInstalled = plugins.find((a) => a.manifest_uri === dep.manifest_uri);
          if (alreadyInstalled) {
            console.log(`Found dependency ${dep.manifest_uri}, but already installed. Skipping...`);
            return;
          }

          // Check if its a core plugin
          const corePluginKeys = Object.values(CORE_KEYS);
          const corePluginMatch = corePluginKeys
            .map((corePluginKey) => {
              const corePlugin = CORE_PLUGINS[corePluginKey];
              const isUriMatch = corePlugin?.manifest?.path === dep.manifest_uri;
              if (isUriMatch) {
                console.log(`Found a dependency reference to a core plugin: ${corePluginKey}`);
                return { ...corePlugin, key: corePluginKey, isMatch: true };
              }
            })
            .find((item) => item?.isMatch === true);

          // Keep track of which dependencies we're installing, avoid circular
          installationsInProgress.push(uri);

          console.log(`Awaiting install of ${dep.manifest_uri}...`);

          depInstalled = true;
          // Add circular reference of current URI to prevent deep deps from installing this same app, triggering loop
          return installPlugin(dep.manifest_uri, {
            isLocal: corePluginMatch && dep.manifest_uri.startsWith(".."),
            coreKey: corePluginMatch?.key,
            installationsInProgress,
          });
        })
      );
      console.log(`Finished dependency resolution for ${uri}`);
    }

    // Reload plugins after resolving dependencies
    if (depInstalled) {
      plugins = await loadPlugins();
    }

    const metaPermissions = manifest.meta_access.map((ma) => ({
      type: "meta",
      key: ma.key,
      plugin_name: "_meta",
    }));
    const depPermissions = !hasDependencies
      ? []
      : manifest.depends_on.map((dep) => {
          // No dependencies on yourself
          if (dep.manifest_uri === uri) {
            return [];
          }
          const referencedDep = plugins.find((a) => a.manifest_uri === dep.manifest_uri);
          // No dep installed
          const manifestName = referencedDep.name;
          const tablePermissions = dep.requested_permissions.tables
            ? dep.requested_permissions.tables.map((depTable) => ({
                type: "table",
                key: depTable.id,
                plugin_name: manifestName,
              }))
            : [];
          const operationsPermissions = dep.requested_permissions?.operations
            ? dep.requested_permissions.operations.map((depOp) => ({
                type: "operation",
                key: depOp.id,
                plugin_name: manifestName,
              }))
            : [];
          return [...tablePermissions, ...operationsPermissions];
        });

    const grantedPermissions = [...metaPermissions, ...depPermissions.flat()];
    const saveData = {
      id: pluginId,
      name: manifest.name,
      manifest_uri: uri,
      permissions: { granted: grantedPermissions },
      core_key: coreKey || "",
      routes: flattenOpenApiJson(pluginData.endpoints.paths),
    };

    // Remove existing version
    if (!!existingPlugin) {
      const update = installations.endpoints.paths["/{id}"].patch.execution;
      // This execution ONLY applies to this specific user plugin
      const updateExecutionOps = await update({
        req: {
          params: { id: pluginId },
          body: saveData,
        },
      });
      await executeOperations(updateExecutionOps, installsPluginId);
    } else {
      const createExecution = installations.endpoints.paths["/"].post.execution;
      // This execution ONLY applies to this specific user plugin
      const creationExecutionOps = await createExecution({
        req: { body: saveData },
        runStatement: getExecuteOperationFunctionInPluginContext(installsPluginId),
        runRoute: getParallelRouteExecutionContext(installsPluginId),
      });
      await executeOperations(creationExecutionOps, installsPluginId);
    }

    // Write the updated JSON content back to the file
    // The null and 2 parameters make the output pretty-printed with 2 spaces for indentation.
    // const output = JSON.stringify(plugins, null, 2);
    // await fs.writeFile(APPS_FILE_PATH, output, "utf8");

    if (!existingPlugin) {
      // Execute the onInstall command
      if (pluginData.onInstall) {
        const env = await prepareEnvironmentInterface(saveData, plugins);
        const installOperations = await pluginData.onInstall({ plugins: env });
        await executeOperations(installOperations, pluginId);
      }
    }

    //
    if (rebuildAfterSuccess) {
      console.log("Rebuilding routes...");
      await buildRoutes(server);
    }

    console.log(`Plugin ${uri} installation successful.`);
    return { manifest, plugin: pluginData, save: saveData };
  } catch (error) {
    console.error(error);
    return Promise.reject(`Failed installing ${uri}: ${error.toString()}`);
  }
}

// Plugins with specific rules that have to be installed for the server to function correctly
export const CORE_KEYS = {
  users: "users",
  plugins: "plugins",
  logs: "logs",
  permissions: "permissions",
  notifications: "notifications",
};

const isLocalPluginSource = (process.env.PLUGINS_SOURCE || "").toUpperCase() === "LOCAL";
export const CORE_PLUGINS = {
  [CORE_KEYS.users]: {
    manifest: {
      path: isLocalPluginSource ? "../deco-core/packages/deco-users/dist/manifest.json" : "https://registry.decojs.com/plugins/deco-users/latest/manifest.json",
    },
  },
  [CORE_KEYS.notifications]: {
    manifest: {
      path: isLocalPluginSource ? "../deco-core/packages/deco-notifications/dist/manifest.json" : "https://registry.decojs.com/plugins/deco-notifications/latest/manifest.json",
    },
  },
  [CORE_KEYS.permissions]: {
    manifest: {
      path: isLocalPluginSource ? "../deco-core/packages/deco-permissions/dist/manifest.json" : "https://registry.decojs.com/plugins/deco-permissions/latest/manifest.json",
    },
  },
  [CORE_KEYS.plugins]: {
    // We have to create this ID first so that we can run the installPlugin function
    // Ideally this ID gets a static generation upon first server build. It should not change
    // when the server restarts, so running a function here will not work
    id: INITIALIZE_CORE_PLUGIN_ID,
    manifest: {
      path: isLocalPluginSource ? "../deco-core/packages/deco-plugins/dist/manifest.json" : "https://registry.decojs.com/plugins/deco-plugins/latest/manifest.json",
    },
  },
};

export async function createOwnerIfNotThereAlready() {
  const plugins = await loadPlugins();
  const usersPlugin = plugins.find((a) => a.core_key === CORE_KEYS.users);
  const installationsDir = getInstallationsDir();
  const { endpoints } = await import(path.join(installationsDir, usersPlugin.name, "app.js"));
  const getExecution = await endpoints.paths["/"].get.execution({ res: { locals: { isRootUser: true } } });
  const usersFetch = await executeOperations(getExecution, usersPlugin.id);
  const allUsers = usersFetch.allUsers.rows;
  if (allUsers && allUsers?.length > 0) return;
  const postExecution = endpoints.paths["/"].post.execution;
  const postExecutionOps = await postExecution({ req: { body: { password: DEFAULT_USER_PASSWORD, subdomain: "root" } }, res: { locals: { isServer: true } } });
  const results = await executeOperations(postExecutionOps, usersPlugin.id);
  console.log("New owner created.");
  return results;
}

export async function buildRoutes(mainServer) {
  // For each user, let's build our route subset
  const plugins = await loadPlugins();
  const usersPlugin = plugins.find((a) => a.core_key === CORE_KEYS.users);
  const installationsDir = getInstallationsDir();
  const { endpoints } = await import(path.join(installationsDir, usersPlugin.name, "app.js"));
  const execution = endpoints.paths["/"].get.execution;
  // This execution ONLY applies to this specific user plugin
  const executionOps = await execution({ res: { locals: { isRootUser: true } } });
  const results = await executeOperations(executionOps, usersPlugin.id);
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
      // POST _meta/login
      // POST _meta/change-password

      // Let's expose if it's the root user or not
      serverInstance.use((_req, res, next) => {
        res.locals.isRootUser = !hasSubdomain;
        next();
      });

      // While yes we're using express, it'll be more helpful to know this is a Deco server in responses
      serverInstance.use((_req, res, next) => {
        res.setHeader("X-Powered-By", "Deco");
        next();
      });
      serverInstance.use(morgan("tiny"));
      serverInstance.use(express.json());

      serverInstance.get("/_meta/webid", (req, res) => {
        return res.status(200).send({ user: user.subdomain });
      });

      // This doesnt factor in components
      // Components aren't included in the saved route json, so have to fix that first
      serverInstance.get("/_meta/open-api", (req, res) => {
        const paths = {};

        plugins.forEach((plugin) => {
          const routes = plugin.routes.routes;
          routes.forEach((route) => {
            const url = `/plugins/${plugin.name}${route.path}`;
            if (!paths[url]) {
              paths[url] = {};
            }
            paths[url][route.method] = {
              security:
                route?.privacy === "PUBLIC"
                  ? []
                  : [
                      {
                        csrfTokenAuth: [],
                      },
                    ],
              consumes: ["application/json"],
              ...route,
            };
          });
        });
        return res.status(200).send({
          openapi: "3.0.0",
          info: {
            title: "Deco API",
            version: "1.0.0",
          },
          servers: [
            {
              url: "http://localhost:3456",
              description: "Local Development Server",
            },
          ],
          components: {
            securitySchemes: {
              csrfTokenAuth: {
                type: "apiKey",
                in: "cookie",
                name: "XSRF-TOKEN",
              },
            },
          },
          paths,
        });
      });

      await buildRouteSubset({ server: serverInstance, user });

      // Append server instance to subdomain resolution
      if (hasSubdomain) {
        mainServer.use(vhost(`${user.subdomain}.localhost`, serverInstance));
      }

      return { server: serverInstance, user };
    })
  );
  return subservers;
}

export const server = express();

// Upon first load, we can assume the db and these core plugins are for the root user
// Eventually we'll have to install all of these core plugins per user
// Users plugin should only belong with the root user
// Users will need their own DB connection configuration
// Users should be able to bring multiple databases too, not just one
// Can create a databases table, plugins can refer to a database ID so we know which pool to hit with our queries
export async function deco() {
  await createInstallationsDir();
  const isLocal = !!(process.env.PLUGINS_SOURCE || "").toUpperCase() === "LOCAL";
  await installPlugin(CORE_PLUGINS[CORE_KEYS.plugins].manifest.path, { isLocal, coreKey: CORE_KEYS.plugins, id: CORE_PLUGINS[CORE_KEYS.plugins].id });
  await installPlugin(CORE_PLUGINS[CORE_KEYS.users].manifest.path, { isLocal, coreKey: CORE_KEYS.users });
  await installPlugin(CORE_PLUGINS[CORE_KEYS.permissions].manifest.path, { isLocal, coreKey: CORE_KEYS.permissions });
  await installPlugin(CORE_PLUGINS[CORE_KEYS.notifications].manifest.path, { isLocal, coreKey: CORE_KEYS.notifications });
  await createOwnerIfNotThereAlready();
  await buildRoutes(server);
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
