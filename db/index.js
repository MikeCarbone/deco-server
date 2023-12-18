import pg from "pg";
import "dotenv";

const { Pool } = pg;

// if (!process.env.PGHOST) {
//   console.log(process.env.PGHOST);
//   console.log("Missing required env variable PGHOST.");
//   process.exit(1);
// }
// if (!process.env.PGPORT) {
//   console.log("Missing required env variable PGPORT.");
//   process.exit(1);
// }
// if (!process.env.PGDATABASE) {
//   console.log("Missing required env variable PGDATABASE.");
//   process.exit(1);
// }
// if (!process.env.PGUSER) {
//   console.log("Missing required env variable PGUSER.");
//   process.exit(1);
// }
// if (!process.env.PGPASSWORD) {
//   console.log("Missing required env variable PGPASSWORD.");
//   process.exit(1);
// }

const client = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});
try {
  await client.connect();
} catch (err) {
  console.error("Error connecting to the root database:", err.message);
  // Exit the application if the database connection fails
  process.exit(1);
}
// .then(() => {
//   console.log("Connected to the root database");
//   // Do other database-related operations here
// })
// .catch((err) => {
// });

export { client };
