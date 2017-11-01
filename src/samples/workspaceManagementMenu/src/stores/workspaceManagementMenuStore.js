/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
* The workspace management menu may be the most complicated component that we have (other than the toolbar). It isn't because workspace management is particularly difficult, it's because there is a lot of user question and answer going on. We don't want to overwrite data without explicit consent, and so the calls get involved. To simplify the code, we are using the `async` library. If you are unfamiliar with this library, see this link: https://caolan.github.io/async/docs.html
*/
import async from "async";
//When a user cancels the save workspace dialog, we throw an error, which short-circuits the async call.
const SAVE_DIALOG_CANCEL_ERROR = "Cancel";
let WorkspaceManagementStore, Actions, WindowClient, StoreClient, Logger, ToolbarStore, WorkspaceManagementGlobalStore;
//Initial data for the store.
let defaultData = {
	activeWorkspace: {},
	menuWidth: 285,
	pins: [],
	WorkspaceList: [],
	newWorkspaceDialogIsActive: false
};
let finWindow = fin.desktop.Window.getCurrent();
Actions = {
	initialize: function () {
		//Gets the workspace list and sets the value in the store.
		FSBL.Clients.WorkspaceClient.getWorkspaces(function (err, workspaces) {
			WorkspaceManagementStore.setValue({ field: "WorkspaceList", value: workspaces });
		});

		//Get the activeWorkspace and set the value. I could have iterated through the workspaces above and found the active one, but this seems simpler.
		FSBL.Clients.WorkspaceClient.getActiveWorkspace(function (err, activeWorkspace) {
			WorkspaceManagementStore.setValue({ field: "activeWorkspace", value: activeWorkspace });
		});

		/**
		 * We listen here for any workspace updates, and pass them to the store.
		 * **NOTE**: You may notice that the signature of this callback is different from the previous ones. In this case we receive a `response`, instead of `workspaces` or `activeWorkspace`. This is because this callback is for a `RouterClient` message. The functions above are callbacks to `WorkspaceClient` API calls.
		 */
		FSBL.Clients.RouterClient.subscribe("Finsemble.WorkspaceService.update", function (err, response) {
			if (response.data && response.data.activeWorkspace) {
				WorkspaceManagementStore.setValue({ field: "activeWorkspace", value: response.data.activeWorkspace });
				WorkspaceManagementStore.setValue({ field: "WorkspaceList", value: response.data.workspaces });
			}
		});

		WorkspaceManagementGlobalStore.Dispatcher.register(function (action) {
			switch (action.actionType) {
			case "switchToWorkspace":
				Actions.switchToWorkspace(action.data);
				break;
			}

		});
	},

	/*********************************************************************************************
	 *
	 *								GETTERS/SETTERS
	 *
	 *********************************************************************************************/
	getActiveWorkspace: function () {
		return WorkspaceManagementStore.getValue("activeWorkspace");
	},
	getPins: function () {
		return WorkspaceManagementStore.getValue("pins");
	},
	getWorkspaceBeingEdited: function () {
		return WorkspaceManagementStore.getValue("workspaceBeingEdited");
	},
	getWorkspaceList: function () {
		return WorkspaceManagementStore.getValue("WorkspaceList");
	},
	setPins: function (pins) {
		if (pins) {
			let pinnedWorkspaces = [];
			for (var i in pins) {
				let item = pins[i];
				if (item && item.type === "workspaceSwitcher") {
					pinnedWorkspaces.push(item);
				}
			}
			WorkspaceManagementStore.setValue({ field: "pins", value: pinnedWorkspaces });
		}

	},
	/**
	 * Sets the height of the menu.
	 */
	setHeight: function () {
		FSBL.Clients.WindowClient.fitToDOM();
	},
	/*********************************************************************************************
	 *
	 *								Main Workspace Actions
	 *
	 *********************************************************************************************/
	/**
	 * Handles the complete workflow for creating a new workspace.
	 * We make sure the user doesn't lose any unsaved work, ask them to name it, make sure that workspace doesn't already exist, then actually save the new workspace. After that, we fire off a notification to let them know that everything was a great success.
	 */
	newWorkspace: function () {
		let newWorkspaceName;
		Logger.system.log("New Workspace - start.");
		let newWorkspaceDialogIsActive = WorkspaceManagementStore.getValue("newWorkspaceDialogIsActive");
		let activeWorkspace = WorkspaceManagementStore.getValue("activeWorkspace");

		//Creates the new workspace.
		function createIt(name, cb) {
			Logger.system.log("Create New Workspace - start.");
			FSBL.Clients.WorkspaceClient.createNewWorkspace(name, function (err, response) {
				Logger.system.log("New Workspace - End.");
				newWorkspaceName = response.name;
				if (cb) {
					cb(null, newWorkspaceName);
				}
			});
		}

		if (!newWorkspaceDialogIsActive) {
			WorkspaceManagementStore.setValue({ field: "newWorkspaceDialogIsActive", value: true });
		} else {
			Actions.blurWindow();
		}

		async.waterfall([
			Actions.askIfUserWantsToSave,
			Actions.handleSaveDialogResponse,
			Actions.spawnWorkspaceInputField,
			Actions.checkIfWorkspaceAlreadyExists,
			createIt,
			Actions.notifyUserOfNewWorkspace
		], Actions.onAsyncComplete);

	},
	/**
	 * Handles the workflow for removing a workspace.
	 * As long as you are not deleting the workspace that is active, it will pop up a confirm dialog, and if the user says "yes", it will delete the workspace.
	 * @todo allow the user to delete the active workspace?
	 * @param {object} workspace workspace object.
	 */
	removeWorkspace: function (workspace) {
		let workspaceName = workspace.name;
		//don't allow user to delete active workspace.
		if (FSBL.Clients.WorkspaceClient.activeworkspaceName === workspaceName) {
			let dialogParams = {
				question: "Workspace cannot be deleted while it is in use. Please switch workspaces and try again.",
				affirmativeResponseText: "OK",
				includeNegative: false,
				includeCancel: false
			};
			return Actions.spawnDialog("yesNo", dialogParams);
		}

		let dialogParams = {
			question: "Are you sure you want to delete the workspace \"" + workspaceName + "\"?",
			includeCancel: false
		};

		/**
		 * Invoked when the user interacts with the dialog.
		 */
		function onUserInput(err, response) {
			if (response.choice === "affirmative") {
				if (Actions.isPinned(workspaceName)) {
					Actions.removePin(workspaceName);
					let thePin = {
						type: "workspaceSwitcher",
						label: workspaceName
					};
					FSBL.Clients.RouterClient.transmit("Toolbar.pinsUpdate", {
						pin: thePin,
						change: "remove"
					});
				}
				FSBL.Clients.WorkspaceClient.remove({
					name: workspaceName
				});
			}
		}

		Actions.spawnDialog("yesNo", dialogParams, onUserInput);
	},
	/**
	 * The `activeWorkspace` is simply a copy of something we brought out of storage. This function copies the `activeWorkspace` to back to storage.
	 */
	saveWorkspace: function (cb) {
		let activeWorkspace = WorkspaceManagementStore.getValue("activeWorkspace");
		FSBL.Clients.WorkspaceClient.saveAs({
			force: true,
			name: activeWorkspace.name
		}, function (err, response) {
			if (cb) {
				cb();
			}
		});
	},
	/**
	 * Ask the user for a name, make sure it doesn't already exist, then save.
	 */
	saveWorkspaceAs: function () {
		function saveIt(workspaceName, callback) {
			FSBL.Clients.WorkspaceClient.saveAs({
				name: workspaceName,
				force: true
			}, function (err, response) {
				callback(err, response);
			});
		}

		Logger.system.log("SaveWorkspaceAs clicked.");

		async.waterfall([
			Actions.spawnWorkspaceInputField,
			Actions.validateWorkspaceInput,
			Actions.checkIfWorkspaceAlreadyExists,
			saveIt,
		], Actions.onAsyncComplete);
	},
	/**
	 * Asks the user if they'd like to save their data, then loads the requested workspace.
	 */
	switchToWorkspace: function (data) {
		Actions.hideWindow();
		let name = data.name;
		let activeWorkspace = WorkspaceManagementStore.getValue("activeWorkspace");
		/**
		 * Actually perform the switch. Happens after we ask the user what they want.
		 *
		 */
		function switchIt() {
			FSBL.Clients.WorkspaceClient.switchTo({
				name: name
			});
		}
		/**
		 * Make sure the user wants to do what they say that they want to do.
		 * @param {any} callback
		 */
		function askAboutReload(callback) {
			Actions.spawnDialog("yesNo", { question: "You are about to reload this workspace. Do you wish to save your changes?" }, callback);
		}

		/**
		 * If the workspace is dirty, we need to do more than if it's clean. We don't want users to lose unsaved work.
		 */
		if (activeWorkspace.isDirty) {
			//We want to ask the user to save. But if they're trying to reload the workspace, the mssage needs to be different. The first if block just switches that method.
			let firstMethod = Actions.askIfUserWantsToSave;
			if (name === FSBL.Clients.WorkspaceClient.activeWorkspace.name) {
				firstMethod = askAboutReload;
			}
			async.waterfall([
				firstMethod,
				Actions.handleSaveDialogResponse,
				switchIt
			], Actions.onAsyncComplete);
		} else {
			switchIt();
		}
	},

	/*********************************************************************************************
	 *
	 *								Workspace Management Helpers
	 *
	 *********************************************************************************************/
	/**
	 * General handler for `async.series` and `async.waterfall`.
	 * @todo display errors to the user??
	 *
	 * @param {any} err
	 * @param {any} result
	 */
	onAsyncComplete(err, result) {
		WorkspaceManagementStore.setValue({ field: "newWorkspaceDialogIsActive", value: false });
		if (err && err !== SAVE_DIALOG_CANCEL_ERROR) {
			//handle error.
			Logger.system.error(err);
		}
	},
	/**
	 * NOTE: Leaving this function here until we figure out notifications.
	 */
	notifyUserOfNewWorkspace: function () {
		//@todo, notify. This is just a placeholder for now.
	},
	/**
	 * Helper for spawning dialogs. Keeps the internals of other functions squeaky clean.
	 *
	 * @param {string} type "yesNo" or "singleInput"
	 * @param {object} data Optional params for the dialog call.
	 * @param {function} responseCallback invoked when the user interacts with the dialog.
	 * @param {function} spawnCallback invoked when the dialog is created.
	 */
	spawnDialog(type, data, responseCallback, spawnCallback) {
		Logger.system.verbose("ShowWindow WorkspaceManagementMenu start");
		FSBL.Clients.DialogManager.open(type, data, responseCallback);
	},
	/**
	 * Spawns an input field asking what the user would like to name their new workspace.
	 */
	spawnWorkspaceInputField: function (cb) {
		//Spawns the dialog with the input field and accepts a callback to be invoked after the user acts.
		Logger.system.log("SpawnWorkspaceInput - start");
		function onUserInput(err, response) {
			Logger.system.log("SpawnWorkspaceInput - Finish");
			if (err) {
				//Error objects cause async to invoke the final callback in async.waterfall.
				err = new Error(err);
			}
			if (cb) {
				cb(err, response);
			}
		}

		let dialogParams = {
			inputLabel: "Enter a name for your new workspace.",
			affirmativeButtonLabel: "Continue",
			includeCancel: false,
			includeNegative: false
		};

		Actions.spawnDialog("singleInput", dialogParams, onUserInput);
	},
	/**
	 * Asks the user if they'd like to save their workspace if it's different from what's in storage. If the workspace is clean, we just invoke the callback.
	 */
	askIfUserWantsToSave: function (callback) {
		let activeWorkspace = WorkspaceManagementStore.getValue("activeWorkspace");
		if (activeWorkspace.isDirty) {
			Logger.system.log("NewWorkspace.spawnDialog start.");
			let dialogParams = { question: `Your workspace "${activeWorkspace.name}" has unsaved changes, would you like to save?` };
			function onUserInput(err, response) {
				Logger.system.log("Spawn Dialog callback.");
				callback(null, response);
			}
			Actions.spawnDialog("yesNo", dialogParams, onUserInput);
		} else {
			//In this case the workspace is not dirty, so we don't need to save.
			callback(null, { choice: "negative" });
		}
	},
	/**
	 * Handles the response from the dialog asking if the user wants to save their workspace.
	 *
	 * @param {any} response
	 * @param {any} callback
	 */
	handleSaveDialogResponse(response, callback) {
		if (response.choice === "affirmative") {
			//User wants to save, so call the client API.
			Actions.saveWorkspace(callback);
		} else if (response.choice === "negative") {
			//Doesn't want to save.
			callback();
		} else {
			//choice === cancel
			callback(SAVE_DIALOG_CANCEL_ERROR);
		}
	},
	/**
	 * Makes sure the user has input a valid workspace name.
	 *
	 * @param {any} response
	 * @param {any} callback
	 * @returns
	 */
	validateWorkspaceInput(response, callback) {
		Logger.system.log("spawnWorkspaceInput callback.");
		//If user wants to proceed but gave an invalid name, tell them that they messed up, then die.
		//@todo, look in to using async.retry - we could throw an error and start the whole process over again.
		if (response.choice !== "cancel" && (!response.value || response.value === "")) {
			let dialogParams = {
				question: "Invalid workspace name. Please try again.",
				affirmativeResponseText: "OK",
				includeNegative: false,
				includeCancel: false
			};
			Actions.spawnDialog("yesNo", dialogParams);
			return callback(new Error("Invalid workspace name."));
		}
		callback(null, response);
	},
	/**
	 * Checks if the workspace exists. If it does, it asks the user if they're comfortable overwriting that data.
	 *
	 * @param {any} response
	 * @param {any} callback
	 */
	checkIfWorkspaceAlreadyExists(response, callback) {
		let workspaceName = response.value;
		//Array.some will return true for the first element in the array that satisfies the condition. If none are true, it'll go through the entire array. It's essentially a way to short-circuit a for loop. This lets us know if any workspace has the same name that the user is trying to input.
		let workspaceExists = FSBL.Clients.WorkspaceClient.workspaces.some(workspace => {
			return workspace.name === workspaceName;
		});
		if (workspaceExists) {
			let dialogParams = {
				question: "This will overwrite the saved data for workspace \"" + workspaceName + "\". Would you like to proceed?",
				affirmativeResponseText: "Yes, overwrite",
				includeNegative: "No, cancel",
				includeCancel: false
			};
			/**
			 * Invoked when the user interacts with the dialog.
			 */
			function onUserInput(err, response) {
				if (response.choice === "affirmative") {
					callback(null, workspaceName);
				} else {
					callback(new Error("Negative"));
				}
			}
			Actions.spawnDialog("yesNo", dialogParams, onUserInput);
		} else {
			callback(null, workspaceName);
		}
	},
	/*********************************************************************************************
	 *
	 *								Misc functionality
	 *
	 *********************************************************************************************/
	/**
	 * Whether the workspace is pinned to the toolbar.
	 */
	isPinned: function (name) {
		let pins = Actions.getPins();
		//Array.some will return true for the first element in the array that satisfies the condition. If none are true, it'll go through the entire array. It's essentially a way to short-circuit a for loop.
		return pins.some(pin => pin.label === name);
	},
	/**
	 * Unpins the workspace from the toolbars.
	 */
	removePin: function (name) {
		ToolbarStore.removeValue({ field: "pins." + name });
	},
	/**
	 * If the workspace is pinned, it unpins the workspace. Otherwise, we pin it to the toolbar.
	 */
	togglePin: function (workspace) {
		let workspaceName = workspace.name;
		//toggles the pinned state of the component. This change will be broadcast to all toolbars so that the state changes in each component.
		let pins = Actions.getPins();
		let thePin = {
			type: "workspaceSwitcher",
			label: workspaceName,
			toolbarSection: 'center'
		};
		let wasAlreadyPinned = Actions.isPinned(workspaceName);

		if (wasAlreadyPinned) {
			ToolbarStore.removeValue({ field: "pins." + workspaceName });
		} else {
			FSBL.Clients.Logger.perf.log("TogglePin");
			ToolbarStore.setValue({ field: "pins." + workspaceName, value: thePin });
		}
	},
	/**
	 * Unfocuses from the menu.
	 */
	blurWindow: function () {
		finWindow.blur();
	},
	/**
	 * Hides the window.
	 */
	hideWindow: function () {
		Logger.system.log("Before Hide");
		finWindow.hide(function () {
			Logger.system.log("Hide callback");
		});
	},
};

function createLocalStore(done) {
	StoreClient.createStore({ store: "Finsemble-WorkspaceMenu-Local-Store", values: defaultData }, function (err, store) {
		WorkspaceManagementStore = store;
		done();
	});
}

function createGlobalStore(done) {
	StoreClient.createStore({ store: "Finsemble-WorkspaceMenu-Global-Store", global: true }, function (err, store) {
		WorkspaceManagementGlobalStore = store;
		done();
	});
}

function getToolbarStore(done) {
	StoreClient.getStore({ global: true, store: "Finsemble-Toolbar-Store" }, function (err, store) {
		ToolbarStore = store;
		store.getValue({ field: "pins" }, function (err, pins) {
			if (pins) Actions.setPins(pins.value);
		});

		store.addListener({ field: "pins" }, function (err, pins) {
			if (pins) Actions.setPins(pins.value);
		});
		done();
	});
}

/**
 * Initializes the store for the Workspace Management Menu.
 *
 * @param {any} cb
 */
function initialize(cb) {
	WindowClient = FSBL.Clients.WindowClient;
	StoreClient = FSBL.Clients.DistributedStoreClient;
	Logger = FSBL.Clients.Logger;
	async.parallel(
		[createGlobalStore, createLocalStore, getToolbarStore],
		function () {
			Actions.initialize();
			cb(WorkspaceManagementStore);
		}
	);


}

let getStore = () => {
	return WorkspaceManagementStore;
};

export { initialize };
export { WorkspaceManagementStore as Store };
export { Actions };
export { getStore };