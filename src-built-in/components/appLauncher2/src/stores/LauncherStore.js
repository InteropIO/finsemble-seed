let launcherStore

async function createStore(done) {
	FSBL.Clients.DistributedStoreClient
	.createStore({ store: "Finsemble-AppLauncher-2", 
		values: require('../folders.json') 
	}).then((store) => {
		launcherStore = store.data
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