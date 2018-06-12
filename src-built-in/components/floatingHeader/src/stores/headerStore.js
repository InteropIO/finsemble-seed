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
		HeaderStore.initialize();
		var finWindow = fin.desktop.Window.getCurrent();
		console.log("add event----------------------------")
		finWindow.addEventListener("bounds-changed", function (event) {
			console.warn("The window has been moved or resized", event);
		}, function () {
			console.info("The registration was successful");
		}, function (reason) {
			console.info("failure:" + reason);
		});
		var spData = FSBL.Clients.WindowClient.getSpawnData();
		FSBL.FinsembleWindow.wrap(spData.parent, function (err, wrappedWindow) {
			var onParentSet = () => {
				console.log("expandWindow from parent")
				HeaderStore.emit("expandWindow")
			};
			var onParentCleared = () => {
				//HeaderStore.emit("expandWindow")
			};

			HeaderStore.setCompanionWindow(wrappedWindow);
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



			wrappedWindow.getBounds({}, function (err, bounds) {
				HeaderStore.setCompanionBounds(bounds);
				FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left + (bounds.width / 2) - 43, width: 86, height: 10, top: bounds.top }, {}, function () {
					FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
					cb();
				})
			})
		});
	},
	onBoundsChanged(bounds) {
		HeaderStore.setCompanionBounds(bounds);
		if (HeaderStore.getMoving()) return;
		if (HeaderStore.getState() === "small") {
			var mainWindow = fin.desktop.Window.getCurrent();
			console.error("onBoundsChanged setBounds ", { left: bounds.left + (bounds.width / 2) - 38, width: 86, height: 10, top: bounds.top })
			FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left + (bounds.width / 2) - 38, width: 86, height: 10, top: bounds.top }, {}, function (err) {
			})
		} else {
			console.error("onBoundsChanged setBounds ", { left: bounds.left, width: bounds.width, height: 38, top: bounds.top })
			FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left, width: bounds.width, height: 38, top: bounds.top }, {}, function (err) {
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
	onCompanionFocused() {

		Actions.updateWindowPosition(function () {

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
		//setTimeout(function () {


		HeaderStore.getCompanionWindow().getBounds({}, function (err, bounds) {
			HeaderStore.setCompanionBounds(bounds);
			if (!bounds.width) bounds.width = bounds.right - bounds.left

			if (HeaderStore.getState() === "small") {
				console.error("updateWindowPosition setBounds ", bounds, { left: bounds.left + (bounds.width / 2) - 43, width: 86, height: 10, top: bounds.top })
				return FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left + (bounds.width / 2) - 43, width: 86, height: 10, top: bounds.top }, {}, function (err) {
					console.log(" bring to front call", err)
					FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
					cb();
				})
			}
			console.error("updateWindowPosition setBounds ", bounds, { left: bounds.left, width: bounds.width, height: 38, top: bounds.top })
			return FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left, width: bounds.width, height: 38, top: bounds.top }, {}, function (err) {
				console.log(" bring to front call", err)
				FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
				cb();
			})
		})
		//}, 100)
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
		console.log("expandWindow in store ------------------------------------")
		setTimeout(function () {

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
			console.error("expandWindow setBounds ", currentBound)

			finWindow.animate({ position: { duration: 0, left: currentBound.left }, size: { duration: 0, width: currentBound.width, height: 1 } },
				function (err) { console.error(err) },
				function (err) {
					finWindow.animate({ size: { duration: 350, height: 38 } }, function () { }, function () {
						HeaderStore.emit("tabRegionShow")

					});
					cb()
				})
		}, 20)
	},
	contractWindow(cb) {
		console.log("contractWindow in store")
		HeaderStore.setState("small");
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

					cb()
				});

			});
	}
}


export { HeaderStore as Store };
export { Actions };
