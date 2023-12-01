# Deco Server

Deco Server is an easy way to set up a web server that is compatible with the Deco protocol and ecosystem of apps.

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

[ ] Notifications
[ ] Install requests
[ ] User profiles
[ ] User permissions
[ ] Frontend dashboards
[ ] Manual installations
[ ] API Access
[ ] Pre-build secrets script
