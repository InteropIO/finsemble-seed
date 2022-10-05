// @ts-ignore
import {StandardError, types, Workspace, WorkspaceImport} from "@finsemble/finsemble-core";
import {get} from "lodash";
import {set} from "lodash";
import {FinsembleWindowData} from "@finsemble/finsemble-core/dist/lib/platform/services/window/types";

const {
	RouterClient,
	Logger,
	StorageClient,
	WorkspaceClient,
	LauncherClient
} = FSBL.Clients;

Logger.start();

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
const MIGRATION_SOURCE_TO_DESTINATION_VALUE_MAP:any = {
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
const migrationRequired = (windowData:FinsembleWindowData) => {
	// TODO: Implement a test  to determine whether a window needs to be migrated here, e.g.
	let val = get(windowData, MIGRATION_SOURCE_FIELD);
	return val && !!MIGRATION_SOURCE_TO_DESTINATION_VALUE_MAP[val];
}

/**
 * Migration function applied to each window in the workspace definitions.
 * @param {*} windowData
 */
const migrateWindow = (windowData:FinsembleWindowData | undefined) => {
	//check if the MIGRATION_SOURCE_FIELD has a value indicating a migration of the windows config is required
	if (windowData && migrationRequired(windowData)) {

		//TODO: implement your migration function that will update the window data
		//e.g.: update the window object with a new component type
		let sourceVal = get(windowData, MIGRATION_SOURCE_FIELD);
		let toApply = MIGRATION_SOURCE_TO_DESTINATION_VALUE_MAP[sourceVal];
		let destinationFields = Object.keys(toApply);
		destinationFields.forEach((field) => {
			set(windowData, field, toApply[field]);
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
const migrateWorkspace = (workspaceName:string, workspaceData:{
	[key: string]: WorkspaceImport;
}) => {
	let madeChanges = false;
	let workspaceObj = workspaceData[workspaceName];


	//migrate each window in the workspace and determine if any changes were made
	for (let w = 0; w < workspaceObj.windows.length; w++) {

		//lookup the new componentType for the window somehow - probably using the old window name
		let migratedWindow = migrateWindow(workspaceObj.windowData?.[w]);
		if (migratedWindow && workspaceObj.windowData) {
			workspaceObj.windowData[w] = migratedWindow;
			madeChanges = true;
		}
	}
	if (madeChanges) {
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
const runMigration = () => {
	const promiseSet:Promise<any>[] = [];

	let activeWorkspace:string = "Default Workspace";
	//getcurrent workspace name
	WorkspaceClient.getActiveWorkspace((err, response) => {
		if (response && response.data && response.data.name) {
			activeWorkspace = response.data.name;
			Logger.log("*** Got active workspace: ", activeWorkspace);

			WorkspaceClient.createWorkspace(MIGRATION_TEMP_WORKSPACE_NAME, {switchAfterCreation: true}, (err, response) => {
				if (!err) {
					//get all workspace names
					WorkspaceClient.getWorkspaces((err: StandardError, response:Workspace[]) => {
						let workspaces = response;
						Logger.log("*** Got workspaces", workspaces);
						workspaces.forEach(workspace => {
							Logger.log("*** migrating " + workspace.name);
							//export and migrate each workspace
							promiseSet.push(new Promise<void>((resolve, reject) => {
								WorkspaceClient.export({'workspaceName': workspace.name}, (err:StandardError, workspaceDefinition:{
									[key: string]: WorkspaceImport;
								}) => {
									if (err) {
										reject(new Error(err as string));
									} else {
										//migrate workspace
										Logger.log(`*** exported workspace definition for '${workspace.name}': `, workspaceDefinition);
										let migrated = migrateWorkspace(workspace.name, workspaceDefinition);
										if (migrated) {
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
							StorageClient.save({
								topic: "finsemble",
								key: `${MIGRATION_NAME}_ERROR`,
								value: "Migration error: error occurred during migration: " + JSON.stringify(err)
							});
							RouterClient.publish("Migration", "error");
						});
					});
				} else {
					Logger.error("*** Migration error: error occurred when creating a temporary workspace for the migration", err);
					StorageClient.save({
						topic: "finsemble",
						key: `${MIGRATION_NAME}_ERROR`,
						value: "Migration error: error occurred when creating a temporary workspace for the migration: " + JSON.stringify(err)
					});
					RouterClient.publish("Migration", "error");
				}
			});
		} else {
			if (err) {
				Logger.error("*** Migration error: error occurred when retrieving the active workspace", err);
				StorageClient.save({
					topic: "finsemble",
					key: `${MIGRATION_NAME}_ERROR`,
					value: "Migration error: " + JSON.stringify(err)
				});
				RouterClient.publish("Migration", "error");
			} else {
				Logger.error("*** Migration error: Invalid response received when querying active workspace, response: ", response);
				StorageClient.save({
					topic: "finsemble",
					key: `${MIGRATION_NAME}_ERROR`,
					value: "Migration error: Invalid response to active workspace query, response: " + JSON.stringify(response)
				});
				RouterClient.publish("Migration", "error");
			}
		}
	});
}

/**
 * Mark the migration completed.
 */
const completeMigration = (activeWorkspace:string) => {
	//complete migration
	StorageClient.save({topic: "finsemble", key: `${MIGRATION_NAME}`, value: Date.now()});
	RouterClient.publish("Migration", "end");
	Logger.log("*** Migration complete");

	//reload the activeWorkspace
	WorkspaceClient.switchTo({name: activeWorkspace}, (err, response) => {
		if (err) {
			Logger.error("*** Migration error: on final switch to active workspace: ", err);
		}
		WorkspaceClient.remove({
			name: MIGRATION_TEMP_WORKSPACE_NAME
		}, (err: StandardError, response:any) => {
			if (err) {
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
const fetchUserStatus = () => {
	StorageClient.get({topic: "finsemble", key: `${MIGRATION_NAME}`}, (err, data) => {
		if (err) {
			Logger.log(`*** Error fetching the user migration status for migration ${MIGRATION_NAME}.`);
		}

		if (!data) {
			// The user should be migrated.
			RouterClient.addPubSubResponder("Migration", {"State": "start"}, {
				publishCallback: (err, publish) => {
					if (err) {
						Logger.error("*** workspacemigration failed to publish callback", err);
					}

					if (publish) {
						publish.sendNotifyToAllSubscribers(null, publish.data);

						if (publish.data === "begin") {
							Logger.log("*** workspacemigration begin")
							runMigration();
						}
					}
				}
			});

			LauncherClient.spawn("WorkspaceMigration", {}, () => {
				RouterClient.publish("Migration", "needed");
			});
		} //else skip migration
	});
}





const main = async () => {
	/**
	 * Fired when the service is ready for initialization
	 * @param {function} callback
	 */
	let ranMigrationCheck = false; //to make sure we only do this once, as technically auth can be run multiple times

	RouterClient.subscribe("AuthorizationState", function (err, notify) {
		if (err) {
			Logger.error("*** workspacemigration failed to auth");
		} else {
			if (!ranMigrationCheck && notify.data.state === "done") {
				ranMigrationCheck = true;
				fetchUserStatus();
			}
		}
	})
	FSBL.publishReady();
};

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", main);
} else {
	window.addEventListener("FSBLReady", main);
}
