import { client } from "../db/index.js";

export default async function () {
  try {
    // Close DB connection
    client.end();
    // End the testing process
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
}
