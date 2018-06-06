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
			System.getProcessList(Actions.extractData);
		}, 1000);
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

		function getChildWindows(proc, done) {
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
				procs.push({
					statistics: proc,
					childWindows
				});
				done();
			});
		}
		function filter() {
			//todo, filter out service agents based on standard/advanced mode.
			cb(procs);
		}
		asyncEach(processes, getChildWindows, filter);
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
	pruneProcessList: function (list) {
		let filteredList = list;
		debugger;
		return filteredList.filter(proc => !proc.name.toLowerCase().includes("service") && !proc.name.toLowerCase().includes("finsemble"));
	},
	setProcessList: function (list) {
		this.processList = list;
	},
	getProcessList: function () {
		return this.processList;
	},
	terminateProcess: function (AppIdentifier, force = false, prompt = true) {
		const PROMPT = "Are you sure you want to terminate this process? This will close all child windows as well. This is not reversible."
		var doTerminate = function () {
			let app = fin.desktop.Application.wrap(AppIdentifier.uuid, AppIdentifier.name);
			let closeTimeout = setTimeout(() => {
				onCloseFailure();
			}, 4000);

			var onCloseSuccess = () => {
				clearTimeout(closeTimeout);
				alert(`Closed Process: ${AppIdentifier.name}`);
			};

			var onCloseFailure = () => {
				if (force) {
					alert("Force close failed. Trying a force-terminate.");
					app.terminate(true, onCloseSuccess, () => {
						alert("Failed to terminate the process. Please contact support.");
					});
				} else {
					if (confirm(`Failed to close process ${AppIdentifier.name}. Try to force close?`)) {
						Actions.terminateProcess(AppIdentifier, true, false);
					}
				}
			};

			app.close(force, onCloseSuccess, onCloseFailure)
		}
		if (prompt && confirm(PROMPT)) {
			doTerminate();
		} else if (!prompt) {
			doTerminate();
		}
	},
	closeWindow: function (winID, force = false) {
		let win = fin.desktop.Window.wrap(winID.uuid, winID.name);
		let closeTimeout = setTimeout(() => {
			onCloseFailure();
		}, 4000);

		var onCloseSuccess = () => {
			clearTimeout(closeTimeout);
			alert(`Closed window: ${winID.name}`);
		};

		var onCloseFailure = () => {
			if (force) {
				alert("Force close failed. Please try to terminate the parent process.");
			} else {
				if (confirm(`Failed to close window ${winID.name}. Try to force close?`)) {
					Actions.closeWindow(winId, true);
				}
			}
		};

		win.close(force, onCloseSuccess, onCloseFailure)
	}
};

const DEFAULT_STORE_DATA = {
	childWindows: [],
	uuid: '',
	applicationList: []
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