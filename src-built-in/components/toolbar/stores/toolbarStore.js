/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */
import async from "async";
import * as menuConfig from "../config.json";
import * as storeExports from "../stores/searchStore";
import _get from "lodash.get";
import { PinManager } from "../modules/pinManager";
import { Actions as SearchActions } from "./searchStore";
const PinManagerInstance = new PinManager();
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
		FSBL.Clients.DistributedStoreClient.createStore(
			{ store: "Finsemble-ToolbarLocal-Store" },
			(err, store) => {
				if (err) {
					FSBL.Clients.Logger.error(
						`DistributedStoreClient.createStore failed for store Finsemble-ToolbarLocal-Store, error:`,
						err
					);
				}

				self.Store = store;
				let monitors = {};
				function getMonitor(monitorName, done) {
					FSBL.Clients.LauncherClient.getMonitorInfo(
						{ monitor: monitorName },
						(err, monitorInfo) => {
							if (err) {
								FSBL.Clients.Logger.error(
									`LauncherClient.getMonitorInfo failed for monitor ${monitorName}, error:`,
									err
								);
							}
							monitors[monitorName] = monitorInfo;
							done();
						}
					);
				}
				function createStore(err, result) {
					if (err) {
						FSBL.Clients.Logger.error(`ToolbarStore.createStores Error:`, err);
					}
					let values = {};
					if (
						monitors.mine &&
						monitors.primary &&
						monitors.mine.deviceId === monitors.primary.deviceId
					) {
						values = { mainToolbar: finsembleWindow.name };
						storeOwner = true; //until we put creator in by default
					}

					/**
					 * When pins are set initially, go through and handle any that
					 * have had display name changes. Additional, remove any
					 * components that are no longer in components.json.
					 *
					 * @param {*} err
					 * @param {*} data
					 * @returns void
					 */
					async function onPinsFirstSet(err, data) {
						const { value: pins } = data;

						// This will be null if there are no pins saved yet.
						// @early-exit
						if (!pins) return;

						const {
							data: components,
						} = await FSBL.Clients.LauncherClient.getComponentList();

						// First we remove any pins that are no longer registered components
						const filteredPins = PinManagerInstance.removePinsNotInComponentList(
							components,
							Object.values(pins)
						);

						// Handle any pins whose components had their displayName changed
						const finalPins = PinManagerInstance.handleNameChanges(
							components,
							filteredPins
						);

						// convert the array back to an object
						const pinObject = PinManagerInstance.convertPinArrayToObject(
							finalPins
						);

						// We don't want this to fire again
						self.GlobalStore.removeListener({ field: "pins" }, onPinsFirstSet);
						self.GlobalStore.setValue({ field: "pins", value: pinObject });
					}

					FSBL.Clients.DistributedStoreClient.createStore(
						{ store: "Finsemble-Toolbar-Store", global: true, values: values },
						(err, store) => {
							if (err) {
								FSBL.Clients.Logger.error(
									`DistributedStoreClient.createStore failed for store Finsemble-Toolbar-Store, error:`,
									err
								);
							}

							self.GlobalStore = store;
							// There should never be a race condition here because the initial pins are
							// set inside of the toolbarSection, which is not rendered
							// until the store is finally finshed initializing
							self.GlobalStore.addListener({ field: "pins" }, onPinsFirstSet);
							done();
						}
					);
				}
				async.forEach(["mine", "primary"], getMonitor, createStore);
			}
		);
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
	setupPinnedHotKeys(cb) {
		//return the number of the F key that is pressed
		if (storeOwner) {
			//console.log("is store owner----")
			//when ctrl+shift+3 is typed, we invoke the callback saying "3" was pressed, which spawns the 3rd component.
			for (let i = 0; i < 10; i++) {
				FSBL.Clients.HotkeyClient.addGlobalHotkey(
					["ctrl", "alt", `${i}`],
					() => {
						if (i === 0) return cb(null, 10);
						cb(null, i);
					}
				);
			}
		}
	}

	/**
	 * Load the menus from the config.json. If there are no items in config.json, menus are loaded from the Finsemble Config `finsemble.menus` item.
	 *
	 *
	 * @param {any} done
	 * @param {any} self
	 * @memberof _ToolbarStore
	 */
	loadMenusFromConfig(done, self) {
		FSBL.Clients.ConfigClient.getValue(
			{ field: "finsemble.menus" },
			(err, menus) => {
				if (err) {
					FSBL.Clients.Logger.error(
						`ConfigClient.getValue failed for finsemble.menus, error:`,
						err
					);
				}
				if (menus && menus.length) {
					self.Store.setValue({
						field: "menus",
						value: menus,
					});
					done();
				} else {
					self.Store.setValue({
						field: "menus",
						value: menuConfig,
					});
					done();
					if (FSBL.Clients.ConfigClient.setValue) {
						FSBL.Clients.ConfigClient.setValue({
							field: "finsemble.menus",
							value: menuConfig,
						});
					}
				}
			}
		);
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
		FSBL.Clients.ConfigClient.addListener(
			{ field: "finsemble.menus" },
			(err, data) => {
				if (err) {
					FSBL.Clients.Logger.error(
						`DistributedStoreClient.getStore -> configStore.addListener failed for Finsemble-Configuration-Store, error:`,
						err
					);
				}
				self.Store.setValue({
					field: "menus",
					value: data.value,
				});
				self.getSectionsFromMenus(data.value);
			}
		);
		done();

		FSBL.Clients.HotkeyClient.addGlobalHotkey(["ctrl", "alt", "t"], () => {
			self.showToolbarAtFront();
		});

		FSBL.Clients.HotkeyClient.addGlobalHotkey(["ctrl", "alt", "h"], () => {
			self.hideToolbar();
		});

		FSBL.System.Window.getCurrent().addEventListener("close-requested", () =>
			this.closeRequestedHandler()
		);
	}

	/**
	 * handles a close request by showing the user a dialog prompting for shutdown.
	 * affirmative will shutdown finsemble, negative will do nothing.
	 */
	async closeRequestedHandler() {
		const args = await this.confirmCloseToolbar();
		// proceed even if there is an error in case the user selected to shut down. Shut down despite error.
		// do nothing if there was an error or they chose cancel.
		if (args.err) {
			Logger.system.log(
				`Error received on confirm close: ${args.err}. Continuing.`
			);
		}
		const choice = _get(args, "result.choice");
		if (choice === "affirmative") {
			FSBL.System.Window.getCurrent().close(true);
			FSBL.shutdownApplication();
		}
	}

	/**
	 * Function to bring toolbar to front (since dockable toolbar can be hidden)
	 * The search input box will be open and any previous results will be displayed
	 * @param {boolean} focus If true, will also focus the toolbar
	 * @memberof _ToolbarStore
	 */
	bringToolbarToFront(focus) {
		var self = this;
		finsembleWindow.bringToFront(null, (err) => {
			if (err) {
				FSBL.Clients.Logger.error(
					`finsembleWindow.bringToFront failed, error:`,
					err
				);
			}

			if (focus) {
				finsembleWindow.focus();
				self.Store.setValue({ field: "searchActive", value: false });
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
		FSBL.Clients.StorageClient.save(
			{ topic: finsembleWindow.name, key: "blurred", value: true },
			cb
		);
	}

	onFocus(cb = Function.prototype) {
		FSBL.Clients.StorageClient.save(
			{ topic: finsembleWindow.name, key: "blurred", value: false },
			cb
		);
	}

	/**
	 * prompts the user to confirm they want to shutdown finsemble
	 * @return Promise
	 * @resolve { err, result }
	 */
	confirmCloseToolbar = () => {
		const dialogParams = {
			title: "Confirm Shutdown",
			question: "Do you wish to shut down finsemble?",
			affirmativeResponseLabel: "Shut down",
			negativeResponseLabel: "Cancel",
			showCancelButton: false,
		};
		return new Promise((resolve) => {
			FSBL.Clients.DialogManager.open("yesNo", dialogParams, (err, result) =>
				resolve({ err, result })
			);
		});
	};

	/**
	 *
	 *
	 *
	 */

	setupHotkeys(cb) {
		var self = this;
		if (storeOwner) {
			let keys = FSBL.Clients.HotkeyClient.keyMap;
			FSBL.Clients.HotkeyClient.addGlobalHotkey(
				[keys.ctrl, keys.alt, keys.up],
				(err) => {
					if (err) {
						FSBL.Clients.Logger.error(
							`HotkeyClient.addGlobalHotkey failed, error:`,
							err
						);
					}
					FSBL.Clients.LauncherClient.bringWindowsToFront();
				}
			);
			FSBL.Clients.HotkeyClient.addGlobalHotkey(
				[keys.ctrl, keys.alt, keys.down],
				(err) => {
					if (err) {
						FSBL.Clients.Logger.error(
							`HotkeyClient.addGlobalHotkey failed, error:`,
							err
						);
					}
					FSBL.Clients.WorkspaceClient.minimizeAll();
				}
			);
			FSBL.Clients.HotkeyClient.addGlobalHotkey(
				[keys.ctrl, keys.alt, keys.f],
				(err) => {
					if (err) {
						FSBL.Clients.Logger.error(
							`HotkeyClient.addGlobalHotkey failed, error:`,
							err
						);
					}
					this.bringToolbarToFront(true);
				}
			);
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
				function(done) {
					self.createStores(done, self);
				},
				function(done) {
					// first ack the previous checkpoint step as done
					FSBL.SystemManagerClient.publishCheckpointState(
						"Toolbar",
						"createStores",
						"completed"
					);
					self.loadMenusFromConfig(done, self);
				},
				FSBL.Clients.ConfigClient.onReady,
				function(done) {
					// first ack the previous checkpoint step as done
					FSBL.SystemManagerClient.publishCheckpointState(
						"Toolbar",
						"loadMenusFromConfig",
						"completed"
					);
					self.addListeners(done, self);
				},
				function(done) {
					// first ack the previous checkpoint step as done
					FSBL.SystemManagerClient.publishCheckpointState(
						"Toolbar",
						"addListeners",
						"completed"
					);
					self.setupHotkeys(done);
				},
				function(done) {
					// first ack the previous checkpoint step as done
					FSBL.SystemManagerClient.publishCheckpointState(
						"Toolbar",
						"setupHotkeys",
						"completed"
					);
					self.listenForWorkspaceUpdates();
					done();
				},
				function(done) {
					// first ack the previous checkpoint step as done
					FSBL.SystemManagerClient.publishCheckpointState(
						"Toolbar",
						"listenForWorkspaceUpdates",
						"completed"
					);
					finsembleWindow.addEventListener("focused", () => {
						self.onFocus();
					});
					finsembleWindow.addEventListener("blurred", () => {
						self.onBlur();
					});
					done();
				},
				function(done) {
					// first ack the previous checkpoint step as done
					FSBL.SystemManagerClient.publishCheckpointState(
						"Toolbar",
						"addMoreListeners",
						"completed"
					);
					done();
				},
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
			left: [],
			right: [],
			center: [],
		};
		menus = menus || this.Store.getValue({ field: "menus" });
		if (menus) {
			for (var i in menus) {
				var menu = menus[i];
				menu.align = menu.align || "left";
				if (menu.align == "none") continue;
				if (!sections[menu.align]) {
					sections[menu.align] = [];
				}
				sections[menu.align].push(menu);
			}
		}

		this.Store.setValue({ field: "sections", value: sections });
		return sections;
	}

	/**
	 * Provides data to the workspace menu opening button.
	 */
	listenForWorkspaceUpdates() {
		FSBL.Clients.RouterClient.subscribe(
			"Finsemble.WorkspaceService.update",
			(err, response) => {
				if (err) {
					FSBL.Clients.Logger.error(
						`RouterClient.subscribe failed for Finsemble.WorkspaceService.update, error:`,
						err
					);
				}

				this.setWorkspaceMenuWindowName(response.data.activeWorkspace.name);
				this.Store.setValue({
					field: "activeWorkspaceName",
					value: response.data.activeWorkspace.name,
				});
				if (
					response.data.reason &&
					response.data.reason === "workspace:load:finished"
				) {
					this.bringToolbarToFront();
				}
			}
		);
	}

	setWorkspaceMenuWindowName(name) {
		if (this.Store.getValue({ field: "workspaceMenuWindowName" }) === null) {
			this.Store.setValue({ field: "workspaceMenuWindowName", value: name });
		}
	}
}

var ToolbarStore = new _ToolbarStore();

export default ToolbarStore;
