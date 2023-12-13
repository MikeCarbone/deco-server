import y from "crypto";
const r = () => ({
  plugins: {
    table_name: "plugins"
  },
  installationRequests: {
    table_name: "installation_requests"
  }
}), m = (e) => ({
  routes: e.map((t) => ({
    path: t.path,
    method: t.method,
    summary: t == null ? void 0 : t.summary,
    operation_id: t == null ? void 0 : t.operationId,
    privacy: (t == null ? void 0 : t.privacy) || "PRIVATE"
  }))
});
function g(e, t, n) {
  const s = y.createCipheriv(
    "aes-256-cbc",
    Buffer.from(t, "hex"),
    Buffer.from(n, "hex")
  );
  let a = s.update(e, "utf-8", "hex");
  return a += s.final("hex"), a;
}
const f = () => [
  () => [
    {
      statement: `CREATE TABLE ${r().plugins.table_name} (
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
      statement: `CREATE TABLE ${r().installationRequests.table_name} (
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
        execution: async ({ req: e, res: t, runStatement: n }) => {
          const a = (await n({
            statement: `SELECT * FROM ${r().plugins.table_name} WHERE name=$1`,
            data_key: "existingPlugins",
            values: [e.body.name]
          })).existingPlugins.rows;
          if (a != null && a.length)
            return t.status(400).send({ message: "Plugin name already exists." });
          const {
            id: i,
            name: o,
            manifest_uri: c,
            permissions: u = [],
            core_key: l,
            routes: d
          } = e.body, R = m(d), _ = y.randomBytes(16).toString("hex");
          return [
            () => [
              {
                statement: `INSERT INTO ${r().plugins.table_name} (id, name, manifest_uri, permissions, core_key, routes, secrets, initialization_vector) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                data_key: "newPlugin",
                values: [
                  i,
                  o,
                  c,
                  u,
                  l,
                  R,
                  {},
                  _
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
              statement: `SELECT * FROM ${r().plugins.table_name};`,
              data_key: "allPlugins",
              values: []
            }
          ]
        ],
        handleReturn: ({ memory: e }) => ({
          status: 200,
          data: e == null ? void 0 : e.allPlugins.rows
        })
      }
    },
    "/install": {
      post: {
        summary: "Install a plugin",
        operationId: "installPlugin",
        execution: async (e) => {
          var o;
          const { req: t, res: n, installPlugin: s } = e, { isRootUser: a } = n.locals;
          if (!a)
            return {
              status: 401,
              data: null
            };
          const i = (o = t.body) == null ? void 0 : o.manifest_uri;
          return i && await s(i, { rebuildAfterSuccess: !0 }), {
            status: 200,
            data: null
          };
        },
        requestBody: {
          required: !0,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  manifest_uri: {
                    type: "string"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/installation-requests": {
      post: {
        summary: "Request a plugin be installed",
        operationId: "requestPluginInstallation",
        privacy: "PUBLIC",
        execution: async (e) => {
          const { req: t, plugins: n } = e, { manifest_uri: s } = t.body, a = t.get("host"), i = await fetch(s);
          if (!i.ok)
            return {
              status: 500,
              data: null,
              message: "Manifest JSON could not be fetched"
            };
          const o = await i.json();
          return n["deco-notifications"] && await n["deco-notifications"].operations.createNotification({
            ...e,
            req: {
              ...e.req,
              body: {
                plugin_id: n._currentPlugin.id,
                message: `${a} wants to installation ${o.name} from ${s}`
              }
            }
          }), [
            () => [
              {
                statement: `INSERT INTO ${r().installationRequests.table_name} (id, manifest_uri, requested_by_uri) VALUES (gen_random_uuid(), $1, $2)`,
                data_key: "installationRequest",
                values: [s, a]
              }
            ]
          ];
        }
      },
      get: {
        summary: "Fetch installation requests",
        operationId: "fetchInstallationRequests",
        execution: () => [
          () => [
            {
              statement: `SELECT * FROM ${r().installationRequests.table_name} ORDER BY created_at DESC LIMIT 50;`,
              data_key: "installationRequests",
              values: []
            }
          ]
        ],
        handleReturn: ({ memory: e }) => {
          const { installationRequests: t } = e;
          return {
            status: 200,
            data: t == null ? void 0 : t.rows
          };
        }
      }
    },
    "/installation-requests/{id}": {
      delete: {
        summary: "Delete an installation request",
        operationId: "deleteInstallationRequest",
        execution: async ({ req: e }) => {
          const { id: t } = e.params;
          return [
            () => [
              {
                statement: `DELETE FROM ${r().installationRequests.table_name} WHERE id = $1`,
                data_key: "installationRequest",
                values: [t]
              }
            ]
          ];
        }
      },
      get: {
        summary: "Fetch an installation request",
        operationId: "fetchInstallationRequest",
        execution: async ({ req: e }) => {
          const { id: t } = e.params;
          return [
            () => [
              {
                statement: `SELECT * FROM ${r().installationRequests.table_name} WHERE id = $1`,
                data_key: "installationRequest",
                values: [t]
              }
            ]
          ];
        }
      }
    },
    "/installation-requests/{id}/accept": {
      post: {
        summary: "Accept an installation request",
        operationId: "acceptInstallationRequest",
        execution: async (e) => {
          var i;
          const { installPlugin: t, runRoute: n } = e, { installationRequest: s } = await n(
            e,
            p.paths["/installation-requests/{id}"].get
          ), a = (i = s.rows[0]) == null ? void 0 : i.manifest_uri;
          try {
            return await t(a, {
              rebuildAfterSuccess: !0
            }), await n(
              e,
              p.paths["/installation-requests/{id}"].delete
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
        summary: "Delete a plugin installation record",
        operationId: "deleteInstallationRecord",
        execution: ({ req: e }) => {
          const { id: t } = e.params;
          return [
            () => [
              {
                statement: `DELETE FROM ${r().plugins.table_name} WHERE id = $1;`,
                data_key: "deletedInstallationRecord",
                values: [t]
              }
            ]
          ];
        }
      },
      get: {
        summary: "Fetch plugin installation record",
        operationId: "getInstallationRecord",
        execution: ({ req: e }) => {
          const { id: t } = e.params;
          return [
            () => [
              {
                statement: `SELECT * FROM ${r().plugins.table_name} WHERE id = $1;`,
                data_key: "fetchedInstallationRecord",
                values: [t]
              }
            ]
          ];
        },
        handleReturn: ({ memory: e }) => {
          const { fetchedInstallationRecord: t } = e;
          return t != null && t.rows ? {
            data: t == null ? void 0 : t.rows[0],
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
        execution: ({ req: e }) => {
          const { id: t } = e.params, { manifest_uri: n, permissions: s, core_key: a, routes: i } = e.body, o = m(i);
          return [
            () => [
              {
                statement: `UPDATE ${r().plugins.table_name} SET manifest_uri = $2, permissions = $3, core_key = $4, routes = $5
									WHERE id = $1;`,
                data_key: "updatedInstallationRecord",
                values: [
                  t,
                  n,
                  s,
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
        execution: async (e) => {
          const { req: t, res: n, runRoute: s } = e, { id: a } = t.params, { key: i, value: o } = t.body, c = n.locals._server.encryption_string, { data: u } = await s(
            e,
            p.paths["/{id}"].get
          ), l = u.secrets, d = g(
            o,
            c,
            u.initialization_vector
          );
          return l[i] = d, u.secrets = l, [
            () => [
              {
                statement: `UPDATE ${r().plugins.table_name} SET secrets = $1 WHERE id = $2`,
                data_key: "secretSaveRecord",
                values: [l, a]
              }
            ]
          ];
        },
        handleReturn: ({ memory: e }) => {
          const { secretSaveRecord: t } = e;
          return (t == null ? void 0 : t.rowCount) > 0 ? {
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
      InstallationRequest: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "The unique identifier for the installation request."
          },
          manifest_uri: {
            type: "string",
            description: "The URI of the manifest associated with the installation request."
          },
          requested_by_uri: {
            type: "string",
            description: "The URI of the entity that requested the installation."
          },
          created_at: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the installation request was created.",
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
  f as onInstall,
  r as tables
};
