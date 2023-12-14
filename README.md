# Deco Server

Deco Server is an easy way to set up a web server that is compatible with the Deco protocol and ecosystem of plugins. The mission of Deco is [to create a network of artificially intelligent, **bidirectional** personal assistants](https://decojs.com).

Why? I believe the future is networked artificial intelligence profiles. These profiles will be exposed via endpoint, be accessible to others, be able to read and write data, and communicate with other profiles on the internet. Currently, [there is no easy way to do this.](https://carbonemike.com/bidirectional-interactivity-limitations-of-ai-tools/) Deco Server is the first step in that process, because the server makes it easy for websites and applications to build on while enabling the creation of [a local Interaction Record](https://carbonemike.com/navigating-organizational-growth-with-an-interaction-record-and-llms/) to train the artificial intelligence on. This server centralizes user data, enables a new suite of applications, and makes all of the above possible. Everything under your control.

![Diagram of a Deco Server, including a REST API, installable apps, LLM via API, Relational DB, Vector DB Embeddings, and a local LLM.](https://storage.googleapis.com/carbonemike-images/1702492323540deco-server-2.png)

## Installation

```bash
npm i deco
```

```js
// index.js
import { decoServer } from "deco";

decoServer();
```

That's all that is required. Your can begin configuring your profile at `http://localhost:3456`.

## Stability

This project is in alpha and is not guaranteed to be secure. Do not store any sensitive information on your server. Do not use in production.

## Overview

Below is an overview of some of the concepts of a Deco server.

### Plugins

With a Deco server, plugins allow you to extend the capabilities of your server. Plugins can create new tables on your database, create new endpoints, and interact with other plugins. A plugin consists of two files: `manifest.json` and `app.js`. The manifest outlines the name, version, dependencies, and other meta information including the URI of the `app.js` file. The app will export specially named functions:

- `tables`
  - The names of the tables that this plugin utilizes
- `onInstall`
  - What to do upon install, which files to create
- `endpoints`
  - Which endpoints to create, and what to do when this endpoint is hit.

Each created endpoint will live at `url.com/plugins/[plugin-name]/[endpoint]`.

#### Versioning

Non-breaking changes are welcome. We don't have patterns or methods for updates figured out yet.

**Plugins should never introduce breaking changes.** The idea is that consumer applications may or may not depend on the endpoints and data models created by an application. If new functionality has to be introduced, it's encouraged that a new plugin be created, with an `onInstall` migration script migrating old data into the new structure.

I'm still working on the details of this pattern.

#### Core Plugins

Core plugins are the minimum plugins required to run a Deco server. These plugins bring core functionality to the server, like users, permissions, notifications, and more.

### Users

Deco server supports multiple users. This is great for organizations or families looking to extend control and configuration to others on a single server. Only the owner can create new users. Upon creation, the owner will assign a subdomain, which will serve as the URL subdomain for that user. Each user will require their own database connection, which helps security and makes multi-tenancy easier.

#### Authentication

Currently, the server uses password-based authentication. Each user on a server will have their own password. We'd like to expand this to other authentication methods in the future.

### Preventing Plugin Collisions

We employee a few methods to avoid plugin collisions.

- **SQL Parsing**
  - Deco appends the plugin ID to tables a plugin creates. Every plugin gets a UUID assigned, so this will make it harder for a bad plugin to write `DROP * FROM xyz`, or guess the SQL table names. This also avoids table name collisions, so two apps can make a table called "users" for example.
- **Naming**
  - Plugin names should be unique. We encourage using a facilitator, like [Deco Platform](https://decojs.com) to safely install 3rd party plugins.
- **Permissions**
  - Plugins can't touch other plugins, unless the user grants permission. If a plugin wants to access certain operations or tables, it will have to specify that in its manifest's dependencies.
- **Endpoint Separation**
  - Endpoints are separated via `/plugins/plugin-name`, which avoids plugin endpoints from colliding with each other.

### Security

Security is absolutely essential to the success of this project. We won't release a stable version until we're confident it's secure.

#### Data Access

Currently there are four methods of accessing data:

- Public routes
  - A plugin may specify an endpoint as publicly accesible. If this is the case, no authentication is required to access.
- Direct
  - Users can access their own data after authenticating.
- Installed Plugin
  - Plugins can request access to other plugins' data, and do whatever they want. Be careful when installing plugins.
- Domain-based
  - A 3rd party may request access to certain endpoints. If granted, this will expose the data from the requested endpoint to the domain of the requesting party.

## Roadmap

Contributions are welcome. Here is what is still needed:

- [x] Notifications
- [x] Dependency Resolution
- [x] Making Install requests
- [x] Accepting Install requests
- [x] Testing infrastructure
- [ ] Updating / versioning plugins (checking for and executing)
- [ ] User profiles
- [ ] User permissions
- [ ] Tests
- [ ] Frontend dashboards
- [ ] Manual installations
- [ ] API Access
- [ ] Pre-build secrets script
- [ ] Webhooks (subscribing to events)
- [ ] Vector DB Embeddings
- [ ] Local LLM Flow

### Core Plugins

- [ ] Open Inbox (email)
- [ ] Messages (between friends)
- [ ] Friends
