/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import { EventEmitter } from "events";
let values = {
	companionBounds: {},
	state: "small",
	headerConfigs: {},
	companionWindow: null
};
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

var Actions = {
	initialize(cb) {
		var spData = FSBL.Clients.WindowClient.getSpawnData();
		FSBL.FinsembleWindow.wrap(spData.parent, function (err, wrappedWindow) {
			HeaderStore.setCompanionWindow(wrappedWindow);
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


			wrappedWindow.getBounds({}, function (err, bounds) {
				HeaderStore.setCompanionBounds(bounds);
				console.log("start bounds", bounds)
				FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left + (bounds.width / 2) - 43, width: 86, height: 10, top: bounds.top }, {}, function () {
					cb();
				})
			})
		});
	},
	onBoundsChanged(bounds) {
		HeaderStore.setCompanionBounds(bounds);
		if (HeaderStore.getMoving()) return;
		console.log("bounds changed", bounds)
		if (HeaderStore.getState() === "small") {
			var mainWindow = fin.desktop.Window.getCurrent();
			FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left + (bounds.width / 2) - 38, width: 86, height: 10, top: bounds.top }, {}, function (err) {

			})
		} else {
			FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left, width: bounds.width, height: 38, top: bounds.top }, {}, function () {
				FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
			})
		}
	},
	onCompanionStartedMoving() {
		console.log("onCompanionStartedMoving")
		HeaderStore.setMoving(true);
		FSBL.Clients.WindowClient.finsembleWindow.hide();
	},
	onCompanionStoppedMoving() {
		console.log("onCompanionStoppedMoving")
		HeaderStore.setMoving(false);
		Actions.updateWindowPosition(function () {
			FSBL.Clients.WindowClient.finsembleWindow.show();
		})
	},
	isMouseInHeader(cb) {
		setTimeout(function () {
			let finWindow = fin.desktop.Window.getCurrent();
			fin.desktop.System.getMousePosition(function (mousePosition) {
				finWindow.getBounds(function (bounds) {
					let inBounds = FSBL.Clients.WindowClient.isPointInBox({ x: mousePosition.left, y: mousePosition.top }, bounds)
					return cb(null, inBounds);
				})
			});
		}, 100)

	},
	updateWindowPosition(cb = Function.prototype) {

		HeaderStore.getCompanionWindow().getBounds({}, function (err, bounds) {
			HeaderStore.setCompanionBounds(bounds);
			if (!bounds.width) bounds.width = bounds.right - bounds.left
			console.log("bounds updateWindowPosition", HeaderStore.getState(), bounds, bounds.left + (bounds.width / 2) - 86)
			if (HeaderStore.getState() === "small") {
				return FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left + (bounds.width / 2) - 43, width: 86, height: 10, top: bounds.top }, {}, function () {
					//	setTimeout(function () {
					FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
					cb();
					//}, 200)
				})
			}
			return FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left, width: bounds.width, height: 38, top: bounds.top }, {}, function () {
				setTimeout(function () {
					FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
					cb();
				}, 200)
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
		Actions.updateWindowPosition();
	},
	onCompanionMaximized() {
		Actions.updateWindowPosition();
	},
	onCompanionRestored() {
		Actions.updateWindowPosition();
	},
	expandWindow(cb) {

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
				finWindow.animate({ size: { duration: 350, height: 38 } }, function () { }, function () {
					HeaderStore.emit("tabRegionShow")
					HeaderStore.setState("large");
				});
				cb()
			})
	},
	contractWindow(cb) {
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
					HeaderStore.setState("small");
					cb()
				});

			});
	}
}
HeaderStore.initialize();

export { HeaderStore as Store };
export { Actions };
