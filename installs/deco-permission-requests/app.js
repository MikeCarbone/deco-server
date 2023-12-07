const m = () => ({
  permissionRequests: {
    table_name: "permission_requests"
  }
}), p = () => [
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
], u = {
  paths: {
    "/": {
      post: {
        summary: "Create a permission request",
        operationId: "createPermissionRequest",
        execution: async ({ req: t }) => {
          const {
            domain: e,
            resource: s,
            plugin_name: i,
            method: n,
            suggested_expiration: o
          } = t.body;
          return [
            () => [
              {
                statement: "INSERT INTO permission_requests (id, domain, resource, method, name, suggested_expiration) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)",
                data_key: "newPermission",
                values: [
                  e.toUpperCase(),
                  s.toUpperCase(),
                  n.toUpperCase(),
                  i,
                  o
                ]
              }
            ]
          ];
        }
      },
      get: {
        summary: "Fetch permission requests",
        operationId: "fetchPermissionReqests",
        execution: (t) => {
          const { resource: e, method: s, domain: i } = t.query;
          return [
            () => [
              {
                statement: "SELECT * FROM permission_requests WHERE resource=$1, method=$2, domain=$3",
                data_key: "permissions",
                values: [
                  e.toUpperCase(),
                  s.toUpperCase(),
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
        execution: ({ req: t }) => {
          const { id: e } = t.params;
          return [
            () => [
              {
                statement: "SELECT * FROM permission_requests WHERE id=$1",
                data_key: "permissionRecord",
                values: [e]
              }
            ]
          ];
        },
        handleReturn: ({ memory: t }) => {
          const { permissionRecord: e } = t;
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
        execution: ({ req: t }) => {
          const { id: e } = t.params;
          return [
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
        execution: async (t) => {
          var a;
          const { req: e, res: s, plugins: i, runRoute: n } = t, o = (a = e.body) == null ? void 0 : a.expiration, { data: r } = await n(
            t,
            u.paths["/{id}"].get
          );
          return r ? (await i["deco-permissions"].operations.createPermission({
            res: s,
            req: {
              ...e,
              body: {
                domain: r.domain,
                resource: r.resource,
                method: r.method,
                expiration: o || r.suggested_expiration,
                plugin_name: r.plugin_name
              }
            }
          }), await n(
            t,
            u.paths["/{id}"].delete
          )) : s.status(404).send({ message: "Record not found" });
        }
      }
    }
  },
  components: {
    schemas: {
      PermissionRequest: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "The unique identifier for the permission request."
          },
          domain: {
            type: "string",
            description: "The domain associated with the permission request."
          },
          resource: {
            type: "string",
            description: "The resource for which permission is requested."
          },
          plugin_name: {
            type: "string",
            description: "The name of the plugin making the permission request."
          },
          method: {
            type: "string",
            description: "The HTTP method for which permission is requested (e.g., GET, POST)."
          },
          suggested_expiration: {
            type: "string",
            format: "date-time",
            description: "The suggested expiration timestamp for the permission."
          },
          created_at: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the permission request was created."
          }
        },
        required: [
          "id",
          "domain",
          "resource",
          "plugin_name",
          "method",
          "created_at"
        ],
        example: {
          id: "123e4567-e89b-12d3-a456-426614174001",
          domain: "example.com",
          resource: "/api/data",
          plugin_name: "sample_plugin",
          method: "GET",
          suggested_expiration: "2023-12-31T23:59:59Z",
          created_at: "2023-01-01T12:00:00Z"
        }
      }
    }
  }
};
export {
  u as endpoints,
  p as onInstall,
  m as tables
};
