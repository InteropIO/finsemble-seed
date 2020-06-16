/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 * The workspace management menu may be the most complicated component that we have (other than the toolbar). It isn't because workspace management is particularly difficult, it's because there is a lot of user question and answer going on. We don't want to overwrite data without explicit consent, and so the calls get involved. To simplify the code, we are using the `async` library. If you are unfamiliar with this library, see this link: https://caolan.github.io/async/docs.html
 */
import async from "async";
//When a user cancels the save workspace dialog, we throw an error, which short-circuits the async call.
const SAVE_DIALOG_CANCEL_ERROR = "Cancel";
const NEGATIVE = "Negative";
let PROMPT_ON_SAVE = false;
let WorkspaceManagementStore,
	Actions,
	WindowClient,
	StoreClient,
	Logger,
	ToolbarStore,
	WorkspaceManagementGlobalStore;
//Initial data for the store.
let defaultData = {
	activeWorkspace: {},
	menuWidth: 285,
	pins: [],
	WorkspaceList: [],
	newWorkspaceDialogIsActive: false,
	/**
	 * State around whether the workspace is currently in the process of switching.
	 *
	 * For simplicity, we're storing this in the local store for now, but this precludes
	 * other components from signaling that the workspace is changing. A consequence,
	 * for example, is that if you switch workspaces uses a pin on the toolbar instead
	 * of the workspace management menu, the spinner doesn't show up.
	 */
	isSwitchingWorkspaces: false,
	isPromptingUser: false,
};

function uuidv4() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		var r = (Math.random() * 16) | 0,
			v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

Actions = {
	autoSave: (callback) => {
		let activeName = FSBL.Clients.WorkspaceClient.activeWorkspace.name;
		if (!PROMPT_ON_SAVE) {
			FSBL.Clients.WorkspaceClient.saveAs(
				{
					name: activeName,
					force: true,
				},
				(err, response) => {
					callback(err);
				}
			);
		} else {
			callback(null);
		}
	},
	initialize: function() {
		//Gets the workspace list and sets the value in the store.
		FSBL.Clients.WorkspaceClient.getWorkspaces((err, workspaces) => {
			Logger.system.debug(
				"WorkspaceManagementStore init getWorkspaces",
				workspaces
			);
			WorkspaceManagementStore.setValue({
				field: "WorkspaceList",
				value: workspaces,
			});
		});

		//Get the activeWorkspace and set the value. I could have iterated through the workspaces above and found the active one, but this seems simpler.
		FSBL.Clients.WorkspaceClient.getActiveWorkspace((err, activeWorkspace) => {
			Logger.system.debug(
				"WorkspaceManagementStore init getActiveWorkspace",
				activeWorkspace
			);
			WorkspaceManagementStore.setValue({
				field: "activeWorkspace",
				value: activeWorkspace,
			});
		});

		/**
		 * We listen here for any workspace updates, and pass them to the store.
		 * **NOTE**: You may notice that the signature of this callback is different from the previous ones. In this case we receive a `response`, instead of `workspaces` or `activeWorkspace`. This is because this callback is for a `RouterClient` message. The functions above are callbacks to `WorkspaceClient` API calls.
		 */
		FSBL.Clients.RouterClient.subscribe(
			"Finsemble.WorkspaceService.update",
			(err, response) => {
				if (response.data && response.data.activeWorkspace) {
					Logger.system.debug(
						"WorkspaceManagementStore init update",
						response.data
					);
					WorkspaceManagementStore.setValue({
						field: "activeWorkspace",
						value: response.data.activeWorkspace,
					});
					WorkspaceManagementStore.setValue({
						field: "WorkspaceList",
						value: response.data.workspaces,
					});
				}
			}
		);
		WorkspaceManagementGlobalStore.getValue({ field: "owner" }, (err, data) => {
			if (data !== finsembleWindow.name) return;
			WorkspaceManagementGlobalStore.Dispatcher.register((action) => {
				switch (action.actionType) {
					case "switchToWorkspace":
						Logger.system.debug(
							"WorkspaceManagementStore switchToWorkspace",
							action.data
						);
						Actions.switchToWorkspace(action.data);
						break;
					case "reorderWorkspace":
						Logger.system.debug(
							"WorkspaceManagementStore reorderWorkspace",
							action.data
						);
						Actions.reorderWorkspaceList(action.data);
						break;
					case "removeWorkspace":
						Logger.system.debug(
							"WorkspaceManagementStore removeWorkspace",
							action.data
						);
						Actions.removeWorkspace(action.data);
						break;
					case "renameWorkspace":
						Logger.system.debug(
							"WorkspaceManagementStore renameWorkspace",
							action.data
						);
						Actions.renameWorkspace(action.data);
						break;
				}
			});
		});
	},

	/*********************************************************************************************
	 *
	 *								GETTERS/SETTERS
	 *
	 *********************************************************************************************/
	getActiveWorkspace: function() {
		return WorkspaceManagementStore.getValue("activeWorkspace");
	},
	getPins: function() {
		return WorkspaceManagementStore.getValue("pins");
	},
	getWorkspaceBeingEdited: function() {
		return WorkspaceManagementStore.getValue("workspaceBeingEdited");
	},
	getWorkspaceList: function() {
		return WorkspaceManagementStore.getValue("WorkspaceList");
	},
	getIsSwitchingWorkspaces: function() {
		return WorkspaceManagementStore.getValue("isSwitchingWorkspaces");
	},
	setIsSwitchingWorkspaces: function(val) {
		return WorkspaceManagementStore.setValue({
			field: "isSwitchingWorkspaces",
			value: val,
		});
	},
	getIsPromptingUser: function() {
		return WorkspaceManagementStore.getValue("isPromptingUser");
	},
	setIsPromptingUser: function(val) {
		return WorkspaceManagementStore.setValue({
			field: "isPromptingUser",
			value: val,
		});
	},
	setPins: function(pins) {
		if (pins) {
			let pinnedWorkspaces = [];
			for (var i in pins) {
				let item = pins[i];
				if (item && item.type === "workspaceSwitcher") {
					pinnedWorkspaces.push(item);
				}
			}
			WorkspaceManagementStore.setValue({
				field: "pins",
				value: pinnedWorkspaces,
			});
		}
	},
	/**
	 * Sets the height of the menu.
	 */
	setHeight: function() {
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
	newWorkspace: function() {
		let newWorkspaceName;
		Logger.system.log("New Workspace - start.");
		let newWorkspaceDialogIsActive = WorkspaceManagementStore.getValue(
			"newWorkspaceDialogIsActive"
		);
		let activeWorkspace = WorkspaceManagementStore.getValue("activeWorkspace");

		//Creates the new workspace.
		function createIt(params, cb) {
			Logger.system.log("createIt", params);
			let { workspaceName, template } = params;
			FSBL.Clients.WorkspaceClient.createNewWorkspace(
				workspaceName,
				{ templateName: template },
				(err, response) => {
					Logger.system.log(
						"createIt createNewWorkspace response",
						workspaceName,
						template,
						response
					);
					newWorkspaceName = response.workspaceName;
					if (cb) {
						cb(null, newWorkspaceName);
					}
				}
			);
		}

		if (!newWorkspaceDialogIsActive) {
			WorkspaceManagementStore.setValue({
				field: "newWorkspaceDialogIsActive",
				value: true,
			});
		}

		Actions.blurWindow();
		let tasks = [
			Actions.autoSave,
			Actions.spawnWorkspaceInputField,
			Actions.validateWorkspaceInput,
			Actions.checkIfWorkspaceAlreadyExists,
			Actions.askIfUserWantsNewWorkspace,
			createIt,
			Actions.notifyUserOfNewWorkspace,
		];
		if (PROMPT_ON_SAVE) {
			tasks = [
				Actions.askIfUserWantsToSave,
				Actions.handleSaveDialogResponse,
			].concat(tasks);
		}
		async.waterfall(tasks, Actions.onAsyncComplete);
	},
	/**
	 * Handles the workflow for removing a workspace.
	 * As long as you are not deleting the workspace that is active, it will pop up a confirm dialog, and if the user says "yes", it will delete the workspace.
	 * @todo allow the user to delete the active workspace?
	 * @param {object} workspace workspace object.
	 */
	removeWorkspace: function(data) {
		let workspaceName = data.name;
		//don't allow user to delete active workspace.
		if (FSBL.Clients.WorkspaceClient.activeworkspaceName === workspaceName) {
			let dialogParams = {
				question:
					"Workspace cannot be deleted while it is in use. Please switch workspaces and try again.",
				affirmativeResponseLabel: "OK",
				showNegativeButton: false,
				showCancelButton: false,
				hideModalOnClose: data.hideModalOnClose,
			};
			return Actions.spawnDialog("yesNo", dialogParams);
		}

		let dialogParams = {
			title: "Delete this workspace?",
			question: `Are you sure you want to delete the workspace "${workspaceName}"?`,
			showNegativeButton: false,
			affirmativeResponseLabel: "Delete",
			hideModalOnClose: data.hideModalOnClose,
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
						label: workspaceName,
					};
					FSBL.Clients.RouterClient.transmit("Toolbar.pinsUpdate", {
						pin: thePin,
						change: "remove",
					});
				}
				FSBL.Clients.WorkspaceClient.remove({
					name: workspaceName,
				});
			}
		}
		Actions.spawnDialog("yesNo", dialogParams, onUserInput);
	},
	/**
	 * The `activeWorkspace` is simply a copy of something we brought out of storage. This function copies the `activeWorkspace` to back to storage.
	 */
	saveWorkspace: function(cb) {
		let activeWorkspace = WorkspaceManagementStore.getValue("activeWorkspace");
		FSBL.Clients.WorkspaceClient.saveAs(
			{
				force: true,
				name: activeWorkspace.name,
			},
			(err, response) => {
				if (cb) {
					cb(err);
				}
			}
		);
	},
	reorderWorkspaceList: function(changeEvent) {
		if (!changeEvent.destination) return;
		let workspaces = JSON.parse(
			JSON.stringify(
				WorkspaceManagementStore.getValue({ field: "WorkspaceList" })
			)
		);
		let workspaceToMove = JSON.parse(
			JSON.stringify(workspaces[changeEvent.source.index])
		);
		workspaces.splice(changeEvent.source.index, 1);
		workspaces.splice(changeEvent.destination.index, 0, workspaceToMove);
		FSBL.Clients.WorkspaceClient.setWorkspaces({
			workspaces: workspaces,
		});
		WorkspaceManagementStore.setValue({
			field: "WorkspaceList",
			value: workspaces,
		});
	},
	renameWorkspace: function({ oldName, newName }) {
		function saveIt(workspaceName, done) {
			if (Actions.isPinned(oldName)) {
				Actions.removePin(oldName);
				let thePin = {
					type: "workspaceSwitcher",
					label: oldName,
				};
				FSBL.Clients.RouterClient.transmit("Toolbar.pinsUpdate", {
					pin: thePin,
					change: "remove",
				});
			}

			FSBL.Clients.WorkspaceClient.rename(
				{
					oldName: oldName,
					newName: workspaceName,
					removeOldWorkspace: true,
					overWriteExistng: true,
				},
				(err, response) => {
					done();
				}
			);
		}
		async.waterfall(
			[
				Actions.checkIfWorkspaceAlreadyExists.bind(null, { value: newName }),
				(result, callback) => {
					if (result.workspaceExists) {
						callback(
							null,
							FSBL.Clients.WorkspaceClient.getWorkspaceName(newName)
						);
					} else {
						callback(null, newName);
					}
				},
				saveIt,
			],
			Actions.onAsyncComplete
		);
	},
	showPreferences: function() {
		FSBL.Clients.LauncherClient.showWindow(
			{
				componentType: "UserPreferences",
			},
			{
				monitor: "mine",
				left: "center",
				top: "center",
			}
		);
	},
	/**
	 * Ask the user for a name, make sure it doesn't already exist, then save.
	 */
	saveWorkspaceAs: function() {
		function saveIt(workspaceName, callback) {
			FSBL.Clients.WorkspaceClient.saveAs(
				{
					name: workspaceName,
					force: true,
				},
				(err, response) => {
					callback(err, response);
				}
			);
		}

		Logger.system.log("SaveWorkspaceAs clicked.");

		async.waterfall(
			[
				Actions.autoSave,
				Actions.spawnSaveAsDialog,
				Actions.validateWorkspaceInput,
				Actions.checkIfWorkspaceAlreadyExists,
				Actions.askAboutOverwrite,
				saveIt,
			],
			Actions.onAsyncComplete
		);
	},
	/**
	 * Asks the user if they'd like to save their data, then loads the requested workspace.
	 */
	switchToWorkspace: function(data) {
		// if a workspace prompt is outstanding for a previous switch, immediately return to lock out user from doing another switch (until responding to prompt);
		// note this prompting flag is cleared in Actions.onAsyncComplete when the previous switch completes (after user responds to the prompt)
		let prompting = Actions.getIsPromptingUser();
		Logger.system.log(
			"workspaceManagementMenuStore: switchToWorkspace",
			prompting ? "prompting" : "not-prompting"
		);
		if (prompting) return;

		Actions.setIsSwitchingWorkspaces(true);
		Actions.blurWindow();
		let { name } = data;
		let activeWorkspace = WorkspaceManagementStore.getValue("activeWorkspace");
		/**
		 * Actually perform the switch. Happens after we ask the user what they want.
		 *
		 * @param {function} callback - invoked on completion of switchTo
		 *
		 */
		function switchWorkspace(callback = Function.prototype) {
			FSBL.Clients.WorkspaceClient.switchTo(
				{
					name: name,
				},
				() => {
					Actions.setIsSwitchingWorkspaces(false);
					callback();
				}
			);
		}
		/**
		 * Make sure the user wants to do what they say that they want to do.
		 * @param {any} callback
		 */
		function askAboutReload(callback) {
			Actions.spawnDialog(
				"yesNo",
				{
					question:
						"You are about to reload this workspace. Do you wish to save your changes?",
				},
				callback
			);
		}

		/**
		 * If the workspace is dirty, we need to do more than if it's clean. We don't want users to lose unsaved work.
		 */
		let tasks = [];
		if (activeWorkspace.isDirty) {
			Actions.setIsPromptingUser(true);
			let firstMethod = Actions.autoSave,
				secondMethod = null;
			if (PROMPT_ON_SAVE === true) {
				//We want to ask the user to save. But if they're trying to reload the workspace, the message needs to be different. The first if block just switches that method.
				firstMethod = Actions.askIfUserWantsToSave;
				if (name === FSBL.Clients.WorkspaceClient.activeWorkspace.name) {
					firstMethod = askAboutReload;
				}
				//If we are not autosaving, we need to process the dialog input.
				secondMethod = Actions.handleSaveDialogResponse;
			}

			//Build the task list.
			tasks = [firstMethod];

			if (secondMethod) {
				tasks.push(secondMethod);
			}

			//Switch is the last thing we do.
			tasks.push(switchWorkspace);

			async.waterfall(tasks, Actions.onAsyncComplete);
		} else {
			switchWorkspace();
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
	 * @param {Error} err
	 * @param {any} result
	 */
	onAsyncComplete(err, result) {
		Logger.system.debug("workspaceManagementMenuStore: onAsyncComplete");

		WorkspaceManagementStore.setValue({
			field: "newWorkspaceDialogIsActive",
			value: false,
		});
		const errMessage = err && err.message;
		if (
			errMessage &&
			errMessage !== NEGATIVE &&
			errMessage !== SAVE_DIALOG_CANCEL_ERROR
		) {
			//handle error.
			Logger.system.error(err);
		}

		//Unlock the UI.
		Actions.setIsSwitchingWorkspaces(false);
		Actions.setIsPromptingUser(false);
	},
	/**
	 * NOTE: Leaving this function here until we figure out notifications.
	 */
	notifyUserOfNewWorkspace: function() {
		//@todo, notify. This is just a placeholder for now.
	},
	/**
	 * Helper for spawning dialogs. Keeps the internals of other functions squeaky clean.
	 *
	 * @param {string} type "yesNo" or "singleInput"
	 * @param {object} data Optional params for the dialog call.
	 * @param {function} responseCallback invoked when the user interacts with the dialog.
	 */
	spawnDialog(type, data, responseCallback) {
		Logger.system.debug("spawnDialog", type, data);
		if (type === "singleInput" || type === "inputAndSelection") {
			data.showCancelButton = true;
		}
		FSBL.Clients.DialogManager.open(type, data, responseCallback);
	},
	spawnSaveAsDialog: function(cb) {
		function onUserInput(err, response) {
			Logger.system.log("SpawnWorkspaceInput onUserInput", response);
			if (err) {
				//Error objects cause async to invoke the final callback in async.waterfall.
				err = new Error(err);
			}
			if (cb) {
				cb(err, response);
			}
		}
		let dialogParams = {
			title: "Enter a name for your new workspace.",
			inputLabel: "Enter a name for your new workspace.",
			affirmativeResponseLabel: "Confirm",
			showCancelButton: false,
			showNegativeButton: false,
		};

		Actions.spawnDialog("singleInput", dialogParams, onUserInput);
	},
	/**
	 * Spawns an input field asking what the user would like to name their new workspace.
	 */
	spawnWorkspaceInputField: function(cb) {
		//Spawns the dialog with the input field and accepts a callback to be invoked after the user acts.
		Logger.system.log("SpawnWorkspaceInput - start");
		function onUserInput(err, response) {
			Logger.system.log("SpawnWorkspaceInput onUserInput", response);
			if (err) {
				//Error objects cause async to invoke the final callback in async.waterfall.
				err = new Error(err);
			}
			if (cb) {
				cb(err, response);
			}
		}

		let dialogParams = {
			title: "Enter a name for your new workspace.",
			inputLabel: "Enter a name for your new workspace.",
			affirmativeResponseLabel: "Confirm",
			showCancelButton: false,
			showNegativeButton: false,
		};

		Actions.spawnDialog("singleInput", dialogParams, onUserInput);
	},
	/**
	 * Asks the user if they'd like to save their workspace if it's different from what's in storage. If the workspace is clean, we just invoke the callback.
	 */
	askIfUserWantsToSave: function(callback) {
		let activeWorkspace = WorkspaceManagementStore.getValue("activeWorkspace");
		if (activeWorkspace.isDirty) {
			Logger.system.log("NewWorkspace.spawnDialog start.");
			let dialogParams = {
				title: "Save your workspace?",
				question: `Your workspace "${activeWorkspace.name}" has unsaved changes. Would you like to save?`,
				affirmativeResponseLabel: "Save",
				negativeResponseLabel: "Don't Save",
			};
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
			Actions.saveWorkspace((err) => {
				if (!err) {
					callback();
				} else {
					Actions.spawnDialog(
						"yesNo",
						{
							question:
								"The workspace save failed. Continuing will lose recent changers to this workspace.  Do you want to continue loading the new workspace?",
						},
						(err, response) => {
							if (response.choice === "affirmative") {
								callback();
							} else {
								callback(new Error(SAVE_DIALOG_CANCEL_ERROR));
							}
						}
					);
				}
			});
		} else if (response.choice === "negative") {
			//Doesn't want to save.
			callback();
		} else {
			//choice === cancel
			callback(new Error(SAVE_DIALOG_CANCEL_ERROR));
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
		Logger.system.log("spawnWorkspaceInput", response);
		//If user wants to proceed but gave an invalid name, tell them that they messed up, then die.
		//@todo, look in to using async.retry - we could throw an error and start the whole process over again.
		if (
			response.choice !== "cancel" &&
			(!response.value || response.value === "")
		) {
			let dialogParams = {
				title: "Invalid Workspace Name",
				question:
					"Workspace names must contain letters or numbers. Please try again.",
				affirmativeResponseLabel: "OK",
				showNegativeButton: false,
				showCancelButton: false,
			};
			Actions.spawnDialog("yesNo", dialogParams, Function.prototype);
			return callback(new Error("Invalid workspace name."));
		} else if (response.choice === "cancel") {
			return callback(new Error(SAVE_DIALOG_CANCEL_ERROR));
		}
		callback(null, response);
	},
	askAboutOverwrite(params, callback) {
		let { workspaceExists, workspaceName } = params;
		let dialogParams = {
			title: "Overwrite Workspace?",
			question: `This will overwrite the saved data for  "${workspaceName}". Would you like to proceed?`,
			affirmativeResponseLabel: "Overwrite",
			showNegativeButton: false,
		};
		function onUserInput(err, response) {
			if (response.choice === "affirmative") {
				callback(null, workspaceName);
			} else {
				callback(new Error(NEGATIVE));
			}
		}
		if (workspaceExists) {
			Actions.spawnDialog("yesNo", dialogParams, onUserInput);
		} else {
			callback(null, workspaceName);
		}
	},
	askIfUserWantsNewWorkspace(params, callback) {
		let { workspaceExists, workspaceName, template } = params;

		let dialogParams = {
			title: "New Workspace",
			question: `The workspace "${workspaceName}" already exists. A new workspace with a modified name will be created.`,
			affirmativeResponseLabel: "OK",
			showNegativeButton: false,
		};

		function onUserInput(err, response) {
			if (response.choice === "affirmative") {
				callback(null, { workspaceName, template });
			} else {
				callback(new Error(NEGATIVE));
			}
		}
		if (workspaceExists) {
			Actions.spawnDialog("yesNo", dialogParams, onUserInput);
		} else {
			callback(null, { workspaceName, template });
		}
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
		let workspaceExists = FSBL.Clients.WorkspaceClient.workspaces.some(
			(workspace) => workspace.name === workspaceName
		);
		callback(null, {
			workspaceExists,
			workspaceName,
			template: response.template,
		});
	},
	/*********************************************************************************************
	 *
	 *								Misc functionality
	 *
	 *********************************************************************************************/
	/**
	 * Whether the workspace is pinned to the toolbar.
	 */
	isPinned: function(name) {
		let pins = Actions.getPins();
		//Array.some will return true for the first element in the array that satisfies the condition. If none are true, it'll go through the entire array. It's essentially a way to short-circuit a for loop.
		return pins.some((pin) => pin.label === name);
	},
	/**
	 * Unpins the workspace from the toolbars.
	 */
	removePin: function(name) {
		ToolbarStore.removeValue({ field: `pins.${name}` });
	},
	/**
	 * If the workspace is pinned, it unpins the workspace. Otherwise, we pin it to the toolbar.
	 */
	togglePin: function(workspace) {
		let workspaceName = workspace.name.replace(/[.]/g, "^DOT^"); //No dots allowed in store field names
		//toggles the pinned state of the component. This change will be broadcast to all toolbars so that the state changes in each component.
		let pins = Actions.getPins();
		let thePin = {
			type: "workspaceSwitcher",
			label: workspace.name,
			toolbarSection: "center",
			uuid: uuidv4(),
		};
		let wasAlreadyPinned = Actions.isPinned(workspace.name);

		if (wasAlreadyPinned) {
			ToolbarStore.removeValue({ field: `pins.${workspaceName}` });
		} else {
			FSBL.Clients.Logger.perf.log("TogglePin");
			ToolbarStore.setValue({ field: `pins.${workspaceName}`, value: thePin });
		}
	},
	/**
	 * Un-focuses from the menu.
	 */
	blurWindow: function() {
		finsembleWindow.blur();
	},
	/**
	 * Hides the window.
	 */
	hideWindow: function() {
		this.blurWindow();
	},
};

function createLocalStore(done) {
	StoreClient.createStore(
		{ store: "Finsemble-WorkspaceMenu-Local-Store", values: defaultData },
		(err, store) => {
			WorkspaceManagementStore = store;
			done();
		}
	);
}

function createGlobalStore(done) {
	StoreClient.createStore(
		{
			store: "Finsemble-WorkspaceMenu-Global-Store",
			global: true,
			values: { owner: finsembleWindow.name },
		},
		(err, store) => {
			WorkspaceManagementGlobalStore = store;
			done();
		}
	);
}

function getToolbarStore(done) {
	//Try for a second to get the toolbar. The toolbar creates the store on startup. if this component comes up first, we'll still get our store.
	async.retry(
		{
			times: 10,
			interval: 100,
		},
		(callback, results) => {
			StoreClient.getStore(
				{ global: true, store: "Finsemble-Toolbar-Store" },
				(err, store) => {
					console.info("Trying to retrieve toolbarStore.", store);
					if (!store) return callback(new Error("no store"), null);
					ToolbarStore = store;
					store.getValue({ field: "pins" }, (err, pins) => {
						if (pins) Actions.setPins(pins.value);
					});

					store.addListener({ field: "pins" }, (err, pins) => {
						if (pins) Actions.setPins(pins.value);
					});
					callback(null, null);
				}
			);
		},
		done
	);
}

function getPreferences(done) {
	FSBL.Clients.ConfigClient.getValue(
		{
			field:
				"finsemble.preferences.workspaceService.promptUserOnDirtyWorkspace",
		},
		(err, data) => {
			let prompt = data;
			//default to false.
			PROMPT_ON_SAVE = prompt === null ? PROMPT_ON_SAVE : prompt;
			done();
		}
	);
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
		[createGlobalStore, createLocalStore, getToolbarStore, getPreferences],
		() => {
			Actions.initialize();
			cb(WorkspaceManagementStore);
		}
	);
}

let getStore = () => WorkspaceManagementStore;

export { WorkspaceManagementGlobalStore as GlobalStore };
export { initialize };
export { WorkspaceManagementStore as Store };
export { Actions };
export { getStore };
