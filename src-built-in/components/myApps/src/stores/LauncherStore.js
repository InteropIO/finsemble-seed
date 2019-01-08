let launcherStore

function createStore(done) {
	FSBL.Clients.DistributedStoreClient
		.getStore({
			store: "Finsemble-AppLauncher-2",
			global: true
		}, (error, store) => {
			launcherStore = store;
			done(null, launcherStore)
		})
}

function getStore() {
	return launcherStore
}

export {
	createStore,
	getStore
}