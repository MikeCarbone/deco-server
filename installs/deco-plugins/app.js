import m from "crypto";
const n = () => ({
  plugins: {
    table_name: "plugins"
  }
}), p = (t) => ({
  routes: t.map((e) => ({
    path: e.path,
    method: e.method,
    summary: e == null ? void 0 : e.summary,
    operation_id: e == null ? void 0 : e.operationId,
    privacy: (e == null ? void 0 : e.privacy) || "PRIVATE"
  }))
});
function R(t, e, a) {
  const r = m.createCipheriv(
    "aes-256-cbc",
    Buffer.from(e, "hex"),
    Buffer.from(a, "hex")
  );
  let s = r.update(t, "utf-8", "hex");
  return s += r.final("hex"), s;
}
const h = () => [
  () => [
    {
      statement: `CREATE TABLE ${n().plugins.table_name} (
						id UUID PRIMARY KEY,
						name VARCHAR(255),
						manifest_uri VARCHAR(255),
						granted_permissions JSONB,
						core_key VARCHAR(255),
						routes JSONB,
						secrets JSONB,
						initialization_vector VARCHAR(255),
						installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
					);`,
      data_key: "pluginsTable",
      values: []
    }
  ]
], f = {
  paths: {
    "/": {
      post: {
        summary: "Create a record of a plugin installation",
        operationId: "createInstallationRecord",
        execution: async ({ req: t, res: e, runStatement: a }) => {
          const s = (await a({
            statement: `SELECT * FROM ${n().plugins.table_name} WHERE name=$1`,
            data_key: "existingPlugins",
            values: [t.body.name]
          })).existingPlugins.rows;
          if (s != null && s.length)
            return e.status(400).send({ message: "Plugin name already exists." });
          const {
            id: i,
            name: o,
            manifest_uri: u,
            granted_permissions: l = [],
            core_key: d,
            routes: c
          } = t.body, g = p(c), y = { granted: l }, _ = m.randomBytes(16).toString("hex");
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: `INSERT INTO ${n().plugins.table_name} (id, name, manifest_uri, granted_permissions, core_key, routes, secrets, initialization_vector) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                data_key: "newPlugin",
                values: [
                  i,
                  o,
                  u,
                  y,
                  d,
                  g,
                  {},
                  _
                ]
              }
            ]
          ];
        }
      },
      // We don't want to expose this externally kinda
      get: {
        summary: "Fetch all plugin installation records",
        operationId: "fetchInstallationRecords",
        execution: () => [
          // Function to pass results from one sync operation to another
          // First will be empty of course
          () => [
            {
              statement: `SELECT * FROM ${n().plugins.table_name};`,
              data_key: "allPlugins",
              values: []
            }
          ]
        ],
        handleReturn: ({ memory: t, res: e }) => ({
          status: 200,
          data: t == null ? void 0 : t.allPlugins.rows
        })
      }
    },
    "/{id}": {
      delete: {
        summary: "Delete an plugin installation record",
        operationId: "deleteInstallationRecord",
        execution: ({ req: t }) => {
          const { id: e } = t.params;
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: `DELETE FROM ${n().plugins.table_name} WHERE id = $1;`,
                data_key: "deletedInstallationRecord",
                values: [e]
              }
            ]
          ];
        }
      },
      get: {
        summary: "Fetch plugin installation record",
        operationId: "getInstallationRecord",
        execution: ({ req: t }) => {
          const { id: e } = t.params;
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: `SELECT * FROM ${n().plugins.table_name} WHERE id = $1;`,
                data_key: "fetchedInstallationRecord",
                values: [e]
              }
            ]
          ];
        },
        handleReturn: ({ memory: t }) => {
          const { fetchedInstallationRecord: e } = t;
          return e != null && e.rows ? {
            data: e == null ? void 0 : e.rows[0],
            status: 200
          } : {
            data: null,
            status: 404
          };
        }
      },
      patch: {
        summary: "Update a plugin installation record",
        operationId: "updateInstallationRecord",
        execution: ({ req: t }) => {
          const { id: e } = t.params, {
            manifest_uri: a,
            granted_permissions: r,
            core_key: s,
            routes: i
          } = t.body, o = { granted: r }, u = p(i);
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: `UPDATE ${n().plugins.table_name} SET manifest_uri = $2, granted_permissions = $3, core_key = $4, routes = $5
									WHERE id = $1;`,
                data_key: "updatedInstallationRecord",
                values: [
                  e,
                  a,
                  o,
                  s,
                  u
                ]
              }
            ]
          ];
        }
      }
    },
    "/{id}/secrets": {
      post: {
        summary: "Save a plugin secret",
        operationId: "savePluginSecret",
        execution: async (t) => {
          const { req: e, res: a, runRoute: r } = t, { id: s } = e.params, { key: i, value: o } = e.body, u = a.locals._server.encryption_string, { data: l } = await r(
            t,
            f.paths["/{id}"].get
          ), d = l.secrets, c = R(
            o,
            u,
            l.initialization_vector
          );
          return d[i] = c, l.secrets = d, [
            () => [
              {
                statement: `UPDATE ${n().plugins.table_name} SET secrets = $1 WHERE id = $2`,
                data_key: "secretSaveRecord",
                values: [d, s]
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
}, $ = () => {
};
export {
  f as endpoints,
  h as onInstall,
  $ as postInstall,
  n as tables
};
