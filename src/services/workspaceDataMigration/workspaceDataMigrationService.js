const Finsemble = require("@finsemble/finsemble-core");

const BaseService = Finsemble.baseService;
const {
	RouterClient,
	Logger,
	StorageClient,
	WorkspaceClient
} = Finsemble.Clients;

Logger.start();

//Migration config
const MIGRATION_NAME = "20220718_linker_to_interop_migration";
const MIGRATION_TEMP_WORKSPACE_NAME = "TEMPORARY MIGRATION WORKSPACE";

//----------------------------------------------------------------------
// Migration functions
//----------------------------------------------------------------------
/**
 * Returns false because window data migration not required

 * @param {*} windowData
 */
const windowMigrationRequired = function (windowData) {
	// TODO: Implement a test  to determine whether a window needs to be migrated here, e.g.
	return false;
}

/**
 * Does nothing because window data migration is not required
 * @param {*} windowData
 */
const migrateWindow = function (windowData) {
	//check if the MIGRATION_SOURCE_FIELD has a value indicating a migration of the windows config is required
	if (windowMigrationRequired(windowData)) {
		//TODO: implement your migration function that will update the window data
		return windowData;
	} else {
		return false;
	}
}

/**
 * Detects if window state data needs to be migrated
 *
 * @param windowState
 * @returns {boolean}
 */
const stateMigrationRequired = function (windowState) {
	// It needs to be migrated if it has linker data
	return !!windowState["Finsemble_Linker"]
}

/**
 * Migrates the state
 *
 * @param windowState
 * @returns {boolean|*}
 */
const migrateState = function (windowState) {
	/**
	 * Make changes here to modify the mapping from linker groups to interop channels
	 *
	 */
	const mapping = {
		group1: "Channel 1",
		group2: "Channel 2",
		group3: "Channel 3",
		group4: "Channel 4",
		group5: "Channel 5",
		group6: "Channel 6",
		group7: "Channel 7",
		group8: "Channel 8",
	}

	if (stateMigrationRequired(windowState)) {
		const interopState = []
		if (Array.isArray(windowState["Finsemble_Linker"])) {
			for (const channel of windowState["Finsemble_Linker"]) {
				if (mapping[channel]) {
					interopState.push(mapping[channel]);
				}
			}
		} else {
			for (const channel in windowState["Finsemble_Linker"]) {
				if (windowState["Finsemble_Linker"][channel] && mapping[channel]) {
					interopState.push(mapping[channel]);
				}
			}
		}

		windowState["Interop-#Linker-linkedChannels"] = interopState;
		delete windowState["Finsemble_Linker"];
		return windowState;
	} else {
		return false
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
const migrateWorkspace = function (workspaceName, workspaceData) {
	let madeChanges = false;
	let workspaceObj = workspaceData[workspaceName];


	//migrate each window in the workspace and determine if any changes were made
	for (let w = 0; w < workspaceObj.windows.length; w++) {

		//lookup the new componentType for the window somehow - probably using the old window name
		let windowName = workspaceObj.windows[w];
		let migratedWindow = migrateWindow(workspaceObj.windowData[w]);
		if (migratedWindow) {
			workspaceObj.windowData[w] = migratedWindow;
			madeChanges = true;
		}
	}

	// Migrate the component state for each window
	for (const w of Object.keys(workspaceObj.componentStates)) {
		//lookup the new componentType for the window somehow - probably using the old window name
		let componentState = workspaceObj.componentStates[w];
		let migratedState = migrateState(componentState);
		if (migratedState) {
			workspaceObj.componentStates[w] = migratedState;
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
const runMigration = async () => {
	const promiseSet = [];

	let activeWorkspace = "Default Workspace";
	let response
	//getcurrent workspace name
	try {
		response = await WorkspaceClient.getActiveWorkspace();
	} catch (err) {
		Logger.error("*** Migration error: error occurred when retrieving the active workspace", err);
		StorageClient.save({
			topic: "finsemble",
			key: `${MIGRATION_NAME}_ERROR`,
			value: "Migration error: " + JSON.stringify(err)
		});
		RouterClient.publish("Migration", "error");
	}

	if (response.data && response.data.name) {
		activeWorkspace = response.data.name;
		Logger.log("*** Got active workspace: ", activeWorkspace);

		let createResponse;
		try {
			createResponse = await WorkspaceClient.createWorkspace(MIGRATION_TEMP_WORKSPACE_NAME, {switchAfterCreation: true});
		} catch (err) {
			Logger.error("*** Migration error: error occurred when creating a temporary workspace for the migration", err);
			StorageClient.save({
				topic: "finsemble",
				key: `${MIGRATION_NAME}_ERROR`,
				value: "Migration error: error occurred when creating a temporary workspace for the migration: " + JSON.stringify(err)
			});
			RouterClient.publish("Migration", "error");
		}

		if (createResponse) {
			//get all workspace names
			const workspaces = await WorkspaceClient.getWorkspaces();
			Logger.log("*** Got workspaces", workspaces);
			workspaces.forEach(workspace => {
				Logger.log("*** migrating " + workspace.name);
				//export and migrate each workspace
				promiseSet.push(new Promise((resolve, reject) => {
					WorkspaceClient.export({'workspaceName': workspace.name}, (err, workspaceDefinition) => {
						if (err) {
							reject(new Error(err));
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

			await Promise.all(promiseSet).catch((err) => {
				Logger.error("*** Migration error occurred during migration: ", err);
				StorageClient.save({
					topic: "finsemble",
					key: `${MIGRATION_NAME}_ERROR`,
					value: "Migration error: error occurred during migration: " + JSON.stringify(err)
				});
				RouterClient.publish("Migration", "error");
			});
			await completeMigration(activeWorkspace);
		}
	}
}

/**
 * Mark the migration completed.
 */
const completeMigration = async (activeWorkspace) => {
	//complete migration
	await StorageClient.save({topic: "finsemble", key: `${MIGRATION_NAME}`, value: Date.now()});
	RouterClient.publish("Migration", "end");
	Logger.log("*** Migration complete");

	//reload the activeWorkspace
	await WorkspaceClient.switchTo({name: activeWorkspace}).catch(err => {
		Logger.error("*** Migration error: on final switch to active workspace: ", err);
	});
	await WorkspaceClient.remove({name: MIGRATION_TEMP_WORKSPACE_NAME})
		.catch(err => {
			Logger.error("*** Migration error: on final removal of temp workspace: ", err);
		});
}

/**
 * Determines if the user's data has been migrated by checking for a key in storage service of
 * "<date>_<migration_desc>",
 * which in this example is "20220718_linker_to_interop_migration".
 */
const fetchUserStatus = async function () {
	try {
		const data = await StorageClient.get({topic: "finsemble", key: `${MIGRATION_NAME}`});
		if (!data) {
			await runMigration();
		}
	} catch (err) {
		Logger.log(`*** Error fetching the user migration status for migration ${MIGRATION_NAME}.`);
	} //else skip migration
}


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

dms.onBaseServiceReady(async (callback) => {
	let ranMigrationCheck = false; //to make sure we only do this once, as technically auth can be run multiple times

	RouterClient.subscribe("AuthorizationState", function (err, notify) {
		if (err) {
			Logger.error("*** workspacemigration failed to auth");
		} else {
		}
	})

	if (!ranMigrationCheck) {
		console.log("Running check")
		ranMigrationCheck = true;
		await fetchUserStatus();
		callback();
	}
});

dms.start();
// module.exports = dms;
