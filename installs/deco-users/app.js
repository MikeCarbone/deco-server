import a from "crypto";
const d = () => ({
  // Key can be anything, but should be reflective of the table name
  // this will be accessible via apps.appName.tables.tableName.modify()
  users: {
    table_name: "users"
  }
}), p = ["USER_PASSWORD"], c = ({ req: s, res: t, user: r, apps: o }) => [
  () => [
    {
      statement: `CREATE TABLE users (
            id UUID PRIMARY KEY,
            password VARCHAR(255),
            salt VARCHAR(255),
            is_owner BOOLEAN DEFAULT false,
            permissions JSONB,
            user_details JSONB,
            subdomain VARCHAR(75) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,
      data_key: "usersTable",
      values: []
    }
  ]
], u = {
  paths: {
    "/": {
      post: {
        summary: "Create a server user",
        operationId: "createUser",
        middleware: async ({ res: s, next: t, executeOperation: r }) => {
          const e = (await r({
            statement: "SELECT * FROM users",
            data_key: "users",
            values: []
          })).users.rows, n = !e || !e.length;
          if (n)
            console.log("No users, no protection");
          else
            return console.log("Users exist, let's protect."), s.status(401).send({ message: "Authentication required." });
          return s.locals.isFirstUser = n, t();
        },
        execution: async ({ req: s, res: t }) => {
          const { password: r } = s.body;
          r.length < 15 && t.status(400).send({
            message: "Password length too short."
          });
          const o = a.randomBytes(16).toString("hex"), e = a.scryptSync(r, o, 32).toString("hex");
          return console.log(o, e), [
            () => [
              // {
              // 	statement: `INSERT INTO users (id, subdomain, password, is_owner, permissions, user_details, created_at) VALUES ($1, $2, $3, $4, $5, $6)`,
              // 	data_key: "todos",
              // 	values: [
              // 		"gen_random_uuid()",
              // 		"mike",
              // 		"abc123",
              // 		!!res.locals.isFirstUser,
              // 		{},
              // 		{},
              // 	],
              // },
            ]
          ];
        },
        handleResponse: ({ req: s, res: t, user: r, data: o }) => {
          const { todos: e } = o;
          return t.status(200).json(e == null ? void 0 : e.rows);
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
  c as onInstall,
  l as postInstall,
  p as secrets,
  d as tables
};
