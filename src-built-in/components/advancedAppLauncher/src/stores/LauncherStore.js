let launcherStore;

const data = {
	field: "defaultFolder",
	value: "Advanced App Launcher",
};

function createStore(done) {
	FSBL.Clients.DistributedStoreClient.getStore(
		{
			store: "Finsemble-AppLauncher-Store",
			global: true,
		},
		(error, store) => {
			launcherStore = store;
			launcherStore.setValue(data);
			done(null, launcherStore);
		}
	);
}

function getStore() {
	return launcherStore;
}

export { createStore, getStore };
