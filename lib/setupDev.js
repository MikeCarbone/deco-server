import { access, writeFile } from "fs/promises";

const FILE_NAME = "dev.js";

(async () => {
  let devFileExists;
  try {
    await access(FILE_NAME);
    devFileExists = true;
  } catch (_err) {
    devFileExists = false;
  }
  console.log(devFileExists);
  if (!devFileExists) {
    // Create the content for the config file
    const content = `// Generated dev file
import postInstall from "./lib/postInstall.js";

(async () => {
    try {
        await postInstall();
        const { deco } = await import("./index.js");
        await deco();
    } catch (err) {
        console.error(err);
    }
})();
  `;
    console.log("Writing file...");
    // Write content to the config file
    await writeFile(FILE_NAME, content);

    console.log(`Config file '${FILE_NAME}' created successfully.`);
  } else {
    console.log(`Config file '${FILE_NAME}' already exists.`);
  }
})();
