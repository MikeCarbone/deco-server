import { access, writeFile } from "fs/promises";
import { randomBytes, randomUUID } from "crypto";

const FILE_NAME = "config.js";

export default async function postInstall() {
  let configExists;
  try {
    await access(FILE_NAME);
    configExists = true;
  } catch (_err) {
    configExists = false;
  }

  if (!configExists) {
    // Generate random strings
    const generateRandomString = (length = 32) => randomBytes(length).toString("hex");

    const APP_SECRET_ENCRYPTION_STRING = generateRandomString();
    const LOGIN_JWT_KEY = generateRandomString();
    const DEFAULT_USER_PASSWORD = generateRandomString(10);
    const STARTING_PLUGIN_ID = randomUUID();

    // Create the content for the config file
    const configContent = `// These are strings needed to start up the server in a default state
export default {
  APP_SECRET_ENCRYPTION_STRING: "${APP_SECRET_ENCRYPTION_STRING}",
  LOGIN_JWT_KEY: "${LOGIN_JWT_KEY}",
  DEFAULT_USER_PASSWORD: "${DEFAULT_USER_PASSWORD}",
  INITIALIZE_CORE_PLUGIN_ID: "${STARTING_PLUGIN_ID}"
};
  `;

    // Write content to the config file
    await writeFile(FILE_NAME, configContent);

    console.log(`Config file '${FILE_NAME}' created successfully.`);
  } else {
    console.log(`Config file '${FILE_NAME}' already exists.`);
  }
}
