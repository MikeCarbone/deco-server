import n from "crypto";
const d = () => ({
  // Key can be anything, but should be reflective of the table name
  // this will be accessible via apps.appName.tables.tableName.modify()
  users: {
    table_name: "users"
  }
}), l = ["USER_PASSWORD"], p = ({ req: t, res: s, user: r, apps: a }) => [
  () => [
    {
      statement: `CREATE TABLE users (
						id UUID PRIMARY KEY,
						salt VARCHAR(255),
						hash VARCHAR(255),
						is_owner BOOLEAN DEFAULT false,
						permissions JSONB,
						user_details JSONB,
						subdomain VARCHAR(75) UNIQUE DEFAULT root,
						created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
					);`,
      data_key: "usersTable",
      values: []
    }
  ]
], c = {
  paths: {
    "/": {
      post: {
        summary: "Create a server user",
        operationId: "createUser",
        middleware: async ({ res: t, next: s, runStatement: r }) => {
          const e = (await r({
            statement: "SELECT * FROM users",
            data_key: "users",
            values: []
          })).users.rows, o = !e || !e.length;
          if (o)
            console.log("No users, no protection");
          else
            return console.log("Users exist, let's protect."), t.status(401).send({ message: "Authentication required." });
          return t.locals.isFirstUser = o, s();
        },
        execution: async ({ req: t, res: s }) => {
          const { password: r, subdomain: a } = t.body, { isFirstUser: e } = s.locals;
          if (r.length < 15)
            return s.status(400).send({
              message: "Password length too short."
            });
          if (e && a)
            return s.status(400).send({
              message: "First user should not have a subdomain."
            });
          const o = n.randomBytes(16).toString("hex"), i = n.scryptSync(r, o, 32).toString("hex");
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: "INSERT INTO users (id, subdomain, hash, salt, is_owner, permissions, user_details) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)",
                data_key: "newUser",
                values: [
                  a,
                  i,
                  o,
                  !!e,
                  {},
                  {}
                ]
              }
            ]
          ];
        },
        handleResponse: ({ req: t, res: s, user: r, data: a }) => {
          const { newUser: e } = a;
          return s.status(200).json(e == null ? void 0 : e.rows);
        }
      },
      // We don't want to expose this externally kinda
      get: {
        summary: "Fetch all server users",
        operationId: "fetchUsers",
        execution: () => [
          // Function to pass results from one sync operation to another
          // First will be empty of course
          () => [
            {
              statement: "SELECT * FROM users",
              data_key: "allUsers",
              values: []
            }
          ]
        ]
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
  c as endpoints,
  p as onInstall,
  m as postInstall,
  l as secrets,
  d as tables
};
