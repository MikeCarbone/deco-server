import dotenv from "dotenv";

export default async function () {
  dotenv.config({ path: ".env.test" });
  console.log("Setting up...");
}
