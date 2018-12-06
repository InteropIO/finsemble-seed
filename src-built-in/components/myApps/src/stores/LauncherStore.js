let launcherStore

function createStore(done) {
	FSBL.Clients.DistributedStoreClient
	.getStore({ store: "Finsemble-AppLauncher-Store",
		global: true
		}, (error, store) => {
			console.log('error: ', error);
		launcherStore = store;
		done(null, launcherStore)
	})
}

function getStore(){
	return launcherStore
}

export {
	createStore,
	getStore
}