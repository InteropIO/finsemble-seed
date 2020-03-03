/*!
* Copyright 2020 by ChartIQ, Inc.
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
	refreshTagSearch,
	clearTags,
	clearSearchText,
	addApp,
	removeApp,
	openApp,
	clearApp,
	getInstalledApps,
	getActiveApp,
	setActiveApp,
	filterApps,
	setSearchValue,
	setForceSearch,
	getSearchValue,
	getForceSearch,
	goHome
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
		data.searchText = store.values.searchText;
		data.forceSearch = store.values.forceSearch;
		data.ADVANCED_APP_LAUNCHER = store.values.defaultFolder;

		store.addListener({ field: "apps" }, (err, dt) => data.apps = dt.value);
		store.addListener({ field: "appDefinitions" }, (err, dt) => data.installed = dt.value);
		store.addListener({ field: "tags" }, (err, dt) => data.tags = dt.value);
		store.addListener({ field: "activeApp" }, (err, dt) => data.activeApp = dt.value);
		store.addListener({ field: "activeTags" }, (err, dt) => data.activeTags = dt.value);
		store.addListener({ field: "filteredApps" }, (err, dt) => data.filteredApps = dt.value);
		store.addListener({ field: "searchText" }, (err, dt) => data.searchText = dt.value);
		store.addListener({ field: "forceSearch" }, (err, dt) => data.forceSearch = dt.value);
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
 * Return to the App Catalog home page
 */
function goHome() {
	setForceSearch(false);
	clearFilteredApps();
	clearApp();
	clearTags();
	clearSearchText();	
}

/**
 * Private function to add an active tag. This will filter apps based on tags
 * @param {string} tag The name of the tag
 */
function _addActiveTag(tag) {
	let activeTags = data.activeTags;
	if (!activeTags.includes(tag)) {activeTags.push(tag);}

	getStore().setValue({ field: "activeTags", value: activeTags }, filterApps());
}

/**
 * Private function to remove an active tag. This will filter apps based on tags
 * @param {string} tag The name of the tag
 */
function _removeActiveTag(tag) {
	data.activeTags = data.activeTags.filter((currentTag) => {
		return currentTag !== tag;
	});

	getStore().setValue({ field: "activeTags", value: data.activeTags	});
	filterApps();
}

/**
 * Clears all active tags
 */
function _clearActiveTags() {
	getStore().setValue({ field: "activeTags", value: [] });	
}


/**
 * Send the search text and tags to the appd server and get a list of apps
 */
function filterApps() {
	let { activeTags, searchText } = data;
	

	if (activeTags.length === 0 && searchText === "") {
		goHome();
	} else {
		appd.search({ text: searchText, tags: activeTags }, (err, data) => {
			if (err) {
				Logger.system.error(`FDC3 App search failed!: ${err}`);
				return;
			}
			getStore().setValue({ field: "filteredApps", value: data });
		});
	}
}

/**
 * Async function to fetch apps from the FDC3 api (appD)
 */
async function getApps() {
	let apps = await appd.getAll((err, apps) => {
		if (!err) {
			getStore().setValue({
				field: "apps",
				value: apps
			});
		}
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
 * Function to write errors to the log
 * @param {string} message The log message
 * @param {string} [protocol] Provide the logging protocol (default is error)
 */
function writeToLog(message, protocol = "error") {
	FSBL.Clients.Logger[protocol](message);
}

/**
 * Function to "install" an app. Adds the id to a list of installed apps
 * @param {string} name The name of the app
 */
async function addApp(id, cb = Function.prototype) {
	let { activeApp, installed, apps } = data;
	const appID = id;
	let app = apps.find(app => {
		return app.appId === appID;
	});
	const name = app.title || app.name;
	const folder = data.activeFolder;

	if (app === undefined) {
		console.warn("App not found.");
		return cb();
	}

	let manifest, appConfig;
	// Manifest from FDC3 is a string property which can either be a stringified JSON, or a uri which delivers valid JSON.
	// The catalog will attempt to parse the string as JSON, then fetch from a URL if that fails.
	// If both paths fail, notify the user that this app can't be added
	if (app.manifestType.toLowerCase() === "finsemble") {
		try {
			manifest = JSON.parse(app.manifest);
		} catch(e) {
			try {
				const urlRes = await fetch(app.manifest, { method: "GET" });
				manifest = await urlRes.json();
			} catch(e) {
				writeToLog(`${name} is missing a valid manifest or URI that delivers a valid JSON manifest. Unable to add app.`, "error");
				return cb();
			}
		} finally {
			appConfig = installed[appID] = {
				appID,
				tags: app.tags,
				name,
				type: "component",
				manifest
			}
		}
	} else {
		writeToLog(`${name} does not appear to be a Finsemble manifest. This app cannot be added to Finsemble.`, "error");
		return cb();
	}

	let ADVANCED_APP_LAUNCHER = data.defaultFolder;
	let folders = data.folders;

	data.folders[ADVANCED_APP_LAUNCHER].apps[appID] = appConfig
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
		], cb);
	});
}

/**
 * Function to "uninstall" an app. Removes the id from a list of installed apps
 * @param {string} name The name of the app
 */
function removeApp(id, cb = Function.prototype) {
	let { installed, folders } = data;

	ToolbarStore.removeValue({ field: "pins." + installed[id].name.replace(/[.]/g, "^DOT^") }, (err, res) => {
		if (err) {
			console.warn("Error removing pin for deleted app");
			return;
		}
		FSBL.Clients.LauncherClient.unRegisterComponent({ componentType: installed[id].name }, (err, res) => {
			if (err) {
				console.warn("Failed to deregister a component");
				return;
			}

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
			], cb);
		});
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

/**
 * Clear the activeApp in store
 */
function clearApp() {
	getStore().setValue({
		field: "activeApp",
		value: null
	});
}

/**
 * Return activeApp from store
 *
 * @returns {string} activeApp
 */
function getActiveApp() {
	return data.activeApp;
}

/**
 * Set the activeApp param in store
 *
 * @param {*} app
 */
function setActiveApp(app) {
	getStore().setValue({
		field: "activeApp",
		value: app
	});
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
 * Set the value of the search text in store
 *
 * @param {set} val Search string
 */
function setSearchValue(val) {
	getStore().setValue({field: "searchText", value: val})
}

/**
 * Get the current value of the text in the store
 *
 * @returns {string}  Search string
 */
function getSearchValue() {
	return data.searchText;
}

/**
 * Clears the search text in store
 *
 */
function clearSearchText() {
	getStore().setValue({field: "searchText", value: ""})
}

/**
 * Get forceSearch store value
 *
 * @returns {boolean} forceSearch
 */
function getForceSearch() {
	return data.forceSearch;
}


/**
 * Set the forceSearch value
 *
 * @param {string} val Boolean value for forceSearch
 */
function setForceSearch(val) {
	getStore().setValue({field: "forceSearch", value: val})
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
 * Refreshes the active tags search
 */
function refreshTagSearch() {
	filterApps();
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
	data.searchText = terms;
	setForceSearch(true);
	getStore().setValue({
		field: "searchText",
		value: terms
	}, () => {filterApps(); cb();});
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