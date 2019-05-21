/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
*/
import AppDirectory from "../modules/AppDirectory";
import FDC3 from "../modules/FDC3";
import { getStore } from "./appStore";
import * as path from "path";
export default {
	initialize,
	getApps,
	getFilteredApps,
	clearFilteredApps,
	searchApps,
	getActiveTags,
	getTags,
	addTag,
	removeTag,
	clearTags,
	addApp,
	removeApp,
	openApp,
	clearApp,
	getInstalledApps,
	getActiveApp
};

let ToolbarStore;
const data = {};
let FDC3Client;
let appd;

function initialize(done = Function.prototype) {
	FSBL.Clients.ConfigClient.getValue({ field: "finsemble.appDirectoryEndpoint" }, function (err, appDirectoryEndpoint) {
		FDC3Client = new FDC3({ url: appDirectoryEndpoint });
		appd = new AppDirectory(FDC3Client);


		const store = getStore();
		data.apps = store.values.apps;
		store.getValue({ field: "appFolders.folders" }, (err, folders) => {
			data.folders = folders;
			store.addListener({ field: "appFolders.folders" }, (err, dt) => data.folders = dt.value);
		});
		store.getValue({ field: "activeFolder" }, (err, active) => {
			data.activeFolder = active;
			store.addListener({ field: "activeFolder" }, (err, dt) => data.activeFolder = dt.value);
		});
		store.getValue({ field: "defaultFolder" }, (err, folder) => {
			data.defaultFolder = folder;
		});
		data.installed = store.values.appDefinitions;
		data.tags = store.values.tags;
		data.filteredApps = store.values.filteredApps;
		data.activeTags = store.values.activeTags;
		data.activeApp = store.values.activeApp;
		data.MY_APPS = store.values.defaultFolder;

		store.addListener({ field: "apps" }, (err, dt) => data.apps = dt.value);
		store.addListener({ field: "appDefinitions" }, (err, dt) => data.installed = dt.value);
		store.addListener({ field: "tags" }, (err, dt) => data.tags = dt.value);
		store.addListener({ field: "activeApp" }, (err, dt) => data.activeApp = dt.value);
		store.addListener({ field: "activeTags" }, (err, dt) => data.activeTags = dt.value);
		store.addListener({ field: "filteredApps" }, (err, dt) => data.filteredApps = dt.value);
		getToolbarStore(done);
	});
}

function getToolbarStore(done) {
	FSBL.Clients.DistributedStoreClient.getStore({ global: true, store: "Finsemble-Toolbar-Store" }, (err, toolbarStore) => {
		ToolbarStore = toolbarStore;
		done();
	});
}

/**
 * Private function to add an active tag. This will filter apps based on tags
 * NOTE: This will need to use search
 * @param {string} tag The name of the tag
 */
function _addActiveTag(tag) {

	let { apps, activeTags } = data;

	activeTags.push(tag);

	let newApps = apps.filter((app) => {
		for (let i = 0; i < activeTags.length; i++) {
			let tag = activeTags[i].trim();
			if (app.tags.includes(tag)) {
				return true;
			}
		}
	});

	getStore().setValues([
		{
			field: "filteredApps",
			value: newApps
		},
		{
			field: "activeTags",
			value: activeTags
		}
	]);
}

/**
 * Private function to remove an active tag. This will filter apps based on tags
 * NOTE: This will need to use search
 * @param {string} tag The name of the tag
 */
function _removeActiveTag(tag) {

	let { activeTags, apps } = data;

	let newActiveTags = activeTags.filter((currentTag) => {
		return currentTag !== tag;
	});

	let newApps = apps.filter((app) => {
		for (let i = 0; i < newActiveTags.length; i++) {
			let tag = activeTags[i].trim();
			if (app.tags.includes(tag)) {
				return true;
			}
		}
	});

	getStore().setValues([{
		field: "activeTags",
		value: newActiveTags
	}, {
		field: "filteredApps",
		value: newApps
	}]);
}

/**
 * Clears all active tags
 */
function _clearActiveTags() {
	getStore().setValue({
		field: "activeTags",
		value: []
	});
}

/**
 * Async function to fetch apps from the FDC3 api (appD)
 */
async function getApps() {
	let apps = await appd.getAll((err, apps) => {
		getStore().setValue({
			field: "apps",
			value: apps
		});
	});
	return apps;
}

/**
 * Call to appD to get the list of all tags
 */
async function getTags() {
	let tags = await appd.getTags((err, tags) => {
		getStore().setValue({
			field: "tags",
			value: tags
		});
	});
	return tags;
}

/**
 * Function to "install" an app. Adds the id to a list of installed apps
 * @param {string} name The name of the app
 */
async function addApp(id) {
	let { activeApp, installed, apps } = data;
	const appID = id;
	let app = apps.find(app => {
		return app.appId === appID;
	});
	const folder = data.activeFolder;

	if (app === undefined) {
		console.warn("App not found.");
		return;
	}


	installed[appID] = {
		appID,
		tags: app.tags,
		name: app.title ? app.title : app.name,
		url: app.url,
		type: "component",
		component: {},
		window: {
			windowType: app.windowType || "OpenFinWindow"
		},
		foreign: {
			components: {
				"App Launcher": {
					"launchableByUser": true
				},
				"Window Manager": {
					title: app.title ? app.title : app.name
				}
			}
		}
	};

	const appConfig = installed[appID];
	let applicationRoot = "";
	if (appConfig.url && appConfig.url.includes("$applicationRoot")) {
		//we may use this if we put macros in the stored URLs on the FDC3 server. commented out for now.
		applicationRoot = (await FSBL.Clients.ConfigClient.getValue({ field: "finsemble.applicationRoot" })).data;
		appConfig.url = appConfig.url.replace("$applicationRoot", "");
		appConfig.url = applicationRoot + appConfig.url;
		appConfig.window.url = appConfig.url;
	}

	if (typeof appConfig.url === "undefined") {
		//If there is no url, it will be set to the 'unknown component' inside of the Launcher.
		delete appConfig.url;
		delete appConfig.window.url;
	}

	if (typeof app.manifest !== "object") {
		appConfig.manifest = { ...appConfig };
	}
	let MY_APPS = data.defaultFolder;
	let folders = data.folders;

	data.folders[MY_APPS].apps[appID] = appConfig
	data.folders[folder].apps[appID] = appConfig
	FSBL.Clients.LauncherClient.registerComponent({
		componentType: appConfig.name,
		manifest: appConfig.manifest
	}, (err, response) => {
		getStore().setValues([
			{
				field: "activeApp",
				value: activeApp
			},
			{
				field: "appDefinitions",
				value: installed
			},
			{
				field: "appFolders.folders",
				value: folders
			}
		]);
	});
	/*FSBL.Clients.LauncherClient.addUserDefinedComponent(installed[appID], (compAddErr) => {
		if (compAddErr && compAddErr.indexOf('already exists') === -1) {
            //TODO: We need to handle the error here. If the component failed to add, we should probably fall back and not add to launcher
            console.log('componentAddErr: ', compAddErr);
			console.warn("Failed to add new app");
        } else {
            getStore().setValues([
                {
                    field: 'activeApp',
                    value: activeApp
                },
                {
                    field: 'appDefinitions',
                    value: installed
                },
                {
                    field: 'appFolders.folders',
                    value: folders
                }
            ]);
        }
	});*/
}

/**
 * Function to "uninstall" an app. Removes the id from a list of installed apps
 * @param {string} name The name of the app
 */
function removeApp(id) {
	let { installed, folders } = data;

	ToolbarStore.removeValue({ field: "pins." + installed[id].name.replace(/[.]/g, "^DOT^") }, (err, res) => {
		if (err) {
			console.warn("Error removing pin for deleted app");
			return;
		}
		FSBL.Clients.LauncherClient.unRegisterComponent({ componentType: installed[id].name });
		for (const key in data.folders) {
			if (folders[key].apps[id]) {
				delete folders[key].apps[id];
			}
		}

		//Delete the app from the list
		delete installed[id];

		getStore().setValues([
			{
				field: "appDefinitions",
				value: installed
			},
			{
				field: "appFolders.folders",
				value: folders
			}
		]);
	});
}

/**
 * Function to set the 'active app' for the catalog.
 * @param {string} id The app id to show as the actively showcasing app
 */
function openApp(id) {
	let apps = data.apps;

	let index = apps.findIndex((app) => {
		return app.appId === id;
	});

	if (index > -1) {
		getStore().setValue({
			field: "activeApp",
			value: id
		});
	}
}

function clearApp() {
	getStore().setValue({
		field: "activeApp",
		value: null
	});
}

function getActiveApp() {
	return data.activeApp;
}

/**
 * Retrieves a list of installed apps by id
 */
function getInstalledApps() {
	return data.installed;
}

/**
 * Gets the list of filtered apps (when searching/filtering by tags)
 */
function getFilteredApps() {
	return data.filteredApps;
}

/**
 * Clears the list of filtered apps
 */
function clearFilteredApps() {
	getStore().setValue({
		field: "filteredApps",
		value: []
	});
}

/**
 * Gets the list of active tags (these are tags that are actively filtering the content list)
 */
function getActiveTags() {
	return data.activeTags;
}

/**
 * Adds an 'active tag' to the list of filtered tags
 * @param {string} tag The tag name
 */
function addTag(tag) {
	_addActiveTag(tag);
}

/**
 * Removes an 'active tag' from the list of filtered tags
 * @param {string} tag The tag name
 */
function removeTag(tag) {
	_removeActiveTag(tag);
}

/**
 * Removes all tags from the active tags list
 */
function clearTags() {
	_clearActiveTags();
}

/**
 * Calls appD to search the directory of apps based on search text and tag names
 * @param {string} terms The search terms provided by the user
 */
function searchApps(terms, cb = Function.prototype) {
	if (!terms || terms.length === 0) {
		getStore().setValue({
			field: "filteredApps",
			value: []
		});
		return cb();
	}
	let activeTags = getStore().getValue({
		field: "activeTags"
	}, err => {
		if (err) console.warn("Error getting active tags");
	});

	//TODO: The appd search endpoint returns all apps always
	appd.search({ text: terms, tags: activeTags }, (err, data) => {
		if (err) console.log("Failed to search apps");
		getStore().setValue({
			field: "filteredApps",
			value: data
		});
		cb();
	});
}


/**
 * Async function to call the launcher client to get a list of added apps
 */
function fetchInstalledApps() {
	let addedApps = getStore().getValue({
		field: "apps"
	});

	let installed = [];
	if (apps.length > 0) installed.push([apps[0].appId]);

	getStore().setValue({
		field: "installed",
		value: installed
	});
}