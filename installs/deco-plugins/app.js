import m from "crypto";
const a = () => ({
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
function _(t, e, n) {
  const i = m.createCipheriv(
    "aes-256-cbc",
    Buffer.from(e, "hex"),
    Buffer.from(n, "hex")
  );
  let s = i.update(t, "utf-8", "hex");
  return s += i.final("hex"), s;
}
const E = () => [
  () => [
    {
      statement: `CREATE TABLE ${a().plugins.table_name} (
						id UUID PRIMARY KEY,
						name VARCHAR(255),
						manifest_uri VARCHAR(255),
						permissions JSONB,
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
], R = {
  paths: {
    "/": {
      post: {
        summary: "Create a record of a plugin installation",
        operationId: "createInstallationRecord",
        execution: async ({ req: t, res: e, runStatement: n }) => {
          const s = (await n({
            statement: `SELECT * FROM ${a().plugins.table_name} WHERE name=$1`,
            data_key: "existingPlugins",
            values: [t.body.name]
          })).existingPlugins.rows;
          if (s != null && s.length)
            return e.status(400).send({ message: "Plugin name already exists." });
          const {
            id: r,
            name: o,
            manifest_uri: d,
            permissions: u = [],
            core_key: l,
            routes: c
          } = t.body, y = p(c), g = m.randomBytes(16).toString("hex");
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: `INSERT INTO ${a().plugins.table_name} (id, name, manifest_uri, permissions, core_key, routes, secrets, initialization_vector) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                data_key: "newPlugin",
                values: [
                  r,
                  o,
                  d,
                  u,
                  l,
                  y,
                  {},
                  g
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
              statement: `SELECT * FROM ${a().plugins.table_name};`,
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
                statement: `DELETE FROM ${a().plugins.table_name} WHERE id = $1;`,
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
                statement: `SELECT * FROM ${a().plugins.table_name} WHERE id = $1;`,
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
          const { id: e } = t.params, { manifest_uri: n, permissions: i, core_key: s, routes: r } = t.body, o = p(r);
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: `UPDATE ${a().plugins.table_name} SET manifest_uri = $2, permissions = $3, core_key = $4, routes = $5
									WHERE id = $1;`,
                data_key: "updatedInstallationRecord",
                values: [
                  e,
                  n,
                  i,
                  s,
                  o
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
          const { req: e, res: n, runRoute: i } = t, { id: s } = e.params, { key: r, value: o } = e.body, d = n.locals._server.encryption_string, { data: u } = await i(
            t,
            R.paths["/{id}"].get
          ), l = u.secrets, c = _(
            o,
            d,
            u.initialization_vector
          );
          return l[r] = c, u.secrets = l, [
            () => [
              {
                statement: `UPDATE ${a().plugins.table_name} SET secrets = $1 WHERE id = $2`,
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
}, h = () => {
};
export {
  R as endpoints,
  E as onInstall,
  h as postInstall,
  a as tables
};
