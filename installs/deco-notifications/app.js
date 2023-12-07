const o = () => ({
  notifications: {
    table_name: "notifications"
  }
}), s = ({ plugins: t }) => [
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
						FOREIGN KEY (plugin_id) REFERENCES ${t["deco-plugins"].tables.plugins.getTableName()}(id)
					);`,
      data_key: "notificationsTable",
      values: []
    }
  ]
], r = {
  paths: {
    "/": {
      post: {
        summary: "Create a notification",
        operationId: "createNotification",
        execution: async ({ req: t }) => {
          const { plugin_id: i, message: e, link: n, expiry_date: a } = t.body;
          return [
            () => [
              {
                statement: "INSERT INTO notifications (id, plugin_id, message, link, expiry_date) VALUES (gen_random_uuid(), $1, $2, $3, $4)",
                data_key: "newPermission",
                values: [
                  i,
                  e,
                  n,
                  a
                ]
              }
            ]
          ];
        }
      },
      get: {
        summary: "Fetch notifications",
        operationId: "fetchNotifications",
        execution: () => [
          () => [
            {
              statement: "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50;",
              data_key: "notifications",
              values: []
            }
          ]
        ],
        handleReturn: ({ memory: t }) => {
          const { notifications: i } = t;
          return {
            status: 200,
            data: i.rows
          };
        }
      }
    },
    "/{id}": {
      patch: {
        summary: "Update notification",
        operationId: "fetchNotifications",
        execution: ({ req: t }) => {
          const { id: i, is_read: e } = t.body;
          return [
            () => [
              {
                statement: `UPDATE ${o().notifications.table_name} SET is_read = $2 WHERE id = $1;`,
                data_key: "updateNotification",
                values: [i, e]
              }
            ]
          ];
        }
      }
    }
  },
  components: {
    schemas: {
      Notification: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Unique identifier for the notification (UUID)"
          },
          plugin_id: {
            type: "string",
            format: "uuid",
            description: "Unique identifier for the associated plugin (UUID)"
          },
          message: {
            type: "string",
            description: "Notification message"
          },
          is_read: {
            type: "boolean",
            default: !1,
            description: "Flag indicating whether the notification has been read"
          },
          created_at: {
            type: "string",
            format: "date-time",
            description: "Timestamp indicating the creation date of the notification"
          },
          link: {
            type: "string",
            maxLength: 255,
            description: "Link associated with the notification"
          },
          expiry_date: {
            type: "string",
            format: "date",
            description: "Date indicating the expiry date of the notification"
          }
        },
        required: ["id", "plugin_id", "message", "created_at"],
        foreignKeys: [
          {
            name: "fk_plugin_id",
            foreignTable: "plugins",
            foreignField: "id",
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
          }
        ]
      }
    }
  }
};
export {
  r as endpoints,
  s as onInstall,
  o as tables
};
