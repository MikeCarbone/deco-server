// We want tables to be modifyable but don't really want to expose their key

// This enables us to know what the sql names are for allowing other apps to modify this table
// Also allows us to list out the names of tables created
// And we can verify whether the tables they touch are the tables they say they touch
export const tables = () => ({
  // Key can be anything, but should be reflective of the table name
  // this will be accessible via apps.appName.tables.tableName.modify()
  todos: {
    table_name: "todos",
  },
});

export const onInstall = ({ req, res, user, apps }) => {
  // Initial DB population
  return [
    () => {
      return [
        // {
        // 	statement: `ALTER TABLE ${tableName}
        // 	ADD featured_image TEXT,
        // 	ADD subtitle VARCHAR(250);
        // `,
        // 	data_key: "alteration",
        // 	values: [],
        // },
        {
          statement: `CREATE TABLE ${tables().todos.table_name} (
						id UUID PRIMARY KEY,
						title VARCHAR(255) NOT NULL,
						description TEXT,
						due_date DATE,
						priority INT,
						status TEXT,
						created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
						updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`,
          data_key: "creation",
          values: [],
        },
      ];
    },
  ];
};

export const endpoints = {
  paths: {
    "/todos": {
      get: {
        summary: "Get a list of todos",
        operationId: "getTodos",
        // By default will return JSON of the returnedObjectName
        execution: async ({ req, res, user, apps }) => {
          console.log(apps);
          const todos = apps.something.operations.createTodo();
          console.log(todos);
          return [
            () => {
              // Interact with third party apps
              // const newThirdPartyThing =
              // 	apps.appName.todos.post();

              // Interact with internal app
              // Non-dependent interactions
              return [
                {
                  statement: `SELECT * FROM todos`,
                  data_key: "todos",
                  values: [],
                },
              ];
            },
          ];
        },
        handleResponse: ({ req, res, user, data }) => {
          const { todos } = data;
          return res.status(200).json(todos?.rows);
        },
      },
      post: {
        summary: "Create a new todo",
        operationId: "createTodo",
        // By default will return JSON of the returnedObjectName
        execution: ({ req, res, user, apps }) => {
          console.log("Executing...");

          // Pretend we want to write to a fetch log, how can we do this?
          return [
            () => {
              // Interact with third party apps
              // const newThirdPartyThing =
              // 	apps.appName.todos.post();

              // Interact with internal app
              // Non-dependent interactions
              return [
                {
                  statement: `INSERT INTO todos (id, title, description, due_date, priority, status, updated_at)
                                VALUES (gen_random_uuid(), 'Your Todo Title', 'Your Todo Description', '2023-11-30', 2, 'Pending', current_timestamp);`,
                  data_key: "newTodo",
                  values: [],
                },
              ];
            },
            ({ newTodo }) => {
              console.log(newTodo);
              return [];
              // Do more stuff with that data
            },
          ];
        },
        // handleResponse: ({ req, res, user, data }) => {
        // 	const { newTodo } = data;
        // 	console.log("here");
        // 	res.status(200).send(
        // 		`<h1>Created ${newTodo.rowCount} rows</h1>`
        // 	);
        // },
        requestBody: {
          description: "Todo object to be created",
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Todo" },
            },
          },
        },
      },
    },
    "/todos/{id}": {
      get: {
        summary: "Get a list of todos",
        operationId: "getTodosList",
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            description: "The ID of the user",
          },
        ],
        execute: ({ req, res, user, apps }) => {
          // do some validation stuff
          // return sql
        },
        deliver: ({ data, req, res, user }) => {},
      },
    },
  },
  components: {
    schemas: {
      Todo: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            format: "int64",
          },
          title: {
            type: "string",
          },
          description: {
            type: "string",
          },
          due_date: {
            type: "string",
            format: "date",
          },
          status: {
            type: "string",
            enum: ["Pending", "In Progress", "Completed"],
          },
        },
      },
    },
  },
};
export const defineResource = () => {};
export const postInstall = () => {};
export const constructEndpoints = () => {};
