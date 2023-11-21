const d = () => ({
  // Key can be anything, but should be reflective of the table name
  // this will be accessible via apps.appName.tables.tableName.modify()
  users: {
    table_name: "permissions"
  }
}), m = ({ req: e, res: s, user: t, apps: r }) => [
  () => [
    {
      statement: `CREATE TABLE permissions (
						id UUID PRIMARY KEY,
						domain VARCHAR(255),
						resource VARCHAR(255),
						app_name VARCHAR(255),
						method VARCHAR(255),
						expires TIMESTAMP,
						created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
					);`,
      data_key: "permissionsTable",
      values: []
    }
  ]
], u = {
  paths: {
    "/": {
      post: {
        summary: "Create a permission",
        operationId: "createPermission",
        execution: async ({ req: e }) => {
          const { domain: s, resource: t, method: r, expiration: n, app_name: p } = e.body;
          let i = n;
          if (!i) {
            const o = /* @__PURE__ */ new Date();
            let a = new Date(o);
            a.setFullYear(o.getFullYear() + 1), i = a.getTime();
          }
          return [
            () => [
              {
                statement: "INSERT INTO permissions (id, domain, resource, method, app_name, expires) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)",
                data_key: "newPermission",
                values: [
                  s.toUpperCase(),
                  t.toUpperCase(),
                  r.toUpperCase(),
                  p,
                  i
                ]
              }
            ]
          ];
        }
      },
      // We don't want to expose this externally kinda
      get: {
        summary: "Fetch permissions",
        operationId: "fetchPermissions",
        execution: ({ req: e }) => {
          const { resource: s, method: t, domain: r } = e.query;
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: "SELECT * FROM permissions WHERE resource = $1 AND method = $2 AND domain = $3;",
                data_key: "permissions",
                values: [
                  s.toUpperCase(),
                  t.toUpperCase(),
                  r.toUpperCase()
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
}, c = () => {
};
export {
  u as endpoints,
  m as onInstall,
  c as postInstall,
  d as tables
};
