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
			wrappedWindow.addListener("bounds-set", Actions.onBoundsChanged);
			wrappedWindow.addListener("closed", Actions.onCompanionClosed);
			wrappedWindow.addListener("hidden", Actions.onCompanionHidden);
			wrappedWindow.addListener("shown", Actions.onCompanionShown);
			wrappedWindow.getBounds({}, function (err, bounds) {
				HeaderStore.setCompanionBounds(bounds);
				FSBL.Clients.WindowClient.finsembleWindow.setBounds({ left: bounds.left + (bounds.width / 2) - 86, width: 86, height: 10, top: bounds.top }, {}, function () {
					cb();
				})
			})
		});
	},
	onBoundsChanged(bounds) {
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
	onCompanionClosed() {
		FSBL.Clients.WindowClient.finsembleWindow.close({});
	},
	onCompanionHidden() {
		FSBL.Clients.WindowClient.finsembleWindow.hide();
	},
	onCompanionShown() {
		FSBL.Clients.WindowClient.finsembleWindow.show();
	},
	updateWindowState(cb) {//expand/contract
		let finWindow = fin.desktop.Window.getCurrent();
		let currentBound = HeaderStore.getCompanionBounds();
		if (HeaderStore.getState() === "small") {
			FSBL.Clients.WindowClient.finsembleWindow.updateOptions({
				"cornerRounding": {
					"height": 0,
					"width": 0
				}
			});
			finWindow.animate({ position: { duration: 0, left: currentBound.left }, size: { duration: 0, width: currentBound.width, height: 1 } },
				function (err) { console.error(err) },
				function (err) {
					finWindow.animate({ size: { duration: 350, height: 38 } });
					HeaderStore.toggleState()
					cb()
					console.log("err", err)
				})
		} else {
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
		}

	}
};

HeaderStore.initialize();

export { HeaderStore as Store };
export { Actions };
