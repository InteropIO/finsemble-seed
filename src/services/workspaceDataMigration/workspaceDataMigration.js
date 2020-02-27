const Finsemble = require("@chartiq/finsemble");
const BaseService = Finsemble.baseService;
const {
	RouterClient,
	Logger,
	StorageClient,
	WorkspaceClient,
	LauncherClient
} = Finsemble.Clients;

Logger.start();
StorageClient.initialize();
WorkspaceClient.initialize();
LauncherClient.initialize();

//Migration config
const MIGRATION_NAME = "workspace_migration_20200227";

//Variables used in example migration functions
//TODO: Customize or replace the variables used in the example migration
//field checked on each window and used to look up a migration value
//  (a single top level field of windowData - could be improved with lodash get or similar)
const MIGRATION_SOURCE_FIELD = "windowName";
//single field whose value will be set
//  (a single top level field of windowData - could be improved with lodash set or similar)
const MIGRATION_DESTINATION_FIELD = "componentType";
//map of values of the source field to values to set on the destination field
const MIGRATION_SOURCE_TO_DESTINATION_VALUE_MAP = {
	"News": "NewsComponentType",
	"Chart": "ChartComponentType"
};

/**
 * class WorkspaceDataMigrationService
 * 
 * This class is configurable to migrate data from one storage adapter to another.
 * In this example, IndexedDB data is being migrated to LocalStorage for all internal Finsemble data.
 * 
 */
class WorkspaceDataMigrationService extends BaseService {
	constructor(args) {
		super(args);
	}

	/**
	 * Function that determines whether a window needs to be migrated or not, based on
	 * the content of the windowData parameter..
	 * @param {*} windowData 
	 */
	migrationRequired(windowData) {
		// TODO: Implement a test  to determine whether a window needs to be migrated here, e.g.
		return windowData[MIGRATION_SOURCE_FIELD] && 
			(MIGRATION_SOURCE_TO_DESTINATION_VALUE_MAP[windowData[MIGRATION_SOURCE_FIELD]] ? true : false);

	}

	/**
	 * Migration function applied to each window in the workspace definitions.
	 * @param {*} windowData 
	 */
	migrateWindow(windowData) {
		//check if the MIGRATION_SOURCE_FIELD has a value indicating a migration of the windows config is required
		if (migrationRequired(windowData)) {

			//TODO: implement your migration function that will update the window data
			//e.g.: update the window object with a new component type
			windowData[MIGRATION_DESTINATION_FIELD] = MIGRATION_SOURCE_TO_DESTINATION_VALUE_MAP[windowData[MIGRATION_SOURCE_FIELD]];

			//consider also updating the saved config for the component if you need to
			// let newConfig = {/* updated component config data you get from somewhere */};
			// workspaceObj.windowData[w].customData = newConfig;

			return windowData;
		} else {
			return false;
		}
	}

	/**
	 * Migration function applied to each exported workspace definition.
	 * @param {*} workspaceName 
	 * @param {*} workspaceData 
	 */
	migrateWorkspace(workspaceName, workspaceData) {
		let madeChanges = false;
		let workspaceObj = workspaceData[workspaceName];

		//migrate each window in the workspace and determine if any changes were made
		for(let w=0; w<workspaceObj.windows.length; w++){
			
			//lookup the new componentType for the window somehow - probably using the old window name
			let windowName = workspaceObj.windows[w];
			let migratedWindow = migrateWindow(workspaceObj.windowData[w]);
			if (migratedWindow){
				workspaceObj.windows[w] = migratedWindow;
				madeChanges = true;
			}			
		}
		if (madeChanges){
			workspaceData[workspaceName] = workspaceObj;
			return workspaceData;
		} else {
			return false;
		}
	}


	/**
	 * Retrieves and migrates all workspaces, saving any changes that are made.
	 *
	 */
	runMigration() {
		const promiseSet = [];

		//get all workspace names
		FSBL.Clients.WorkspaceClient.getWorkspaces((err, response) => {
			let workspaceNames = response;
			Logger.log("*** Got workspace names", workspaceNames);
			workspaceNames.forEach(workspaceName => {
				Logger.log("*** migrating " + workspaceName);
				//export and migrate each workspace
				promiseSet.push(new Promise((resolve, reject) => {
					WorkspaceClient.export({'workspaceName:': workspaceName}, function(err, workspaceDefinition) {
						if (err) {
							reject(new Error(err));
						} else {
							//migrate workspace
							let migrated = migrateWorkspace(workspaceName, workspaceDefinition);
							if (migrated){
								//import back to replace existing workspace
								WorkspaceClient.import({workspaceJSONDefinition: migrated, force: true})
								.then(() => {
									resolve();
									Logger.log("*** migrated " + workspaceName);
								})
								.catch(err2){
									reject(new Error(err2));
								};
							} else {
								Logger.log("*** no change from migration of " + workspaceName);
								resolve();
							}
							
						}
					}); 
				});
			});
		});
		Promise.all(promiseSet)
		.then(completeMigration)
		.catch((err) => {
			Logger.log("*** Migration error: ", err);
		});
	}

	/**
	 * Mark the migration completed.
	 */
	completeMigration() {
		//complete migration
		storageClient.save({ topic: "finsemble", key: `${MIGRATION_NAME}`, value: Date.now() });
		RouterClient.publish("Migration", "end");
		Logger.log("*** Migration complete", workspaceNames);
	}

	/**
	 * Determines if the user's data has been migrated by checking for a key in storage service of 
	 * "migrated_from_<adapter to migrate from>", 
	 * which in this example is "migrated_from_IndexedDBAdapter".
	 */
	fetchUserStatus() {
		StorageClient.get({ topic: "finsemble", key: `${MIGRATION_NAME}` }, (err, data) => {
			if (err) {
				Logger.log(`*** Error fetching the user migration status for migration ${MIGRATION_NAME}.`);
			}

			if (!data) {
				// The user does not have a migration record - check if they are a new user
				StorageClient.keys({ topic: "finsemble.workspace" }, (err, keys) => {
					if (err) {
						Logger.error("*** workspacemigration failed to fetch workspaces", err);
					}

					if (keys) {
						// The user has Finsemble records and thus should be migrated.
						RouterClient.addPubSubResponder("Migration", { "State" : "start"}, {
							publishCallback: (err, publish) => {
								if (err) {
									Logger.error("*** workspacemigration failed to publish callback", err);
								}

								if (publish) {
									publish.sendNotifyToAllSubscribers(null, publish.data);

									if (publish.data == "begin") {
										Logger.log("*** workspacemigration begin")
										this.runMigration();
									}
								}
							}
						});

						LauncherClient.spawn("workspacemigration", {}, () => {
							RouterClient.publish("Migration", "needed");

						});
					} else {
						// This is a new user. Set their migration record as 0 so they're not checked again.
						StorageClient.save({ topic: "finsemble", key: `${MIGRATION_NAME}`, value: 0 });
						RouterClient.publish("Migration", "not needed");
						Logger.log("*** workspacemigration not needed due to lack of saved workspaces");
					}
				});
				
			}
		});
	}
}

const dms = new WorkspaceDataMigrationService({ 
	startupDependencies: {
		services: ["authenticationService", "configService", "storageService", "workspaceService"]
	}
});

dms.onBaseServiceReady((callback) => {
	let ranMigrationCheck = false; //to make sure we only do this once, as technically auth can be run multiple times
	
	RouterClient.subscribe("AuthorizationState", function(err,notify) {
		if (err) {
			Logger.error("*** workspacemigration failed to auth");
		} else {
			if (!ranMigrationCheck && notify.data.state == "done") {
				ranMigrationCheck = true;
				dms.fetchUserStatus();
			}	
		}
	})
	callback();
});

dms.start();
module.exports = dms;