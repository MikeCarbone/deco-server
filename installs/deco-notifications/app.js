const d = () => ({
  notifications: {
    table_name: "notifications"
  }
}), m = ({ plugins: e }) => [
  () => [
    {
      statement: `CREATE TABLE notifications (
						id UUID PRIMARY KEY,
						plugin_id UUID,
						message TEXT,
						is_read BOOLEAN DEFAULT FALSE,
						created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
						link VARCHAR(255),
						expiry_date DATE,
						FOREIGN KEY (plugin_id) REFERENCES ${e["deco-plugins"].tables.plugins.getTableName()}(id)
					);`,
      data_key: "notificationsTable",
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
          const {
            domain: t,
            resource: s,
            method: i,
            expiration: a,
            plugin_name: p
          } = e.body;
          let r = a;
          if (!r) {
            const n = /* @__PURE__ */ new Date();
            let o = new Date(n);
            o.setFullYear(n.getFullYear() + 1), r = o.getTime();
          }
          return [
            () => [
              {
                statement: "INSERT INTO permissions (id, domain, resource, method, plugin_name, expires) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)",
                data_key: "newPermission",
                values: [
                  t.toUpperCase(),
                  s.toUpperCase(),
                  i.toUpperCase(),
                  p,
                  r
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
          const { resource: t, method: s, domain: i } = e.query;
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: "SELECT * FROM permissions WHERE resource = $1 AND method = $2 AND domain = $3;",
                data_key: "permissions",
                values: [
                  t.toUpperCase(),
                  s.toUpperCase(),
                  i.toUpperCase()
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
}, l = () => {
};
export {
  u as endpoints,
  m as onInstall,
  l as postInstall,
  d as tables
};
