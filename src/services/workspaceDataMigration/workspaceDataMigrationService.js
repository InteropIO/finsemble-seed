import Finsemble from "@finsemble/finsemble-core";
import _get from "lodash.get";
import _set from "lodash.set";

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
const MIGRATION_TEMP_WORKSPACE_NAME = "TEMPORARY MIGRATION WORKSPACE";

//----------------------------------------------------------------------
// Example Migration function variables
// COnfigured to convert any Welcome Components in the saved workspaces
// into Process Monitor components
// TODO: Customize or replace the variables used in the example migration
// to suit your own use case.
//----------------------------------------------------------------------
//field checked on each window in the windowData array of the workspace and used to look up a migration value
//Note: we use lodash.get so that a path is supported, e.g. parentObject1.parentObject2.field
//Note: to map data based on the window name field, set to "name"
const MIGRATION_SOURCE_FIELD = "componentType";
//map of values of the source field to fields and values to set, which are defined as destination field path:value
const MIGRATION_SOURCE_TO_DESTINATION_VALUE_MAP = {
	"Welcome Component": {
		"componentType": "Process Monitor",
		"customData.component.type": "Process Monitor",
		"url": "http://localhost:3375/components/processMonitor/processMonitor.html",
		"customData.window.url": "http://localhost:3375/components/processMonitor/processMonitor.html"
	}
};
//----------------------------------------------------------------------

//----------------------------------------------------------------------
// Example Migration functions
// Customize or replace these functions to customize the example
// migration to suit your own use case.
//----------------------------------------------------------------------
/**
 * Function that determines whether a window needs to be migrated or not, based on
 * the content of the windowData parameter..
 * @param {*} windowData
 */
const migrationRequired = function(windowData) {
	// TODO: Implement a test  to determine whether a window needs to be migrated here, e.g.
	let val = _get(windowData,MIGRATION_SOURCE_FIELD);
	return  val&&
		(MIGRATION_SOURCE_TO_DESTINATION_VALUE_MAP[val] ? true : false);

}

/**
 * Migration function applied to each window in the workspace definitions.
 * @param {*} windowData
 */
const migrateWindow = function(windowData) {
	//check if the MIGRATION_SOURCE_FIELD has a value indicating a migration of the windows config is required
	if (migrationRequired(windowData)) {

		//TODO: implement your migration function that will update the window data
		//e.g.: update the window object with a new component type
		let sourceVal = _get(windowData,MIGRATION_SOURCE_FIELD);
		let toApply = MIGRATION_SOURCE_TO_DESTINATION_VALUE_MAP[sourceVal];;
		let destinationFields = Object.keys(toApply);
		destinationFields.forEach((field) => {
			_set(windowData, field, toApply[field]);
		});

		//N.B. you may also want to override the 'customData' element with the full new configuration of the component (which you could retrieve with the ConfigClient)


		return windowData;
	} else {
		return false;
	}
}
//----------------------------------------------------------------------


//----------------------------------------------------------------------
// Migration management functions
//----------------------------------------------------------------------
/**
 * Migration function applied to each exported workspace definition.
 * @param {*} workspaceName
 * @param {*} workspaceData
 */
const migrateWorkspace = function(workspaceName, workspaceData) {
	let madeChanges = false;
	let workspaceObj = workspaceData[workspaceName];


	//migrate each window in the workspace and determine if any changes were made
	for(let w=0; w<workspaceObj.windows.length; w++){

		//lookup the new componentType for the window somehow - probably using the old window name
		let windowName = workspaceObj.windows[w];
		let migratedWindow = migrateWindow(workspaceObj.windowData[w]);
		if (migratedWindow){
			workspaceObj.windowData[w] = migratedWindow;
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
const runMigration = function() {
	const promiseSet = [];

	let activeWorkspace = "Default Workspace";
	//getcurrent workspace name
	WorkspaceClient.getActiveWorkspace((err, response) => {
		if (response && response.data && response.data.name){
			activeWorkspace = response.data.name;
			Logger.log("*** Got active workspace: ", activeWorkspace);

			WorkspaceClient.createWorkspace(MIGRATION_TEMP_WORKSPACE_NAME, {switchAfterCreation: true}, function(err, response) {
				if (!err) {
					//get all workspace names
					WorkspaceClient.getWorkspaces((err, response) => {
						let workspaces = response;
						Logger.log("*** Got workspaces", workspaces);
						workspaces.forEach(workspace => {
							Logger.log("*** migrating " + workspace.name);
							//export and migrate each workspace
							promiseSet.push(new Promise((resolve, reject) => {
								WorkspaceClient.export({'workspaceName': workspace.name}, function(err, workspaceDefinition) {
									if (err) {
										reject(new Error(err));
									} else {
										//migrate workspace
										Logger.log(`*** exported workspace definition for '${workspace.name}': `, workspaceDefinition);
										let migrated = migrateWorkspace(workspace.name, workspaceDefinition);
										if (migrated){
											Logger.log(`*** migrated workspace data for '${workspace.name}'`, migrated);
											//import back to replace existing workspace
											WorkspaceClient.import({workspaceJSONDefinition: migrated, force: true})
											.then(() => {
												resolve();
												Logger.log("*** migrated " + workspace.name);
											})
											.catch((err2) => {
												reject(new Error(err2));
											});
										} else {
											Logger.log("*** no change from migration of " + workspace.name);
											resolve();
										}

									}
								});
							}));
						});

						Promise.all(promiseSet)
						.then(() => {
							completeMigration(activeWorkspace);
						}).catch((err) => {
							Logger.error("*** Migration error occurred during migration: ", err);
							StorageClient.save({ topic: "finsemble", key: `${MIGRATION_NAME}_ERROR`, value: "Migration error: error occurred during migration: " + JSON.stringify(err) });
							RouterClient.publish("Migration", "error");
						});
					});
				} else {
					Logger.error("*** Migration error: error occurred when creating a temporary workspace for the migration", err);
					StorageClient.save({ topic: "finsemble", key: `${MIGRATION_NAME}_ERROR`, value: "Migration error: error occurred when creating a temporary workspace for the migration: " + JSON.stringify(err) });
					RouterClient.publish("Migration", "error");
				}
			});
		} else {
			if (err){
				Logger.error("*** Migration error: error occurred when retrieving the active workspace", err);
				StorageClient.save({ topic: "finsemble", key: `${MIGRATION_NAME}_ERROR`, value: "Migration error: " + JSON.stringify(err) });
				RouterClient.publish("Migration", "error");
			} else {
				Logger.error("*** Migration error: Invalid response received when querying active workspace, response: ", response);
				StorageClient.save({ topic: "finsemble", key: `${MIGRATION_NAME}_ERROR`, value: "Migration error: Invalid response to active workspace query, response: " + JSON.stringify(response) });
				RouterClient.publish("Migration", "error");
			}
		}
	});
}

/**
 * Mark the migration completed.
 */
const completeMigration = function(activeWorkspace) {
	//complete migration
	StorageClient.save({ topic: "finsemble", key: `${MIGRATION_NAME}`, value: Date.now() });
	RouterClient.publish("Migration", "end");
	Logger.log("*** Migration complete");

	//reload the activeWorkspace
	WorkspaceClient.switchTo({name: activeWorkspace}, function(err, response) {
		if (err){
			Logger.error("*** Migration error: on final switch to active workspace: ", err);
		}
		WorkspaceClient.remove({
			name: MIGRATION_TEMP_WORKSPACE_NAME
		}, function(err, response) {
			if (err){
				Logger.error("*** Migration error: on final removal of temp workspace: ", err);
			}
		});
	});
}

/**
 * Determines if the user's data has been migrated by checking for a key in storage service of
 * "migrated_from_<adapter to migrate from>",
 * which in this example is "migrated_from_IndexedDBAdapter".
 */
const fetchUserStatus = function() {
	StorageClient.get({ topic: "finsemble", key: `${MIGRATION_NAME}` }, (err, data) => {
		if (err) {
			Logger.log(`*** Error fetching the user migration status for migration ${MIGRATION_NAME}.`);
		}

		if (!data) {
			// The user should be migrated.
			RouterClient.addPubSubResponder("Migration", { "State" : "start"}, {
				publishCallback: (err, publish) => {
					if (err) {
						Logger.error("*** workspacemigration failed to publish callback", err);
					}

					if (publish) {
						publish.sendNotifyToAllSubscribers(null, publish.data);

						if (publish.data == "begin") {
							Logger.log("*** workspacemigration begin")
							runMigration();
						}
					}
				}
			});

			LauncherClient.spawn("workspacemigration", {}, () => {
				RouterClient.publish("Migration", "needed");
			});
		} //else skip migration
	});
}


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
				fetchUserStatus();
			}
		}
	})
	callback();
});

dms.start();
// module.exports = dms;
