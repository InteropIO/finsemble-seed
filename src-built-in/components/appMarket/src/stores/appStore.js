/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
*/
export {
    createStore,
    getStore
}

const defaultValues = {
	apps: [],
	filteredCards: [],
	activeTags: [],
	allTags: [],
	activeApp: null
}

let appCatalogStore

function createStore(done) {
    FSBL.Clients.DistributedStoreClient
        .createStore({ store: "AppCatalog-Store" + fin.desktop.Window.getCurrent().name,
        values: defaultValues,
        global: false
     }, (error, store) => {
        appCatalogStore = store
        done(null, appCatalogStore)
	})
}


function getStore() {
    return appCatalogStore
}