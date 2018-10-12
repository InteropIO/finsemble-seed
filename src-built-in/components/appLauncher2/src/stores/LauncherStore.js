let launcherStore

function createStore(done) {
	FSBL.Clients.DistributedStoreClient
	.createStore({ store: "Finsemble-AppLauncher-2", 
		values: require('../folders.json') }, function (error, store) {
		launcherStore = store
		done(launcherStore)
	})
}

function getStore(){
	return launcherStore
}



export {
	createStore,
	getStore
}