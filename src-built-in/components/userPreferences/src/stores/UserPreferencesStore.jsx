const async = require('async');

var UserPreferencesStore, WorkspaceManagementMenuStore;

let updateConstants;

var Actions = {
	initialize: function () {
		FSBL.Clients.WorkspaceClient.getWorkspaceActions(function (err, constants) {
			updateConstants = constants;
		});

		FSBL.Clients.ConfigClient.getPreferences(function (err, data) {
			UserPreferencesStore.setValue({ field:'preferences', value: data });
		});

		//Gets the workspace list and sets the value in the store.
		FSBL.Clients.WorkspaceClient.getWorkspaces(function (err, workspaces) {
			UserPreferencesStore.setValue({ field: "WorkspaceList", value: workspaces });
		});

		//Get the activeWorkspace and set the value. I could have iterated through the workspaces above and found the active one, but this seems simpler.
		FSBL.Clients.WorkspaceClient.getActiveWorkspace(function (err, activeWorkspace) {
			UserPreferencesStore.setValue({ field: "activeWorkspace", value: activeWorkspace });
		});

		/**
		 * We listen here for any workspace updates, and pass them to the store.
		 * **NOTE**: You may notice that the signature of this callback is different from the previous ones. In this case we receive a `response`, instead of `workspaces` or `activeWorkspace`. This is because this callback is for a `RouterClient` message. The functions above are callbacks to `WorkspaceClient` API calls.
		 */
		FSBL.Clients.RouterClient.subscribe("Finsemble.WorkspaceService.update", function (err, response) {
			if (response.data && response.data.activeWorkspace) {
				UserPreferencesStore.setValue({ field: "activeWorkspace", value: response.data.activeWorkspace });
				if (updateConstants) {
					switch (response.data.reason) {
						case updateConstants.GET_ACTIVE_WORKSPACE:
						case updateConstants.NEW_WORKSPACE:
						case updateConstants.IMPORT:
						case updateConstants.SAVE:
						case updateConstants.SAVE_AS:
						case updateConstants.REMOVE:
						case updateConstants.SWITCH_TO:
						case updateConstants.SET_WORKSPACE_ORDER:
						case updateConstants.ADD_WINDOW:
						case updateConstants.REMOVE_WINDOW:
						case updateConstants.RENAME:
							Actions.getWorkspaces();
							break;
						default:
							break;
					}
				}
			}
		});
	},
	getWorkspaces(cb = Function.prototype) {
		//Gets the workspace list and sets the value in the store.
		FSBL.Clients.WorkspaceClient.getWorkspaces(function (err, workspaces) {
			UserPreferencesStore.setValue({ field: "WorkspaceList", value: workspaces });
		});
	},
	exportWorkspace: function (selectedWorkspace) {
		var workspaceName; // ************* needs to be set to selected workspace **********************
        FSBL.Clients.WorkspaceClient.getWorkspaceDefinition(workspaceName, function (err, workspaceDefinition) {
            var newTemplateDefinition = FSBL.Clients.WorkspaceClient.convertWorkspaceDefinitionToTemplate("templateX", workspaceDefinition);
            FSBL.Clients.WorkspaceClient.saveWorkspaceTemplateToConfigFile(newTemplateDefinition);
        });
	},
	importTemplate: function () {
		var newTemplateJSONDefinition; // ************* needs to be initialized from file input **********************
        FSBL.Clients.WorkspaceClient.addWorkspaceTemplateDefinition(newTemplateJSONDefinition, { force: true }, function (err) {
           //console.log("addWorkspaceTemplateDefinition result", err);
        });
	},
	/**
	 * By making the value of `finsemble.scheduledRestart` falsy, the application will remove any existing restart timers.
	 */
	disableScheduledRestart: () => {
		FSBL.Clients.ConfigClient.setPreference({
			field: "finsemble.scheduledRestart",
			value: false
		});
	},
	/** Finsemble listens for this piece of config. When it changes, it will schedule a daily restart at that time. */
	setScheduledRestart: (val) => {
		FSBL.Clients.ConfigClient.setPreference({
			field: "finsemble.scheduledRestart",
			value: val
		})
	}
};

function createLocalStore(done) {
	FSBL.Clients.DistributedStoreClient.createStore({ store: "Finsemble-UserPreferences-Local-Store" }, function (err, store) {
		UserPreferencesStore = store;
		module.exports.Store = store;
		done();
	});
}

/**
 * Initializes the store for the User Preferences Menu.
 *
 * @param {any} cb
 */
function initialize(WorkspaceManagementMenuStore, cb) {
	WorkspaceManagementMenuStore = WorkspaceManagementMenuStore;
	module.exports.WorkspaceManagementMenuStore = WorkspaceManagementMenuStore;
	async.series(
		[
			createLocalStore
		],
		function () {
			Actions.initialize();
			cb(UserPreferencesStore);
		}
	);


}

module.exports.WorkspaceManagementMenuStore = WorkspaceManagementMenuStore;
module.exports.initialize = initialize;
module.exports.Store = UserPreferencesStore;
module.exports.Actions = Actions;