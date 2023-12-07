import R from "crypto";
const i = () => ({
  plugins: {
    table_name: "plugins"
  },
  installRequests: {
    table_name: "install_requests"
  }
}), m = (t) => ({
  routes: t.map((e) => ({
    path: e.path,
    method: e.method,
    summary: e == null ? void 0 : e.summary,
    operation_id: e == null ? void 0 : e.operationId,
    privacy: (e == null ? void 0 : e.privacy) || "PRIVATE"
  }))
});
function h(t, e, s) {
  const n = R.createCipheriv(
    "aes-256-cbc",
    Buffer.from(e, "hex"),
    Buffer.from(s, "hex")
  );
  let a = n.update(t, "utf-8", "hex");
  return a += n.final("hex"), a;
}
const E = () => [
  () => [
    {
      statement: `CREATE TABLE ${i().plugins.table_name} (
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
    },
    {
      statement: `CREATE TABLE ${i().installRequests.table_name} (
						id UUID PRIMARY KEY,
						manifest_uri VARCHAR(255),
						requested_by_uri VARCHAR(255),
						created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
					);`,
      data_key: "installationRequestsTable",
      values: []
    }
  ]
], p = {
  paths: {
    "/": {
      post: {
        summary: "Create a record of a plugin installation",
        operationId: "createInstallationRecord",
        execution: async ({ req: t, res: e, runStatement: s }) => {
          const a = (await s({
            statement: `SELECT * FROM ${i().plugins.table_name} WHERE name=$1`,
            data_key: "existingPlugins",
            values: [t.body.name]
          })).existingPlugins.rows;
          if (a != null && a.length)
            return e.status(400).send({ message: "Plugin name already exists." });
          const {
            id: r,
            name: o,
            manifest_uri: d,
            permissions: u = [],
            core_key: l,
            routes: c
          } = t.body, _ = m(c), y = R.randomBytes(16).toString("hex");
          return [
            () => [
              {
                statement: `INSERT INTO ${i().plugins.table_name} (id, name, manifest_uri, permissions, core_key, routes, secrets, initialization_vector) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                data_key: "newPlugin",
                values: [
                  r,
                  o,
                  d,
                  u,
                  l,
                  _,
                  {},
                  y
                ]
              }
            ]
          ];
        }
      },
      get: {
        summary: "Fetch all plugin installation records",
        operationId: "fetchInstallationRecords",
        execution: () => [
          () => [
            {
              statement: `SELECT * FROM ${i().plugins.table_name};`,
              data_key: "allPlugins",
              values: []
            }
          ]
        ],
        handleReturn: ({ memory: t }) => ({
          status: 200,
          data: t == null ? void 0 : t.allPlugins.rows
        })
      }
    },
    "/install-requests": {
      post: {
        summary: "Request a plugin be installed",
        operationId: "requestPluginInstall",
        privacy: "PUBLIC",
        execution: async (t) => {
          const { req: e, plugins: s } = t, { manifest_uri: n } = e.body, a = e.get("host"), r = await fetch(n);
          if (!r.ok)
            return {
              status: 500,
              data: null,
              message: "Manifest JSON could not be fetched"
            };
          const o = await r.json();
          return s["deco-notifications"] && await s["deco-notifications"].operations.createNotification({
            ...t,
            req: {
              ...t.req,
              body: {
                plugin_id: s._currentPlugin.id,
                message: `${a} wants to install ${o.name} from ${n}`
              }
            }
          }), [
            () => [
              {
                statement: `INSERT INTO ${i().installRequests.table_name} (id, manifest_uri, requested_by_uri) VALUES (gen_random_uuid(), $1, $2)`,
                data_key: "installRequest",
                values: [n, a]
              }
            ]
          ];
        }
      },
      get: {
        summary: "Fetch installation requests",
        operationId: "fetchInstallRequests",
        execution: () => [
          () => [
            {
              statement: `SELECT * FROM ${i().installRequests.table_name} ORDER BY created_at DESC LIMIT 50;`,
              data_key: "installRequests",
              values: []
            }
          ]
        ],
        handleReturn: ({ memory: t }) => {
          const { installRequests: e } = t;
          return {
            status: 200,
            data: e == null ? void 0 : e.rows
          };
        }
      }
    },
    "/install-requests/{id}": {
      delete: {
        summary: "Delete an installation request",
        operationId: "deleteInstallRequest",
        execution: async ({ req: t }) => {
          const { id: e } = t.params;
          return [
            () => [
              {
                statement: `DELETE FROM ${i().installRequests.table_name} WHERE id = $1`,
                data_key: "installRequest",
                values: [e]
              }
            ]
          ];
        }
      },
      get: {
        summary: "Fetch an installation request",
        operationId: "fetchInstallRequest",
        execution: async ({ req: t }) => {
          const { id: e } = t.params;
          return [
            () => [
              {
                statement: `SELECT * FROM ${i().installRequests.table_name} WHERE id = $1`,
                data_key: "installRequest",
                values: [e]
              }
            ]
          ];
        }
      }
    },
    "/install-requests/{id}/accept": {
      post: {
        summary: "Accept an installation request",
        operationId: "acceptInstallRequest",
        execution: async (t) => {
          var r;
          const { installPlugin: e, runRoute: s } = t, { installRequest: n } = await s(
            t,
            p.paths["/install-requests/{id}"].get
          ), a = (r = n.rows[0]) == null ? void 0 : r.manifest_uri;
          try {
            return await e(a, {
              rebuildAfterSuccess: !0
            }), await s(
              t,
              p.paths["/install-requests/{id}"].delete
            ), {
              status: 200,
              data: null
            };
          } catch {
            return {
              status: 500,
              data: null
            };
          }
        }
      }
    },
    "/{id}": {
      delete: {
        summary: "Delete an plugin installation record",
        operationId: "deleteInstallationRecord",
        execution: ({ req: t }) => {
          const { id: e } = t.params;
          return [
            () => [
              {
                statement: `DELETE FROM ${i().plugins.table_name} WHERE id = $1;`,
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
            () => [
              {
                statement: `SELECT * FROM ${i().plugins.table_name} WHERE id = $1;`,
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
          const { id: e } = t.params, { manifest_uri: s, permissions: n, core_key: a, routes: r } = t.body, o = m(r);
          return [
            () => [
              {
                statement: `UPDATE ${i().plugins.table_name} SET manifest_uri = $2, permissions = $3, core_key = $4, routes = $5
									WHERE id = $1;`,
                data_key: "updatedInstallationRecord",
                values: [
                  e,
                  s,
                  n,
                  a,
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
          const { req: e, res: s, runRoute: n } = t, { id: a } = e.params, { key: r, value: o } = e.body, d = s.locals._server.encryption_string, { data: u } = await n(
            t,
            p.paths["/{id}"].get
          ), l = u.secrets, c = h(
            o,
            d,
            u.initialization_vector
          );
          return l[r] = c, u.secrets = l, [
            () => [
              {
                statement: `UPDATE ${i().plugins.table_name} SET secrets = $1 WHERE id = $2`,
                data_key: "secretSaveRecord",
                values: [l, a]
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
      Plugin: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "The unique identifier for the plugin."
          },
          name: {
            type: "string",
            description: "The name of the plugin."
          },
          manifest_uri: {
            type: "string",
            description: "The URI of the manifest associated with the plugin."
          },
          permissions: {
            type: "object",
            description: "Permissions associated with the plugin.",
            example: {}
          },
          core_key: {
            type: "string",
            description: "The core key associated with the plugin."
          },
          routes: {
            type: "object",
            description: "Routes associated with the plugin.",
            example: {}
          },
          secrets: {
            type: "object",
            description: "Secrets associated with the plugin.",
            example: {}
          },
          initialization_vector: {
            type: "string",
            description: "The initialization vector associated with the plugin."
          },
          installed_at: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the plugin was installed.",
            default: "CURRENT_TIMESTAMP"
          }
        },
        required: [
          "id",
          "name",
          "manifest_uri",
          "permissions",
          "core_key",
          "routes",
          "secrets",
          "initialization_vector",
          "installed_at"
        ]
      },
      InstallRequest: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "The unique identifier for the install request."
          },
          manifest_uri: {
            type: "string",
            description: "The URI of the manifest associated with the install request."
          },
          requested_by_uri: {
            type: "string",
            description: "The URI of the entity that requested the installation."
          },
          created_at: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the install request was created.",
            default: "CURRENT_TIMESTAMP"
          }
        },
        required: [
          "id",
          "manifest_uri",
          "requested_by_uri",
          "created_at"
        ]
      }
    }
  }
};
export {
  p as endpoints,
  E as onInstall,
  i as tables
};
