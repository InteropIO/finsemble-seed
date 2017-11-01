/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var StorageClient = require("./storageClient");
var WorkspaceClient = require("./workspaceClient");
var LauncherClient = require("./launcherClient");
var util = require("../common/util");
var BaseClient = require("./baseClient");
var Logger = require("./logger");
var Validate = require("../common/validate"); // Finsemble args validator
var deepEqual = require("lodash.isequal");
var finWindow;
window.deepEqual = deepEqual;
Logger.system.log("Starting WindowClient");

/**
 *
 * Helper to see if element has a class.
 * @param {HTMLElement} el
 * @param {String} className
 * @private
 * @return {HTMLElement}
 */
function hasClass(el, className) {
	if (el.classList) {
		return el.classList.contains(className);
	} else {
		return !!el.className.match(new RegExp("(\\s|^)" + className + "(\\s|$)"));
	}
}

/**
 * Adds a class to an html element
 * @param {HTMLElement} el
 * @param {String} className
 * @private
 */
function addClass(el, className) {
	if (el.classList) {
		el.classList.add(className);
	} else if (!hasClass(el, className)) {
		el.className += " " + className;
	}
}

/**
 *
 * Removes class from html element
 * @param {HTMLElement} el
 * @param {String} className
 * @private
 */
function removeClass(el, className) {
	if (el.classList) {
		el.classList.remove(className);
	} else if (hasClass(el, className)) {
		var reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
		el.className = el.className.replace(reg, " ");
	}
}

/**
 *
 *@introduction
  <h2>Window Client</h2>
  ----------
 * The WindowClient is primarily responsible for managing the windowState (the window's bounds) and componentState (data inside of your component). It also injects the windowTitleBar component, which contains controls for minimizing, maximizing, closing, and restoring your window. The reference below is provided in case you'd like to manually trigger events.
 *
 * This is the WindowClient API reference. If you're looking for information about the window header, please see the [Window Header tutorial]{@tutorial windowTitleBarComponent} for more information.
 *
 * @hideConstructor true
 * @param {object} params
 * @constructor
 * @returns {WindowClient}
 */
function WindowClient(params) {
	Validate.args(params, "object=") && params && Validate.args2("params.onReady", params.onReady, "function=");

	/** @alias WindowClient# */
	BaseClient.call(this, params);

	var self = this;
	//We store the options that the window is created with in this property.
	/**
	* A copy of the `finWindow`'s options value. This is where we store information like monitorDimensions, initialization information, and any other data that needs to be passed from the parent application into the created window.
	* @type WindowClient
	*/
	this.options = {};
	//The hash we use to save data with.
	this.windowHash = "";
	//Window's title.
	this.title = null;
	//This is the bottom edge of the toolbar. The window's position will be offset by this much.
	//@todo move this value to a config.
	this.toolbarBottom = 40;
	//default value. The window assigns the containers it cares about before starting.
	this.containers = [];
	//window state for restoration purposes.
	this.componentState = {};
	//This can be either normal, minimized, or maximized.
	this.windowState = "normal";
	// This gets set to true if the window has a header
	this.hasHeader = false;
	/**
	 * This function is fired every time the window's bounds change. It saves the window's position.
	 * @param {object} bounds
	 * @private
	 */
	var onWindowBoundsChanged = function (bounds) {
		self.saveWindowBounds(bounds, true);
	};
	var onWindowRestored = function () {
		self.updateHeaderState("Maximize", { hide: false });
	};
	var onWindowMaximized = function () {
		self.updateHeaderState("Maximize", { hide: true });
	};
	var onWindowBlurred = function () {
		if (self.hasHeader) {
			self.setActive(false);
		}
	};
	var onWindowFocused = function () {
		if (self.hasHeader) {
			self.setActive(true);
		}
	};
	var onMinimizedRestored = function () {
		self.registerWithDockingManager();
		finWindow.removeEventListener("restored", onMinimizedRestored);
	};
	var onWindowMinimized = function () {
		self.deregisterWithDockingManager();
		finWindow.addEventListener("restored", onMinimizedRestored);
	};
	/**
	 * Closes Window.
	 * @param {boolean} removeFromWorkspace whether to remove the window from the workspace.
	 * Defaults are to remove the window from the workspace if the user presses the X button, but not if the window is closed via an app-level request (e.g., we need to switch workspaces, so all windows need to close).
	 * @example
	 *	//Close window and remove from workspace (e.g., user closes the window).
	 *	FSBL.Clients.WindowClient.close(true);
	 *	//Close window and keep in workspace (e.g., application requests that all windows close themselves).
	 *	FSBL.Clients.WindowClient.close(false);
	 */
	var onClose = function (removeFromWorkspace) {
		//hide window, then do cleanup. This makes close feel more responsive.
		finWindow.hide();
		let bounds = {
			left: self.options.defaultLeft,
			width: self.options.defaultWidth,
			height: self.options.defaultHeight,
			top: self.options.defaultTop
		};
		self.saveWindowBounds(bounds, false);
		Validate.args(removeFromWorkspace, "boolean");
		Logger.system.log("close Called");
		self.deregisterWithDockingManager(removeFromWorkspace);
		self.removeFinWindowEventListeners();
		self.routerClient.disconnectAll();
		if (removeFromWorkspace) {
			WorkspaceClient.removeWindow({
				name: finWindow.name
			}, function (err, response) {
				Logger.system.log("close sending1");
				finWindow.close(true);
			});
		} else {
			Logger.system.log("close sending2");
			finWindow.close(true);
		}
	};
	//This is here so that the method can be accessed publicly.
	this.close = onClose;
	/**
	 * @private
	 * @returns {windowHash}
	 */
	this.getWindowHash = function () {
		return self.windowHash;
	};

	/**
	 * Retrieves the window's title.
	 * @returns {String} title
	 * @example
	 * var windowTitle = FSBL.Clients.WindowClient.getWindowTitle();
	 */
	this.getWindowTitle = function () {
		return this.title;
	};

	/**
	 * This function retrieves the dimensions of the monitor that the window is on. It's currently used in the {@link launcherClient}.
	 * @param {function} callback
	 * @private
	 * @todo  probably don't need this anymore
	 */
	this.retrieveMonitorDimensions = function (callback) {
		LauncherClient.getMonitorInfo({
			monitor: "mine"
		}, function (err, monitorDimensions) {
			let dims = monitorDimensions.unclaimedRect;
			self.options.monitorDimensions = dims;
			if (callback) { callback(err); }
		});
	};

	/**
	 * Sets initial state for the window. This data is modified on subsequent saves.
	 * @param {function} callback
	 * @private
	 */
	this.setinitialWindowBounds = function (callback) {
		self.windowHash = util.camelCase("activeWorkspace", finWindow.name);
		//There's no pushState event in the browser. This is a monkey patched solution that allows us to catch hash changes. onhashchange doesn't fire when a site is loaded with a hash (e.g., salesforce).
		(function (history) {
			var pushState = history.pushState;
			history.pushState = function (state) {
				if (typeof history.onpushstate === "function") {
					history.onpushstate({ state: state });
				}
				pushState.apply(history, arguments);
				self.options.url = window.top.location.toString();
				StorageClient.save({ topic: "finsemble", key: self.windowHash, value: self.options });
				return;
			};
		})(window.history);

		window.addEventListener("hashchange", () => {
			self.options.url = window.top.location.toString();
			StorageClient.save({ topic: "finsemble", key: self.windowHash, value: self.options });
		});

		// @TODO, terry: Is it inherently bad to give developers access to a static windowDescriptor?
		// convenient as it is, windowDescriptors may change on the fly and the developer would never
		// know about it. I think that we should be using the util function getWindowDescriptor when we want options.
		fin.desktop.main(function () {
			finWindow.getOptions(function (options) {
				Logger.system.log("getting options", options);
				self.options = options;
				//self.retrieveMonitorDimensions();
				// @TODO, we don't really need to retrieve monitor dimensions anymore
				self.retrieveMonitorDimensions(function () {
					self.cacheBounds((bounds) => {
						if (self.options &&
							self.options.customData &&
							self.options.customData.foreign &&
							self.options.customData.foreign.components &&
							self.options.customData.foreign.components["Window Manager"] &&
							!self.options.customData.foreign.components["Window Manager"].persistWindowState) {
							return callback();
						}

						self.options.url = window.top.location.toString();
						self.saveWindowBounds(bounds, false);
						callback();
					});
				});
			});
		});
	};

	/**
	 * Returns windowBounds as of the last save.
	 * @returns {object}
	 * @private
	 */
	this.getWindowBounds = function () {
		return {
			top: self.options.defaultTop,
			left: self.options.defaultLeft,
			width: self.options.defaultWidth,
			height: self.options.defaultHeight
		};
	};

	/**
	 *
	 * Saves the window's state. Rarely called manually, as it's called every time your window moves.
	 * @param {Object} bounds optional param.
	 * @example <caption>The code below is the bulk of our listener for the <code>bounds-changed</code> event from the openFin window. Every time the <code>bounds-changed</code> event is fired (when the window is resized or moved), we save the window's state. The first few lines just prevent the window from being dropped behind the toolbar.</caption>
	 *finWindow.addEventListener('disabled-frame-bounds-changed', function (bounds) {
	 * 	if (bounds.top < 45) {
	 *		finWindow.moveTo(bounds.left, 45);
	 *		return;
	 *	}
	 *	self.saveWindowBounds(bounds);
	 *});
	 */
	this.saveWindowBounds = function (bounds, setActiveWorkspaceDirty) {
		Logger.system.log("saving window bounds", bounds, "setActiveWOrkspaceDirty", setActiveWorkspaceDirty);
		if (typeof setActiveWorkspaceDirty === "undefined") {
			setActiveWorkspaceDirty = false;
		}
		Validate.args(bounds, "object") && Validate.args2("bounds.top", bounds.top, "number");
		if (!bounds) {
			return;
		}
		try {
			if (!self.options.customData.foreign.components["Window Manager"].persistWindowState) {
				return;
			}
		} catch (e){
			//prop doesn't exist.
			return;
		}

		// openfin looks at defaultTop, terry looks at top. for some reason, when the app started fresh, the window's position was being overwritten. We also were saving the position on `defaultTop`/`defaultLeft`, and the launcherService wasn't looking for that. We may be able to get rid of the first assignment on the left, but I want terry to fully look at this.
		self.options.defaultTop = self.options.top = Math.round(bounds.top);
		self.options.defaultLeft = self.options.left = Math.round(bounds.left);
		self.options.defaultWidth = self.options.width = Math.round(bounds.width);
		self.options.defaultHeight = self.options.height = Math.round(bounds.height);
		StorageClient.save({ topic: "finsemble", key: self.windowHash, value: self.options });
		if (setActiveWorkspaceDirty) {
			Logger.system.log("SETTING ACTIVE WORKSPACE DIRTY - BOUNDS", params.value);
			self.dirtyTheWorkspace();
		}
	};



	/**
	 * This event is fired when a window is resized or moved.
	 * @private
	 */
	this.listenForBoundsChanged = function () {
		window.addEventListener("beforeunload", () => {
			if (self.options.customData &&
				self.options.customData.foreign &&
				self.options.customData.foreign.services &&
				self.options.customData.foreign.services.launcherService &&
				self.options.customData.foreign.services.launcherService.inject) {
				self.routerClient.transmit("Launcher.windowReloading", {
					uuid: this.options.uuid,
					name: this.options.name,
					url: window.location.toString()
				});
			}
		});
		finWindow.getOptions(function (opts) {
			if (opts.customData.component.type !== "Toolbar") {
				finWindow.addEventListener("disabled-frame-bounds-changed", onWindowBoundsChanged);
			}
		});
	};

	/**
	 * Minmizes window.
	 * @param {function} [cb] Optional callback
	 * @example
	 * FSBL.Clients.WindowClient.minimize();
	 */
	this.minimize = function (cb) {
		this.cacheBounds(function () {
			finWindow.minimize(function () {
				self.windowState = "minimized";
				if (cb) {
					cb(null);
				}
			}, function (err) {
				Logger.system.error(err);
				if (cb) {
					cb(err);
				}
			});
		});
	};

	/**
	 * Restores window from a maximized state.
	 * @param {function} [cb] Optional callback
	 * @example
	 * FSBL.Clients.WindowClient.restore();
	 */
	this.restore = function (cb) {
		finWindow.getState((windowState) => {
			self.windowState = "normal";
			if (windowState === "minimized") {
				finWindow.restore(function () {
					if (cb) {
						cb(null);
					}
				}, function (err) {
					Logger.system.error(err);
					if (cb) {
						cb(err);
					}
				});
			} else {
				self.options.defaultLeft = self.options.cachedLeft;
				self.options.defaultTop = self.options.cachedTop;
				self.options.defaultWidth = self.options.cachedWidth;
				self.options.defaultHeight = self.options.cachedHeight;
				self.routerClient.query("DockingService.restoreFromMaximize", {
					name: finWindow.name
				}, function (err, response) {
					if (cb) {
						cb(err);
					}
				});
			}
		});
	};


	this.cacheBounds = function (cb) {
		this.getBounds((err, bounds) => {
			this.options.cachedLeft = this.options.defaultLeft = bounds.left;
			this.options.cachedTop = this.options.defaultTop = bounds.top;
			this.options.cachedWidth = this.options.defaultWidth = bounds.width;
			this.options.cachedHeight = this.options.defaultHeight = bounds.height;
			if (cb) {
				cb(bounds);
			}
		});
	};

	/**
	 * Maximizes the window. Also takes into account the application toolbar.
	 * @param {function} cb Optional callback
	 * @todo, when fixed components are a thing, make sure that maximize doesn't sit on top of them either.
	 * @example
	 * FSBL.Clients.WindowClient.maximize();
	 */
	this.maximize = function (cb) {
		finWindow.removeEventListener("disabled-frame-bounds-changed", onWindowBoundsChanged);
		var monitorDimensions = this.options.monitorDimensions;
		var self = this;
		util.getMyWindowIdentifier((identifier) => {
			this.cacheBounds(function () {
				self.routerClient.query("DockingService.maximizeWindow",
					{
						name: finWindow.name,
						windowIdentifier: identifier
					}, function (err, response) {
						self.options.defaultLeft = response.data.left;
						self.options.defaultTop = response.data.top;
						self.options.defaultWidth = response.data.width;
						self.options.defaultHeight = response.data.height;

						self.windowState = "maximized";
						if (cb) {
							return cb(err);
						}
					});
			});
		});
	};
	/**
	 * FinWindow destructor (more or less). Removes all of the listeners that we added when the window was created.
	 */
	this.removeFinWindowEventListeners = function () {
		finWindow.removeEventListener("disabled-frame-bounds-changed", onWindowBoundsChanged);
		finWindow.removeEventListener("maximized", onWindowMaximized);
		finWindow.removeEventListener("restored", onWindowRestored);
		finWindow.removeEventListener("blurred", onWindowBlurred);
		finWindow.removeEventListener("focused", onWindowFocused);
		finWindow.removeEventListener("close-requested", onClose);
		finWindow.removeEventListener("minimized", onWindowMinimized);
	};


	/**
	 * This function injects the header bar into all frameless windows that request it. This should only be used if you've decided not to use the provided <code>WindowClient.start()</code> method.
	 *
	 * **NOTE:** If you are using the finsemble windowTitleBar component, you do not need to call this function.
	 * @private
	 */
	this.injectDOM = function () {
		//for the aesthetics.

		if (document.getElementById("fsbl-header-bar")) { return; }
		var template = document.createElement("div");
		template.innerHTML = "<div id='FSBLHeader'></div>";
		document.body.insertBefore(template.firstChild, document.body.firstChild);
		document.body.style.marginTop = "30px";
		this.bumpFixedElements();
	};

	/**
	 * Injects the windowTitleBar into the window.
	 * @param {function} cb Callback function
	 * @return {object} Reference to a RouterClient.query
	 * @private
	 */
	this.injectFSBL = function (cb) {
		//This flag is set by the launcher service. It tells us if FSBL was injected
		return self.routerClient.query("Launcher.getWindowTitleBar", self.options, function (err, response) {//Should probably switch this to a launcher client calls
			if (cb) {
				cb(err, response);
			}
		});
	};

	/**
	 * Given a field, this function retrieves app state. If no params are given you get the full state
	 * @param {object} params
	 * @param {string} params.field field
	 *  @param {array} params.fields fields
	 * @param {function} cb Callback
	 * @example <caption>The example below shows how we retrieve data to restore the layout in our charts.</caption>
	 * FSBL.Clients.WindowClient.getComponentState({
	 *	 field: 'myChartLayout',
	 *}, function (err, state) {
	 *	if (state === null) {
	 *		return;
	 *	}
	 *	importLayout(state);
	 *});
	 * FSBL.Clients.WindowClient.getComponentState({
	 *	 fields: ['myChartLayout', 'chartType'],
	 *}, function (err, state) {
	 *	if (state === null) {
	 *		return;
	 *	}
	 * 	var chartType = state['chartType'];
	 *  var myChartLayout = state['myChartLayout'];
	 *});
	 **/
	this.getComponentState = function (params, cb) {

		if (!params) { params = {}; }
		if (params.fields && !Array.isArray(params.fields)) { params.fields = [params.fields]; }
		Validate.args(params, "object", cb, "function");
		if (!finWindow) { finWindow = fin.desktop.Window.getCurrent(); }
		params.windowName = finWindow.name;

		var hash = self.getContainerHash(params.windowName);

		StorageClient.get({ topic: "finsemble", key: hash }, function (err, response) {
			var data = response;
			if (response && params.field) {
				self.componentState = data || {};
				cb(err, data[params.field]);
			} else if (params.fields) {
				var respObject = {};
				for (var i = 0; i < params.fields.length; i++) {
					if (data[params.fields[i]]) {
						respObject[params.fields[i]] = data[params.fields[i]];
					}
				}
				return cb(null, respObject);

			} else if (response) {
				return cb(null, data);
			} else {
				Logger.system.log("getComponentState error, response, params", err, response, params);
				cb("Not found", response);
			}
		});
	};

	/**
	 * Checks to see if this save makes the workspace 'dirty'. We use this when deciding whether to prompt the user to save their workspace.
	 * @param {object} params
	 * @param {string} params.field field
	 * @param {string} params.windowName windowName
	 * @param {function} cb Callback
	 * @private
	 */
	this.compareSavedState = function (params) {
		if (!WorkspaceClient || WorkspaceClient.activeWorkspace.isDirty) { return; }
		var hash = util.camelCase(WorkspaceClient.activeWorkspace.name, finWindow.name, params.windowName);
		StorageClient.get({ topic: "finsemble", key: hash }, function (err, response) {
			response = response;
			Logger.system.log("comparing saved state response:", response, "params:", params);

			/**
			 * We clone the value below because:
			 *
			 * let's say that the user passes this in:
			 * {value: undefined,
			 * anotherValue: true}.
			 *
			 * When that is persisted to localStorage, it'll come back as {anotherValue: true}. Those two values are different. So we stringify the value coming in to compare it to what was saved.
			 */
			let cleanValue = JSON.parse(JSON.stringify(params.value));
			if (!response || !deepEqual(response[params.field], cleanValue)) {
				self.dirtyTheWorkspace();
			}
		});
	};

	/**
	 * Given a field, this function sets and persists app state.
	 * @param {object} params
	 * @param {string} [params.field] field
	 * @param {array} [params.fields] fields
	 * @param {function=} cb Callback
	 * @example <caption>The example below shows how we save our chart layout when it changes.</caption>
	 * var s = stx.exportLayout(true);
	 * //saving layout'
	 * FSBL.Clients.WindowClient.setComponentState({ field: 'myChartLayout', value: s });
	 * FSBL.Clients.WindowClient.setComponentState({ fields: [{field:'myChartLayout', value: s }, {field:'chartType', value: 'mountain'}]);
	 **/
	this.setComponentState = function (params, cb) {
		Validate.args(params, "object", cb, "function=") && Validate.args2("params.field", params.field, "string");
		params.windowName = finWindow.name;
		var hash = self.getContainerHash(params.windowName);
		let fields = params.fields;

		if (params.field) {
			fields = [{
				field: params.field,
				value: params.value
			}];
		}
		for (let i = 0; i < fields.length; i++) {
			let field = fields[i];
			if (!field.field || !field.value) { continue; }
			self.componentState[field.field] = field.value;
		}
		self.compareSavedState(params);
		Logger.system.log("SAVING STATE", self.componentState);
		StorageClient.save({ topic: "finsemble", key: hash, value: self.componentState }, function (err, response) {
			if (cb) { cb(err, response); }
		});
	};
	/**
	 * Gets containerHash given a containerId.
	 * @param {string} windowName The name of the window
	 * @returns {string} Hash for the window
	 * @private
	 */
	this.getContainerHash = function (windowName) {
		return util.camelCase(self.windowHash, windowName);
	};
	this.formGroup = function () {
		self.routerClient.transmit("DockingService.formGroup", {
			windowName: self.finWindow.name
		});
		this.dirtyTheWorkspace();
	};
	this.dirtyTheWorkspace = function () {
		if (this.options.customData.window.addToWorkspace && WorkspaceClient && !WorkspaceClient.activeWorkspace.isDirty) {
			this.routerClient.transmit("WorkspaceService.setActiveWorkspaceDirty", null, null);
		}
	};
	/**
	 * This function is critical if you want docking and snapping to work. It transmits a message to the LauncherService, which registers it as a dockable window.
	 *
	 * **NOTE:** If you are using the finsemble windowTitleBar component, you do not need to call this function.
	 * @param {object} params Parameters
	 * @example
	 * FSBL.Clients.WindowClient.registerWithDockingManager();
	 * @private
	 */
	this.registerWithDockingManager = function (params, cb) {
		var windowName = self.finWindow.name;
		var uuid = self.finWindow.uuid;
		self.routerClient.query("register-docking-window", {
			name: windowName,
			uuid: uuid,
			options: params || {},
			type: "openfin"
		}, function () {
			Logger.system.log("Docking Registration complete.");
			if (cb) {
				cb();
			}
		});
		self.routerClient.addListener("DockingService." + windowName, function (err, response) {
			if (response.data.command === "saveWindowLocation") {
				self.saveWindowBounds(response.data.bounds, true);
			} else if (response.data.command === "updateWindowLocation") {
				self.options.defaultLeft = response.data.bounds.left;
				self.options.defaultTop = response.data.bounds.top;
				self.options.defaultWidth = response.data.bounds.width;
				self.options.defaultHeight = response.data.bounds.height;
			}
		});
	};

	/**
	 * This function is critical if you don't want to keep references of windows in the LauncherService after they close. It simply notifies the LauncherService that the window is no longer dockable. It's invoked when the window is closed.
	 * **NOTE:** If you are using the finsemble windowTitleBar component, you do not need to call this function.
	 * @param {boolean} removeFromWorkspace true to remove from workspace
	 * @example
	 * FSBL.Clients.WindowClient.deregisterWithDockingManager();
	 * @private
	 */
	this.deregisterWithDockingManager = function (removeFromWorkspace) {
		var windowName = finWindow.name;
		this.routerClient.transmit("deregister-docking-window", {
			name: windowName,
			userInitiated: removeFromWorkspace
		});
	};

	/**
	 * @private
	 */
	this.enableHotkeys = function () {
		this.enableDevToolsHotkey();
		this.enableReloadHotkey();
	};

	/**
	 * Helper function to display devtools if you disable context-menus on your chromium windows. You must call this function if you want the hotkey to work.
	 * @private
	 */
	this.enableReloadHotkey = function () {
		window.addEventListener("keydown", function (e) {
			if (e.keyCode === 82 && e.altKey && e.ctrlKey) {
				fin.desktop.System.clearCache({
					cache: true,
					cookies: false,
					localStorage: false,
					appcache: true,
					userData: false
				});
				window.location.reload();
			}
		});
	};

	/**
	 * Helper function to display devtools if you disable context-menus on your chromium windows. You must call this function if you want the hotkey to work.
	 * @private
	 */
	this.enableDevToolsHotkey = function () {
		window.addEventListener("keydown", function (e) {
			if (e.keyCode === 68 && e.altKey && e.ctrlKey) {
				var application = fin.desktop.Application.getCurrent();
				application.getManifest(function (manifest) {
					var uuid = manifest.startup_app.uuid;
					var windowName = finWindow.name;
					fin.desktop.System.showDeveloperTools(uuid, windowName);
				}, function (err) {
					Logger.system.error(err);
				});
			}
		});
	};

	/*
	 * Bumps top-level containers down below the windowTitleBar.
	 * @private
	 */
	this.bumpFixedElements = function () {
		var elems = document.body.getElementsByTagName("*");
		var len = elems.length;

		for (var i = 0; i < len; i++) {
			if (elems[i].id === "fsbl-header-bar") { continue; }
			var style = window.getComputedStyle(elems[i], null),
				possibleZeros = ["0", "0px", 0],
				badPositions = ["fixed", "absolute"];

			//only target top-level fixed/absolutely positioned containers.
			if (elems[i].parentNode === document.body
				&& badPositions.includes(style.getPropertyValue("position"))
				&& possibleZeros.includes(style.getPropertyValue("top"))
			) {
				elems[i].style.top = "32px";
			}
		}
	};

	/*
	 * Forces window to sit on top of over windows.
	 * @example
	 * FSBL.Clients.WindowClient.bringWindowToFront();
	 */
	this.bringWindowToFront = function () {
		finWindow.isShowing(function (isShowing) {
			if (isShowing) {
				finWindow.bringToFront(
					function () {
						Logger.system.debug("bringToFront successfull");
					}, function (err) {
					Logger.system.error("bringToFront failed: " + err);
				});
			}
		});
	};

	/**
	 * This function is invoked inside of {@link WindowClient#start|WindowClient.start()}. It adds listeners for 'close' (when the workspace is switched), 'bringToFront', 'restore', and 'move' (used in AutoArrange).
	 *
	 * **NOTE:** If you are using the finsemble windowTitleBar component, you do not need to call this function.
	 * @example
	 * FSBL.Clients.WorkspaceClient.addWorkspaceListeners();
	 * @private
	 */
	this.addWorkspaceListeners = function () {
		self.routerClient.addListener("WorkspaceService." + finWindow.name, function (err, response) {
			switch (response.data.command) {
			case "close":
				onClose(false);
				break;
			case "bringToFront":
				self.bringWindowToFront();
				break;
			case "restore":
				self.restore();
				break;
			case "move":
				finWindow.animate(
					{
						position: {
							left: response.data.left,
							top: response.data.top,
							duration: 250
						},
						size: {
							width: response.data.width,
							height: response.data.height,
							duration: 250
						}
					},
						{},
						function () {
							self.routerClient.transmit("DockingService.updateWindowPositions", {});
							Logger.system.debug("successfully moved.");
							self.getBounds((err, bounds) => {
								self.saveWindowBounds(bounds, true);
							});
						}, function (err) {
							Logger.system.error("Animate failed: " + err);
						});
				break;
			}
		});
	};

	this.injectStylesheetOverride = function () {
		var node = document.createElement("style");
		node.type = "text/css";
		node.appendChild(document.createTextNode(self.options.customData.cssOverride));
		document.body.appendChild(node);
	};
	/**
	 * If we spawned this openfin app from our parent application, we listen on that application for certain events that might fire _if_ our parent goes down. If the parent goes down, we want to kill its children as well.
	 * @private
	 */
	this.checkIfChildApp = function () {
		if (self.options &&
			self.options.customData &&
			self.options.customData.parentUUID &&
			self.options.customData.parentUUID !== fin.desktop.Application.getCurrent().uuid) {
			let parent = fin.desktop.Application.wrap(self.options.customData.parentUUID);
			parent.addEventListener("closed", onClose.bind(null, false));
			parent.addEventListener("crashed", onClose.bind(null, false));
			parent.addEventListener("initialized", onClose.bind(null, false));
			parent.addEventListener("out-of-memory", onClose.bind(null, false));
		}
	};
	this.addListeners = function () {
		var self = this;
		finWindow.addEventListener("close-requested", onClose);
		finWindow.addEventListener("maximized", onWindowMaximized);
		finWindow.addEventListener("minimized", onWindowMinimized);
		finWindow.addEventListener("restored", onWindowRestored);
		// On Blur remove the border from window
		finWindow.addEventListener("blurred", onWindowBlurred);
		// On focus add a border to the window
		finWindow.addEventListener("focused", onWindowFocused);
		if (FSBL) {
			FSBL.onShutdown(function () {
				return new Promise(function (resolve, reject) {
					self.getBounds((err, bounds) => {
						self.saveWindowBounds(bounds, false);
						resolve();
					});
				});
			});
		}
	};
	/**
	 * Kicks off all of the necessary methods for the app. It
	 * 1. Injects the header bar into the window.
	 * 2. Sets up listeners to handle close and move requests from the appplication.
	 * 3. Adds a listener that saves the window's state every time it's moved or resized.
	 * @param {object} callback
	 * See the [windowTitleBar tutorial]{@tutorial windowTitleBarComponent} for more information.
	 * @private
	 */
	this.start = function (callback) {
		Validate.args(callback, "function");
		finWindow = fin.desktop.Window.getCurrent();
		this.addListeners();

		//where we store componentState for the window.
		self.componentState = {};
		self.setinitialWindowBounds(function () {
			//if wrap.close is called, onClose will be called.
			var customData = self.options.customData;
			var isCompoundWindow = false;
			if (customData) {
				isCompoundWindow = customData.window.compound;

				if (customData.cssOverride) {
					Logger.system.log("window has cssOverride");
					self.injectStylesheetOverride();
				}
				if (!isCompoundWindow && customData.foreign.components["Window Manager"].FSBLHeader) {
					self.hasHeader = true;
					self.injectDOM();
					//Waiting on OF to fix a bug on monitors with scaling that isn't a multiple of 100. By Default Windows 10 sets scaling to 125%.
					self.registerWithDockingManager();
				}
				self.injectFSBL();
			}

			if (!isCompoundWindow) {
				self.addWorkspaceListeners();
				self.listenForBoundsChanged();
			}
			if (callback) {
				callback();
			}
		});
	};


	/**
	 * Sends a command to the header. Commands affect the header state,
	 * so that the UI reflects what is going on in the component window.
	 * @param {string} command The state object to set
	 * @param {object} state The new state (merged with existing)
	 */
	this.updateHeaderState = function (command, state) {
		if (!this.commandChannel) {
			return;
		}
		this.commandChannel(command, state);
	};

	/**
	 * Establishes a command channel with a header. The WindowClient can
	 * update header state via this channel.
	 * @param {function} commandChannel A function callback that receives commands
	 */
	this.headerCommandChannel = function (commandChannel) {
		this.commandChannel = commandChannel;
	};

	/**
	 * Ejects the window from the docking group
	 */
	this.ejectFromGroup = function () {
		var windowName = this.getCurrentWindow().name;
		FSBL.Clients.RouterClient.query("DockingService.leaveGroup", {
			name: windowName
		});
		this.dirtyTheWorkspace();
	};

	/**
	 * This function does two things:
	 *
	 * 1. It sets the window's title in the windowTitleBar component, and
	 * 2. It sets the title in the DOM.
	 *
	 * This is useful if you like to keep the window's title in sync with a piece of data (e.g., a Symbol);
	 * @param {String} title Window title.
	 * @todo Allow HTML or classes to be injected into the title.
	 * @example <caption>The code shows how you would change your window title.</caption>
	 *  FSBL.Clients.WindowClient.setWindowTitle("My Component's New Title");
	 */
	this.setWindowTitle = function (title) {
		Validate.args(title, "string");
		this.title = title;
		//document.title = title;  // casuses flickering in chromium 53
		self.updateHeaderState("Main", { windowTitle: title });
	};
	/**
	 * Retrieves data that was set with {@link LauncherClient#spawn}.
	 * @return {object} The data or empty object if no data was set. *Note, this will never return null or undefined.*
	 */
	this.getSpawnData = function () {
		if (!this.options.customData) { return {}; }
		var spawnData = this.options.customData.spawnData;
		if (typeof spawnData === "undefined") { return {}; }
		return spawnData;
	};

	/**
	 * Returns a reference to the current window for the *component*. For most
	 * components this will just return the finWindow, but for a compound component
	 * it will return a CompoundWindow.
	 * @returns {finWindow}
	 */
	this.getCurrentWindow = function () {
		return fin.desktop.Window.getCurrent();
	};

	/**
	 * Highlights the window as active by creating a border around the window.
	 *
	 * @param {boolean} active  Set to false to turn off activity
	 */
	this.setActive = function (active) {
		if (active) {
			addClass(document.documentElement, "desktop-active");
		} else {
			removeClass(document.documentElement, "desktop-active");
		}
	};
	this.getBounds = function (cb) {
		fin.desktop.Window.getCurrent().getBounds(function (bounds) {
			cb(null, bounds);
		});
	};

	/**
	 * Automatically resizes the height of the window to fit the full DOM.
	 * @param {object} 	params
	 * @param {object} params.padding
	 * @param {number} params.padding.height
	 * @param {number} params.padding.width
	 * @param {function} [cb] Optional callback when complete
	 */
	this.fitToDOM = function (params, cb) {
		var children = document.body.children;
		var newHeight = 0;
		var newWidth = this.options.width;
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			newHeight += child.offsetHeight;
		}
		if (typeof (params) === "function") {
			cb = params;
			params = null;
		}
		if (params && params.padding) {
			if (params.padding.height) {
				newHeight += params.padding.height;
			}
			if (params.padding.width) {
				newWidth += params.padding.width;
			}
		}
		Logger.system.log("newHeight", newHeight);
		if (params && params.maxHeight && newHeight > params.maxHeight) {
			newHeight = params.maxHeight;
		}


		this.retrieveMonitorDimensions(function (err) {
			//Logger.system.log("updates111 in here");
			let monitorDimensions = self.options.monitorDimensions;
			let fixBounds = true;
			if (newHeight >= monitorDimensions.height) {
				newHeight = monitorDimensions.height;
				fixBounds = true;
			}
			if (newWidth >= monitorDimensions.width) {
				newWidth = monitorDimensions.width;
				fixBounds = true;
			}

			if (fixBounds) {
				//Logger.system.log("updates111 fixed", newHeight);
				//bounds.x and bounds.y are null on mac. Not sure if they're set on windows, but this manifested itself with an error on macs that didn't resize.
				finWindow.resizeTo(
					newWidth,
					newHeight,
					"top-left",
					function () {

						finWindow.getBounds(function (bounds) {

							if (cb) {
								cb();
							}
						});
					}, function (err) {
						Logger.system.error("Error in finWindow.setBounds", err);
					});
			} else if (cb) {
				cb();
			}
		});
	};

	return self;
}

var windowClient = new WindowClient({
	onReady: function (cb) {
		Logger.system.log("windowClient onReady");
		windowClient.start(cb);
	},
	name: "windowClient"
});

windowClient.requiredClients = ["launcherClient"];
windowClient.requiredServices = ["storageService"];

//windowClient.initialize();

module.exports = windowClient;