const timesSeries = require("async/timesSeries");
let ProcessMonitorStore;
var Actions = {
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
		} else if(!prompt) {
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
function initialize(cb) {
	createLocalStore(() => {
		cb();
	});
}
module.exports.initialize = initialize;
module.exports.Store = ProcessMonitorStore;
module.exports.Actions = Actions;