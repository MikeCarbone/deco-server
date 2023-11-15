const c = () => ({
  // Key can be anything, but should be reflective of the table name
  // this will be accessible via apps.appName.tables.tableName.modify()
  users: {
    table_name: "permission_requests"
  }
}), l = ({ req: e, res: s, user: r, apps: t }) => [
  () => [
    {
      statement: `CREATE TABLE permission_requests (
						id UUID PRIMARY KEY,
						domain VARCHAR(255),
						resource VARCHAR(255),
						app_name VARCHAR(255),
						method VARCHAR(255),
						suggested_expiration TIMESTAMP,
						created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
					);`,
      data_key: "permissionRequestTable",
      values: []
    }
  ]
], m = {
  paths: {
    "/": {
      post: {
        summary: "Create a permission request",
        operationId: "createAPermissionRequest",
        execution: async ({ req: e, apps: s }) => {
          const {
            domain: r,
            resource: t,
            app_name: o,
            method: n,
            suggested_expiration: a
          } = e.body;
          return [
            () => [
              {
                statement: "INSERT INTO permission_requests (id, domain, resource, method, app_name, suggested_expiration) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)",
                data_key: "newPermission",
                values: [
                  r.toUpperCase(),
                  t.toUpperCase(),
                  n.toUpperCase(),
                  o,
                  a
                ]
              }
            ]
          ];
        }
      },
      // We don't want to expose this externally kinda
      get: {
        summary: "Fetch permission requests",
        operationId: "fetchPermissionReqests",
        execution: (e) => {
          const { resource: s, method: r, domain: t } = e.query;
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: "SELECT * FROM permission_requests WHERE resource=$1, method=$2, domain=$3",
                data_key: "permissions",
                values: [
                  s.toUpperCase(),
                  r.toUpperCase(),
                  t.toUpperCase()
                ]
              }
            ]
          ];
        }
      }
    },
    "/{id}": {
      get: {
        summary: "Get a permission request record",
        operationId: "getPermissionRequest",
        execution: ({ req: e }) => {
          const { id: s } = e.params;
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: "SELECT * FROM permission_requests WHERE id=$1",
                data_key: "permissionRecord",
                values: [s]
              }
            ]
          ];
        }
      },
      delete: {
        summary: "Deletes a permission request record",
        operationId: "deletePermissionRequest",
        execution: ({ req: e }) => {
          const { id: s } = e.params;
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: "DELETE FROM permission_requests WHERE id=$1",
                data_key: "permissionDelete",
                values: [s]
              }
            ]
          ];
        }
      }
    },
    "/{id}/accept": {
      post: {
        summary: "Accept a permission request",
        operationId: "acceptPermissionRequest",
        execution: async ({ req: e, res: s, apps: r, runRoute: t }) => {
          var d;
          const o = (d = e.body) == null ? void 0 : d.expiration, n = m.paths["/{id}"].get.execution({ req: e }), { permissionRecord: a } = await t(n), p = a.rows;
          console.log("R: ", p);
          const i = p[0];
          if (i) {
            await r["deco-permissions"].operations.createPermission({
              res: s,
              req: {
                ...e,
                body: {
                  domain: i.domain,
                  resource: i.resource,
                  method: i.method,
                  expiration: o || i.suggested_expiration,
                  app_name: i.app_name
                }
              }
            });
            const u = m.paths["/{id}"].delete.execution({ req: e });
            return await t(u);
          }
          return s.status(404).send({ message: "Record not found" });
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
}, R = () => {
};
export {
  m as endpoints,
  l as onInstall,
  R as postInstall,
  c as tables
};
