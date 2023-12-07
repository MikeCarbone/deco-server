const m = () => ({
  permissions: {
    table_name: "permissions"
  }
}), d = () => [
  () => [
    {
      statement: `CREATE TABLE permissions (
						id UUID PRIMARY KEY,
						domain VARCHAR(255),
						resource VARCHAR(255),
						plugin_name VARCHAR(255),
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
          const {
            domain: t,
            resource: i,
            method: s,
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
                  i.toUpperCase(),
                  s.toUpperCase(),
                  p,
                  r
                ]
              }
            ]
          ];
        }
      },
      get: {
        summary: "Fetch permissions",
        operationId: "fetchPermissions",
        execution: ({ req: e }) => {
          const { resource: t, method: i, domain: s } = e.query;
          return [
            () => [
              {
                statement: "SELECT * FROM permissions WHERE resource = $1 AND method = $2 AND domain = $3;",
                data_key: "permissions",
                values: [
                  t.toUpperCase(),
                  i.toUpperCase(),
                  s.toUpperCase()
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
      Permission: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "The unique identifier for the permission."
          },
          domain: {
            type: "string",
            description: "The domain associated with the permission."
          },
          resource: {
            type: "string",
            description: "The resource for which the permission is granted."
          },
          plugin_name: {
            type: "string",
            description: "The name of the plugin granting the permission."
          },
          method: {
            type: "string",
            description: "The HTTP method for which the permission is granted (e.g., GET, POST)."
          },
          expires: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the permission expires."
          },
          created_at: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the permission was created."
          }
        },
        required: [
          "id",
          "domain",
          "resource",
          "plugin_name",
          "method",
          "expires",
          "created_at"
        ],
        example: {
          id: "123e4567-e89b-12d3-a456-426614174002",
          domain: "example.com",
          resource: "/api/data",
          plugin_name: "sample_plugin",
          method: "GET",
          expires: "2023-12-31T23:59:59Z",
          created_at: "2023-01-01T12:00:00Z"
        }
      }
    }
  }
};
export {
  u as endpoints,
  d as onInstall,
  m as tables
};
