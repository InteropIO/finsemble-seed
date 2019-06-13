/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import async from "async";
import * as toolbarConfig from '../config.json';
import * as storeExports from "../stores/searchStore";

import { Actions as SearchActions } from "./searchStore"

var keys = {};
var storeOwner = false;
/**
 *
 * @class _ToolbarStore
 */
class _ToolbarStore {
	constructor() {
		this.loadHotkeysFromConfig = this.loadHotkeysFromConfig.bind(this)
	}
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
			if (err) { FSBL.Clients.Logger.error(`DistributedStoreClient.createStore failed for store Finsemble-ToolbarLocal-Store, error:`, err); }

			self.Store = store;
			let monitors = {};
			function getMonitor(monitorName, done) {
				FSBL.Clients.LauncherClient.getMonitorInfo({ monitor: monitorName }, (err, monitorInfo) => {
					if (err) { FSBL.Clients.Logger.error(`LauncherClient.getMonitorInfo failed for monitor ${monitorName}, error:`, err); }
					monitors[monitorName] = monitorInfo;
					done();
				});
			}
			function createStore(err, result) {
				if (err) { FSBL.Clients.Logger.error(`ToolbarStore.createStores Error:`, err); }
				let values = {};
				if (monitors.mine && monitors.primary && monitors.mine.deviceId === monitors.primary.deviceId) {
					values = { mainToolbar: fin.desktop.Window.getCurrent().name };
					storeOwner = true;//until we put creator in by default
				}

				FSBL.Clients.DistributedStoreClient.createStore({ store: "Finsemble-Toolbar-Store", global: true, values: values }, function (err, store) {
					if (err) { FSBL.Clients.Logger.error(`DistributedStoreClient.createStore failed for store Finsemble-Toolbar-Store, error:`, err); }

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
	 * Retrieves options about self from storage, where applicable
	 * @param {Function} cb The callback
	 */
	retrieveSelfFromStorage(cb) {

		FSBL.Clients.StorageClient.get({ topic: finsembleWindow.name, key: finsembleWindow.name }, (err, result) => {
			if (err || !result) {
				finsembleWindow.show();
				return cb();
			}
			let visible = (result && result.hasOwnProperty("visible") && typeof result.visible === "boolean") ? result.visible : true;
			this.Store.setValue({
				field: "visible", value: visible
			})
			let bounds = (result && result.hasOwnProperty("window-bounds")) ? result["window-bounds"] : null;
			if (bounds) {
				this.Store.setValue({
					field: "window-bounds", value: bounds
				})
				finsembleWindow.setBounds(bounds, () => {
					if (visible) {
						finsembleWindow.show();
					}
					cb();
				});
			} else if (visible) {
				finsembleWindow.show();
				cb();
			}
		});
	}
	/**
	 * Sets the toolbars visibility in memory
	 */
	setToolbarVisibilityInMemory(cb = Function.prototype) {
		if (!this.Store.getValue({ field: "window-bounds" })) return cb();
		FSBL.Clients.StorageClient.save({
			topic: finsembleWindow.name, key: finsembleWindow.name, value: {
				visible: true,
				"window-bounds": this.Store.getValue({ field: "window-bounds" })
			}
		}, cb);
	}
	/**
	 * Set up our hotkeys
	 */
	setupPinnedHotKeys(cb) {//return the number of the F key that is pressed
		if (storeOwner) {
			//console.log("is store owner----")
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
		FSBL.Clients.ConfigClient.getValue({ field: "finsemble.menus" }, function (err, menus) {
			if (err) { FSBL.Clients.Logger.error(`ConfigClient.getValue failed for finsemble.menus, error:`, err); }
			if (menus && menus.length) {
				self.Store.setValue({
					field: "menus",
					value: menus
				});
				done();
			} else {
				self.Store.setValue({
					field: "menus",
					value: toolbarConfig.menus
				});
				done();
				if (FSBL.Clients.ConfigClient.setValue) {
					FSBL.Clients.ConfigClient.setValue({ field: "finsemble.menus", value: toolbarConfig.menus });
				}
			}
		});
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
		FSBL.Clients.ConfigClient.addListener({ field: "finsemble.menus" }, function (err, data) {
			if (err) { FSBL.Clients.Logger.error(`DistributedStoreClient.getStore -> configStore.addListener failed for Finsemble-Configuration-Store, error:`, err); }
			self.Store.setValue({
				field: "menus",
				value: data.value
			});
			self.getSectionsFromMenus(data.value);
		});
		done();

		let onBoundsSet = (bounds) => {
			bounds = bounds.data ? bounds.data : bounds;
			self.Store.setValue({ field: "window-bounds", value: bounds });
			FSBL.Clients.StorageClient.save({
				topic: finsembleWindow.name, key: finsembleWindow.name, value: {
					visible: this.Store.getValue({ field: "visible" }),
					"window-bounds": bounds
				}
			});
		}
		finsembleWindow.addListener("bounds-change-end", onBoundsSet)
	}

	/**
	 * Function to bring toolbar to front (since dockable toolbar can be hidden)
	 * The search input box will be open and any previous results will be displayed
	 * @param {boolean} focus If true, will also focus the toolbar
	 * @memberof _ToolbarStore
	 */
	bringToolbarToFront(focus) {

		finsembleWindow.bringToFront(null, (err) => {
			if (err) { FSBL.Clients.Logger.error(`finsembleWindow.bringToFront failed, error:`, err); }

			if (focus) {
				finsembleWindow.focus();
			}
		});
	}

	/**
	 * Unhides/brings to front the toolbar
	 * @memberof _ToolbarStore
	 */
	showToolbarAtFront() {
		FSBL.Clients.WindowClient.showAtMousePosition();
		this.bringToolbarToFront(true);
	}

	/**
	 * Hides the toolbar
	 * @memberof _ToolbarStore
	 */
	hideToolbar() {
		finsembleWindow.blur();
		finsembleWindow.hide();
	}

	/**
	 * onBlur
	 * @memberof _ToolbarStore
	 */
	onBlur(cb = Function.prototype) {
		finsembleWindow.setComponentState({
			field: 'blurred',
			value: true
		}, cb);
	}

	onFocus(cb = Function.prototype) {
		finsembleWindow.setComponentState({
			field: 'blurred',
			value: false
		}, cb);
	}

	/**
	 *
	 *
	 *
	 */


	/**
 * Load the hotkeys from the config.json. If there are no items in config.json, hotkeys use the defaults in the current file.
 *
 *
 * @param {any} done
 * @memberof _ToolbarStore
 */
	loadHotkeysFromConfig(done) {

		// destructure toolbarConfig.hotkeys and provide a default fallback value for each hotkey.
		const {
			showToolbar = ["ctrl", "alt", "t"],
			hideToolbar = ["ctrl", "alt", "h"],
			bringWindowsToFront = ["ctrl", "alt", "up"],
			minimizeAll = ["ctrl", "alt", "down"],
			showSearch = ["ctrl", "alt", "f"],
		} = toolbarConfig.hotkeys

		// show the toolbar
		FSBL.Clients.HotkeyClient.addGlobalHotkey(
			showToolbar,
			() => {
				this.Store.setValue({ field: "searchActive", value: false });
				this.showToolbarAtFront();
			});

		// hide the toolbar
		FSBL.Clients.HotkeyClient.addGlobalHotkey(
			hideToolbar,
			() => {
				this.hideToolbar();
			});

		// bring all finsemble component windows to front
		FSBL.Clients.HotkeyClient.addGlobalHotkey(
			bringWindowsToFront,
			() => {
				FSBL.Clients.LauncherClient.bringWindowsToFront()
			});

		// maximize all finsemble component windows
		FSBL.Clients.HotkeyClient.addGlobalHotkey(
			minimizeAll,
			() => {
				FSBL.Clients.WorkspaceClient.minimizeAll()
			})

		// open the search bar and give it focus
		FSBL.Clients.HotkeyClient.addGlobalHotkey(
			showSearch,
			() => {
				this.showToolbarAtFront()
				this.Store.setValue({ field: "searchActive", value: true });
			});

		done();
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
				FSBL.Clients.ConfigClient.onReady,
				function (done) {
					self.addListeners(done, self);
				},
				function (done) {
					self.loadHotkeysFromConfig(done);
				},
				function (done) {
					self.listenForWorkspaceUpdates();
					done();
				},
				function (done) {
					self.retrieveSelfFromStorage(done);
				},
				function (done) {
					finsembleWindow.addEventListener('focused', function () {
						self.onFocus();
					});
					finsembleWindow.addEventListener('blurred', function () {
						self.onBlur();
					});
					done();
				},
				function (done) {
					self.setToolbarVisibilityInMemory(done);
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
				if (menu.align == "none") continue;
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
			if (err) { FSBL.Clients.Logger.error(`RouterClient.subscribe failed for Finsemble.WorkspaceService.update, error:`, err); }

			this.setWorkspaceMenuWindowName(response.data.activeWorkspace.name);
			this.Store.setValue({ field: "activeWorkspaceName", value: response.data.activeWorkspace.name });
			if (response.data.reason && response.data.reason === "workspace:load:finished") {
				this.bringToolbarToFront();
			}
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
