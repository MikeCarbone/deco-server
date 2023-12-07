# Deco Server

Deco Server is an easy way to set up a web server that is compatible with the Deco protocol and ecosystem of plugins.

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

## Contributing

Contributions are welcome. Here is what is still needed:

- [x] Notifications
- [ ] Updating / versioning plugins (checking for and executing)
- [x] Making Install requests
- [ ] Accepting Install requests
- [ ] User profiles
- [ ] User permissions
- [ ] Frontend dashboards
- [ ] Manual installations
- [ ] API Access
- [ ] Pre-build secrets script
- [x] Testing infrastructure
- [ ] Tests
