/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var SystemSettings = require("../common/systemSettings");
var Logger = require('../clients/logger');
module.exports = {
	/**
	 * Gets the openfin version in object form.
	 */
	getOpenfinVersion: function (cb) {
		return new Promise(function (resolve, reject) {
			fin.desktop.System.getVersion((ver) => {
				let verArr = ver.split('.').map(Number);
				let versionObject = {
					major: verArr[0],
					chromium: verArr[1],
					minor: verArr[2],
					patch: verArr[3]
				};
				console.log(versionObject);
				if (cb) {
					cb(versionObject);
				} else {
					resolve(versionObject);
				}
			});
		});
	},
	/**
	 * Given a function _that returns a value_, this method will return a thenable object.
	 * **NOTE** This will not work if your function doesn't return something.
	 *  <example>
	 *		function myFunc(){
				console.log('I promise that this is not a promise.');
			 }
		let myPromise = util.castToPromise(myFunc);
		myPromise().then(doSomethingElse);
		</example>

	 */
	castToPromise: function (f) {
		return function () {
			return new Promise((resolve, reject) => {
				//Calls f, checks to see if the returned object has a `then` method. if not, it will resolve the result from the intiial function.
				const result = f.apply(null, Array.from(arguments));
				try {
					return result.then(resolve, reject);
				} catch (e) {
					if (e instanceof TypeError) {
						resolve(result);
					} else {
						reject(e);
					}
				}
			});
		};
	},
	/**
	 * @introduction
	 * <h2>Finsemble Utility Functions</h2>
	 * @private
	 * @class Utils
	 */

	isPercentage: function (val) {
		if (typeof (val) !== "string") {
			return false;
		}
		return val.indexOf("%") !== -1;
	},

	retrieveMonitorDimensions: function (callback) {
		var dims = {};
		var b = {};
		this.getMonitorInfo().then(function (monitorInfo) {
			var availableMonitors = [monitorInfo.primaryMonitor].concat(monitorInfo.nonPrimaryMonitors);
			fin.desktop.Window.getCurrent().getBounds(function (bounds) {
				dims.defaultLeft = bounds.left;
				dims.defaultTop = bounds.top;
				b = bounds;
				findMonitor();
			});
			function findMonitor() {
				for (var i = 0; i < availableMonitors.length; i++) {
					var monitor = availableMonitors[i].availableRect;

					monitor.width = monitor.right - monitor.left;
					monitor.height = monitor.bottom - monitor.top;
					if (dims.defaultLeft >= monitor.left && dims.defaultLeft < monitor.right) {
						dims.monitorDimensions = monitor;
						break;
					}
				}
				if (callback) {
					callback(null, dims);
				}
			}

		});
	},

	/**
 * finsemble console for displaying diagnostic messages (a transparent replacement for window.top.console)
 * @param {string} name prefix for all console output
 * @memberof Utils
 * @constructor
 */
	Console: function (name) {

		var consoleName;

		// returns a trace substring
		// The "sub" parameter indicates function to start displaying trace from (i.e. truncate trace previous to this function)
		function traceString(sub) {
			function getErrorObject() {
				try { throw Error(''); } catch (err) { return err; }
			}
			var tString = getErrorObject().stack;
			tString = tString.substring(tString.indexOf("at " + sub) - 5); // extra 5 chars to align formating
			return tString;
		}

		/**
		 * Pass through function for console.error, with Finsemble info inserted to front and end of output.
		 * All output ignored unless SystemSetting.diagLevel() >= 1
		 *
		 */
		this.error = function () {
			var myLevel = 1;
			if (myLevel <= SystemSettings.diagLevel()) {
				var args = [].slice.call(arguments); //Convert to a real array
				var preface = consoleName + " Error: ";
				args.unshift(preface);
				var suffix = traceString("error") + " (timestamp " + Math.round((window.performance.now() * 1000)) / 1000 + ')';
				args.push(arguments, suffix);
				window.top.console.error.apply(console, args);
			}
		};

		/**
		 * Pass through function for console.warn, with Finsemble info inserted to front and end of output.
		 * All output ignored unless SystemSetting.diagLevel() >= 2
		 *
		 */
		this.warn = function () {
			var myLevel = 2;
			if (myLevel <= SystemSettings.diagLevel()) {
				var args = [].slice.call(arguments); //Convert to a real array
				var preface = consoleName + " Warn: ";
				args.unshift(preface);
				var suffix = traceString("warn") + " (timestamp " + Math.round((window.performance.now() * 1000)) / 1000 + ')';
				args.push(arguments, suffix);
				window.top.console.warn.apply(console, args);
			}
		};

		/**
		 * Pass through function for console.info, with Finsemble info inserted to front and end of output.
		 * All output ignored unless SystemSetting.diagLevel() >= 3
		 *
		 */
		this.info = function () {
			var myLevel = 3;
			if (myLevel <= SystemSettings.diagLevel()) {
				var args = [].slice.call(arguments); //Convert to a real array
				var preface = consoleName + " Info: ";
				args.unshift(preface);
				var suffix = " (timestamp " + Math.round((window.performance.now() * 1000)) / 1000 + ')';
				args.push(arguments, suffix);
				window.top.console.info.apply(console, args);
			}
		};

		/**
		 * Pass through function for console.log (but redirected to console.info), with Finsemble info inserted to front and end of output.
		 * All output ignored unless SystemSetting.diagLevel() >= 3
		 *
		 */
		this.log = function () {
			var myLevel = 3;
			if (myLevel <= SystemSettings.diagLevel()) {
				var args = [].slice.call(arguments); //Convert to a real array
				var preface = consoleName + " Log: ";
				args.unshift(preface);
				var suffix = " (timestamp " + Math.round((window.performance.now() * 1000)) / 1000 + ')';
				args.push(arguments, suffix);
				window.top.console.info.apply(console, args);
			}
		};

		/**
		 * Pass through function for console.debug, with Finsemble info inserted to front and end of output.
		 * All output ignored unless SystemSetting.diagLevel() >= 4
		 *
		 */
		this.debug = function () {
			var myLevel = 4;
			if (myLevel <= SystemSettings.diagLevel()) {
				var args = [].slice.call(arguments); //Convert to a real array
				var preface = consoleName + " Debug: ";
				args.unshift(preface);
				var suffix = " (timestamp " + Math.round((window.performance.now() * 1000)) / 1000 + ')';
				args.push(arguments, suffix);
				window.top.console.debug.apply(console, args);
			}
		};

		/**
		 * Pass through function to console.debug, with Finsemble info inserted to front and end of output.
		 * All output ignored unless SystemSetting.diagLevel() >= 5
		 *
		 */
		this.debug2 = function () {
			var myLevel = 5;
			if (myLevel <= SystemSettings.diagLevel()) {
				var args = [].slice.call(arguments); //Convert to a real array
				var preface = consoleName + " Debug2: ";
				args.unshift(preface);
				var suffix = " (timestamp " + Math.round((window.performance.now() * 1000)) / 1000 + ')';
				args.push(arguments, suffix);
				window.top.console.debug.apply(console, args);
			}
		};

		/**
		 * Pass through function to console.debug, with Finsemble info inserted to front and end of output.
		 * All output ignored unless SystemSetting.diagLevel() >= 6
		 *
		 */
		this.debug3 = function () {
			var myLevel = 6;
			if (myLevel <= SystemSettings.diagLevel()) {
				var args = [].slice.call(arguments); //Convert to a real array
				var preface = consoleName + " Debug3: ";
				args.unshift(preface);
				var suffix = " (timestamp " + Math.round((window.performance.now() * 1000)) / 1000 + ')';
				args.push(arguments, suffix);
				window.top.console.debug.apply(console, args);
			}
		};

		/**
		 * Pass through function to console.debug, with Finsemble info inserted to front and end of output.
		 * All output ignored unless SystemSetting.diagLevel() >= 7
		 *
		 */
		this.debug4 = function () {
			var myLevel = 7;
			if (myLevel <= SystemSettings.diagLevel()) {
				var args = [].slice.call(arguments); //Convert to a real array
				var preface = consoleName + " Debug4: ";
				args.unshift(preface);
				var suffix = " (timestamp " + Math.round((window.performance.now() * 1000)) / 1000 + ')';
				args.push(arguments, suffix);
				window.top.console.debug.apply(console, args);
			}
		};

		consoleName = name;
		if (window.top !== window) {
			consoleName += ' Frame';
		}
	},

	/**
	 * @param {any} name
	 * @param {any} payload
	 * @memberof Utils
	 */
	msgWrapper: function (name, payload) {
		this.name = name;
		this.payload = payload;
	},

	monitorInfo: null,
	/**
	 * returns monitor infor
	 *
	 * @param {any} force
	 * @returns object
	 */
	getMonitorInfo: function (force) {
		return new Promise(function (resolve, reject) {
			fin.desktop.System.getMonitorInfo(function (monitorInfo) {
				console.debug("getMonitorInfo");
				module.exports.monitorInfo = monitorInfo;
				resolve(monitorInfo);
			});
		});
	},

	/**
	 * get the dimensions of a monitor
	 *
	 * @returns height and weight
	 * @memberof Utils
	 */
	getMonitorDimensions: function () {
		return new Promise(
			function (resolve, reject) {
				console.debug("getMonitorDimensions");
				var monitorDimensions = {
					height: null,
					width: null

				};
				console.debug('getting data');
				fin.desktop.System.getMonitorInfo(function (monitorInfo) {
					console.debug('got monitorInfo', monitorInfo);
					//top bar is 45..
					monitorDimensions.height = monitorInfo.primaryMonitor.availableRect.bottom - monitorInfo.primaryMonitor.availableRect.top - 32;
					monitorDimensions.width = monitorInfo.primaryMonitor.availableRect.right;
					monitorDimensions.left = monitorInfo.primaryMonitor.availableRect.left;
					monitorDimensions.top = monitorInfo.primaryMonitor.availableRect.top;
					resolve(monitorDimensions);
				});
			}
		);
	},

	/**
	 * Gets an array of monitor descriptors. Essentially rationalizing the results of OpenFin getMonitorInfo.
	 * into a single array with additional information added.
	 *
	 * whichMonitor is set to the secondary monitor number, or "primary" if the primary monitor.
	 * position is set to a zero index, where primary is the zero position, and each non-primary increments thereafter.
	 *
	 * Additionally, width and height are calculated and filled in for availableRect and monitorRect.
	 *
	 * @param {callback-array} cb Returns a list of monitor descriptors (optional or use promise)
	 * @returns {Promise} A promise that resolves to a list of monitor descriptors
	 */
	getAllMonitors: function (cb) {
		return new Promise(function (resolve) {
			fin.desktop.System.getMonitorInfo(function (monitorInfo) {
				//console.log("getAllMonitors");
				var allMonitors = [];
				var primaryMonitor = module.exports.clone(monitorInfo.primaryMonitor);
				primaryMonitor.whichMonitor = "primary";
				primaryMonitor.position = 0;
				allMonitors.push(primaryMonitor);
				for (let i = 0; i < monitorInfo.nonPrimaryMonitors.length; i++) {
					let monitor = monitorInfo.nonPrimaryMonitors[i];
					monitor.whichMonitor = i;
					monitor.position = i + 1;
					allMonitors.push(module.exports.clone(monitor));
				}
				for (let i = 0; i < allMonitors.length; i++) {
					let monitor = allMonitors[i];
					module.exports.rationalizeMonitor(monitor);
				}
				if (cb) { cb(allMonitors); }
				resolve(allMonitors);
			});
		});
	},

	rationalizeMonitor: function (monitor) {
		monitor.monitorRect.width = monitor.monitorRect.right - monitor.monitorRect.left;
		monitor.monitorRect.height = monitor.monitorRect.bottom - monitor.monitorRect.top;
		monitor.availableRect.width = monitor.availableRect.right - monitor.availableRect.left;
		monitor.availableRect.height = monitor.availableRect.bottom - monitor.availableRect.top;
	},
	/**
	 * Retrieves a monitor descriptor given an absolute X Y on the OpenFin virtual screen
	 * @param  {number} x The x position
	 * @param  {number} y The y position
	 * @param {callback-object}  cb Returns the monitor information from OpenFin.
	 * "isPrimary" is set to true if it's the primary monitor.
	 * null is returned if the x,y coordinates are beyond the bounds of the virtual screen.
	 */
	getMonitorFromOpenFinXY: function (x, y, cb) {
		module.exports.getAllMonitors(function (monitors) {
			//	console.log("getMonitorFromOpenFinXY");
			for (var i = 0; i < monitors.length; i++) {
				var monitor = monitors[i];
				var monitorRect = monitor.monitorRect;
				// Are our coordinates inside the monitor? Note that
				// left and top are inclusive. right and bottom are exclusive
				// In OpenFin, two adjacent monitors will share a right and left pixel value!
				if (x >= monitorRect.left && x < monitorRect.right &&
					y >= monitorRect.top && y < monitorRect.bottom) {
					cb(monitor);
					return;
				}
			}
			cb(null);
		});
	},

	/**
	 * Retrieves a monitor descriptor for a window. If the window straddles two monitors
	 * then the monitor from the top left is provided and "straddling" flag is set to true.
	 *
	 * @param  {LauncherClient~windowDescriptor}   windowDescriptor A windowDescriptor
	 * @param  {Function} cb               Returns a monitor descriptor (optional or use promise)
	 * @returns {Promise} A promise that resolves to a monitor descriptor
	 */
	getMonitorFromWindow: function (windowDescriptor, cb) {
		var x = windowDescriptor.x || windowDescriptor.defaultLeft;
		var y = windowDescriptor.y || windowDescriptor.defaultTop;
		var x2 = x + windowDescriptor.defaultWidth;
		var y2 = y + windowDescriptor.defaultHeight;
		return new Promise(function (resolve, reject) {
			module.exports.getMonitorFromOpenFinXY(x, y, function (monitor) {
				console.debug("getMonitorFromWindow");
				if (!monitor) {
					console.log("getMonitorFromWindow invariant. Can't find monitor for window");
					if (cb) {
						cb(null);
					}
					reject(new Error('Cannot find monitor for window.'));
					return;
				}
				monitor = module.exports.clone(monitor);
				var monitorRect = monitor.monitorRect;
				if (monitorRect.right > x2 || monitorRect.bottom > y2) {
					monitor.straddling = true;
				}
				if (cb) { cb(monitor); }
				resolve(monitor);
			});
		});
	},

	/**
	 * Returns a finWindow or null if not found
	 * @param  {LauncherClient~windowIdentifier}   windowIdentifier A window identifier
	 * @param  {Function} cb               Optional callback containing finWindow or null if not found (or use Promise)
	 * @return {Promise}                    Promise that resulves to a finWindow or rejects if not found
	 */
	getFinWindow: function (windowIdentifier, cb) {
		console.debug("getFinWindow");
		Logger.system.log('Util.getFinWindow - start');
		return new Promise(function (resolve, reject) {
			// Default to current window
			var myWindow = fin.desktop.Window.getCurrent();

			// Get OpenFin options (windowDescriptor) for current window
			// we need this info even if we're going to reference a different window
			Logger.system.log('Util.getFinWindow.getOptions - start');
			myWindow.getOptions(function (options) {
				Logger.system.log('Util.getFinWindow.getOptions - callback');
				// If windowName is provided, then find that window
				if (windowIdentifier && windowIdentifier.windowName) {
					// If we didn't get a uuid from the caller, then assume
					// it's the same window as current window
					if (!windowIdentifier.uuid) {
						windowIdentifier.uuid = options.uuid;
					}
					/**
					 * Try to wrap the window; if it exists, getInfo will get in
					 *  to the success function. If not, it'll go into the error callback.
					 */
					let remoteWindow = fin.desktop.Window.wrap(windowIdentifier.uuid, windowIdentifier.windowName);
					Logger.system.log('Util.getFinWindow.remoteWindow.getInfo - Start');
					remoteWindow.getInfo((info) => {
						Logger.system.log('Util.getFinWindow.remoteWindow.getInfo - callback');
						if (cb) { cb(remoteWindow); };

						Logger.system.log('Util.getFinWindow - end - 462');
						resolve(remoteWindow);
					}, function (err) {
						Logger.system.log('Util.getFinWindow - end - 465');
						if (cb) { cb(null); }
						reject("Window " + windowIdentifier.windowName + " not found." + `UUID: ${windowIdentifier.uuid}`);
						console.debug("util.getFinWindow: Window " + windowIdentifier.windowName + " not found");
						return;
					});
				} else if (windowIdentifier && windowIdentifier.componentType) {
					if (typeof LauncherService !== 'undefined') {
						let remoteWindow = LauncherService.componentFinder(windowIdentifier);
						if (remoteWindow) {
							Logger.system.log('Util.getFinWindow - end - 475');
							resolve(remoteWindow);
							if (cb) { cb(remoteWindow); }
						} else {
							Logger.system.log('Util.getFinWindow - end - 479');
							reject("util.getFinWindow: Component " + windowIdentifier.componentType + " not found.");
							if (cb) { cb(null); }
						}
					} else {
						Logger.system.log('Util.getFinWindow - end - 484');
						//@TODO, get this through a remote call to Launcher service
						reject("getFinWindow by componentType is currently only operable within LaunchService");
						if (cb) { cb(null); }
					}
				} else {
					Logger.system.log('Util.getFinWindow - end - 490');
					// return windowDescriptor for current window
					if (cb) { cb(myWindow); }
					resolve(myWindow);
				}
			});
		});
	},

	/**
	 * Retrieves a windowDescriptor given a windowIdentifier
	 * @param {LauncherClient~windowIdentifier} [windowIdentifier] The window to locate. If empty then the current window is returned.
	 * @callback {function} cb Function to retrieve result (optional or use Promise)
	 * @returns {Promise} A promise that resolves to a LauncherClient~windowDescriptor
	 */
	getWindowDescriptor: function (windowIdentifier, cb) {
		console.debug("getWindowDescriptor");
		Logger.system.log('Util.getWindowDescriptor - start');
		return new Promise(function (resolve, reject) {
			Logger.system.log('Util.getWindowDescriptor.getFinWindow - Start');
			module.exports.getFinWindow(windowIdentifier).then(function (finWindow) {
				Logger.system.log('Util.getWindowDescriptor.getFinWindow - Callback');
				Logger.system.log('Util.getWindowDescriptor.getOptions - Start');
				finWindow.getOptions(function (options) {
					Logger.system.log('Util.getWindowDescriptor.getOptions - Callback');
					if (cb) { cb(options); }
					Logger.system.log('Util.getWindowDescriptor - End');
					resolve(options);
				});
			}).catch(function (errorMessage) {
				console.warn(errorMessage);
				Logger.system.log('Util.getWindowDescriptor - End -- Warn');
				if (cb) { cb(null); }
				reject(errorMessage);
			});
		});
	},

	findMonitor: function (monitors, field, value) {
		for (var i = 0; i < monitors.length; i++) {
			var monitor = monitors[i];
			if (monitor[field] === value) { return monitor; }
		}
		return null;
	},
	/**
	 * @param {number} commandMonitor
	 * @param {array} monitors
	 * @param {number} launchingMonitorPosition
	 * commandMonitor, monitors, launchingMonitorPosition
	 */
	getWhichMonitor: function (params, cb) {
		//First release of this method took 3 params.
		if (arguments.length > 2) {
			params = {
				commandMonitor: arguments[0],
				monitors: arguments[1],
				launchingMonitorPosition: arguments[2]
			};
			cb = null;
		}
		var monitor;
		var { commandMonitor, monitors, launchingMonitorPosition } = params;
		var isANumber = (commandMonitor && commandMonitor !== "") || commandMonitor === 0;
		if (commandMonitor === "primary") {
			monitor = module.exports.findMonitor(monitors, "whichMonitor", "primary");
		} else if (commandMonitor === "next") {
			let position = launchingMonitorPosition + 1;
			if (position >= monitors.length) {
				position = 0;
			}
			monitor = monitors[position];
		} else if (commandMonitor === "previous") {
			let position = launchingMonitorPosition - 1;
			if (position < 0) {
				position = monitors.length - 1;
			}
			monitor = monitors[position];
		} else if (commandMonitor === 'mine') {
			var waiting = true;
			module.exports.getFinWindow(params.windowIdentifier).then(function (finWin) {
				finWin.getBounds((bounds) => {
					module.exports.getMonitorFromOpenFinXY(bounds.left, bounds.top, function (monitor) {
						cb(monitor);
					});
				});
			});
		} else if (isANumber) {
			if (commandMonitor >= monitors.length) {
				commandMonitor = monitors.length - 1;
			}
			monitor = monitors[commandMonitor];
		} else {
			monitor = monitors[launchingMonitorPosition];
		}
		if (!waiting) {
			if (cb) {
				cb(monitor);
			} else {
				//maintaining backwards compatibility
				return monitor;
			}
		}
	},

	/**
	 * Gets a monitorInfo based on a command. A command is the typical "monitor" param
	 * @param  {string} commandMonitor   Monitor command. See {@link LauncherClient#spawn}
	 * @param  {object} windowIdentifier The windowIdentifier of the calling function. Necessary to support "next","previous" an default.
	 * @param {function} [cb] Optional callback
	 * @returns {Promise} A promise that resolves to a monitorInfo
	 */
	getMonitorFromCommand: function (commandMonitor, windowIdentifier, cb) {
		return new Promise(function (resolve, reject) {
			module.exports.getMonitor(windowIdentifier, function (monitorInfo) {
				module.exports.getAllMonitors(function (monitors) {
					let params = {
						commandMonitor: commandMonitor,
						monitors: monitors,
						launchingMonitorPosition: monitorInfo.position
					};
					module.exports.getWhichMonitor(params, function (finalMonitorInfo) {
						if (cb) { cb(finalMonitorInfo); }
						resolve(finalMonitorInfo);
					});

				});
			});
		});
	},

	/**
	 * @private
	 * @param {LauncherClient~windowDescriptor} windowDescriptor
	 * @param {monitorDimensions} monitorDimensions
	 * @returns {boolean} Whether window is on the current monitor.
	 */
	windowOnMonitor: function (windowDescriptor, monitorDimensions) {
		//if right or left edge is within the window's bounds.
		if ((windowDescriptor.left >= monitorDimensions.left && windowDescriptor.left < monitorDimensions.right) ||
			(windowDescriptor.right <= monitorDimensions.right && windowDescriptor.right > monitorDimensions.left)) {
			return true;
		}
		return false;
	},

	/**
	 * Convenience function to get the monitor for the current window
	 * @param {LauncerClient~windowIdentifier} [windowIdentifier] The window to find the monitor for. Current window if empty.
	 * @param  {Function} cb Returns a monitor descriptor (optional or use Promise)
	 * @returns {Promise} A promise that resolves to a monitor descriptor
	 */
	getMonitor: function (windowIdentifier, cb) {
		return new Promise(function (resolve, reject) {
			module.exports.getWindowDescriptor(windowIdentifier, function (windowDescriptor) {
				if (!windowDescriptor) {
					reject("util.getMonitor: Can't locate windowDescriptor.");
				} else {
					module.exports.getMonitorFromWindow(windowDescriptor, function (monitor) {
						if (cb) { cb(monitor); }
						resolve(monitor);
					});
				}
			});
		});
	},
	/**
	 * Returns a windowIdentifier for the current window
	 * @param {LauncherClient~windowIdentifier} cb Callback function returns windowIdentifier for this window (optional or use Promise)
	 * @returns {Promise} A promise that resolves to a windowIdentifier
	 */
	getMyWindowIdentifier: function (cb) {
		var finWindow = fin.desktop.Window.getCurrent();
		Logger.system.log('Util.getMyWindowIdentifier - start');
		return new Promise(function (resolve) {
			finWindow.getOptions((windowDescriptor) => {
				var componentType = null;

				// Figure out the component type from what was originally stored when we launched the window
				// options.customData is where our stuff is found
				var customData = windowDescriptor.customData;
				if (customData && customData.component) {
					componentType = customData.component.type;
				}
				var windowIdentifier = {
					windowName: finWindow.name,
					uuid: finWindow.uuid,
					componentType: componentType
				};
				Logger.system.log('Util.getMyWindowIdentifier - End');

				if (cb) { cb(windowIdentifier); }
				resolve(windowIdentifier);
			});
		});
	},
	/**
	 *	@returns {string} Transforms an array of strings into a camelcased string.
	 * @memberof Utils
	 */
	camelCase: function () {
		var str = '';
		for (var i = 0; i < arguments.length; i++) {
			str += ' ' + arguments[i];
		}
		return str
			.replace(/\s(.)/g, function ($1) { return $1.toUpperCase(); })
			.replace(/\s/g, '')
			.replace(/^(.)/, function ($1) { return $1.toLowerCase(); });
	},

	/**
	 * Convenience method for cloning an object.
	 * @param  {any} from The thing you want to copy
	 * @param {any} to Where you want your copy to end up.
	 * @return {any} to Where you want your copy to end up.
	 */
	clone: function (from, to) {
		if (from === null || typeof from !== "object") { return from; }
		// if (from.constructor != Object && from.constructor != Array) return from;
		if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
			from.constructor == String || from.constructor == Number || from.constructor == Boolean) { return new from.constructor(from); }

		to = to || new from.constructor();

		for (var n in from) {
			to[n] = typeof to[n] === "undefined" ? module.exports.clone(from[n], null) : to[n];
		}

		return to;
	},

	getUniqueName: function (baseName) {
		if (!baseName) {
			baseName = "RouterClient";
		}
		var uuid = baseName + "-" + Math.floor(Math.random() * 100) + "-" + Math.floor(Math.random() * 10000);
		return uuid;
	},

	injectJS(path, cb) {//Inject a script tag with the path given. Once the script is loaded, it executes the callback.

		var script = document.createElement('script');
		script.onload = cb;
		script.type = 'text/javascript';
		script.async = true;
		script.src = path;
		var head = document.getElementsByTagName('head')[0];
		var firstScript = head.getElementsByTagName('script')[0];
		head.insertBefore(script, firstScript);

	},
};
