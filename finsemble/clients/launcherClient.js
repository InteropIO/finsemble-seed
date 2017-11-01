/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var BaseClient = require("./baseClient");
var util = require("../common/util");
var Validate = require("../common/validate"); // Finsemble args validator
var WorkspaceClient = require("./workspaceClient");

var Logger = require("./logger");

Logger.perf.log("LauncherClientReadyTime","start", "time it takes for the launcher client to become ready");

/**
 * An object that includes all the potential identifications for a window.
 * For instance, one can try and obtain a reference for a window if some of these values are known.
 *
 * @typedef LauncherClient~windowIdentifier
 * @property {string} [windowName] The name of the physical OpenFin window, or a reference to a native window that was launched with Assimilation service
 * @property {string} [uuid] Optional uuid of a particular OpenFin application process
 * @property {string} [componentType] The type of component
 * @property {number} [monitor] The number of the monitor. Potentially used to disambiguate multiple components with the same name (for searches only)
 */

/**
 * Finsemble windowDescriptor.
 * This is a superset of the [Openfin windowOptions object](http://cdn.openfin.co/jsdocs/stable/tutorial-windowOptions.html).
 * In addition to the values provided by OpenFin, the windowDescriptor includes the following values.
 *
 * @typedef LauncherClient~windowDescriptor
 * @type {object}
 * @property {string} [url] url to load (if HTML5 component).
 * @property {string} [native] The name of the native app (if a native component launched by Assimilation service).
 * @property {string} name The name of the window (sometimes randomly assigned).
 * @property {string} componentType The type of component (from components.json).
 */

/**
 *
 * A convenient assembly of native JavaScript window, OpenFin window and windowDescriptor.
 *
 * @typedef LauncherClient~rawWindowResult
 * @type {object}
 * @property {LauncherClient~windowDescriptor} windowDescriptor The window descriptor.
 * @property {Fin.Desktop.Window} finWindow The OpenFin window.
 * @property {Window} browserWindow The native JavaScript window.
 *
 */

/**
 *
 * @introduction
 * <h2>Launcher Client</h2>
 * The Launcher client handles spawning windows. It also maintains the list of spawnable components.
 *
 * The following topics can be subscribed to:
 *
 * **"monitorInfo"** - publishes a monitorInfo array such as is returned from
 * {@link LauncherClient#getMonitorInfoAll}. This includes "unclaimedRect" entries for
 * each monitor. An event will be published whenever monitor configuration changes.
 * This includes when a new component is added that makes a claim on monitor space (i.e. a toolbar)
 *
 * @hideConstructor true
 * @constructor
 */
function LauncherClient(params) {
	Validate.args(params, "object=") && params && Validate.args2("params.onReady", params.onReady, "function=");

	/** @alias LauncherClient# */
	var self = this;
	BaseClient.call(this, params);

	/**
	 * Get a list of registered components (those that were entered into components.json).
	 *
	 * @param {Function} cb Callback returns an object map of components. Each component object
	 * contains the default config for that component.
	 */
	this.getComponentList = function (cb) {
		Validate.args(cb, "function");
		this.routerClient.query("Launcher.componentList", {}, function (err, response) {
			if (cb) {
				cb(err, response.data);
			}
		});
	};

	/**
	 * Get the component config (i.e. from components.json) for a specific component.
	 *
	 * @param {String} componentType The type of the component.
	 * @param {Function} cb Callback returns the default config (windowDescriptor) for the requested componentType.
	 *
	 */
	this.getComponentDefaultConfig = function (componentType, cb) {
		Validate.args(cb, "function");
		this.routerClient.query("Launcher.componentList", {}, function (err, response) {
			if (cb) {
				cb(err, response.data[componentType]);
			}
		});
	};

	/**
	 * Gets monitorInfo (dimensions and position) for a given windowIdentifier or for a specific monitor.
	 * If neither the identifier or monitor are provided then the monitorInfo for the current window is returned.
	 *
	 *
	 * The information returned contains a supplemented OpenFin monitor descriptor which contains:
	 *
	 * **monitorRect** - The full dimensions for the monitor from OpenFin.
	 *
	 * **availableRect** - The dimensions for the available space on the monitor (less windows toolbars).
	 *
	 * **unclaimedRect** - The dimensions for available monitor space less any space claimed by components (such as the application Toolbar).
	 *
	 * Each of these is supplemented with the following additional members:
	 *
	 * **width** - The width as calculated (right - left).
	 *
	 * **height** - The height as calculated (bottom - top).
	 *
	 * **position** - The position of the monitor, numerically from zero to X. Primary monitor is zero.
	 *
	 * **whichMonitor** - Contains the string "primary" if it is the primary monitor.
	 *
	 * @param  {object} [params]               Parameters
	 * @param  {LauncherClient~windowIdentifier} [params.windowIdentifier] The windowIdentifier to get the monitorInfo. If undefined, then the current window.
	 * @param  {any} [params.monitor] If passed then a specific monitor is identified. Valid values are the same as for {@link LauncherClient#spawn}.
	 * @param  {Function} cb               Returns a monitorInfo object containing the monitorRect, availableRect and unclaimedRect.
	 */
	this.getMonitorInfo = function (params, cb) {
		util.getMyWindowIdentifier(function (myWindowIdentifier) {
			if (!params.windowIdentifier) {
				params.windowIdentifier = myWindowIdentifier;
			}
			self.routerClient.query("Launcher.getMonitorInfo", params, function (err, response) {
				if (cb) {
					cb(err, response.data);
				}
			});
		});
	};

	/**
	 * Gets monitorInfo (dimensions and position) for all monitors.
	 * Returns an array of monitorInfo objects.
	 * See {@link LauncherClient#getMonitorInfo} for the format of a monitorInfo object.
	 *
	 * @param  {Function} cb               Returns an array of monitorInfo objects.
	 */
	this.getMonitorInfoAll = function (cb) {
		this.routerClient.query("Launcher.getMonitorInfoAll", {}, function (err, response) {
			if (cb) {
				cb(err, response.data);
			}
		});
	};

	/**
	 * Displays a window and relocates/resizes it according to the values contained in params.
	 *
	 * @param  {LauncherClient~windowIdentifier}   windowIdentifier A windowIdentifier.
	 * @param  {object}   params           Parameters. These are the same as {@link RouterClient#spawn} with the folowing exceptions:
	 * @param {any} [params.monitor] Same as spawn() except that null or undefined means the window should not be moved to a different monitor.
	 * @param {any} [params.left] Same as spawn() except that null or undefined means the window should not be moved from current horizontal location.
	 * @param {any} [params.top] Same as spawn() except that null or undefined means the window should not be moved from current vertical location.
	 * @param {boolean} [params.spawnIfNotFound=false] If true, then spawns a new window if the requested one cannot be found.
	 * *Note, only works if the windowIdentifier contains a componentType.*
	 * @param {boolean} [params.slave] Cannot be set for an existing window. Will only go into effect if the window is spawned.
	 * (In other words, only use this in conjunction with spawnIfNotFound).
	 * @param {Function} cb Callback to be invoked after function is completed. Callback contains an object with the following information:
	 * **windowIdentifier** - The {@link LauncherClient~windowIdentifier} for the new window.
	 * **windowDescriptor** - The {@link LauncherClient~windowDescriptor} of the new window.
	 * **finWindow** - An OpenFin window referencing the new window.
	 */
	this.showWindow = function (windowIdentifier, params, cb) {
		Validate.args(windowIdentifier, "object", params, "object=", cb, "function=");
		if (!params) { params = {}; }
		params = util.clone(params);
		if (!params.staggerPixels && params.staggerPixels !== 0) {
			params.staggerPixels = 100;
		}
		params.windowIdentifier = windowIdentifier;

		util.getMyWindowIdentifier(function (myWindowIdentifier) {
			if (!params.relativeWindow) {
				params.relativeWindow = myWindowIdentifier;
			}
			self.routerClient.query("Launcher.showWindow", params, function (err, response) {
				if (err) {
					return cb ? cb(err) : null;

				}
				var newWindowIdentifier = response.data.windowIdentifier;
				response.data.finWindow = fin.desktop.Window.wrap(newWindowIdentifier.uuid, newWindowIdentifier.windowName);
				cb ? cb(err, response.data) : null;

			});
		});
	};

	/**
	 * Asks the Launcher service to spawn a new component. Any parameter below can also be specified in config/components.json, which will
	 * then operate as the default for that value.
	 *
	 * The launcher parameters mimic CSS window positioning.
	 * For instance, to set a full size window use `left=0`,`top=0`,`right=0`,`bottom=0`.
	 * This is functionally equivalent to: left=0,top=0,width="100%",height="100%"
	 *
	 * @param {String} component - Type of the component to launch. If null or undefined, then params.url will be used instead.
	 *
	 * @param {object} params
	 * @param {any} [params.monitor="mine"] Which monitor to place the new window.
	 * **"mine"** - Place the window on the same monitor as the calling window.
	 * A numeric value of monitor (where primary is zero).
	 * **"primary"**,**"next"** and **"previous"** indicate a specific monitor.
	 * **"all"** - Put a copy of the component on all monitors
	 *
	 * @param {string} [params.position=unclaimed] Defines a "viewport" for the spawn, with one of the following values:
	 *
	 * **"unclaimed"** (the default) Positioned based on the monitor space excluding space "claimed" by other components (such as toolbars).
	 * For instance, `top:0` will place the new component directly below the toolbar.
	 *
	 * **"available"** Positioned according to the coordinates available on the monitor itself, less space claimed by the operating system (such as the windows toolbar).
	 * For instance, `bottom:0` will place the new component with its bottom flush against the windows toolbar.
	 *
	 * **"monitor"** Positioned according to the absolute size of the monitor.
	 * For instance, `top:0` will place the component overlapping the toolbar.
	 *
	 * **"relative"** Positioned relative to the relativeWindow.
	 * For instance, `left:0;top:0` will joing the top left corner of the new component with the top left corner of the relative window.
	 *
	 * **"virtual"** Positoned against coordinates on the virtual screen.
	 * The virtual screen is the full viewing area of all monitors combined into a single theoretical monitor.
	 * @param {boolean} [params.groupOnSpawn=false] If true, will group with a window. **Only valid if `params.position`=== `'relative'`.
	 * @param {any} [params.left] A pixel value representing the distance from the left edge of the viewport as defined by "position".
	 * A percentage value may also be used, representing the percentage distance from the left edge of the viewport relative to the viewport's width.
	 *
	 * **"adjacent"** will snap to the right edge of the spawning or relative window.
	 *
	 * **"center"** will center the window
	 *
	 * If neither left nor right are provided, then the default will be to stagger the window based on the last spawned window.
	 * *Note - the staggering algorithm has a timing element that is optimized based on user testing.*
	 *
	 * @param {any} [params.top] Same as left except related to the top of the viewport.
	 * @param {any} [params.right] Same as left except releated to the right of the viewport.
	 * @param {any} [params.bottom] Same as left except related to the bottom of the viewport.
	 *
	 * @param {any} [params.height] A pixel or percentage value.
	 * @param {any} [params.width] A pixel value or percentage value.
	 * @param {boolean} [params.forceOntoMonitor] If true will attempt to make the window no have parts outside the monitor boundary.
	 *
	 * @param {boolean} [params.ephemeral=false] Indicates that this window is ephemeral.
	 * An ephemeral window is a dialog, menu or other window that is temporarily displayed but usually hidden.
	 * Ephemeral windows automatically have the following OpenFin settings assigned: resizable: false, showTaskbarIcon: false, alwaysOnTop: true.
	 * *Note, use `options:{autoShow: false}` to prevent an ephemeral widow from showing automatically.*
	 *
	 * @param {number} [params.staggerPixels=100] Number of pixels to stagger (default when neither left, right, top or bottom are set).

	 * @param {boolean} [params.claimMonitorSpace] For use with permanent toolbars.
	 * The available space for other components will be reduced by the amount of space covered by the newly spawned component.
	 * This will be reflected in the `unclaimedRect` member from API calls that return monitorInfo. Users will be prevented
	 * from moving windows to a position that covers the claimed space. See `position: 'unclaimed'`.

	 * @param {LauncherClient~windowIdentifier} [params.relativeWindow=current window] The window to use when calculating any relative launches.
	 * If not set then the window from which spawn() was called.

	 * @param {boolean} [params.slave] If true then the new window will act as a slave to the relativeWindow (or the launching window if relativeWindow is not specified).
	 * Slave windows will automatically close when their parent windows close.

	 * @param {string} [params.url] Optional url to launch. Overrides what is passed in "component".

	 * @param {string} [params.native] Optional native application to launch with Assimilation service. Overrides what is passed in "component".

	 * @param {string} [params.name] Optional window name. If not provided, then a random name will be assigned to the newly created OpenFin window.

	 * @param {any} [params.data] Optional data to pass to the opening window.
	 * If set, then the spawned window can use {@link WindowClient#getSpawnData} to retrieve the data.

	 * @param {LauncherClient~windowDescriptor} [params.options] Properties to merge with the default windowDescriptor.
	 * Any value set here will be sent directly to the OpenFin window, and will override the effect of relevant parameters to spawn().
	 * See {@link http://cdn.openfin.co/jsdocs/stable/fin.desktop.Window.html#~options} for the full set and defaults, with the following exception:
	 * @param {boolean} [params.options.frame=false] By default, all Finsemble windows are frameless

	 * @param {boolean} [params.addToWorkspace=false] Whether to add the new component to the workspace.
	 * Even when true, the window will still not be added to the workspace if addToWorkspace==false in components.json config for the component type.

	 * @param {Function=} cb Callback to be invoked after function is completed. Callback contains an object with the following information:
	 * windowIdentifier - The {@LauncherClient~windowIdentifier} for the new component.
	 * windowDescriptor - The {@LauncherClient~windowDescriptor} for the new window.
	 * finWindow - An OpenFin window object that contains the spawned component.
	 *
	 */
	this.spawn = function (component, params, cb) {

		Validate.args(component, "string", params, "object=", cb, "function=");
		if (!params) { params = {}; }
		params = util.clone(params);
		params.component = component;
		if (!params.options) {
			params.options = {};
		}
		if (!params.options.customData) {
			params.options.customData = {};
		}
		if (!params.staggerPixels && params.staggerPixels !== 0) {
			params.staggerPixels = 50;
		}

		util.getMyWindowIdentifier(function (windowIdentifier) {
			params.launchingWindow = windowIdentifier;
			callSpawn(params, cb);
		});
	};


	/**
	 * Returns an object that provides raw access to a remote window.
	 * It returns an object that contains references to the Finsemble windowDescriptor, to
	 * the OpenFin window, and to the native JavaScript (browser) window.
	 *
	 * *This will only work for windows that are launched using the Finsemble Launcher API.*
	 *
	 * As in any browser, you will not be able to manipulate a window that has been launched
	 * cross domain or in a separate physical OpenFin application (separate process). Caution
	 * should be taken to prevent a window from being closed by the user if you plan on
	 * referencing it directly. Due to these inherent limitations we strongly advise against a
	 * paradigm of directly manipulating remote windows through JavaScript. Instead leverage the
	 * RouterClient to communicate between windows and to use an event based paradigm!
	 *
	 * @param  {object} params Parameters
	 * @param {string} params.windowName The name of the window to access.
	 * @return {LauncherClient~rawWindowResult} An object containing windowDescriptor, finWindow, and browserWindow. Or null if window isn't found.
	 */
	this.getRawWindow = function (params) {
		var launcher = window.opener;
		if (launcher.name !== "launcherService") {
			Logger.system.warn("LauncherClient.getNativeWindow: window not opened by Launcher Service");
		}
		return launcher.activeWindows[params.windowName];
	};

	/**
	 * @private
	 */
	function callSpawn(params, cb) {
		Logger.perf.log("CallSpawn","start", "from spawn to callback");
		Logger.system.debug("callSpawn router=", this.routerClient, BaseClient);
		self.routerClient.query("Launcher.spawn", params, function (err, response) {
			var result = response.data;
			if (err) {
				invokeSpawnCallback(err, result);
				return Logger.system.error(err);
			}

			// Add a wrapped finWindow to the response (this can only be done client side)
			var newWindowIdentifier = result.windowIdentifier;
			result.finWindow = fin.desktop.Window.wrap(newWindowIdentifier.uuid, newWindowIdentifier.windowName);

			let componentOnlineChannel = result.windowIdentifier.windowName + ".componentReady";
			self.routerClient.addListener(componentOnlineChannel, componentOnlineCallback);

			function componentOnlineCallback(err, response) {
				if (params.position === "relative" && params.groupOnSpawn) {
					let windows = [result.windowIdentifier.windowName, fin.desktop.Window.getCurrent().name];
					self.routerClient.query("DockingService.groupWindows", {
						windows: windows
					}, function (error, response) {
						Logger.perf.log("CallSpawn","stop");
						invokeSpawnCallback(err, result);
					});
				} else {
					Logger.perf.log("CallSpawn","stop");
					invokeSpawnCallback(err, result);
				}
				self.routerClient.removeListener(componentOnlineChannel, componentOnlineCallback);
			}

		});
		function invokeSpawnCallback(error, data) {
			if (cb) {
				cb(error, data);
			}
		}
	}

	/**
	 * Convenience function to get a monitor descriptor for a given windowIdentifier, or for the
	 * current window.
	 *
	 * @param {LauncherClient~windowIdentifier} [windowIdentifier] The window to find the monitor for. Current window if undefined.
	 * @param  {Function} cb Returns a monitor descriptor (optional or use returned Promise)
	 * @returns {Promise} A promise that resolves to a monitor descriptor
	 * @private
	 * @TODO this probably is unnecessary since a client can include util and a developer should be using this.getMonitorInfo which has full support for searching by component. Did Ryan need this?
	 */
	this.getMonitor = function (windowIdentifier, cb) {
		return util.getMonitor(windowIdentifier, cb);
	};

	/**
	 * Returns a {@link LauncherClient~windowIdentifier} for the current window
	 *
	 * @param {LauncherClient~windowIdentifier} cb Callback function returns windowIdentifier for this window (optional or use the returned Promise)
	 * @returns {Promise} A promise that resolves to a windowIdentifier
	 */
	this.getMyWindowIdentifier = function (cb) {
		return util.getMyWindowIdentifier(cb);
	};

	/**
	* Gets the {@link LauncherClient~windowDescriptor} for all open windows.
	*
	* *Note: This returns descriptors even if the window is not part of the workspace*.
	*
	* @param {function} cb Callback returns an array of windowDescriptors
	*
	*/
	this.getActiveDescriptors = function (cb) {
		Validate.args(cb, "function");
		this.routerClient.query("Launcher.getActiveDescriptors", {}, function (err, response) {
			if (err) {
				return Logger.system.error(err);
			}
			if (cb && response) {
				cb(err, response.data);
			}
		});
	};

	/**
	 * Adds a custom component. Private for now.
	 * @private
	 */
	this.addUserDefinedComponent = function (params, cb) {
		this.routerClient.query("Launcher.userDefinedComponentUpdate", {
			type: "add",
			name: params.name,
			url: params.url
		}, function (err, response) {
			if (cb) {
				cb(err, response.data);
			}
		});
	};

	/**
	 * Adds a custom component. Private for now.
	 * @private
	 */
	this.removeUserDefinedComponent = function (params, cb) {
		this.routerClient.query("Launcher.userDefinedComponentUpdate", {
			type: "remove",
			name: params.name,
			url: params.url
		}, function (err, response) {
			if (cb) {
				cb(err, response.data);
			}
		});
	};
	return this;
}


var launcherClient = new LauncherClient({
	onReady: function (cb) {
		Logger.system.debug("launcherClient ready");
		Logger.perf.log("LauncherClientReadyTime", "stop");
		launcherClient.getMyWindowIdentifier((identifier) => {
			launcherClient.myWindowIdentifier = identifier;
			if (cb) {
				cb();
			}
		});
	},
	name: "launcherClient"
});

module.exports = launcherClient;