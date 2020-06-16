/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import async from "async";
let menuStore;

var values = {
	focus: false,
	list: [],
	control: null,
	opener: null,
};
var actionPress;

var menuFocused = false;
var Actions = {
	initialize: function(cb) {
		cb();
	},
	listChange(err, data) {
		if (!data.value) {
			values.list = [];
			finsembleWindow.isShowing((value) => {});
		} else {
			values.list = data.value;
		}

		if (values.list.length) {
			menuStore.setValue({ field: "menuShown", value: true });
		}
	},

	setList(list) {
		//console.log("set list", list)
		menuStore.setValue({ field: "list", value: list });
	},
	listItemClick(provider, item, action) {
		FSBL.Clients.SearchClient.invokeItemAction(provider, item, action);
		finsembleWindow.hide();
		menuStore.setValue({ field: "list", value: [] });
	},
	actionPress(err, msg) {
		actionPress(msg.data);
	},
	setActionPress(func) {
		actionPress = func;
	},
	search(text) {
		if (text === "" || !text) text = "";

		FSBL.Clients.SearchClient.search(
			{ text: text, filter: { resultType: "application" } },
			(err, response) => {
				var updatedResults = [].concat.apply([], response);
				var parsedList = [];
				//console.log("updatedResults", updatedResults)
				updatedResults.map((resultList, index) => {
					parsedList = parsedList.concat(
						resultList.data.filter((result) => result.type === "Application")
					);
				});
				Actions.setList(parsedList);
			}
		);
	},
};

function createStore(done) {
	let defaultData = {
		inFocus: false,
		list: [],
		owner: finsembleWindow.name,
	};

	finsembleWindow.addEventListener("reloaded", () => {
		menuStore.removeListener({ field: "list" }, Actions.listChange);
	});

	FSBL.Clients.DistributedStoreClient.createStore(
		{
			store: `AppCatalog-Store${finsembleWindow.name}`,
			values: defaultData,
			global: false,
		},
		(err, store) => {
			menuStore = store;
			FSBL.Clients.SearchClient.search(
				{ text: "", filter: { resultType: "application" } },
				(err, response) => {
					//console.log("results", response)
					var updatedResults = [].concat.apply([], response);
					var parsedList = [];
					//console.log("updatedResults", updatedResults)
					updatedResults.map((resultList, index) => {
						parsedList = parsedList.concat(
							resultList.data.filter((result) => result.type === "Application")
						);
					});
					Actions.setList(parsedList);
				}
			);
			done();
		}
	);
}

function initialize(cb) {
	async.parallel([createStore], (err) => {
		if (err) {
			console.error(err);
		}
		cb(menuStore);
	});
}

let getStore = () => menuStore;

export { initialize };
export { menuStore as Store };
export { Actions };
export { getStore };
