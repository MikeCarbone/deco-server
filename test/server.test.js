import fs from "fs/promises";
import { client } from "../db/index.js";
import request from "supertest";
import { CORE_PLUGINS, CORE_KEYS, installPlugin, server } from "../index.js";

const CREATED_TABLES = [];

afterAll(async () => {
  console.log("Donezoooo");
});

// We dont test individual apps, just core server logic
test("adds 1 + 2 to equal 3", () => {
  console.log("MATEY");
  expect(1 + 2).toBe(3);
});

describe("Setup", () => {
  test("Creates app ID for db", () => {
    expect(typeof CORE_PLUGINS[CORE_KEYS.apps].id).toBe("string");
    expect(CORE_PLUGINS[CORE_KEYS.apps].id.length).toBe(36); // UUID length
  });

  test("Server stuff", async () => {
    const response = await request(server).get("/_meta/directory");
    expect(response.status).toBe(200); // Expect HTTP status code 200
    expect(response.body).toHaveProperty("directory", []); // Expect the response body to have a 'message' property
  });

  test("Installs core apps", () => {});
});

describe("Installations", () => {
  // What determines a successful install?
  // app and manifest files are saved locally
  // app is created in entry
  // tables are created successfully
  // saves routes entry in
  test("Installs remote app", async () => {
    const install = await installPlugin("https://www.decojs.com/manifest.json");
    const installedAppPath = path.resolve(__dirname, `../installs/${install.manifest.name}/app.js`);
    const installedManifestPath = path.resolve(__dirname, `../installs/${install.manifest.name}/manifest.json`);
    await expect(fs.access(installedAppPath)).resolves.toBeUndefined();
    await expect(fs.access(installedManifestPath)).resolves.toBeUndefined();
  });
  test("Installs app with dependencies", () => {});
  test("Installing remote manifest over http fails", () => {});
  test("Installing remote app over http fails", () => {});
  test("Installing remote app fails if no app.js", () => {});
  test("Installing remote app fails if no manifest name", () => {});
  test("Installing remote app fails if manifest name collision", () => {});

  test("Installs local app", () => {});
});

describe("Users", () => {
  test("Create owner if non-existent", () => {});
});

describe("Routes", () => {
  test("Routes are built from saved app entries", () => {});

  test("Execution function gets executed", () => {});

  test("Operation middleware gets executed", () => {});

  test("Ensure handleReturn is functioning and has execution context", () => {});

  test("Ensure path formatting is correct (removing {} for :)", () => {});

  test("Ensure static returns function correctly (line 522)", () => {});

  test("Ensure routes return correct formats", () => {});
});

// Environment Object
describe("Environment Object", () => {
  test("Ensure env object gets correct tables", () => {});

  test("Ensure env object gets correct apps", () => {});

  test("Ensure env object functions", () => {});
});

// Secrets
describe("Execution", () => {
  test("Make sure executeOperations actualy does that", () => {});
});

// Secrets
describe("Secrets", () => {
  test("Secrets successfuly encrypts", () => {});

  test("Secrets successfully decrypts", () => {});
});

// Middleware
describe("Middleware", () => {
  test("Pre-auth middleware gets fired", () => {});

  test("Auth middleware gets fired", () => {});

  test("Route Middleware gets fired", () => {});
});

// Authentication
describe("Authentication", () => {
  test("Ensure permissions work for public routes", () => {});

  test("Ensure private routes do not return", () => {});

  test("Ensure no cookie access doesnt work", () => {});

  test("Ensure cookie access does work", () => {});

  test("Ensure per-domain auth works", () => {});

  test("Ensure if per-domain auth is enabled, other domains cannot access", () => {});
});

// Database
describe("Database", () => {
  test("Postgres tables are successfully parsed", () => {});
});

// Setup
// Creates app ID for db
// Installs core apps

// Installations
// Installing remote app
// Installing local app

// Group users
// Create owner if non-existent

// Routes
// Routes are built from saved app entries
// Execution function gets executed
// Operation middleware gets executed
// Ensure handleReturn is functioning and has execution context
// Ensure path formatting is correct (removing {} for :)
// Ensure static returns function correctly (line 522)
// Ensure routes return correct formats

// Environment Object
// Ensure env object gets correct tables
// Ensure env object gets correct apps
// Ensure env object functions

// Execution
// Make sure executeOperations actualy does that

// Secrets
// Secrets successfuly encrypts
// Secrets successfully decrypts

// Middleware
// Pre-auth middleware gets fired
// Auth middleware gets fired
// Route Middleware gets fired

// Authentication
// Ensure permissions work for public routes
// Ensure private routes do not return
// Ensure no cookie access doesnt work
// Ensure cookie access does work
// Ensure per-domain auth works
// Ensure if per-domain auth is enabled, other domains cannot access

// Database
// Postgres tables are successfully parsed
