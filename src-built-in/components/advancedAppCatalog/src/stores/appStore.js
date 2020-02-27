/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
*/
export {
	createStore,
	getStore
};

const defaultValues = [
	{
		field: "apps",
		value: []
	},
	{
		field: "filteredApps",
		value: []
	},
	{
		field: "activeTags",
		value: []
	},
	{
		field: "activeApp",
		value: null
	},
	{
		field: "searchText",
		value: ""
	},
	{
		field: "forceSearch",
		value: false
	}
];


let appCatalogStore;

function createStore(cb) {
	FSBL.Clients.DistributedStoreClient.getStore({ store: "Finsemble-AppLauncher-Store", global: true }, (err, store) => {
		appCatalogStore = store;
		appCatalogStore.setValues(defaultValues);
		cb(null, appCatalogStore);
	});
}

function getStore() {
	return appCatalogStore;
}