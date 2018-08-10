/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

let menuStore;
import async from "async";

let finWindow = fin.desktop.Window.getCurrent();
var values = {
	list: []
}
var actionPress;

var menuFocused = false;
var Actions = {
	initialize: function (cb) {
		cb();
		finWindow.addEventListener("shown", () => {
		//console.log("shown", performance.now());
		})
	},
	getList() {
		return values.list;
	},
	listChange(err, data) {
	//console.log("list", data)
		if (!data.value) {
			values.list = [];


		} else {
			values.list = data.value;
		}

		if (values.list.length) {
			menuStore.setValue({ field: "menuShown", value: true })
		}
	},
	onBlur() {
		menuStore.Dispatcher.dispatch({ actionType: "menuBlur", data: "" });
	},
	providerItemClick(provider) {
		FSBL.Clients.SearchClient.invokeProviderAction(provider);
		//menuStore.Dispatcher.dispatch({ actionType: "clear", data: "" });
		//menuStore.setValue({ field: "list", value: [] })
		return finWindow.hide();
	},
	listItemClick(item, action) {
		FSBL.Clients.SearchClient.invokeItemAction(item, action)
		//menuStore.Dispatcher.dispatch({ actionType: "clear", data: "" });
		//menuStore.setValue({ field: "list", value: [] })
		return finWindow.hide();
	},
	actionPress(err, msg) {
		actionPress(msg.data);
	},
	setActionPress(func) {
		actionPress = func;
	}
};


function createStore(done) {
	let defaultData = {
		inFocus: false,
		list: [],
		owner: finWindow.name
	};
//console.log("add listeners")
	FSBL.Clients.RouterClient.addListener("SearchMenu." + finWindow.name + ".actionpress", Actions.actionPress);
	finWindow.addEventListener("blurred", Actions.onBlur);
	finWindow.addEventListener("reloaded", function () {
		finWindow.removeEventListener("blurred", Actions.onBlur);
		menuStore.removeListener({ field: "list" }, Actions.listChange);
	})
//console.log("CreateStore", "Finsemble-SearchStore." + FSBL.Clients.WindowClient.options.customData.spawnData.owner)

	FSBL.Clients.DistributedStoreClient.createStore({ store: "Finsemble-SearchStore-" + FSBL.Clients.WindowClient.options.customData.spawnData.owner, values: defaultData, global: true },
		function (err, store) {
			menuStore = store;
			store.addListener({ field: "list" }, Actions.listChange);

			done();
		});
}


function initialize(cb) {
//console.log("init store", FSBL.Clients.WindowClient.options.customData.spawnData.owner)
	async.parallel([
		createStore,
	], function (err) {
		if (err) {
			console.error(err);
		}
		cb(menuStore);
	});
}

let getStore = () => {
	return menuStore;
};

export { initialize };
export { menuStore as Store };
export { Actions };
export { getStore };
