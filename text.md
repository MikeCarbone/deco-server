QUESTIONS:

- FLOW
- Routes:
- middleware, execution, handleReturn, handleResponse
- Internal Calls:
- execution, handleReturn

- We need to standardize returns from execution functions and handleResponse
- This way we can access data from other routes / apps without it necessarily originating from a request
- Specifically the return, because the call is fine
- What if execution and handleResponse can return data
- What if we create a new function called routeResponse to handle express logic handling
- routeResponse, routeMiddleware will be request-specific
- execution and formatReturn are context agnostic, should return either execution operations or standard body that

- How do we configure app secrets? I don't want them to live in the DB
- We can do a secret basis configured by the admin
- So per-user secrets are stored in DB, but won't provide access if exposed accidentally
- Combined with the root server secret, that will create the real secret
- However we don't want just concatenation, because then the root secret can be reverse engineered
- Instead we can create a hash representation, where the root secret and the app-key secret are combined, with another root server password, to create a hash representation of the concatenated string

- Limit usage of process.env

- But what if we need not a random string, but a functional string like an API key?
- We'll have to encrypt that and provide a decrypted value to the app
- Part of subset route building process
- Each app has a secrets object, which will be a JSON of encrypted fields for that app
- Encryption is an encrypted JWT
- stored as { stripeToken: "xyzencrypted123" }
- when route is built, we decrypt and pass secrets object
- { stripeToken: "123unencrypted" }
- How do we control secrets? Part of apps routes, any secret can be added
- We can create a pattern for expected secrets

- When logging in a user, how do we access their salt&hash if DB is connected per user, and users table doesn't exist per user...
- Maybe we share root server access? Discourage users from operating on top of the root layer

- Handling permissions with user data
- We're gonna have a single user entry
- Different groups of info for different endpoints?
- /\_meta/me/public
- /\_meta/me/payments
- /\_meta/me/social
- /\_meta/me/profile
- editing user details will edit it in the root users table
- Per user groups will generate endpoints - user detail groups app?
- Pull info from
- We can keep meta description file for quick UX details about each field
- We can generate an endpoint per user information group

- Making endpoint executions usable outside endpoint context

  - What if we want to call them as functions without sending stuff? For internal use / AI

- Handling multi-user installs

  - We allow per-user apps, but we don't have per-user installs folder
  - How do we handle different versions?
    - One version per server so all users work with the same version
    - Server admin manages upgrades

- Why do we have per-user apps?
  - What if one user wants to use X but another user does not
  - Handle route permissions, like exposing public / private endpoints per-user

3rd Party Permissions vs. Installed App Permissions

- 3rd party can come from anywhere -- other servers, other people, apps, websites...
- Installed app permissions comes from installed apps and populates the env interface

We're building the most powerful AI assistant network in the world.

The next era of personal computing hinges on seamlessly integrating AI into our daily lives. The introduction of ChatGPT marked a turning point, altering our expectations of what computers can achieve. Today, existing tools fall short with limited access to cross-app information. An advanced personal AI depends on seamless bidirectional interactivity across apps.

In order to achieve a powerful personal AI, we have to change how our apps are built. The solution lies in decentralization through centralization-- enabling us to govern access to our own data. We're developing a pattern to make this an easy one-click: private databases as the central data store, shared data models for a universal language, and an API for structured interaction between nodes.

Depending on third-parties to create a personal AI is not feasible. Expecting us to find API keys is far-fetched. Relying on third-party APIs is unstable and risky. Organizations won't fix this: letting us have unfiltered access to our own information harms their business.

It's time to provide everyone with their own virtual home.

It's time to make our lives programmable with ease.

New class helper

const model = Model.create('lib-name')
model.on.update(() => { console.log(1) })
model.on.update(() => { console.log(2) })
model.update.addWebhook()

- Bring your own DB
- Shareable models (installable)
  - CRUD schematics
    - meta information (num_entriessssxs, install_date)
    - SQL statements not good, might require logic (like a bucket structure)
    - JS functions
    - Each operation exposed via endpoint
  - Access logs (which app, which user)
- Apps
  - depend on models
  - depend on webhooks
- Handling multiplayer / collaboration
- Webhook subscriptions ?

Full Lifecycle:

1. Build (instantiation, return SQL)
   Request Lifecycle:
2. Pre-operation (pass req, res, user, return SQL for data fetch)
3. Operate (pass req, res, js, user, return data)
4. On Success
5. On failure

{
name: "",
dependencies: [],
functions: {
intantiate: () => {

        },
        else: []
    }

}
