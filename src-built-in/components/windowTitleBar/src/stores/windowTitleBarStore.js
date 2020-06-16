/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */
import windowTitleBarStoreDefaults from "./windowTitleBarStoreDefaults";
import * as async from "async";
var StoreClient;
var windowTitleBarStore;
var WindowClient;

//these are constants that are set inside of setupStore. so they're declared as vars and not constants.
let constants = {};
var Actions = {
	initialize: function() {
		// This ensures that our config is correct, even if the developer missed some entries
		let { options } = FSBL.Clients.WindowClient;
		// TODO, this should come from config server (probably via a WindowsClient.getConfig() command), so that live components always have the latest config. Currently this config gets saved with the component via workspace customData.
		let windowTitleBarConfig =
			options.customData.foreign.components["Window Manager"];
		let { FSBLHeader } = windowTitleBarConfig;
		let self = this;
		let displayName = null;

		//Display name is first up for display. If it doesn't exist, we look for a default title (or one that's already set on init). If no title, we display the window's name (e.g., '5434-Welcome Component-2321').
		if (
			options.customData.component &&
			options.customData.component.displayName
		) {
			displayName = options.customData.component.displayName;
		}

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
			var max = !!FSBLHeader.hideMaximize;

			windowTitleBarStore.setValues([
				{ field: "Maximize.hide", value: max },
				{ field: "Minimize.hide", value: !!FSBLHeader.hideMinimize },
				{ field: "Close.hide", value: !!FSBLHeader.hideClose },
				{ field: "AlwaysOnTop.show", value: !!FSBLHeader.alwaysOnTop },
			]);

			// By default, we hack the window's scroll bar so that it displays underneath the header. html.overflow: hidden body.overflow:auto
			windowTitleBarStore.setValue({
				field: "hackScrollbar",
				value: windowTitleBarConfig.hackScrollbar !== false,
			});

			// Set by calling WindowClient.setTitle() || from config "foreign.components.Window Manager.title"
			var title =
				FSBL.Clients.WindowClient.title ||
				windowTitleBarConfig.title ||
				displayName;

			if (title) {
				FSBL.Clients.WindowClient.setWindowTitle(title);
			}
		}

		/**
		 * Handles whether to show the linker button.
		 */
		if (windowTitleBarConfig.showLinker) {
			//Get state (channel membership) from the linkerClient. Then set the value in the header so that the title bar accurately reflects the state.
			let cb = (err, response) => {
				if (response.channels) {
					windowTitleBarStore.setValue({
						field: "Linker.channels",
						value: response.channels,
					});
				}
				windowTitleBarStore.setValue({
					field: "Linker.showLinkerButton",
					value: true,
				});
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
		FSBL.Clients.RouterClient.subscribe(
			`${FSBL.Clients.WindowClient.options.name}Finsemble.Sharer`,
			(err, response) => {
				if (err) {
					return console.error(err);
				}
				windowTitleBarStore.setValues([
					{
						field: "Sharer.emitterEnabled",
						value: response.data.emitterEnabled,
					},
					{
						field: "Sharer.receiverEnabled",
						value: response.data.receiverEnabled,
					},
				]);
			}
		);

		/**
		 * When a group update is publish, we sift through the data to see if this window is snapped or grouped with other windows. Then we publish that info, and the DockingButton renders the correct icon.
		 * @param {*} err
		 * @param {*} response
		 */
		var onDockingGroupUpdate = function(err, response) {
			if (err || !response.data || !response.data.groupData) {
				return;
			}
			FSBL.Clients.Logger.system.debug(
				"On docking group update",
				response.data.groupData
			);
			let groupNames = Object.keys(response.data.groupData);
			let movableGroups = groupNames
				.filter((groupName) => response.data.groupData[groupName].isMovable)
				.map((groupName) => response.data.groupData[groupName]);
			//This is all movable and snapped groups. It's used later to figure out the icon to display.
			windowTitleBarStore.setValue({
				field: "Main.allDockingGroups",
				value: response.data.groupData,
			});

			windowTitleBarStore.setValue({
				field: "Main.allMovableDockingGroups",
				value: movableGroups,
			});
			let myGroups = self.getMyDockingGroups(response.data.groupData);
			windowTitleBarStore.setValue({
				field: "Main.dockingGroups",
				value: myGroups,
			});
			/**
			 * Goes through groups and sees if this window is grouped, snapped, or freely hanging out there.
			 */
			let isSnapped = false;
			let isInMovableGroup = false;
			let isTopRight = false;
			let windowName = FSBL.Clients.WindowClient.getWindowNameForDocking();
			for (let i = 0; i < myGroups.length; i++) {
				let myGroup = myGroups[i];
				if (myGroup.isMovable) {
					isInMovableGroup = true;
					if (windowName == myGroup.topRightWindow) {
						isTopRight = true;
					}
				} else {
					isSnapped = true;
				}
			}
			let icon = false;

			if (isSnapped) {
				icon = "joiner";
			}
			if (isInMovableGroup) {
				icon = "ejector";
			}

			windowTitleBarStore.setValues([
				{ field: "isSnapped", value: isSnapped },
				{ field: "isGrouped", value: isInMovableGroup },
				{ field: "isTopRight", value: isTopRight },
				{ field: "Main.dockingIcon", value: icon },
			]);
		};

		FSBL.Clients.RouterClient.subscribe(
			"Finsemble.WorkspaceService.groupUpdate",
			onDockingGroupUpdate
		);

		//default title.
		windowTitleBarStore.setValue({
			field: "Main.windowTitle ",
			value: FSBL.Clients.WindowClient.getWindowTitle(),
		});

		FSBL.Clients.ConfigClient.getValue(
			{ field: "finsemble" },
			(err, finsembleConfig) => {
				let globalWindowManagerConfig = finsembleConfig["Window Manager"] || {
					alwaysOnTopIcon: false,
					showTabs: false,
				}; // Override defaults if finsemble.Window Manager exists.

				// Look to see if docking is enabled. Cascade through backward compatibility with old "betaFeatures" and then a default if no config is found at all.

				if (!finsembleConfig.servicesConfig)
					finsembleConfig.servicesConfig = {};
				let dockingConfig =
					finsembleConfig.servicesConfig.docking || finsembleConfig.docking;
				if (!dockingConfig && finsembleConfig.betaFeatures)
					dockingConfig = finsembleConfig.betaFeatures.docking;
				if (!dockingConfig) dockingConfig = { enabled: true };
				if (!dockingConfig.tabbing) dockingConfig.tabbing = {};

				windowTitleBarStore.setValues([
					{ field: "Main.dockingEnabled", value: dockingConfig.enabled },
				]);

				// Whether the alwaysOnTop pin shows or not depends first on the global setting (finsemble["Window Manager"].alwaysOnTop) and then
				// on the specific setting for this component (foreign.components["Widow Manager"].alwaysOnTop)
				let { alwaysOnTopIcon } = globalWindowManagerConfig;
				if (
					windowTitleBarConfig.alwaysOnTopIcon === false ||
					windowTitleBarConfig.alwaysOnTopIcon === true
				)
					alwaysOnTopIcon = windowTitleBarConfig.alwaysOnTopIcon;

				windowTitleBarStore.setValues([
					{ field: "AlwaysOnTop.show", value: alwaysOnTopIcon },
				]);

				//If tabbing is turned off, ignore global/local 'windowManager' config about whether to allow tabbing.
				if (dockingConfig.tabbing.enabled === false) {
					windowTitleBarStore.setValue({
						field: "showTabs",
						value: dockingConfig.tabbing.enabled,
					});
				} else {
					//If tabbing is enabled system-wide, look to the global config for its value. Then look to the local component's config.

					//This is the global window manager config.
					if (typeof windowTitleBarConfig.showTabs !== "boolean") {
						windowTitleBarStore.setValue({
							field: "showTabs",
							value: globalWindowManagerConfig.showTabs,
						});
					}
					//This is the component's config.
					if (
						windowTitleBarConfig.showTabs ||
						windowTitleBarConfig.showTabs === false
					) {
						windowTitleBarStore.setValue({
							field: "showTabs",
							value: windowTitleBarConfig.showTabs,
						});
					}

					//Once the above has been checked the individual component config is checked for customData.foreign.services[windowService || dockingService][!ignoreTilingAndTabbingRequests || allowTabbing]
					let showTabs = true;
					finsembleWindow.getOptions((err, opts) => {
						if (
							opts.customData &&
							opts.customData.foreign &&
							opts.customData.foreign.services
						) {
							if (opts.customData.foreign.services.windowService) {
								if (
									opts.customData.foreign.services.windowService
										.allowTabbing !== undefined
								) {
									showTabs =
										opts.customData.foreign.services.windowService.allowTabbing;
								} else if (
									opts.customData.foreign.services.windowService
										.ignoreTilingAndTabbingRequests != undefined
								) {
									showTabs = !opts.customData.foreign.services.windowService
										.ignoreTilingAndTabbingRequests;
								}
							} else if (opts.customData.foreign.services.dockingService) {
								if (
									opts.customData.foreign.services.dockingService
										.allowTabbing !== undefined
								) {
									showTabs =
										opts.customData.foreign.services.dockingService
											.allowTabbing;
								} else if (
									opts.customData.foreign.services.dockingService
										.ignoreTilingAndTabbingRequests != undefined
								) {
									showTabs = !opts.customData.foreign.services.dockingService
										.ignoreTilingAndTabbingRequests;
								}
							}
						}

						windowTitleBarStore.setValue({
							field: "showTabs",
							value: showTabs,
						});
					});
				}
			}
		);

		Actions.getInitialTabList((err, values) => {
			var onParentSet = () => {
				Actions.parentWrapper = null;
				Actions.getInitialTabList(() => {
					FSBL.Clients.Logger.system.debug(
						"docking group update after initial tab list"
					);
					onDockingGroupUpdate(null, {
						data: {
							groupData: windowTitleBarStore.getValue({
								field: "Main.allDockingGroups",
							}),
						},
					});
				});
			};
			var onParentCleared = () => {
				Actions.parentWrapper = null;
				FSBL.Clients.Logger.system.debug("ClearParent, setting tabs to null");
				Actions.stopListeningOnParentWrapper(() => {
					Actions.parentWrapperStore = null;
					Actions._setTabs(null);
					onDockingGroupUpdate(null, {
						data: {
							groupData: windowTitleBarStore.getValue({
								field: "Main.allDockingGroups",
							}),
						},
					});
				});
			};

			FSBL.Clients.WindowClient.finsembleWindow.addListener(
				"setParent",
				onParentSet
			);
			FSBL.Clients.WindowClient.finsembleWindow.addListener(
				"clearParent",
				onParentCleared
			);
			if (err) {
				return FSBL.Clients.Logger.error("Error in getInitialTabList.", err);
			}

			if (values) Actions._setTabs(values);
		});
	},
	/**
	 * Helper function to sift through all of the data coming from the windowService. Outputs an array of groups that the window belongs to.
	 * @todo consider sending targeted messages to windows instead of a bulk update. Will cut down on this kind of code.
	 */
	getMyDockingGroups: function(groupData) {
		let myGroups = [];
		let windowName = FSBL.Clients.WindowClient.getWindowNameForDocking();
		if (FSBL.Clients.WindowClient.finsembleWindow.parentWindow) {
			windowName = FSBL.Clients.WindowClient.finsembleWindow.parentWindow.name;
		}
		FSBL.Clients.Logger.system.debug(
			"Getting docking groups for ",
			windowName,
			groupData
		);
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
	onTabListScrollPositionChanged: function(err, response) {
		windowTitleBarStore.setValue({
			field: "tabListTranslateX",
			value: response.data.translateX,
		});
	},
	setTabListScrollPosition: function(translateX) {
		FSBL.Clients.RouterClient.transmit(constants.TAB_SCROLL_POSITION_CHANGED, {
			translateX,
		});
	},
	/**
	 * Handles messages coming from the windowClient.
	 */
	remoteStateUpdate: function(command, state) {
		var key = Object.keys(state)[0];
		var field = `${command}.${key}`;
		windowTitleBarStore.setValue({ field: field, value: state[key] });
	},
	/**
	 * Minimizes the window.
	 */
	clickMinimize: function() {
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
	clickClose: function() {
		FSBL.Clients.WindowClient.close({
			removeFromWorkspace: true, // this will cause the entire stack to close. Using this instead of a new parameter to ensure backwards compatibility
			userInitiated: true,
		});
	},
	/**
	 * Toggles group membership. If two windows are snapped, and this button is clicked, they become part of the same group that can be moved around together.
	 */
	toggleGroup: function() {
		let groups = windowTitleBarStore.getValue({ field: "Main.dockingGroups" });
		let isInMovableGroup = groups.some((group) => group.isMovable);
		if (isInMovableGroup) {
			FSBL.Clients.WindowClient.ejectFromGroup();
		} else {
			FSBL.Clients.WindowClient.formGroup();
		}
	},
	/**
	 * Maximizes the window.
	 */
	clickMaximize: function() {
		var maxField = windowTitleBarStore.getValue({ field: "Maximize" });
		if (finsembleWindow.windowState !== finsembleWindow.WINDOWSTATE.MAXIMIZED)
			return FSBL.Clients.WindowClient.maximize(() => {
				windowTitleBarStore.setValue({
					field: "Maximize.maximized",
					value: true,
				});
			});

		return FSBL.Clients.WindowClient.restore(() => {
			windowTitleBarStore.setValue({
				field: "Maximize.maximized",
				value: false,
			});
		});
	},

	getTabs() {
		return windowTitleBarStore.getValue({ field: "tabs" });
	},
	_setTabs(tabs) {
		FSBL.Clients.Logger.system.debug("Set tabs", tabs);
		let activeIdentifier = finsembleWindow.identifier;
		activeIdentifier.title = finsembleWindow.windowOptions.title;
		return windowTitleBarStore.setValue({
			field: "tabs",
			value: tabs || [activeIdentifier],
		});
	},
	addTabLocally: function(windowIdentifier, i) {
		let tabs = Actions.getTabs();
		if (typeof i === "undefined") {
			i = tabs.length + 1;
		}
		tabs.splice(i, 0, windowIdentifier);
		Actions._setTabs(tabs);
	},
	removeTabsLocally: function() {
		//console.log("REMOVE TABS LOCALLY");
		Actions._setTabs(null);
	},
	removeTabLocally: function(windowIdentifier) {
		//console.log("Removing tab", windowIdentifier.name);
		let tabs = Actions.getTabs();
		let i = tabs.findIndex(
			(el) =>
				el.name === windowIdentifier.name && el.uuid === windowIdentifier.uuid
		);
		tabs.splice(i, 1);
		//console.log("Number of Tabs left", tabs.length);
		Actions._setTabs(tabs);
	},
	reorderTabLocally: function(tab, newIndex) {
		let tabs = Actions.getTabs();
		let { currentIndex } = Actions.findTab(tab);
		//console.log("tab list, reorderTabLocally", tab.windowName, currentIndex, newIndex)
		if (currentIndex === newIndex) return;
		if (currentIndex === -1) {
			return Actions.addTabLocally(tab, newIndex);
		}
		tabs.splice(currentIndex, 1);
		//console.log("After remove", JSON.parse(JSON.stringify(tabs)));
		tabs.splice(newIndex, 0, tab);
		//console.log("After reinsert", JSON.parse(JSON.stringify(tabs)));

		Actions._setTabs(tabs);
	},
	addTab: function(windowIdentifier, i) {
		let tabs = Actions.getTabs();
		tabs.push(windowIdentifier);
		//quick UI update
		Actions._setTabs(tabs);
		let callback = () => {
			Actions.parentWrapper.setVisibleWindow({ windowIdentifier });
		};

		if (!Actions.parentWrapper) {
			return Actions.createParentWrapper({
				windowIdentifiers: [finsembleWindow.identifier, windowIdentifier],
				visibleWindowIdentifier: windowIdentifier,
				create: true,
			});
		}
		return Actions.parentWrapper.addWindow(
			{ windowIdentifier, position: i },
			callback
		);
	},
	removeTab: function(windowIdentifier, i) {
		return Actions.parentWrapper.removeWindow({
			windowIdentifier,
			position: i,
		});
	},
	closeTab: function(windowIdentifier) {
		//return Actions.parentWrapper.deleteWindow({ windowIdentifier }) // this will cause the window to be closed but keep the stack intact
		FSBL.FinsembleWindow.getInstance(windowIdentifier, (err, wrap) => {
			wrap.close({ removeFromWorkspace: true });
		});
	},
	reorderTab: function(tab, newIndex) {
		let tabs = Actions.getTabs();
		let { currentIndex } = Actions.findTab(tab);
		if (currentIndex === -1 || !Actions.parentWrapper) {
			return Actions.addTab(tab, newIndex);
		}
		tabs.splice(currentIndex, 1);
		tabs.splice(newIndex, 0, tab);
		//Local change, quickly updates the dom.
		//console.log("Tab list changing", tabs);
		Actions._setTabs(tabs);
		Actions.parentWrapper.reorder({ windowIdentifiers: tabs });
	},
	findTab: function(tab) {
		let tabs = this.getTabs();
		let currentIndex = tabs.findIndex(
			(el) => tab.windowName === el.windowName && tab.uuid === el.uuid
		);
		return { tab, currentIndex };
	},
	setActiveTab: function(windowIdentifier) {
		FSBL.Clients.Logger.system.debug("setActiveTab.visibleWindow");
		return finsembleWindow.parentWindow.setVisibleWindow({ windowIdentifier });
	},
	parentWrapper: null,
	onTabListChanged: function(err, response) {
		FSBL.Clients.Logger.system.debug("OnTabListChanged", response.data);
		if (
			response.data &&
			response.data.hasOwnProperty(constants.CHILD_WINDOW_FIELD)
		) {
			Actions._setTabs(response.data[constants.CHILD_WINDOW_FIELD]);
		}
	},
	parentSubscriptions: [],
	stopListeningOnParentWrapper: function(cb) {
		Actions.parentSubscriptions.forEach((sub) => {
			FSBL.Clients.RouterClient.unsubscribe(sub);
		});
		Actions.parentSubscriptions = []; // remove the subscribeId
		//Syncs scroll state across all tabs in a stack.
		FSBL.Clients.RouterClient.removeListener(
			constants.TAB_SCROLL_POSITION_CHANGED,
			Actions.onTabListScrollPositionChanged
		);
		cb();
	},
	listenOnParentWrapper: function() {
		let TABLIST_SUBSCRIPTION = FSBL.Clients.RouterClient.subscribe(
			constants.PARENT_WRAPPER_UPDATES,
			Actions.onTabListChanged
		);
		FSBL.Clients.RouterClient.addListener(
			constants.TAB_SCROLL_POSITION_CHANGED,
			Actions.onTabListScrollPositionChanged
		);
		Actions.parentSubscriptions.push(TABLIST_SUBSCRIPTION);
	},
	setupStore: function(cb = Function.prototype) {
		constants.PARENT_WRAPPER_UPDATES = `Finsemble.StackedWindow.${Actions.parentWrapper.identifier.windowName}`;
		constants.CHILD_WINDOW_FIELD = `childWindowIdentifiers`;
		constants.VISIBLE_WINDOW_FIELD = `visibleWindowIdentifier`;
		constants.TAB_SCROLL_POSITION_CHANGED = `${Actions.parentWrapper.name}.tabListTabListScrollPositionChanged`;
		Actions.listenOnParentWrapper();
		cb();
	},
	getInitialTabList: function(cb = Function.prototype) {
		//FSBL.Clients.WindowClient.getStackedWindow((err, parentWrapper) => {
		finsembleWindow.getParent((err, parentWrapper) => {
			Actions.parentWrapper = parentWrapper;
			if (Actions.parentWrapper) {
				FSBL.Clients.Logger.debug("GetInitialTabList, parent exists");
				Actions.setupStore(cb);
			} else {
				let activeIdentifier = finsembleWindow.identifier;
				activeIdentifier.title = finsembleWindow.windowOptions.title;
				let tabs = [activeIdentifier];
				cb(null, tabs);
			}
		});

		//})
	},
	createParentWrapper(params, cb) {
		//console.log("In parentWrapper begin");
		window.Actions = Actions;
		if (Actions.parentWrapper) {
			cb();
		} else {
			FSBL.Clients.WindowClient.getStackedWindow(params, (err, wrap) => {
				if (err) {
					Actions.parentWrapper = null;
					Actions._setTabs(null);
				} else {
					Actions.parentWrapper = wrap;
					Actions.setupStore(cb);
				}
			});
		}
	},
};

/**
 * Initializes the store for the titleBar.
 *
 * @param {any} cb
 */
function initialize(cb) {
	WindowClient = FSBL.Clients.WindowClient;
	StoreClient = FSBL.Clients.DistributedStoreClient;

	StoreClient.createStore(
		{ store: "windowTitleBarStore", values: windowTitleBarStoreDefaults },
		(err, store) => {
			windowTitleBarStore = store;
			Actions.initialize();
			return cb();
		}
	);
}

let getStore = () => windowTitleBarStore;

export { initialize };
export { windowTitleBarStore as Store };
export { Actions };
export { getStore };
