[![Finsemble Logo](https://documentation.chartiq.com/finsemble/styles/img/Finsemble_Logo_Dark.svg)](https://documentation.chartiq.com/finsemble/)

# Finsemble Recipe: Workspace Migration

When the Finsemble component configuration changes and a componentType is added or removed, existing workspaces may be affected and also require changes to remain working.
This recipe, with appropriate modifications, can handle the migration of workspace data for your users.


## Ingredients

This recipe contains a service and a component to assist in setting up a migration workflow. Here are the provided files in the `src` directory of this branch:

```
src
├── adapters
├── clients
├── components
│   └── workspacemigration
│       ├── config.json
│       ├── finsemble.webpack.json
│       ├── workspacemigration.css
│       ├── workspacemigration.html
│       └── workspacemigration.js
├── services
│   └── workspaceDataMigration
│       ├── README.md
│       ├── config.json
│       ├── workspaceDataMigrationService.html
│       ├── datamigration.png
│       └── workspaceDataMigrationService.js
└── thirdParty
```


### Service: `workspaceDataMigration`

**Flowchart**

![Workspace Migration Flowchart](./datamigration.png)


1. If the user's data has already been migrated, the Migration Assistant component should not spawn.
1. Otherwise, a simple message displays with warning copy and action buttons.
1. Upon completion of a migration, the Migration assistant can be clsoed.

### Workspace Migration Assistant Component: `workspacemigration`

The Migration Assistant component is a basic HTML5 component designed to communicate with the user about the migration. This component is a sample and is designed to be customized to your needs. It is not an essential part of the migration process, other than having a button to start the process. Hence, it may be removed or edited such that the migration is conducted automatically. However, at the end of the migration the current workspace must be reloaded; the migration assistant is therefore useful in grabbing the user's attention while that happens so that they do not interact with the workspace before ti is reloaded

## Directions

1. Copy the `src/services/workspaceDataMigration` directory from this branch in your Finsemble `src/services` directory.
1. Copy the `src/components/workspacemigration` directory from this branch to your Finsemble `src/components` directory.



1. Modify `src/services/datamigration/workspaceDataMigrationService.js` to set which adapter and storage topics you wish to migrate: 
    - Set `MIGRATE_FROM_ADAPTER` to the name of source storage adapter (e.g. "IndexedDBAdapter").
    - Set `MIGRATE_TO_ADAPTER` to the name of destination storage adapter (i.e. "LocalStorageAdapter" or the name of your custom storage adapter).
    - Set `TOPICS_TO_MIGRATE` to an array of storage topics you wish to migrate (e.g. `["finsemble", "finsemble.workspace"]`)

1. In the  `finsemble.importConfig` array of your [manifest](https://documentation.chartiq.com/finsemble/tutorial-Configuration.html), include references to the component and service `config.json`:
    
    ```json
    "importConfig": [
        ...
        "$applicationRoot/components/datamigration/config.json",
        "$applicationRoot/services/datamigration/config.json",
        ...
    ],
    ```
1. Install if needed and start Finsemble: `npm install; npm run dev`.
1. After the user is authenticated, the Data Migration Assistant component will or will not display as per the logic from the service, as above.

Note that this recipe is a non-destructive migration in that it does not clear the prior datastore. 