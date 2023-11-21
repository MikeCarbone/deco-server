import a from "crypto";
const c = () => ({
  // Key can be anything, but should be reflective of the table name
  // this will be accessible via apps.appName.tables.tableName.modify()
  users: {
    table_name: "users"
  }
}), p = ["USER_PASSWORD"], l = ({ req: s, res: e, user: t, apps: r }) => [
  () => [
    {
      statement: `CREATE TABLE users (
						id UUID PRIMARY KEY,
						salt VARCHAR(255),
						hash VARCHAR(255),
						permissions JSONB,
						user_details JSONB,
						subdomain VARCHAR(75) NOT NULL UNIQUE DEFAULT 'root',
						created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
					);`,
      data_key: "usersTable",
      values: []
    }
  ]
];
function i(s, e, t) {
  return a.scryptSync(s, e, 32).toString("hex") === t;
}
const m = {
  paths: {
    "/": {
      post: {
        summary: "Create a server user",
        operationId: "createUser",
        // routeMiddleware: async ({ res, next, runStatement }) => {
        // 	const data = await runStatement({
        // 		statement: `SELECT * FROM users`,
        // 		data_key: "users",
        // 		values: [],
        // 	});
        // 	const users = data.users.rows;
        // 	const isFirstUser = !users || !users.length;
        // 	if (isFirstUser) {
        // 		console.log("No users, no protection");
        // 	} else {
        // 		console.log("Users exist, let's protect.");
        // 		return res
        // 			.status(401)
        // 			.send({ message: "Authentication required." });
        // 	}
        // 	res.locals.isFirstUser = isFirstUser;
        // 	return next();
        // },
        execution: async ({ req: s, res: e }) => {
          const { password: t, subdomain: r } = s.body;
          if (t.length < 15)
            return e.status(400).send({
              message: "Password length too short."
            });
          const o = a.randomBytes(16).toString("hex"), n = a.scryptSync(t, o, 32).toString("hex");
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: "INSERT INTO users (id, subdomain, hash, salt, permissions, user_details) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)",
                data_key: "newUser",
                values: [r, n, o, {}, {}]
              }
            ]
          ];
        },
        handleReturn: ({ memory: s }) => {
          const { newUser: e } = s;
          return e.rows[0] ? {
            status: 200,
            data: e?.rows[0]
          } : {
            status: 500,
            data: null
          };
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
    },
    "/login": {
      post: {
        summary: "Login a user",
        operationId: "loginUser",
        execution: ({ req: s, res: e, secrets: t }) => {
          console.log(e.locals);
          const { salt: r, hash: o, id: n } = e.locals?._user;
          return i(
            s.body?.password,
            r,
            o
          ) ? e.status(200).send({ success: !0 }) : e.status(401).send({ success: !1 });
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
}, h = () => {
};
export {
  m as endpoints,
  l as onInstall,
  h as postInstall,
  p as secrets,
  c as tables
};
