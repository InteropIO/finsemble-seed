
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var StoreClient;
var windowTitleBarStore;
var WindowClient;
import windowTitleBarStoreDefaults from "./windowTitleBarStoreDefaults";
import * as async from "async";
var finWindow = fin.desktop.Window.getCurrent();
var Actions = {
	initialize: function () {
		// This ensures that our config is correct, even if the developer missed some entries
		var options = FSBL.Clients.WindowClient.options;
		var windowTitleBarConfig = options.customData.foreign.components["Window Manager"];
		var FSBLHeader = windowTitleBarConfig.FSBLHeader;
		var self = this;

		/**
		 * The windowTitleBar (header) is dumb. It just reflects the state of the component window. The headerCommandChannel allows the WindowClient to take control of the state of the header. All of the details of listening to window events are handled inside the WindowClient
		 */
		WindowClient.headerCommandChannel((command, state) => {
			this.remoteStateUpdate(command, state);
		});

		/**
		 * "FSBLHeader" can be true, false or an object. If false then we'll never even be here. If true, then maximize, minimize and close buttons will display. If an object, then the developer can override whether buttons are shown with "hideMaximize", "hideMinimize" and "hideClose"
		 */
		if (FSBLHeader) {
			var max = FSBLHeader.hideMaximize ? true : false;
			windowTitleBarStore.setValues([
				{ field: "Maximize.hide", value: max },
				{ field: "Minimize.hide", value: FSBLHeader.hideMinimize ? true : false },
				{ field: "Close.hide", value: FSBLHeader.hideClose ? true : false },
			]);

			if (FSBL.Clients.WindowClient.title) {
				windowTitleBarStore.setValue({
					field: "Main.windowTitle", value: FSBL.Clients.WindowClient.title
				});
			}
		}

		/**
		 * Handles whether to show the linker button.
		 */
		if (windowTitleBarConfig.showLinker) {
			//Get state (channel memebership) from the linkerClient. Then set the value in the header so that the title bar accurately reflects the state.
			let cb = (err, response) => {
				if (response.channels) { windowTitleBarStore.setValue({ field: "Linker.channels", value: response.channels }); }
				windowTitleBarStore.setValue({ field: "Linker.showLinkerButton", value: true });
			};
			cb(null, FSBL.Clients.LinkerClient.getState());
			/* [Terry] no longer necessary?
			FSBL.Clients.LinkerClient.getLinkedChannels({
				windowName: options.name,
				uuid: options.uuid,
				componentType: options.customData.component.type
			}, cb);
			*/
			FSBL.Clients.LinkerClient.onStateChange(cb);
		}

		/**
		 * Listen for updates from the dragAndDropClient.
		 */
		FSBL.Clients.RouterClient.subscribe(FSBL.Clients.WindowClient.options.name + "Finsemble.Sharer", function (err, response) {
			if (err) { return console.error(err); }
			windowTitleBarStore.setValues([
				{ field: "Sharer.emitterEnabled", value: response.data.emitterEnabled },
				{ field: "Sharer.receiverEnabled", value: response.data.receiverEnabled }
			]);
		});

		/**
		 * When a group update is publish, we sift through the data to see if this window is snapped or grouped with other windows. Then we publish that info, and the DockingButton renders the correct icon.
		 * @param {*} err
		 * @param {*} response
		 */
		var onDockingGroupUpdate = function (err, response) {
			let groupNames = Object.keys(response.data.groupData);
			let movableGroups = groupNames
				.filter(groupName => response.data.groupData[groupName].isMovable)
				.map(groupName => response.data.groupData[groupName]);
			windowTitleBarStore.setValue({ field: "Main.allMovableDockingGroups", value: movableGroups });
			let myGroups = self.getMyDockingGroups(response.data.groupData);
			windowTitleBarStore.setValue({ field: "Main.dockingGroups", value: myGroups });
			/**
			 * Goes through groups and sees if this window is grouped, snapped, or freely hanging out there.
			 */
			let isSnapped = false;
			let isInMovableGroup = false;
			let isTopRight = false;
			for (let i = 0; i < myGroups.length; i++) {
				let myGroup = myGroups[i];
				if (myGroup.isMovable) {
					isInMovableGroup = true;
					if (FSBL.Clients.WindowClient.windowName == myGroup.topRightWindow) {
						isTopRight = true;
					}
				} else {
					isSnapped = true;
				}
			}
			let icon = false;

			if (isSnapped) { icon = "joiner"; }
			if (isInMovableGroup) { icon = "ejector"; }

			windowTitleBarStore.setValues([
				{ field: "isSnapped", value: isSnapped },
				{ field: "isGrouped", value: isInMovableGroup },
				{ field: "isTopRight", value: isTopRight },
				{ field: "Main.dockingIcon", value: icon }
			]);

			if (isInMovableGroup && !isTopRight) {
				fin.desktop.Window.getCurrent().updateOptions({ showTaskbarIcon: false });
			} else {
				fin.desktop.Window.getCurrent().updateOptions({ showTaskbarIcon: true });
			}
		};

		FSBL.Clients.RouterClient.subscribe("Finsemble.WorkspaceService.groupUpdate", onDockingGroupUpdate);

		/**
		 * Catches a double-click on the title bar. If you don't catch this, openfin will invoke the OS-level maximize, which will put the window on top of the toolbar. `clickMaximize` will fill all of the space that finsemble allows.
		 */
		FSBL.Clients.WindowClient.finWindow.addEventListener("maximized", function () {
			self.clickMaximize();
		});
		//default title.
		windowTitleBarStore.setValue({ field: "Main.windowTitle ", value: FSBL.Clients.WindowClient.getWindowTitle() });

		/**
		 * If docking is disabled, don't show buttons on snaps.
		 * @todo remove once docking is out of beta.
		 */
		FSBL.Clients.ConfigClient.get({ field: "finsemble" }, function (err, finsembleConfig) {
			windowTitleBarStore.setValues([{ field: "Main.dockingEnabled", value: finsembleConfig.betaFeatures.docking.enabled }]);
		});
	},
	/**
	 * Helper function to sift through all of the data coming from the dockingService. Outputs an array of groups that the window belongs to.
	 * @todo consider sending targeted messages to windows instead of a bulk update. Will cut down on this kind of code.
	 */
	getMyDockingGroups: function (groupData) {
		let myGroups = [];
		let windowName = FSBL.Clients.WindowClient.windowName;
		if (groupData) {
			for (var groupName in groupData) {
				groupData[groupName].groupName = groupName;
				if (groupData[groupName].windowNames.includes(windowName)) {
					myGroups.push(groupData[groupName]);
				}
			}
		}
		return myGroups;
	},
	hyperFocus: function (params = {}) {

		function getLinkedWindows(callback) {
			FSBL.Clients.LinkerClient.getLinkedComponents({ channels: [linkerChannel] }, (err, data) => {
				let windows = data.map((win) => win.windowName);
				windowList = windowList.concat(windows);
				callback();
			});
		}

		function getDockedWindows(callback) {
			function getWindows(groupName, done) {
				FSBL.Clients.RouterClient.query("DockingService.getWindowsInGroup", { groupName }, (err, response) => {
					windowList = windowList.concat(response.data);
					done();
				});
			}

			//Get the windows for every list.
			async.forEach(dockingGroups, getWindows, callback);
		}

		function getWindowsInAppSuite(callback) {
			FSBL.Clients.LauncherClient.getGroupsForWindow((err, data) => {
				function getWindowsInGroup(group, done) {
					FSBL.Clients.RouterClient.query("LauncherService.getWindowsInGroup", { groupName: group }, (err, response) => {
						windowList = windowList.concat(response.data);
						done();
					});
				}
				if (err) return callback(err, null);
				let groups = data;
				if (groups) {
					async.forEach(groups, getWindowsInGroup, callback);
				} else {
					callback(null, null);
				}
			});
		}


		let { linkerChannel, includeAppSuites, includeDockedGroups } = params;
		let windowList = [],
			tasks = [],
			dockingGroups = [],
			isGrouped = windowTitleBarStore.getValue({ field: "isGrouped" }),
			movableGroups = windowTitleBarStore.getValue({ field: "Main.allMovableDockingGroups" });


		if (linkerChannel) {
			tasks.push(getLinkedWindows);
		}

		if (includeDockedGroups && isGrouped) {
			dockingGroups = windowTitleBarStore.getValue({ field: "Main.dockingGroups" });
			if (dockingGroups) {
				dockingGroups = dockingGroups.filter(grp => grp.isMovable).map(grp => grp.groupName);
				tasks.push(getDockedWindows);
			}
		}

		if (includeAppSuites) {
			tasks.push(getWindowsInAppSuite);
		}

		if (tasks.length) {
			async.parallel(tasks, () => {
				windowList.forEach(windowName => {
					movableGroups.forEach((grp) => {
						if (grp.windowNames.includes(windowName)) {
							windowList = windowList.concat(grp.windowNames);
						}
					});
				});
				FSBL.Clients.LauncherClient.hyperFocus({ windowList });
			});
		}
	},
	hyperfocusDockingGroup: function () {
		FSBL.Clients.RouterClient.transmit("DockingService.hyperfocusGroup", { windowName: FSBL.Clients.WindowClient.windowName });
	},
	/**
	 * Handles messages coming from the windowCclient.
	 */
	remoteStateUpdate: function (command, state) {
		var key = Object.keys(state)[0];
		var field = command + "." + key;
		windowTitleBarStore.setValue({ field: field, value: state[key] });
	},
	/**
	 * Minimizes the window.
	 */
	clickMinimize: function () {
		var isGrouped = windowTitleBarStore.getValue({ field: "isGrouped" });
		if (isGrouped) {
			FSBL.Clients.WindowClient.minimizeWithDockedWindows();
		} else {
			FSBL.Clients.WindowClient.minimize();
		}
	},
	/**
	 * Closes the window, allows for cleanup. Removes the window from workspace; this function is only invoked when the user clicks the close button.
	 */
	clickClose: function () {
		FSBL.Clients.WindowClient.close({
			removeFromWorkspace: true
		});
	},
	/**
	 * Toggles group membership. If two windows are snapped, and this button is clicked, they become part of the same group that can be moved around together.
	 */
	toggleGroup: function () {
		let groups = windowTitleBarStore.getValue({ field: "Main.dockingGroups" });
		let isInMovableGroup = groups.some(group => group.isMovable);
		if (isInMovableGroup) {
			FSBL.Clients.WindowClient.ejectFromGroup();
		} else {
			FSBL.Clients.WindowClient.formGroup();
		}
	},
	/**
	 * Maximizes the window.
	 */
	clickMaximize: function () {
		var maxField = windowTitleBarStore.getValue({ field: "Maximize" });

		if (maxField.maximized) {
			return FSBL.Clients.WindowClient.restore(() => {
				windowTitleBarStore.setValue({ field: "Maximize.maximized", value: false });
			});
		}
		FSBL.Clients.WindowClient.maximize(() => {
			windowTitleBarStore.setValue({ field: "Maximize.maximized", value: true });
		});

	}
};

/**
 * Initializes the store for the titleBar.
 *
 * @param {any} cb
 */
function initialize(cb) {
	WindowClient = FSBL.Clients.WindowClient;
	StoreClient = FSBL.Clients.DistributedStoreClient;

	StoreClient.createStore({ store: "windowTitleBarStore", values: windowTitleBarStoreDefaults }, function (err, store) {
		windowTitleBarStore = store;
		Actions.initialize();
		return cb();
	});
}

let getStore = () => {
	return windowTitleBarStore;
};

export { initialize };
export { windowTitleBarStore as Store };
export { Actions };
export { getStore };