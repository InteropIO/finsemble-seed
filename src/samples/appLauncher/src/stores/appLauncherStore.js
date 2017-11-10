/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

let ToolbarStore, appLauncherStore;
import async from "async";
let finWindow = fin.desktop.Window.getCurrent();
const COMPONENT_UPDATE_CHANNEL = `${finWindow.name}.ComponentsToRender`;

FSBL.Clients.RouterClient.addPubSubResponder(COMPONENT_UPDATE_CHANNEL, {});
var Actions = {
	initialize: function (done) {
		//Initializes data for our store.
		Actions.initializeComponentList();
		Actions.getUserDefinedComponentList();
		done();
	},
	getComponentList() {
		FSBL.Clients.LauncherClient.getComponentList(function (err, response) {
			if (err) {
				throw new Error(err);
			}
			//Each AppLauncher
			console.log("componentList--",response)
			Actions.filterComponents(response);
		});
	},
	initializeComponentList() {
		var self = Actions;
		Actions.getComponentList();

		//When an app launcher button is clicked, it sends over the types of components that the app launcher can spawn. We assign that data to an object in the windowClient, and then use that to render the app launcher.
		FSBL.Clients.RouterClient.subscribe(COMPONENT_UPDATE_CHANNEL, function (err, response) {
			Object.assign(FSBL.Clients.WindowClient.options.customData, response.data);
			Actions.getComponentList();
		});

		//Whenever we add or remove a component, this event is fired. We get a list of all components, then filter it out to include only the ones that this particular launcher is capable of spawning.
		FSBL.Clients.RouterClient.addListener("Launcher.update", function (err, response) {
			console.log("list updated", err, response);
			if (err) {
				return console.error(err);
			}
			self.filterComponents(response.data.componentList);
		});
	},
	//get adhoc components that the user created from storage.
	getUserDefinedComponentList() {
		var self = Actions;
		FSBL.Clients.StorageClient.get({ topic: "finsemble", key: "userDefinedComponents" }, function (err, response) {
			var data = response;
			if (data) {
				var udComponents = Object.keys(data);
				for (var i = 0; i < udComponents.length; i++) {
					var component = data[udComponents[i]];
					FSBL.Clients.LauncherClient.addUserDefinedComponent({
						name: component.component.type,
						url: component.window.url
					});
				}
			}
		});
	},
	//saves adhoc components
	saveCustomComponents() {
		var UDCs = {};
		var components = Object.keys(Actions.componentList);
		for (var i = 0; i < components.length; i++) {
			var config = Actions.componentList[components[i]];
			if (config.component && config.component.isUserDefined) {
				UDCs[config.component.type] = config;
			}
		}
		FSBL.Clients.StorageClient.save({
			topic: "finsemble",
			key: "userDefinedComponents",
			value: UDCs
		});
	},
	/**
	 * This is necessary because we can also pin other things, such as workspaces. We don't care about those. This function filters out data from the Toolbar.
	 *
	 * @param {any} pins
	 */
	filterPinsFromToolbar(pins) {
		let filteredPins = [];
		if (pins) {
			for (var p in pins) {
				let item = pins[p];
				if (item && item.type === "componentLauncher") {
					filteredPins.push(item);
				}
			}
		}
		appLauncherStore.setValue({ field: "pins", value: filteredPins });
	},
	// This filters components based on the mode and list settings in customData
	// Available settings are list - where you list specfic individual component Types, mode - which piggybacks on config.mode and lists all components where the mode matches
	// If neither mode not list are set, all components are shown
	// Custom Components are always shown @TODO - make this a setting
	filterComponents(components) {
		var self = this;
		var settings = FSBL.Clients.WindowClient.options.customData;
		self.componentList = {};
		var keys = Object.keys(components);
		if (settings.mode) {
			if (!Array.isArray(settings.mode)) { settings.mode = [settings.mode]; }
			keys.forEach((componentType) => {
				var config = components[componentType];
				var componentMode = (config.component && config.component.mode) ? config.component.mode : "";

				if (componentMode || componentMode === "") {
					// component.mode can either be a string or an array of strings. So rationalize it to an array.
					if (componentMode.constructor !== Array) {
						componentMode = [componentMode];
					}

					let commonModes = componentMode.filter(function (n) {
						return settings.mode.indexOf(n) !== -1;
					});

					// If the current mode isn't in the list of modes for the component then don't include it in our list
					if (commonModes.length) {
						self.componentList[componentType] = components[componentType];
					}
				}

			});
		}
		if (settings.list) {
			commonItems = settings.list.filter(function (n) {
				return keys.indexOf(n) !== -1;
			});

			for (let i = 0; i < commonItems.length; i++) {
				self.componentList[commonItems[i]] = components[commonItems[i]];
			}

		}
		if (!settings.mode && !settings.list) {
			self.componentList = components;
		} else {
			for (let i = 0; i < keys.length; i++) {
				let component = components[keys[i]];
				if (component.component.isUserDefined) { self.componentList[keys[i]] = component; }
			}
		}
		appLauncherStore.setValue({ field: "componentList", value: self.componentList });
		self.saveCustomComponents();
	},
	//toggles the pinned state of the component. This change will be broadcast to all toolbars so that the state changes in each component.
	togglePin(componentToToggle) {
		var componentType = componentToToggle.component.type;
		var componentIcon;
		try {
			componentIcon = componentToToggle.foreign.components.Toolbar.iconClass;
		} catch (e) {
			componentIcon = "";
		}

		var pins = appLauncherStore.values.pins;
		var thePin = {
			type: "componentLauncher",
			label: componentType,
			component: componentType,
			fontIcon: componentIcon,
			toolbarSection: "center"
		};
		var wasPinned = false;
		for (var i = 0; i < pins.length; i++) {
			var pin = pins[i];
			if (pin.label === componentType) {
				pins.splice(i, 1);
				wasPinned = true;
				break;
			}
		}
		if (!wasPinned) {
			pins.push(thePin);
		}

		if (wasPinned) {
			ToolbarStore.removeValue({ field: "pins." + componentType });
		} else {
			ToolbarStore.setValue({ field: "pins." + componentType, value: thePin });
		}
	},
	//Handler for when the user wants to remove an adhoc component.
	handleRemoveCustomComponent(componentName) {
		var self = this;
		FSBL.Clients.DialogManager.open("yesNo", {
			question: "Are you sure you would like to delete \"" + componentName + "\"?",
		}, function (err, response) {
			if (response.choice === "affirmative") {
				self.removeCustomComponent(componentName);
			}
		});
	},
	//Remove the component, notify others.
	removeCustomComponent(componentName) {
		var self = this;
		FSBL.Clients.LauncherClient.removeUserDefinedComponent({
			name: componentName
		}, function (err, response) {
			if (err) {
				return console.error(err);
			}
			var pins = appLauncherStore.values.pins;
			var wasPinned = false;
			if (pins) {
				for (var i = 0; i < pins.length; i++) {
					var pin = pins[i];
					if (pin.label === componentName) {
						wasPinned = true;
						break;
					}
				}
				if (wasPinned) {
					self.togglePin({
						component: {
							type: componentName
						}
					});
				}
			}
			Actions.getComponentList();
		});
	},
	//Hide the window.
	hideWindow() {
		fin.desktop.Window.getCurrent().hide();
	},
	//Spawn a component.
	launchComponent(config, data) {
		Actions.hideWindow();
		FSBL.Clients.LauncherClient.spawn(config.component.type, { addToWorkspace: true }, {monitor: "mine" });
	},
	//Retrieve pins from the store.
	getPins(cb) {
		appLauncherStore.getValue({ field: "pins" }, cb);
	}
};


function createLocalStore(done) {
	let defaultData = {
		componentList: {},
		pins: [],
		monitorDimensions: {}
	};

	FSBL.Clients.DistributedStoreClient.createStore({ store: "Finsemble-AppLauncher-Local-Store", values: defaultData }, function (err, store) {
		appLauncherStore = store;
		done();
	});
}

function getToolbarStore(done) {
	FSBL.Clients.DistributedStoreClient.getStore({ global: true, store: "Finsemble-Toolbar-Store" }, function (err, store) {
		ToolbarStore = store;
		store.getValue({ field: "pins" }, function (err, pins) {
			if (pins) { Actions.filterPinsFromToolbar(pins); }
		});

		store.addListener({ field: "pins" }, function (err, pins) {
			if (pins) { Actions.filterPinsFromToolbar(pins.value); }
		});
		done();
	});
}

function initialize(cb) {
	async.parallel([
		createLocalStore,
		getToolbarStore,
		Actions.initialize
	], function (err) {
		if (err) {
			console.error(err);
		}

		cb(appLauncherStore);
	});
}
let getStore = () => {
	return appLauncherStore;
};

export { initialize };
export { appLauncherStore as Store };
export { Actions };
export { getStore };
