/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */
import * as async from "async";

var StoreClient;
var tabbingRegionStore;
var WindowClient;
let constants = {};
var attachedWindow;
//theses are constants that are set inside of setupStore. so they're declared as vars and not constants.

var windowIdentifier; // = FSBL.Clients.WindowClient.getWindowIdentifier(); <- no idea why this was here. attempts to use FSBL before it is ready.
var Actions = {
	initialize: function() {
		var onParentSet = () => {
			Actions.parentWrapper = null;
			Actions.getInitialTabList(() => {});
		};
		var onParentCleared = () => {
			Actions.parentWrapper = null;
			FSBL.Clients.Logger.system.debug("ClearParent, setting tabs to null");
			Actions.stopListeningOnParentWrapper(() => {
				Actions.parentWrapperStore = null;
				Actions._setTabs(null);
			});
		};
		attachedWindow.addListener("setParent", onParentSet);
		attachedWindow.addListener("clearParent", onParentCleared);
	},
	getTabs() {
		return tabbingRegionStore.getValue({ field: "tabs" });
	},
	setWindowIdentifier(wi) {
		windowIdentifier = wi;
		Actions.getInitialTabList((err, values) => {
			if (values) Actions._setTabs(values);
		});
	},
	setFinsembleWindow(fWindow) {
		attachedWindow = fWindow;
	},
	getWindowIdentifier() {
		return windowIdentifier;
	},
	_setTabs(tabs) {
		FSBL.Clients.Logger.system.debug("Set tabs", tabs);
		return tabbingRegionStore.setValue({
			field: "tabs",
			value: tabs || [windowIdentifier],
		});
	},
	addTabLocally: function(windowIdentifier, i) {
		let tabs = Actions.getTabs();
		if (typeof i === "undefined") {
			i = tabs.length + 1;
		}
		console.debug("addTabLocally", tabs);
		tabs.splice(i, 0, windowIdentifier);
		Actions._setTabs(tabs);
	},
	removeTabsLocally: function() {
		Actions._setTabs(null);
	},
	removeTabLocally: function(windowIdentifier) {
		let tabs = Actions.getTabs();
		let i = tabs.findIndex(
			(el) =>
				el.name === windowIdentifier.name && el.uuid === windowIdentifier.uuid
		);
		tabs.splice(i, 1);
		Actions._setTabs(tabs);
	},
	reorderTabLocally: function(tab, newIndex) {
		let tabs = Actions.getTabs();
		let { currentIndex } = Actions.findTab(tab);
		if (currentIndex === newIndex) return;
		if (currentIndex === -1) {
			return Actions.addTabLocally(tab, newIndex);
		}
		tabs.splice(currentIndex, 1);
		tabs.splice(newIndex, 0, tab);

		Actions._setTabs(tabs);
	},
	addTab: function(wi, i) {
		let tabs = Actions.getTabs();
		tabs.push(wi);
		//quick UI update
		Actions._setTabs(tabs);
		let callback = () => {
			Actions.parentWrapper.setVisibleWindow({ windowIdentifier: wi });
		};

		if (!Actions.parentWrapper) {
			return Actions.createParentWrapper({
				windowIdentifiers: [windowIdentifier, wi],
				visibleWindowIdentifier: wi,
				create: true,
			});
		}
		return Actions.parentWrapper.addWindow(
			{ windowIdentifier: wi, position: i },
			callback
		);
	},
	removeTab: function(wi, i) {
		return Actions.parentWrapper.removeWindow({
			windowIdentifier: wi,
			position: i,
		});
	},
	closeTab: function(wi) {
		return FSBL.FinsembleWindow.getInstance(wi, (err, wrap) => {
			FSBL.Clients.Logger.system.debug("floating titlebar closeTab", wi);
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
		return Actions.parentWrapper.setVisibleWindow({ windowIdentifier });
	},
	parentWrapper: null,
	onTabListChanged: function(err, response) {
		FSBL.Clients.Logger.system.debug("OnTabListChanged");
		if (!response.data) return;
		return Actions._setTabs(response.data[constants.CHILD_WINDOW_FIELD]);
	},
	parentSubscriptions: [],
	stopListeningOnParentWrapper: function(cb) {
		Actions.parentSubscriptions.forEach((sub) => {
			FSBL.Clients.RouterClient.unsubscribe(sub);
		});
		cb();
	},
	listenOnParentWrapper: function() {
		let TABLIST_SUBSCRIPTION = FSBL.Clients.RouterClient.subscribe(
			constants.PARENT_WRAPPER_UPDATES,
			Actions.onTabListChanged
		);
		Actions.parentSubscriptions.push(TABLIST_SUBSCRIPTION);
	},
	setupStore: function(cb = Function.prototype) {
		constants.PARENT_WRAPPER_UPDATES = `Finsemble.StackedWindow.${Actions.parentWrapper.identifier.windowName}`;
		constants.CHILD_WINDOW_FIELD = `childWindowIdentifiers`;
		constants.VISIBLE_WINDOW_FIELD = `visibleWindowIdentifier`;
		Actions.listenOnParentWrapper();
		cb();
	},
	getInitialTabList: function(cb = Function.prototype) {
		//FSBL.Clients.WindowClient.getStackedWindow((err, parentWrapper) => {

		attachedWindow.getParent((err, parentWrapper) => {
			Actions.parentWrapper = parentWrapper;
			if (Actions.parentWrapper) {
				FSBL.Clients.Logger.debug("GetInitialTabList, parent exists");
				Actions.setupStore(cb);
			} else {
				let tabs = [windowIdentifier];
				cb(null, tabs);
			}
		});

		//})
	},
	createParentWrapper(params, cb) {
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
function initialize(windowWithTabs, cb) {
	FSBL.Clients.WindowClient.getWindowIdentifier();
	if (windowWithTabs) attachedWindow = windowWithTabs;
	WindowClient = FSBL.Clients.WindowClient;
	StoreClient = FSBL.Clients.DistributedStoreClient;

	StoreClient.createStore(
		{
			global: false,
			store: "tabbingRegionStore",
			values: {
				tabs: [],
				activeTab: {},
			},
		},
		(err, store) => {
			tabbingRegionStore = store;
			Actions.initialize();
			return cb();
		}
	);
}

let getStore = () => tabbingRegionStore;

export { initialize };
export { tabbingRegionStore as Store };
export { Actions };
export { getStore };
