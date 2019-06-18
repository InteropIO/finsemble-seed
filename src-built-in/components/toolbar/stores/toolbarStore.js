/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import async from "async";
import * as toolbarConfig from '../config.json';
import * as storeExports from "../stores/searchStore";

import { Actions as SearchActions } from "./searchStore"

// this refers to the new menu section in the toolbar, to add backward compatibility
// if this structure does not exist then just default to using the old array structure
const menuConfig = 'menus' in toolbarConfig ? toolbarConfig.menus : toolbarConfig

var keys = {};
var storeOwner = false;
/**
 *
 * @class _ToolbarStore
 */
class _ToolbarStore {
	constructor() {
		this.loadHotkeysFromConfig = this.setupHotkeys.bind(this)
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
					value: menuConfig
				});
				done();
				if (FSBL.Clients.ConfigClient.setValue) {
					FSBL.Clients.ConfigClient.setValue({ field: "finsemble.menus", value: menuConfig });
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
				this.Store.setValue({ field: "searchActive", value: false });
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
	* Load the hotkeys from the config.json. If there are no items in config.json, hotkeys use the defaults in the current file.
  *
  *
	* @param {any} done
	* @memberof _ToolbarStore
	*/
	setupHotkeys(done) {
		// defaults for the hotkeys
		const defaultHotkeys = [
			{
				name: "showToolbar",
				"keyCombination": [
					"ctrl",
					"alt",
					"t"
				],
				action: 'SHOW_TOOLBAR',
				enabled: true
			},
			{
				name: "hideToolbar",
				"keyCombination": [
					"ctrl",
					"alt",
					"h"
				],
				action: 'HIDE_TOOLBAR',
				enabled: true
			},
			{
				name: "bringWindowsToFront",
				"keyCombination": [
					"ctrl",
					"alt",
					"up"
				],
				action: 'BRING_WINDOWS_TO_FRONT',
				enabled: true
			},
			{
				name: "minimizeAll",
				"keyCombination": [
					"ctrl",
					"alt",
					"down"
				],
				action: 'MINIMIZE_ALL',
				enabled: true
			},
			{
				name: "showSearch",
				"keyCombination": [
					"ctrl",
					"alt",
					"f"
				],
				action: 'SHOW_SEARCH',
				enabled: true
			}
		]

		/**
		 * hotkeyActions
		 * A string can be provided by a hotkey and the corresponding function gets returned.
		 * ?This is the only way to be able to send actions from JSON.
		 * ?This flexibility allows us to change the action via config.
		 * @param {string} action
		 */
		const hotkeyActions = action => {
			const self = this;
			switch (action) {

				case 'SHOW_TOOLBAR':
					return function showToolbar() {
						self.Store.setValue({ field: "searchActive", value: false });
						self.showToolbarAtFront();
					}

				case 'HIDE_TOOLBAR':
					return self.hideToolbar

				case 'BRING_WINDOWS_TO_FRONT':
					return function bringWindowsToFront() {
						FSBL.Clients.LauncherClient.bringWindowsToFront()
					}

				case 'MINIMIZE_ALL':
					return function minimizeAll() {
						FSBL.Clients.WorkspaceClient.minimizeAll()
					}

				case 'SHOW_SEARCH':
					return function showSearch() {
						self.showToolbarAtFront()
						self.Store.setValue({ field: "searchActive", value: true });
					}

				default:
					return null
			}
		}

		/**
		 * setHotkey
		 *
		 * This function does a some validation checks and then sets the global hotkey to the keyCombination with the action passed to it.
		 * @param hotkey array of keys
		 * @param action function to be assigned to the hotkey
		 */
		const setHotkey = ({ name, keyCombination, action, enabled }) => {
			try {
				const getAction = hotkeyActions(action)
				// ensure the action is a function, the key combo is an array and not empty
				if (typeof getAction === "function" && Array.isArray(keyCombination) && keyCombination.length && enabled) {
					FSBL.Clients.HotkeyClient.addGlobalHotkey(keyCombination, getAction, () => { FSBL.Clients.Logger.log(`Hotkey added - ${name} ${keyCombination}`) })
				} else {
					throw 'The key combination or action supplied are not valid.'
				}
			} catch (err) {
				FSBL.Clients.Logger.error(`Failed to add the hotkey ${keyCombination} for ${name}.`, err)
			}
		}

		/**
		 * updateDefaultHotkeysFromConfig
		 *
		 * This function takes the hotkeys from the config file and updates / merges the default hotkeys with it's values.
		 * @param {Array} configHotkeys
		 * @param {Array} defaultHotkeys
		 */
		const overrideDefaultHotkeysWithConfigHotkeys = (configHotkeys, defaultHotkeys) =>
			defaultHotkeys.map(defaultHotkey => {

				// This checks to see if there is an object inside the default hotkey array that matches
				// one from the configHotkeys - validation check
				const config = configHotkeys
					.find(configHotkey => defaultHotkey.name === configHotkey.name)

				// return one object by merging the two objects into one object.
				// If there is a value already set in both objects then the right-hand side (configHotkeys)
				// overwrites the left (hotkeys)
				return { ...defaultHotkey, ...config }

			})

		// check to see if there is a key in the config called hotkeys.
		if ('hotkeys' in toolbarConfig) {

			const hotkeys = overrideDefaultHotkeysWithConfigHotkeys(toolbarConfig.hotkeys, defaultHotkeys)
			hotkeys.forEach(config => setHotkey(config))
		} else {
			// if hotkeys property does not exist in the config fallback to default hotkeys
			defaultHotkeys.forEach(config => setHotkey(config))
		}

		// completed action
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
					self.setupHotkeys(done);
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
