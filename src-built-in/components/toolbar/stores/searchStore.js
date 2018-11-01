/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

let menuStore;
import async from "async";
let finWindow = fin.desktop.Window.getCurrent();
var focus = false;
var activeSearchBar = false;
var menuReference = {};
var menuWindow = null;
var control = null;



function mouseInElement(element, cb) {
	var elementBounds = element.getBoundingClientRect();
	window.screenX;
	window.screenY
	var bounds = {
		top: window.screenY + elementBounds.top,
		left: window.screenX + elementBounds.left,
		bottom: element.offsetHeight + window.screenY,
		right: elementBounds.right + window.screenX + elementBounds.left
	}
	mouseInBounds(bounds, cb)
}
function mouseInBounds(bounds, cb) {
	fin.desktop.System.getMousePosition(function (mousePosition) {
		if (mousePosition.left >= bounds.left & mousePosition.left <= bounds.right) {
			if (mousePosition.top >= bounds.top & mousePosition.top <= bounds.bottom) {
				return cb(null, true);
			}
		}
		return cb(null, false);
	});

}
function mouseInWindow(win, cb) {
	win.getBounds(function (err, bounds) {
		mouseInBounds(bounds, cb)
	})
}

let cachedBounds = null;
var Actions = {
	initialize: function (cb) {
		cb();
	},
	setFocus(bool, target) {
		focus = bool;
		if (bool) {
			if (window.outerWidth < 400) {
				finsembleWindow.getBounds((err, bounds) => {
					cachedBounds = bounds;
					finsembleWindow.animate({ transitions: { size: { duration: 150, width: 400 } } }, {}, Function.prototype);
				})
			}
			menuStore.setValue({ field: "active", value: true })
			activeSearchBar = true;
			if (!menuWindow) {
				return this.setupWindow(() => {
					this.setFocus(bool, target);
				})
			}
			if (!menuWindow) return;
			return menuWindow.isShowing((err, showing) => {
				if (showing) return;

				Actions.positionSearchResults();
			});

		}
		activeSearchBar = false;
		if (!menuWindow) {
			return Actions.handleClose();
		}
		menuWindow.isShowing(function (err, showing) {
			//if (!showing) return//console.log("not showing")
			mouseInWindow(menuWindow, function (err, inBounds) {

				if (!inBounds) {
					Actions.handleClose();
				}
			})
		})
	},
	positionSearchResults() {
		const inputContainer = document.getElementById("inputContainer");
		if (inputContainer) {
			const bounds = inputContainer.getBoundingClientRect();
			let showParams = {
				monitor: 'mine',
				position: 'relative',
				left: bounds.left,
				forceOntoMonitor: true,
				top: 'adjacent',
				autoFocus: false
			}
			FSBL.Clients.LauncherClient.showWindow({ windowName: menuWindow.name }, showParams);

		} else {
			FSBL.Clients.Logger.error("No element with ID 'inputContainer' exists");
		}
	},
	//handleClose gets called for several reasons. One of those is when the window starts moving. If it starts moving, an event is passed in. If the event is passed in, we don't want to animate the window. If it's just a blur, we'll animate the change in size.
	handleClose(e) {
		menuWindow.isShowing(function (err, showing) {
			if (showing) {
				console.log("close a window")
				if (!e && cachedBounds) {
					finsembleWindow.animate({ transitions: { size: { duration: 150, width: cachedBounds.width } } }, {}, () => {
						cachedBounds = null;
					});
				}
				window.getSelection().removeAllRanges();
				document.getElementById("searchInput").blur();
				menuStore.setValue({ field: "active", value: false })
				if (!menuWindow) return;
				menuWindow.hide();
			}
		});

	},

	setupWindow(cb = Function.prototype) {
		console.log("SETUP WINDOW!", menuReference.name);
		//menuWindow = fin.desktop.Window.wrap(menuReference.finWindow.app_uuid, menuReference.finWindow.name);
		FSBL.FinsembleWindow.getInstance({ windowName: menuReference.name }, (err, wrap) => {
			menuWindow = wrap;
			cb();
		});
	},
	getComponentList(cb) {

	},
	actionPress(action) {
		menuStore.getValue("list", function (err, list) {
			if (!list) return;
			if (list.length > 1) {
				FSBL.Clients.RouterClient.transmit("SearchMenu." + menuWindow.name + ".actionpress", action);
			}
		})
	},
	setList(list) {
		menuStore.setValue({ field: "list", value: list })
	},
	updateMenuReference(err, data) {
		menuReference = data.value;
		if (!menuWindow) {
			Actions.setupWindow()
		}
	},
	search(text) {
		if (text === "" || !text) return Actions.setList([]);
		FSBL.Clients.SearchClient.search({ text: text }, function (err, response) {
			var updatedResults = [].concat.apply([], response)
			Actions.setList(updatedResults);
			setTimeout(() => {
				Actions.positionSearchResults();
			}, 100);
		})
	},
	menuBlur() {
		mouseInElement(document.getElementById("searchInput"), function (err, inBounds) {
			if (!inBounds) {
				Actions.handleClose();
			}
		})
	}
};
function searchTest(params, cb) {
	//console.log("params", params)
	fetch('/search?text=' + params.text).then(function (response) {
		return response.json();
	}).then(function (json) {
		//console.log("json", cb);
		return cb(null, json);

	});
}


function createStore(done) {
	let defaultData = {
		inFocus: false,
		list: [],
		owner: finWindow.name,
		menuSpawned: false,
		activeSearchBar: null,
		menuIdentifier: null
	};
	//console.log("CreateStore", "Finsemble-SearchStore-" + finWindow.name)
	FSBL.Clients.DistributedStoreClient.createStore({ store: "Finsemble-SearchStore-" + finWindow.name, values: defaultData, global: true }, function (err, store) {
		menuStore = store;

		store.getValues(["owner", "menuSpawned"], function (err, data) {
			store.addListener({ field: "menuIdentifier" }, Actions.updateMenuReference);
			menuStore.Dispatcher.register(function (action) {
				if (action.actionType === "menuBlur") {
					Actions.menuBlur();
				} else if (action.actionType === "clear") {
					Actions.handleClose();
				}
			});

			if (!data.menuSpawned) {
				FSBL.Clients.LauncherClient.spawn("searchMenu", { name: "searchMenu." + finWindow.name, data: { owner: finWindow.name } }, function (err, data) {
					//console.log("Err", err, data)
					menuStore.setValue({ field: "menuIdentifier", value: data.windowIdentifier })
					Actions.setupWindow(() => {
						menuStore.setValue({ field: "menuSpawned", value: true })
						done();
					});
				});
			} else {
				menuStore.getValue("menuIdentifier", function (err, menuIdentifier) {
					menuReference = menuIdentifier;
					Actions.setupWindow(done);
				})
			}
		})
	});

	finsembleWindow.listenForBoundsSet();
	finsembleWindow.addListener("startedMoving", Actions.handleClose);
	finsembleWindow.addListener("blurred", function (event) {
		Actions.setFocus(false);
	}, function () {
	}, function (reason) {
		//console.log("failure:" + reason);
	});
	finsembleWindow.addListener("hidden", () => {
		Actions.handleClose();
	});
}

function initialize(cb) {
	//console.log("init store")
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
