import _get from 'lodash.get';
import { getStore } from "./LauncherStore";
import AppDirectory from "../modules/AppDirectory";
import FDC3 from "../modules/FDC3";
const async = require("async");
let FDC3Client;
let appd;
let appDEndpoint;
let ToolbarStore;

export default {
	initialize,
	addApp,
	addNewFolder,
	addAppToFolder,
	removeAppFromFolder,
	renameFolder,
	deleteFolder,
	deleteApp,
	deleteTag,
	reorderFolders,
	getDeleted,
	getFolders,
	getFoldersList,
	getActiveFolderName,
	getActiveFolder,
	getSingleFolder,
	getAllAppsTags,
	getAllApps,
	getFormStatus,
	getSearchText,
	getSortBy,
	addTag,
	getTags,
	addPin,
	removePin,
	getApp,
	getDragDisabled,
	getConstants
};

const data = {};
const ADVANCED_APP_LAUNCHER = "Advanced App Launcher";


//returns names of default folders.
function getConstants() {
	const DASHBOARDS = 'Dashboards'
	const FAVORITES = 'Favorites'
	return { ADVANCED_APP_LAUNCHER, DASHBOARDS, FAVORITES }
}

//Add to here if you want to disable dragging on a folder.
function getDragDisabled() {
	const { ADVANCED_APP_LAUNCHER, DASHBOARDS, FAVORITES } = getConstants();
	return [ADVANCED_APP_LAUNCHER, DASHBOARDS, FAVORITES]

}

function initialize(callback = Function.prototype) {
	FSBL.Clients.ConfigClient.getValue({ field: "finsemble.appDirectoryEndpoint" }, function (err, appDirectoryEndpoint) {
		// cache value globally to be used in the event that we need to fetch data for a given component.
		appDEndpoint = appDirectoryEndpoint;
		const store = getStore();

		// If the store contains a 'deleted' array the list of folders and apps should be filtered according to it
		data.deleted = store.values.deleted || [];
		let folderList, appList = {};

		if (data.deleted.length > 0) {
			folderList = store.values.appFolders.list.filter(folderName => {
				return !data.deleted.includes(folderName);
			});

			console.log("folderList: ", folderList);

			Object.keys(store.values.appDefinitions).map(appName => {
				if (!data.deleted.includes(appName)) {
					appList[appName] = store.values.appDefinitions[appName];
				}
			});

			_setValue("appFolders.list", folderList);
			_setValue("appDefinitions", appList);
		}

		data.folders = store.values.appFolders.folders;
		data.foldersList = folderList || store.values.appFolders.list;
		data.apps = appList || store.values.appDefinitions;
		data.tags = store.values.activeLauncherTags;
		data.activeFolder = store.values.activeFolder;
		data.filterText = store.values.filterText;
		data.sortBy = store.values.sortBy;
		data.isFormVisible = store.values.isFormVisible;
		data.configComponents = {};

		// Add listeners to keep our copy up to date
		store.addListener({ field: "appFolders.folders" }, (err, dt) => data.folders = dt.value);
		store.addListener({ field: "appFolders.list" }, (err, dt) => data.foldersList = dt.value);
		store.addListener({ field: "appDefinitions" }, (err, dt) => data.apps = dt.value);
		store.addListener({ field: "activeFolder" }, (err, dt) => data.activeFolder = dt.value);
		store.addListener({ field: "isFormVisible" }, (err, dt) => data.isFormVisible = dt.value);
		store.addListener({ field: "sortBy" }, (err, dt) => data.sortBy = dt.value);
		store.addListener({ field: "activeLauncherTags" }, (err, dt) => data.tags = dt.value);
		store.addListener({ field: "deleted" }, (err, dt) => data.deleted = dt.value);

		getToolbarStore((err, response) => {
			FSBL.Clients.RouterClient.subscribe("Finsemble.Service.State.launcherService", (err, response) => {
				loadInstalledComponentsFromStore(() => {
					//We load our stored components(config driven) here
					loadInstalledConfigComponents(() => {
						updateAppsInFolders(callback);
					});
				});

			});
		});
	});
}

function getDeleted() {
	return data.deleted;
}

//This gets a specific app in FDC3 and returns the results
function getApp(appID, cb = Function.prototype) {
	appd.get(appID).then(app => cb(null, app)).catch(err => cb(err));
}
// Check to see if an app is already in our list of apps
function appInAppList(appName) {
	let app = findAppByField('name', appName);
	return Boolean(app);
}
//Update apps in folders with updated config information
function updateAppsInFolders(cb = Function.prototype) {
	//Loop through folders and update apps with new info
	const { ADVANCED_APP_LAUNCHER: advancedAppLauncherFolderName } = getConstants(); 
	Object.keys(data.folders).map(folderName => {
		if (folderName === advancedAppLauncherFolderName) return;
		else {
			const folder = data.folders[folderName];
			Object.values(data.configComponents).map(configComp => {
				if (Object.keys(folder.apps).includes(configComp.appID)) {
					data.folders[folderName].apps[configComp.appID] = configComp;
				}
			});
		}
	});
	_setFolders(cb);
}

/**
 * Given a component config, will return tags, or an empty array.
 *
 * @param {*} componentConfig
 * @returns
 */
function extractTagsFromFinsembleComponentConfig(componentConfig) {
	if (!componentConfig.foreign) return [];
	if (!componentConfig.foreign.components) return [];
	if (!componentConfig.foreign.components["App Launcher"]) return [];

	const { tags } = componentConfig.foreign.components["App Launcher"];

	if (tags) {
		if (typeof tags === "string") {
			return [tags];
		}
		return tags;
	}

	return [];
}
/**
 * Instantiates classes needed to interact with the appD server.
 * Only done when needed. If there are no components with source 'FDC3', this code will not execute.
 */
function lazyLoadAppD() {
	if (!FDC3Client) FDC3Client = new FDC3({ url: appDEndpoint });
	if (!appd) appd = new AppDirectory(FDC3Client);
}

/**
 * Here we load apps from FDC3
 * @param {*} cb
 */
function loadInstalledComponentsFromStore(cb = Function.prototype) {
	async.map(Object.values(data.apps), (component, componentDone) => {
		// Load FDC3 components here
		if (component.source && component.source === "FDC3") {
			lazyLoadAppD();
			// get the app info so we can load it into the launcher
			return getApp(component.appID, (err, app) => {
				if (err) {// don't want to kill this;
					deleteApp(component.appID);
					console.error("there was an error loading from FDC3", component, err);
					return componentDone();
				}
			});
		}
		// We'll load our user defined components here
		FSBL.Clients.LauncherClient.addUserDefinedComponent(component, (compAddErr) => {
			if (compAddErr) {
				console.warn("Failed to add new app:", compAddErr);
			}
			componentDone(compAddErr);
		});
	}, (err) => {
		cb(err);
	});
}
// We load our apps that were loaded from the config.
function loadInstalledConfigComponents(cb = Function.prototype) {
	// Get the list of components from the launcher service
	FSBL.Clients.LauncherClient.getComponentList((err, componentList) => {
		let componentNameList = Object.keys(componentList);
		
		/*
		 * Update the folders under the "App" menu and delete any apps in the folder 
		 * that are no longer in the config and are not user defined components.
		 */
		const { folders } = data;
		// Get the user defined apps
		const apps = Object.keys(data.apps);
		Object.keys(folders).forEach(folderName => {
			const appsName = Object.keys(folders[folderName]["apps"]);
			appsName.forEach(appName => {
				// If the component is not in the config component list and is not a user defined component
				if (!componentNameList.includes(appName) && !apps.includes(folders[folderName]["apps"][appName]["appID"].toString())) {
					// Delete app from the folder
					delete folders[folderName]["apps"][appName];
				}
			})
		});
		
		componentNameList.map(componentName => {
			// If the app is already in our list move on
			if (appInAppList(componentName)) return;
			const component = componentList[componentName];
			const launchableByUser = _get(component, 'foreign.components.App Launcher.launchableByUser');
			// Make sure the app is launchable by user
			if (launchableByUser) {
				data.configComponents[componentName] = {
					appID: componentName,
					icon: component.foreign.Toolbar && component.foreign.Toolbar.iconClass ? component.foreign.Toolbar.iconClass : null,
					name: componentName,
					displayName: component.component.displayName || componentName,
					source: "config",
					tags: extractTagsFromFinsembleComponentConfig(component)
				};
			}
		});
		cb();
	});
}

function getToolbarStore(done) {
	FSBL.Clients.DistributedStoreClient.getStore({ global: true, store: "Finsemble-Toolbar-Store" }, function (err, store) {
		ToolbarStore = store;
		store.getValue({ field: "pins" }, function (err, pins) {
			data.pins = pins;
		});

		store.addListener({ field: "pins" }, function (err, pins) {
			data.pins = pins;
		});
		done();
	});
}

function _setValue(field, value, cb = Function.prototype) {
	getStore().setValue({
		field: field,
		value: value
	}, (error, data) => {
		if (error) {
			console.log("Failed to save. ", field);
			return cb(error);
		} else {
			cb && cb();
		}
	});
}

function _setFolders(cb = Function.prototype) {
	_setValue("appFolders.folders", data.folders, (err, data) => {
		if (err) {
			console.log("Failed to save modified folder list.");
			return;
		}

		cb();
	});
}

function addPin(pin) {
	//TODO: This logic may not work for dashboards. Might need to revisit.
	FSBL.Clients.LauncherClient.getComponentList((err, components) => {
		let componentToToggle;
		for (let i = 0; i < Object.keys(components).length; i++) {
			let componentName = Object.keys(components)[i];
			//pin name "Welcome" will not be found in component list with "Welcome Component".
			//Will check both for actual name, and for pin.name + Component against the list
			if (componentName === pin.name || componentName === pin.name + " Component") {
				componentToToggle = components[componentName];
			}
		}

		if (componentToToggle) {
			let componentType = componentToToggle.group || componentToToggle.component.type || pin.name;
			let fontIcon;
			try {
				if (componentToToggle.group) {
					fontIcon = "ff-ungrid";
				} else {
					fontIcon = componentToToggle.foreign.components.Toolbar.iconClass;
				}
			} catch (e) {
				fontIcon = "";
			}

			let imageIcon;
			try {
				imageIcon = componentToToggle.foreign.components.Toolbar.iconURL;
			} catch (e) {
				imageIcon = "";
			}


			let params = { addToWorkspace: true, monitor: "mine" };
			if (componentToToggle.component && componentToToggle.component.windowGroup) { params.groupName = componentToToggle.component.windowGroup; }
			var thePin = {
				type: "componentLauncher",
				label: pin.displayName || pin.name,
				component: componentToToggle.group ? componentToToggle.list : componentType,
				fontIcon: fontIcon,
				icon: imageIcon,
				toolbarSection: "center",
				uuid: uuidv4(),
				params: params
			};
			ToolbarStore.setValue({ field: "pins." + pin.name.replace(/[.]/g, "^DOT^"), value: thePin });
		}
	});

}

function removePin(pin) {
	ToolbarStore.removeValue({ field: "pins." + pin.name.replace(/[.]/g, "^DOT^") });
}

function getFolders() {
	return data.folders;
}

function getFoldersList() {
	return data.foldersList;
}

function getAllApps() {
	let mergedApps = Object.assign({}, data.apps, data.configComponents);;
	return mergedApps;
}

function getFormStatus() {
	return data.isFormVisible;
}

function getSingleFolder(folderName) {
	return data.folders[folderName];
}

function reorderFolders(destIndex, srcIndex) {
	//There are two types of folders: Those that can be arranged, and those that cannot. We don't want to reorder the folders relative to the unorderable folders. Split them out, and then combine them after doing the filtering/swapping.
	const dragDisabled = getDragDisabled();
	const unorderableFolders = data.foldersList.filter(folderName => dragDisabled.includes(folderName));
	const orderableFolders = data.foldersList.filter(folderName => !dragDisabled.includes(folderName));
	const movedFolder = orderableFolders[destIndex];
	const remainingItems = orderableFolders.filter((item, index) => index !== destIndex);
	data.foldersList = [
		...unorderableFolders,
		...remainingItems.slice(0, srcIndex),
		movedFolder,
		...remainingItems.slice(srcIndex)
	];
	_setValue("appFolders.list", data.foldersList);
	return data.foldersList;
}

function addApp(app = {}, cb) {
	const appID = (new Date()).getTime();
	const folder = data.activeFolder;
	const newAppData = {
		appID,
		tags: app.tags !== "" ? app.tags.split(",") : [],
		name: app.name,
		url: app.url,
		type: "component"
	};
	const { FAVORITES } = getConstants();

	FSBL.Clients.LauncherClient.addUserDefinedComponent(newAppData, (compAddErr) => {
		if (compAddErr) {
			//TODO: We need to handle the error here. If the component failed to add, we should probably fall back and not add to launcher
			cb({ code: "failed_to_add_app", message: compAddErr });
			console.warn("Failed to add new app:", compAddErr);
			return;
		}
		// If we're creating the app while in the favorites folder,
		// we need to make sure it gets pinned to the toolbar
		if (folder === FAVORITES) addPin({ name: app.name });
		data.apps[appID] = newAppData;
		data.folders[ADVANCED_APP_LAUNCHER].apps[appID] = newAppData;
		data.folders[folder].apps[appID] = newAppData;
		// Save appDefinitions and then folders
		_setValue("appDefinitions", data.apps, () => {
			_setFolders();
			cb && cb();
		});
	});
}

function deleteApp(appID) {

	ToolbarStore.removeValue({ field: "pins." + data.apps[appID].name.replace(/[.]/g, "^DOT^") }, (err, res) => {
		if (err) {
			//TODO: Need to gracefully handle this error. If the pin can't be removed, the app shouldn't either
			console.warn("Error removing pin for deleted app");
			return;
		}
		// Delete app from any folder that has it
		for (const key in data.folders) {
			if (data.folders[key].apps[appID]) {
				delete data.folders[key].apps[appID];
			}
		}
		// Delete app from the apps list
		FSBL.Clients.LauncherClient.removeUserDefinedComponent(data.apps[appID], () => {
			delete data.apps[appID];
			// Save appDefinitions and then folders
			_setValue("appDefinitions", data.apps, () => {
				_setFolders();
			});
		});

	});
}

function addNewFolder(name) {
	if (data.deleted.includes(name)) return;
	// Each new folder is given a number, lets store them here
	// to get the highest one and then increment
	const newFoldersNums = [0];
	// Find folders that have a name of "New folder" or "New folder #"
	data.foldersList.forEach((folder) => {
		const numbers = folder.match(/\d+/g) || [];
		newFoldersNums.push(Math.max.apply(this, numbers));
	});
	const highestFolderNumber = Math.max.apply(this, newFoldersNums);
	const folderName = name || `New folder ${highestFolderNumber + 1}`;
	const newFolder = {
		disableUserRemove: true,
		icon: "ff-adp-hamburger",
		canEdit: true,
		canDelete: true,
		apps: {}
	};
	data.folders[folderName] = newFolder;
	_setFolders(() => {
		// Update folders order if adding was successful
		data.foldersList.push(folderName);
		_setValue("appFolders.list", data.foldersList);
	});

}

function deleteFolder(folderName) {
	// Check if user is trying to delete the active folder
	if (folderName === data.activeFolder) {
		data.activeFolder = ADVANCED_APP_LAUNCHER;
		_setValue("activeFolder", data.activeFolder);
	}

	const deletedFolders = data.deleted;
	deletedFolders.push(folderName);

	delete data.folders[folderName] && _setFolders(() => {
		// Update the order of folders
		const index = data.foldersList.indexOf(folderName);
		data.foldersList.splice(index, 1);
		_setValue("appFolders.list", data.foldersList);
		_setValue("deleted", deletedFolders);
	});
}

function renameFolder(oldName, newName) {
	let oldFolder = data.folders[oldName];
	data.folders[newName] = oldFolder;
	_setFolders(() => {
		let indexOfOld = data.foldersList.findIndex((folderName) => {
			return folderName === oldName;
		});
		data.foldersList[indexOfOld] = newName;

		// If the name the user is attempting to rename to is the name of an old deleted folder
		// remove the key from deleted and allow rename
		if (data.deleted.includes(newName)) {
			const index = data.deleted.indexOf(newName);
			const deletedFolders = data.deleted;
			deletedFolders.splice(index, 1);
			_setValue("deleted", deletedFolders);
		}

		_setValue("appFolders.list", data.foldersList);
		delete data.folders[oldName];
	});
}

function addAppToFolder(folderName, app) {
	data.folders[folderName].apps[app.appID] = {
		name: app.name,
		displayName: app.displayName,
		appID: app.appID
	};
	_setFolders();
}

function removeAppFromFolder(folderName, app) {
	delete data.folders[folderName].apps[app.appID];
	_setFolders();
}
/**
 * Given a field, search through FDC3 apps and apps pulled in via config and return that app.
 * */
function findAppByField(field, value) {
	return Object.values(data.apps).find(app => app ? app[field] === value : false) ||
		Object.values(data.configComponents).find(app => app ? app[field] === value : false)
}

function getActiveFolder() {
	const folder = data.folders[data.activeFolder];
	Object.values(folder.apps).map((app) => {
		const appData = findAppByField('appID', app.appID)
		if (!appData) {
			app.tags = [];
		} else {
			app.tags = appData.tags;
		}
	});
	//Need a name for the AppDefinition/AppActionsMenu rendering
	folder.name = data.activeFolder;
	return folder;
}

function getActiveFolderName() {
	return data.activeFolder;
}

function getSearchText() {
	return data.filterText;
}

function getSortBy() {
	return data.sortBy;
}

function getTags() {
	return data.tags;
}

function getAllAppsTags() {
	let tags = [];
	// Pull tags from applications installed via FDC3 and the component config.
	const apps = Object.values(data.apps).concat(Object.values(data.configComponents));

	apps.forEach((app) => {
		tags = tags.concat(app.tags);
	});
	// return unique ones only
	return tags.filter((tag, index) => {
		return tags.indexOf(tag) === index;
	});
}

function addTag(tag) {
	// Push new tag to list
	console.log("addTag", tag);
	data.tags.indexOf(tag) < 0 && data.tags.push(tag);
	// Update tags in store
	_setValue("activeLauncherTags", data.tags);
}

function deleteTag(tag) {
	// Push new tag to list
	data.tags.splice(data.tags.indexOf(tag), 1);
	// Update tags in store
	console.log("deleteTag", data.tags);
	_setValue("activeLauncherTags", data.tags);
}

function uuidv4() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0,
			v = c === "x" ? r : r & 0x3 | 0x8;
		return v.toString(16);
	});
}
