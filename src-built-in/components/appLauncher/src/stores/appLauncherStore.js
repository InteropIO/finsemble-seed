/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/

let ToolbarStore, appLauncherStore, windowGroupStore;
import async from "async";
var COMPONENT_UPDATE_CHANNEL;
function uuidv4() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0,
			v = c === "x" ? r : r & 0x3 | 0x8;
		return v.toString(16);
	});
}

var Actions = {
	initialize: function (cb) {
		async.parallel([
			Actions.initializeComponentList,
			Actions.getUserDefinedComponentList,
			setupHotkeys
		], function (err) {
			if (err) {
				console.error(err);
			}
			FSBL.Clients.Logger.debug("Actions.initialize done");
			cb();
		});
	},
	getComponentList(cb) {
		FSBL.Clients.LauncherClient.getComponentList(function (err, response) {
			if (err) {
				throw new Error(err);
			}
			//Each AppLauncher
			FSBL.Clients.Logger.debug("getComponentList from LauncherClient", response);
			Actions.filterComponents(response);
			if (cb) {
				cb();
			}
		});
	},
	initializeComponentList(cb) {
		var self = Actions;
		var firstTime = true;

		//When an app launcher button is clicked, it sends over the types of components that the app launcher can spawn. We assign that data to an object in the windowClient, and then use that to render the app launcher.
		FSBL.Clients.RouterClient.subscribe(COMPONENT_UPDATE_CHANNEL, function (err, response) {

			if (!FSBL.Clients.WindowClient.options.customData.spawnData) { FSBL.Clients.WindowClient.options.customData.spawnData = {}; }
			Object.assign(FSBL.Clients.WindowClient.options.customData.spawnData, response.data);
			if (firstTime) { // only update component list the first time to eliminate re-rendering the menu
				Actions.getComponentList(cb);
				firstTime = false;
			}
		});

		//Whenever we add or remove a component, this event is fired. We get a list of all components, then filter it out to include only the ones that this particular launcher is capable of spawning.
		FSBL.Clients.RouterClient.subscribe("Launcher.update", function (err, response) {
			FSBL.Clients.Logger.debug("list updated", err, response);
			if (err) {
				return console.error(err);
			}
			self.filterComponents(response.data.componentList);
		});
	},
	//get quick components that the user created from storage.
	getUserDefinedComponentList(cb) {
		return cb();
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
			cb();
		});
	},
	//saves quick components
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
	// Available settings are list - where you list specific individual component Types, mode - which piggybacks on config.mode and lists all components where the mode matches
	// If neither mode not list are set, all components are shown
	// Custom Components are always shown @TODO - make this a setting
	filterComponents(components) {
		var self = this;
		var settings = FSBL.Clients.WindowClient.options.customData.spawnData;
		var componentList = {};
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
						componentList[componentType] = components[componentType];
					}
				}

			});
		}
		if (settings.list) {
			var commonItems = settings.list.filter(function (n) {
				return keys.indexOf(n) !== -1;
			});

			for (let i = 0; i < commonItems.length; i++) {
				componentList[commonItems[i]] = components[commonItems[i]];
			}

		}
		if (!settings.mode && !settings.list) {
			componentList = components;
		} else {
			for (let i = 0; i < keys.length; i++) {
				let component = components[keys[i]];
				if (component.component.isUserDefined) { componentList[keys[i]] = component; }
			}
		}

		self.componentList = componentList;

		FSBL.Clients.Logger.debug("appLauncher filterComponents", self.componentList, "settings", settings, "customData", FSBL.Clients.WindowClient.options.customData);
		appLauncherStore.setValue({ field: "componentList", value: self.componentList });
		self.saveCustomComponents();
	},
	//toggles the pinned state of the component. This change will be broadcast to all toolbars so that the state changes in each component.
	togglePin(componentToToggle) {
		var componentType = componentToToggle.group || componentToToggle.component.type;
		var fontIcon;
		try {
			if (componentToToggle.group) {
				fontIcon = "ff-ungrid";
			} else {
				fontIcon = componentToToggle.foreign.components.Toolbar.iconClass;
			}
		} catch (e) {
			fontIcon = "";
		}

		var imageIcon;
		try {
			imageIcon = componentToToggle.foreign.components.Toolbar.iconURL;
		} catch (e) {
			imageIcon = "";
		}

		//No dots allowed in keys in the global store, so escaping dots

		var pins = appLauncherStore.getValue("pins");
		let params = { addToWorkspace: true, monitor: "mine" };
		if (componentToToggle.component && componentToToggle.component.windowGroup) {
			params.groupName = componentToToggle.component.windowGroup;
		}

		//Component developers can define a display name that will show instead of the component's type.
		let displayName = componentType;
		if (componentToToggle.component && componentToToggle.component.displayName) {
			displayName = componentToToggle.component.displayName;
		}

		var thePin = {
			type: "componentLauncher",
			label: displayName,
			component: componentToToggle.group ? componentToToggle.list : componentType,
			fontIcon: fontIcon,
			icon: imageIcon,
			toolbarSection: "center",
			uuid: uuidv4(),
			params: params
		};
		var wasPinned = false;
		for (var i = 0; i < pins.length; i++) {
			var pin = pins[i];
			if (pin.component === componentType) {
				pins.splice(i, 1);
				wasPinned = true;
				break;
			}
		}
		if (!wasPinned) {
			pins.push(thePin);
		}

		var componentTypeDotRemove = displayName.replace(/[.]/g, "^DOT^");

		if (wasPinned) {
			ToolbarStore.removeValue({ field: "pins." + componentTypeDotRemove });
		} else {
			ToolbarStore.setValue({ field: "pins." + componentTypeDotRemove, value: thePin });
		}
	},
	//Handler for when the user wants to remove a quick component.
	handleRemoveCustomComponent(componentName) {
		var self = this;
		FSBL.Clients.DialogManager.open("yesNo", {
			title: "Delete this App?",
			question: "Are you sure you would like to delete \"" + componentName + "\"?",
			affirmativeResponseLabel: "Delete",
			showNegativeButton: false
		}, function (err, response) {
			// If the user chooses "affirmative" then delete the component.
			// We should never get an error, but if we do then go ahead and delete the component too.
			if (err || response.choice === "affirmative") {
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
		finsembleWindow.hide();
	},
	//Spawn a component.
	launchComponent(config, params, cb) {
		//Actions.hideWindow();
		console.log("launchComponent");
		let defaultParams = { addToWorkspace: true, monitor: "mine", options: { customData: {} } };
		params = Object.assign(defaultParams, params);
		if (!params.options.customData) { params.options.customData = {}; }
		if (!params.options.customData.component) { params.options.customData.component = {}; }
		if (config.component.windowGroup) { params.groupName = config.component.windowGroup; }
		FSBL.Clients.LauncherClient.spawn(config.component.type, params, function (err, windowInfo) {
			if (cb) {
				cb(windowInfo.windowIdentifier);
			}
		});
	},
	//Retrieve pins from the store.
	getPins(cb) {
		appLauncherStore.getValue({ field: "pins" }, cb);
	},
	createNewWindowGroup(groupPrefix, cb) {
		windowGroupStore.getValue({ field: groupPrefix }, function (err, value) {
			var currentGroup = 1;
			if (value) {
				currentGroup = Math.max(...Object.keys(value)) + 1;
			}
			let groupName = groupPrefix + "." + currentGroup;
			FSBL.Clients.LauncherClient.createWindowGroup({
				groupName: groupName
			}, function (err, response) {
				cb(groupName);
			});
		});
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



function getWindowGroupStore(done) {
	FSBL.Clients.DistributedStoreClient.getStore({ global: true, store: "Finsemble-WindowGroups" }, function (err, store) {
		windowGroupStore = store;
		done();
	});
}

function initialize(cb) {
	COMPONENT_UPDATE_CHANNEL = `${finsembleWindow.name}.ComponentsToRender`;
	FSBL.Clients.RouterClient.addPubSubResponder(COMPONENT_UPDATE_CHANNEL, {});
	async.parallel([
		createLocalStore,
		getToolbarStore,
		getWindowGroupStore,
		Actions.initialize
	], function (err) {
		if (err) {
			console.error(err);
		}
		FSBL.Clients.Logger.debug("appLauncherstore init done");
		cb(appLauncherStore);
	});
}
var keys = {};
function setupHotkeys(cb) {

	FSBL.Clients.RouterClient.subscribe("humanInterface.keydown", function (err, response) {
		if (!keys[response.data.key]) { keys[response.data.key] = {}; }
		keys[response.data.key] = true;
		if (keys[160] && keys[162] && keys[68]) {
			if (Actions.componentList["Advanced Chart"]) {
				FSBL.Clients.LauncherClient.spawn("Advanced Chart", { addToWorkspace: true }, { monitor: "mine" });
			}
		}
	});
	FSBL.Clients.RouterClient.subscribe("humanInterface.keyup", function (err, response) {
		if (!keys[response.data.key]) { keys[response.data.key] = {}; }
		keys[response.data.key] = false;
	});

	return cb();
}
let getStore = () => {
	return appLauncherStore;
};

export { initialize };
export { appLauncherStore as Store };
export { Actions };
export { getStore };
