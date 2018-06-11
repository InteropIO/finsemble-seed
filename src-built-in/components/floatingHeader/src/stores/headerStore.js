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
	getState() {
		return values.state;
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
			wrappedWindow.listenForBoundsSet();
			wrappedWindow.addListener("bounds-set", Actions.onBoundsChanged);
			wrappedWindow.addListener("closed", Actions.onCompanionClosed);
			wrappedWindow.addListener("hidden", Actions.onCompanionHidden);
			wrappedWindow.addListener("shown", Actions.onCompanionShown);
			wrappedWindow.getBounds({}, function (err, bounds) {
				HeaderStore.setCompanionBounds(bounds);
				console.log("bounds", bounds)
				FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left + (bounds.width / 2) - 86, width: 86, height: 10, top: bounds.top }, {}, function () {
					cb();
				})
			})
		});
	},
	onBoundsChanged(bounds) {
		console.log("set bounds", HeaderStore.getState())
		if (isNaN(bounds.bottom)) debugger;
		HeaderStore.setCompanionBounds(bounds);
		if (HeaderStore.getState() === "small") {
			var mainWindow = fin.desktop.Window.getCurrent();
			//	mainWindow.setBounds(bounds.left + (bounds.width / 2) - 43, bounds.top, 86, 10);
			FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left + (bounds.width / 2) - 43, width: 86, height: 10, top: bounds.top }, {}, function (err) {
				console.log("set bounds", err)
			})
		} else {
			FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left, width: bounds.width, height: 38, top: bounds.top }, {}, function () {
			})
		}
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
	onCompanionClosed() {
		FSBL.Clients.WindowClient.finsembleWindow.close({});
	},
	onCompanionHidden() {
		FSBL.Clients.WindowClient.finsembleWindow.hide();
	},
	onCompanionShown() {
		FSBL.Clients.WindowClient.finsembleWindow.show();
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
				console.log("emit event");

				finWindow.animate({ size: { duration: 350, height: 38 } }, function () { }, function () {
					HeaderStore.emit("tabRegionShow")
				});
				HeaderStore.toggleState()
				cb()
				console.log("err", err)
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
					HeaderStore.toggleState()
					cb()
				});

			});
	},

	updateWindowState(cb) {//expand/contract

		if (HeaderStore.getState() === "small") {

		} else {


		}
	}
}
HeaderStore.initialize();

export { HeaderStore as Store };
export { Actions };
