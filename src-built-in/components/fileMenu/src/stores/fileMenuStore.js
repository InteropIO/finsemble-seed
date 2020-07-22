/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import { EventEmitter } from "events";
let PROMPT_ON_DIRTY = false;
const constants = {
	METHOD: "METHOD",
	SHUTDOWN_APPLICATION: "shutdownApplication",
};

var FileMenuStore = Object.assign({}, EventEmitter.prototype, {
	/**
	 * Sets initial values for the store.
	 * @todo convert to the DistributedStoreClient.
	 */
	initialize: function () {
		var self = this;
		if (window.FSBL && FSBL.addEventListener) { FSBL.addEventListener("onReady", FSBLReady); } else { window.addEventListener("FSBLReady", FSBLReady) }
		function FSBLReady() {
			self.emit("initialized");
			FSBL.Clients.HotkeyClient.addGlobalHotkey(["ctrl", "shift", "alt", "r"], FSBL.restartApplication);
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
		}
	},
	finsembleConfig: null,
	monitorDimensions: {},
	getMonitorDimensions() {
		return this.monitorDimensions;
	},
	setMonitorDimensions(dimensions) {
		//When the component is moved to a new place, monitorDimensions are cached.
		this.monitorDimensions = dimensions;
	},
	hideWindow() {
		finsembleWindow.hide();
	}
});
var keys = {};
function setupHotKeys() {
	FSBL.Clients.RouterClient.subscribe("humanInterface.keydown", function (err, response) {
		if (!keys[response.data.key]) keys[response.data.key] = {};
		keys[response.data.key] = true;
		if (keys[162] && keys[81]) {
			//console.log("call---quit")

		}
	});
	FSBL.Clients.RouterClient.subscribe("humanInterface.keyup", function (err, response) {
		if (!keys[response.data.key]) keys[response.data.key] = {};
		keys[response.data.key] = false;
	});

};
var Actions = {
	hideWindow() {
		finsembleWindow.hide();
	},
	/**
	 * Hides the window and fires off a message shutting down the application.
	 */
	restart() {
		finsembleWindow.hide();
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
		finsembleWindow.hide();
		FSBL.Clients.RouterClient.transmit("CentralConsole-Show", true);
	},
	/**
	 * Sends a message to the system manager to show the log.
	 *
	 */
	showSystemLog() {
		finsembleWindow.hide();
		FSBL.SystemManagerClient.showSystemLog();
	},
	/**
	 * Spawns the preferences menu.
	 */
	spawnPreferences() {
		finsembleWindow.hide();
		FSBL.Clients.LauncherClient.showWindow({
			componentType: "UserPreferences"
		}, {
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
		if (!PROMPT_ON_DIRTY) {
			return Promise.resolve();
		}

		return new Promise(async (resolve, reject) => {
			const isDirty = await FSBL.Clients.WorkspaceClient.isWorkspaceDirty();
			if (!isDirty) return resolve();
			FSBL.Clients.DialogManager.open("yesNo",
				{
					title: "Save your workspace?",
					question: "Your workspace \"" + FSBL.Clients.WorkspaceClient.activeWorkspace.name + "\" has unsaved changes, would you like to save?"
				}, async (err, response) => {
					if (err || response.choice === "affirmative") {
						try {
							await FSBL.Clients.WorkspaceClient.save();
						} catch (error) {
							reject(error);
						}
					}
					resolve(response.choice);
				});
		});
	},
	/**
	 * Hides the window and fires off a message shutting down the application.
	 */
	shutdownApplication() {
		finsembleWindow.hide();
		//FSBL.shutdownApplication();
		Actions.saveWorkspace().then((choice) => {
			if (choice === 'cancel') {
				return;
			}
			FSBL.shutdownApplication();
		});

	},
	/**
	 * Logs out of the application.
	 *
	 */
	logout() {
		finsembleWindow.hide();
		Actions.saveWorkspace().then(function (choice) {
			if (choice !== "cancel") {

				//Reset any server-side sessions or login data necessary to fully log out the user, e.g.
				/*
				fetch("/logout", {//Sends our logout message
					method: "POST",
					credentials: "include"
				});
				*/

				FSBL.restartApplication();
			}
		});
	},
	/**
	 * Clears cache and restarts the application.
	 */
	clearCacheRestart() {
		FSBL.Clients.StorageClient.clearCache(function () {
			FSBL.restartApplication({ forceRestart: true });
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
		FSBL.System.openUrlWithBrowser("https://www.chartiq.com/tutorials/?slug=finsemble", function () {
			//console.log("successfully launched docs");
		}, function (err) {
			//console.log("failed to launch docs");
		});
	}
};

FileMenuStore.initialize();

export { FileMenuStore as Store };
export { Actions };
