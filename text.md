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
