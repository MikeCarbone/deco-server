/**
 * We allow two options for connecting to your database:
 * 1. One .env variable `DBURL`
 * 2. All .env variables `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
 */
import pg from "pg";
import { config } from "dotenv";

// Load in environment variables
config();

// Ensure necessary variables are present in a .env file
const REQUIRED_DB_VARS = ["PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD"];
REQUIRED_DB_VARS.forEach((variable) => {
  if (!!process.env.DBURL) return;
  if (!process.env[variable]) {
    console.log(`Missing required .env variable ${variable}.`);
    process.exit(1);
  }
});

const hasConnectionString = !!process.env.DBURL;
const connection = hasConnectionString
  ? { connectionString: process.env.DBURL }
  : {
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
    };

// Create a pool of connections
const { Pool } = pg;
const client = new Pool(connection);

// Initiate root database connection
try {
  await client.connect();
  console.log("Root database connected.");
} catch (err) {
  console.log("Root database failed to connect");
  console.error(err);
  process.exit(1);
}

export { client };
