const timesSeries = require("async/timesSeries");
let ProcessMonitorStore;
const asyncEach = require("async/each");
//Regex code taken from https://gist.github.com/mattheyan/46a230da86a0894a5ff654b9139ec5f2
const System = fin.desktop.System;
var Actions = {
	initialize: function (cb) {
		createLocalStore(() => {
			Actions.getInitialData();
			cb();
		});
	},
	getInitialData: function () {
		System.getProcessList(Actions.extractData);
		setInterval(() => {
			// console.log("Process List update");
			System.getProcessList(Actions.extractData);
		}, 1000);
	},
	setSort: function (field) {
		// console.log("setSort called");

		let currentSort = ProcessMonitorStore.getValue({ field: "sort" });
		let procs = ProcessMonitorStore.getValue({ field: "processList" });
		let newSort;
		if (currentSort.field === field) {
			newSort = currentSort;
			if (currentSort.direction == "ascending") {
				newSort.direction = "descending";
			} else {
				newSort.direction = "ascending";
			}
		} else {
			newSort = {
				field,
				direction: "ascending"
			}
		}
		// console.log("Setting sort value", newSort.field, newSort.direction);

		ProcessMonitorStore.setValue({ field: "sort", value: newSort }, () => {
			// When changing sort we'll re-render the UI immediately insteade of waiting for the processlist to update. could take a while and look laggy.
			// console.log("setSort sort value set, sorting the processes");
			procs = Actions.sortProcesses(procs);
			// console.log("setSort sort value set, setting the process list");
			ProcessMonitorStore.setValue({ field: "processList", value: procs })
		});

	},
	extractData: function (processes) {
		Actions.createDataModel(processes, (procs) => {
			//set store.
			ProcessMonitorStore.setValue({ field: "processList", value: procs })
		});
	},
	createDataModel: function (processes, cb) {
		let procs = [];
		//potential optimization: get child windows once, and listen on a close/create event.
		//For now, this seems okay.
		let mode = ProcessMonitorStore.getValue({ field: "viewMode" });
		function getChildWindows(proc, done) {
			if (mode === "simple" && (proc.name.toLowerCase().includes("service") || proc.name.toLowerCase().includes("system"))) {
				procs.push({
					statistics: proc,
					visible: false
				});
				return done();
			}
			fin.desktop.Application.wrap(proc.uuid).getChildWindows(cws => {
				let childWindows = [];
				cws.forEach(cw => {
					//create a simple object so the actual childWindow class isn't stored in the distributed store.
					childWindows.push({
						name: cw.name,
						uuid: cw.uuid
					});
				})
				//Alphabetize the CWs.
				childWindows.sort((a, b) => {
					if (a.name.toLowerCase() < b.name.toLowerCase())
						return -1;
					if (a.name.toLowerCase() > b.name.toLowerCase())
						return 1;
					return 0;
				});
				//Don't want any service windows.
				if (mode === "simple" && childWindows.some(cw => cw.name.toLowerCase().includes("service") || cw.name.toLowerCase().includes("system"))) return done();
				procs.push({
					statistics: proc,
					childWindows,
					visible: true
				});
				done();
			});
		}
		function sort() {
			procs = Actions.sortProcesses(procs);
			cb(procs);
		}
		asyncEach(processes, getChildWindows, sort);
	},
	sortProcesses: function (procs) {
		let currentSort = ProcessMonitorStore.getValue({ field: "sort" });
		// console.log("Sorting processes", currentSort.field, currentSort.direction);
		let sortFN = (a, b) => {
			let aValue = a.statistics[currentSort.field];
			//Comparing upper and lowercase names makes the sort look wrong. we equalize all strings here.
			if (aValue.toLowerCase) {
				aValue = aValue.toLowerCase();
			}

			let bValue = b.statistics[currentSort.field];
			if (aValue.toLowerCase) {
				bValue = bValue.toLowerCase();
			}
			if (currentSort.direction === "ascending") {
				if (aValue < bValue)
					return -1;
				if (aValue > bValue)
					return 1;
				return 0;
			}

			if (aValue > bValue)
				return -1;
			if (aValue < bValue)
				return 1;
			return 0;
		}
		return procs.sort(sortFN);
	},
	toggleViewMode: function () {
		let mode = ProcessMonitorStore.getValue({ field: "viewMode" });
		if (mode === "advanced") {
			mode = "simple"
		} else {
			mode = "advanced";
		}
		ProcessMonitorStore.setValue({ field: "viewMode", value: mode });
	},
	identifyWindow: function (winID) {
		const OPACITY_ANIMATION_DURATION = 200;
		let win = fin.desktop.Window.wrap(winID.uuid, winID.name);
		let windowState = "hidden";
		function flash(n, done) {
			win.animate({
				opacity: {
					opacity: 0.5,
					duration: OPACITY_ANIMATION_DURATION
				}
			}, {}, () => {
				win.animate({
					opacity: {
						opacity: 1,
						duration: OPACITY_ANIMATION_DURATION
					}
				}, {}, () => {
					done(null);
				});
			})
		}
		win.isShowing(isVisible => {
			windowState = isVisible ? "visible" : "hidden";
			win.show(() => {
				win.bringToFront(() => {
					//Flash 5 times, in series.
					timesSeries(5, flash, () => {
						if (windowState === "hidden") {
							win.hide();
						}
					});
				})
			})
		})
	},
	terminateProcess: function (AppIdentifier, force = false, prompt = true) {
		let app = fin.desktop.Application.wrap(AppIdentifier.uuid, AppIdentifier.name);
		let closeTimeout = setTimeout(() => {
			onCloseFailure();
		}, 4000);

		var onCloseSuccess = () => {
			clearTimeout(closeTimeout);
		};

		var onCloseFailure = () => {
			if (force) {
				//Should never get into here, but just in case the process is hung, we'll show an error message to the user.
				app.terminate(true, onCloseSuccess, () => {
					FSBL.Clients.DialogManager.open("yesNo", {
						title: "Error",
						question: "The process that you are attempting to close is unresponsive. Please contact support.",
						affirmativeButtonLabel: "Okay",
						showCancelButton: false,
						showNegativeButton: false
					}, Function.prototype);
				});
			} else {
				Actions.terminateProcess(AppIdentifier, true, false);
			}
		};
		app.close(force, onCloseSuccess, onCloseFailure)
	},
	removeWindowLocally: function (winID) {
		let win = fin.desktop.Window.wrap(winID.uuid, winID.name);
		let parentApp = win.getParentApplication();
		let procs = ProcessMonitorStore.getValue({ field: "processList" });
		procs = procs.map(proc => {
			if (proc.statistics.uuid === parentApp.uuid) {
				let cwIndex = proc.childWindows.findIndex(cw => cw.name === winID.name);
				proc.childWindows.splice(cwIndex, 1)
			}
			return proc;
		})
		ProcessMonitorStore.setValue({ field: "processList", value: procs });
	},
	closeWindow: function (winID, force = false) {
		let win = fin.desktop.Window.wrap(winID.uuid, winID.name);
		let parentApp = win.getParentApplication();

		Actions.removeWindowLocally(winID);
		let closeTimeout = setTimeout(() => {
			onCloseFailure();
		}, 4000);

		var onCloseSuccess = () => {
			clearTimeout(closeTimeout);
		};

		var onCloseFailure = () => {
			if (force) {
				FSBL.Clients.DialogManager.open("yesNo", {
					title: "Terminate Process?",
					question: "The app that you are attempting to close is unresponsive. Would you like to terminate the process? Terminating the process may close other apps.",
					showCancelButton: false,
					showNegativeButton: true
				}, (err, response) => {
					if (response.choice === "affirmative") {
						return Actions.terminateProcess(parentApp, true)
					}
				});
			} else {
				Actions.closeWindow(winID, true);
			}
		};
		win.close(force, onCloseSuccess, onCloseFailure)
	}
};

const DEFAULT_STORE_DATA = {
	viewMode: "simple",
	sort: {
		field: "name",
		direction: "ascending"
	}
}
function createLocalStore(done) {
	FSBL.Clients.DistributedStoreClient.createStore({
		store: "Finsemble-ProcessMonitor-Local-Store",
		values: DEFAULT_STORE_DATA
	}, function (err, store) {
		ProcessMonitorStore = store;
		module.exports.Store = store;
		done();
	});
}
module.exports.Store = ProcessMonitorStore;
module.exports.Actions = Actions;