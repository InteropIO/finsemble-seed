/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import { EventEmitter } from "events";

let values = {
	companionBounds: {},
	state: "small",
	headerConfigs: {},
	companionWindow: null,
	moving: false
};
let animating = false;
let updateBoundsAfterAnimate = false;
var HeaderStore = Object.assign({}, EventEmitter.prototype, {

	/**
	 * Sets initial values for the store.
	 * @todo convert to the DistributedStoreClient.
	 */
	initialize: function () {

	},
	getCompanionWindow() {
		return values.companionWindow;
	},
	setCompanionWindow(window) {
		values.companionWindow = window;
	},
	setMoving(movingState) {
		values.moving = movingState;
	},
	getMoving() {
		return values.moving;
	},
	getState() {
		return values.state;
	},
	setState(state) {
		values.state = state;
	},
	toggleState() {
		values.state = values.state === "small" ? "large" : "small";
	},
	setCompanionBounds(bounds) {
		values.companionBounds = bounds
	},
	getCompanionBounds() {
		return values.companionBounds;
	}
});
let localParent = null
var Actions = {
	initialize(cb) {
		HeaderStore.initialize();
		var spData = FSBL.Clients.WindowClient.getSpawnData();
		FSBL.FinsembleWindow.wrap(spData.parent, function (err, wrappedWindow) {
			HeaderStore.setCompanionWindow(wrappedWindow);
			var onParentSet = () => {
				wrappedWindow.parentWindow.addListener("startedMoving", Actions.onCompanionStartedMoving);
				wrappedWindow.parentWindow.addListener("stoppedMoving", Actions.onCompanionStoppedMoving);
				wrappedWindow.parentWindow.addListener("bringToFront", Actions.onCompanionBringToFront);

				Actions.isWindowVisible((err, isVisible) => {
					if (!isVisible) {
						Actions.onCompanionHidden()
					}
				})

				if (wrappedWindow.parentWindow)
					localParent = wrappedWindow.parentWindow;
				HeaderStore.emit("expandWindow")
			};
			var onParentCleared = () => {
				FSBL.Clients.WindowClient.finsembleWindow.show();
				FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
				if (localParent) {
					localParent.removeListener("startedMoving", Actions.onCompanionStartedMoving);
					localParent.removeListener("stoppedMoving", Actions.onCompanionStoppedMoving);
					localParent.removeListener("bringToFront", Actions.onCompanionBringToFront);
				}

			};
			Actions.isWindowVisible((err, isVisible) => {// check on init. Mainly for workspace reload
				if (!isVisible) {
					Actions.onCompanionHidden()
				}
			})

			wrappedWindow.addListener("setParent", onParentSet);
			wrappedWindow.addListener("clearParent", onParentCleared)

			wrappedWindow.addListener("bounds-set", Actions.onBoundsChanged);
			wrappedWindow.addListener("closed", Actions.onCompanionClosed);
			wrappedWindow.addListener("hidden", Actions.onCompanionHidden);
			wrappedWindow.addListener("shown", Actions.onCompanionShown);
			wrappedWindow.addListener("maximized", Actions.onCompanionMaximized);
			wrappedWindow.addListener("restored", Actions.onCompanionRestored);
			wrappedWindow.addListener("bringToFront", Actions.onCompanionBringToFront);
			wrappedWindow.addListener("restored", Actions.onCompanionRestored);
			wrappedWindow.addListener("startedMoving", Actions.onCompanionStartedMoving);
			wrappedWindow.addListener("stoppedMoving", Actions.onCompanionStoppedMoving);
			wrappedWindow.addListener("focused", Actions.onCompanionFocused);

			wrappedWindow.getBounds({}, function (err, bounds) {// set the bounds and then show the window
				if (!bounds.width) bounds.width = bounds.right - bounds.left;
				console.log("start bounds", bounds, { left: bounds.left + (bounds.width / 2) - 43, width: 86, height: 10, top: bounds.top })
				HeaderStore.setCompanionBounds(bounds);
				FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left + (bounds.width / 2) - 43, width: 86, height: 10, top: bounds.top }, {}, function (err) {
					Actions.updateWindowPosition()//hack for small window
					FSBL.Clients.WindowClient.finsembleWindow.show(false, function () {

						FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
					});
					cb();
				}, function () { });
			})


		});
	},
	//check to see if the current window is the visible window
	isWindowVisible(cb) {
		let wrappedWindow = HeaderStore.getCompanionWindow();
		if (wrappedWindow.parentWindow) {
			wrappedWindow.parentWindow.getStore(function (store) {
				store.getValues(function (err, response) {
					if (response) {
						if (response[wrappedWindow.parentWindow.windowName].descriptor.visibleWindowIdentifier.windowName === wrappedWindow.windowName) {
							return cb(null, true);
						}
						return cb(null, false);
					}
				})
			})
		}
	},
	onBoundsChanged(bounds) {
		HeaderStore.setCompanionBounds(bounds);
		if (HeaderStore.getMoving()) return;
		if (HeaderStore.getState() === "small") {
			FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left + (bounds.width / 2) - 38, width: 86, height: 10, top: bounds.top }, {}, function (err) {
			})
		} else {
			FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left, width: bounds.width, height: 32, top: bounds.top }, {}, function (err) {
				FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
			})
		}
	},
	// hide the titlebar when the window is moving
	onCompanionStartedMoving() {
		HeaderStore.setMoving(true);
		FSBL.Clients.WindowClient.finsembleWindow.hide();
	},
	// Show the titlebar when the window is moving
	onCompanionStoppedMoving() {
		HeaderStore.setMoving(false);
		Actions.updateWindowPosition(function () {
			if (HeaderStore.getCompanionWindow().parentWindow) {
				if (Actions.isWindowVisible(function (err, isVisible) {
					if (isVisible) {
						FSBL.Clients.WindowClient.finsembleWindow.show();
					}
				}));
			} else {
				FSBL.Clients.WindowClient.finsembleWindow.show();
			}
		})
	},
	onCompanionFocused() {
		FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
	},
	//Helper function to update the titlebar's position
	updateWindowPosition(cb = Function.prototype) {
		if (animating) {
			updateBoundsAfterAnimate = true;
			return;
		}
		HeaderStore.getCompanionWindow().getBounds({}, function (err, bounds) {
			console.debug("updateWindowPosition", bounds)
			HeaderStore.setCompanionBounds(bounds);
			if (!bounds.width) bounds.width = bounds.right - bounds.left

			if (HeaderStore.getState() === "small") {
				return FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left + (bounds.width / 2) - 43, width: 86, height: 10, top: bounds.top }, {}, function (err) {
					FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
					cb();
				})
			}
			return FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left, width: bounds.width, height: 38, top: bounds.top }, {}, function (err) {
				FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
				cb();
			})
		})
	},
	onCompanionClosed() {
		FSBL.Clients.WindowClient.finsembleWindow.close({});
	},
	onCompanionHidden() {
		FSBL.Clients.WindowClient.finsembleWindow.hide();
	},
	onCompanionShown() {
		FSBL.Clients.WindowClient.finsembleWindow.show();
	},
	onCompanionBringToFront() {
		FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
	},
	onCompanionMaximized() {
		Actions.updateWindowPosition();
	},
	onCompanionRestored() {
		Actions.updateWindowPosition();
	},
	//Expand the window and set the animate flag. If trying to setbounds at the same time as animate, bounds gets messed up.
	expandWindow(cb) {
		animating = true;
		if (HeaderStore.getState() === "large") return
		HeaderStore.setState("large");
		let finWindow = fin.desktop.Window.getCurrent();
		let currentBound = HeaderStore.getCompanionBounds();
		FSBL.Clients.WindowClient.finsembleWindow.updateOptions({
			"cornerRounding": {
				"height": 0,
				"width": 0
			}
		});

		finWindow.animate({ position: { duration: 0, left: currentBound.left }, size: { duration: 0, width: currentBound.width, height: 1 } },
			function (err) { console.error(err) },
			function (err) {
				finWindow.animate({ size: { duration: 350, height: 32 } }, function () { }, function () {
					HeaderStore.emit("tabRegionShow")
					animating = false
					if (updateBoundsAfterAnimate) {
						updateBoundsAfterAnimate = false;
						Actions.updateWindowPosition();
					}
				});
				cb()
			})

	},
	//Contract the window and set the animate flag.
	contractWindow(cb) {
		HeaderStore.setState("small");
		animating = true;
		let finWindow = fin.desktop.Window.getCurrent();
		let currentBound = HeaderStore.getCompanionBounds();
		FSBL.Clients.WindowClient.finsembleWindow.updateOptions({
			"cornerRounding": {
				"height": 0,
				"width": 0
			}
		});
		finWindow.animate({ size: { duration: 350, height: 10 } },
			function (err) { console.error(err) },
			function () {
				finWindow.animate({ position: { duration: 0, left: currentBound.left + (currentBound.width / 2) - 43, top: currentBound.top }, size: { duration: 0, width: 86 } }, function () { }, function () {
					animating = false
					if (updateBoundsAfterAnimate) {
						updateBoundsAfterAnimate = false;
						Actions.updateWindowPosition();
					}
					cb()
				});

			});
	}
}


export { HeaderStore as Store };
export { Actions };
