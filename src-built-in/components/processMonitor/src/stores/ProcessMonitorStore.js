const timesSeries = require("async/timesSeries");
let ProcessMonitorStore;
const asyncEach = require("async/each");
//Regex code taken from https://gist.github.com/mattheyan/46a230da86a0894a5ff654b9139ec5f2
const DEFAULT_SORT_DIRECTION = "ascending";
const DEFAULT_STORE_DATA = {
	viewMode: "simple",
	sort: {
		field: "name",
		direction: "ascending",
	},
};

function createLocalStore(done) {
	FSBL.Clients.DistributedStoreClient.createStore(
		{
			store: "Finsemble-ProcessMonitor-Local-Store",
			values: DEFAULT_STORE_DATA,
		},
		(err, store) => {
			ProcessMonitorStore = store;
			module.exports.Store = store;
			done();
		}
	);
}

var Actions = {
	/**
	 * Creates the local store, then gets the first cut at stats for the process list.
	 */
	initialize: function(cb) {
		createLocalStore(() => {
			Actions.getInitialData();
			cb();
		});
	},
	/**
	 * Gets the process list, pulls the statistics out, and renders the app. Also sets up an interval where we'll retrieve more stats from the system.
	 */
	getInitialData: function() {
		FSBL.System.getProcessList(Actions.extractData);
		setInterval(() => {
			FSBL.System.getProcessList(Actions.extractData);
		}, 1000);
	},
	/**
	 * Sets the sort field; if it's the same field as we had previously, we flip the sort direction.
	 */
	setSort: function(field) {
		let currentSort = ProcessMonitorStore.getValue({ field: "sort" });
		let procs = ProcessMonitorStore.getValue({ field: "processList" });
		let newSort;
		//If it's the same field as before, flip the direction
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
				direction: DEFAULT_SORT_DIRECTION,
			};
		}

		ProcessMonitorStore.setValue({ field: "sort", value: newSort }, () => {
			// When changing sort we'll re-render the UI immediately instead of waiting for the process list to update. Without this step, it could be 999ms until the next update, which makes the process monitor feel very unresponsive and very bad.
			procs = Actions.sortProcesses(procs);
			ProcessMonitorStore.setValue({ field: "processList", value: procs });
		});
	},
	/**
	 * Extracts data from the process list (via the createDataModel function), and then sets the processList value on the store. This causes the UI to re-render.
	 */
	extractData: function(processes) {
		Actions.createDataModel(processes, (procs) => {
			//set store.
			ProcessMonitorStore.setValue({ field: "processList", value: procs });
		});
	},
	/**
	 * Converts the system.getProcessList response into something that's easily render-able.
	 */
	createDataModel: function(processes, cb) {
		let procs = [];
		//@todo, potential optimization: get child windows once, and listen on a close/create event. As it stands, getCWs is pretty performant.
		let mode = ProcessMonitorStore.getValue({ field: "viewMode" });
		/**
		 * For each project, we get child windows. In simple mode, we filter out services and system components.
		 * @param {object} proc
		 * @param {function} done
		 */
		function getChildWindows(proc, done) {
			if (
				mode === "simple" &&
				(proc.name.toLowerCase().includes("service") ||
					proc.name.toLowerCase().includes("system"))
			) {
				procs.push({
					statistics: proc,
					visible: false,
				});
				return done();
			}
			FSBL.System.Application.wrap(proc.uuid).getChildWindows((cws) => {
				let childWindows = [];
				cws.forEach((cw) => {
					//create a simple object so the actual childWindow class isn't stored in the distributed store.
					childWindows.push({
						name: cw.name,
						uuid: cw.uuid,
					});
				});
				//Alphabetize the CWs.
				childWindows.sort((a, b) => {
					if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
					if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
					return 0;
				});
				//Don't want any service windows or systemComponent windows.
				if (
					mode === "simple" &&
					childWindows.some(
						(cw) =>
							cw.name.toLowerCase().includes("service") ||
							cw.name.toLowerCase().includes("system")
					)
				)
					return done();
				if (childWindows.length === 0) {
					//Hack until we have a better abstraction
					if (proc.name.toLowerCase().includes("agent")) return done();
					childWindows = [{ uuid: proc.uuid, name: proc.name }];
				}
				procs.push({
					statistics: proc,
					childWindows,
					visible: true,
				});
				done();
			});
		}
		function sort() {
			procs = Actions.sortProcesses(procs);
			cb(procs);
		}

		//For each process, get the child window list, and then sort them based on the currently active column.
		asyncEach(processes, getChildWindows, sort);
	},
	/**
	 * Sorting function. Handles ascending and descending.
	 */
	sortProcesses: function(procs) {
		let currentSort = ProcessMonitorStore.getValue({ field: "sort" });
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
				if (aValue < bValue) return -1;
				if (aValue > bValue) return 1;
				return 0;
			}

			if (aValue > bValue) return -1;
			if (aValue < bValue) return 1;
			return 0;
		};
		return procs.sort(sortFN);
	},
	/**
	 * Toggles advanced/simple mode
	 */
	toggleViewMode: function() {
		let mode = ProcessMonitorStore.getValue({ field: "viewMode" });
		if (mode === "advanced") {
			mode = "simple";
		} else {
			mode = "advanced";
		}
		ProcessMonitorStore.setValue({ field: "viewMode", value: mode });
	},
	/**
	 * Make the window flash a couple of times so that the user can identify it.
	 */
	identifyWindow: function(winID) {
		if (winID.name.includes("Service")) return;

		const OPACITY_ANIMATION_DURATION = 200;
		FSBL.FinsembleWindow.getInstance({ name: winID.name }, (err, win) => {
			let windowState = "hidden";
			function flash(n, done) {
				setTimeout(() => {
					win.hide(() => {
						setTimeout(() => {
							win.show(() => {
								done(null);
							});
						}, OPACITY_ANIMATION_DURATION / 1.5);
					});
				}, OPACITY_ANIMATION_DURATION / 1.5);
			}
			win.isShowing((err, isVisible) => {
				//cache the visible state of the window prior to making it flash. If it was hidden before, hide it when the flashing is done.
				windowState = isVisible ? "visible" : "hidden";
				win.show(() => {
					win.bringToFront(() => {
						//Flash 5 times, in series.
						timesSeries(5, flash, () => {
							if (windowState === "hidden") {
								win.hide();
							}
						});
					});
				});
			});
		});
	},
	/**
	 * Terminates a process. Prompts first. If it fails to terminate the process, displays an error message.
	 */
	terminateProcess: function(AppIdentifier, force = false, prompt = true) {
		let app = FSBL.System.Application.wrap(
			AppIdentifier.uuid,
			AppIdentifier.name
		);
		/**
		 * This whole routine is a little hectic because of all of the closures - but there's a method to the madness. Here's the logic.
		 *
		 * 1st time we try to close: Politely close the window. If that fails, recurse, but pass "force" === true.
		 * 2nd time, we try to forceClose the process. If that fails, we will terminate the process forcibly, which isn't graceful.
		 */

		let politeCloseProcess = () => {
			//If the process fails to close in 4 seconds, we will call this method again, but try to force close it.
			let closeTimeout = setTimeout(() => {
				onCloseFailure();
			}, 4000);

			var onCloseSuccess = () => {
				clearTimeout(closeTimeout);
			};
			app.close(force, onCloseSuccess, onCloseFailure);
		};

		let forceCloseProcess = () => {
			//If the process fails to close in 4 seconds, we will call this method again, but try to force close it.
			let closeTimeout = setTimeout(() => {
				onCloseFailure();
			}, 4000);

			var onCloseSuccess = () => {
				clearTimeout(closeTimeout);
			};
			app.close(force, onCloseSuccess, onCloseFailure);
		};

		let terminateProcess = () => {
			//Should never get into here, but just in case the process is hung, we'll show an error message to the user.
			app.terminate(true, onCloseSuccess, () => {
				FSBL.Clients.DialogManager.open(
					"yesNo",
					{
						title: "Error",
						question:
							"The process that you are attempting to close is unresponsive. Please contact support.",
						affirmativeButtonLabel: "Okay",
						showCancelButton: false,
						showNegativeButton: false,
					},
					Function.prototype
				);
			});
		};

		let onCloseFailure = () => {
			//If Actions.terminateProcess is invoked with force === true, that means that we tried to force close the process, and it failed. So we will terminate it. If not, we will try to force close (the else block).
			if (force) {
				terminateProcess();
			} else {
				//If we've already tried to close the process once, but it failed, we'll try to terminate it. The first attempt is a close, which is more graceful.
				Actions.terminateProcess(AppIdentifier, true, false);
			}
		};

		//If we're force closing, no need to prompt the user (which is what happens below);
		if (force) {
			return forceCloseProcess();
		}

		//Ask user if they're sure. If they says "yes", close it.
		FSBL.Clients.DialogManager.open(
			"yesNo",
			{
				title: "Terminate Process?",
				question:
					"Terminating the process may close other apps. Are you sure you want to continue?",
				affirmativeResponseLabel: "Terminate",
				showNegativeButton: false,
			},
			(err, response) => {
				if (err || response.choice === "affirmative") {
					politeCloseProcess();
				}
			}
		);
	},
	/**
	 * This function exists to make the UI feel snappy. May take a second or so for the window to close properly and for the change to flow to system.getProcessList. To make that lag go away, we immediately render the change.
	 */
	removeWindowLocally: function(winID) {
		let win = FSBL.System.Window.wrap(winID.uuid, winID.name);
		let parentApp = win.getParentApplication();
		let procs = ProcessMonitorStore.getValue({ field: "processList" });
		procs = procs.map((proc) => {
			if (proc.statistics.uuid === parentApp.uuid) {
				let cwIndex = proc.childWindows.findIndex(
					(cw) => cw.name === winID.name
				);
				proc.childWindows.splice(cwIndex, 1);
			}
			return proc;
		});
		ProcessMonitorStore.setValue({ field: "processList", value: procs });
	},
	/**
	 * Try to close the window. If that fails, try to force close the window. If that fails, ask if they'd like to terminate the parent process.
	 */
	closeWindow: function(winID, force = false) {
		let win = FSBL.System.Window.wrap(winID.uuid, winID.name);
		let parentApp = win.getParentApplication();

		//Make the UI feel snappy.
		Actions.removeWindowLocally(winID);

		//If we can't close within 4 seconds, something's wrong - try to force close it.
		let closeTimeout = setTimeout(() => {
			onCloseFailure();
		}, 4000);

		var onCloseSuccess = () => {
			clearTimeout(closeTimeout);
		};

		var onCloseFailure = () => {
			//If Actions.closeWindow was called with force === true, and the close failed, give the user the opportunity to terminate the process.
			if (force) {
				FSBL.Clients.DialogManager.open(
					"yesNo",
					{
						title: "Terminate Process?",
						question:
							"The app that you are attempting to close is unresponsive. Would you like to terminate the process? Terminating the process may close other apps.",
						affirmativeResponseLabel: "Terminate",
						showNegativeButton: false,
					},
					(err, response) => {
						if (err || response.choice === "affirmative") {
							return Actions.terminateProcess(parentApp, true);
						}
					}
				);
			} else {
				Actions.closeWindow(winID, true);
			}
		};
		win.close(force, onCloseSuccess, onCloseFailure);
	},
};

module.exports.Store = ProcessMonitorStore;
module.exports.Actions = Actions;
