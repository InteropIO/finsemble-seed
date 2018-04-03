/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import async from "async";
import * as menuConfig from '../config.json';
var keys = {};
var storeOwner = false;
/**
 *
 * @class _ToolbarStore
 */
class _ToolbarStore {
	/**
	 * Creates a Local Store and a Global Store using the DistributedStoreClient. The Local Store is used for component state.
	 * The global store is used to allow other components to add/remove items from the Toolbar
	 *
	 * @param {any} done
	 * @param {any} self
	 * @memberof _ToolbarStore
	 */
	createStores(done, self) {
		FSBL.Clients.DistributedStoreClient.createStore({ store: "Finsemble-ToolbarLocal-Store" }, function (err, store) {
			self.Store = store;
			let monitors = {};
			function getMonitor(monitorName, done) {
				FSBL.Clients.LauncherClient.getMonitorInfo({ monitor: monitorName }, (err, monitorInfo) => {
					monitors[monitorName] = monitorInfo;
					done();
				});
			}
			function createStore(err, result) {
				let values = {};
				if (monitors.mine.deviceId === monitors.primary.deviceId) {
					values = { mainToolbar: fin.desktop.Window.getCurrent().name };
					storeOwner = true;//until we put creator in by default
				}

				FSBL.Clients.DistributedStoreClient.createStore({ store: "Finsemble-Toolbar-Store", global: true, values: values }, function (err, store) {
					self.GlobalStore = store;
					done();
				});
			}
			async.forEach(["mine", "primary"], getMonitor, createStore);
		});
	}
	/**
	 * To check if the current window is the creator of the store
	 */
	isStoreOwner() {
		return storeOwner;
	}
	/**
	 * Set up our hotkeys
	 */
	setupPinnedHotKeys(cb) {//return the number of the F key that is pressed
		if (storeOwner) {
			console.log("is store owner----")
			//when ctrl+shift+3 is typed, we invoke the callback saying "3" was pressed, which spawns the 3rd component.
			for (let i = 0; i < 10; i++) {
				FSBL.Clients.HotkeyClient.addGlobalHotkey(["ctrl", "alt", `${i}`], () => {
					if (i === 0) return cb(null, 10);
					cb(null, i);
				});
			}
		}
	};

	/**
	 * Load the menus from the config.json. If there are no items in config.json, menus are loaded from the Finsemble Config `finsemble.menus` item.
	 *
	 *
	 * @param {any} done
	 * @param {any} self
	 * @memberof _ToolbarStore
	 */
	loadMenusFromConfig(done, self) {
		if (Array.isArray(menuConfig) && menuConfig.length) {
			self.Store.setValue({
				field: "menus",
				value: menuConfig
			});
			done();
			if (FSBL.Clients.ConfigClient.setValue) {
				FSBL.Clients.ConfigClient.setValue({ field: "finsemble.menus", value: menuConfig });
			}
		} else {
			FSBL.Clients.ConfigClient.get({ field: "finsemble.menus" }, function (err, menus) {
				self.Store.setValue({
					field: "menus",
					value: menus
				});
				done();
			});
		}
	}


	/**
	 * Listen for pin and menu changes on the global store. Listen for menu changes in the config.
	 *
	 * @param {any} done
	 * @param {any} self
	 * @memberof _ToolbarStore
	 */
	addListeners(done, self) {
		// menus change - menus come from config
		FSBL.Clients.DistributedStoreClient.getStore({ store: "Finsemble-Configuration-Store", global: true }, function (err, configStore) {
			if (configStore) {
				configStore.addListener({ field: "finsemble.menus" }, function (err, data) {
					self.Store.setValue({
						field: "menus",
						value: data.value
					});
					self.getSectionsFromMenus(data.value);
				});
			}
			done();
		});
	}

	/**
	 *
	 *
	 *
	 */

	setupHotkeys(cb) {
		var self = this;
		if (storeOwner) {
			let keys = FSBL.Clients.HotkeyClient.keyMap;
			FSBL.Clients.HotkeyClient.addGlobalHotkey([keys.ctrl, keys.shift, keys.up], () => {
				FSBL.Clients.LauncherClient.bringWindowsToFront()
			});
			FSBL.Clients.HotkeyClient.addGlobalHotkey([keys.ctrl, keys.shift, keys.down], () => {
				FSBL.Clients.WorkspaceClient.minimizeAll()
			});
			FSBL.Clients.HotkeyClient.addGlobalHotkey([keys.ctrl, keys.shift, keys.f], () => {
				console.log("hot key")
				self.Store.setValue({ field: "searchActive", value: true });
			});
		}
		return cb();
	}
	addListener(params, cb) {
		this.Store.addListener(params, cb);
	}
	/**
	 *
	 *
	 * @param {any} cb
	 * @memberof _ToolbarStore
	 */
	initialize(cb) {
		var self = this;
		//Create local store for state
		async.series(
			[
				function (done) {
					self.createStores(done, self);
				},
				function (done) {
					self.loadMenusFromConfig(done, self);
				},
				function (done) {
					self.addListeners(done, self);
				},
				function (done) {
					self.setupHotkeys(done);
				},
				function (done) {
					self.listenForWorkspaceUpdates();
					done();
				}
			],
			cb
		);
	}

	/**
	 * Generates toolbar sections from menus and pins and rerenders toolbar.
	 *
	 * @param {any} menus
	 * @returns
	 * @memberof _ToolbarStore
	 */
	getSectionsFromMenus(menus) {
		var sections = {
			"left": [],
			"right": [],
			"center": []
		};
		menus = menus || this.Store.getValue({ field: "menus" });
		if (menus) {
			for (var i in menus) {
				var menu = menus[i];
				menu.align = menu.align || "left";
				if (!sections[menu.align]) { sections[menu.align] = []; }
				sections[menu.align].push(menu);
			}
		}

		this.Store.setValue({ field: "sections", value: sections });
		return sections;
	}

	/**
	 * Shortcut to get values from the local store.
	 *
	 * @param {any} field
	 * @returns
	 * @memberof _ToolbarStore
	 */
	get(field) {
		return this.Store.getValue({ field: field });
	}
	/**
	 * Provides data to the workspace menu opening button.
	 */
	listenForWorkspaceUpdates() {
		FSBL.Clients.RouterClient.subscribe("Finsemble.WorkspaceService.update", (err, response) => {
			this.setWorkspaceMenuWindowName(response.data.activeWorkspace.name);
			this.Store.setValue({ field: "activeWorkspaceName", value: response.data.activeWorkspace.name });
		})
	}

	setWorkspaceMenuWindowName(name) {
		if (this.Store.getValue({ field: 'workspaceMenuWindowName' }) === null) {
			this.Store.setValue({ field: "workspaceMenuWindowName", value: name });
		}
	}

}

var ToolbarStore = new _ToolbarStore();

export default ToolbarStore;