/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import async from "async";
import * as menuConfig from '../config.json';

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
			FSBL.Clients.DistributedStoreClient.createStore({ store: "Finsemble-Toolbar-Store", global: true, values: { mainToolbar: fin.desktop.Window.getCurrent().name } }, function (err, store) {
				self.GlobalStore = store;
			});
			done();
		});
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
		console.log('in loadmenus', menuConfig);
		if (Array.isArray(menuConfig) && menuConfig.length) {
			self.Store.setValue({
				field: "menus",
				value: menuConfig
			});
			if (FSBL.Clients.ConfigClient.set) { FSBL.Clients.ConfigClient.set({ field: "finsemble.menus", value: menuConfig }); }
			done();
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
}

var ToolbarStore = new _ToolbarStore();

export default ToolbarStore;