let launcherStore;

const data = {
	field: "defaultFolder",
	value: "My Apps"
};

function createStore(done) {
	FSBL.Clients.DistributedStoreClient
		.getStore({
			store: "Finsemble-AppLauncher-Store",
			global: true
		}, (error, store) => {
			launcherStore = store;
			launcherStore.setValue(data);
			done(null, launcherStore);
		});
}

function getStore() {
	return launcherStore;
};

export {
	createStore,
	getStore
}