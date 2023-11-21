import m from "crypto";
const r = () => ({
  // Key can be anything, but should be reflective of the table name
  // this will be accessible via apps.appName.tables.tableName.modify()
  installed_apps: {
    table_name: "installed_apps"
  }
}), u = (t) => ({
  routes: t.map((e) => ({
    path: e.path,
    method: e.method,
    summary: e == null ? void 0 : e.summary,
    operation_id: e == null ? void 0 : e.operationId,
    privacy: "PRIVATE"
  }))
});
function f(t, e, a) {
  const n = m.createCipheriv(
    "aes-256-cbc",
    Buffer.from(e, "hex"),
    Buffer.from(a, "hex")
  );
  let s = n.update(t, "utf-8", "hex");
  return s += n.final("hex"), s;
}
const $ = () => [
  () => [
    {
      statement: `CREATE TABLE installed_apps (
						id UUID PRIMARY KEY,
						app_name VARCHAR(255),
						manifest_uri VARCHAR(255),
						granted_permissions JSONB,
						core_key VARCHAR(255),
						routes JSONB,
						secrets JSONB,
						initialization_vector VARCHAR(255),
						installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
					);`,
      data_key: "appsTable",
      values: []
    }
  ]
], E = {
  paths: {
    "/": {
      post: {
        summary: "Create a record of an app installation",
        operationId: "createInstallationRecord",
        execution: async ({ req: t, res: e, runStatement: a }) => {
          const s = (await a({
            statement: `SELECT * FROM ${r().installed_apps.table_name} WHERE app_name=$1`,
            data_key: "existingApps",
            values: [t.body.app_name]
          })).existingApps.rows;
          if (s != null && s.length)
            return e.status(400).send({ message: "App name already exists." });
          const {
            id: i,
            app_name: o,
            manifest_uri: p,
            granted_permissions: d = [],
            core_key: l,
            routes: c
          } = t.body, _ = u(c), y = { granted: d }, R = m.randomBytes(16).toString("hex");
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: `INSERT INTO ${r().installed_apps.table_name} (id, app_name, manifest_uri, granted_permissions, core_key, routes, secrets, initialization_vector) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                data_key: "newApp",
                values: [
                  i,
                  o,
                  p,
                  y,
                  l,
                  _,
                  {},
                  R
                ]
              }
            ]
          ];
        }
      },
      // We don't want to expose this externally kinda
      get: {
        summary: "Fetch all app installation records",
        operationId: "fetchInstallationRecords",
        execution: () => [
          // Function to pass results from one sync operation to another
          // First will be empty of course
          () => [
            {
              statement: `SELECT * FROM ${r().installed_apps.table_name};`,
              data_key: "allApps",
              values: []
            }
          ]
        ],
        handleReturn: ({ memory: t, res: e }) => ({
          status: 200,
          data: t == null ? void 0 : t.allApps.rows
        })
      }
    },
    "/{id}": {
      delete: {
        summary: "Delete an app installation record",
        operationId: "deleteInstallationRecord",
        execution: ({ req: t }) => {
          const { id: e } = t.params;
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: `DELETE FROM ${r().installed_apps.table_name} WHERE id = $1;`,
                data_key: "deletedInstallationRecord",
                values: [e]
              }
            ]
          ];
        }
      },
      get: {
        summary: "Fetch app installation record",
        operationId: "getInstallationRecord",
        execution: ({ req: t }) => {
          const { id: e } = t.params;
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: `SELECT * FROM ${r().installed_apps.table_name} WHERE id = $1;`,
                data_key: "fetchedInstallationRecord",
                values: [e]
              }
            ]
          ];
        },
        handleReturn: ({ memory: t, res: e }) => {
          const { fetchedInstallationRecord: a } = t;
          return a != null && a.rows ? {
            data: a == null ? void 0 : a.rows[0],
            status: 200
          } : {
            data: null,
            status: 404
          };
        }
      },
      patch: {
        summary: "Update an app installation record",
        operationId: "updateInstallationRecord",
        execution: ({ req: t }) => {
          const { id: e } = t.params, {
            manifest_uri: a,
            granted_permissions: n,
            core_key: s,
            routes: i
          } = t.body, o = { granted: n }, p = u(i);
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: `UPDATE ${r().installed_apps.table_name} SET manifest_uri = $2, granted_permissions = $3, core_key = $4, routes = $5
									WHERE id = $1;`,
                data_key: "updatedInstallationRecord",
                values: [
                  e,
                  a,
                  o,
                  s,
                  p
                ]
              }
            ]
          ];
        }
      }
    },
    "/{id}/secrets": {
      post: {
        summary: "Save an app secret",
        operationId: "saveAppSecret",
        execution: async (t) => {
          const { req: e, res: a, runRoute: n } = t, { id: s } = e.params, { key: i, value: o } = e.body, p = a.locals._server.encryption_string, { data: d } = await n(
            t,
            E.paths["/{id}"].get
          ), l = d.secrets, c = f(
            o,
            p,
            d.initialization_vector
          );
          return l[i] = c, d.secrets = l, [
            () => [
              {
                statement: `UPDATE ${r().installed_apps.table_name} SET secrets = $1 WHERE id = $2`,
                data_key: "secretSaveRecord",
                values: [l, s]
              }
            ]
          ];
        },
        handleReturn: ({ memory: t }) => {
          const { secretSaveRecord: e } = t;
          return (e == null ? void 0 : e.rowCount) > 0 ? {
            status: 200,
            data: null
          } : {
            status: 500,
            data: null
          };
        }
      }
    }
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Unique identifier for the user"
          },
          password: {
            type: "string",
            minLength: 8,
            description: "User password (hashed or encrypted)"
          },
          is_owner: {
            type: "boolean",
            default: !1,
            description: "Indicates if the user is an owner"
          },
          permissions: {
            type: "object",
            description: "User permissions",
            properties: {
              read: {
                type: "boolean",
                default: !1,
                description: "Permission to read"
              },
              write: {
                type: "boolean",
                default: !1,
                description: "Permission to write"
              }
            }
          },
          user_details: {
            type: "object",
            description: "Details about the user",
            properties: {
              full_name: {
                type: "string",
                minLength: 1,
                description: "Full name of the user"
              },
              email: {
                type: "string",
                format: "email",
                description: "Email address of the user"
              }
            }
          },
          created_at: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the user was created"
          }
        },
        required: ["id", "password"]
      }
    }
  }
}, g = () => {
};
export {
  E as endpoints,
  $ as onInstall,
  g as postInstall,
  r as tables
};
