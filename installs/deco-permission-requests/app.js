const u = () => ({
  permissionRequests: {
    table_name: "permission_requests"
  }
}), d = () => [
  () => [
    {
      statement: `CREATE TABLE permission_requests (
						id UUID PRIMARY KEY,
						domain VARCHAR(255),
						resource VARCHAR(255),
						plugin_name VARCHAR(255),
						method VARCHAR(255),
						suggested_expiration TIMESTAMP,
						created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
					);`,
      data_key: "permissionRequestTable",
      values: []
    }
  ]
], p = {
  paths: {
    "/": {
      post: {
        summary: "Create a permission request",
        operationId: "createPermissionRequest",
        execution: async ({ req: s }) => {
          const {
            domain: e,
            resource: t,
            plugin_name: i,
            method: o,
            suggested_expiration: n
          } = s.body;
          return [
            () => [
              {
                statement: "INSERT INTO permission_requests (id, domain, resource, method, name, suggested_expiration) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)",
                data_key: "newPermission",
                values: [
                  e.toUpperCase(),
                  t.toUpperCase(),
                  o.toUpperCase(),
                  i,
                  n
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
        execution: (s) => {
          const { resource: e, method: t, domain: i } = s.query;
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: "SELECT * FROM permission_requests WHERE resource=$1, method=$2, domain=$3",
                data_key: "permissions",
                values: [
                  e.toUpperCase(),
                  t.toUpperCase(),
                  i.toUpperCase()
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
        execution: ({ req: s }) => {
          const { id: e } = s.params;
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: "SELECT * FROM permission_requests WHERE id=$1",
                data_key: "permissionRecord",
                values: [e]
              }
            ]
          ];
        },
        handleReturn: ({ memory: s }) => {
          const { permissionRecord: e } = s;
          return e != null && e.rows[0] ? {
            status: 200,
            data: e == null ? void 0 : e.rows[0]
          } : {
            status: 404,
            data: null
          };
        }
      },
      delete: {
        summary: "Deletes a permission request record",
        operationId: "deletePermissionRequest",
        execution: ({ req: s }) => {
          const { id: e } = s.params;
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: "DELETE FROM permission_requests WHERE id=$1",
                data_key: "permissionDelete",
                values: [e]
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
        execution: async (s) => {
          var a;
          const { req: e, res: t, plugins: i, runRoute: o } = s, n = (a = e.body) == null ? void 0 : a.expiration, { data: r } = await o(
            s,
            p.paths["/{id}"].get
          );
          return r ? (await i["deco-permissions"].operations.createPermission({
            res: t,
            req: {
              ...e,
              body: {
                domain: r.domain,
                resource: r.resource,
                method: r.method,
                expiration: n || r.suggested_expiration,
                plugin_name: r.plugin_name
              }
            }
          }), await o(
            s,
            p.paths["/{id}"].delete
          )) : t.status(404).send({ message: "Record not found" });
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
}, m = () => {
};
export {
  p as endpoints,
  d as onInstall,
  m as postInstall,
  u as tables
};
