/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import { EventEmitter } from "events";
let PROMPT_ON_DIRTY = false;
const constants = {
	METHOD: "METHOD",
	GET_FIN_WINDOW: "getFinWindow",
	SHUTDOWN_APPLICATION: "shutdownApplication",
};

var FileMenuStore = Object.assign({}, EventEmitter.prototype, {
	/**
	 * Sets initial values for the store.
	 * @todo convert to the DistributedStoreClient.
	 */
	initialize: function () {
		var self = this;
		FSBL.addEventListener("onReady", function () {
			self.finWindow = fin.desktop.Window.getCurrent();
			self.emit("initialized");

			FSBL.Clients.ConfigClient.getValue({ field: "finsemble" }, function (err, config) {
				self.finsembleConfig = config;
				let prompt;
				try {
					prompt = config.preferences.workspaceService.promptUserOnDirtyWorkspace;
				} catch (e) {
					prompt = false;
				}
				//Default to false.
				PROMPT_ON_DIRTY = typeof prompt === null ? PROMPT_ON_DIRTY : prompt;
			});
		});
	},
	finsembleConfig: null,
	getFinWindow: function () {
		return this.finWindow;
	},
	finWindow: {},
	activeWorkspace: {},
	monitorDimensions: {},
	initializeActiveWorkspace() {
		var self = this;
		//listen for updates to workspaces and set the activeWorkspace.
		FSBL.Clients.RouterClient.subscribe("Finsemble.WorkspaceService.update", function (err, response) {
			if (response.data && response.data.activeWorkspace) {
				self.activeWorkspace = response.data.activeWorkspace;
				self.emit("change:activeWorkspace");
			}

		});
		FSBL.Clients.WorkspaceClient.getActiveWorkspace(function (err, response) {
			self.activeWorkspace = response;
			self.emit("change:activeWorkspace");
		});
	},
	getMonitorDimensions() {
		return this.monitorDimensions;
	},
	setMonitorDimensions(dimensions) {
		//When the component is moved to a new place, monitorDimensions are cached.
		this.monitorDimensions = dimensions;
	},
	hideWindow() {
		var finWindow = this.finWindow;
		finWindow.hide();
	}
});
var keys = {};
function setupHotKeys() {
	FSBL.Clients.RouterClient.subscribe("humanInterface.keydown", function (err, response) {
		if (!keys[response.data.key]) keys[response.data.key] = {};
		keys[response.data.key] = true;
		if (keys[162] && keys[81]) {
			console.log("call---quit")

		}
	});
	FSBL.Clients.RouterClient.subscribe("humanInterface.keyup", function (err, response) {
		if (!keys[response.data.key]) keys[response.data.key] = {};
		keys[response.data.key] = false;
	});

};
var Actions = {
	hideWindow() {
		FileMenuStore.finWindow.hide();
	},
	/**
	 * Hides the window and fires off a message shutting down the application.
	 */
	restart() {
		fin.desktop.Window.getCurrent().hide();
		Actions.saveWorkspace().then(function (choice) {
			if (choice !== "cancel") {
				FSBL.restartApplication();
			}
		});
	},
	/**
	 * Sends a message to the logger to show itself.
	 *
	 */
	showCentralConsole() {
		fin.desktop.Window.getCurrent().hide();
		FSBL.Clients.RouterClient.transmit("CentralConsole-Show", true);
	},
	spawnPreferences() {
		fin.desktop.Window.getCurrent().hide();
		FSBL.Clients.LauncherClient.showWindow({
			componentType: "UserPreferences"
		},
			{
				monitor: "mine",
				left: "center",
				top: "center"
			});
	},
	/**
	 * Called on shutdown (if the workspace is dirty).
	 * It spawns a dialog that asks whether the user wants to save.
	 *
	 * @returns
	 */
	saveWorkspace() {
		return new Promise(function (resolve, reject) {
			var self = this;
			if (PROMPT_ON_DIRTY && FSBL.Clients.WorkspaceClient.activeWorkspace.isDirty) {
				FSBL.Clients.DialogManager.open("yesNo",
					{
						question: "Your workspace \"" + FSBL.Clients.WorkspaceClient.activeWorkspace.name + "\" has unsaved changes, would you like to save?"
					}, function (err, response) {
						if (response.choice === "affirmative") {
							FSBL.Clients.WorkspaceClient.saveAs({
								force: true,
								name: FSBL.Clients.WorkspaceClient.activeWorkspace.name
							}, function (err1, response1) {
								resolve(response.choice);
							});
						} else {
							resolve(response.choice);
						}
					});
			} else {
				//If no prompt, just resolve - activeworkspace is saved after every state change or window move, no need to do it again.
				resolve();
			}
		});
	},
	/**
	 * Hides the window and fires off a message shutting down the application.
	 */
	shutdownApplication() {
		fin.desktop.Window.getCurrent().blur();
		//FSBL.shutdownApplication();
		Actions.saveWorkspace().then((choice) => {
			if (choice === 'cancel') {
				return;
			}
			FSBL.Clients.RouterClient.transmit("Assimilation.closeOpenFinWindows");
			FSBL.shutdownApplication();
		});

	},
	/**
	 * Logs out of the application.
	 *
	 */
	logout() {
		fin.desktop.Window.getCurrent().hide();
		fetch("/logout", {//Sends our logout message
			method: "POST",
			credentials: "include"
		});
		Actions.saveWorkspace().then(function (choice) {
			if (choice !== "cancel") {
				FSBL.restartApplication();
			}
		});
	},
	/**
	 * Clears cache and restarts the application.
	 */
	clearCacheRestart() {
		FSBL.Clients.StorageClient.clearCache(function () {
			Actions.restart();
		});
	},
	spawnAbout() {
		FSBL.Clients.LauncherClient.showWindow({
			componentType: "About Finsemble"
		},
			{
				monitor: "mine",
				left: "center",
				top: "center"
			});
	},
	spawnDocs() {
		fin.desktop.System.openUrlWithBrowser("https://www.chartiq.com/tutorials/?slug=finsemble-seed-project", function () {
			console.log("successfully launched docs");
		}, function (err) {
			console.log("failed to launch docs");
		});
	}
};

FileMenuStore.initialize();

export { FileMenuStore as Store };
export { Actions };
