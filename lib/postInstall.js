import { existsSync, writeFileSync } from "fs";
import { randomBytes } from "crypto";

const FILE_NAME = "config.js";

// Check if the file already exists
if (!existsSync(FILE_NAME)) {
  // Generate random strings
  const generateRandomString = () => randomBytes(32).toString("hex");

  const APP_SECRET_ENCRYPTION_STRING = generateRandomString();
  const LOGIN_JWT_KEY = generateRandomString();
  const DEFAULT_USER_PASSWORD = generateRandomString();

  // Create the content for the config file
  const configContent = `// These are strings needed to start up the server in a default state
export default {
  APP_SECRET_ENCRYPTION_STRING: "${APP_SECRET_ENCRYPTION_STRING}",
  LOGIN_JWT_KEY: "${LOGIN_JWT_KEY}",
  DEFAULT_USER_PASSWORD: "${DEFAULT_USER_PASSWORD}",
};
`;

  // Write content to the config file
  writeFileSync(FILE_NAME, configContent);

  console.log(`Config file '${FILE_NAME}' created successfully.`);
} else {
  console.log(`Config file '${FILE_NAME}' already exists.`);
}
