/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import AppDirectory from '../modules/AppDirectory'
import FDC3 from '../modules/FDC3'
import async from 'async';

/**
 * The appd instance is currently online used in Actions.initialize
 * using ES6 await feature requires that await to be used within an async function
 * This file could probably be structured differently to benefit from
 * different ES6 features
 */
const FDC3Client = new FDC3({url: 'http://localhost:3030/v1'})
const appd = new AppDirectory(FDC3Client)

let appCatalogStore;
let finWindow = fin.desktop.Window.getCurrent();
var values = {
	apps: [],
	filteredCards: [],
	activeTags: [],
	allTags: [],
	activeApp: null
}

var Actions = {
	initialize: async function (cb) {
		try {
			values.apps = await appd.getAll()
		} catch (e) {
			console.error(`Unable to connect to FDC3 web service.
			You	probably don't have the web service running or 
			provided the wrong URL. You can get the FDC3 App Directory
			web service from https://github.com/ChartIQ/fdc-appd`)
			return
		}
		cb();
	},
	setTags() {
		let tags = [];
		for (let j = 0; j < values.apps.length; j++) {
			let app = values.apps[j];
			for (let i = 0; i < app.tags.length; i++) {
				let tag = app.tags[i];
				if (!tags.includes(tag)) {
					tags.push(tag);
				}
			}
		}
		values.allTags = tags;
	},
	getApps() {
		return values.apps;
	},
	searchApps(searchTerms) {
		let tags = values.activeTags;

		let newApps = values.apps.filter((app) => {
			let appName = app.title || app.name;

			if (appName.toLowerCase().indexOf(searchTerms.toLowerCase()) > -1) {
				if (tags.length > 0) {
					for (let i = 0; i < app.tags.length; i++) {
						let tag = tags[i];
						if (app.tags.includes(tag)) {
							return true;
						}
					}
				} else {
					return true;
				}
			}
		});

		values.filteredCards = newApps;
	},
	getFilteredApps() {
		return values.filteredCards;
	},
	getTags() {
		return values.allTags;
	},
	getActiveTags() {
		return values.activeTags;
	},
	addTag(tag) {
		values.activeTags.push(tag);
		let tags = values.activeTags;

		let newApps = values.apps.filter((app) => {
			for (let i = 0; i < app.tags.length; i++) {
				let tag = tags[i];
				if (app.tags.includes(tag)) {
					return true;
				}
			}
			return false;
		});

		values.filteredCards = newApps;
	},
	removeTag(tagName) {
		let newTags = values.activeTags.filter((tag) => {
			return tag !== tagName;
		});
		values.activeTags = newTags;
	},
	clearTags() {
		values.activeTags = [];
	},
	addApp(appName) {
		let newApps = values.apps.map((app) => {
			let appTitle = app.title || app.name;

			if (appTitle === appName) {
				app.installed = true;
			}
			return app;
		});
		values.apps = newApps;
	},
	removeApp(appName) {
		let newApps = values.apps.map((app) => {
			let appTitle = app.title || app.name;

			if (appTitle === appName && app.installed) {
				delete app.installed;
			}
			return app;
		});
		values.apps = newApps;
	},
	clearSearchResults() {
		values.filteredCards = [];
	}
};

function createStore(done) {

	finWindow.addEventListener("reloaded", function () {
		console.log("window reloaded");
	});

	FSBL.Clients.DistributedStoreClient.createStore({ store: "AppCatalog-Store" + finWindow.name, values: values, global: false }, (err, store) => {
		appCatalogStore = store;
	});
}


function initialize(cb) {
	async.parallel([
		createStore,
	], function (err) {
		if (err) {
			console.error(err);
		}
		cb(appCatalogStore);
	});
}

let getStore = () => {
	return appCatalogStore;
};

export { initialize };
export { appCatalogStore as Store };
export { Actions };
export { getStore };
