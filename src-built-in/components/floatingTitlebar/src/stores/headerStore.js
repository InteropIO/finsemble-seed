/*!
* Copyright 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import { EventEmitter } from "events";
import series from "async/series";

let values = {
	companionBounds: {},
	state: "small",
	headerConfigs: {},
	companionWindow: null,
	moving: false
};
const COMPANION_EXPANDED_HEIGHT = 25;
const COMPANION_CONTRACTED_HEIGHT = 10;
const COMPANION_CONTRACTED_WIDTH = 86;
let Logger = FSBL.Clients.Logger;
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
		values.companionBounds = bounds;
	},
	getCompanionBounds() {
		return values.companionBounds;
	}
});
let localParent = null;//
var Actions = {
	initialize(cb = Function.prototype) {
		HeaderStore.initialize();
		var spData = FSBL.Clients.WindowClient.getSpawnData();
		//'parent' here refers to the native window that we've befriended.
		FSBL.FinsembleWindow.getInstance(spData.parent, function (err, wrappedWindow) {
			HeaderStore.setCompanionWindow(wrappedWindow);
			var onParentSet = async (e) => {
				let { data } = e;
				console.log(data);
				if (!localParent && data.parentName) {
					let { wrap } = await FSBL.FinsembleWindow.getInstance({ name: data.parentName });
					localParent = wrap;

					localParent.addListener("startedMoving", Actions.onCompanionStartedMoving);
					localParent.addListener("stoppedMoving", Actions.onCompanionStoppedMoving);
					localParent.addListener("bringToFront", Actions.onCompanionBringToFront);
					localParent.addListener("bounds-set", Actions.onBoundsChanged);

					wrappedWindow.getBounds((err, bounds) => {
						Actions.onBoundsChanged({
							data: bounds
						})
					})
					Actions.isWindowVisible((err, isVisible) => {
						if (!isVisible) {
							Actions.onCompanionHidden();
						}
					});

				}


			};
			var onParentCleared = () => {
				Logger.system.debug("Companion window onParentCleared");
				FSBL.Clients.WindowClient.finsembleWindow.show();
				FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
				if (localParent) {
					localParent.removeListener("startedMoving", Actions.onCompanionStartedMoving);
					localParent.removeListener("stoppedMoving", Actions.onCompanionStoppedMoving);
					localParent.removeListener("bringToFront", Actions.onCompanionBringToFront);
					localParent = null;
					wrappedWindow.show();
				}

			};
			Actions.isWindowVisible((err, isVisible) => {// check on init. Mainly for workspace reload
				if (!isVisible) {
					Actions.onCompanionHidden();
				}
			});

			wrappedWindow.addListener("setParent", onParentSet);
			wrappedWindow.addListener("clearParent", onParentCleared);
			wrappedWindow.listenForBoundsSet();
			wrappedWindow.addListener("bounds-set", Actions.onBoundsChanged);
			wrappedWindow.addListener("closed", Actions.onCompanionClosed);
			wrappedWindow.addListener("hidden", Actions.onCompanionHidden);
			wrappedWindow.addListener("shown", Actions.onCompanionShown);
			wrappedWindow.addListener("restored", Actions.onCompanionRestored);
			wrappedWindow.addListener("bringToFront", Actions.onCompanionBringToFront);
			wrappedWindow.addListener("minimized", Actions.onCompanionMinimized);
			wrappedWindow.addListener("startedMoving", Actions.onCompanionStartedMoving);
			wrappedWindow.addListener("stoppedMoving", Actions.onCompanionStoppedMoving);
			wrappedWindow.addListener("focused", Actions.onCompanionFocused);

			wrappedWindow.getBounds({}, function (err, bounds) {// set the bounds and then show the window
				if (!bounds.width) bounds.width = bounds.right - bounds.left;
				//console.log("start bounds", bounds, Actions.getContractedBounds(bounds));
				HeaderStore.setCompanionBounds(bounds);
				let newBounds = Actions.getContractedBounds(bounds);
				newBounds.persistBounds = false;
				FSBL.Clients.WindowClient.finsembleWindow.setBounds(
					newBounds,
					function (err) {
						Actions.updateWindowPosition();//hack for small window
						if (spData.showOnSpawn && !wrappedWindow.parentWindow) {
							FSBL.Clients.WindowClient.finsembleWindow.show(false, function () {
								FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
							});
						} else {
							Actions.isWindowVisible(function (err, isVisible) {
								if (isVisible)
									FSBL.Clients.WindowClient.finsembleWindow.show(false, function () {
										FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
									});
							});
						}
						cb();
					}, function () { });
			});


		});
	},
	//check to see if the current window is the visible window
	isWindowVisible(cb = Function.prototype) {
		let wrappedWindow = HeaderStore.getCompanionWindow();
		if (localParent) {
			localParent.getStore(function (store) {
				store.getValues(function (err, response) {
					if (response) {
						if (!localParent) {
							return cb(null, true);
						}
						if (response[localParent.windowName].descriptor.visibleWindowIdentifier.windowName === wrappedWindow.windowName) {
							return cb(null, true);
						}
						return cb(null, false);
					}
				});
			});
		} else {
			return cb(null, true);
		}
	},
	getContractedBounds(bounds) {
		return {
			left: bounds.left + (bounds.width / 2) - (COMPANION_CONTRACTED_WIDTH / 2),
			width: COMPANION_CONTRACTED_WIDTH,
			height: COMPANION_CONTRACTED_HEIGHT,
			top: bounds.top
		};
	},
	getExpandedBounds(bounds) {
		return {
			left: bounds.left,
			width: bounds.width,
			height: COMPANION_EXPANDED_HEIGHT,
			top: bounds.top
		};
	},
	onBoundsChanged(params) {
		let bounds = params.data;
		HeaderStore.setCompanionBounds(bounds);
		if (HeaderStore.getState() === "small") {
			let newBounds = Actions.getContractedBounds(bounds);
			newBounds.persistBounds = false;
			FSBL.Clients.WindowClient.finsembleWindow.setBounds(newBounds, function (err) {
				if (err) {
					FSBL.Clients.Logger.error("CompanionWindow setBounds error", err);
				}
			});
		} else {
			let newBounds = Actions.getExpandedBounds(bounds);
			newBounds.persistBounds = false;

			FSBL.Clients.WindowClient.finsembleWindow.setBounds(newBounds, function (err) {
				if (err) {
					FSBL.Clients.Logger.error("CompanionWindow setBounds error", err);
				}
				FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
			});
		}
	},
	// hide the titlebar when the window is moving
	onCompanionStartedMoving() {
		Logger.system.debug("Companion window started moving");
		HeaderStore.setMoving(true);
		FSBL.Clients.WindowClient.finsembleWindow.hide();
	},
	// Show the titlebar when the window is moving
	onCompanionStoppedMoving(evt) {
		Logger.system.debug("Companion window stopped moving");
		HeaderStore.setMoving(false);
		Actions.updateWindowPosition(evt);
		if (HeaderStore.getMoving()) return;
		if (localParent) {
			Actions.isWindowVisible(function (err, isVisible) {
				if (isVisible) {
					Logger.system.debug("Companion window show from stop");
					FSBL.Clients.WindowClient.finsembleWindow.show();
				}
			});
		} else {
			Logger.system.debug("Companion window show from stop");
			FSBL.Clients.WindowClient.finsembleWindow.show();
		}
	},
	onCompanionFocused() {
		Logger.system.debug("Companion window focused");
		if (HeaderStore.getMoving()) return;
		setTimeout(() => {
			FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
		}, 50);
	},
	//Helper function to update the titlebar's position
	updateWindowPosition(params, cb = Function.prototype) {
		if (animating) {
			updateBoundsAfterAnimate = true;
			return;
		}
		if (!params) {
			return HeaderStore.getCompanionWindow().getBounds({}, (err, bounds) => { this.updateWindowPosition({ data: bounds }); })
		}
		let bounds = params.data;

		HeaderStore.setCompanionBounds(bounds);
		if (!bounds.width) bounds.width = bounds.right - bounds.left;

		Actions.isWindowVisible(function (err, isVisible) {
			if (isVisible) {
				FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
			}
		});

		let onBoundsSet = function (err) {
			if (err) {
				FSBL.Clients.Logger.error(err);
			}
			cb();
		};

		if (HeaderStore.getState() === "small") {
			let newBounds = Actions.getContractedBounds(bounds);
			newBounds.persistBounds = false;
			return FSBL.Clients.WindowClient.finsembleWindow.setBounds(newBounds, onBoundsSet);
		}

		let newBounds = Actions.getExpandedBounds(bounds);
		newBounds.persistBounds = false;
		return FSBL.Clients.WindowClient.finsembleWindow.setBounds(newBounds, { persistBounds: false }, onBoundsSet);

	},
	onCompanionClosed() {
		Logger.system.debug("Companion window closed");
		FSBL.Clients.WindowClient.finsembleWindow.close({});
	},
	onCompanionHidden() {
		Logger.system.debug("Companion window hidden");
		FSBL.Clients.WindowClient.finsembleWindow.hide();
	},
	onCompanionShown() {
		Logger.system.debug("Companion window shown");
		if (HeaderStore.getMoving()) return;
		FSBL.Clients.WindowClient.finsembleWindow.show();
	},
	onCompanionBringToFront() {
		Logger.system.debug("Companion window BTF");
		if (HeaderStore.getMoving()) return;
		setTimeout(() => {
			Actions.isWindowVisible(function (err, isVisible) {
				console.debug("Companion show.......", isVisible);
				if (isVisible) {
					console.debug("Companion show.......");
					FSBL.Clients.WindowClient.finsembleWindow.show();
				}
				FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
			});
			//@note this was 500, it was lowered to 50 after improvements were made to the event system.
		}, 50);

	},
	onCompanionMinimized() {
		Logger.system.debug("Companion window minimized");
		FSBL.Clients.WindowClient.finsembleWindow.hide();
	},
	onCompanionRestored() {
		Logger.system.debug("Companion window restored");
		Actions.isWindowVisible((err, isVisible) => {
			if (isVisible) {
				console.debug("Companion show22.......", isVisible);
				FSBL.Clients.WindowClient.finsembleWindow.show();
				FSBL.Clients.WindowClient.finsembleWindow.bringToFront();
			}
		});
		// Actions.updateWindowPosition();
	},
	//Expand the window and set the animate flag. If trying to setBounds at the same time as animate, bounds gets messed up.
	expandWindow(cb = Function.prototype) {
		if (animating) return cb();
		animating = true;
		if (HeaderStore.getState() === "large") return;
		HeaderStore.setState("large");
		let systemWindow = FSBL.System.Window.getCurrent();
		let currentBound = HeaderStore.getCompanionBounds();
		FSBL.Clients.WindowClient.finsembleWindow.updateOptions({
			"cornerRounding": {
				"height": 0,
				"width": 0
			}
		});
		let expandedBounds = Actions.getExpandedBounds(currentBound);

		const logAnimationError = (err) => {
			if (err) {
				console.error("Error in size animation", err);
			}
		};
		const widenCompanion = (done) => {
			systemWindow.animate({
				position: {
					duration: 0,
					left: expandedBounds.left
				},
				size: {
					duration: 0,
					width: expandedBounds.width,
					height: COMPANION_CONTRACTED_HEIGHT
				}
			}, done, done);
		};
		const expandCompanion = (done) => {
			systemWindow.animate({ size: { duration: 150, height: expandedBounds.height } }, done, done);
		};
		const onAnimationCompleted = (err) => {
			logAnimationError(err);
			HeaderStore.emit("tabRegionShow");
			animating = false;
			if (updateBoundsAfterAnimate) {
				updateBoundsAfterAnimate = false;
				// Actions.updateWindowPosition();
			}
			cb();
		};
		series([
			widenCompanion,
			expandCompanion
		], onAnimationCompleted);
	},
	//Contract the window and set the animate flag.
	contractWindow(cb = Function.prototype) {
		//console.log("Contracting window");
		HeaderStore.setState("small");
		if (animating) return cb();
		animating = true;
		let systemWindow = FSBL.System.Window.getCurrent();
		let currentBound = HeaderStore.getCompanionBounds();
		FSBL.Clients.WindowClient.finsembleWindow.updateOptions({
			"cornerRounding": {
				"height": 0,
				"width": 0
			}
		});

		const contractedBounds = Actions.getContractedBounds(currentBound);

		const logAnimationError = (err) => {
			if (err) {
				console.error("Error in size animation", err);
			}
		};
		const shrinkCompanion = (done) => {
			systemWindow.animate({ size: { duration: 150, height: contractedBounds.height } }, done, done);
		};

		const centerCompanion = (done) => {
			systemWindow.animate({
				position: {
					duration: 0,
					left: contractedBounds.left,
					top: contractedBounds.top
				},
				size: {
					duration: 0,
					width: contractedBounds.width
				}
			}, done, done);
		};

		const onAnimationCompleted = (err) => {
			animating = false;
			if (updateBoundsAfterAnimate) {
				updateBoundsAfterAnimate = false;
				Actions.updateWindowPosition();
			}
			logAnimationError(err);
			cb();
		};

		series([
			shrinkCompanion,
			centerCompanion
		], onAnimationCompleted);
	}
};


export { HeaderStore as Store };
export { Actions };
