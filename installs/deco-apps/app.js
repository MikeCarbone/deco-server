const s = () => ({
  // Key can be anything, but should be reflective of the table name
  // this will be accessible via apps.appName.tables.tableName.modify()
  installed_apps: {
    table_name: "installed_apps"
  }
}), d = (t) => ({
  routes: t.map((e) => ({
    path: e.path,
    method: e.method,
    summary: e == null ? void 0 : e.summary,
    operation_id: e == null ? void 0 : e.operationId,
    privacy: "PRIVATE"
  }))
}), y = () => [
  () => [
    {
      statement: `CREATE TABLE installed_apps (
						id UUID PRIMARY KEY,
						app_name VARCHAR(255),
						manifest_uri VARCHAR(255),
						granted_permissions JSONB,
						core_key VARCHAR(255),
						routes JSONB,
						installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
					);`,
      data_key: "appsTable",
      values: []
    }
  ]
], R = {
  paths: {
    "/": {
      post: {
        summary: "Create a record of an app installation",
        operationId: "createInstallationRecord",
        execution: async ({ req: t, res: e, runStatement: n }) => {
          const a = (await n({
            statement: `SELECT * FROM ${s().installed_apps.table_name} WHERE app_name=$1`,
            data_key: "existingApps",
            values: [t.body.app_name]
          })).existingApps.rows;
          if (a != null && a.length)
            return e.status(400).send({ message: "App name already exists." });
          const {
            id: r,
            app_name: i,
            manifest_uri: o,
            granted_permissions: l = [],
            core_key: m,
            routes: u
          } = t.body, c = d(u), _ = { granted: l };
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: `INSERT INTO ${s().installed_apps.table_name} (id, app_name, manifest_uri, granted_permissions, core_key, routes) VALUES ($1, $2, $3, $4, $5, $6)`,
                data_key: "newUser",
                values: [
                  r,
                  i,
                  o,
                  _,
                  m,
                  c
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
              statement: `SELECT * FROM ${s().installed_apps.table_name};`,
              data_key: "allApps",
              values: []
            }
          ]
        ]
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
                statement: `DELETE FROM ${s().installed_apps.table_name} WHERE id = $1;`,
                data_key: "deletedInstallationRecord",
                values: [e]
              }
            ]
          ];
        }
      },
      patch: {
        summary: "Update an app installation record",
        operationId: "updateInstallationRecord",
        execution: ({ req: t }) => {
          const { id: e } = t.params, {
            manifest_uri: n,
            granted_permissions: p,
            core_key: a,
            routes: r
          } = t.body, i = { granted: p }, o = d(r);
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: `UPDATE ${s().installed_apps.table_name} SET manifest_uri = $2, granted_permissions = $3, core_key = $4, routes = $5
									WHERE id = $1;`,
                data_key: "deletedInstallationRecord",
                values: [
                  e,
                  n,
                  i,
                  a,
                  o
                ]
              }
            ]
          ];
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
}, E = () => {
};
export {
  R as endpoints,
  y as onInstall,
  E as postInstall,
  s as tables
};
