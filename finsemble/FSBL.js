window["FSBL"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "http://localhost:3375/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 33);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/


const LOCAL_ONLY_DEFAULT = false; // if true all logging will default to local console; will be overwritten by LoggerService's registration response

// capture everything at startup; will be filtered later as needed when LoggerService's registration response provides settings; overhead here is not too high
var DEFAULT_LOG_SETTING = { Error: true, Warn: true, Info: true, Log: true, Debug: true, Verbose: true, LocalOnly: LOCAL_ONLY_DEFAULT }; // if true captured for logger
var CONSOLE_DEFAULT_LOG_SETTING = { Error: true, Warn: true, Info: true, Log: true, Debug: true }; // if true then goes to console and captured for logger

const MAX_QUEUE_SIZE = 10 * 1000; // maximum logger queue size; plenty of space although shouldn't need much since continuely sending to logger if working correctly;

var Validate = __webpack_require__(2); // Finsemble args validator
var RouterClient; // wait till start to fill in

/**
 * @introduction
 * <h2>Config Client</h2>
 *
 * This client provides run-time access to Finsemble's configuration. See [Understanding Finsemble's Configuration]{@tutorial understandingConfiguration} for a configuration overview.
 *
 * @hideConstructor true
 * @constructor
 */
var Logger = function () {
	var self = this;
	var isRegistering = false; // if registering start
	var isRegistered = false; // if registering complete
	var isActiveTransmitTimer = false;
	var loggerConsole = self;
	var updatedLogState;
	var isStarted = false;
	var isReady = false;
	var calibratedTimeStampOffset = 0;
	var newCalibratedTimeStampOffset;

	var loggerQueue = [];
	var warningIssued = false; // used to limit warning messages

	var loggerClientName = window.name;
	if (window.top !== window) { // amend name if iFrame
		loggerClientName += ".Frame";
	}
	var clientChannel = "finsemble.logger.client." + loggerClientName;

	const CATEGORIES = ["console", "dev", "system", "perf"];

	var initialLogState = {}; // will be updated on registration with central console, but capture everything until then
	initialLogState.console = CONSOLE_DEFAULT_LOG_SETTING;
	initialLogState.dev = DEFAULT_LOG_SETTING;
	initialLogState.system = DEFAULT_LOG_SETTING;
	initialLogState.perf = DEFAULT_LOG_SETTING;

	var currentLogState = initialLogState;

	function LoggerMessage(category, type, data) {
		this.category = category;
		this.logClientName = loggerClientName;
		this.logType = type;
		this.logData = data;
		this.logTimestamp = window.performance.timing.navigationStart + window.performance.now() + calibratedTimeStampOffset;
	}

	function addToQueue(message) {
		if (loggerQueue.length < MAX_QUEUE_SIZE) {
			loggerQueue.push(message);
		} else {
			if (!warningIssued) {
				console.warn("Logging Queue Overflowed!", loggerQueue);
				warningIssued = true;
			}
		}
	}

	// if log state changes then update queue based on that data (e.g. if no longer logging debug messages, then remove them from the queue)
	function updateQueueBasedOnState(calibrateTimeFlag) {
		loggerConsole.system.debug("Logger updateQueueBasedOnState", calibrateTimeFlag, calibratedTimeStampOffset, "QUEUE LENGTH", loggerQueue.length, currentLogState);
		var newQueue = [];
		for (var i = 0, length = loggerQueue.length; i < length; i++) {
			if (currentLogState[loggerQueue[i].category][loggerQueue[i].logType] && !currentLogState[loggerQueue[i].category].LocalOnly) {
				if (calibrateTimeFlag) {
					loggerQueue[i].logTimestamp += calibratedTimeStampOffset; // if flag set then timestamp hasn't been adjusted yet by calibrated offset time
				}
				newQueue.push(loggerQueue[i]);
			} else { // only now know LocalOnly for messages, so print those queued out otherwise they will be lost
				if (currentLogState[loggerQueue[i].category][loggerQueue[i].logType] && currentLogState[loggerQueue[i].category].LocalOnly) {
					let msg = loggerQueue[i];
					console.log(msg.category, msg.logType, msg.logTimestamp - window.performance.timing.navigationStart, msg.logData, "(Previously queued!)");
				}
			}
		}
		loggerQueue = newQueue;
	}

	this.setClientName = function (name) {
		loggerClientName = name;
	};

	this.getClientName = function (name) {
		return loggerClientName;
	};

	this.clearMessageList = function () {
		loggerQueue = [];
	};

	function setLogState(state, calibrateTimeFlag) {
		currentLogState = state;
		updateQueueBasedOnState(calibrateTimeFlag);
	}

	// returns a stack-trace substring
	function oldtraceString() {
		var tString = new Error().stack;
		return tString;
	}

	function traceString() {
		function getPosition(string, subString, index) {
			return string.split(subString, index).join(subString).length;
		}

		function getErrorObject() {
			try { throw Error(""); } catch (err) { return err; }
		}
		var stack = getErrorObject().stack;
		var position = getPosition(stack, "\n", 4);
		var tString = stack.substring(position); // strip off irrelevant part of stack
		var final = "Log Stack: \n" + tString.substr(1); // insert description
		return final;
	}

	// save original console functions since going to wrap/redefine each
	var orignalConsoleError = console.error;
	var orignalConsoleWarn = console.warn;
	var orignalConsoleInfo = console.info;
	var orignalConsoleLog = console.log;
	var orignalConsoleDebug = console.debug;

	// expose original console in case client still wants to directly access
	console.original = {};
	console.original.error = console.error;
	console.original.warn = console.warn;
	console.original.info = console.info;
	console.original.log = console.log;
	console.original.debug = console.debug;

	// option to restore console (i.e. use Logger without overriding console) -- not yet tested
	this.restoreConsole = function () {
		console.error = orignalConsoleError;
		console.warn = orignalConsoleWarn;
		console.info = orignalConsoleInfo;
		console.log = orignalConsoleLog;
		console.debug = orignalConsoleDebug;
	};

	function formatAndQueueMessage(category, type, args) {
		var message;
		try {
			message = new LoggerMessage(category, type, JSON.stringify(args));
		} catch (err) {
			args.splice(0, args.length); // clear but don't redefine since must return updated value
			args.push(traceString());
			message = new LoggerMessage(category, type, "*** Logging Error: " + JSON.stringify(args));
		}

		addToQueue(message);

		if (isRegistered) {
			if (!isActiveTransmitTimer) { // since log message added to queue, only set timer to transmit log if not already set
				if (loggerClientName === "routerService") {
					setTimeout(transmitAndClearQueue, 100); // HERE is the interval for transmitting queued messages to the logger service
				} else {
					setTimeout(transmitAndClearQueue, 250); // HERE is the interval for transmitting queued messages to the logger service
				}
				isActiveTransmitTimer = true;
			}
		}
	}

	function transmitAndClearQueue() {
		RouterClient.transmit("logger.service.logMessages", loggerQueue);
		loggerConsole.clearMessageList();
		isActiveTransmitTimer = false; // flag for supporting log transmit only when there is something in the log queue
	}

	function outputToConsole(consoleType, args) {
		try {
			consoleType.apply(console, args);
		} catch (err) {
			args = [];
			args.push(traceString());
			message = new LoggerMessage(category, type, "*** Console Logging Error: " + JSON.stringify(args));
		}
	}

	// wrap main console functions
	console.error = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		outputToConsole(orignalConsoleError, args); // output to console before adding trace
		args.push(traceString());
		if (currentLogState.console.Error && !currentLogState.console.LocalOnly) {
			formatAndQueueMessage("console", "Error", args);
		}
	};

	console.warn = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		outputToConsole(orignalConsoleWarn, args); // output to console before adding trace
		args.push(traceString());
		if (currentLogState.console.Warn && !currentLogState.console.LocalOnly) {
			formatAndQueueMessage("console", "Warn", args);
		}
	};

	console.info = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		outputToConsole(orignalConsoleInfo, args); // output to console before adding trace
		args.push(traceString());
		if (currentLogState.console.Info && !currentLogState.console.LocalOnly) {
			formatAndQueueMessage("console", "Info", args);
		}
	};

	console.log = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		outputToConsole(orignalConsoleLog, args); // output to console before adding trace
		args.push(traceString());
		if (currentLogState.console.Log && !currentLogState.console.LocalOnly) {
			formatAndQueueMessage("console", "Log", args);
		}
	};

	console.debug = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		outputToConsole(orignalConsoleDebug, args); // output to console before adding trace
		args.push(traceString());
		if (currentLogState.console.Debug && !currentLogState.console.LocalOnly) {
			formatAndQueueMessage("console", "Debug", args);
		}
	};

	// dev mode functions
	this.error = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());

		if (currentLogState.dev.Error && !currentLogState.dev.LocalOnly) {
			formatAndQueueMessage("dev", "Error", args);
		}

		args.unshift("dev error (" + window.performance.now() + "):");
		outputToConsole(orignalConsoleError, args);
	};

	this.warn = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());
		if (currentLogState.dev.Warn && !currentLogState.dev.LocalOnly) {
			formatAndQueueMessage("dev", "Warn", args);
		}
		if (currentLogState.dev.Warn && currentLogState.dev.LocalOnly) {
			args.unshift("dev warn (" + window.performance.now() + "):");
			outputToConsole(orignalConsoleWarn, args);
		}
	};

	this.info = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());
		if (currentLogState.dev.Info && !currentLogState.dev.LocalOnly) {
			formatAndQueueMessage("dev", "Info", args);
		}
		if (currentLogState.dev.Info && currentLogState.dev.LocalOnly) {
			args.unshift("dev info (" + window.performance.now() + "):");
			outputToConsole(orignalConsoleInfo, args);
		}
	};

	this.log = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());
		if (currentLogState.dev.Log && !currentLogState.dev.LocalOnly) {
			formatAndQueueMessage("dev", "Log", args);
		}
		if (currentLogState.dev.Log && currentLogState.dev.LocalOnly) {
			args.unshift("dev log (" + window.performance.now() + "):");
			outputToConsole(orignalConsoleLog, args);
		}
	};

	this.debug = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());
		if (currentLogState.dev.Debug && !currentLogState.dev.LocalOnly) {
			formatAndQueueMessage("dev", "Debug", args);
		}
		if (currentLogState.dev.Debug && currentLogState.dev.LocalOnly) {
			args.unshift("dev debug (" + window.performance.now() + "):");
			outputToConsole(orignalConsoleDebug, args);
		}
	};

	this.verbose = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());
		if (currentLogState.dev.Verbose && !currentLogState.dev.LocalOnly) {
			formatAndQueueMessage("dev", "Verbose", args);
		}
		if (currentLogState.dev.Verbose && currentLogState.dev.LocalOnly) {
			args.unshift("dev verbose (" + window.performance.now() + "):");
			outputToConsole(orignalConsoleDebug, args);
		}
	};

	// system mode functions
	this.system = {};
	this.system.error = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());

		if (currentLogState.system.Error && !currentLogState.system.LocalOnly) {
			formatAndQueueMessage("system", "Error", args);
		}

		args.unshift("system error (" + window.performance.now() + "):");
		outputToConsole(orignalConsoleError, args);
	};

	this.system.warn = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());
		if (currentLogState.system.Warn && !currentLogState.system.LocalOnly) {
			formatAndQueueMessage("system", "Warn", args);
		}
		if (currentLogState.system.Warn && currentLogState.system.LocalOnly) {
			args.unshift("system warn (" + window.performance.now() + "):");
			outputToConsole(orignalConsoleWarn, args);
		}
	};

	this.system.info = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());
		if (currentLogState.system.Info && !currentLogState.system.LocalOnly) {
			formatAndQueueMessage("system", "Info", args);
		}
		if (currentLogState.system.Info && currentLogState.system.LocalOnly) {
			args.unshift("system info (" + window.performance.now() + "):");
			outputToConsole(orignalConsoleInfo, args);
		}
	};

	this.system.log = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());
		if (currentLogState.system.Log && !currentLogState.system.LocalOnly) {
			formatAndQueueMessage("system", "Log", args);
		}
		if (currentLogState.system.Log && currentLogState.system.LocalOnly) {
			args.unshift("system log (" + window.performance.now() + "):");
			outputToConsole(orignalConsoleLog, args);
		}
	};

	this.system.debug = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());
		if (currentLogState.system.Debug && !currentLogState.system.LocalOnly) {
			formatAndQueueMessage("system", "Debug", args);
		}
		if (currentLogState.system.Debug && currentLogState.system.LocalOnly) {
			args.unshift("system debug (" + window.performance.now() + "):");
			outputToConsole(orignalConsoleDebug, args);
		}
	};

	this.system.verbose = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());
		if (currentLogState.system.Verbose && !currentLogState.system.LocalOnly) {
			formatAndQueueMessage("system", "Verbose", args);
		}
		if (currentLogState.system.Verbose && currentLogState.system.LocalOnly) {
			var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
			args.unshift("system log (" + window.performance.now() + "):");
			outputToConsole(orignalConsoleDebug, args);
		}
	};

	// performance mode functions
	this.perf = {};
	this.perf.error = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());

		if (currentLogState.perf.Error && !currentLogState.perf.LocalOnly) {
			formatAndQueueMessage("perf", "Error", args);
		}

		args.unshift("perf error (" + window.performance.now() + "):");
		outputToConsole(orignalConsoleError, args);
	};

	this.perf.warn = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());
		if (currentLogState.perf.Warn && !currentLogState.perf.LocalOnly) {
			formatAndQueueMessage("perf", "Warn", args);
		}
		if (currentLogState.perf.Warn && currentLogState.perf.LocalOnly) {
			args.unshift("perf warn (" + window.performance.now() + "):");
			outputToConsole(orignalConsoleWarn, args);
		}
	};

	this.perf.info = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());
		if (currentLogState.perf.Info && !currentLogState.perf.LocalOnly) {
			formatAndQueueMessage("perf", "Info", args);
		}
		if (currentLogState.perf.Info && currentLogState.perf.LocalOnly) {
			args.unshift("perf info (" + window.performance.now() + "):");
			outputToConsole(orignalConsoleInfo, args);
		}
	};

	this.perf.log = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());
		if (currentLogState.perf.Log && !currentLogState.perf.LocalOnly) {
			formatAndQueueMessage("perf", "Log", args);
		}
		if (currentLogState.perf.Log && currentLogState.perf.LocalOnly) {
			args.unshift("perf log (" + window.performance.now() + "):");
			outputToConsole(orignalConsoleLog, args);
		}
	};

	this.perf.debug = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());
		if (currentLogState.perf.Debug && !currentLogState.perf.LocalOnly) {
			formatAndQueueMessage("perf", "Debug", args);
		}
		if (currentLogState.perf.Debug && currentLogState.perf.LocalOnly) {
			args.unshift("perf debug (" + window.performance.now() + "):");
			outputToConsole(orignalConsoleDebug, args);
		}
	};

	this.perf.verbose = function () {
		var args = Array.prototype.slice.call(arguments); // make a real array so can manipulate
		args.push(traceString());
		if (currentLogState.perf.Verbose && !currentLogState.perf.LocalOnly) {
			formatAndQueueMessage("perf", "Verbose", args);
		}
		if (currentLogState.perf.Verbose && currentLogState.perf.LocalOnly) {
			args.unshift("perf verbose (" + window.performance.now() + "):");
			outputToConsole(orignalConsoleDebug, args);
		}
	};

	function registerClient() {
		loggerConsole.system.debug("logger.service.registering", loggerClientName);
		if (!LOCAL_ONLY_DEFAULT) {
			RouterClient.query("logger.service.register", { clientName: loggerClientName, clientChannel }, function (error, queryMessage) {
				if (error) { // for some very early clients the logger may not be ready yet, so retry after a small wait
					setTimeout(registerClient, 750);
				} else {
					isRegistered = true;
					loggerConsole.system.debug("logger.service.register response", queryMessage.data);
					updatedLogState = queryMessage.data;
					if (loggerClientName !== "routerService") {
						calibratedTimeStampOffset = newCalibratedTimeStampOffset; // from now the real offset time will be used for all timestamps
						setLogState(updatedLogState, true); // true indicates must adjust already queued timestamps by the new offset time
					} else { // router services doesn't need to calibrate time since it is the reference time
						setLogState(updatedLogState, false);
					}
					formatAndQueueMessage("system", "Info", ["Logger Registered"]);
					transmitAndClearQueue();
				}
			});
		}

		RouterClient.addListener(clientChannel, function (error, message) {
			loggerConsole.system.debug("logger.client.setLogState", message.data);
			updatedLogState = message.data;
			setLogState(updatedLogState, false);
		});
	}

	function unregisterClient() {
		loggerConsole.system.debug("logger.service.unregister", loggerClientName);
		transmitAndClearQueue(); // send any message currently in the log queue
		RouterClient.query("logger.service.unregister", { clientName: loggerClientName }, function () { });
	}

	function registerOnceWhenStarted() {
		if (!isRegistering) {
			registerClient();
			window.addEventListener("beforeunload", unregisterClient);
			isRegistering = true;
		}
	}

	this.isLogMessage = function (channel) {
		return (channel === "logger.service.logMessages");
	};

	this.start = function () {
		RouterClient = __webpack_require__(10);
		RouterClient.onReady(function () {
			loggerConsole.system.debug("Logger onReady", loggerClientName);
			// timer calibration must be done so the messages will be correctly sorted in the central logger;
			// this is necessary because there is timer driff between windows --- this appears to be a Chromium
			// bug we have to work around it.  The timeOffset value adjusts the time using the routerService's
			// time as a central reference point.
			RouterClient.calibrateTimeWithRouterService(function (timeOffset) {
				newCalibratedTimeStampOffset = timeOffset;
				registerOnceWhenStarted();
			});
		});
	};
};

var logger = new Logger();

module.exports = logger;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var SystemSettings = __webpack_require__(16);
var Logger = __webpack_require__(0);
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


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var SystemSettings = __webpack_require__(16);

/**
 * @introduction
 * <h2>Finsemble Vaidate Functions</h2>
 * 
 */

/**
 * Constructor for Finsemble argment validator.
 *
 * Validatation logic is ONLY RAN when SystemSettings diagnotics level is set to debug (i.e. 4 or above)
 * A failed validation will generate a warning message, but nothing more; however application logic can check the validation results.
 *
 * @param {string} console Finsemble console object used to display messages and check diagnotic level 
 * @constructor
 */	
var Validate = function () {

	function warningMsg(paramDescript, thisArg, thisArgType) {

		function getErrorObject() {
			try { throw Error(''); } catch (err) { return err; }
		}

		var err = getErrorObject();

		var caller_line1 = err.stack.split("\n")[5];
		var index1 = caller_line1.indexOf("at ");
		var msgPart1 = caller_line1.slice(index1 + 2, caller_line1.length);

		var caller_line2 = err.stack.split("\n")[6];
		var index2 = caller_line2.indexOf("at ");
		var msgPart2 = caller_line2.slice(index2 + 2, caller_line2.length);

		console.warn("parameter validation failed: parameter " + paramDescript + " is of type '" + typeof (thisArg) + "' but should be of type '" + thisArgType + "' in" + msgPart1 + " called by" + msgPart2);
	}
	
	/**
	 * Confirm parameters are valid. A variable number of parameter pairs are supported. 
	 * @param {any} param1 is arg to validate
	 * @param {string} paramType1 is required type for parameter (if '=' suffix then parameter is optional). "any" represents any type (but not "undefined"). 
	 * @param {any=} param2 is next arg to validate
	 * @param {string=} paramType2 os required type for next arg 
	 * @return {boolean} returns turn if parameter list is valid; otherwise, false.
	 *
	 * @example
	 *
	 * var validate = new Validate(console); 
	 * validate.args(name, "string", age, "number")
	 *
	 * validate.args(topic, "string", initialState, "object="); // with optional paramter (represented by "=")
	 *
	 * validate.args(topic, "string", initialState, "any"); // with "any" type
	 *
	 * validate.args(subscribeIDStruct, "object") && validate.args(subscribeIDStruct.subscribeID, "string"); // only do second varidate if first test successful
	 *
	 * validate.args(subscribeIDStruct, "object", subscribeIDStruct.subscribeID, "string"); // only check second parm if first validated successful
	 *
	 * validate.args(topic, "any", initialState, "object=", params, "object="); // depending on logic, can break into seperate validations
	 * params = params || {}; 
	 * validate.args(params.subscribeCallback, "function=", params.publishCallback, "function=", params.unsubscribeCallback, "function=");
	 */
	this.args = function (param1, paramType1, param2, paramType2 /*.....optional more paramter pairs....*/) {
		var returnCode = true;
		if (SystemSettings.validationEnabled()) {
			var parmCount = arguments.length;
			if ((parmCount + 1) % 2 !== 0) { // parameters must come in pairs (i.e. even number)
				for (var i = 0; i < parmCount; i = i + 2) {
					var optionalArg = false;
					var thisArg = arguments[i];
					var thisArgType = arguments[i + 1];
					if (thisArgType.slice(-1) === "=") { // if last char is "=" then optional argument
						thisArgType = thisArgType.slice(0, -1);
						optionalArg = true;
					}
					if (typeof (thisArg) !== thisArgType) { // confirms basic case -- the required type
						if (!optionalArg || typeof (thisArg) !== "undefined") { // but optional parms can be undefined
							if (typeof (thisArg) === "undefined" || thisArgType !== "any") { // but "any" type doesn't have to match but can't be undefined
								var parameterPosition = (i / 2) + 1;
								warningMsg(parameterPosition, thisArg, thisArgType);
								returnCode = false;
								break;
							}
						}
					}
				}
			} else {
				console.warn("validate.args requires even number of parameters: " + JSON.stringify(arguments));
			}
		}
		return returnCode; // always return turn when validation is disable due debug lebel turned off 
	};

	/**
	 * Confirm parameters are valid. args2() has the same functionality as args() except a third "parameter description" is passed in for each argument varified
	 * Typically this for passing in a properties name for better diagnostic messages when varifying object properties.
	 * A variable number of parameter "triples"" are supported.
	 *
	 * @param {string} paramName1 is descriptive name of param1 (for diagnostic message)
	 * @param {any} param1 is arg to validate
	 * @param {string} paramType1 is required type for parameter (if '=' suffix then parameter is optional). "any" represents any type (but not "undefined").
	 * @param {string} paramName2 is descriptive name of param1 (for diagnostic message)
	 * @param {any} param2 is arg to validate
	 * @param {string} paramType2 is required type for parameter (if '=' suffix then parameter is optional). "any" represents any type (but not "undefined"). 
	 * @return {boolean} returns turn if parameter list is valid; otherwise, false.
	 *
	 * @example
	 *
	 * var validate = new Utils.Validate(console); 
	 * validate.args2("record.name", record.name, "string", "record.age", age, "number")
	 *
	 * // common case using args() and args2() together
	 * validate.args(topic, "any", initialState, "object=", params, "object=") &&
	 *   validate.args2("params.subscribeCallback", params.subscribeCallback, "function=", "params.publishCallback", params.publishCallback, "function=") &&
	 *   validate.args2("params.unsubscribeCallback", params.unsubscribeCallback, "function=");
	 */
	this.args2 = function (paramName1, param1, paramType1, paramName2, param2, paramType2 /*.....optional, more paramter sets of three....*/) {

		var returnCode = true;
		if (SystemSettings.validationEnabled()) {
			var parmCount = arguments.length;
			if ((parmCount + 1) % 3 !== 0) { // parameters must come in sets of three 
				for (var i = 0; i < parmCount; i = i + 3) {
					var optionalArg = false;
					var thisArgName = arguments[i];
					var thisArg = arguments[i + 1];
					var thisArgType = arguments[i + 2];
					if (thisArgType.slice(-1) === "=") { // if last char is "=" then optional argument
						thisArgType = thisArgType.slice(0, -1);
						optionalArg = true;
					}
					if (typeof (thisArg) !== thisArgType) { // confirms basic case -- the required type
						if (!optionalArg || typeof (thisArg) !== "undefined") { // but optional parms can be undefined
							if (typeof (thisArg) === "undefined" || thisArgType !== "any") { // but "any" type doesn't have to match but can't be undefined
								var parameterPosition = (i / 2) + 1;
								warningMsg(thisArgName, thisArg, thisArgType);
								returnCode = false;
								break;
							}
						}
					}
				}
			} else {
				console.warn("validate.args requires even number of parameters: " + JSON.stringify(arguments));
			}
		}
		return returnCode; // always return turn when validation is disable due debug lebel turned off 
	};
};

module.exports = new Validate();

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var Utils = __webpack_require__(1);
var RouterClient = __webpack_require__(10);
var Validate = __webpack_require__(2); // Finsemble args validator
var Logger = __webpack_require__(0);

/**
 * @introduction
 * <h2>Base Client</h2>
 * The Base Client is inherited by every client to provide common functionality to the clients. Clients communicate their status to each other through the Router and receive service status from the service manager. Once all dependecies are met, either client or service, the client's `onReady` method is fired.
 * @constructor
 * @param {Object} params
 * @param {Function} params.onReady - A function to be called after the client has initialized.
 * @param {String} params.name - The name of the client


 @example
	var BaseClient = require("./baseClient");
	var NewClient = function (params) {
		BaseClient.call(this, params);
		var self = this;

		return this;
	};

	var clientInstance = new NewClient({
		onReady: function (cb) {
			Logger.system.log("NewClient Online");
			cb();
		},
		name:"NewClient"
	});
	clientInstance.requiredServices = [REPLACE_THIS_ARRAY_WITH_DEPENENCIES];
	clientInstance.initialize();
	module.exports = clientInstance;
 */
var BaseClient = function (params) {
	Validate.args(params, "object=");
	var self = this;
	var status = "offline";
	var onReady;
	var initialized = false;

	if (params) {
		if (params.onReady) {
			onReady = params.onReady;
		}
		this.name = params.name;
	}

	/**
	 * Reference to the RouterClient
	 *  @type {Object}
	 */
	this.routerClient = RouterClient;

	/**
	 * Gets the current window
	 * @type {object}
	 */

	this.finWindow = null;
	/**
	 * Gets the cusrrent window name
	 *  @type {string}
	 */
	this.windowName = "";//The current window

	/**
	 * Services the are required to be online before the service can come online
	 *  @type {array}
	 */
	this.requiredServices = [];
	/**
	 * A list of online services
	 *  @type {arrays}
	 */
	this.onlineServices = {};
	/**
	 * Clients the are required to be online before the service can come online
	 *  @type {array}
	 */
	this.requiredClients = [];
	/**
	 * A list of online clients
	 *  @type {arrays}
	 */
	this.onlineClients = [];

	/**
	* This is where services are added to online list
	* @param {Array} services
	*/
	this.markServicesOnline = function (services) {
		Logger.system.debug("markServicesOnline", services);
		Validate.args(services, "any");
		if (!Array.isArray(services)) {
			services = [services];
		}

		for (var i = 0; i < services.length; i++) {
			Logger.system.info("Service Marked Online", services[i]);
			this.onlineServices[services[i]] = true;
		}
		this.checkRequiredServices();
	};

	this.addNeededServices = function (services) {
		Validate.args(services, "any");
		if (!services) { return; }
		if (!Array.isArray(services)) {
			services = [services];
		}
		for (var i = 0; i < services.length; i++) {
			if (this.requiredServices.indexOf(services[i]) === -1) {
				this.requiredServices.push(services[i]);
			}
		}
	};

	//Check to see if all required services are online
	this.checkRequiredServices = function () {
		for (var i = 0; i < this.requiredServices.length; i++) {
			if (this.requiredServices[i] in self.onlineServices) {
				Logger.system.debug("STARTUP", this.name, "Client Service Dependency Satisfied", this.requiredServices[i]);
				this.requiredServices.splice(i, 1);
				i--; // loop index has to be adjusted after delete
			}
		}
		this.checkOnline();
	};

	/**
	 * Queue of functions to process once the client goes online.
	 */
	this.clientReadyQueue = [];

	/**
	 * Iterates through the clientReadyQueue, invoking each call to `.ready`.
	 */
	this.processClientReadyQueue = function () {
		for (var i = 0; i < this.clientReadyQueue.length; i++) {
			let callback = this.clientReadyQueue[i];
			if (typeof callback === "function") {
				callback();
			}
		}
		this.clientReadyQueue = [];
	};

	/**
	 * Method for adding callbacks to each client.
	 */
	this.onReady = function (cb) {
		this.clientReadyQueue.push(cb);
		if (status === "online") {
			this.processClientReadyQueue();
		}
	};

	//Check to see if the client can come online. We check this against the required services and clients
	this.checkOnline = function () {
		var self = this;
		if (status !== "online") {
			if (this.requiredServices.length === 0 && this.requiredClients.length === 0) {
				status = "online";
				if (onReady) {
					onReady(function () {
						Logger.system.log("STARTUP: CLIENT ONLINE", self.name);
						self.processClientReadyQueue();
						self.routerClient.transmit(self.windowName + ".clientOnline", self.name);
					});
				} else {
					Logger.system.log("STARTUP: CLIENT ONLINE", self.name);
					self.processClientReadyQueue();
					self.routerClient.transmit(self.windowName + ".clientOnline", self.name);
				}
			} else {
				Logger.system.debug("STARTUP", this.name, "Required Services", this.requiredServices, "Required Clients", this.requiredClients);
			}
		}
	};
	//add a client/clients to the online list
	this.addClients = function (clients) {
		Validate.args(clients, "any");

		if (!clients) { return; }
		if (!Array.isArray(clients)) {
			clients = [clients];
		}
		for (var i = 0; i < clients.length; i++) {
			if (this.onlineClients.indexOf(clients[i]) === -1) {
				this.onlineClients.push(clients[i]);
			}
		}
		this.checkRequiredClients();
	};
	// checks to see if we have all of the required clients online.
	this.checkRequiredClients = function () {
		for (var i = 0; i < this.requiredClients.length; i++) {
			if (this.onlineClients.indexOf(this.requiredClients[i]) > -1) {
				Logger.system.debug("STARTUP", this.name, "Client Dependency Satisfied", this.requiredClients[i]);
				this.requiredClients.splice(i, 1);
				i--; // decrement because of splice to keep for loop correct
			}
		}
		this.checkOnline();
	};

	// setup listeners for services
	function setupListeners() {

		self.routerClient.query("Finsemble.ServiceManager.getActiveServices", {}, function (err, event) {
			self.markServicesOnline(event.data);
		});

		self.routerClient.addListener("Finsemble.serviceOnline", function (err, event) {
			self.markServicesOnline(event.data);
		});

		for (var i = 0; i < self.requiredClients.length; i++) {
			self.routerClient.query(self.windowName + "." + self.requiredClients[i] + ".status", {}, function (err, event) {
				if (err) { return; }
				if (!event.data) { return; }
				if (event.data.status === "online") { self.addClients(self.requiredClients[i]); }
			});
		}

		self.routerClient.addListener(self.windowName + ".clientOnline", function (err, event) {
			self.addClients(event.data);
		});
	}

	/**
	* Starts the process of checking services and any other function required before the client can come online
	*/
	this.initialize = function () {
		if (initialized) { return; }
		initialized = true;
		fin.desktop.main(function () {

			self.routerClient.onReady(function () {
				Logger.system.debug("Baseclient Init Router Ready", self.name);
				self.finWindow = fin.desktop.Window.getCurrent();
				self.windowName = self.finWindow.name;
				setupListeners();
				self.checkRequiredServices();
				self.checkRequiredClients();
			});
		});
	};

	this.onClose = function () {};

};

module.exports = BaseClient;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(setImmediate, process, global, module) {(function (global, factory) {
   true ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.async = global.async || {})));
}(this, (function (exports) { 'use strict';

function slice(arrayLike, start) {
    start = start|0;
    var newLen = Math.max(arrayLike.length - start, 0);
    var newArr = Array(newLen);
    for(var idx = 0; idx < newLen; idx++)  {
        newArr[idx] = arrayLike[start + idx];
    }
    return newArr;
}

var initialParams = function (fn) {
    return function (/*...args, callback*/) {
        var args = slice(arguments);
        var callback = args.pop();
        fn.call(this, args, callback);
    };
};

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var hasSetImmediate = typeof setImmediate === 'function' && setImmediate;
var hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

function fallback(fn) {
    setTimeout(fn, 0);
}

function wrap(defer) {
    return function (fn/*, ...args*/) {
        var args = slice(arguments, 1);
        defer(function () {
            fn.apply(null, args);
        });
    };
}

var _defer;

if (hasSetImmediate) {
    _defer = setImmediate;
} else if (hasNextTick) {
    _defer = process.nextTick;
} else {
    _defer = fallback;
}

var setImmediate$1 = wrap(_defer);

/**
 * Take a sync function and make it async, passing its return value to a
 * callback. This is useful for plugging sync functions into a waterfall,
 * series, or other async functions. Any arguments passed to the generated
 * function will be passed to the wrapped function (except for the final
 * callback argument). Errors thrown will be passed to the callback.
 *
 * If the function passed to `asyncify` returns a Promise, that promises's
 * resolved/rejected state will be used to call the callback, rather than simply
 * the synchronous return value.
 *
 * This also means you can asyncify ES2017 `async` functions.
 *
 * @name asyncify
 * @static
 * @memberOf module:Utils
 * @method
 * @alias wrapSync
 * @category Util
 * @param {Function} func - The synchronous function, or Promise-returning
 * function to convert to an {@link AsyncFunction}.
 * @returns {AsyncFunction} An asynchronous wrapper of the `func`. To be
 * invoked with `(args..., callback)`.
 * @example
 *
 * // passing a regular synchronous function
 * async.waterfall([
 *     async.apply(fs.readFile, filename, "utf8"),
 *     async.asyncify(JSON.parse),
 *     function (data, next) {
 *         // data is the result of parsing the text.
 *         // If there was a parsing error, it would have been caught.
 *     }
 * ], callback);
 *
 * // passing a function returning a promise
 * async.waterfall([
 *     async.apply(fs.readFile, filename, "utf8"),
 *     async.asyncify(function (contents) {
 *         return db.model.create(contents);
 *     }),
 *     function (model, next) {
 *         // `model` is the instantiated model object.
 *         // If there was an error, this function would be skipped.
 *     }
 * ], callback);
 *
 * // es2017 example, though `asyncify` is not needed if your JS environment
 * // supports async functions out of the box
 * var q = async.queue(async.asyncify(async function(file) {
 *     var intermediateStep = await processFile(file);
 *     return await somePromise(intermediateStep)
 * }));
 *
 * q.push(files);
 */
function asyncify(func) {
    return initialParams(function (args, callback) {
        var result;
        try {
            result = func.apply(this, args);
        } catch (e) {
            return callback(e);
        }
        // if result is Promise object
        if (isObject(result) && typeof result.then === 'function') {
            result.then(function(value) {
                invokeCallback(callback, null, value);
            }, function(err) {
                invokeCallback(callback, err.message ? err : new Error(err));
            });
        } else {
            callback(null, result);
        }
    });
}

function invokeCallback(callback, error, value) {
    try {
        callback(error, value);
    } catch (e) {
        setImmediate$1(rethrow, e);
    }
}

function rethrow(error) {
    throw error;
}

var supportsSymbol = typeof Symbol === 'function';

function isAsync(fn) {
    return supportsSymbol && fn[Symbol.toStringTag] === 'AsyncFunction';
}

function wrapAsync(asyncFn) {
    return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
}

function applyEach$1(eachfn) {
    return function(fns/*, ...args*/) {
        var args = slice(arguments, 1);
        var go = initialParams(function(args, callback) {
            var that = this;
            return eachfn(fns, function (fn, cb) {
                wrapAsync(fn).apply(that, args.concat(cb));
            }, callback);
        });
        if (args.length) {
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
}

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Built-in value references. */
var Symbol$1 = root.Symbol;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

/** `Object#toString` result references. */
var nullTag = '[object Null]';
var undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  value = Object(value);
  return (symToStringTag && symToStringTag in value)
    ? getRawTag(value)
    : objectToString(value);
}

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]';
var funcTag = '[object Function]';
var genTag = '[object GeneratorFunction]';
var proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

// A temporary value used to identify if the loop should be broken.
// See #1064, #1293
var breakLoop = {};

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

function once(fn) {
    return function () {
        if (fn === null) return;
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}

var iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator;

var getIterator = function (coll) {
    return iteratorSymbol && coll[iteratorSymbol] && coll[iteratorSymbol]();
};

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty$2.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER$1 = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER$1 : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]';
var arrayTag = '[object Array]';
var boolTag = '[object Boolean]';
var dateTag = '[object Date]';
var errorTag = '[object Error]';
var funcTag$1 = '[object Function]';
var mapTag = '[object Map]';
var numberTag = '[object Number]';
var objectTag = '[object Object]';
var regexpTag = '[object RegExp]';
var setTag = '[object Set]';
var stringTag = '[object String]';
var weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]';
var dataViewTag = '[object DataView]';
var float32Tag = '[object Float32Array]';
var float64Tag = '[object Float64Array]';
var int8Tag = '[object Int8Array]';
var int16Tag = '[object Int16Array]';
var int32Tag = '[object Int32Array]';
var uint8Tag = '[object Uint8Array]';
var uint8ClampedTag = '[object Uint8ClampedArray]';
var uint16Tag = '[object Uint16Array]';
var uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/** Detect free variable `exports`. */
var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports$1 && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$1.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$5;

  return value === proto;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$3.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

function createArrayIterator(coll) {
    var i = -1;
    var len = coll.length;
    return function next() {
        return ++i < len ? {value: coll[i], key: i} : null;
    }
}

function createES2015Iterator(iterator) {
    var i = -1;
    return function next() {
        var item = iterator.next();
        if (item.done)
            return null;
        i++;
        return {value: item.value, key: i};
    }
}

function createObjectIterator(obj) {
    var okeys = keys(obj);
    var i = -1;
    var len = okeys.length;
    return function next() {
        var key = okeys[++i];
        return i < len ? {value: obj[key], key: key} : null;
    };
}

function iterator(coll) {
    if (isArrayLike(coll)) {
        return createArrayIterator(coll);
    }

    var iterator = getIterator(coll);
    return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
}

function onlyOnce(fn) {
    return function() {
        if (fn === null) throw new Error("Callback was already called.");
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}

function _eachOfLimit(limit) {
    return function (obj, iteratee, callback) {
        callback = once(callback || noop);
        if (limit <= 0 || !obj) {
            return callback(null);
        }
        var nextElem = iterator(obj);
        var done = false;
        var running = 0;

        function iterateeCallback(err, value) {
            running -= 1;
            if (err) {
                done = true;
                callback(err);
            }
            else if (value === breakLoop || (done && running <= 0)) {
                done = true;
                return callback(null);
            }
            else {
                replenish();
            }
        }

        function replenish () {
            while (running < limit && !done) {
                var elem = nextElem();
                if (elem === null) {
                    done = true;
                    if (running <= 0) {
                        callback(null);
                    }
                    return;
                }
                running += 1;
                iteratee(elem.value, elem.key, onlyOnce(iterateeCallback));
            }
        }

        replenish();
    };
}

/**
 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name eachOfLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.eachOf]{@link module:Collections.eachOf}
 * @alias forEachOfLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each
 * item in `coll`. The `key` is the item's key, or index in the case of an
 * array.
 * Invoked with (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
function eachOfLimit(coll, limit, iteratee, callback) {
    _eachOfLimit(limit)(coll, wrapAsync(iteratee), callback);
}

function doLimit(fn, limit) {
    return function (iterable, iteratee, callback) {
        return fn(iterable, limit, iteratee, callback);
    };
}

// eachOf implementation optimized for array-likes
function eachOfArrayLike(coll, iteratee, callback) {
    callback = once(callback || noop);
    var index = 0,
        completed = 0,
        length = coll.length;
    if (length === 0) {
        callback(null);
    }

    function iteratorCallback(err, value) {
        if (err) {
            callback(err);
        } else if ((++completed === length) || value === breakLoop) {
            callback(null);
        }
    }

    for (; index < length; index++) {
        iteratee(coll[index], index, onlyOnce(iteratorCallback));
    }
}

// a generic version of eachOf which can handle array, object, and iterator cases.
var eachOfGeneric = doLimit(eachOfLimit, Infinity);

/**
 * Like [`each`]{@link module:Collections.each}, except that it passes the key (or index) as the second argument
 * to the iteratee.
 *
 * @name eachOf
 * @static
 * @memberOf module:Collections
 * @method
 * @alias forEachOf
 * @category Collection
 * @see [async.each]{@link module:Collections.each}
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each
 * item in `coll`.
 * The `key` is the item's key, or index in the case of an array.
 * Invoked with (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 * @example
 *
 * var obj = {dev: "/dev.json", test: "/test.json", prod: "/prod.json"};
 * var configs = {};
 *
 * async.forEachOf(obj, function (value, key, callback) {
 *     fs.readFile(__dirname + value, "utf8", function (err, data) {
 *         if (err) return callback(err);
 *         try {
 *             configs[key] = JSON.parse(data);
 *         } catch (e) {
 *             return callback(e);
 *         }
 *         callback();
 *     });
 * }, function (err) {
 *     if (err) console.error(err.message);
 *     // configs is now a map of JSON data
 *     doSomethingWith(configs);
 * });
 */
var eachOf = function(coll, iteratee, callback) {
    var eachOfImplementation = isArrayLike(coll) ? eachOfArrayLike : eachOfGeneric;
    eachOfImplementation(coll, wrapAsync(iteratee), callback);
};

function doParallel(fn) {
    return function (obj, iteratee, callback) {
        return fn(eachOf, obj, wrapAsync(iteratee), callback);
    };
}

function _asyncMap(eachfn, arr, iteratee, callback) {
    callback = callback || noop;
    arr = arr || [];
    var results = [];
    var counter = 0;
    var _iteratee = wrapAsync(iteratee);

    eachfn(arr, function (value, _, callback) {
        var index = counter++;
        _iteratee(value, function (err, v) {
            results[index] = v;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}

/**
 * Produces a new collection of values by mapping each value in `coll` through
 * the `iteratee` function. The `iteratee` is called with an item from `coll`
 * and a callback for when it has finished processing. Each of these callback
 * takes 2 arguments: an `error`, and the transformed item from `coll`. If
 * `iteratee` passes an error to its callback, the main `callback` (for the
 * `map` function) is immediately called with the error.
 *
 * Note, that since this function applies the `iteratee` to each item in
 * parallel, there is no guarantee that the `iteratee` functions will complete
 * in order. However, the results array will be in the same order as the
 * original `coll`.
 *
 * If `map` is passed an Object, the results will be an Array.  The results
 * will roughly be in the order of the original Objects' keys (but this can
 * vary across JavaScript engines).
 *
 * @name map
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with the transformed item.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an Array of the
 * transformed items from the `coll`. Invoked with (err, results).
 * @example
 *
 * async.map(['file1','file2','file3'], fs.stat, function(err, results) {
 *     // results is now an array of stats for each file
 * });
 */
var map = doParallel(_asyncMap);

/**
 * Applies the provided arguments to each function in the array, calling
 * `callback` after all functions have completed. If you only provide the first
 * argument, `fns`, then it will return a function which lets you pass in the
 * arguments as if it were a single function call. If more arguments are
 * provided, `callback` is required while `args` is still optional.
 *
 * @name applyEach
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} fns - A collection of {@link AsyncFunction}s
 * to all call with the same arguments
 * @param {...*} [args] - any number of separate arguments to pass to the
 * function.
 * @param {Function} [callback] - the final argument should be the callback,
 * called when all functions have completed processing.
 * @returns {Function} - If only the first argument, `fns`, is provided, it will
 * return a function which lets you pass in the arguments as if it were a single
 * function call. The signature is `(..args, callback)`. If invoked with any
 * arguments, `callback` is required.
 * @example
 *
 * async.applyEach([enableSearch, updateSchema], 'bucket', callback);
 *
 * // partial application example:
 * async.each(
 *     buckets,
 *     async.applyEach([enableSearch, updateSchema]),
 *     callback
 * );
 */
var applyEach = applyEach$1(map);

function doParallelLimit(fn) {
    return function (obj, limit, iteratee, callback) {
        return fn(_eachOfLimit(limit), obj, wrapAsync(iteratee), callback);
    };
}

/**
 * The same as [`map`]{@link module:Collections.map} but runs a maximum of `limit` async operations at a time.
 *
 * @name mapLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with the transformed item.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an array of the
 * transformed items from the `coll`. Invoked with (err, results).
 */
var mapLimit = doParallelLimit(_asyncMap);

/**
 * The same as [`map`]{@link module:Collections.map} but runs only a single async operation at a time.
 *
 * @name mapSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with the transformed item.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an array of the
 * transformed items from the `coll`. Invoked with (err, results).
 */
var mapSeries = doLimit(mapLimit, 1);

/**
 * The same as [`applyEach`]{@link module:ControlFlow.applyEach} but runs only a single async operation at a time.
 *
 * @name applyEachSeries
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.applyEach]{@link module:ControlFlow.applyEach}
 * @category Control Flow
 * @param {Array|Iterable|Object} fns - A collection of {@link AsyncFunction}s to all
 * call with the same arguments
 * @param {...*} [args] - any number of separate arguments to pass to the
 * function.
 * @param {Function} [callback] - the final argument should be the callback,
 * called when all functions have completed processing.
 * @returns {Function} - If only the first argument is provided, it will return
 * a function which lets you pass in the arguments as if it were a single
 * function call.
 */
var applyEachSeries = applyEach$1(mapSeries);

/**
 * Creates a continuation function with some arguments already applied.
 *
 * Useful as a shorthand when combined with other control flow functions. Any
 * arguments passed to the returned function are added to the arguments
 * originally passed to apply.
 *
 * @name apply
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {Function} fn - The function you want to eventually apply all
 * arguments to. Invokes with (arguments...).
 * @param {...*} arguments... - Any number of arguments to automatically apply
 * when the continuation is called.
 * @returns {Function} the partially-applied function
 * @example
 *
 * // using apply
 * async.parallel([
 *     async.apply(fs.writeFile, 'testfile1', 'test1'),
 *     async.apply(fs.writeFile, 'testfile2', 'test2')
 * ]);
 *
 *
 * // the same process without using apply
 * async.parallel([
 *     function(callback) {
 *         fs.writeFile('testfile1', 'test1', callback);
 *     },
 *     function(callback) {
 *         fs.writeFile('testfile2', 'test2', callback);
 *     }
 * ]);
 *
 * // It's possible to pass any number of additional arguments when calling the
 * // continuation:
 *
 * node> var fn = async.apply(sys.puts, 'one');
 * node> fn('two', 'three');
 * one
 * two
 * three
 */
var apply = function(fn/*, ...args*/) {
    var args = slice(arguments, 1);
    return function(/*callArgs*/) {
        var callArgs = slice(arguments);
        return fn.apply(null, args.concat(callArgs));
    };
};

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? strictIndexOf(array, value, fromIndex)
    : baseFindIndex(array, baseIsNaN, fromIndex);
}

/**
 * Determines the best order for running the {@link AsyncFunction}s in `tasks`, based on
 * their requirements. Each function can optionally depend on other functions
 * being completed first, and each function is run as soon as its requirements
 * are satisfied.
 *
 * If any of the {@link AsyncFunction}s pass an error to their callback, the `auto` sequence
 * will stop. Further tasks will not execute (so any other functions depending
 * on it will not run), and the main `callback` is immediately called with the
 * error.
 *
 * {@link AsyncFunction}s also receive an object containing the results of functions which
 * have completed so far as the first argument, if they have dependencies. If a
 * task function has no dependencies, it will only be passed a callback.
 *
 * @name auto
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Object} tasks - An object. Each of its properties is either a
 * function or an array of requirements, with the {@link AsyncFunction} itself the last item
 * in the array. The object's key of a property serves as the name of the task
 * defined by that property, i.e. can be used when specifying requirements for
 * other tasks. The function receives one or two arguments:
 * * a `results` object, containing the results of the previously executed
 *   functions, only passed if the task has any dependencies,
 * * a `callback(err, result)` function, which must be called when finished,
 *   passing an `error` (which can be `null`) and the result of the function's
 *   execution.
 * @param {number} [concurrency=Infinity] - An optional `integer` for
 * determining the maximum number of tasks that can be run in parallel. By
 * default, as many as possible.
 * @param {Function} [callback] - An optional callback which is called when all
 * the tasks have been completed. It receives the `err` argument if any `tasks`
 * pass an error to their callback. Results are always returned; however, if an
 * error occurs, no further `tasks` will be performed, and the results object
 * will only contain partial results. Invoked with (err, results).
 * @returns undefined
 * @example
 *
 * async.auto({
 *     // this function will just be passed a callback
 *     readData: async.apply(fs.readFile, 'data.txt', 'utf-8'),
 *     showData: ['readData', function(results, cb) {
 *         // results.readData is the file's contents
 *         // ...
 *     }]
 * }, callback);
 *
 * async.auto({
 *     get_data: function(callback) {
 *         console.log('in get_data');
 *         // async code to get some data
 *         callback(null, 'data', 'converted to array');
 *     },
 *     make_folder: function(callback) {
 *         console.log('in make_folder');
 *         // async code to create a directory to store a file in
 *         // this is run at the same time as getting the data
 *         callback(null, 'folder');
 *     },
 *     write_file: ['get_data', 'make_folder', function(results, callback) {
 *         console.log('in write_file', JSON.stringify(results));
 *         // once there is some data and the directory exists,
 *         // write the data to a file in the directory
 *         callback(null, 'filename');
 *     }],
 *     email_link: ['write_file', function(results, callback) {
 *         console.log('in email_link', JSON.stringify(results));
 *         // once the file is written let's email a link to it...
 *         // results.write_file contains the filename returned by write_file.
 *         callback(null, {'file':results.write_file, 'email':'user@example.com'});
 *     }]
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('results = ', results);
 * });
 */
var auto = function (tasks, concurrency, callback) {
    if (typeof concurrency === 'function') {
        // concurrency is optional, shift the args.
        callback = concurrency;
        concurrency = null;
    }
    callback = once(callback || noop);
    var keys$$1 = keys(tasks);
    var numTasks = keys$$1.length;
    if (!numTasks) {
        return callback(null);
    }
    if (!concurrency) {
        concurrency = numTasks;
    }

    var results = {};
    var runningTasks = 0;
    var hasError = false;

    var listeners = Object.create(null);

    var readyTasks = [];

    // for cycle detection:
    var readyToCheck = []; // tasks that have been identified as reachable
    // without the possibility of returning to an ancestor task
    var uncheckedDependencies = {};

    baseForOwn(tasks, function (task, key) {
        if (!isArray(task)) {
            // no dependencies
            enqueueTask(key, [task]);
            readyToCheck.push(key);
            return;
        }

        var dependencies = task.slice(0, task.length - 1);
        var remainingDependencies = dependencies.length;
        if (remainingDependencies === 0) {
            enqueueTask(key, task);
            readyToCheck.push(key);
            return;
        }
        uncheckedDependencies[key] = remainingDependencies;

        arrayEach(dependencies, function (dependencyName) {
            if (!tasks[dependencyName]) {
                throw new Error('async.auto task `' + key +
                    '` has a non-existent dependency `' +
                    dependencyName + '` in ' +
                    dependencies.join(', '));
            }
            addListener(dependencyName, function () {
                remainingDependencies--;
                if (remainingDependencies === 0) {
                    enqueueTask(key, task);
                }
            });
        });
    });

    checkForDeadlocks();
    processQueue();

    function enqueueTask(key, task) {
        readyTasks.push(function () {
            runTask(key, task);
        });
    }

    function processQueue() {
        if (readyTasks.length === 0 && runningTasks === 0) {
            return callback(null, results);
        }
        while(readyTasks.length && runningTasks < concurrency) {
            var run = readyTasks.shift();
            run();
        }

    }

    function addListener(taskName, fn) {
        var taskListeners = listeners[taskName];
        if (!taskListeners) {
            taskListeners = listeners[taskName] = [];
        }

        taskListeners.push(fn);
    }

    function taskComplete(taskName) {
        var taskListeners = listeners[taskName] || [];
        arrayEach(taskListeners, function (fn) {
            fn();
        });
        processQueue();
    }


    function runTask(key, task) {
        if (hasError) return;

        var taskCallback = onlyOnce(function(err, result) {
            runningTasks--;
            if (arguments.length > 2) {
                result = slice(arguments, 1);
            }
            if (err) {
                var safeResults = {};
                baseForOwn(results, function(val, rkey) {
                    safeResults[rkey] = val;
                });
                safeResults[key] = result;
                hasError = true;
                listeners = Object.create(null);

                callback(err, safeResults);
            } else {
                results[key] = result;
                taskComplete(key);
            }
        });

        runningTasks++;
        var taskFn = wrapAsync(task[task.length - 1]);
        if (task.length > 1) {
            taskFn(results, taskCallback);
        } else {
            taskFn(taskCallback);
        }
    }

    function checkForDeadlocks() {
        // Kahn's algorithm
        // https://en.wikipedia.org/wiki/Topological_sorting#Kahn.27s_algorithm
        // http://connalle.blogspot.com/2013/10/topological-sortingkahn-algorithm.html
        var currentTask;
        var counter = 0;
        while (readyToCheck.length) {
            currentTask = readyToCheck.pop();
            counter++;
            arrayEach(getDependents(currentTask), function (dependent) {
                if (--uncheckedDependencies[dependent] === 0) {
                    readyToCheck.push(dependent);
                }
            });
        }

        if (counter !== numTasks) {
            throw new Error(
                'async.auto cannot execute tasks due to a recursive dependency'
            );
        }
    }

    function getDependents(taskName) {
        var result = [];
        baseForOwn(tasks, function (task, key) {
            if (isArray(task) && baseIndexOf(task, taskName, 0) >= 0) {
                result.push(key);
            }
        });
        return result;
    }
};

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined;
var symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

/**
 * Casts `array` to a slice if it's needed.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {number} start The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the cast slice.
 */
function castSlice(array, start, end) {
  var length = array.length;
  end = end === undefined ? length : end;
  return (!start && end >= length) ? array : baseSlice(array, start, end);
}

/**
 * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
 * that is not found in the character symbols.
 *
 * @private
 * @param {Array} strSymbols The string symbols to inspect.
 * @param {Array} chrSymbols The character symbols to find.
 * @returns {number} Returns the index of the last unmatched string symbol.
 */
function charsEndIndex(strSymbols, chrSymbols) {
  var index = strSymbols.length;

  while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
  return index;
}

/**
 * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
 * that is not found in the character symbols.
 *
 * @private
 * @param {Array} strSymbols The string symbols to inspect.
 * @param {Array} chrSymbols The character symbols to find.
 * @returns {number} Returns the index of the first unmatched string symbol.
 */
function charsStartIndex(strSymbols, chrSymbols) {
  var index = -1,
      length = strSymbols.length;

  while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
  return index;
}

/**
 * Converts an ASCII `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function asciiToArray(string) {
  return string.split('');
}

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff';
var rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23';
var rsComboSymbolsRange = '\\u20d0-\\u20f0';
var rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsZWJ = '\\u200d';

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + ']');

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode(string) {
  return reHasUnicode.test(string);
}

/** Used to compose unicode character classes. */
var rsAstralRange$1 = '\\ud800-\\udfff';
var rsComboMarksRange$1 = '\\u0300-\\u036f\\ufe20-\\ufe23';
var rsComboSymbolsRange$1 = '\\u20d0-\\u20f0';
var rsVarRange$1 = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange$1 + ']';
var rsCombo = '[' + rsComboMarksRange$1 + rsComboSymbolsRange$1 + ']';
var rsFitz = '\\ud83c[\\udffb-\\udfff]';
var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
var rsNonAstral = '[^' + rsAstralRange$1 + ']';
var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
var rsZWJ$1 = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?';
var rsOptVar = '[' + rsVarRange$1 + ']?';
var rsOptJoin = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/**
 * Converts a Unicode `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}

/**
 * Converts `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function stringToArray(string) {
  return hasUnicode(string)
    ? unicodeToArray(string)
    : asciiToArray(string);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/**
 * Removes leading and trailing whitespace or specified characters from `string`.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to trim.
 * @param {string} [chars=whitespace] The characters to trim.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {string} Returns the trimmed string.
 * @example
 *
 * _.trim('  abc  ');
 * // => 'abc'
 *
 * _.trim('-_-abc-_-', '_-');
 * // => 'abc'
 *
 * _.map(['  foo  ', '  bar  '], _.trim);
 * // => ['foo', 'bar']
 */
function trim(string, chars, guard) {
  string = toString(string);
  if (string && (guard || chars === undefined)) {
    return string.replace(reTrim, '');
  }
  if (!string || !(chars = baseToString(chars))) {
    return string;
  }
  var strSymbols = stringToArray(string),
      chrSymbols = stringToArray(chars),
      start = charsStartIndex(strSymbols, chrSymbols),
      end = charsEndIndex(strSymbols, chrSymbols) + 1;

  return castSlice(strSymbols, start, end).join('');
}

var FN_ARGS = /^(?:async\s+)?(function)?\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /(=.+)?(\s*)$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

function parseParams(func) {
    func = func.toString().replace(STRIP_COMMENTS, '');
    func = func.match(FN_ARGS)[2].replace(' ', '');
    func = func ? func.split(FN_ARG_SPLIT) : [];
    func = func.map(function (arg){
        return trim(arg.replace(FN_ARG, ''));
    });
    return func;
}

/**
 * A dependency-injected version of the [async.auto]{@link module:ControlFlow.auto} function. Dependent
 * tasks are specified as parameters to the function, after the usual callback
 * parameter, with the parameter names matching the names of the tasks it
 * depends on. This can provide even more readable task graphs which can be
 * easier to maintain.
 *
 * If a final callback is specified, the task results are similarly injected,
 * specified as named parameters after the initial error parameter.
 *
 * The autoInject function is purely syntactic sugar and its semantics are
 * otherwise equivalent to [async.auto]{@link module:ControlFlow.auto}.
 *
 * @name autoInject
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.auto]{@link module:ControlFlow.auto}
 * @category Control Flow
 * @param {Object} tasks - An object, each of whose properties is an {@link AsyncFunction} of
 * the form 'func([dependencies...], callback). The object's key of a property
 * serves as the name of the task defined by that property, i.e. can be used
 * when specifying requirements for other tasks.
 * * The `callback` parameter is a `callback(err, result)` which must be called
 *   when finished, passing an `error` (which can be `null`) and the result of
 *   the function's execution. The remaining parameters name other tasks on
 *   which the task is dependent, and the results from those tasks are the
 *   arguments of those parameters.
 * @param {Function} [callback] - An optional callback which is called when all
 * the tasks have been completed. It receives the `err` argument if any `tasks`
 * pass an error to their callback, and a `results` object with any completed
 * task results, similar to `auto`.
 * @example
 *
 * //  The example from `auto` can be rewritten as follows:
 * async.autoInject({
 *     get_data: function(callback) {
 *         // async code to get some data
 *         callback(null, 'data', 'converted to array');
 *     },
 *     make_folder: function(callback) {
 *         // async code to create a directory to store a file in
 *         // this is run at the same time as getting the data
 *         callback(null, 'folder');
 *     },
 *     write_file: function(get_data, make_folder, callback) {
 *         // once there is some data and the directory exists,
 *         // write the data to a file in the directory
 *         callback(null, 'filename');
 *     },
 *     email_link: function(write_file, callback) {
 *         // once the file is written let's email a link to it...
 *         // write_file contains the filename returned by write_file.
 *         callback(null, {'file':write_file, 'email':'user@example.com'});
 *     }
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('email_link = ', results.email_link);
 * });
 *
 * // If you are using a JS minifier that mangles parameter names, `autoInject`
 * // will not work with plain functions, since the parameter names will be
 * // collapsed to a single letter identifier.  To work around this, you can
 * // explicitly specify the names of the parameters your task function needs
 * // in an array, similar to Angular.js dependency injection.
 *
 * // This still has an advantage over plain `auto`, since the results a task
 * // depends on are still spread into arguments.
 * async.autoInject({
 *     //...
 *     write_file: ['get_data', 'make_folder', function(get_data, make_folder, callback) {
 *         callback(null, 'filename');
 *     }],
 *     email_link: ['write_file', function(write_file, callback) {
 *         callback(null, {'file':write_file, 'email':'user@example.com'});
 *     }]
 *     //...
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('email_link = ', results.email_link);
 * });
 */
function autoInject(tasks, callback) {
    var newTasks = {};

    baseForOwn(tasks, function (taskFn, key) {
        var params;
        var fnIsAsync = isAsync(taskFn);
        var hasNoDeps =
            (!fnIsAsync && taskFn.length === 1) ||
            (fnIsAsync && taskFn.length === 0);

        if (isArray(taskFn)) {
            params = taskFn.slice(0, -1);
            taskFn = taskFn[taskFn.length - 1];

            newTasks[key] = params.concat(params.length > 0 ? newTask : taskFn);
        } else if (hasNoDeps) {
            // no dependencies, use the function as-is
            newTasks[key] = taskFn;
        } else {
            params = parseParams(taskFn);
            if (taskFn.length === 0 && !fnIsAsync && params.length === 0) {
                throw new Error("autoInject task functions require explicit parameters.");
            }

            // remove callback param
            if (!fnIsAsync) params.pop();

            newTasks[key] = params.concat(newTask);
        }

        function newTask(results, taskCb) {
            var newArgs = arrayMap(params, function (name) {
                return results[name];
            });
            newArgs.push(taskCb);
            wrapAsync(taskFn).apply(null, newArgs);
        }
    });

    auto(newTasks, callback);
}

// Simple doubly linked list (https://en.wikipedia.org/wiki/Doubly_linked_list) implementation
// used for queues. This implementation assumes that the node provided by the user can be modified
// to adjust the next and last properties. We implement only the minimal functionality
// for queue support.
function DLL() {
    this.head = this.tail = null;
    this.length = 0;
}

function setInitial(dll, node) {
    dll.length = 1;
    dll.head = dll.tail = node;
}

DLL.prototype.removeLink = function(node) {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;

    node.prev = node.next = null;
    this.length -= 1;
    return node;
};

DLL.prototype.empty = function () {
    while(this.head) this.shift();
    return this;
};

DLL.prototype.insertAfter = function(node, newNode) {
    newNode.prev = node;
    newNode.next = node.next;
    if (node.next) node.next.prev = newNode;
    else this.tail = newNode;
    node.next = newNode;
    this.length += 1;
};

DLL.prototype.insertBefore = function(node, newNode) {
    newNode.prev = node.prev;
    newNode.next = node;
    if (node.prev) node.prev.next = newNode;
    else this.head = newNode;
    node.prev = newNode;
    this.length += 1;
};

DLL.prototype.unshift = function(node) {
    if (this.head) this.insertBefore(this.head, node);
    else setInitial(this, node);
};

DLL.prototype.push = function(node) {
    if (this.tail) this.insertAfter(this.tail, node);
    else setInitial(this, node);
};

DLL.prototype.shift = function() {
    return this.head && this.removeLink(this.head);
};

DLL.prototype.pop = function() {
    return this.tail && this.removeLink(this.tail);
};

DLL.prototype.toArray = function () {
    var arr = Array(this.length);
    var curr = this.head;
    for(var idx = 0; idx < this.length; idx++) {
        arr[idx] = curr.data;
        curr = curr.next;
    }
    return arr;
};

DLL.prototype.remove = function (testFn) {
    var curr = this.head;
    while(!!curr) {
        var next = curr.next;
        if (testFn(curr)) {
            this.removeLink(curr);
        }
        curr = next;
    }
    return this;
};

function queue(worker, concurrency, payload) {
    if (concurrency == null) {
        concurrency = 1;
    }
    else if(concurrency === 0) {
        throw new Error('Concurrency must not be zero');
    }

    var _worker = wrapAsync(worker);
    var numRunning = 0;
    var workersList = [];

    function _insert(data, insertAtFront, callback) {
        if (callback != null && typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
            data = [data];
        }
        if (data.length === 0 && q.idle()) {
            // call drain immediately if there are no tasks
            return setImmediate$1(function() {
                q.drain();
            });
        }

        for (var i = 0, l = data.length; i < l; i++) {
            var item = {
                data: data[i],
                callback: callback || noop
            };

            if (insertAtFront) {
                q._tasks.unshift(item);
            } else {
                q._tasks.push(item);
            }
        }
        setImmediate$1(q.process);
    }

    function _next(tasks) {
        return function(err){
            numRunning -= 1;

            for (var i = 0, l = tasks.length; i < l; i++) {
                var task = tasks[i];

                var index = baseIndexOf(workersList, task, 0);
                if (index >= 0) {
                    workersList.splice(index, 1);
                }

                task.callback.apply(task, arguments);

                if (err != null) {
                    q.error(err, task.data);
                }
            }

            if (numRunning <= (q.concurrency - q.buffer) ) {
                q.unsaturated();
            }

            if (q.idle()) {
                q.drain();
            }
            q.process();
        };
    }

    var isProcessing = false;
    var q = {
        _tasks: new DLL(),
        concurrency: concurrency,
        payload: payload,
        saturated: noop,
        unsaturated:noop,
        buffer: concurrency / 4,
        empty: noop,
        drain: noop,
        error: noop,
        started: false,
        paused: false,
        push: function (data, callback) {
            _insert(data, false, callback);
        },
        kill: function () {
            q.drain = noop;
            q._tasks.empty();
        },
        unshift: function (data, callback) {
            _insert(data, true, callback);
        },
        remove: function (testFn) {
            q._tasks.remove(testFn);
        },
        process: function () {
            // Avoid trying to start too many processing operations. This can occur
            // when callbacks resolve synchronously (#1267).
            if (isProcessing) {
                return;
            }
            isProcessing = true;
            while(!q.paused && numRunning < q.concurrency && q._tasks.length){
                var tasks = [], data = [];
                var l = q._tasks.length;
                if (q.payload) l = Math.min(l, q.payload);
                for (var i = 0; i < l; i++) {
                    var node = q._tasks.shift();
                    tasks.push(node);
                    workersList.push(node);
                    data.push(node.data);
                }

                numRunning += 1;

                if (q._tasks.length === 0) {
                    q.empty();
                }

                if (numRunning === q.concurrency) {
                    q.saturated();
                }

                var cb = onlyOnce(_next(tasks));
                _worker(data, cb);
            }
            isProcessing = false;
        },
        length: function () {
            return q._tasks.length;
        },
        running: function () {
            return numRunning;
        },
        workersList: function () {
            return workersList;
        },
        idle: function() {
            return q._tasks.length + numRunning === 0;
        },
        pause: function () {
            q.paused = true;
        },
        resume: function () {
            if (q.paused === false) { return; }
            q.paused = false;
            setImmediate$1(q.process);
        }
    };
    return q;
}

/**
 * A cargo of tasks for the worker function to complete. Cargo inherits all of
 * the same methods and event callbacks as [`queue`]{@link module:ControlFlow.queue}.
 * @typedef {Object} CargoObject
 * @memberOf module:ControlFlow
 * @property {Function} length - A function returning the number of items
 * waiting to be processed. Invoke like `cargo.length()`.
 * @property {number} payload - An `integer` for determining how many tasks
 * should be process per round. This property can be changed after a `cargo` is
 * created to alter the payload on-the-fly.
 * @property {Function} push - Adds `task` to the `queue`. The callback is
 * called once the `worker` has finished processing the task. Instead of a
 * single task, an array of `tasks` can be submitted. The respective callback is
 * used for every task in the list. Invoke like `cargo.push(task, [callback])`.
 * @property {Function} saturated - A callback that is called when the
 * `queue.length()` hits the concurrency and further tasks will be queued.
 * @property {Function} empty - A callback that is called when the last item
 * from the `queue` is given to a `worker`.
 * @property {Function} drain - A callback that is called when the last item
 * from the `queue` has returned from the `worker`.
 * @property {Function} idle - a function returning false if there are items
 * waiting or being processed, or true if not. Invoke like `cargo.idle()`.
 * @property {Function} pause - a function that pauses the processing of tasks
 * until `resume()` is called. Invoke like `cargo.pause()`.
 * @property {Function} resume - a function that resumes the processing of
 * queued tasks when the queue is paused. Invoke like `cargo.resume()`.
 * @property {Function} kill - a function that removes the `drain` callback and
 * empties remaining tasks from the queue forcing it to go idle. Invoke like `cargo.kill()`.
 */

/**
 * Creates a `cargo` object with the specified payload. Tasks added to the
 * cargo will be processed altogether (up to the `payload` limit). If the
 * `worker` is in progress, the task is queued until it becomes available. Once
 * the `worker` has completed some tasks, each callback of those tasks is
 * called. Check out [these](https://camo.githubusercontent.com/6bbd36f4cf5b35a0f11a96dcd2e97711ffc2fb37/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130382f62626330636662302d356632392d313165322d393734662d3333393763363464633835382e676966) [animations](https://camo.githubusercontent.com/f4810e00e1c5f5f8addbe3e9f49064fd5d102699/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130312f38346339323036362d356632392d313165322d383134662d3964336430323431336266642e676966)
 * for how `cargo` and `queue` work.
 *
 * While [`queue`]{@link module:ControlFlow.queue} passes only one task to one of a group of workers
 * at a time, cargo passes an array of tasks to a single worker, repeating
 * when the worker is finished.
 *
 * @name cargo
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.queue]{@link module:ControlFlow.queue}
 * @category Control Flow
 * @param {AsyncFunction} worker - An asynchronous function for processing an array
 * of queued tasks. Invoked with `(tasks, callback)`.
 * @param {number} [payload=Infinity] - An optional `integer` for determining
 * how many tasks should be processed per round; if omitted, the default is
 * unlimited.
 * @returns {module:ControlFlow.CargoObject} A cargo object to manage the tasks. Callbacks can
 * attached as certain properties to listen for specific events during the
 * lifecycle of the cargo and inner queue.
 * @example
 *
 * // create a cargo object with payload 2
 * var cargo = async.cargo(function(tasks, callback) {
 *     for (var i=0; i<tasks.length; i++) {
 *         console.log('hello ' + tasks[i].name);
 *     }
 *     callback();
 * }, 2);
 *
 * // add some items
 * cargo.push({name: 'foo'}, function(err) {
 *     console.log('finished processing foo');
 * });
 * cargo.push({name: 'bar'}, function(err) {
 *     console.log('finished processing bar');
 * });
 * cargo.push({name: 'baz'}, function(err) {
 *     console.log('finished processing baz');
 * });
 */
function cargo(worker, payload) {
    return queue(worker, 1, payload);
}

/**
 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs only a single async operation at a time.
 *
 * @name eachOfSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.eachOf]{@link module:Collections.eachOf}
 * @alias forEachOfSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * Invoked with (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Invoked with (err).
 */
var eachOfSeries = doLimit(eachOfLimit, 1);

/**
 * Reduces `coll` into a single value using an async `iteratee` to return each
 * successive step. `memo` is the initial state of the reduction. This function
 * only operates in series.
 *
 * For performance reasons, it may make sense to split a call to this function
 * into a parallel map, and then use the normal `Array.prototype.reduce` on the
 * results. This function is for situations where each step in the reduction
 * needs to be async; if you can get the data before reducing it, then it's
 * probably a good idea to do so.
 *
 * @name reduce
 * @static
 * @memberOf module:Collections
 * @method
 * @alias inject
 * @alias foldl
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {*} memo - The initial state of the reduction.
 * @param {AsyncFunction} iteratee - A function applied to each item in the
 * array to produce the next step in the reduction.
 * The `iteratee` should complete with the next state of the reduction.
 * If the iteratee complete with an error, the reduction is stopped and the
 * main `callback` is immediately called with the error.
 * Invoked with (memo, item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the reduced value. Invoked with
 * (err, result).
 * @example
 *
 * async.reduce([1,2,3], 0, function(memo, item, callback) {
 *     // pointless async:
 *     process.nextTick(function() {
 *         callback(null, memo + item)
 *     });
 * }, function(err, result) {
 *     // result is now equal to the last value of memo, which is 6
 * });
 */
function reduce(coll, memo, iteratee, callback) {
    callback = once(callback || noop);
    var _iteratee = wrapAsync(iteratee);
    eachOfSeries(coll, function(x, i, callback) {
        _iteratee(memo, x, function(err, v) {
            memo = v;
            callback(err);
        });
    }, function(err) {
        callback(err, memo);
    });
}

/**
 * Version of the compose function that is more natural to read. Each function
 * consumes the return value of the previous function. It is the equivalent of
 * [compose]{@link module:ControlFlow.compose} with the arguments reversed.
 *
 * Each function is executed with the `this` binding of the composed function.
 *
 * @name seq
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.compose]{@link module:ControlFlow.compose}
 * @category Control Flow
 * @param {...AsyncFunction} functions - the asynchronous functions to compose
 * @returns {Function} a function that composes the `functions` in order
 * @example
 *
 * // Requires lodash (or underscore), express3 and dresende's orm2.
 * // Part of an app, that fetches cats of the logged user.
 * // This example uses `seq` function to avoid overnesting and error
 * // handling clutter.
 * app.get('/cats', function(request, response) {
 *     var User = request.models.User;
 *     async.seq(
 *         _.bind(User.get, User),  // 'User.get' has signature (id, callback(err, data))
 *         function(user, fn) {
 *             user.getCats(fn);      // 'getCats' has signature (callback(err, data))
 *         }
 *     )(req.session.user_id, function (err, cats) {
 *         if (err) {
 *             console.error(err);
 *             response.json({ status: 'error', message: err.message });
 *         } else {
 *             response.json({ status: 'ok', message: 'Cats found', data: cats });
 *         }
 *     });
 * });
 */
function seq(/*...functions*/) {
    var _functions = arrayMap(arguments, wrapAsync);
    return function(/*...args*/) {
        var args = slice(arguments);
        var that = this;

        var cb = args[args.length - 1];
        if (typeof cb == 'function') {
            args.pop();
        } else {
            cb = noop;
        }

        reduce(_functions, args, function(newargs, fn, cb) {
            fn.apply(that, newargs.concat(function(err/*, ...nextargs*/) {
                var nextargs = slice(arguments, 1);
                cb(err, nextargs);
            }));
        },
        function(err, results) {
            cb.apply(that, [err].concat(results));
        });
    };
}

/**
 * Creates a function which is a composition of the passed asynchronous
 * functions. Each function consumes the return value of the function that
 * follows. Composing functions `f()`, `g()`, and `h()` would produce the result
 * of `f(g(h()))`, only this version uses callbacks to obtain the return values.
 *
 * Each function is executed with the `this` binding of the composed function.
 *
 * @name compose
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {...AsyncFunction} functions - the asynchronous functions to compose
 * @returns {Function} an asynchronous function that is the composed
 * asynchronous `functions`
 * @example
 *
 * function add1(n, callback) {
 *     setTimeout(function () {
 *         callback(null, n + 1);
 *     }, 10);
 * }
 *
 * function mul3(n, callback) {
 *     setTimeout(function () {
 *         callback(null, n * 3);
 *     }, 10);
 * }
 *
 * var add1mul3 = async.compose(mul3, add1);
 * add1mul3(4, function (err, result) {
 *     // result now equals 15
 * });
 */
var compose = function(/*...args*/) {
    return seq.apply(null, slice(arguments).reverse());
};

var _concat = Array.prototype.concat;

/**
 * The same as [`concat`]{@link module:Collections.concat} but runs a maximum of `limit` async operations at a time.
 *
 * @name concatLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.concat]{@link module:Collections.concat}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`,
 * which should use an array as its result. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 */
var concatLimit = function(coll, limit, iteratee, callback) {
    callback = callback || noop;
    var _iteratee = wrapAsync(iteratee);
    mapLimit(coll, limit, function(val, callback) {
        _iteratee(val, function(err /*, ...args*/) {
            if (err) return callback(err);
            return callback(null, slice(arguments, 1));
        });
    }, function(err, mapResults) {
        var result = [];
        for (var i = 0; i < mapResults.length; i++) {
            if (mapResults[i]) {
                result = _concat.apply(result, mapResults[i]);
            }
        }

        return callback(err, result);
    });
};

/**
 * Applies `iteratee` to each item in `coll`, concatenating the results. Returns
 * the concatenated list. The `iteratee`s are called in parallel, and the
 * results are concatenated as they return. There is no guarantee that the
 * results array will be returned in the original order of `coll` passed to the
 * `iteratee` function.
 *
 * @name concat
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`,
 * which should use an array as its result. Invoked with (item, callback).
 * @param {Function} [callback(err)] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 * @example
 *
 * async.concat(['dir1','dir2','dir3'], fs.readdir, function(err, files) {
 *     // files is now a list of filenames that exist in the 3 directories
 * });
 */
var concat = doLimit(concatLimit, Infinity);

/**
 * The same as [`concat`]{@link module:Collections.concat} but runs only a single async operation at a time.
 *
 * @name concatSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.concat]{@link module:Collections.concat}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`.
 * The iteratee should complete with an array an array of results.
 * Invoked with (item, callback).
 * @param {Function} [callback(err)] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 */
var concatSeries = doLimit(concatLimit, 1);

/**
 * Returns a function that when called, calls-back with the values provided.
 * Useful as the first function in a [`waterfall`]{@link module:ControlFlow.waterfall}, or for plugging values in to
 * [`auto`]{@link module:ControlFlow.auto}.
 *
 * @name constant
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {...*} arguments... - Any number of arguments to automatically invoke
 * callback with.
 * @returns {AsyncFunction} Returns a function that when invoked, automatically
 * invokes the callback with the previous given arguments.
 * @example
 *
 * async.waterfall([
 *     async.constant(42),
 *     function (value, next) {
 *         // value === 42
 *     },
 *     //...
 * ], callback);
 *
 * async.waterfall([
 *     async.constant(filename, "utf8"),
 *     fs.readFile,
 *     function (fileData, next) {
 *         //...
 *     }
 *     //...
 * ], callback);
 *
 * async.auto({
 *     hostname: async.constant("https://server.net/"),
 *     port: findFreePort,
 *     launchServer: ["hostname", "port", function (options, cb) {
 *         startServer(options, cb);
 *     }],
 *     //...
 * }, callback);
 */
var constant = function(/*...values*/) {
    var values = slice(arguments);
    var args = [null].concat(values);
    return function (/*...ignoredArgs, callback*/) {
        var callback = arguments[arguments.length - 1];
        return callback.apply(this, args);
    };
};

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

function _createTester(check, getResult) {
    return function(eachfn, arr, iteratee, cb) {
        cb = cb || noop;
        var testPassed = false;
        var testResult;
        eachfn(arr, function(value, _, callback) {
            iteratee(value, function(err, result) {
                if (err) {
                    callback(err);
                } else if (check(result) && !testResult) {
                    testPassed = true;
                    testResult = getResult(true, value);
                    callback(null, breakLoop);
                } else {
                    callback();
                }
            });
        }, function(err) {
            if (err) {
                cb(err);
            } else {
                cb(null, testPassed ? testResult : getResult(false));
            }
        });
    };
}

function _findGetResult(v, x) {
    return x;
}

/**
 * Returns the first value in `coll` that passes an async truth test. The
 * `iteratee` is applied in parallel, meaning the first iteratee to return
 * `true` will fire the detect `callback` with that result. That means the
 * result might not be the first item in the original `coll` (in terms of order)
 * that passes the test.

 * If order within the original `coll` is important, then look at
 * [`detectSeries`]{@link module:Collections.detectSeries}.
 *
 * @name detect
 * @static
 * @memberOf module:Collections
 * @method
 * @alias find
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 * @example
 *
 * async.detect(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // result now equals the first file in the list that exists
 * });
 */
var detect = doParallel(_createTester(identity, _findGetResult));

/**
 * The same as [`detect`]{@link module:Collections.detect} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name detectLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.detect]{@link module:Collections.detect}
 * @alias findLimit
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 */
var detectLimit = doParallelLimit(_createTester(identity, _findGetResult));

/**
 * The same as [`detect`]{@link module:Collections.detect} but runs only a single async operation at a time.
 *
 * @name detectSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.detect]{@link module:Collections.detect}
 * @alias findSeries
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 */
var detectSeries = doLimit(detectLimit, 1);

function consoleFunc(name) {
    return function (fn/*, ...args*/) {
        var args = slice(arguments, 1);
        args.push(function (err/*, ...args*/) {
            var args = slice(arguments, 1);
            if (typeof console === 'object') {
                if (err) {
                    if (console.error) {
                        console.error(err);
                    }
                } else if (console[name]) {
                    arrayEach(args, function (x) {
                        console[name](x);
                    });
                }
            }
        });
        wrapAsync(fn).apply(null, args);
    };
}

/**
 * Logs the result of an [`async` function]{@link AsyncFunction} to the
 * `console` using `console.dir` to display the properties of the resulting object.
 * Only works in Node.js or in browsers that support `console.dir` and
 * `console.error` (such as FF and Chrome).
 * If multiple arguments are returned from the async function,
 * `console.dir` is called on each argument in order.
 *
 * @name dir
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} function - The function you want to eventually apply
 * all arguments to.
 * @param {...*} arguments... - Any number of arguments to apply to the function.
 * @example
 *
 * // in a module
 * var hello = function(name, callback) {
 *     setTimeout(function() {
 *         callback(null, {hello: name});
 *     }, 1000);
 * };
 *
 * // in the node repl
 * node> async.dir(hello, 'world');
 * {hello: 'world'}
 */
var dir = consoleFunc('dir');

/**
 * The post-check version of [`during`]{@link module:ControlFlow.during}. To reflect the difference in
 * the order of operations, the arguments `test` and `fn` are switched.
 *
 * Also a version of [`doWhilst`]{@link module:ControlFlow.doWhilst} with asynchronous `test` function.
 * @name doDuring
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.during]{@link module:ControlFlow.during}
 * @category Control Flow
 * @param {AsyncFunction} fn - An async function which is called each time
 * `test` passes. Invoked with (callback).
 * @param {AsyncFunction} test - asynchronous truth test to perform before each
 * execution of `fn`. Invoked with (...args, callback), where `...args` are the
 * non-error args from the previous callback of `fn`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `fn` has stopped. `callback`
 * will be passed an error if one occurred, otherwise `null`.
 */
function doDuring(fn, test, callback) {
    callback = onlyOnce(callback || noop);
    var _fn = wrapAsync(fn);
    var _test = wrapAsync(test);

    function next(err/*, ...args*/) {
        if (err) return callback(err);
        var args = slice(arguments, 1);
        args.push(check);
        _test.apply(this, args);
    }

    function check(err, truth) {
        if (err) return callback(err);
        if (!truth) return callback(null);
        _fn(next);
    }

    check(null, true);

}

/**
 * The post-check version of [`whilst`]{@link module:ControlFlow.whilst}. To reflect the difference in
 * the order of operations, the arguments `test` and `iteratee` are switched.
 *
 * `doWhilst` is to `whilst` as `do while` is to `while` in plain JavaScript.
 *
 * @name doWhilst
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {AsyncFunction} iteratee - A function which is called each time `test`
 * passes. Invoked with (callback).
 * @param {Function} test - synchronous truth test to perform after each
 * execution of `iteratee`. Invoked with any non-error callback results of
 * `iteratee`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `iteratee` has stopped.
 * `callback` will be passed an error and any arguments passed to the final
 * `iteratee`'s callback. Invoked with (err, [results]);
 */
function doWhilst(iteratee, test, callback) {
    callback = onlyOnce(callback || noop);
    var _iteratee = wrapAsync(iteratee);
    var next = function(err/*, ...args*/) {
        if (err) return callback(err);
        var args = slice(arguments, 1);
        if (test.apply(this, args)) return _iteratee(next);
        callback.apply(null, [null].concat(args));
    };
    _iteratee(next);
}

/**
 * Like ['doWhilst']{@link module:ControlFlow.doWhilst}, except the `test` is inverted. Note the
 * argument ordering differs from `until`.
 *
 * @name doUntil
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.doWhilst]{@link module:ControlFlow.doWhilst}
 * @category Control Flow
 * @param {AsyncFunction} iteratee - An async function which is called each time
 * `test` fails. Invoked with (callback).
 * @param {Function} test - synchronous truth test to perform after each
 * execution of `iteratee`. Invoked with any non-error callback results of
 * `iteratee`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has passed and repeated execution of `iteratee` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `iteratee`'s
 * callback. Invoked with (err, [results]);
 */
function doUntil(iteratee, test, callback) {
    doWhilst(iteratee, function() {
        return !test.apply(this, arguments);
    }, callback);
}

/**
 * Like [`whilst`]{@link module:ControlFlow.whilst}, except the `test` is an asynchronous function that
 * is passed a callback in the form of `function (err, truth)`. If error is
 * passed to `test` or `fn`, the main callback is immediately called with the
 * value of the error.
 *
 * @name during
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {AsyncFunction} test - asynchronous truth test to perform before each
 * execution of `fn`. Invoked with (callback).
 * @param {AsyncFunction} fn - An async function which is called each time
 * `test` passes. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `fn` has stopped. `callback`
 * will be passed an error, if one occurred, otherwise `null`.
 * @example
 *
 * var count = 0;
 *
 * async.during(
 *     function (callback) {
 *         return callback(null, count < 5);
 *     },
 *     function (callback) {
 *         count++;
 *         setTimeout(callback, 1000);
 *     },
 *     function (err) {
 *         // 5 seconds have passed
 *     }
 * );
 */
function during(test, fn, callback) {
    callback = onlyOnce(callback || noop);
    var _fn = wrapAsync(fn);
    var _test = wrapAsync(test);

    function next(err) {
        if (err) return callback(err);
        _test(check);
    }

    function check(err, truth) {
        if (err) return callback(err);
        if (!truth) return callback(null);
        _fn(next);
    }

    _test(check);
}

function _withoutIndex(iteratee) {
    return function (value, index, callback) {
        return iteratee(value, callback);
    };
}

/**
 * Applies the function `iteratee` to each item in `coll`, in parallel.
 * The `iteratee` is called with an item from the list, and a callback for when
 * it has finished. If the `iteratee` passes an error to its `callback`, the
 * main `callback` (for the `each` function) is immediately called with the
 * error.
 *
 * Note, that since this function applies `iteratee` to each item in parallel,
 * there is no guarantee that the iteratee functions will complete in order.
 *
 * @name each
 * @static
 * @memberOf module:Collections
 * @method
 * @alias forEach
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to
 * each item in `coll`. Invoked with (item, callback).
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOf`.
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 * @example
 *
 * // assuming openFiles is an array of file names and saveFile is a function
 * // to save the modified contents of that file:
 *
 * async.each(openFiles, saveFile, function(err){
 *   // if any of the saves produced an error, err would equal that error
 * });
 *
 * // assuming openFiles is an array of file names
 * async.each(openFiles, function(file, callback) {
 *
 *     // Perform operation on file here.
 *     console.log('Processing file ' + file);
 *
 *     if( file.length > 32 ) {
 *       console.log('This file name is too long');
 *       callback('File name too long');
 *     } else {
 *       // Do work to process file here
 *       console.log('File processed');
 *       callback();
 *     }
 * }, function(err) {
 *     // if any of the file processing produced an error, err would equal that error
 *     if( err ) {
 *       // One of the iterations produced an error.
 *       // All processing will now stop.
 *       console.log('A file failed to process');
 *     } else {
 *       console.log('All files have been processed successfully');
 *     }
 * });
 */
function eachLimit(coll, iteratee, callback) {
    eachOf(coll, _withoutIndex(wrapAsync(iteratee)), callback);
}

/**
 * The same as [`each`]{@link module:Collections.each} but runs a maximum of `limit` async operations at a time.
 *
 * @name eachLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOfLimit`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
function eachLimit$1(coll, limit, iteratee, callback) {
    _eachOfLimit(limit)(coll, _withoutIndex(wrapAsync(iteratee)), callback);
}

/**
 * The same as [`each`]{@link module:Collections.each} but runs only a single async operation at a time.
 *
 * @name eachSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each
 * item in `coll`.
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOfSeries`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
var eachSeries = doLimit(eachLimit$1, 1);

/**
 * Wrap an async function and ensure it calls its callback on a later tick of
 * the event loop.  If the function already calls its callback on a next tick,
 * no extra deferral is added. This is useful for preventing stack overflows
 * (`RangeError: Maximum call stack size exceeded`) and generally keeping
 * [Zalgo](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony)
 * contained. ES2017 `async` functions are returned as-is -- they are immune
 * to Zalgo's corrupting influences, as they always resolve on a later tick.
 *
 * @name ensureAsync
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} fn - an async function, one that expects a node-style
 * callback as its last argument.
 * @returns {AsyncFunction} Returns a wrapped function with the exact same call
 * signature as the function passed in.
 * @example
 *
 * function sometimesAsync(arg, callback) {
 *     if (cache[arg]) {
 *         return callback(null, cache[arg]); // this would be synchronous!!
 *     } else {
 *         doSomeIO(arg, callback); // this IO would be asynchronous
 *     }
 * }
 *
 * // this has a risk of stack overflows if many results are cached in a row
 * async.mapSeries(args, sometimesAsync, done);
 *
 * // this will defer sometimesAsync's callback if necessary,
 * // preventing stack overflows
 * async.mapSeries(args, async.ensureAsync(sometimesAsync), done);
 */
function ensureAsync(fn) {
    if (isAsync(fn)) return fn;
    return initialParams(function (args, callback) {
        var sync = true;
        args.push(function () {
            var innerArgs = arguments;
            if (sync) {
                setImmediate$1(function () {
                    callback.apply(null, innerArgs);
                });
            } else {
                callback.apply(null, innerArgs);
            }
        });
        fn.apply(this, args);
        sync = false;
    });
}

function notId(v) {
    return !v;
}

/**
 * Returns `true` if every element in `coll` satisfies an async test. If any
 * iteratee call returns `false`, the main `callback` is immediately called.
 *
 * @name every
 * @static
 * @memberOf module:Collections
 * @method
 * @alias all
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collection in parallel.
 * The iteratee must complete with a boolean result value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 * @example
 *
 * async.every(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // if result is true then every file exists
 * });
 */
var every = doParallel(_createTester(notId, notId));

/**
 * The same as [`every`]{@link module:Collections.every} but runs a maximum of `limit` async operations at a time.
 *
 * @name everyLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.every]{@link module:Collections.every}
 * @alias allLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collection in parallel.
 * The iteratee must complete with a boolean result value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 */
var everyLimit = doParallelLimit(_createTester(notId, notId));

/**
 * The same as [`every`]{@link module:Collections.every} but runs only a single async operation at a time.
 *
 * @name everySeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.every]{@link module:Collections.every}
 * @alias allSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collection in series.
 * The iteratee must complete with a boolean result value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 */
var everySeries = doLimit(everyLimit, 1);

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

function filterArray(eachfn, arr, iteratee, callback) {
    var truthValues = new Array(arr.length);
    eachfn(arr, function (x, index, callback) {
        iteratee(x, function (err, v) {
            truthValues[index] = !!v;
            callback(err);
        });
    }, function (err) {
        if (err) return callback(err);
        var results = [];
        for (var i = 0; i < arr.length; i++) {
            if (truthValues[i]) results.push(arr[i]);
        }
        callback(null, results);
    });
}

function filterGeneric(eachfn, coll, iteratee, callback) {
    var results = [];
    eachfn(coll, function (x, index, callback) {
        iteratee(x, function (err, v) {
            if (err) {
                callback(err);
            } else {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            }
        });
    }, function (err) {
        if (err) {
            callback(err);
        } else {
            callback(null, arrayMap(results.sort(function (a, b) {
                return a.index - b.index;
            }), baseProperty('value')));
        }
    });
}

function _filter(eachfn, coll, iteratee, callback) {
    var filter = isArrayLike(coll) ? filterArray : filterGeneric;
    filter(eachfn, coll, wrapAsync(iteratee), callback || noop);
}

/**
 * Returns a new array of all the values in `coll` which pass an async truth
 * test. This operation is performed in parallel, but the results array will be
 * in the same order as the original.
 *
 * @name filter
 * @static
 * @memberOf module:Collections
 * @method
 * @alias select
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 * @example
 *
 * async.filter(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, results) {
 *     // results now equals an array of the existing files
 * });
 */
var filter = doParallel(_filter);

/**
 * The same as [`filter`]{@link module:Collections.filter} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name filterLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @alias selectLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var filterLimit = doParallelLimit(_filter);

/**
 * The same as [`filter`]{@link module:Collections.filter} but runs only a single async operation at a time.
 *
 * @name filterSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @alias selectSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results)
 */
var filterSeries = doLimit(filterLimit, 1);

/**
 * Calls the asynchronous function `fn` with a callback parameter that allows it
 * to call itself again, in series, indefinitely.

 * If an error is passed to the callback then `errback` is called with the
 * error, and execution stops, otherwise it will never be called.
 *
 * @name forever
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {AsyncFunction} fn - an async function to call repeatedly.
 * Invoked with (next).
 * @param {Function} [errback] - when `fn` passes an error to it's callback,
 * this function will be called, and execution stops. Invoked with (err).
 * @example
 *
 * async.forever(
 *     function(next) {
 *         // next is suitable for passing to things that need a callback(err [, whatever]);
 *         // it will result in this function being called again.
 *     },
 *     function(err) {
 *         // if next is called with a value in its first parameter, it will appear
 *         // in here as 'err', and execution will stop.
 *     }
 * );
 */
function forever(fn, errback) {
    var done = onlyOnce(errback || noop);
    var task = wrapAsync(ensureAsync(fn));

    function next(err) {
        if (err) return done(err);
        task(next);
    }
    next();
}

/**
 * The same as [`groupBy`]{@link module:Collections.groupBy} but runs a maximum of `limit` async operations at a time.
 *
 * @name groupByLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.groupBy]{@link module:Collections.groupBy}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a `key` to group the value under.
 * Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 */
var groupByLimit = function(coll, limit, iteratee, callback) {
    callback = callback || noop;
    var _iteratee = wrapAsync(iteratee);
    mapLimit(coll, limit, function(val, callback) {
        _iteratee(val, function(err, key) {
            if (err) return callback(err);
            return callback(null, {key: key, val: val});
        });
    }, function(err, mapResults) {
        var result = {};
        // from MDN, handle object having an `hasOwnProperty` prop
        var hasOwnProperty = Object.prototype.hasOwnProperty;

        for (var i = 0; i < mapResults.length; i++) {
            if (mapResults[i]) {
                var key = mapResults[i].key;
                var val = mapResults[i].val;

                if (hasOwnProperty.call(result, key)) {
                    result[key].push(val);
                } else {
                    result[key] = [val];
                }
            }
        }

        return callback(err, result);
    });
};

/**
 * Returns a new object, where each value corresponds to an array of items, from
 * `coll`, that returned the corresponding key. That is, the keys of the object
 * correspond to the values passed to the `iteratee` callback.
 *
 * Note: Since this function applies the `iteratee` to each item in parallel,
 * there is no guarantee that the `iteratee` functions will complete in order.
 * However, the values for each key in the `result` will be in the same order as
 * the original `coll`. For Objects, the values will roughly be in the order of
 * the original Objects' keys (but this can vary across JavaScript engines).
 *
 * @name groupBy
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a `key` to group the value under.
 * Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 * @example
 *
 * async.groupBy(['userId1', 'userId2', 'userId3'], function(userId, callback) {
 *     db.findById(userId, function(err, user) {
 *         if (err) return callback(err);
 *         return callback(null, user.age);
 *     });
 * }, function(err, result) {
 *     // result is object containing the userIds grouped by age
 *     // e.g. { 30: ['userId1', 'userId3'], 42: ['userId2']};
 * });
 */
var groupBy = doLimit(groupByLimit, Infinity);

/**
 * The same as [`groupBy`]{@link module:Collections.groupBy} but runs only a single async operation at a time.
 *
 * @name groupBySeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.groupBy]{@link module:Collections.groupBy}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a `key` to group the value under.
 * Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 */
var groupBySeries = doLimit(groupByLimit, 1);

/**
 * Logs the result of an `async` function to the `console`. Only works in
 * Node.js or in browsers that support `console.log` and `console.error` (such
 * as FF and Chrome). If multiple arguments are returned from the async
 * function, `console.log` is called on each argument in order.
 *
 * @name log
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} function - The function you want to eventually apply
 * all arguments to.
 * @param {...*} arguments... - Any number of arguments to apply to the function.
 * @example
 *
 * // in a module
 * var hello = function(name, callback) {
 *     setTimeout(function() {
 *         callback(null, 'hello ' + name);
 *     }, 1000);
 * };
 *
 * // in the node repl
 * node> async.log(hello, 'world');
 * 'hello world'
 */
var log = consoleFunc('log');

/**
 * The same as [`mapValues`]{@link module:Collections.mapValues} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name mapValuesLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.mapValues]{@link module:Collections.mapValues}
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A function to apply to each value and key
 * in `coll`.
 * The iteratee should complete with the transformed value as its result.
 * Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 */
function mapValuesLimit(obj, limit, iteratee, callback) {
    callback = once(callback || noop);
    var newObj = {};
    var _iteratee = wrapAsync(iteratee);
    eachOfLimit(obj, limit, function(val, key, next) {
        _iteratee(val, key, function (err, result) {
            if (err) return next(err);
            newObj[key] = result;
            next();
        });
    }, function (err) {
        callback(err, newObj);
    });
}

/**
 * A relative of [`map`]{@link module:Collections.map}, designed for use with objects.
 *
 * Produces a new Object by mapping each value of `obj` through the `iteratee`
 * function. The `iteratee` is called each `value` and `key` from `obj` and a
 * callback for when it has finished processing. Each of these callbacks takes
 * two arguments: an `error`, and the transformed item from `obj`. If `iteratee`
 * passes an error to its callback, the main `callback` (for the `mapValues`
 * function) is immediately called with the error.
 *
 * Note, the order of the keys in the result is not guaranteed.  The keys will
 * be roughly in the order they complete, (but this is very engine-specific)
 *
 * @name mapValues
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each value and key
 * in `coll`.
 * The iteratee should complete with the transformed value as its result.
 * Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 * @example
 *
 * async.mapValues({
 *     f1: 'file1',
 *     f2: 'file2',
 *     f3: 'file3'
 * }, function (file, key, callback) {
 *   fs.stat(file, callback);
 * }, function(err, result) {
 *     // result is now a map of stats for each file, e.g.
 *     // {
 *     //     f1: [stats for file1],
 *     //     f2: [stats for file2],
 *     //     f3: [stats for file3]
 *     // }
 * });
 */

var mapValues = doLimit(mapValuesLimit, Infinity);

/**
 * The same as [`mapValues`]{@link module:Collections.mapValues} but runs only a single async operation at a time.
 *
 * @name mapValuesSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.mapValues]{@link module:Collections.mapValues}
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each value and key
 * in `coll`.
 * The iteratee should complete with the transformed value as its result.
 * Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 */
var mapValuesSeries = doLimit(mapValuesLimit, 1);

function has(obj, key) {
    return key in obj;
}

/**
 * Caches the results of an async function. When creating a hash to store
 * function results against, the callback is omitted from the hash and an
 * optional hash function can be used.
 *
 * If no hash function is specified, the first argument is used as a hash key,
 * which may work reasonably if it is a string or a data type that converts to a
 * distinct string. Note that objects and arrays will not behave reasonably.
 * Neither will cases where the other arguments are significant. In such cases,
 * specify your own hash function.
 *
 * The cache of results is exposed as the `memo` property of the function
 * returned by `memoize`.
 *
 * @name memoize
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} fn - The async function to proxy and cache results from.
 * @param {Function} hasher - An optional function for generating a custom hash
 * for storing results. It has all the arguments applied to it apart from the
 * callback, and must be synchronous.
 * @returns {AsyncFunction} a memoized version of `fn`
 * @example
 *
 * var slow_fn = function(name, callback) {
 *     // do something
 *     callback(null, result);
 * };
 * var fn = async.memoize(slow_fn);
 *
 * // fn can now be used as if it were slow_fn
 * fn('some name', function() {
 *     // callback
 * });
 */
function memoize(fn, hasher) {
    var memo = Object.create(null);
    var queues = Object.create(null);
    hasher = hasher || identity;
    var _fn = wrapAsync(fn);
    var memoized = initialParams(function memoized(args, callback) {
        var key = hasher.apply(null, args);
        if (has(memo, key)) {
            setImmediate$1(function() {
                callback.apply(null, memo[key]);
            });
        } else if (has(queues, key)) {
            queues[key].push(callback);
        } else {
            queues[key] = [callback];
            _fn.apply(null, args.concat(function(/*args*/) {
                var args = slice(arguments);
                memo[key] = args;
                var q = queues[key];
                delete queues[key];
                for (var i = 0, l = q.length; i < l; i++) {
                    q[i].apply(null, args);
                }
            }));
        }
    });
    memoized.memo = memo;
    memoized.unmemoized = fn;
    return memoized;
}

/**
 * Calls `callback` on a later loop around the event loop. In Node.js this just
 * calls `setImmediate`.  In the browser it will use `setImmediate` if
 * available, otherwise `setTimeout(callback, 0)`, which means other higher
 * priority events may precede the execution of `callback`.
 *
 * This is used internally for browser-compatibility purposes.
 *
 * @name nextTick
 * @static
 * @memberOf module:Utils
 * @method
 * @alias setImmediate
 * @category Util
 * @param {Function} callback - The function to call on a later loop around
 * the event loop. Invoked with (args...).
 * @param {...*} args... - any number of additional arguments to pass to the
 * callback on the next tick.
 * @example
 *
 * var call_order = [];
 * async.nextTick(function() {
 *     call_order.push('two');
 *     // call_order now equals ['one','two']
 * });
 * call_order.push('one');
 *
 * async.setImmediate(function (a, b, c) {
 *     // a, b, and c equal 1, 2, and 3
 * }, 1, 2, 3);
 */
var _defer$1;

if (hasNextTick) {
    _defer$1 = process.nextTick;
} else if (hasSetImmediate) {
    _defer$1 = setImmediate;
} else {
    _defer$1 = fallback;
}

var nextTick = wrap(_defer$1);

function _parallel(eachfn, tasks, callback) {
    callback = callback || noop;
    var results = isArrayLike(tasks) ? [] : {};

    eachfn(tasks, function (task, key, callback) {
        wrapAsync(task)(function (err, result) {
            if (arguments.length > 2) {
                result = slice(arguments, 1);
            }
            results[key] = result;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}

/**
 * Run the `tasks` collection of functions in parallel, without waiting until
 * the previous function has completed. If any of the functions pass an error to
 * its callback, the main `callback` is immediately called with the value of the
 * error. Once the `tasks` have completed, the results are passed to the final
 * `callback` as an array.
 *
 * **Note:** `parallel` is about kicking-off I/O tasks in parallel, not about
 * parallel execution of code.  If your tasks do not use any timers or perform
 * any I/O, they will actually be executed in series.  Any synchronous setup
 * sections for each task will happen one after the other.  JavaScript remains
 * single-threaded.
 *
 * **Hint:** Use [`reflect`]{@link module:Utils.reflect} to continue the
 * execution of other tasks when a task fails.
 *
 * It is also possible to use an object instead of an array. Each property will
 * be run as a function and the results will be passed to the final `callback`
 * as an object instead of an array. This can be a more readable way of handling
 * results from {@link async.parallel}.
 *
 * @name parallel
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection of
 * [async functions]{@link AsyncFunction} to run.
 * Each async function can complete with any number of optional `result` values.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed successfully. This function gets a results array
 * (or object) containing all the result arguments passed to the task callbacks.
 * Invoked with (err, results).
 *
 * @example
 * async.parallel([
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ],
 * // optional callback
 * function(err, results) {
 *     // the results array will equal ['one','two'] even though
 *     // the second function had a shorter timeout.
 * });
 *
 * // an example using an object instead of an array
 * async.parallel({
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 1);
 *         }, 200);
 *     },
 *     two: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 2);
 *         }, 100);
 *     }
 * }, function(err, results) {
 *     // results is now equals to: {one: 1, two: 2}
 * });
 */
function parallelLimit(tasks, callback) {
    _parallel(eachOf, tasks, callback);
}

/**
 * The same as [`parallel`]{@link module:ControlFlow.parallel} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name parallelLimit
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.parallel]{@link module:ControlFlow.parallel}
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection of
 * [async functions]{@link AsyncFunction} to run.
 * Each async function can complete with any number of optional `result` values.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed successfully. This function gets a results array
 * (or object) containing all the result arguments passed to the task callbacks.
 * Invoked with (err, results).
 */
function parallelLimit$1(tasks, limit, callback) {
    _parallel(_eachOfLimit(limit), tasks, callback);
}

/**
 * A queue of tasks for the worker function to complete.
 * @typedef {Object} QueueObject
 * @memberOf module:ControlFlow
 * @property {Function} length - a function returning the number of items
 * waiting to be processed. Invoke with `queue.length()`.
 * @property {boolean} started - a boolean indicating whether or not any
 * items have been pushed and processed by the queue.
 * @property {Function} running - a function returning the number of items
 * currently being processed. Invoke with `queue.running()`.
 * @property {Function} workersList - a function returning the array of items
 * currently being processed. Invoke with `queue.workersList()`.
 * @property {Function} idle - a function returning false if there are items
 * waiting or being processed, or true if not. Invoke with `queue.idle()`.
 * @property {number} concurrency - an integer for determining how many `worker`
 * functions should be run in parallel. This property can be changed after a
 * `queue` is created to alter the concurrency on-the-fly.
 * @property {Function} push - add a new task to the `queue`. Calls `callback`
 * once the `worker` has finished processing the task. Instead of a single task,
 * a `tasks` array can be submitted. The respective callback is used for every
 * task in the list. Invoke with `queue.push(task, [callback])`,
 * @property {Function} unshift - add a new task to the front of the `queue`.
 * Invoke with `queue.unshift(task, [callback])`.
 * @property {Function} remove - remove items from the queue that match a test
 * function.  The test function will be passed an object with a `data` property,
 * and a `priority` property, if this is a
 * [priorityQueue]{@link module:ControlFlow.priorityQueue} object.
 * Invoked with `queue.remove(testFn)`, where `testFn` is of the form
 * `function ({data, priority}) {}` and returns a Boolean.
 * @property {Function} saturated - a callback that is called when the number of
 * running workers hits the `concurrency` limit, and further tasks will be
 * queued.
 * @property {Function} unsaturated - a callback that is called when the number
 * of running workers is less than the `concurrency` & `buffer` limits, and
 * further tasks will not be queued.
 * @property {number} buffer - A minimum threshold buffer in order to say that
 * the `queue` is `unsaturated`.
 * @property {Function} empty - a callback that is called when the last item
 * from the `queue` is given to a `worker`.
 * @property {Function} drain - a callback that is called when the last item
 * from the `queue` has returned from the `worker`.
 * @property {Function} error - a callback that is called when a task errors.
 * Has the signature `function(error, task)`.
 * @property {boolean} paused - a boolean for determining whether the queue is
 * in a paused state.
 * @property {Function} pause - a function that pauses the processing of tasks
 * until `resume()` is called. Invoke with `queue.pause()`.
 * @property {Function} resume - a function that resumes the processing of
 * queued tasks when the queue is paused. Invoke with `queue.resume()`.
 * @property {Function} kill - a function that removes the `drain` callback and
 * empties remaining tasks from the queue forcing it to go idle. No more tasks
 * should be pushed to the queue after calling this function. Invoke with `queue.kill()`.
 */

/**
 * Creates a `queue` object with the specified `concurrency`. Tasks added to the
 * `queue` are processed in parallel (up to the `concurrency` limit). If all
 * `worker`s are in progress, the task is queued until one becomes available.
 * Once a `worker` completes a `task`, that `task`'s callback is called.
 *
 * @name queue
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {AsyncFunction} worker - An async function for processing a queued task.
 * If you want to handle errors from an individual task, pass a callback to
 * `q.push()`. Invoked with (task, callback).
 * @param {number} [concurrency=1] - An `integer` for determining how many
 * `worker` functions should be run in parallel.  If omitted, the concurrency
 * defaults to `1`.  If the concurrency is `0`, an error is thrown.
 * @returns {module:ControlFlow.QueueObject} A queue object to manage the tasks. Callbacks can
 * attached as certain properties to listen for specific events during the
 * lifecycle of the queue.
 * @example
 *
 * // create a queue object with concurrency 2
 * var q = async.queue(function(task, callback) {
 *     console.log('hello ' + task.name);
 *     callback();
 * }, 2);
 *
 * // assign a callback
 * q.drain = function() {
 *     console.log('all items have been processed');
 * };
 *
 * // add some items to the queue
 * q.push({name: 'foo'}, function(err) {
 *     console.log('finished processing foo');
 * });
 * q.push({name: 'bar'}, function (err) {
 *     console.log('finished processing bar');
 * });
 *
 * // add some items to the queue (batch-wise)
 * q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
 *     console.log('finished processing item');
 * });
 *
 * // add some items to the front of the queue
 * q.unshift({name: 'bar'}, function (err) {
 *     console.log('finished processing bar');
 * });
 */
var queue$1 = function (worker, concurrency) {
    var _worker = wrapAsync(worker);
    return queue(function (items, cb) {
        _worker(items[0], cb);
    }, concurrency, 1);
};

/**
 * The same as [async.queue]{@link module:ControlFlow.queue} only tasks are assigned a priority and
 * completed in ascending priority order.
 *
 * @name priorityQueue
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.queue]{@link module:ControlFlow.queue}
 * @category Control Flow
 * @param {AsyncFunction} worker - An async function for processing a queued task.
 * If you want to handle errors from an individual task, pass a callback to
 * `q.push()`.
 * Invoked with (task, callback).
 * @param {number} concurrency - An `integer` for determining how many `worker`
 * functions should be run in parallel.  If omitted, the concurrency defaults to
 * `1`.  If the concurrency is `0`, an error is thrown.
 * @returns {module:ControlFlow.QueueObject} A priorityQueue object to manage the tasks. There are two
 * differences between `queue` and `priorityQueue` objects:
 * * `push(task, priority, [callback])` - `priority` should be a number. If an
 *   array of `tasks` is given, all tasks will be assigned the same priority.
 * * The `unshift` method was removed.
 */
var priorityQueue = function(worker, concurrency) {
    // Start with a normal queue
    var q = queue$1(worker, concurrency);

    // Override push to accept second parameter representing priority
    q.push = function(data, priority, callback) {
        if (callback == null) callback = noop;
        if (typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
            data = [data];
        }
        if (data.length === 0) {
            // call drain immediately if there are no tasks
            return setImmediate$1(function() {
                q.drain();
            });
        }

        priority = priority || 0;
        var nextNode = q._tasks.head;
        while (nextNode && priority >= nextNode.priority) {
            nextNode = nextNode.next;
        }

        for (var i = 0, l = data.length; i < l; i++) {
            var item = {
                data: data[i],
                priority: priority,
                callback: callback
            };

            if (nextNode) {
                q._tasks.insertBefore(nextNode, item);
            } else {
                q._tasks.push(item);
            }
        }
        setImmediate$1(q.process);
    };

    // Remove unshift function
    delete q.unshift;

    return q;
};

/**
 * Runs the `tasks` array of functions in parallel, without waiting until the
 * previous function has completed. Once any of the `tasks` complete or pass an
 * error to its callback, the main `callback` is immediately called. It's
 * equivalent to `Promise.race()`.
 *
 * @name race
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array} tasks - An array containing [async functions]{@link AsyncFunction}
 * to run. Each function can complete with an optional `result` value.
 * @param {Function} callback - A callback to run once any of the functions have
 * completed. This function gets an error or result from the first function that
 * completed. Invoked with (err, result).
 * @returns undefined
 * @example
 *
 * async.race([
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ],
 * // main callback
 * function(err, result) {
 *     // the result will be equal to 'two' as it finishes earlier
 * });
 */
function race(tasks, callback) {
    callback = once(callback || noop);
    if (!isArray(tasks)) return callback(new TypeError('First argument to race must be an array of functions'));
    if (!tasks.length) return callback();
    for (var i = 0, l = tasks.length; i < l; i++) {
        wrapAsync(tasks[i])(callback);
    }
}

/**
 * Same as [`reduce`]{@link module:Collections.reduce}, only operates on `array` in reverse order.
 *
 * @name reduceRight
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reduce]{@link module:Collections.reduce}
 * @alias foldr
 * @category Collection
 * @param {Array} array - A collection to iterate over.
 * @param {*} memo - The initial state of the reduction.
 * @param {AsyncFunction} iteratee - A function applied to each item in the
 * array to produce the next step in the reduction.
 * The `iteratee` should complete with the next state of the reduction.
 * If the iteratee complete with an error, the reduction is stopped and the
 * main `callback` is immediately called with the error.
 * Invoked with (memo, item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the reduced value. Invoked with
 * (err, result).
 */
function reduceRight (array, memo, iteratee, callback) {
    var reversed = slice(array).reverse();
    reduce(reversed, memo, iteratee, callback);
}

/**
 * Wraps the async function in another function that always completes with a
 * result object, even when it errors.
 *
 * The result object has either the property `error` or `value`.
 *
 * @name reflect
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} fn - The async function you want to wrap
 * @returns {Function} - A function that always passes null to it's callback as
 * the error. The second argument to the callback will be an `object` with
 * either an `error` or a `value` property.
 * @example
 *
 * async.parallel([
 *     async.reflect(function(callback) {
 *         // do some stuff ...
 *         callback(null, 'one');
 *     }),
 *     async.reflect(function(callback) {
 *         // do some more stuff but error ...
 *         callback('bad stuff happened');
 *     }),
 *     async.reflect(function(callback) {
 *         // do some more stuff ...
 *         callback(null, 'two');
 *     })
 * ],
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results[0].value = 'one'
 *     // results[1].error = 'bad stuff happened'
 *     // results[2].value = 'two'
 * });
 */
function reflect(fn) {
    var _fn = wrapAsync(fn);
    return initialParams(function reflectOn(args, reflectCallback) {
        args.push(function callback(error, cbArg) {
            if (error) {
                reflectCallback(null, { error: error });
            } else {
                var value;
                if (arguments.length <= 2) {
                    value = cbArg;
                } else {
                    value = slice(arguments, 1);
                }
                reflectCallback(null, { value: value });
            }
        });

        return _fn.apply(this, args);
    });
}

function reject$1(eachfn, arr, iteratee, callback) {
    _filter(eachfn, arr, function(value, cb) {
        iteratee(value, function(err, v) {
            cb(err, !v);
        });
    }, callback);
}

/**
 * The opposite of [`filter`]{@link module:Collections.filter}. Removes values that pass an `async` truth test.
 *
 * @name reject
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`.
 * The should complete with a boolean value as its `result`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 * @example
 *
 * async.reject(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, results) {
 *     // results now equals an array of missing files
 *     createFiles(results);
 * });
 */
var reject = doParallel(reject$1);

/**
 * A helper function that wraps an array or an object of functions with `reflect`.
 *
 * @name reflectAll
 * @static
 * @memberOf module:Utils
 * @method
 * @see [async.reflect]{@link module:Utils.reflect}
 * @category Util
 * @param {Array|Object|Iterable} tasks - The collection of
 * [async functions]{@link AsyncFunction} to wrap in `async.reflect`.
 * @returns {Array} Returns an array of async functions, each wrapped in
 * `async.reflect`
 * @example
 *
 * let tasks = [
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         // do some more stuff but error ...
 *         callback(new Error('bad stuff happened'));
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ];
 *
 * async.parallel(async.reflectAll(tasks),
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results[0].value = 'one'
 *     // results[1].error = Error('bad stuff happened')
 *     // results[2].value = 'two'
 * });
 *
 * // an example using an object instead of an array
 * let tasks = {
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     two: function(callback) {
 *         callback('two');
 *     },
 *     three: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'three');
 *         }, 100);
 *     }
 * };
 *
 * async.parallel(async.reflectAll(tasks),
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results.one.value = 'one'
 *     // results.two.error = 'two'
 *     // results.three.value = 'three'
 * });
 */
function reflectAll(tasks) {
    var results;
    if (isArray(tasks)) {
        results = arrayMap(tasks, reflect);
    } else {
        results = {};
        baseForOwn(tasks, function(task, key) {
            results[key] = reflect.call(this, task);
        });
    }
    return results;
}

/**
 * The same as [`reject`]{@link module:Collections.reject} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name rejectLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reject]{@link module:Collections.reject}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`.
 * The should complete with a boolean value as its `result`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var rejectLimit = doParallelLimit(reject$1);

/**
 * The same as [`reject`]{@link module:Collections.reject} but runs only a single async operation at a time.
 *
 * @name rejectSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reject]{@link module:Collections.reject}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`.
 * The should complete with a boolean value as its `result`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var rejectSeries = doLimit(rejectLimit, 1);

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant$1(value) {
  return function() {
    return value;
  };
}

/**
 * Attempts to get a successful response from `task` no more than `times` times
 * before returning an error. If the task is successful, the `callback` will be
 * passed the result of the successful task. If all attempts fail, the callback
 * will be passed the error and result (if any) of the final attempt.
 *
 * @name retry
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @see [async.retryable]{@link module:ControlFlow.retryable}
 * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - Can be either an
 * object with `times` and `interval` or a number.
 * * `times` - The number of attempts to make before giving up.  The default
 *   is `5`.
 * * `interval` - The time to wait between retries, in milliseconds.  The
 *   default is `0`. The interval may also be specified as a function of the
 *   retry count (see example).
 * * `errorFilter` - An optional synchronous function that is invoked on
 *   erroneous result. If it returns `true` the retry attempts will continue;
 *   if the function returns `false` the retry flow is aborted with the current
 *   attempt's error and result being returned to the final callback.
 *   Invoked with (err).
 * * If `opts` is a number, the number specifies the number of times to retry,
 *   with the default interval of `0`.
 * @param {AsyncFunction} task - An async function to retry.
 * Invoked with (callback).
 * @param {Function} [callback] - An optional callback which is called when the
 * task has succeeded, or after the final failed attempt. It receives the `err`
 * and `result` arguments of the last attempt at completing the `task`. Invoked
 * with (err, results).
 *
 * @example
 *
 * // The `retry` function can be used as a stand-alone control flow by passing
 * // a callback, as shown below:
 *
 * // try calling apiMethod 3 times
 * async.retry(3, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod 3 times, waiting 200 ms between each retry
 * async.retry({times: 3, interval: 200}, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod 10 times with exponential backoff
 * // (i.e. intervals of 100, 200, 400, 800, 1600, ... milliseconds)
 * async.retry({
 *   times: 10,
 *   interval: function(retryCount) {
 *     return 50 * Math.pow(2, retryCount);
 *   }
 * }, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod the default 5 times no delay between each retry
 * async.retry(apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod only when error condition satisfies, all other
 * // errors will abort the retry control flow and return to final callback
 * async.retry({
 *   errorFilter: function(err) {
 *     return err.message === 'Temporary error'; // only retry on a specific error
 *   }
 * }, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // It can also be embedded within other control flow functions to retry
 * // individual methods that are not as reliable, like this:
 * async.auto({
 *     users: api.getUsers.bind(api),
 *     payments: async.retryable(3, api.getPayments.bind(api))
 * }, function(err, results) {
 *     // do something with the results
 * });
 *
 */
function retry(opts, task, callback) {
    var DEFAULT_TIMES = 5;
    var DEFAULT_INTERVAL = 0;

    var options = {
        times: DEFAULT_TIMES,
        intervalFunc: constant$1(DEFAULT_INTERVAL)
    };

    function parseTimes(acc, t) {
        if (typeof t === 'object') {
            acc.times = +t.times || DEFAULT_TIMES;

            acc.intervalFunc = typeof t.interval === 'function' ?
                t.interval :
                constant$1(+t.interval || DEFAULT_INTERVAL);

            acc.errorFilter = t.errorFilter;
        } else if (typeof t === 'number' || typeof t === 'string') {
            acc.times = +t || DEFAULT_TIMES;
        } else {
            throw new Error("Invalid arguments for async.retry");
        }
    }

    if (arguments.length < 3 && typeof opts === 'function') {
        callback = task || noop;
        task = opts;
    } else {
        parseTimes(options, opts);
        callback = callback || noop;
    }

    if (typeof task !== 'function') {
        throw new Error("Invalid arguments for async.retry");
    }

    var _task = wrapAsync(task);

    var attempt = 1;
    function retryAttempt() {
        _task(function(err) {
            if (err && attempt++ < options.times &&
                (typeof options.errorFilter != 'function' ||
                    options.errorFilter(err))) {
                setTimeout(retryAttempt, options.intervalFunc(attempt));
            } else {
                callback.apply(null, arguments);
            }
        });
    }

    retryAttempt();
}

/**
 * A close relative of [`retry`]{@link module:ControlFlow.retry}.  This method
 * wraps a task and makes it retryable, rather than immediately calling it
 * with retries.
 *
 * @name retryable
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.retry]{@link module:ControlFlow.retry}
 * @category Control Flow
 * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - optional
 * options, exactly the same as from `retry`
 * @param {AsyncFunction} task - the asynchronous function to wrap.
 * This function will be passed any arguments passed to the returned wrapper.
 * Invoked with (...args, callback).
 * @returns {AsyncFunction} The wrapped function, which when invoked, will
 * retry on an error, based on the parameters specified in `opts`.
 * This function will accept the same parameters as `task`.
 * @example
 *
 * async.auto({
 *     dep1: async.retryable(3, getFromFlakyService),
 *     process: ["dep1", async.retryable(3, function (results, cb) {
 *         maybeProcessData(results.dep1, cb);
 *     })]
 * }, callback);
 */
var retryable = function (opts, task) {
    if (!task) {
        task = opts;
        opts = null;
    }
    var _task = wrapAsync(task);
    return initialParams(function (args, callback) {
        function taskFn(cb) {
            _task.apply(null, args.concat(cb));
        }

        if (opts) retry(opts, taskFn, callback);
        else retry(taskFn, callback);

    });
};

/**
 * Run the functions in the `tasks` collection in series, each one running once
 * the previous function has completed. If any functions in the series pass an
 * error to its callback, no more functions are run, and `callback` is
 * immediately called with the value of the error. Otherwise, `callback`
 * receives an array of results when `tasks` have completed.
 *
 * It is also possible to use an object instead of an array. Each property will
 * be run as a function, and the results will be passed to the final `callback`
 * as an object instead of an array. This can be a more readable way of handling
 *  results from {@link async.series}.
 *
 * **Note** that while many implementations preserve the order of object
 * properties, the [ECMAScript Language Specification](http://www.ecma-international.org/ecma-262/5.1/#sec-8.6)
 * explicitly states that
 *
 * > The mechanics and order of enumerating the properties is not specified.
 *
 * So if you rely on the order in which your series of functions are executed,
 * and want this to work on all platforms, consider using an array.
 *
 * @name series
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection containing
 * [async functions]{@link AsyncFunction} to run in series.
 * Each function can complete with any number of optional `result` values.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed. This function gets a results array (or object)
 * containing all the result arguments passed to the `task` callbacks. Invoked
 * with (err, result).
 * @example
 * async.series([
 *     function(callback) {
 *         // do some stuff ...
 *         callback(null, 'one');
 *     },
 *     function(callback) {
 *         // do some more stuff ...
 *         callback(null, 'two');
 *     }
 * ],
 * // optional callback
 * function(err, results) {
 *     // results is now equal to ['one', 'two']
 * });
 *
 * async.series({
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 1);
 *         }, 200);
 *     },
 *     two: function(callback){
 *         setTimeout(function() {
 *             callback(null, 2);
 *         }, 100);
 *     }
 * }, function(err, results) {
 *     // results is now equal to: {one: 1, two: 2}
 * });
 */
function series(tasks, callback) {
    _parallel(eachOfSeries, tasks, callback);
}

/**
 * Returns `true` if at least one element in the `coll` satisfies an async test.
 * If any iteratee call returns `true`, the main `callback` is immediately
 * called.
 *
 * @name some
 * @static
 * @memberOf module:Collections
 * @method
 * @alias any
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in parallel.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 * @example
 *
 * async.some(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // if result is true then at least one of the files exists
 * });
 */
var some = doParallel(_createTester(Boolean, identity));

/**
 * The same as [`some`]{@link module:Collections.some} but runs a maximum of `limit` async operations at a time.
 *
 * @name someLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.some]{@link module:Collections.some}
 * @alias anyLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in parallel.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 */
var someLimit = doParallelLimit(_createTester(Boolean, identity));

/**
 * The same as [`some`]{@link module:Collections.some} but runs only a single async operation at a time.
 *
 * @name someSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.some]{@link module:Collections.some}
 * @alias anySeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in series.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 */
var someSeries = doLimit(someLimit, 1);

/**
 * Sorts a list by the results of running each `coll` value through an async
 * `iteratee`.
 *
 * @name sortBy
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a value to use as the sort criteria as
 * its `result`.
 * Invoked with (item, callback).
 * @param {Function} callback - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is the items
 * from the original `coll` sorted by the values returned by the `iteratee`
 * calls. Invoked with (err, results).
 * @example
 *
 * async.sortBy(['file1','file2','file3'], function(file, callback) {
 *     fs.stat(file, function(err, stats) {
 *         callback(err, stats.mtime);
 *     });
 * }, function(err, results) {
 *     // results is now the original array of files sorted by
 *     // modified date
 * });
 *
 * // By modifying the callback parameter the
 * // sorting order can be influenced:
 *
 * // ascending order
 * async.sortBy([1,9,3,5], function(x, callback) {
 *     callback(null, x);
 * }, function(err,result) {
 *     // result callback
 * });
 *
 * // descending order
 * async.sortBy([1,9,3,5], function(x, callback) {
 *     callback(null, x*-1);    //<- x*-1 instead of x, turns the order around
 * }, function(err,result) {
 *     // result callback
 * });
 */
function sortBy (coll, iteratee, callback) {
    var _iteratee = wrapAsync(iteratee);
    map(coll, function (x, callback) {
        _iteratee(x, function (err, criteria) {
            if (err) return callback(err);
            callback(null, {value: x, criteria: criteria});
        });
    }, function (err, results) {
        if (err) return callback(err);
        callback(null, arrayMap(results.sort(comparator), baseProperty('value')));
    });

    function comparator(left, right) {
        var a = left.criteria, b = right.criteria;
        return a < b ? -1 : a > b ? 1 : 0;
    }
}

/**
 * Sets a time limit on an asynchronous function. If the function does not call
 * its callback within the specified milliseconds, it will be called with a
 * timeout error. The code property for the error object will be `'ETIMEDOUT'`.
 *
 * @name timeout
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} asyncFn - The async function to limit in time.
 * @param {number} milliseconds - The specified time limit.
 * @param {*} [info] - Any variable you want attached (`string`, `object`, etc)
 * to timeout Error for more information..
 * @returns {AsyncFunction} Returns a wrapped function that can be used with any
 * of the control flow functions.
 * Invoke this function with the same parameters as you would `asyncFunc`.
 * @example
 *
 * function myFunction(foo, callback) {
 *     doAsyncTask(foo, function(err, data) {
 *         // handle errors
 *         if (err) return callback(err);
 *
 *         // do some stuff ...
 *
 *         // return processed data
 *         return callback(null, data);
 *     });
 * }
 *
 * var wrapped = async.timeout(myFunction, 1000);
 *
 * // call `wrapped` as you would `myFunction`
 * wrapped({ bar: 'bar' }, function(err, data) {
 *     // if `myFunction` takes < 1000 ms to execute, `err`
 *     // and `data` will have their expected values
 *
 *     // else `err` will be an Error with the code 'ETIMEDOUT'
 * });
 */
function timeout(asyncFn, milliseconds, info) {
    var fn = wrapAsync(asyncFn);

    return initialParams(function (args, callback) {
        var timedOut = false;
        var timer;

        function timeoutCallback() {
            var name = asyncFn.name || 'anonymous';
            var error  = new Error('Callback function "' + name + '" timed out.');
            error.code = 'ETIMEDOUT';
            if (info) {
                error.info = info;
            }
            timedOut = true;
            callback(error);
        }

        args.push(function () {
            if (!timedOut) {
                callback.apply(null, arguments);
                clearTimeout(timer);
            }
        });

        // setup timer and call original function
        timer = setTimeout(timeoutCallback, milliseconds);
        fn.apply(null, args);
    });
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeCeil = Math.ceil;
var nativeMax = Math.max;

/**
 * The base implementation of `_.range` and `_.rangeRight` which doesn't
 * coerce arguments.
 *
 * @private
 * @param {number} start The start of the range.
 * @param {number} end The end of the range.
 * @param {number} step The value to increment or decrement by.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Array} Returns the range of numbers.
 */
function baseRange(start, end, step, fromRight) {
  var index = -1,
      length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
      result = Array(length);

  while (length--) {
    result[fromRight ? length : ++index] = start;
    start += step;
  }
  return result;
}

/**
 * The same as [times]{@link module:ControlFlow.times} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name timesLimit
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.times]{@link module:ControlFlow.times}
 * @category Control Flow
 * @param {number} count - The number of times to run the function.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - The async function to call `n` times.
 * Invoked with the iteration index and a callback: (n, next).
 * @param {Function} callback - see [async.map]{@link module:Collections.map}.
 */
function timeLimit(count, limit, iteratee, callback) {
    var _iteratee = wrapAsync(iteratee);
    mapLimit(baseRange(0, count, 1), limit, _iteratee, callback);
}

/**
 * Calls the `iteratee` function `n` times, and accumulates results in the same
 * manner you would use with [map]{@link module:Collections.map}.
 *
 * @name times
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Control Flow
 * @param {number} n - The number of times to run the function.
 * @param {AsyncFunction} iteratee - The async function to call `n` times.
 * Invoked with the iteration index and a callback: (n, next).
 * @param {Function} callback - see {@link module:Collections.map}.
 * @example
 *
 * // Pretend this is some complicated async factory
 * var createUser = function(id, callback) {
 *     callback(null, {
 *         id: 'user' + id
 *     });
 * };
 *
 * // generate 5 users
 * async.times(5, function(n, next) {
 *     createUser(n, function(err, user) {
 *         next(err, user);
 *     });
 * }, function(err, users) {
 *     // we should now have 5 users
 * });
 */
var times = doLimit(timeLimit, Infinity);

/**
 * The same as [times]{@link module:ControlFlow.times} but runs only a single async operation at a time.
 *
 * @name timesSeries
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.times]{@link module:ControlFlow.times}
 * @category Control Flow
 * @param {number} n - The number of times to run the function.
 * @param {AsyncFunction} iteratee - The async function to call `n` times.
 * Invoked with the iteration index and a callback: (n, next).
 * @param {Function} callback - see {@link module:Collections.map}.
 */
var timesSeries = doLimit(timeLimit, 1);

/**
 * A relative of `reduce`.  Takes an Object or Array, and iterates over each
 * element in series, each step potentially mutating an `accumulator` value.
 * The type of the accumulator defaults to the type of collection passed in.
 *
 * @name transform
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {*} [accumulator] - The initial state of the transform.  If omitted,
 * it will default to an empty Object or Array, depending on the type of `coll`
 * @param {AsyncFunction} iteratee - A function applied to each item in the
 * collection that potentially modifies the accumulator.
 * Invoked with (accumulator, item, key, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the transformed accumulator.
 * Invoked with (err, result).
 * @example
 *
 * async.transform([1,2,3], function(acc, item, index, callback) {
 *     // pointless async:
 *     process.nextTick(function() {
 *         acc.push(item * 2)
 *         callback(null)
 *     });
 * }, function(err, result) {
 *     // result is now equal to [2, 4, 6]
 * });
 *
 * @example
 *
 * async.transform({a: 1, b: 2, c: 3}, function (obj, val, key, callback) {
 *     setImmediate(function () {
 *         obj[key] = val * 2;
 *         callback();
 *     })
 * }, function (err, result) {
 *     // result is equal to {a: 2, b: 4, c: 6}
 * })
 */
function transform (coll, accumulator, iteratee, callback) {
    if (arguments.length <= 3) {
        callback = iteratee;
        iteratee = accumulator;
        accumulator = isArray(coll) ? [] : {};
    }
    callback = once(callback || noop);
    var _iteratee = wrapAsync(iteratee);

    eachOf(coll, function(v, k, cb) {
        _iteratee(accumulator, v, k, cb);
    }, function(err) {
        callback(err, accumulator);
    });
}

/**
 * It runs each task in series but stops whenever any of the functions were
 * successful. If one of the tasks were successful, the `callback` will be
 * passed the result of the successful task. If all tasks fail, the callback
 * will be passed the error and result (if any) of the final attempt.
 *
 * @name tryEach
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection containing functions to
 * run, each function is passed a `callback(err, result)` it must call on
 * completion with an error `err` (which can be `null`) and an optional `result`
 * value.
 * @param {Function} [callback] - An optional callback which is called when one
 * of the tasks has succeeded, or all have failed. It receives the `err` and
 * `result` arguments of the last attempt at completing the `task`. Invoked with
 * (err, results).
 * @example
 * async.try([
 *     function getDataFromFirstWebsite(callback) {
 *         // Try getting the data from the first website
 *         callback(err, data);
 *     },
 *     function getDataFromSecondWebsite(callback) {
 *         // First website failed,
 *         // Try getting the data from the backup website
 *         callback(err, data);
 *     }
 * ],
 * // optional callback
 * function(err, results) {
 *     Now do something with the data.
 * });
 *
 */
function tryEach(tasks, callback) {
    var error = null;
    var result;
    callback = callback || noop;
    eachSeries(tasks, function(task, callback) {
        wrapAsync(task)(function (err, res/*, ...args*/) {
            if (arguments.length > 2) {
                result = slice(arguments, 1);
            } else {
                result = res;
            }
            error = err;
            callback(!err);
        });
    }, function () {
        callback(error, result);
    });
}

/**
 * Undoes a [memoize]{@link module:Utils.memoize}d function, reverting it to the original,
 * unmemoized form. Handy for testing.
 *
 * @name unmemoize
 * @static
 * @memberOf module:Utils
 * @method
 * @see [async.memoize]{@link module:Utils.memoize}
 * @category Util
 * @param {AsyncFunction} fn - the memoized function
 * @returns {AsyncFunction} a function that calls the original unmemoized function
 */
function unmemoize(fn) {
    return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
    };
}

/**
 * Repeatedly call `iteratee`, while `test` returns `true`. Calls `callback` when
 * stopped, or an error occurs.
 *
 * @name whilst
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Function} test - synchronous truth test to perform before each
 * execution of `iteratee`. Invoked with ().
 * @param {AsyncFunction} iteratee - An async function which is called each time
 * `test` passes. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `iteratee` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `iteratee`'s
 * callback. Invoked with (err, [results]);
 * @returns undefined
 * @example
 *
 * var count = 0;
 * async.whilst(
 *     function() { return count < 5; },
 *     function(callback) {
 *         count++;
 *         setTimeout(function() {
 *             callback(null, count);
 *         }, 1000);
 *     },
 *     function (err, n) {
 *         // 5 seconds have passed, n = 5
 *     }
 * );
 */
function whilst(test, iteratee, callback) {
    callback = onlyOnce(callback || noop);
    var _iteratee = wrapAsync(iteratee);
    if (!test()) return callback(null);
    var next = function(err/*, ...args*/) {
        if (err) return callback(err);
        if (test()) return _iteratee(next);
        var args = slice(arguments, 1);
        callback.apply(null, [null].concat(args));
    };
    _iteratee(next);
}

/**
 * Repeatedly call `iteratee` until `test` returns `true`. Calls `callback` when
 * stopped, or an error occurs. `callback` will be passed an error and any
 * arguments passed to the final `iteratee`'s callback.
 *
 * The inverse of [whilst]{@link module:ControlFlow.whilst}.
 *
 * @name until
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {Function} test - synchronous truth test to perform before each
 * execution of `iteratee`. Invoked with ().
 * @param {AsyncFunction} iteratee - An async function which is called each time
 * `test` fails. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has passed and repeated execution of `iteratee` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `iteratee`'s
 * callback. Invoked with (err, [results]);
 */
function until(test, iteratee, callback) {
    whilst(function() {
        return !test.apply(this, arguments);
    }, iteratee, callback);
}

/**
 * Runs the `tasks` array of functions in series, each passing their results to
 * the next in the array. However, if any of the `tasks` pass an error to their
 * own callback, the next function is not executed, and the main `callback` is
 * immediately called with the error.
 *
 * @name waterfall
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array} tasks - An array of [async functions]{@link AsyncFunction}
 * to run.
 * Each function should complete with any number of `result` values.
 * The `result` values will be passed as arguments, in order, to the next task.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed. This will be passed the results of the last task's
 * callback. Invoked with (err, [results]).
 * @returns undefined
 * @example
 *
 * async.waterfall([
 *     function(callback) {
 *         callback(null, 'one', 'two');
 *     },
 *     function(arg1, arg2, callback) {
 *         // arg1 now equals 'one' and arg2 now equals 'two'
 *         callback(null, 'three');
 *     },
 *     function(arg1, callback) {
 *         // arg1 now equals 'three'
 *         callback(null, 'done');
 *     }
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 *
 * // Or, with named functions:
 * async.waterfall([
 *     myFirstFunction,
 *     mySecondFunction,
 *     myLastFunction,
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 * function myFirstFunction(callback) {
 *     callback(null, 'one', 'two');
 * }
 * function mySecondFunction(arg1, arg2, callback) {
 *     // arg1 now equals 'one' and arg2 now equals 'two'
 *     callback(null, 'three');
 * }
 * function myLastFunction(arg1, callback) {
 *     // arg1 now equals 'three'
 *     callback(null, 'done');
 * }
 */
var waterfall = function(tasks, callback) {
    callback = once(callback || noop);
    if (!isArray(tasks)) return callback(new Error('First argument to waterfall must be an array of functions'));
    if (!tasks.length) return callback();
    var taskIndex = 0;

    function nextTask(args) {
        var task = wrapAsync(tasks[taskIndex++]);
        args.push(onlyOnce(next));
        task.apply(null, args);
    }

    function next(err/*, ...args*/) {
        if (err || taskIndex === tasks.length) {
            return callback.apply(null, arguments);
        }
        nextTask(slice(arguments, 1));
    }

    nextTask([]);
};

/**
 * An "async function" in the context of Async is an asynchronous function with
 * a variable number of parameters, with the final parameter being a callback.
 * (`function (arg1, arg2, ..., callback) {}`)
 * The final callback is of the form `callback(err, results...)`, which must be
 * called once the function is completed.  The callback should be called with a
 * Error as its first argument to signal that an error occurred.
 * Otherwise, if no error occurred, it should be called with `null` as the first
 * argument, and any additional `result` arguments that may apply, to signal
 * successful completion.
 * The callback must be called exactly once, ideally on a later tick of the
 * JavaScript event loop.
 *
 * This type of function is also referred to as a "Node-style async function",
 * or a "continuation passing-style function" (CPS). Most of the methods of this
 * library are themselves CPS/Node-style async functions, or functions that
 * return CPS/Node-style async functions.
 *
 * Wherever we accept a Node-style async function, we also directly accept an
 * [ES2017 `async` function]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function}.
 * In this case, the `async` function will not be passed a final callback
 * argument, and any thrown error will be used as the `err` argument of the
 * implicit callback, and the return value will be used as the `result` value.
 * (i.e. a `rejected` of the returned Promise becomes the `err` callback
 * argument, and a `resolved` value becomes the `result`.)
 *
 * Note, due to JavaScript limitations, we can only detect native `async`
 * functions and not transpilied implementations.
 * Your environment must have `async`/`await` support for this to work.
 * (e.g. Node > v7.6, or a recent version of a modern browser).
 * If you are using `async` functions through a transpiler (e.g. Babel), you
 * must still wrap the function with [asyncify]{@link module:Utils.asyncify},
 * because the `async function` will be compiled to an ordinary function that
 * returns a promise.
 *
 * @typedef {Function} AsyncFunction
 * @static
 */

/**
 * Async is a utility module which provides straight-forward, powerful functions
 * for working with asynchronous JavaScript. Although originally designed for
 * use with [Node.js](http://nodejs.org) and installable via
 * `npm install --save async`, it can also be used directly in the browser.
 * @module async
 * @see AsyncFunction
 */


/**
 * A collection of `async` functions for manipulating collections, such as
 * arrays and objects.
 * @module Collections
 */

/**
 * A collection of `async` functions for controlling the flow through a script.
 * @module ControlFlow
 */

/**
 * A collection of `async` utility functions.
 * @module Utils
 */

var index = {
    applyEach: applyEach,
    applyEachSeries: applyEachSeries,
    apply: apply,
    asyncify: asyncify,
    auto: auto,
    autoInject: autoInject,
    cargo: cargo,
    compose: compose,
    concat: concat,
    concatLimit: concatLimit,
    concatSeries: concatSeries,
    constant: constant,
    detect: detect,
    detectLimit: detectLimit,
    detectSeries: detectSeries,
    dir: dir,
    doDuring: doDuring,
    doUntil: doUntil,
    doWhilst: doWhilst,
    during: during,
    each: eachLimit,
    eachLimit: eachLimit$1,
    eachOf: eachOf,
    eachOfLimit: eachOfLimit,
    eachOfSeries: eachOfSeries,
    eachSeries: eachSeries,
    ensureAsync: ensureAsync,
    every: every,
    everyLimit: everyLimit,
    everySeries: everySeries,
    filter: filter,
    filterLimit: filterLimit,
    filterSeries: filterSeries,
    forever: forever,
    groupBy: groupBy,
    groupByLimit: groupByLimit,
    groupBySeries: groupBySeries,
    log: log,
    map: map,
    mapLimit: mapLimit,
    mapSeries: mapSeries,
    mapValues: mapValues,
    mapValuesLimit: mapValuesLimit,
    mapValuesSeries: mapValuesSeries,
    memoize: memoize,
    nextTick: nextTick,
    parallel: parallelLimit,
    parallelLimit: parallelLimit$1,
    priorityQueue: priorityQueue,
    queue: queue$1,
    race: race,
    reduce: reduce,
    reduceRight: reduceRight,
    reflect: reflect,
    reflectAll: reflectAll,
    reject: reject,
    rejectLimit: rejectLimit,
    rejectSeries: rejectSeries,
    retry: retry,
    retryable: retryable,
    seq: seq,
    series: series,
    setImmediate: setImmediate$1,
    some: some,
    someLimit: someLimit,
    someSeries: someSeries,
    sortBy: sortBy,
    timeout: timeout,
    times: times,
    timesLimit: timeLimit,
    timesSeries: timesSeries,
    transform: transform,
    tryEach: tryEach,
    unmemoize: unmemoize,
    until: until,
    waterfall: waterfall,
    whilst: whilst,

    // aliases
    all: every,
    any: some,
    forEach: eachLimit,
    forEachSeries: eachSeries,
    forEachLimit: eachLimit$1,
    forEachOf: eachOf,
    forEachOfSeries: eachOfSeries,
    forEachOfLimit: eachOfLimit,
    inject: reduce,
    foldl: reduce,
    foldr: reduceRight,
    select: filter,
    selectLimit: filterLimit,
    selectSeries: filterSeries,
    wrapSync: asyncify
};

exports['default'] = index;
exports.applyEach = applyEach;
exports.applyEachSeries = applyEachSeries;
exports.apply = apply;
exports.asyncify = asyncify;
exports.auto = auto;
exports.autoInject = autoInject;
exports.cargo = cargo;
exports.compose = compose;
exports.concat = concat;
exports.concatLimit = concatLimit;
exports.concatSeries = concatSeries;
exports.constant = constant;
exports.detect = detect;
exports.detectLimit = detectLimit;
exports.detectSeries = detectSeries;
exports.dir = dir;
exports.doDuring = doDuring;
exports.doUntil = doUntil;
exports.doWhilst = doWhilst;
exports.during = during;
exports.each = eachLimit;
exports.eachLimit = eachLimit$1;
exports.eachOf = eachOf;
exports.eachOfLimit = eachOfLimit;
exports.eachOfSeries = eachOfSeries;
exports.eachSeries = eachSeries;
exports.ensureAsync = ensureAsync;
exports.every = every;
exports.everyLimit = everyLimit;
exports.everySeries = everySeries;
exports.filter = filter;
exports.filterLimit = filterLimit;
exports.filterSeries = filterSeries;
exports.forever = forever;
exports.groupBy = groupBy;
exports.groupByLimit = groupByLimit;
exports.groupBySeries = groupBySeries;
exports.log = log;
exports.map = map;
exports.mapLimit = mapLimit;
exports.mapSeries = mapSeries;
exports.mapValues = mapValues;
exports.mapValuesLimit = mapValuesLimit;
exports.mapValuesSeries = mapValuesSeries;
exports.memoize = memoize;
exports.nextTick = nextTick;
exports.parallel = parallelLimit;
exports.parallelLimit = parallelLimit$1;
exports.priorityQueue = priorityQueue;
exports.queue = queue$1;
exports.race = race;
exports.reduce = reduce;
exports.reduceRight = reduceRight;
exports.reflect = reflect;
exports.reflectAll = reflectAll;
exports.reject = reject;
exports.rejectLimit = rejectLimit;
exports.rejectSeries = rejectSeries;
exports.retry = retry;
exports.retryable = retryable;
exports.seq = seq;
exports.series = series;
exports.setImmediate = setImmediate$1;
exports.some = some;
exports.someLimit = someLimit;
exports.someSeries = someSeries;
exports.sortBy = sortBy;
exports.timeout = timeout;
exports.times = times;
exports.timesLimit = timeLimit;
exports.timesSeries = timesSeries;
exports.transform = transform;
exports.tryEach = tryEach;
exports.unmemoize = unmemoize;
exports.until = until;
exports.waterfall = waterfall;
exports.whilst = whilst;
exports.all = every;
exports.allLimit = everyLimit;
exports.allSeries = everySeries;
exports.any = some;
exports.anyLimit = someLimit;
exports.anySeries = someSeries;
exports.find = detect;
exports.findLimit = detectLimit;
exports.findSeries = detectSeries;
exports.forEach = eachLimit;
exports.forEachSeries = eachSeries;
exports.forEachLimit = eachLimit$1;
exports.forEachOf = eachOf;
exports.forEachOfSeries = eachOfSeries;
exports.forEachOfLimit = eachOfLimit;
exports.inject = reduce;
exports.foldl = reduce;
exports.foldr = reduceRight;
exports.select = filter;
exports.selectLimit = filterLimit;
exports.selectSeries = filterSeries;
exports.wrapSync = asyncify;

Object.defineProperty(exports, '__esModule', { value: true });

})));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(23).setImmediate, __webpack_require__(5), __webpack_require__(8), __webpack_require__(12)(module)))

/***/ }),
/* 5 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var BaseClient = __webpack_require__(3);
var util = __webpack_require__(1);
var Validate = __webpack_require__(2); // Finsemble args validator
var WorkspaceClient = __webpack_require__(11);

var Logger = __webpack_require__(0);

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

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var StorageClient = __webpack_require__(15);
var WorkspaceClient = __webpack_require__(11);
var LauncherClient = __webpack_require__(6);
var util = __webpack_require__(1);
var BaseClient = __webpack_require__(3);
var Logger = __webpack_require__(0);
var Validate = __webpack_require__(2); // Finsemble args validator
var deepEqual = __webpack_require__(21);
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

/***/ }),
/* 8 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var Dispatcher = __webpack_require__(19).Dispatcher;

var Utils = __webpack_require__(1);
var Validate = __webpack_require__(2); // Finsemble args validator

var BaseClient = __webpack_require__(3);
var Logger = __webpack_require__(0);
Logger.system.log("Starting DataStoreClient");

var StoreModel;
/**
 *
 * @introduction
 * <h2>Data  Store Client (Beta)</h2>
 * The data store client handles creating/retrieving/destroying stores. Stores are used to save and retrieve data either locally or globally. This data is not persisted. You can add listeners at multiple levels (store or field) and get the updated data as it's updated in the store. Fields are stored within the store as key/value pair.
 * @hideConstructor true
 * @constructor
 */

var DataStoreClient = function (params) {
	BaseClient.call(this, params);
	var self = this;
	var localStore = {};
	this.ls = localStore;


	/**
	 * Get a store. If no store is set then we'll get the global Finsemble store. If global is not set we'll check local first then we'll check global.
	 * @param {Object} params - Params object
	 * @param {String} [params.store] -  The namespace of the value
	 * @param {Bool} [params.global] - Is this a global store?
	 * @param {function=}cb -  Will return the value if found.
	 * @returns {StoreModel} - returns the store
	 * @example
	 * DataStoreClient.getStore({store:'store1'},function(storeObject){});
	 */
	this.getStore = function (params, cb) {

		var store = "finsemble";
		if (params.store) { store = params.store; }
		if (params.global) {
			return getGlobalStore(params, cb);

		}
		if (localStore[params.store]) {
			return cb(null, localStore[params.store]);
		}

		return getGlobalStore(params, cb);

	};

	function getGlobalStore(params, cb) {
		function returnStore(err, response) {
			if (err) { return cb(err); }
			return cb(err, new StoreModel(response.data, self.routerClient));
		}

		return self.routerClient.query("storeService.getStore", params, returnStore);
	}

	/**
	 *Creates a store.
	 * @param {Object} params - Params object
	 * @param {String} params.store -  The namespace of to use
	 * @param {ANY} [params.values]-  Starting values for the store
	 * @param {Bool} [params.global] - Is this a global store?
	 * @param {function=}cb -  Will return the store on success.
	 * @returns {StoreModel} - returns the store
	 * @example
	 * DataStoreClient.createStore({store:"store1",global:false,values:{}},function(storeObject){});
	 */
	this.createStore = function (params, cb) {
		if (params.global) {
			return this.routerClient.query("storeService.createStore", params, function (err, response) {
				if (err) { return cb(err); }
				return cb(err, new StoreModel(response.data, self.routerClient));
			});
		}

		if (localStore[params.store]) { return cb(null, localStore[params.store]); }

		var ls = new StoreModel(params, self.routerClient);
		localStore[ls.name] = ls;
		return cb(null, ls);
	};

	/**
	 * Remove a store . If global is not set and a local store isn't found we'll try to remove the global store
	 * @param {Object} params - Params object
	 * @param {String} params.store -  The namespace of to use
	 * @param {Bool} [params.global] - Is this a global store?
	 * @param {function=}cb
	 * @example
	 * DataStoreClient.removeStore({store:"store1",global:true},function(){});
	 */
	this.removeStore = function (params, cb) {
		if (params.global) {
			return removeGlobalStore(params, cb);
		}
		if (localStore[params.store]) {
			delete localStore[params.store];
			return cb(null, true);
		}
		removeGlobalStore(params, cb);// If global flag is not set but we don't find it local, try global////Should we have this?

	};

	function removeGlobalStore(params, cb) {
		self.routerClient.query("storeService.removeStore", params, function (err, response) {
			if (err) { return cb(err, false); }
			return cb(err, response.data);
		});

	}

	this.load = function (cb) {

		cb();
	};
};

var storeClient = new DataStoreClient({
	onReady: function (cb) {
		Logger.system.log("store online");
		StoreModel = __webpack_require__(24);
		storeClient.load(cb);

	},
	name: "dataStoreClient"
});


window.dataStoreClient = storeClient;
storeClient.requiredServices = [];
module.exports = storeClient;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

/**
 * @introduction
 * <h2>Router Client Instance</h2>
 * Exports a single shared instance of the router client.  See {@link RouterClientConstructor} for the complete API definition with examples.
 *
 * Example:
 *
 *	// get a shared instance of RouterClient (shared within the containing component or service)
 *	var RouterClient = require('./routerClientInstance');
 *
 * @namespace routerClientInstance
 * @shouldBePublished false
 */



var RouterClientConstructor = __webpack_require__(28);

module.exports = new RouterClientConstructor({ clientName: "RouterClient" });

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

var BaseClient = __webpack_require__(3);
var util = __webpack_require__(1);
var Validate = __webpack_require__(2); // Finsemble args validator
var Logger = __webpack_require__(0);

Logger.system.log("Starting WorkspaceClient");

/**
 * @introduction
 * <h2>Workspace Client</h2>
 * ----------
 * The workspace client manages all calls to load, save, rename, and delete workspaces. Before reading this, please check out [Understanding Workspaces]{@tutorial workspaces}.
 * @hideConstructor true
 * @constructor
 * @summary You don't need to ever invoke the constructor. This is done for you when WindowClient is added to the FSBL object.
 */
function WorkspaceClient(params) {
	Validate.args(params, "object=") && params && Validate.args2("params.onReady", params.onReady, "function=");
	/** @alias WorkspaceClient# */
	BaseClient.call(this, params);

	var self = this;

	/**
	* List of all workspaces within the application.
	* @type WorkspaceClient
	*/
	this.workspaces = [];

	/**
	* Reference to the activeWorkspace object
	* @type WorkspaceClient
	*/
	this.activeWorkspace = {};

	/**
	 * Adds window to active workspace.
	 * @private
	 * @param {object} params
	 * @param {string} params.name Window name
	 * @param {function} cb Callback
	 */
	this.addWindow = function (params, cb) {
		Validate.args(params, "object", cb, "function=") && params && Validate.args2("params.name", params.name, "string");
		cb = cb || function noop() { }; // cb is optional but not for underlying query
		this.routerClient.query("WorkspaceService.addWindow", params, cb);
	};
	/**
	 * AutoArranges windows.
	 * @param {object} 	[params] Parameters
	 * @param {string} [params.monitor] Same options as {@link LauncherClient#showWindow}. Default is monitor of calling window.
	 * @param {function=} cb Callback
	 * @example
	 * FSBL.Clients.WorkspaceClient.autoArrange(function(err, response){
	 * 		//do something after the autoarrange, maybe make all of the windows flash or notify the user that their monitor is now tidy.
	 * });
	 */
	this.autoArrange = function (params, cb) {
		Validate.args(params, "object", cb, "function=");
		cb = cb || function noop() { }; // cb is optional but not for underlying query
		params = params ? params : {};
		FSBL.Clients.LauncherClient.getMonitorInfo({
			windowIdentifier: FSBL.Clients.LauncherClient.myWindowIdentifier
		}, function (err, dimensions) {
			params.monitorDimensions = dimensions.unclaimedRect;
			self.routerClient.query("DockingService.autoArrange", params, cb);
		});
	};
	/**
	 * Brings all windows to the front.
	 * @param {object} params
	 * @param {string} 	[params.monitor] Same options as {@link LauncherClient#showWindow} except that "all" will work for all monitors. Defaults to the monitor for the current window.
	 * @param {function} [cb] Callback.
	 * @todo rename to something like <code>bringToFront</code> and put the 'Only affects visible windows' bit in the documentation.
	 * @example
	 * FSBL.Clients.WorkspaceClient.bringWindowsToFront();
	 */
	this.bringWindowsToFront = function (params, cb) {
		Validate.args(params, "object", cb, "function=");
		cb = cb || function noop() { }; // cb is optional but not for underlying query
		params = params ? params : {};
		util.getMyWindowIdentifier(function (myWindowIdentifier) {
			if (!params.windowIdentifier) {
				params.windowIdentifier = myWindowIdentifier;
			}
			self.routerClient.query("WorkspaceService.bringWindowsToFront", params, cb);
		});
	};

	/**
	 * Gets the currently active workspace.
	 * @param {function} cb Callback
	 * @example <caption>This function is useful for setting the initial state of a menu or dialog. It is used in the toolbar component to set the initial state.</caption>
	 *
	FSBL.Clients.WorkspaceClient.getActiveWorkspace(function (err, response) {
		//setState is a React component method.
		self.setState({
			workspaces: response
		});
	});
	 */
	this.getActiveWorkspace = function (cb) {
		Validate.args(cb, "function");

		cb(null, this.activeWorkspace);

	};

	/**
	 * Returns the list of saved workspaces.
	 * @param {function} cb Callback
	 * @example <caption>This function is useful for setting the initial state of a menu or dialog.</caption>
	 *
	FSBL.Clients.WorkspaceClient.getWorkspaces(function (err, response) {
		//setState is a React component method.
		self.setState({
			workspaces: response
		});
	});
	 */
	this.getWorkspaces = function (cb) {
		Validate.args(cb, "function");
		this.routerClient.query("WorkspaceService.getWorkspaces", null,
			function getWorkspacesCallback(err, response) {
				if (err) {
					return Logger.system.error(err);
				}
				if (response) {
					cb(err, response.data);
				} else {
					cb(err, null);
				}
			});
	};

	/**
	 * Removes a workspace. Either the workspace object or its name must be provided.
	 * @param {object} params
	 * @param {Boolean}	[params.persist=false] Whether to persist the change.
	 * @param {Object} 	[params.workspace] Workspace
	 * @param {string} 	[params.name] Workspace Name
	 * @param {function=} cb Callback to fire after 'Finsemble.WorkspaceService.update' is transmitted.
	 * @example <caption>This function removes 'My Workspace' from the main menu and the default storage tied to the applicaton.</caption>
	 * FSBL.Clients.WorkspaceClient.remove({
		name: 'My Workspace',
		persist: true
	  }, function(err, response){
	 		//You typically won't do anything here. If you'd like to do something when a workspace change happens, we suggest listening on the `Finsemble.WorkspaceService.update` channel.
	  });
	 */

	this.remove = function (params, cb) {
		Validate.args(params, "object", cb, "function=") && !(params.name || params.workspace) && Validate.args2("params.name", params.name, "string");
		cb = cb || function noop() { }; // cb is optional but not for underlying query

		if (typeof (params.workspace !== undefined) && (params.workspace === self.activeWorkspace)) {
			cb("Error: Cannot remove active workspace " + self.activeWorkspace.name, null);
			Logger.system.debug("attempt to remove active workspace:" + self.activeWorkspace.name);
		} else if (typeof (params.name !== undefined) && (params.name === self.activeWorkspace.name)) {
			cb("Error: Cannot remove active workspace name " + self.activeWorkspace.name, null);
			Logger.system.debug("attempt to remove active workspace name:" + self.activeWorkspace.name);
		} else { // remove the inactive workspace
			var defaultParams = {
				persist: false,
				workspace: null,
				name: null
			};
			//sets defaults for undefined params.
			params.prototype = Object.create(defaultParams);
			this.routerClient.query("WorkspaceService.remove", params,
				function removeWorkspaceCallback(err, response) {
					if (err) {
						return Logger.system.error(err);
					}

					if (response) {
						cb(err, "success");
					} else {
						cb(err, null);
					}
				});
		}
	};
	/**
	 * Removes window from active workspace.
	 * @param {object} params
	 * @param {string} params.name Window name
	 * @param {function=} [cb] Callback
	 * @example <caption>This method removes a window from a workspace. It is rarely called by the developer. It is called when a window that is using the window manager is closed. That way, the next time the app is loaded, that window is not spawned.</caption>
	 *FSBL.Clients.WorkspaceClient.removeWindow({name:windowName}, function(err, response){
		 //do something after removing the window.
	 });
	 */
	this.removeWindow = function (params, cb) {
		Validate.args(params, "object", cb, "function=") && Validate.args2("params.name", params.name, "string");
		cb = cb || function noop() { }; // cb is optional but not for underlying query
		this.routerClient.query("WorkspaceService.removeWindow", params,
			function removeWindowCallback(err, response) {
				if (err) {
					return Logger.system.error(err);
				}
				if (response) {
					cb(err, response.data);
				} else {
					cb(err, null);
				}
			});
	};

	/**
	 * Renames the workspace with the provided name. Also removes all references in storage to the old workspace's name.
	 * @param {object} params
	 * @param {string} params.oldName Name of workspace to rename.
	 * @param {string} params.newName What to rename the workspace to.
	 * @param {boolean=} [params.removeOldWorkspace=true] Whether to remove references to old workspace after renaming.
	 * @param {boolean=} [params.overwriteExisting=false] Whether to overwrite an existing workspace.
	 * @param {function=} cb Callback
	 * @example <caption>This method is used to rename workspaces. It is used in the main Menu component.</caption>
	 * FSBL.Clients.WorkspaceClient.rename({
		oldName: 'My Workspace',
		newName: 'The best workspace',
		removeOldWorkspace: true,
	  }, function(err, response){
	 		//Do something.
	  });
	 */
	this.rename = function (params, cb) {
		Validate.args(params, "object", cb, "function=") && Validate.args2("params.oldName", params.oldName, "string", "params.newName", params.newName, "string");
		cb = cb || function noop() { }; // cb is optional but not for underlying query
		if (!params.overwriteExisting && this.workspaceIsAlreadySaved(params.newName)) {
			cb(new Error("WorkspaceAlreadySaved"), params);
			return;
		}
		this.routerClient.query("WorkspaceService.rename", params,
			function renameWorkspaceCallback(err, response) {
				Logger.system.log("IN THE RENAME CALLBACK", err, response.data);
				if (err) {
					return Logger.system.error(err);
				}
				if (response) {
					cb(err, response.data);
				} else {
					cb(err, null);
				}
			});
	};

	/**
	 * Makes a clone (i.e. copy) of the workspace.  The active workspace is not affected.
	 * @param {object} params
	 * @param {string} params.name Name of workspace to clone.
	 * @param {function} Callback cb(err,response) with response set to the name of the cloned workspace if no error
	 * @example <caption>This method is used to clone workspaces. </caption>
	 * FSBL.Clients.WorkspaceClient.clone({
		name: 'The best workspace'
	  }, function(err, response){
	 		//Do something.
	  });
	 */
	this.clone = function (params, cb) {
		Validate.args(params, "object", cb, "function=") && Validate.args2("params.name", params.name, "string");
		cb = cb || function noop() { }; // cb is optional but not for underlying query
		this.routerClient.query("WorkspaceService.clone", params,
			function cloneWorkspaceCallback(err, response) {
				if (err) {
					return Logger.system.error(err);
				}
				if (response) {
					cb(err, response.data.newWorkspaceName);
				} else {
					cb(err, null);
				}
			});
	};

	/**
	 * Saves the currently active workspace. It does not overwrite the saved instance of the workspace. It simply overwrites the <code>activeWorkspace</code> key in storage.
	 * @param {function} cb Callback
	 * @example
	 * <caption>This function persists the currently active workspace.</caption>
	 * FSBL.Clients.WorkspaceClient.save(function(err, response){
	 		//Do something.
	  });
	 */
	this.save = function (cb) {
		Validate.args(cb, "function=");
		cb = cb || function noop() { }; // cb is optional but not for underlying query
		this.routerClient.query("WorkspaceService.save", null, cb);
	};
	/**
	 * Helper that tells us whether a workspace is saved.
	 * @private
	 */
	this.workspaceIsAlreadySaved = function (workspaceName) {
		Validate.args(workspaceName, "string");
		var savedWorkspaceIndex = -1;
		for (var i = 0; i < self.workspaces.length; i++) {
			if (workspaceName === self.workspaces[i].name) {
				return true;
			}
		}
		return false;
	};
	/**
	 *
	 * Saves the currently active workspace with the provided name.
	 * @param {object} params
	 * @param {string} params.name new name to save workspace under.
	 * @param {string} [params.force=false] Whether to overwrite a workspace already saved with the provided name.
	 * @param {function} cb Callback
	 * @example <caption>This function persists the currently active workspace with the provided name.</caption>
	 * FSBL.Clients.WorkspaceClient.saveAs({
		name: 'My Workspace',
	  }, function(err, response){
	 		//Do something.
	  });
	 */
	this.saveAs = function (params, cb) {
		Validate.args(params, "object", cb, "function=") && Validate.args2("params.name", params.name, "string");
		cb = cb || function noop() { }; // cb is optional but not for underlying query

		if (!params.force && this.workspaceIsAlreadySaved(params.name)) {
			cb(new Error("WorkspaceAlreadySaved"), null);
			return;
		}
		this.routerClient.query("WorkspaceService.saveAs", params,
			function workspaceSaveAsCallback(err, response) {
				if (err) {
					return Logger.system.error(err);
				}
				if (response) {
					cb(err, response.data);
				} else {
					cb(err, null);
				}
			});
	};

	/**
	 * Switches to a workspace.
	 * @param {object} params
	 * @param {string} 	params.name Workspace Name
	 * @param {function} cb Callback
	 * @example <caption>This function loads the workspace 'My Workspace' from the storage tied to the application.</caption>
	 * FSBL.Clients.WorkspaceClient.switchTo({
		name: 'My Workspace',
	  }, function(err, response){
	 		//Do something.
	  });
	 */
	this.switchTo = function (params, cb) {
		Logger.system.debug("switchTo " + params.name);
		Validate.args(params, "object", cb, "function") && Validate.args2("params.name", params.name, "string");
		// not the workspace will be undated in this client before the below query response is received (see 'Finsemble.orkspaceService.update' listener)
		this.routerClient.query("WorkspaceService.switchTo", params, function (err, response) {
			Logger.system.log("SWITCH TO CB");
			var res = null;
			if (err) {
				Logger.system.error(err);
			} else {
				self.activeWorkspace = response.data;
				res = self.activeWorkspace;
			}
			if (cb) {
				cb(err, res);
			}
		});
	};

	/**
	 * Checks to see if the workspace is dirty. If it's already dirty, the window doesn't need to compare its state to the saved state.
	 * @param {Function} Callback cb(err,response) with response set to true if dirty and false otherwise (when no error)
	 * @example <caption>This function will let you know if the activeWorkspace is dirty.</caption>
	 * FSBL.Clients.WorkspaceClient.isWorkspaceDirty(function(err, response){
	 		//Do something like prompt the user if they'd like to save the currently loaded workspace before switching.
	  });
	 */
	this.isWorkspaceDirty = function (cb) {
		Validate.args(cb, "function");
		cb(null, this.activeWorkspace.isDirty);
	};
	/**
	 * Creates a new workspace. If the name is already saved, we increment the name.  After creation the new workspace becomes the active workspace.
	 * @param {Function} Callback cb(err,response) with response set to new workspace object if no error
	 * @example <caption>This function creates the workspace 'My Workspace'.</caption>
	 * FSBL.Clients.WorkspaceClient.createNewWorkspace(function(err, response){
	 *		if (!err) {}
	 *			//Do something like notify the user that the workspace has been created.
	 *		}
	 * });
	 */
	this.createNewWorkspace = function (workspaceName, cb) {
		Logger.system.debug("ActiveWorkSpace Name Before Create=" + this.activeWorkspace.name);
		Validate.args(cb, "function");
		var workspaces = FSBL.Clients.WorkspaceClient.workspaces;
		var numberOfNewWorkspaces = 0;
		var modifier = 1;
		workspaces.forEach((workspace, i) => {
			if (workspace.name.includes(workspaceName)) {
				numberOfNewWorkspaces++;
				var matches = workspace.name.match(/(\d+)(\))/);
				if (matches && typeof (matches[1] !== undefined) && (modifier <= matches[1])) {
					modifier = parseInt(matches[1]) + 1;
				}
			}
		});

		if (numberOfNewWorkspaces) {
			workspaceName += " (" + modifier + ")";
		}
		Logger.system.debug("New Workspace Name =" + workspaceName);
		this.switchTo({ name: workspaceName }, cb);
	};

	this.getGroupData = function (cb) {
		cb(this.activeWorkspace.groups);
	};
	this.saveGroupData = function (data) {
		this.routerClient.transmit("WorkspaceService.saveGroupData", {
			groupData: data
		});
	};
	/**
	 * Initializes listeners and sets default data on the WorkspaceClient object.
	 * @private
	 */
	this.start = function (cb) {
		/**
		 * Initializes the workspace's state.
		 */

		this.routerClient.subscribe("Finsemble.WorkspaceService.update", function (err, response) {
			if (response.data && response.data.activeWorkspace) {
				self.workspaceIsDirty = response.data.activeWorkspace.isDirty;
				self.workspaces = response.data.workspaces;
				self.activeWorkspace = response.data.activeWorkspace;
			}
		});

		self.getActiveWorkspace(function (err, response) {
			self.activeWorkspace = response;
			self.getWorkspaces(function (err2, response2) {
				self.workspaces = response2;
				Logger.system.log("workspace client ready");
				if (cb) {
					cb();
				}
			});
		});
	};

	return this;
}

var workspaceClient = new WorkspaceClient({
	onReady: function (cb) {
		Logger.system.debug("workspace onReady");
		workspaceClient.start(cb);
	},
	name: "workspaceClient"
});

workspaceClient.requiredClients = ["launcherClient"];
workspaceClient.requiredServices = ["workspaceService", "storageService"];
//workspaceClient.initialize();

module.exports = workspaceClient;

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/


var Utils = __webpack_require__(1);
var Validate = __webpack_require__(2); // Finsemble args validator
var BaseClient = __webpack_require__(3);

var Logger = __webpack_require__(0);
Logger.system.log("Starting ConfigClient");

/**
 * @introduction
 * <h2>Config Client</h2>
 *
 * This client provides run-time access to Finsemble's configuration. See [Understanding Finsemble's Configuration]{@tutorial understandingConfiguration} for a configuration overview.
 *
 * @hideConstructor true
 * @constructor
 */
var ConfigClient = function (params) {
	var self = this;
	BaseClient.call(this, params);

	/**
	 * Get all or a portion of the configuration from the Config Service. Typically this function is used to return Finsemble configuration
	 * (e.g. "finesemble.components"); however, if can also return all or part of the Openfin manifest which contains the finsemble config property.
	 * If no configReference parameter is passed in (i.e. only the callback parameter is specified), then the complete manifest object is returned
	 * (including manifest.finsemble).
	 *
	 * @param {object=} params field property indentifies specific config to return
	 * @param {function} callback callback function(error, data) to get the configuration data
	 * @example
	 *
	 * FSBL.Clients.ConfigClient.get({ field: "finsemble" },function(err, finsemble) {
	 *		if (!err) {
	 *			finsembleConfig = finsemble;
	 *		} else {
	 *			console.error("failed to get finsemble configuration");
	 *		}
	 * });
	 *
	 * FSBL.Clients.ConfigClient.get({ field: "finsemble.isAuthEnabled" }, function(err, isAuthEnabled) {
	 *		var authorizationOn = isAuthEnabled;
	 * });
	 *
	 * FSBL.Clients.ConfigClient.get(callback); // returns the complete manifest containing the finsemble property
	 * FSBL.Clients.ConfigClient.get(null, callback); // alternate form; returns the complete manifest containing the finsemble property
	 * FSBL.Clients.ConfigClient.get({}, callback); // alternate form; returns the complete manifest containing the finsemble property
	 * FSBL.Clients.ConfigClient.get({ field: "finsemble.components" }, callback);
	 * FSBL.Clients.ConfigClient.get({ field: "finsemble.services" }, callback);
	 * FSBL.Clients.ConfigClient.get({ field: "finsemble.components" },callback);
	 * FSBL.Clients.ConfigClient.get({ field: "finsemble.assimilation.whitelist" }, callback);
	 * FSBL.Clients.ConfigClient.get({ field: "runtime.version",callback) }; // returns the manifest's runtime.version property
	 */
	this.get = function (params, callback) {
		Logger.system.debug("ConfigClient.Get", params);
		// if only one argument then assume no filtering parameters -- the complete manifest will be returned
		if (arguments.length === 1) {
			callback = params; // since only one arg, it must be the callback
			Validate.args(callback, "function");
			params = {};
		} else {
			Validate.args(params, "object", callback, "function");
		}
		this.routerClient.query("config.get", params, function (queryErr, queryResponse) {
			callback(queryErr, queryResponse ? queryResponse.data : null);
		});
	};

	/**
	 * This is designed to mirror the get. Private because security TBD.
	 * @private
	 *
	 * @param {any} params
	 * @param {any} callback
	 */

	function set(params, callback) {
		Logger.system.debug("ConfigClient.Set", params);
		// if only one argument then assume no filtering parameters -- the complete manifest will be returned
		if (arguments.length === 1) {
			callback = params; // since only one arg, it must be the callback
			Validate.args(callback, "function");
			params = {};
		} else {
			Validate.args(params, "object", callback, "function");
		}
		this.routerClient.query("config.set", params, function (queryErr, queryResponse) {
			callback(queryErr, queryResponse ? queryResponse.data : null);
		});
	}

	/**
	 * Dynamically set config values within the Finsemble configuration.  New config properties may be set or existing ones modified. Note that configuration changes will not necessarily dynamically modify the components or services that use the corresponding configuration -- it depends if the component or service handles the corresponding change notifications (either though PubSub or the Config's DataStore). Also, these changes do not persist in any config files.)
	 *
	 * Special Note: Anytime config is set using this API, the newConfig along with the updated manifest will by published to the PubSub topic "Config.changeNotification".  To get these notifications any component or service can subscribe to the topic. An example is shown below.
	 *
	 * Special Note: Anytime config is set using this API, the dataStore underlying configuration 'Finsemble-Configuration-Store' will also be updated. To get these dataStore events a listener can be set as shown in the example below. However, any config modifications made directly though the DataStore will not result in corresponding PubSub notifications.
	 *
	 * @param {object} params
	 * @param {object} params.newConfig  provides the configuration properties to add into the existing configuration under manifest.finsemble. This config must match the Finsembe config requirements as described in [Understanding Finsemble's Configuration]{@tutorial understandingConfiguration}. It can include importConfig references to dynamically fetch additional configuration files.
	 * @param {boolean=} params.overwrite if true then overwrite any preexisting config with new config (can only set to true when running from same origin, not cross-domain); if false then newConfig must not match properties of existing config, including service and component configuration.
	 * @param {boolean=} params.replace true specifies any component or service definitions in the new config will place all existing non-system component and service configuration
	 *
	 * @example
	 * // Examples using processAndSet()
	 *FSBL.Clients.ConfigClient.processAndSet({ newConfig: { myNewConfigField: 12345 }, overwrite: false});
	 *FSBL.Clients.ConfigClient.processAndSet(
	 *{
	 *	newConfig: {
	 *		"myNewConfigField": 12345,
	 *		"myNewConfigObject": {
	 *			A: "this is a test",
	 *			B: "more test"
	 *		},
	 *		"importConfig": [
	 *			"$applicationRoot/configs/application/test.json",
	 *		]
	 *	},
	 *	overwrite: true,
	 *  replace: false,
	 *},
	 *	function (err, finsemble) {
	 *		if (err) {
	 *			console.error("ConfigClient.set", err);
	 *		} else {
	 *			console.log("new finsemble config", finsemble);
	 *		}
	 *	}
	 * );
	 *
	 * @example
	 *  // example subscribing to PubSub to get notifications of dynamic updates
	 *RouterClient.subscribe("Config.changeNotification", function (err, notify) {
	 *		console.log("set notification", notify.data.newConfig, notify.data.finsemble);
	 *	});
	 *
	 * @example
	 *  // example using DataStore to get notifications of dynamic updates
	 *DataStoreClient.getStore({ store: 'Finsemble-Configuration-Store', global: true }, function (err, configStore) {
	 *		configStore.addListener({ field: "finsemble" }, function (err, newFinsembleConfig) {
	 *			console.log("new manifest.finsemble configuration", newFinsembleConfig);
	 *		});
	 *});
	 *
	 */
	this.processAndSet = function (params, callback) {
		Logger.system.debug("ConfigClient.processAndSet", params);

		Validate.args(params, "object", callback, "function=") &&
		Validate.args2("params.newConfig", params.newConfig, "object", "params.overwrite", params.overwrite, "boolean=", "params.replace", params.replace, "boolean=");

		if (!params.overwrite && params.replace) {
			var errMsg = "cannot use replace option unless overwrite is also true";
			Logger.system.warning("Warning:", errMsg);
			if (callback) {
				callback(errMsg, null);
			}
		} else {
			this.routerClient.query("config.processAndSet", params, function (queryErr, queryResponse) {
				if (callback) {
					callback(queryErr, queryResponse ? queryResponse.data : null);
				}
			});
		}
	};
};

var configClient = new ConfigClient({
	onReady: function (cb) {
		Logger.system.log("configClient online");
		if (cb) {
			cb();
		}
	},
	name: "configClient"
});

configClient.requiredClients = [];
configClient.requiredServices = [];
module.exports = configClient;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var Utils = __webpack_require__(1);
var Validate = __webpack_require__(2); // Finsemble args validator
var BaseClient = __webpack_require__(3);
var windowClient = __webpack_require__(7);
var dataStoreClient = __webpack_require__(9);
var async = __webpack_require__(4);

var Logger = __webpack_require__(0);
Logger.system.log("Starting LinkerClient");
var sysinfo = Logger.system.info;
var sysdebug = Logger.system.debug;

/**
 *
 * @introduction
 * <h2>Linker Client</h2>
 * <h3>Public API for The Linker Service</h3>
 * <p>The Linker Client acts as an API between components and the Linker Service. The Linker Client allows for sharing of data between components such as when a symbol or an account changes in one window, it can be changed in all Linked windows automatically. See our tutorial on <a href="tutorial-linkingComponents.html">Linking Components</a>.</p>
 *
 * <p>When a Component is "linked", it is added to a Linker group. Linker groups are not related to Docking groups. All clients belonging to a Linker group can subscribe and receive published items for any dataType on the same group.</p>
 *
 * @hideConstructor true
 *
 * @constructor
 */

// @todo catch refesh events so that we can close down the Linker window if open <-- not sure what this is about so moved it out of the header


var LinkerClient = function (params) {
	Validate.args(params, "object=") && params && Validate.args2("params.onReady", params.onReady, "function=");
	BaseClient.call(this, params);

	this.onGroupsUpdate = [];
	this.onLinksUpdate = this.onGroupsUpdate; // backward compatibility

	// Linker Data
	this.allGroups = {};
	this.groups = [];
	this.clients = {};


	this.groupListenerList = [];
	var dataListenerList = {};

	var linkerWindow = null;
	var loading = false;

	var self = this;

	// Had to do this instead of just making it an object because that did not work (windowClient.options was undefined)
	/**
	 * @private
	 */
	this.windowIdentifier = function () {
		return {
			windowName: windowClient.options.name,
			uuid: windowClient.options.uuid,
			componentType: windowClient.options.customData.component.type
		};
	};

	/**
	 * @private
	 */
	this.makeKey = function (windowIdentifier) {
		return (windowIdentifier.windowName + "::" + windowIdentifier.uuid).replace(".", "_");
	};

	/**
	 * Create a new Linker group
	 * @param {LinkerClient~group} group -  An object that describes the new group. Needs name, color and border properties
	 * @param {LinkerClient~groupCB} [cb] -  callback to be called on success
	 * @private
	 *
	 * @example
	 * LinkerClient.createGroup({name: "groupname", color: "#ffcc00", border: "#ffffff"}, callback)
	 */
	this.createGroup = function (group, cb) {
		sysinfo("LinkerClient.createGroup", "GROUP", group);
		Validate.args(group, "object", cb, "function");

		if (!group.name) {
			cb("Name is required", null);
			return;
		}

		if (self.getGroup(group.name)) {
			cb("Group Already Exists", null);
			return;
		}

		self.allGroups.push(group);
		self.linkerStore.setValue({ field: "groups", value: self.allGroups });

		cb(null, self.allGroups);
	};

	/**
	 * Delete a Linker group.
	 *
	 * @param {string} groupName - The name of the group
	 * @param {LinkerClient~groupCB} [cb]
	 * @private
	 *
	 * @example
	 * LinkerClient.deleteGroup("group1", callback)
	 *
	 */
	this.deleteGroup = function (groupName, cb) {
		sysinfo("LinkerClient.deleteGroup", "GROUP NAME", groupName);
		Validate.args(groupName, "string", cb, "function");
		if (!self.getGroup(groupName)) {
			cb("Group does not exist", null);
			return;
		}
		let groups = self.allGroups;
		for (var i = 0; i < groups.length; i++) {
			if (groupName === groups[i].name) {
				groups.splice(i, 1);
				break;
			}
		}

		self.linkerStore.setValue({ field: "groups", value: self.allGroups });

		// TODO: Verify that this even works
		let clients = self.clients;
		for (c in clients) {
			client = clients[c];
			for (group in client.groups) {
				if (groupName === group) {
					delete client[group];
					break;
				}
			}
		}

		self.linkerStore.setValue({ field: "clients", value: self.clients });


		cb(null, self.allGroups);
	};

	/**
	 * Update a Linker group's info.
	 *
	 * @param {string} groupName - The name of the group
	 * @param {LinkerClient~group} newGroup -  Properties of the new group
	 * @param {LinkerClient~groupsCB} [cb]
	 * @private
	 *
	 * @example
	 * LinkerClient.updateGroup("group1", {name:"newGroup1", color:"black", border:"white"}, callback)
	 *
	 */
	this.updateGroup = function (groupName, newGroup, cb) {
		sysinfo("LinkerClient.updateGroup", "GROUP NAME", groupName, "NEW GROUP", newGroup);
		Validate.args(groupName, "string", newGroup, "object", cb, "function");
		if (!self.getGroup(groupName)) {
			cb("Group does not exist", null);
			return;
		}
		let groups = self.allGroups;
		for (var i = 0; i < groups.length; i++) {
			if (groupName === groups[i].name) {
				groups[i] = Object.assign(groups[i], newGroup);
				break;
			}
		}

		self.linkerStore.setValue({ field: "groups", value: self.allGroups });

		// TODO: Verify that this even works
		var clients = self.clients;
		for (c in clients) {
			client = clients[c];
			for (group in client.groups) {
				if (groupName === group) {
					delete client[group];
					client[newGroup.name] = true;
					break;
				}
			}
		}

		self.linkerStore.setValue({ field: "clients", value: self.clients });

		cb(null, self.allGroups);
	};

	/**
	 * Add a client to a Linker group programatically. Clients will receive all items published to this group. The Window manager uses this internally to add a component to a group when the user clicks on a color in the Linker Window.
	 *
	 * @param {string} groupName - Group to add to
	 * @param {windowIdentifier} client -  Window Identifier for the client (optional)
	 * @param {LinkerClient~groupsCB} [cb] Returns all the groups for the client
	 * @example
	 *
	 * LinkerClient.addToGroup("group1", null, callback); // Automatically uses current window if no windowIdentifier is specified
	 * LinkerClient.addToGroup("group1", windowIdentifier, callback);
	 *
	 */
	this.addToGroup = function (groupName, client, cb) {
		sysinfo("LinkerClient.addToGroup", "GROUP NAME", groupName, "CLIENT", client);
		Validate.args(groupName, "string", client, "object", cb, "function");
		if (!client) client = self.windowIdentifier();

		var clientKey = self.makeKey(client);

		if (!self.clients[clientKey]) {
			self.clients[clientKey] = {
				client: client,
				groups: {}
			};
		}

		self.clients[clientKey].groups[groupName] = true;
		self.linkerStore.setValue({ field: "clients." + clientKey, value: self.clients[clientKey] });

		return self.getGroups(client, cb);
	};

	/**
	 * @private
	 */
	this.addToGroups = function (groupNames, client, cb) {
		sysinfo("LinkerClient.addToGroups", "GROUP NAMES", groupNames, "CLIENT", client);
		var clientKey = self.makeKey(client);

		if (!self.clients[clientKey]) {
			self.clients[clientKey] = {
				client: client,
				groups: {}
			};
		}

		for (var i = 0; i < groupNames.length; i++) {
			self.clients[clientKey].groups[groupNames[i]] = true;
		}

		self.linkerStore.setValue({ field: "clients." + clientKey, value: self.clients[clientKey] });

		return self.getGroups(client, cb);

	};

	/**
	 * Removes a client from a Linker group programatically. The Window manager uses this internally to remove a component from a group when the user clicks on a color in the Linker Window corresponding to a Linker group that the window belongs to.
	 *
	 * @param {string} groupName - Group to remove
	 * @param {windowIdentifier} client -  Window Identifier for the client (optional)
	 * @param {LinkerClient~groupsCB} [cb] Returns all the groups for the client
	 *
	 * @example
	 *
	 * LinkerClient.removeFromGroup("group1", null, callback); // Automatically uses current window if no windowIdentifier is specified
	 * LinkerClient.removeFromGroup("group1", windowIdentifier, callback)
	 *
	 */
	this.removeFromGroup = function (groupName, client, cb) {
		sysinfo("LinkerClient.removeFromGroup", "GROUP NAME", groupName, "CLIENT", client);
		Validate.args(groupName, "string", client, "object", cb, "function");
		if (!client) client = self.windowIdentifier();

		var clientKey = self.makeKey(client);

		if (!self.clients[clientKey] || !self.clients[clientKey].groups[groupName]) {
			sysdebug("Client was not in specified group", self.linkerStorage.clients[clientKey], self.linkerStorage.clients[clientKey].groups[groupName]);
			var clientGroups = self.getGroups(client);
			cb("Client was not in specified group", clientGroups);
			return clientGroups;
		}
		delete self.clients[clientKey].groups[groupName];

		self.linkerStore.setValue({ field: "clients." + clientKey, value: self.clients[clientKey] });
		return self.getGroups(client, cb);

	};

	/**
	 * Get a Linker group
	 * @param {string} groupName -  The name of the group
	 * @param {LinkerClient~groupCB} [cb] -  callback to be called on success
	 * @private
	 *
	 * @example
	 * LinkerClient.getGroup("groupname", callback)
	 */
	this.getGroup = function (groupName, cb) {
		sysinfo("LinkerClient.getGroup", "GROUP NAME", groupName);
		Validate.args(groupName, "string", cb, "function");

		for (var i = 0; i < self.allGroups.length; i++) {
			if (self.allGroups[i].name == groupName) {
				group = self.allGroups[i];
				if (cb) {
					Validate.args(cb, "function");
					cb(null, group);
				}
				return group;
			}
		}

		cb("Group Not Found", null);
		return null;
	};

	/**
	 * Get all Linker groups
	 * @param {LinkerClient~groupsCB} [cb] -  callback to be called on success
	 * @private
	 *
	 * @example
	 * LinkerClient.getAllGroups(callback)
	 */
	this.getAllGroups = function (cb) {
		sysinfo("LinkerClient.getAllGroups");
		if (cb) {
			Validate.args(cb, "function");
			cb(null, self.allGroups);
		}
		return self.allGroups;
	};

	/**
	 * Get all Linker groups that a window has been added to
	 * @param {windowIdentifier} client -  Window Identifier for the client
	 * @param {LinkerClient~groupsCB} [cb] -  callback to be called on success
	 * @private
	 *
	 * @example
	 * LinkerClient.getGroups(windowIdentifier, callback)
	 */
	this.getGroups = function (client, cb) {
		sysinfo("LinkerClient.getGroups", "CLIENT", client);
		if (cb) { Validate.args(cb, "function"); }
		if (!client) {
			client = self.windowIdentifier();
		}
		if (!Object.keys(self.clients).length) {
			if (cb) { cb(null, { groups: [] }); }
			return { groups: [] };
		}
		var clientKey = self.makeKey(client);
		if (!self.clients[clientKey]) {
			if (cb) { cb(null, { groups: [] }); }
			return { groups: [] };
		}
		var clientGroups = self.clients[clientKey].groups;

		var clientGroupList = [];
		if (clientGroups) {
			clientGroupList = self.allGroups.filter(function (value) {
				return clientGroups[value.name] === true;
			});
		}

		if (!self.clients[clientKey].active) {
			self.clients[clientKey].active = true;
			self.linkerStore.setValue({ field: "clients." + clientKey, value: self.clients[clientKey] });
		}

		if (cb) {
			cb(null, { groups: clientGroupList });
		}
		return { groups: clientGroupList };
	};


	/**
	 * Get all Linker groups and linker groups that this client belongs to.
	 * @param {windowIdentifier} [client] - Window Identifier for the client
	 * @param {LinkerClient~stateCB} [cb] -  callback to be called on success
	 * @private
	 *
	 * @example
	 * LinkerClient.getState(windowIdentifier, callback)
	 */
	this.getState = function (client, cb) {
		sysinfo("LinkerClient.getState", "CLIENT", client);
		if (cb) { Validate.args(cb, "function"); }
		if (!client) { client = this.windowIdentifier(); }
		var clientKey = self.makeKey(client);
		var state = {
			groups: self.getGroups(client),
			allGroups: self.allGroups
		};
		if (cb) { cb(null, state); }

		return state;
	};


	/**
	 * @private
	 */
	this.showLinkerWindowInner = function (cb) {
		sysinfo("LinkerClient.showLinkerWindowInner");
		this.routerClient.query("Finsemble.LinkerWindow.Show", {
			groups: self.getGroups().groups,
			windowIdentifier: self.windowIdentifier(),
			windowBounds: FSBL.Clients.WindowClient.getWindowBounds()
		}, function () {

		});
	};

	/**
	* Opens the linker popup and sends the current windows information
	* @param {function} [cb] -  callback to be called on success
	* @private
	*
	* @example
	* LinkerClient.openLinkerWindow(cb)
	*/
	this.openLinkerWindow = function (cb) {
		sysinfo("LinkerClient.openLinkerWindow");
		Validate.args(cb, "function");
		if (loading) { return; } // If in process of loading then return. This prevents double clicks on the icon.
		var self = this;

		// @TODO, set a flag with a timeout to prevent the blurred in linker.jsx
		if (linkerWindow) {
			linkerWindow.isShowing(function (showing) {
				if (showing) {
					linkerWindow.hide();
				} else {
					self.showLinkerWindowInner(cb);
				}
			});
			return;
		}

		this.showLinkerWindowInner(cb);

	};

	/**
	* Remove a listener to the specified group and data type
	* @param {String}  dataType - The data type be subscribed to
	* @param {function} [cb] -callback to be called on success
	*
	* @example
	* LinkerClient.subscribe("group1","symbol",cb)
	*/
	this.unSubscribe = function (dataType) {
		sysinfo("LinkerClient.unSubscribe", "DATA TYPE", dataType);
		Validate.args(groupName, "string", dataType, "string");
		delete dataListenerList[dataType];
	};

	/**
	* Publish data to all listeners for a group and data type.
	* @param {Object}  params
	* @param {String}  params.dataType - The data type sending
	* @param {any}  params.data - the data being transmitted
	* @param {function} [cb] - callback to be called on success
	* @example
	* LinkerClient.publish({dataType:"symbol",data:"AAPL"})
	*/
	this.publish = function (params) {
		sysinfo("LinkerClient.publish", "PARAMS", params);
		Validate.args(params.dataType, "string", params.data, "any");
		let groups = Object.keys(self.groups);
		for (var i = 0; i < groups.length; i++) {
			var group = groups[i];
			this.routerClient.transmit(group + "." + params.dataType, { type: params.dataType, data: params.data });
			this.routerClient.transmit(group, { type: params.dataType, data: params.data });
		}
	};

	function removeListeners() {
		let groups = Object.keys(self.groups);
		for (var i = 0; i < groups.length; i++) {
			var group = groups[i];
			self.routerClient.removeListener(group, handleListeners);
		}
	}

	/**
	* Registers a client for a specific data type that is sent to a group.
	* @param {String} dataType
	* @param {function} [cb] -  a function to be called once the linker receives the specific data.
	* @example
	* LinkerClient.subscribe("symbol",func)
	*/
	this.subscribe = function (dataType, cb) {
		sysinfo("LinkerClient.subscribe", "DATA TYPE", dataType);
		Validate.args(dataType, "string", cb, "function");
		if (dataListenerList[dataType]) {
			return dataListenerList[dataType].push(cb);
		}
		dataListenerList[dataType] = [cb];
	};

	/**
	 * Gets all Windows in a specific group
	 * 
	 * @param {string} groupName 
	 * @param {function} cb 
	 */
	this.getAllWindowsInGroup = function (groupName, cb) {
		sysinfo("LinkerClient.getAllWindowsInGroup", "GROUP NAME", groupName);
		Validate.args(groupName, "string", cb, "function");
		var clientsInGroup = [];
		for (let clientKey in self.clients) {
			let client = self.clients[clientKey];
			if (client.active && Object.keys(client.groups).includes(groupName)) {
				clientsInGroup.push(client.client);
			}
		}
		if (cb) { cb(null, clientsInGroup); }
		return clientsInGroup;
	};

	//Need to do this better. Get newest items so we don't create it every time
	//This looks to see if there is a listener for a specific data type
	function handleListeners(err, data) {
		var listeners = dataListenerList[data.data.type];
		if (listeners && listeners.length > 0) {
			for (var i = 0; i < listeners.length; i++) {
				listeners[i](data.data.data, { data: data.data.data, header: data.header, originatedHere: data.originatedHere });
			}
		}
	}

	//add new listeners for groups when groups are updated
	function updateListeners() {
		//remove listeners
		for (var i = self.groupListenerList.length - 1; i >= 0; i--) {
			let group = self.groupListenerList[i];
			let groups = Object.keys(self.groups);
			if (!groups.filter(function (g) { return g == group; }).length) {
				self.routerClient.removeListener(group, handleListeners);
				self.groupListenerList.splice(i, 1);
			}
		}

		//setup new listeners if needed
		var groups = Object.keys(self.groups);
		for (var i = 0; i < groups.length; i++) {
			let group = groups[i];
			if (!self.groupListenerList.includes(group)) {
				self.routerClient.addListener(group, handleListeners);
				self.groupListenerList.push(group);
			}
		}
	}

	// @TODO, terry: this could be named better. Let's call it emitLocalLinkUpdateEvents
	function sendOutLinkUpdates() {
		for (var i = 0; i < self.onGroupsUpdate.length; i++) {
			self.onGroupsUpdate[i](null, self.getState());
		}
	}

	// load all linkages and register listeners for updated data.
	/**
	 * @private
	 */
	this.loadGroups = function (cb) {
		sysdebug("LinkerClient Loading Groups");
		var wi = self.windowIdentifier();
		var clientKey = self.makeKey(wi);
		dataStoreClient.getStore({ store: "Finsemble_Linker", global: true }, function (err, linkerStore) {
			self.linkerStore = linkerStore;
			linkerStore.getValues(["groups"], function (err, values) {
				if (values) {
					if (values["groups"]) {
						self.allGroups = values["groups"];
					}
				}
				windowClient.getComponentState({ field: "Finsemble_Linker" }, function (err, linkerData) {
					self.clients[clientKey] = {
						client: wi,
						active: true,
						groups: {}
					};
					if (linkerData) {
						self.groups = linkerData;
						self.clients[clientKey].groups = linkerData;
					}
					linkerStore.setValue({ field: "clients." + clientKey, value: self.clients[clientKey] });
					var spawnData = windowClient.getSpawnData();
					if (spawnData && spawnData.linker && spawnData.linker.groups) {
						self.addToGroups(spawnData.linker.groups, wi);
					} else {
						updateListeners();
						sendOutLinkUpdates();
					}
					cb();
					linkerStore.addListener({ field: "clients." + clientKey }, function (err, response) {
						sysdebug("My Groups Updated");
						updateListeners();
						sendOutLinkUpdates();
						if (response.groups) self.groups = response.groups;
						windowClient.setComponentState({ field: "Finsemble_Linker", value: self.groups });
						
					});
					linkerStore.addListener({}, function (err, response) {
						var values = response.value.values;
						self.allGroups = values.groups;
						self.clients = values.clients;
						if (values.clients[clientKey] && values.clients[clientKey].groups) {
							self.groups = values.clients[clientKey].groups;
						}
						windowClient.setComponentState({ field: "Finsemble_Linker", value: self.groups });
					});
				});
			});

			linkerStore.addListener({ field: "clients." + clientKey }, function (err, response) {
				sysdebug("My Groups Updated");
				updateListeners();
				sendOutLinkUpdates();
			});

			linkerStore.addListener({}, function (err, response) {
				var values = response.value.values;
				self.allGroups = values.groups;
				self.clients = values.clients;
				if (values.clients[clientKey]) self.groups = values.clients[clientKey].groups;
			});

		});



	};

	this.onClose = function () {
		var wi = self.windowIdentifier();
		var clientKey = self.makeKey(wi);
		self.clients[clientKey].active = false;
		self.linkerStore.setValue({ field: "clients." + clientKey, value: self.clients[clientKey] });
	};
	return this;
};

var linkerClient = new LinkerClient({
	onReady: function (cb) {
		sysdebug("Linker onReady");
		linkerClient.loadGroups(cb);
	},
	name: "linkerClient"
});

linkerClient.requiredServices = ["linkerService"];
linkerClient.requiredClients = ["windowClient", "dataStoreClient"];
module.exports = linkerClient;

/**
 * Window Identifier - You can get the window Identifier of a Window by calling FSBL.Utils.getMyWindowIdentifer
 * @typedef {Object} windowIdentifier
 * @property {string} windowName
 * @property {string} uuid
 * @property {string} componentType
 */

/**
 * Linker group
* @typedef {Object} LinkerClient~group
* @property  {string}  name
* @property  {string}  color
* @property  {string}  border
 */

/**
 * Callback that returns a list of groups in the responseMessage
* @callback LinkerClient~groupCB
* @param {Object} err
* @param {LinkerClient~groups} responseMessage
*/

/**
* @callback LinkerClient~stateCB
* @param {Object} err
* @param {LinkerClient~state} responseMessage
* @private
*/

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

var Utils = __webpack_require__(1);
var Validate = __webpack_require__(2); // Finsemble args validator

var Logger = __webpack_require__(0);

Logger.system.log("Starting StorageClient");

/**
 *
 */
var BaseClient = __webpack_require__(3);

/**
 *
 * @introduction
 * <h2>Storage Client</h2>
 * The Storage client handles saving and retrieving data for your application.
 * @hideConstructor true
 *  @todo add clear method
 * @constructor
 */
var StorageClient = function (params) {
	Validate.args(params, "object=") && params && Validate.args2("params.onReady", params.onReady, "function=");
	var self = this;
	BaseClient.call(this, params);

	/**
	 * Define the username for storage (i.e. each user has unique storage)
	 * @param {Object} params - Params object
	 * @param {String} params.user -  user name
	 * @param {function=} [cb] -  callback to be called on success
	 *
	 * @example
	 * StorageClient.setUser("JohnDoe");
	 */
	this.setUser = function (params, cb) {
		Validate.args(params.user, "string", cb, "function=");
		self.routerClient.query("Storage.setUser", { user: params.user }, function (err, response) {
			Logger.system.log("StorageClient.setUser", params, cb);
			if (cb) {
				cb(err, response.data);
			}
		});
	};

	/**
	 * Specifies the datastore.  For normal operation this function doesn't have to be invoked -- the default datastore is set in configuration.
	 * @param {Object} params - Params object
	 * @param {String=} params.topic -  if specificed then data store is set only for topic
	 * @param {Param} params.dataStore -  identifies the data store (e.g. "localStorage", "redis")
	 * @param {function=} [cb=] -  callback to be called on success
	 *
	 * @example
	 * StorageClient.setStore({topic:"finsemble", dataStore:"redis"})
	 */
	this.setStore = function (params, cb) {
		Validate.args(params.topic, "string", params.dataStore, "string=", cb, "function=");
		Logger.system.log("StorageClient.setStore", params, cb);
		self.routerClient.query("Storage.setStore", params, function (err, response) {
			if (cb) {
				cb(err, response.data);
			}
		});
	};

	/**
	 * Save a key value pair into storage.
	 * @param {Object} params - Params object
	 * @param {String} params.topic -  storage topic for key being stored
	 * @param {String} params.key -  The key to be stored
	 * @param {Param} params.value -  The value to be stored
	 * @param {function=} [cb] -  callback to be called on success
	 *
	 * @example
	 * StorageClient.save({topic:"finsemble", key:"testKey", value:"testValue"})
	 */
	this.save = function (params, cb) {
		Validate.args(params.topic, "string", params.key, "string", params.value, "any", cb, "function=");
		Logger.system.log("StorageClient.save", params, cb);
		self.routerClient.query("Storage.save", params, function (err, response) {
			if (cb) {
				cb(err, response.data);
			}
		});
	};

	/**
	 * Get a value from storage.
	 * @param {Object} params - Params object
	 * @param {String} params.key -  The key to get from storage
	 * @param {function} [cb] -  callback to be called on success
	 *
	 * @example
	 * StorageClient.get({topic:"finsemble", key:"testKey"}, function(err, data){
	 *	var myData = data;
	 * });
	 */
	this.get = function (params, cb) {
		Validate.args(params.topic, "string", params.key, "string", cb, "function=");
		Logger.system.log("StorageClient.get", params, cb);
		self.routerClient.query("Storage.get", params, function (err, response) {
			if (cb) {
				cb(err, response.data);
			}
		});
	};

	/**
	 * Get all keys for the topic.
	 * @param {Object} params - Params object
	 * @param {String} params.topic -  topic for the keys to return
	 * @param {String=} params.keyPrefix -  filter all keys that don't start with this prefix

	 * @param {function} [cb] -  callback to be called on success
	 *
	 * @example
	 * StorageClient.keys({topic:"finsemble", keyPrefix:"test"}, function(err, data){
	 *	var myKeys = data;
	 * });
	 */
	this.keys = function (params, cb) {
		Validate.args(params.topic, "string", cb, "function=");
		Logger.system.log("StorageClient.keys", params, cb);
		self.routerClient.query("Storage.keys", params, function (err, response) {
			if (cb) {
				cb(err, response.data);
			}
		});
	};
	/**
	 * Get a multiple values from storage based on regex.(coming soon)
	 * @param {Object} params - Params object
	 * @param {function} [cb] -  callback to be called on success
	 * @private
	 * @todo make this work.
	 * @example
	 * StorageClient.get({key:"testKey"});
	 */
	this.getMultiple = function (params, cb) {
		Logger.system.log("StorageClient.getMultiple", params, cb);
		self.routerClient.query("Storage.getMultiple", params, function (err, response) {
			Logger.system.log("clienterr", err, response);
			if (cb) {
				cb(err, response);
			}
		});
	};

	/**
	 * Delete a value from storage.
	 * @param {Object} params - Params object
	 * @param {String} params.key -  The key to get from storage
	 * @example
	 * StorageClient.delete({key:"testKey"})
	 */
	this.delete = function (params, cb) {
		Validate.args(params.topic, "string", params.key, "string", cb, "function=");
		Logger.system.log("StorageClient.delete", params, cb);
		self.routerClient.query("Storage.delete", params, function (err, response) {
			if (cb) {
				cb(err, response.data);
			}
		});
	};
	this.clearCache = function (cb) {
		Validate.args(params.topic, "string", params.key, "string", cb, "function=");
		Logger.system.log("StorageClient.clearCache", cb);
		self.routerClient.query("Storage.clearCache", null, function (err, response) {
			if (cb) {
				cb(err, response.data);
			}
		});
	};
};

var storageClient = new StorageClient({
	onReady: function (cb) {
		Logger.system.debug("StorageClient online");
		if (cb) {
			cb();
		}
	},
	name: "storageClient"
});
storageClient.requiredServices = ["storageService"];
module.exports = storageClient;




/***/ }),
/* 16 */
/***/ (function(module, exports) {

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

/**
 * @introduction
 * <h2>Finsemble system wide settings for use by all components and services</h2>
 *
 */

/**
 * Constructor for Finsemble SystemSettings
 * @private
 * @constructor
 */
var SystemSettings = function () {
	var currentDiagLevel = 3;

	/**
	 * Returns diagnostic level
	 *
	 *@returns current diagnostic level
	 */
	this.diagLevel = function () {
		return currentDiagLevel;
	};

	/**
	 * Returns diagnostic level
	 *
	 *@returns current diagnostic level
	 */
	this.setDiagLevel = function (level) {
		currentDiagLevel = level;
	};

	/**
	 * Returns true if parameter validation is enabled
	 *
	 *@returns true if enable
	 */
	this.validationEnabled = function () {
		return (currentDiagLevel >= 4);
	};
};

module.exports = new SystemSettings();

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
if (window.top === window) { // @todo - remove when OpenFin Fixes preload

	var Utils = __webpack_require__(1);
	var Validate = __webpack_require__(2);
	var wrapCallbacks = __webpack_require__(32);

	// FSBL.initialize() or fin.desktop.main() may start first. It's unpredictable. initialize() depends on main()
	// so we use variables to defer running that function if main() hasn't yet run.
	var deferredInitialize = false;
	var deferredCallback = null;
	var mainHasRun = false;
	var started = false;
	var FSBL = function () {
		var self = this;
		var onlineClients = [];
		var clients = [];
		var status = "offline";
		var windowName = "";
		var startTimeoutValue;
		var startTimer;

		this.setWindowName = function (name) {
			console.log("settingWindowName");
			windowName = name;
		};

		this.Utils = Utils;
		this.Validate = Validate;
		this.Clients = {
			RouterClient: __webpack_require__(10),
			StorageClient: __webpack_require__(15),
			LauncherClient: __webpack_require__(6),
			DataStoreClient: __webpack_require__(9),
			LinkerClient: __webpack_require__(14),
			WindowClient: __webpack_require__(7),
			WorkspaceClient: __webpack_require__(11),
			DialogManager: __webpack_require__(27),
			AuthenticationClient: __webpack_require__(25),
			ConfigClient: __webpack_require__(13),
			DataTransferClient: __webpack_require__(26),
			Logger: __webpack_require__(0),
			BaseClient: __webpack_require__(3)
		};

		function setStartupTimer() {
			startTimeoutValue = 10000;
			startTimer = setTimeout(startupTimeoutHandler, startTimeoutValue); // cleared in setServiceOnline
		}

		function startupTimeoutHandler() {
			console.error("STARTUP WARNING: FSBL not online after " + startTimeoutValue / 1000 + " seconds",
				"Clients Online", onlineClients, "All Clients", clients);
		}

		function setFSBLOnline() {
			console.log("STARTUP: FSBL ONLINE");
			clearTimeout(startTimer);
			status = "online";
		}

		this.getFSBLInfo = function (cb) {
			return new Promise(function (resolve, reject) {
				if (status === "online") {
					self.Clients.ConfigClient.get({ field: "finsemble" }, function (err, config) {
						let FSBLInfo = {
							FSBLVersion: config.FSBLVersion,
							gitHash: config.gitHash
						};
						if (cb) {
							cb(FSBLInfo);
						}
						resolve(FSBLInfo);
					});
				} else {
					reject("FSBL Not initialized");
				}
			});
		};

		this.addClient = function (name, obj) {
			if (!this.Clients[name]) {
				this.Clients[name] = obj;
			}
		};

		this.useClients = function (clientList) {
			for (var i = 0; i < clientList.length; i++) {
				if (this.Clients[clientList[i]] && clients.indexOf(clients[i]) === -1) {
					clients.push(clientList[i]);
				}
			}
		};

		this.useAllClients = function () {
			clients = [];
			for (var key in this.Clients) {
				if (clients.indexOf(key) === -1) {
					if (!this.Clients[key].initialize) { continue; }//hack for now
					clients.push(key);
				}
			}
		};

		this.isinitialized = false;
		this.initialize = function (cb) {

			setStartupTimer();

			this.Clients.Logger.start();
			if (!mainHasRun) {
				deferredInitialize = true;
				deferredCallback = cb;
				return;
			}

			if (this.isinitialized) {
				if (cb) {
					this.addEventListener("onReady", cb);
				}
				return;
			}
			this.isinitialized = true;

			console.log("IN THE FSBL ENTRY INITIALIZING", windowName);
			this.Clients.RouterClient.addListener(windowName + ".clientOnline", function (err, data) {
				if (err) { return console.error(err); }
				self.setClientOnline(data.data);
			});
			if (clients.length === 0) { return cb; }

			if (cb) {
				this.addEventListener("onReady", cb);
			}

			this.createClientStatusResponders();

			for (var i = 0; i < clients.length; i++) {
				this.Clients[clients[i]].windowName = windowName;
				this.Clients[clients[i]].initialize();
			}
			//workspaceService checks this to see if the window's initialized. If not, it closes the window during a workspace switch.

		};
		/**
		 * Creates status responders for all clients. This happens before all clients are initialized. This allows for clients to depend on other clients being initialized before they come online.
		 */
		this.createClientStatusResponders = function () {
			for (let i = 0; i < clients.length; i++) {
				let client = this.Clients[clients[i]];
				let clientResponderChannel = `${windowName}.${client.name}.status`;
				console.log(`Adding status responder for ${client.name}`);
				this.Clients.RouterClient.addResponder(clientResponderChannel, function (err, event) {
					if (err) {
						console.warn(err);
						return;
					}
					event.sendQueryResponse(null, client.status);
				});
			}
		};

		this.setClientOnline = function (clientName) {
			console.log("Client Online: " + clientName);
			Validate.args(clientName, "string");
			if (onlineClients.includes(clientName)) {
				return;
			}
			onlineClients.push(clientName);
			console.debug("test for online", onlineClients, clients);
			if (onlineClients.length === clients.length) {
				setFSBLOnline();

				this.isInitializing = false;
				if (this.listeners.onReady) {
					for (var i = 0; i < this.listeners.onReady.length; i++) {
						this.listeners.onReady[i]();
					}
					this.listeners.onReady = [];
				}
				if (!windowName) {
					alert("FAILURE: WindowName is null");
				}
				this.Clients.RouterClient.transmit(windowName + ".componentReady", { // signal workspace and launcher service that component is ready
					name: windowName
				});
			}
		};

		this.listeners = {};

		this.addEventListener = function (listenerType, callback) {
			Validate.args(listenerType, "string", callback, "function");

			if (!this.listeners[listenerType]) {
				this.listeners[listenerType] = [];
				if (status === "online" && listenerType === "onReady") {
					callback();
				}
				this.listeners[listenerType].push(callback);
			} else if (status === "online" && listenerType === "onReady") {
				callback();
			} else {
				this.listeners[listenerType].push(callback);
			}
		};

		this.onShutdown = function (cb) {
			this.addEventListener("onShutdown", cb);
		};
		/**
		 * When the application sends out a shutdown message, each service begins cleaning up. Part of the LauncherServices's cleanup is to make sure all components are allowed to cleanup. This method iterates through any registered cleanup methods. When all of them have finished (or 10 seconds elapses), it sends a response to the application saying that it's completed cleanup (`shutdownComplete`, below).
		 */
		this.handleShutdown = function (err, message) {
			var self = this;
			var numCallbacks = 0;
			var cleanupCompleted = 0;
			if (this.listeners.onShutdown) {
				this.Clients.RouterClient.transmit("LauncherService.shutdownResponse", {
					waitForMe: true,
					name: windowName
				});

				numCallbacks = this.listeners.onShutdown.length;
				for (let i = 0; i < this.listeners.onShutdown.length; i++) {

					let cleanup = Utils.castToPromise(this.listeners.onShutdown[i]);
					cleanup()
						.then(function () {
							cleanupCompleted++;
							console.log("Cleanups completed:" + cleanupCompleted);
							checkCompletion();
						});
				}
			} else {
				this.Clients.RouterClient.transmit("LauncherService.shutdownResponse", {
					waitForMe: false,
					name: windowName
				});
				checkCompletion();
			}
			function checkCompletion() {
				if (numCallbacks === cleanupCompleted) {
					self.shutdownComplete();
				}
			}
		};
		/**
		 * When the component has finished running through its cleanup routine, this method is invoked, and the window is closed.
		 */
		this.shutdownComplete = function () {
			console.log("Shutdown Complete");
			this.Clients.RouterClient.transmit("LauncherService.shutdownCompleted", {
				name: windowName
			});
			fin.desktop.Window.getCurrent().close(true);
		};
		/**
		 * Listens for the command to shutdown.
		 */
		this.listenForShutdown = function () {
			this.Clients.RouterClient.addListener("LauncherService.shutdownRequest", this.handleShutdown.bind(this));
		};
		/**
		 * Triggers the application shutdown sequence.
		 */
		this.shutdownApplication = function () {
			self.Clients.RouterClient.transmit("Application.shutdown");
		};
		/**
		 * Triggers the application restart sequence.
		 */
		this.restartApplication = function () {
			FSBL.Clients.RouterClient.transmit("Application.restart");
		};
		/**
		 * Invokes the onClose method of each client.
		 */
		this.windowClose = function () {
			for (var clientKey in self.Clients) {
				let client = self.Clients[clientKey];
				if (client.onClose) { client.onClose(); }
			}

		};
	};
	FSBL = new FSBL();
	fin.desktop.main(function () {

		// Wrap OF functions that have callbacks to insure all callbacks invoked;
		// since class/constructor, must wrap at prototype level (otherwise prototypes won't be picked up)
		wrapCallbacks(fin.desktop.Application.prototype);
		wrapCallbacks(fin.desktop.Window.prototype);
		wrapCallbacks(fin.desktop.System); // not a class so done pass in prototype

		// Capture error and log it; define here (as early as possible) to catch early errors
		window.addEventListener("error", function (errorObject) {
			FSBL.Clients.Logger.error(errorObject.message,
				"File: " + errorObject.filename,
				"Line: " + errorObject.lineno,
				"Column: " + errorObject.colno,
				"Error Stack: \n    " + errorObject.error.stack.substring(errorObject.error.stack.search("at ")) // strip off irrelevant part of stack
			);
			return false;
		});

		if (started) {
			return;
		}
		started = true;
		window.console.log("FIN.MAIN CALLED");
		FSBL.Clients.RouterClient.ready(function () {
			var finWindow = fin.desktop.Window.getCurrent();
			console.debug("FSBL router ready after load");
			window.addEventListener("unload", function (event) {
				started = false;
				FSBL.windowClose();
				FSBL.Clients.RouterClient.disconnectAll();
			});

			FSBL.listenForShutdown();
			window.addEventListener("beforeunload", FSBL.windowClose);
			finWindow.addEventListener("closed", FSBL.windowClose);

			var windowName = fin.desktop.Window.getCurrent().name;
			FSBL.setWindowName(windowName);
			FSBL.Clients.RouterClient.addResponder(windowName + ".heartbeat", function (err, message) {
				message.sendQueryResponse(null, true);
			});
			FSBL.Clients.RouterClient.transmit(windowName + ".onSpawned", {
				name: windowName
			});

			finWindow.getOptions((opts) => {
				if (opts &&
					opts.customData &&
					opts.customData.component &&
					opts.customData.component.neededClients) {
					FSBL.useClients(opts.customData.component.neededClients);
				} else {
					FSBL.useAllClients();
				}
				FSBL.initialize();
			});

			finWindow.addEventListener("closed", FSBL.windowClose);

			mainHasRun = true;
			if (deferredInitialize) {
				FSBL.initialize(deferredCallback);
			}
		});
	});

	module.exports = FSBL;
}


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */



/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

if (process.env.NODE_ENV !== 'production') {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports.Dispatcher = __webpack_require__(20);


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Dispatcher
 * 
 * @preventMunge
 */



exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var invariant = __webpack_require__(18);

var _prefix = 'ID_';

/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *   CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *         case 'city-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

var Dispatcher = (function () {
  function Dispatcher() {
    _classCallCheck(this, Dispatcher);

    this._callbacks = {};
    this._isDispatching = false;
    this._isHandled = {};
    this._isPending = {};
    this._lastID = 1;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   */

  Dispatcher.prototype.register = function register(callback) {
    var id = _prefix + this._lastID++;
    this._callbacks[id] = callback;
    return id;
  };

  /**
   * Removes a callback based on its token.
   */

  Dispatcher.prototype.unregister = function unregister(id) {
    !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.unregister(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
    delete this._callbacks[id];
  };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   */

  Dispatcher.prototype.waitFor = function waitFor(ids) {
    !this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Must be invoked while dispatching.') : invariant(false) : undefined;
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (this._isPending[id]) {
        !this._isHandled[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Circular dependency detected while ' + 'waiting for `%s`.', id) : invariant(false) : undefined;
        continue;
      }
      !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
      this._invokeCallback(id);
    }
  };

  /**
   * Dispatches a payload to all registered callbacks.
   */

  Dispatcher.prototype.dispatch = function dispatch(payload) {
    !!this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.') : invariant(false) : undefined;
    this._startDispatching(payload);
    try {
      for (var id in this._callbacks) {
        if (this._isPending[id]) {
          continue;
        }
        this._invokeCallback(id);
      }
    } finally {
      this._stopDispatching();
    }
  };

  /**
   * Is this Dispatcher currently dispatching.
   */

  Dispatcher.prototype.isDispatching = function isDispatching() {
    return this._isDispatching;
  };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   *
   * @internal
   */

  Dispatcher.prototype._invokeCallback = function _invokeCallback(id) {
    this._isPending[id] = true;
    this._callbacks[id](this._pendingPayload);
    this._isHandled[id] = true;
  };

  /**
   * Set up bookkeeping needed when dispatching.
   *
   * @internal
   */

  Dispatcher.prototype._startDispatching = function _startDispatching(payload) {
    for (var id in this._callbacks) {
      this._isPending[id] = false;
      this._isHandled[id] = false;
    }
    this._pendingPayload = payload;
    this._isDispatching = true;
  };

  /**
   * Clear bookkeeping used for dispatching.
   *
   * @internal
   */

  Dispatcher.prototype._stopDispatching = function _stopDispatching() {
    delete this._pendingPayload;
    this._isDispatching = false;
  };

  return Dispatcher;
})();

module.exports = Dispatcher;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, module) {/**
 * Lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright JS Foundation and other contributors <https://js.foundation/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    asyncTag = '[object AsyncFunction]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    nullTag = '[object Null]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    proxyTag = '[object Proxy]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    undefinedTag = '[object Undefined]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice,
    symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols,
    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag : getTag(object),
      othTag = othIsArr ? arrayTag : getTag(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent.
 *
 * **Note:** This method supports comparing arrays, array buffers, booleans,
 * date objects, error objects, maps, numbers, `Object` objects, regexes,
 * sets, strings, symbols, and typed arrays. `Object` objects are compared
 * by their own, not inherited, enumerable properties. Functions and DOM
 * nodes are compared by strict equality, i.e. `===`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.isEqual(object, other);
 * // => true
 *
 * object === other;
 * // => false
 */
function isEqual(value, other) {
  return baseIsEqual(value, other);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = isEqual;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8), __webpack_require__(12)(module)))

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8), __webpack_require__(5)))

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(22);
exports.setImmediate = setImmediate;
exports.clearImmediate = clearImmediate;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

var async = __webpack_require__(4);
var storeUtils = __webpack_require__(31);
var Logger = __webpack_require__(0);
Logger.system.log("Starting DataStoreModelClient");

/**
 *
 * @introduction
 * <h2>Store Model</h2>
 * The store model is the store instances. This handles getters/setters of data
 * @hideConstructor true
 * @class
 */

var StoreModel = function (params, routerClient) {

	this.routerClient = routerClient;
	var isGlobal = params.global;
	var self = this;
	this.name = params.store ? params.store : "finsemble";
	this.values = params.values ? params.values : {};
	var listeners = [];
	this.lst = listeners;
	this.registeredDispatchListeners = [];
	var mapping = {};
	storeUtils.initObject(this.values, null, mapping);

	/** @member {Object}  - This is the flux dispatcher. It can be used dispatch actions accross stores. These action are not caught inside of the global store service. https://facebook.github.io/flux/docs/overview.html

	* @example
	store.Dispatcher.register(function(action){
		if(action.actionType === "ACTION1"){

		// Do something with the action here
		}


	});

	store.Dispatcher.dispatch({actionType:ACTION1,data:myData});
	*/

	this.Dispatcher = {
		register: function (fn) {
			self.registeredDispatchListeners.push(fn);
		},
		dispatch: function (data) {
			self.routerClient.transmit("storeService.dispatch", data);
		}
	};
	this.routerClient.addListener("storeService.dispatch", function (err, message) {
		for (var i=0; i < self.registeredDispatchListeners.length; i++) {
			self.registeredDispatchListeners[i](message.data);
		}
	});

	/**
	 * Set a value in the store. Two events will be triggered with topics of: store and field.
	 * @param {Object} params - Params object
	 * @param {String} params.field - The name of the field where data will be stored
	 * @param {String} params.value - Value to be stored
	 * @returns {null}
	 *
	 * @example
	 * store.setValue({field:'field1',value:"new value"});
	 */
	this.setValue = function (params, cb) {
		if (!params.field) { Logger.system.error("no field provided", params); }
		if (!params.hasOwnProperty("value")) { Logger.system.error("no value provided", params); }
		if (isGlobal) {

			var data = {
				store: self.name,
				field: params.field,
				value: params.value
			};
			return dataStoreClient.routerClient.query("storeService.setValue", data, function (err) {
				return cb ? cb() : null;
			});

		}
		var removals = storeUtils.checkForObjectChange(this.values, params.field, mapping);

		storeUtils.setPath(this.values, params.field, params.value);

		storeUtils.mapField(this.values, params.field, mapping);

		if (removals) { sendRemovals(removals); }

		var combined = this.name + (params.field ? "." + params.field : "");

		//triggerListeners(combined, params.value);
		triggerListeners(self.name, this);
		publishObjectUpdates(params.field, mapping);
		return cb ? cb() : null;
	};

	function publishObjectUpdates(startfield, mappings) {// Handles changes to the store. Will publish from the field that was changed and back.
		var currentMapping = mappings;
		while (startfield) {
			triggerListeners(self.name + "." + startfield, storeUtils.byString(self.values, startfield));
			startfield = currentMapping[startfield];
		}
	}

	//Send items that are no longer mapped or had their map change. If a value is remapped we'll send out the new value.
	function sendRemovals(removals) {
		for (var i = 0; i < removals.length; i++) {
			triggerListeners(self.name + "." + removals[i], storeUtils.byString(self.values, removals[i]));
		}
	}

	/**
	 * This will set multiple values in the store.
	 * @param {Object[]} fields - An Array of field objects
	 * @param {String} fields[].field - The name of the field
	 * @param {Any} fields[].value - Field value
	 * @returns {null}
	 *
	 * @example
	 * store.setValues([{field:'field1',value:"new value"}]);
	 */
	this.setValues = function (fields, cb) {
		var self = this;
		if (!fields) {
			return Logger.system.error("no params given");
		}
		if (!Array.isArray(fields)) { return console.error("params must be an array"); }
		async.each(fields, function (field, done) {
			self.setValue(field, done);

		}, function (err) {

			return cb ? cb() : null;
		});
		/*for (var i = 0; i < fields.length; i++) {
			var item = fields[i];
			this.setValue(item);
		}
		return cb ? cb() : null;*/
	};

	/**
	 * Get a value from the store. If global is not set, we'll check local first then we'll check global.
	 * @param {Object| String} params - Params object. This can also be a string
	 * @param {String} params.field - The field where the value is stored.
	 * @param {Function} [cb] -  Will return the value if found.
	 * @returns {Any} - The value of the field. If no callback is given and the value is local, this will run synchronous
	 * @example
	store.getValue({field:'field1'},function(err,value){});
store.getValue('field1',function(err,value){});
	 */
	this.getValue = function (params, cb) {
		if (typeof params === "string") { params = { field: params }; }
		if (!params.field) {
			if (!cb) { return "no field provided"; }
			return cb("no field provided");
		}

		if (isGlobal) { return getGlobalValue(params, cb); }
		var combined = this.name + (params.field ? "." + params.field : "");
		var fieldValue = storeUtils.byString(this.values, params.field);
		if (fieldValue !== undefined) {
			if (!cb) { return fieldValue; }
			return cb(null, fieldValue);
		}
		if (!cb) { return null; }
		return cb("couldn't find a value");
	};
	/**
	 * Get multiple values from the store.
	* @param {Object[] | String[]} fields - An Array of field objects. If there are no fields proviced, all values in the store are returned.
	 * @param {String} fields[].field - The name of the field
	 * @param {Function} [cb] -  Will return the value if found.
	 * @returns {Object} - returns an object of with the fields as keys.If no callback is given and the value is local, this will run synchronous
	 * @example
	 * store.getValues([{field:'field1'},{field2:'field2'}],function(err,values){});
store.getValues(['field1','field2'],function(err,values){});
	 */
	this.getValues = function (fields, cb) {
		if (typeof fields === "function") {
			cb = fields;
			if (isGlobal) { return getGlobalValues(null, cb); }

			if (!cb) { return this.values; }
			return cb(null, this.values);
		}
		if (!Array.isArray(fields)) {
			return this.getValue(fields, cb);
		}

		if (isGlobal) { return getGlobalValues(fields, cb); }
		var values = {};

		for (var i = 0; i < fields.length; i++) {
			var item = fields[i];
			var field = typeof item === "string" ? item : item.field;
			var combined = this.name + (field ? "." + field : "");
			var fieldValue = storeUtils.byString(this.values, field);
			values[field] = fieldValue;
		}
		if (!cb) { return values; }
		return cb(null, values);
	};

	//get a single value from the global store
	function getGlobalValue(params, cb) {
		dataStoreClient.routerClient.query("storeService.getValue",
			{
				store: self.name,
				field: params.field
			}
			, function (err, response) {
				if (err) { return cb(err); }
				return cb(err, response.data);
			});
	}
	//get values from the global store
	function getGlobalValues(params, cb) {
		dataStoreClient.routerClient.query("storeService.getValues",
			{
				store: self.name,
				fields: params
			}
			, function (err, response) {
				if (err) { return cb(err); }
				return cb(err, response.data);
			});
	}

	/**
	 * Remove a value from the store.
	* @param {Object | String} params - Either an object or string
	 * @param {String} param.field - The name of the field
	 * @param {Function} [cb] -  returns an error if there is one
	 * @example
	 * store.removeValue({field:'field1'},function(err,bool){});
	 */
	this.removeValue = function (params, cb) {
		if (!params.field) {
			if (params !== undefined) {
				params = { field: params };
			}
			else {
				return cb("no field provided");
			}
		}
		params.value = null;
		return self.setValue(params, cb);
	};

	/**
	 * Removes multiple values from the store.
	 * @param {Object[] | String[]} params - An Array of field objects
	 * @param {String} param[].field - The name of the field
	 * @param {Function} [cb] -  returns an error if there is one.
	 * @example
	 * store.removeValue({field:'field1'},function(err,bool){});
	 */
	this.removeValues = function (params, cb) {
		if (!Array.isArray(params)) { return cb("The passed in parameter needs to be an array"); }
		async.map(params, this.removeValue, function (err, data) {
			return cb(err, data);
		});
	};

	/**
	 * Destroys the store.
	 * @param {Function} [cb] -  Will return the value if found.
	 * @example
	 * store.destroy();
	 */
	this.destroy = function (cb) {
		var self = this;
		var params = {};
		params.store = this.name;
		params.global = isGlobal;
		dataStoreClient.removeStore(params, function (err, response) {
			if (err) { return cb(err); }
			self = null;
			return cb(null, true);
		});
	};

	/**
	* Add a listener to the store at either the store or field level. If no field is given, the store level is used. You can also listen to nested object -- field1.nestedField
	* @param {Object} params - Params object
	* @param {String} [params.field] - The data field to listen for. If this is empty it listen to all changes of the store.
	* @param {Function} fn -  the function to call when a listener is triggered
	* @param {Function} [cb] - callback
	* @example
	*var myFunction = function(err,data){
	}
	* store.addListener({field:'field1'},myFunction,cb);

	*/
	this.addListener = function (params, fn, cb) {
		var field = null;
		if (typeof params === "function") {
			fn = params;
			params = {};
		}
		if (params.field) { field = params.field; }

		var combined = this.name + (field ? "." + field : "");
		if (listeners[combined]) {
			listeners[combined].push(fn);
		}
		else {
			listeners[combined] = [fn];
		}

		dataStoreClient.routerClient.subscribe("storeService" + combined, handleChanges);
		return cb ? cb() : null;
	};

	/**
	* Add an array of listeners as  objects or strings. If using strings, you must provide a function callback.
	* @param {Object[] | String[]} params - Params object
	* @param {String} params[].field - The data field to listen for.
	* @param {String} params[].listener - the function to call when a listener is triggered. If this is empty, fn is used.
	* @param {function=} fn -  the function to call when a listener is triggered
	*
	* @example
	*var myFunction = function(err,data){

	}
	store.addListeners([{field:'field1',listener:myFunction},{field:'field2',listener:myFunction}],null,cb);

	store.addListeners([{field:'field1'},{field:'field2',listener:myFunction}],myFunction,cb);

	store.addListeners(['field1','field2'],myFunction,cb);
	*/
	this.addListeners = function (params, fn, cb) {
		if (!Array.isArray(params)) {
			return this.addListener(params, fn, cb);
		}

		for (var i = 0; i < params.length; i++) {
			var field = null;
			var item = params[i];
			var ls;
			if (typeof item === "string") {
				field = item;
			} else if (item.field) {
				field = item.field;
				ls = params[i].listener;
			}

			var combined = this.name + (field ? "." + field : "");
			if (!ls) {
				if (fn && typeof fn === "function") {
					ls = fn;
				}
			}
			if (listeners[combined]) {
				listeners[combined].push(ls);
			}
			else {
				listeners[combined] = [ls];
			}
			dataStoreClient.routerClient.subscribe("storeService" + combined, handleChanges);
		}
		return cb ? cb() : null;

	};

	/**
	 * Remove a listener from  store. If no field is given, we look for a store listener
	 * @param {Object} params - Params object
	 * @param {String} [params.field] - The data field
	 * @param {function=} fn -  the function to remove from the listeners
	 * @param {function=}cb -  returns true if it was succesfull in removing the listener.
	 *
	 * @example
	 * var myFunction = function(err,data){
			}
	 * store.removeListener({field:'field1'},MyFunction,function(bool){});
	StoreCstorelient.removeListener(MyFunction,function(bool){});
	 */
	this.removeListener = function (params, fn, cb) {
		var field = null;

		if (typeof params === "function") {
			cb = fn;
			fn = params;
			params = {};
		}

		if (params.field) { field = params.field; }
		var combined = this.name + (field ? "." + field : "");
		if (listeners[combined]) {
			for (var i = 0; i < listeners[combined].length; i++) {
				if (listeners[combined][i] === fn) {
					listeners[combined].pop(i);
					return cb ? cb(null, true) : null;
				}
			}
		}
		return cb ? cb(null, false) : null;
	};
	/**
	 * Remove an array of listeners from the store
	 * @param {Object[] | String[]} params - Params object
	 * @param {String} params[].field - The data field to listen for. If this is empty it listen to all changes of the store.
	 * @param {String} params[].listener - The listener function
	 * @param {function=} fn -  the function to remove from the listeners
	 * @param {function=}cb -  returns true if it was succesfull in removing the listener.
	 *
	 * @example
	 * var myFunction = function(err,data){
			}
	 * store.removeListeners({field:'field1'},MyFunction,function(bool){});
	store.removeListeners([{field:'field1',listener:MyFunction}],function(bool){});
	store.removeListeners(['field1'],MyFunction,function(bool){});
	 */

	this.removeListeners = function (params, fn, cb) {
		if (!Array.isArray(params)) {
			if (typeof params === "function") {
				this.removeListener({}, params, cb);
			} else if (params.field) {
				this.removeListener(params, fn, cb);
			}
			return cb("missing fields");
		}
		var removeCount = 0;
		for (var i = 0; i < params.length; i++) {
			var field = null;
			var item = params[i];
			var ls;
			if (typeof item === "string") {
				field = item;
			} else if (item.field) {
				field = item.field;
				ls = params[i].listener;
			}

			var combined = this.name + (field ? "." + field : "");
			if (!ls) {
				if (fn && typeof fn === "function") {
					ls = fn;
				} else {
					continue;
				}
			}

			for (var j = 0; j < listeners[combined].length; j++) {
				if (listeners[combined][j] === ls) {
					listeners[combined].pop(i);
					removeCount++;
				}
			}
		}

		if (removeCount < params.length) {
			return cb("All listeners could not be found", false);
		}
		return cb ? cb(null, true) : null;
	};
	//This handles all changes coming in from the service
	function handleChanges(err, response) {// we use this to format our responses
		if (err) { Logger.system.error(err); }
		if (!response.data.store) { return; }
		if (!response.data.field) { response.data.field = null; }
		var combined = self.name + (response.data.field ? "." + response.data.field : "");
		var val = response.data.storeData ? response.data.storeData : response.data.value;
		triggerListeners(combined, val);
	}
	// Trigger any function that is listening for changes
	function triggerListeners(listenerKey, data) {
		if (listeners[listenerKey]) {
			for (var i = 0; i < listeners[listenerKey].length; i++) {
				if (typeof listeners[listenerKey][i] === "function") {
					listeners[listenerKey][i](null, { field: listenerKey, value: data });
				} else {
					Logger.system.warn("triggerListeners: listener is not a function", listenerKey, i, listeners[listenerKey][i]);
				}
			}
		}
	}
	return this;
};

module.exports = StoreModel;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/


var Utils = __webpack_require__(1);
var Validate = __webpack_require__(2); // Finsemble args validator
var BaseClient = __webpack_require__(3);

var Logger = __webpack_require__(0);

Logger.system.log("Starting AuthenticationClient");

/**
 * @introduction
 * <h2>Authentication Client</h2>
 *
 * The Authentication client supports two distinct areas of functionality:
 *
 * 1) The client API provides hooks for plugging in a custom sign-on component at the beginning of Finsemble startup (before application-level components are started). See <a href=tutorial-enablingAuthentication.html>Enabling Authentication</a> for an overview and example using these hooks. Only method, *publishAuthorization*, supports this capability in the Authentication Client API.
 *
 * 2) The client API also supports automatic login capabilities for Finsemble components. *Note this capability is experimental, not yet completely secure, and considered an Alpha release.*  (Please let us know if you are interested in using this functionality for production).  
 *
 * *The rest of this introduction outlines the general handshake when using Auto Sign-On.*
 *
 * 1) A component initiates a signon request using appSignOn(), which asynchronously returns a signOnData object. If the signOnData isn't already "cached" in an encrypted store, then the user will be prompted by the Authentication Service's sign-on dialog. The signOnData returned to the component includes the sign-on username and password, plus a `validationRequired` flag (more on this flag below). 
 *
 * 2) When appSignOn returns signOnData with `validationRequired=false`, then the signon data has already been verified and accepted, so it should be good for a successful login. However, if the signon fails then appSignOn should be called again with a "force" flag, causing the authentication service to bypass the stored signon data and reprompt the user. 
 *
 * 3) When appSignOn returns signOnData with `validationRequired=true`, then the signon data has not yet been verified since startup, meaning the component must either accept or reject the signon data based on whether or not the signon is successful. There are three main response cases here:
 * <br>
 *	*a)* For a successful signon, appAcceptSignon() is invoked, letting the Authentication Service know the signon data is good and should be saved.
 * <br>
 *	*b)* For an unsuccessful signon, typically appRejectAndRetrySignOn() is called, letting the Authentication Service know to both reject the recent signon data and try again (i.e. prompting the user again and returning another set of data).
 * <br>
 *	*c)* For an unsuccessful signon that will not be retried (essentially giving up, perhaps because of multiple previous attempts), appRejectSignOn is called, letting the Authentication Service know to reject the data (with no retries).
 *
 * Automatic signon handles multiple parallel request for the same sign-on data.  The first request received will be processed and the others queued.  After the first request is complete (i.e. accepted or rejected), then the queued requests will all be responded to with the results of the first request.  
 *
 * *Note: When a signon response is expected by the Authentication Service, there must a response within two minutes (after user data has been entered) or an automatic rejection will be triggered (meaning the signon data will not be saved in the encrypted store).*
 * *
 * @hideConstructor true
 * @constructor
 */
var AuthenticationClient = function (params) {
	var self = this;
	BaseClient.call(this, params);

	/**
	 * After authentication is complete, the authentication component must invoke this function to notify the authentication service of the authenticated username and authorization credentials. When notified, the authentication service publishes the username and authorization data to all interested subscribers, then signals for the startup sequence to continue.
	 *
	 * To receive the authorization information (published by the service after this function is invoked), any Finsemble component or service can subscribe to the SubPub "Authorization" topic (e.g. this.routerClient.subscribe("Authorization", authNoticationCallback));
	 *
	 * Note if the authentication expires after a time interval, it is up to the authentication component to periodically reauthenticate and publish updated information by invoking this function again. It is also up to the authentication component developer to specify how the authorization credentials should by used when communicating with specific external services.
	 *
	 * It is worth noting the authenticated username is always passed by the authentication service to the storage client using {@link StorageClient#setUser} to define the context for all user storage (i.e. saved workspaces, config, etc). When authentication is disabled, "defaultUser" is automatically passed to the storage service for the username.
	 *
	 * @param {string} user the name of the authenticated user
	 * @param {object} credentials the authorization credentials (or token) for the current user, as specified by the application's authentication component.
	 * @example
	 *
	 * FSBL.Clients.AuthenticationClient.publishAuthorization(username, credentials);
	 */
	this.publishAuthorization = function (user, credentials) {
		Logger.system.debug("publishAuthorization for " + user + " credentials: " + JSON.stringify(credentials));
		Validate.args(user, "string", credentials, "object");
		this.routerClient.transmit("AuthenticationService.authorization", { user: user, credentials: credentials });
	};

	/**
	 * ALPHA Automatic SignOn Function. Not used by components signing on, but only by "system dialog" component that prompts the user for signon data.  This command will send the user-input signon data back to the Authentication Service. 
	 * 
	 * @param {any} signOnData 
	 */
	this.transmitSignOnToAuthService = function (signOnData) {
		Logger.system.log("transmitSignOnToAuthService", signOnData);
		Validate.args(signOnData, "object");
		this.routerClient.transmit("authentication.dialogSignOnToAuthService", signOnData);
	};

	/**
	 * ALPHA Automatic SignOn Function. Returns the signon data after either prompting user or getting a cached version.   
	 * 
	 * @param {string} signOnKey component-defined unique identifier string representing the signon data (the same string must be used for each unique signon)
	 * @param {object} params object { icon, prompt, force, userMsg }.  `icon` is a url to icon to displace in signon dialog. `prompt` is a string to display in signon dialog. `force` indicates if signon dialog should be used even if accepted signon data is available in the encrypted store. `userMsg` is an option message to be displayed for user in signon dialog
	 * @param {function} cb callback function(err,response) with the response being an object: { signOnKey, username, password, validationRequired } 
	 */
	this.appSignOn = function (signOnKey, params, cb) {
		Validate.args(signOnKey, "string", params, "object", cb, "function");
		this.routerClient.query("authentication.appSignOn", { signOnKey, params }, { timeout: -1 }, function (err, response) {
			if (cb) {
				cb(err, response.data);
			}
		});
	};
	
	/**
	 * ALPHA Automatic SignOn Function. Rejects previous signon data and restarts signon. Returns the signon data after either prompting user or getting a cached version. Should only be called when validationRequired is true in signon response.  
	 * 
	 * @param {any} signOnKey
	 * @param {object} params object { userMsg } where `userMsg` is an option message to be displayed for user in signon dialog
	 * @param {any} cb 
	 */
	this.appRejectAndRetrySignOn = function (signOnKey, params, cb) {
		Logger.system.log("appRejectAndRetrySignOn", signOnKey);
		Validate.args(signOnKey, "string", params, "object", cb, "function");
		this.routerClient.query("authentication.appRejectAndRetrySignOn", { signOnKey, params }, { timeout: -1 }, function (err, response) {
			if (cb) {
				cb(err, response.data);
			}
		});
	};

	/**
	 * ALPHA Automatic SignOn Function. Accepts the data returned by appSignOn, causing the data to be saved for future use. Should only be called when validationRequired is true in signon response.
	 * 
	 * @param {any} signOnKey 
	 */
	this.appAcceptSignOn = function (signOnKey) {
		Logger.system.log("appAcceptSignOn", signOnKey);
		Validate.args(signOnKey, "string");
		this.routerClient.transmit("authentication.appAcceptSignOn", { signOnKey });
	};

	/**
	 * ALPHA Automatic SignOn Function. Rejects the data returned by previous signon. Should only be called when validationRequired is true in signon response.
	 * 
	 * @param {any} signOnKey 
	 */
	this.appRejectSignOn = function (signOnKey) {
		Logger.system.log("appRejectSignOn", signOnKey);
		Validate.args(signOnKey, "string");
		this.routerClient.transmit("authentication.appRejectSignOn", { signOnKey });
	};
};

var authenticationClient = new AuthenticationClient({
	onReady: function (cb) {
		Logger.system.log("authenticationClient online");
		if (cb) {
			cb();
		}
	},
	name: "authenticationClient"
});
authenticationClient.requiredServices = [];
module.exports = authenticationClient;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var Utils = __webpack_require__(1);
var Logger = __webpack_require__(0);
var Validate = __webpack_require__(2); // Finsemble args validator
var BaseClient = __webpack_require__(3);
var configClient = __webpack_require__(13);
var linkerClient = __webpack_require__(14);
var launcherClient = __webpack_require__(6);
var windowClient = __webpack_require__(7);
var async = __webpack_require__(4);
const DRAG_START_CHANNEL = "DataTransferClient.dragStart";
const DRAG_END_CHANNEL = "DataTransferClient.dragEnd";
const SHARE_HIGHLIGHT_OPACITY = 1;
const SHARE_METHOD = {
	DROP: "drop",
	SPAWN: "spawn",
	LINKER: "linker"
};

/**
 *
 * @introduction
 * <h2>DataTransfer Client (Beta)</h2>
 *
 * The DataTransfer client acts as an API to share data between components via a user action such as drag and drop. As an example consider a user wanting to share a chart inside a chat. The DataTransfer Client can also make use of the Linker Client to share data between linked windows.
 *
 * A component that shares data needs to publish the data types it can share by calling setEmitters. The Finsemble Window Manager automatically adds a draggable share icon to any component that calls setEmitters.
 *
 * Similarly a component that can receive data needs to publish that using addReceivers. Since it is possible to have multiple components on a page receiving the data, you can add multiple receivers for the same dataType.
 *
 * The DataTransfer client overlays a scrim on windows once you start dragging a Finsemble Sharable item and on the windows that can receive data the scrim behaves as a drop zone. However, this doesn't always work well, especially with complex third party components. You may need to add your own drop zone to the document and use FSBL.DataTransferClient.drop as the handler.
 *
 * Here is a [tutorial on using the DataTransfer Client](tutorial-sharingData.html).
 *
 * @hideConstructor true
 * @constructor
 */
var DataTransferClient = function (params) {
	Validate.args(params, "object=") && params && Validate.args2("params.onReady", params.onReady, "function=");
	BaseClient.call(this, params);
	this.emitters = {};
	this.receivers = {};
	this.receiveResponder = false;
	this.linkerListener = false;
	var self = this;

	/**
	 * Default: true
	 *
	 * Set this to false to disable handling of linked data
	 */
	this.openLinkerDataByDefault = true;

	/**
	 * This constant object contains all the share methods. You can use it in a receive handler to handle different share methods. Current share methods are
	 *	* SHARE_METHOD.DROP
	 *	* SHARE_METHOD.SPAWN
	 *	* SHARE_METHOD.LINKER
	 *
	 * @example
	 * // Ignore data unless it was dropped
	 * function shareHandler(err, response) {
	 *	if(response.shareMethod != FSBL.Clients.DataTransferClient.SHARE_METHOD.DROP) {
	 *		return;
	 * 	}
	 *	// Handle dropped data below:
	 * }
	 */
	this.SHARE_METHOD = SHARE_METHOD;

	/**
	 * setEmitters sets all the data that can be shared by the component.
	 *
	 * @param {object} params.emitters This is a list of objects which contain a dataType and a function to get the data.
	 * @example
	 * DataTransferClient.setEmitters({
	 * 	emitters: [
	 * 		{
	 * 			type: "symbol",
	 * 			data: getSymbol
	 * 		},
	 * 		{
	 * 			type: "chartiq.chart",
	 * 			data: getChart
	 *		}
	 * 	]
	 * })
	 */
	this.setEmitters = function (params) {

		if (!Array.isArray(params.emitters)) { return; }
		params.emitters.forEach(function (emitter) {
			//TODO validate
			self.emitters[emitter.type] = emitter;
		});

		//Object.assign(this.emitters, params.emitters);
		this.routerClient.publish(this.windowName + "Finsemble.Sharer", {
			emitterEnabled: Object.keys(self.emitters).length ? true : false,
			receiverEnabled: Object.keys(self.receivers).length ? true : false,
		});
		if (!this.receiveResponder) {
			Logger.system.log("Adding DataTransfer Responder");
			this.routerClient.addResponder(this.windowName + ".Share", function (err, response) {
				self.emit.call(self, err, response);
			});
			this.receiveResponder = true;
		}
	};

	/**
	 * addReceivers adds receivers for the data that can be received by the component.
	 *
	 * @param {object} params.receivers This is a list of objects, each containing a type and a handler function to call with the data once received. The receiver can take a regular expression as its type to provide the ability to receive multiple data types. Each type can have multiple handlers so you can use the same type multiple times in your call.
	 *
	 * @example
	 * DataTransferClient.addReceivers({
	 * 	receivers: [
	 * 		{
	 * 			type: "symbol",
	 * 		 	handler: changeSymbol
	 * 		}, {
	 * 			type: "chartiq.chart",
	 * 			handler: openChart
	 * 		}
	 * 	])
	 * DataTransferClient.addReceivers({
	 * 	receivers: [
	 *		{
	 * 			type: &#47;.*&#47;,
	 *	 		handler: getEverythingAComponentCanEmit
	 * 		}
	 * 	])
	 */

	this.addReceivers = function (params) {
		if (!Array.isArray(params.receivers)) { return; }

		params.receivers.forEach(function (receiver) {
			//TODO validate
			var type = receiver.type.toString(); // in case this is a regex
			if (!self.receivers[type]) { self.receivers[type] = [receiver]; }
			else { self.receivers[type].push(receiver); } //TODO check dupes??

		});

		//Object.assign(this.receivers, params.receivers);
		this.routerClient.publish(this.windowName + "Finsemble.Sharer", {
			emitterEnabled: Object.keys(self.emitters).length ? true : false,
			receiverEnabled: Object.keys(self.receivers).length ? true : false,
		});

		var spawnData = windowClient.getSpawnData();
		if (spawnData && spawnData.sharedData) {
			windowClient.getComponentState({ field: "Finsemble.DealtWithSpawnSharedData" }, function (err, data) {
				if (!data) {
					windowClient.setComponentState({ field: "Finsemble.DealtWithSpawnSharedData", value: "done" }, function () {
						Logger.system.log("Spawn");
						dataTransferClient.handleSharedData(spawnData.sharedData, SHARE_METHOD.SPAWN);
					});
				}
			});
		}

		if (!this.linkerListener && this.openLinkerDataByDefault) {
			linkerClient.subscribe("Finsemble.DataTransferClient", function (data, responseDetail) {
				if (!responseDetail.originatedHere()) {
					Object.keys(data).forEach(function (dataType) {
						if (self.canReceiveData(dataType)) {
							var dataToHandle = {};
							dataToHandle[dataType] = data[dataType];
							dataTransferClient.handleSharedData(dataToHandle, SHARE_METHOD.LINKER);
						}
					});

				}
			});
			this.linkerListener = true;
		}


	};


	/**
	 * updateReceivers updates the handlers for the data that can be received by the component.
	 *
	 * @param {object} params.receivers This is a list of objects, each containing a type, the existing handler (oldHandler) and a handler function to replace the old handler with.
	 * @private
	 * @example
	 * DataTransferClient.updateReceivers({
	 * 	receivers: [
	 * 		{
	 * 			type: "symbol",
	 *			oldHandler: updateSymbol,
	 * 		 	handler: changeSymbol
	 * 		}, {
	 * 			type: "chartiq.chart",
	 *			oldHandler: openChart_old,
	 * 			handler: openChart_new
	 * 		}
	 * 	])
	 * DataTransferClient.updateReceivers({
	 * 	receivers: [
	 *		{
	 * 			type: /.*&#47;,
	 *	 		oldHandler: getEverythingAComponentCanEmit,
	 *			handler: doSomethingWithAllThisData
	 * 		}
	 * 	])
	 */
	this.updateReceivers = function (params) {
		if (!Array.isArray(params.receivers)) { return; }

		params.receivers.forEach(function (receiver) {
			//TODO validate
			var type = receiver.type.toString();
			if (!self.receivers[type]) { self.receivers[type] = []; }
			var receivers = self.receivers[type];

			for (var i = 0; i < receivers.length; i++) {
				if (receivers[i].handler === receiver.oldHandler) {
					receivers[i].handler = receiver.handler;
				}
			}

			self.receivers[type].push(receiver.handler);
		});

		if (!self.linkerListener) {
			linkerClient.subscribe("Finsemble.DataTransferClient", function (data, responseDetail) {
				if (!responseDetail.originatedHere()) { dataTransferClient.handleSharedData(data, SHARE_METHOD.LINKER); }
			});
			self.linkerListener = true;
		}

		//TODO - should you add if handler does no exist?
		//Object.assign(self.receivers, params.receivers);
		//self.routerClient.publish(self.windowName + 'Finsemble.Sharer', { receiverEnabled: true });
	};

	/**
	 * removeReceivers removes the handlers for the data that can be received by the component.
	 *
	 * @param {object} params.receivers This is a list of objects, each containing a type and the handler that needs to be removed.
	 * @private
	 * @example
	 * DataTransferClient.removeReceivers({
	 * 	receivers: [
	 * 		{
	 * 			type: "symbol",
	 * 		 	handler: changeSymbol
	 * 		}, {
	 * 			type: "chartiq.chart",
	 * 			handler: openChart
	 * 		}
	 * 	])
	 * DataTransferClient.removeReceivers({
	 * 	receivers: [
	 *		{
	 * 			type: /.*&#47;,
	 *	 		oldHandler: getEverythingAComponentCanEmit
	 * 		}
	 * 	])
	 */
	this.removeReceivers = function (params) {
		if (!Array.isArray(params.receivers)) { return; }

		params.receivers.forEach(function (receiver) {
			//TODO validate
			var type = receiver.type.toString();
			if (!self.receivers[type]) { return; }
			var receivers = self.receivers[type];

			for (var i = 0; i < receivers.length; i++) {
				if (receivers[i].handler === receiver.handler) {
					receivers.splice(i, 1);
					break;
				}
			}
		});

		// TODO - remove drop zone if no receivers
		//Object.assign(self.receivers, params.receivers);
		//self.routerClient.publish(self.windowName + 'Finsemble.Sharer', { receiverEnabled: true });
	};


	/**
	 * This is a drag event handler for an element that can be dragged to share the data. The window manager uses this internally when the share icon is dragged. This can be attached to any element that needs to be draggable.
	 *
	 * @param {event} event
	 */
	this.dragStart = function (event) {
		self.routerClient.transmit(DRAG_START_CHANNEL, Object.keys(self.emitters));
		var data = {
			FSBL: true,
			window: self.windowName,
			emitters: Object.keys(self.emitters)
		};
		Logger.system.log("Drag Data:", data);
		event.dataTransfer.setData("text/plain", JSON.stringify(data));
	};

	this.dragStartWithData = function (event, data) {
		self.routerClient.transmit(DRAG_START_CHANNEL, Object.keys(data));
		var dragdata = {
			FSBL: true,
			containsData: true,
			window: self.windowName,
			data: data
		};
		Logger.system.log("Drag Data:", dragdata);
		event.dataTransfer.setData("text/plain", JSON.stringify(dragdata));
	};

	this.handleSharedData = function (sharedData, shareMethod) {
		Object.keys(self.receivers).forEach(function (key) {
			var receiver = self.receivers[key];
			var data = {};
			Logger.system.log("Receiver: ", key);
			Object.keys(sharedData).forEach(function (value) {
				Logger.system.log("Data Key: ", value);
				if (receiver[0].type instanceof RegExp) {
					if (value.match(receiver.type)) {
						data[value] = sharedData[value];
						Logger.system.log("Match RegEx");
					}
				} else if (self.receivers[value]) {
					data[value] = sharedData[value];
					Logger.system.log("Match");
				}
			});
			if (Object.keys(data).length) {
				receiver.forEach(function (r) { // Each receiver can have multiple entries
					r.handler(null, { data: data, shareMethod: shareMethod });
				});
			}
		});



	};

	/**
	 * This is a drop event handler that can be attached to any element that you want to be a drop zone for the DataTransfer Client. It automatically requests data for all the data elements that are common between the receiver and the emitter.
	 *
	 * @param {event} event
	 */
	this.drop = function (event) {
		if (!event.dataTransfer) { event.dataTransfer = event.originalEvent.dataTransfer; } // deal with jQuery events not having dataTransfer
		var data = event.dataTransfer.getData("text/plain");
		Logger.system.log(data);

		if (data) {
			try {
				var data = JSON.parse(data);
			} catch (e) {
				return;
			}
			if (data.FSBL) {
				event.preventDefault();
				event.stopPropagation();
				if (data.containsData) { //the data is embedded into the request
					self.handleSharedData(data.data, SHARE_METHOD.DROP);
				} else {
					var sourceWindow = data.window;
					var availableEmitters = data.emitters;

					var commonData = [];
					var receiverKeys = Object.keys(self.receivers);
					for (var i = 0; i < availableEmitters.length; i++) {
						var addToCommon = false;
						var emitter = availableEmitters[i];
						if (self.canReceiveData(emitter)) {
							commonData.push(emitter);
						}
					}

					Logger.system.log("Common Data", commonData);

					self.routerClient.query(sourceWindow + ".Share", commonData, function (err, response) {
						self.handleSharedData(response.data, SHARE_METHOD.DROP);
					});
				}
			}

		}
	};

	/**
	 *
	 *
	 * @param {object} params This is a list of strands whose data is required
	 * @param {function} cb This is the function to call with the data
	 * @private
	 */
	this.emit = function (error, params) {
		values = {};

		//TODO aync functions and test this stuff
		async.each(params.data, function (index, cb) {
			let item = self.emitters[index];
			if (item.data && typeof item.data === "function") {
				/*item(function (err, data) {
					if (err) {
						cb(err);
					} else {
						values[index] = data;
						cb();
					}
				})*/
				values[index] = item.data();
				cb();
			} else {
				values[index] = item.data;
				cb();
			}

		}, function () {
			params.sendQueryResponse(null, values);
		});
	};

	/**
	 * This gets a list of components that can receive a specific type. It looks in the config for each componentType for an advertiseReceivers property.
	 *
	 * @example
	 * "Advanced Chart": {
	 *		...
	 * 		"component": {
	 * 			"advertiseReceivers": ["chartiq.chart", "symbol"]
	 * 		},
	 *		...
	 *
	 *
	 * @param {object} params
	 * @param {string} [params.type]
	 * @param {Function=} cb callback to be invoked with the list of component types
	 *
	 * @example
	 * DataTransferClient.getComponentsThatCanReceiveType ({ type: "chartiq.chart"}, callback)
	 *
	 */
	this.getComponentsThatCanReceiveType = function (params, cb) {
		FSBL.Clients.ConfigClient.get({ field: "finsemble.components" }, function (err, response) {
			if (err) {
				cb(err, null);
			} else {
				var componentList = [];
				Object.keys(response).forEach(function (key) {
					if (!response[key] || !response[key].component) { return; }
					let advertiseReceivers = response[key].component.advertiseReceivers;
					if (!advertiseReceivers) {
						return;
					}
					if (!Array.isArray(advertiseReceivers)) {
						advertiseReceivers = [advertiseReceivers];
					}
					if (self.canReceiveData(params.type, advertiseReceivers)) {
						componentList.push(key);
					}
				});
				cb(null, componentList);
			}
		});
	};

	/**
	 * This will either open a component with the shared data or publish the shared data using the linker client if the window is linked
	 *
	 * @param {object} params
	 * @param {object} [params.data]
	 * @param {object} [params.publishOnly] if the component is linked, this will only publish the data, not force open a window if it does not exist
	 *
	 */
	this.openSharedData = function (params) {
		let componentListByType = {};
		let combinedComponentList = [];
		let data = params.data;

		let gotComponents = function (err, type, componentList) {
			componentListByType[type] = componentList;
			if (!componentList) { componentList = []; }
			componentList.forEach(function (component) {
				if (!combinedComponentList.includes(component)) {
					combinedComponentList.push(component);
				}
			});

			/* TODO - deal with specific cases:
				- multiple component types can consume same data
				- multiple data types - each to different component(s)
				- linker groups - different groups might have windows with different data
				- can there be other cases??

			*/

			/* TODO: restrict published data to specfic channels?
			*/

			// if we have everything
			if (Object.keys(data).length == Object.keys(componentListByType).length) {
				if (!combinedComponentList.length) {
					Logger.system.error("No Components Available to Handle the data");
				} else if (combinedComponentList.length == 1) {
					var groups = linkerClient.getGroups().groups;
					if (groups.length) {
						var windowsThatCanTakeData = [];
						async.each(groups, function (group, cb) {
							linkerClient.getAllWindowsInGroup(group.name, function (err, windows) {
								if (!Object.keys(windows).length) {
									cb();
									return;
								}
								Object.keys(windows).forEach(function (index) {
									let window = windows[index];
									if (window.componentType == combinedComponentList[0]) {
										windowsThatCanTakeData.push(window);
									}
								});
								cb();

							});
						}, function () {
							if (windowsThatCanTakeData.length || params.publishOnly) {
								linkerClient.publish({
									dataType: "Finsemble.DataTransferClient",
									data: data
								});
							} else {
								launcherClient.spawn(combinedComponentList[0], {
									data: {
										sharedData: data,
										linker: {
											groups: Object.keys(linkerClient.groups)
										}
									}
								});
							}
						});

						// TODO - check if linked windows exist
					} else {
						launcherClient.spawn(combinedComponentList[0], {
							data: {
								sharedData: data
							}
						});
					}
				} else {
					//TODO: Deal with multiple components
				}
			}

		};

		Object.keys(data).forEach(function (key) {
			let myKey = key;
			self.getComponentsThatCanReceiveType({ type: myKey }, function (err, componentList) {
				gotComponents(err, myKey, componentList);
			});
		});
	};

	/**
	 * @private
	 */
	this.addWindowHighlight = function (canReceiveData) {
		let scrim = document.createElement("div");
		scrim.id = "fsbl-share-scrim";
		scrim.className = "fsbl-share-scrim";
		let icon = document.createElement("i");
		if (canReceiveData) {
			icon.className = "ff-share yes";
			// use capture to make sure this happens
			document.addEventListener("dragover", self.dragover);
			document.addEventListener("drop", self.drop);
			Logger.system.info("Event Listeners Added");
		} else {
			icon.className = "ff-delete-circle no";
		}
		scrim.appendChild(icon);
		document.body.appendChild(scrim);


		fin.desktop.Window.getCurrent().updateOptions({
			opacity: SHARE_HIGHLIGHT_OPACITY
		});
	};

	/**
	 * @private
	 */
	this.removeWindowHighlight = function () {
		var scrim = document.getElementById("fsbl-share-scrim");
		if (scrim) { scrim.parentNode.removeChild(scrim); }
		document.removeEventListener("dragover", self.dragover);
		document.removeEventListener("drop", self.drop);
		fin.desktop.Window.getCurrent().updateOptions({
			opacity: 1
		});
	};

	/**
	 * @private
	 */
	this.canReceiveData = function (dataTypeArray, receiverKeys) {
		if (!Array.isArray(dataTypeArray)) {
			dataTypeArray = [dataTypeArray];
		}

		let local = false;

		if (!receiverKeys) {
			receiverKeys = Object.keys(self.receivers);
			local = true;
		}

		for (var i = 0; i < dataTypeArray.length; i++) {
			var emitter = dataTypeArray[i];
			for (var j = 0; j < receiverKeys.length; j++) {
				if (!local) { // this is if a string of data types is provided - used in getComponentsThatCanReceiveType
					if (emitter === receiverKeys[j]) {
						return true;
					}
					continue;
				}
				var receiver = self.receivers[receiverKeys[j]];
				if (!receiver.length) { continue; }
				else { receiver = receiver[0]; }
				if (receiver.type instanceof RegExp) { // Is it a regex?
					if (emitter.match(receiver.type)) {
						return true;
					}
				} else {
					if (emitter === receiver.type) {
						return true;
					}
				}
			}
		}
		return false;
	};

	/**
	 * @private
	 */
	this.dragover = function (e) {
		e.preventDefault();
		return false;
	};

	/**
	 * @private
	 */
	this.addListeners = function () {
		window.addEventListener("dragend", function () {
			self.routerClient.transmit(DRAG_END_CHANNEL, {});
		});

		this.routerClient.addListener(DRAG_START_CHANNEL, function (err, message) {
			let dataBeingShared = message.data;
			if (!self.canReceiveData(dataBeingShared) || message.originatedHere()) {
				self.addWindowHighlight(false);
			} else {
				self.addWindowHighlight(true);
			}
		});

		this.routerClient.addListener(DRAG_END_CHANNEL, function (err, message) {
			self.removeWindowHighlight();
		});
	};
};

var dataTransferClient = new DataTransferClient({
	onReady: function (cb) {
		dataTransferClient.addListeners();

		if (cb) {
			cb();
		}
	},
	name: "dataTransferClient"
});

dataTransferClient.requiredClients = ["configClient", "linkerClient", "launcherClient", "windowClient"];

module.exports = dataTransferClient;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

var async = __webpack_require__(4);
var LauncherClient = __webpack_require__(6);
var WindowClient = __webpack_require__(7);
var StoreClient = __webpack_require__(9);
var Utils = __webpack_require__(1);
var Validate = __webpack_require__(2);
var BaseClient = __webpack_require__(3);
var Logger = __webpack_require__(0);
Logger.system.log("Starting DialogManagerClient");

/**
 *
 * @introduction
 * <h2>Dialog Manager Client</h2>
 *
 * The Dialog Manager client simplifies interacting with dialog windows, by spawning them and getting data back from them. In this contex, a dialog window is simply a child window spawned to interact with the user, such as a confirmation dialog. Functions are provided here for both the parent-window side and the dialog/child-window side.
 *
 *`FSBL.Clients.DialogManager` is always pre-initialized with one instance of the Dialog Manager in the Finsemble Library (making it essentially, a singleton when referenced in the same window). This means component developers directly access the Dialog Manager without using the constructor (e.g., `FSBL.Clients.DialogManager.spawnDialog(...);`) -- *the constructor is not exposed to components.*
 *
 * @param {object=} params optional parameters
 * @param {function=} params.onReady callback function indicating when client is ready
 * @param {string=} params.name client name for diagnostics/logging
 * @constructor
 * @hideConstructor true
 */
var DialogManagerClient = function (params) {
	Validate.args(params, "object=") && params && Validate.args2("params.onReady", params.onReady, "function=");

	BaseClient.call(this, params);
	var self = this;
	/////////////////////////////////////////////
	// Public Functions -- Dialog Parent Side
	/////////////////////////////////////////////

	/**
	 * Spawns a Dialog window.
	 *
	 * parameters pass here in `inputParams` can be retrieved in the dialog window by calling [getParametersFromInDialog]{@link DialogManagerClient#getParametersFromInDialog}.
	 *
	 * @param {object} launchParams Parameters. Same as {@link LauncherClient#spawn} with the following exceptions.
	 * @param {string} launchParams.url URL of dialog to launch
	 * @param {string} [launchParams.name] - The name of the dialog
	 * @param {any} launchParams.x - Same as {@link LauncherClient#spawn} except defaults to "center".
	 * @param {any} launchParams.y - Same as {@link LauncherClient#spawn} except defaults to "center".
	 * @param {any} inputParams Object or any data type needed by your dialog.
	 * @param {function} dialogResponseCallback called when response received back from dialog window (typically on dialog completion). `responseParameters` is defined by the dialog.
	 * @param {function} [cb] Returns response from {@link LauncherClient#spawn}
	 *
	 * @example
	 * FSBL.Clients.DialogManager.spawnDialog(
	 * 	{
	 * 		name: "dialogTemplate",
	 * 		height:300,
	 * 		width:400,
	 * 		url:"http://localhost/components/system/dialogs/dialog1.html"
	 * 	},
	 * 	{
	 * 		someData: 12345
	 * 	},
	 * 		function (error, responseParameters) {
	 *			if (!error) {
	 * 				console.log(">>>> spawnDialog response: " + JSON.stringify(responseParameters));
	 *			}
	 * 	});
	 * @todo allow dialogs to be permanent components instead of ad-hoc.
	 * @todo support paramter to make the dialog modal
	 */

	this.spawnDialog = function (launchParams, inputParams, dialogResponseCallback, cb) {
		Logger.system.debug("spawning dialog");
		Validate.args(launchParams, "object", inputParams, "object", dialogResponseCallback, "function");
		let self = this;
		let responseChannel = Utils.getUniqueName("DialogChannel");

		launchParams.data = { inputParams, responseChannel: responseChannel };

		// Dialogs default to center
		if (!params.left && params.left !== 0 && !params.right && params.right !== 0) {
			params.left = "center";
		}
		if (!params.top && params.top !== 0 && !params.bottom && params.bottom !== 0) {
			params.top = "center";
		}
		self.routerClient.addListener(responseChannel, function cb(err, response) {
			Logger.system.debug("dialogResponse: " + JSON.stringify(response));
			dialogResponseCallback(err, response.data);
			self.routerClient.removeListener(responseChannel, cb);
		});
		LauncherClient.spawn("dialogTemplate", launchParams, function (err, response) {
			if (err) {
				Logger.system.error("ERROR", err);
				dialogResponseCallback(err, response);
			}
			if (cb) { cb(err, response); }
		});
	};

	/**
	 * Cancels an active dialog prematurely (normally a dialog will terminate on completion, returning a response).
	 * @private
	 * @param {any} dialogID identifies dialog to be terminated
	 *
	 * @todo implement when launcher supports kill function. [terry] use windowIdentifier returned from spawn() to kill.
	 */
	//this.killSpawnedDialog = function (dialogID) { };

	/////////////////////////////////////////////
	// Public Functions -- Dialog Client Side
	/////////////////////////////////////////////

	/**
	 * Called within dialog window to get the parameters passed in spawnDialog's "inputParams"
	 *
	 * @param {any} dialogID identifies dialog to be terminated
	 *
	 * @return {object} inputParams parameters pass to dialog
	 * @example
	 * var dialogData = FSBL.Clients.DialogManager.getParametersFromInDialog();
	 */
	this.getParametersFromInDialog = function () {
		var inputParams = WindowClient.getSpawnData().inputParams;
		Logger.system.debug("getParametersFromInDialog: " + JSON.stringify(inputParams));
		return inputParams;
	};

	/**
	 * Called within dialog window to pass back dialog response and terminal window. This results in the [spawnDialog]{@link DialogManagerClient#spawnDialog} callback function (i.e. `dialogResponseCallback`) being invoked with `responseParameters` passed in.
	 *
	 * @param {any} responseParameters parameters returned to parent (i.e. window that spawned the dialog)
	 *
	 * @example
	 * FSBL.Clients.DialogManager.respondAndExitFromInDialog({ choice: response });
	 */
	this.respondAndExitFromInDialog = function (responseParameters) {
		Validate.args(responseParameters, "any");
		Logger.system.debug("sendResponseFromInDialog: " + JSON.stringify(responseParameters));
		var responseChannel = WindowClient.getSpawnData().responseChannel;
		this.routerClient.transmit(responseChannel, responseParameters);
		this.routerClient.disconnectAll();
		fin.desktop.Window.getCurrent().close(true);
	};

	this.getAvailableDialog = function (type, cb) {
		this.DialogStore.getValue("dialogs.available", (err, availableDialogs) => {
			for (let dialogName in availableDialogs) {
				let dialog = availableDialogs[dialogName];
				if (dialog.componentType === type) {
					return cb(dialog);
				}
			}
			cb(null);
		});
	};
	this.generateDialogReadyChannel = function (identifier) {
		let concat = identifier.windowName + identifier.uuid;
		return `Dialog.${concat}.ready`;
	};

	this.showDialog = function () {
		let listenerChannel = self.generateDialogReadyChannel(LauncherClient.myWindowIdentifier);
		//tells the dialog manager in the opening window that the dialog is ready to be shown.
		self.routerClient.transmit(listenerChannel, {
			userInputTimeout: typeof self.userInputTimeout === "undefined" ? 10000 : self.userInputTimeout
		});
	};

	this.sendQueryToDialog = function (identifier, options, onUserInput) {
		function warn(timeout) {
			console.warn(`No response from dialog ${identifier.windowName} after ${timeout/1000} seconds. Check to make sure your dialog is sending back data.`);
		}

		this.moveDialogFromAvailableToOpened(identifier);
		let concat = identifier.windowName + identifier.uuid;
		let queryChannel = `Dialog.${concat}.Show`;
		let listenerChannel = this.generateDialogReadyChannel(identifier);
		let warning;
		function onDialogReady(err, response) {
			warning = setTimeout(warn.bind(null, response.data.userInputTimeout), response.data.userInputTimeout);
			Logger.system.verbose("ShowWindow DialogManager Dialog ready");

			LauncherClient.showWindow(identifier, {
				monitor: "mine",
				left: "center",
				top: "center"
			}, function (err, response) {
				response.finWindow.focus();
				Logger.system.verbose("ShowWindow DialogManager showWindow finish");
			});
			self.routerClient.removeListener(listenerChannel, onDialogReady);
		}

		this.routerClient.addListener(listenerChannel, onDialogReady);
		Logger.system.verbose("ShowWindow DialogManager sendQuery start");

		this.routerClient.query(queryChannel, options, function (err, response) {
			clearTimeout(warning);
			self.moveDialogFromOpenedToAvailable(identifier);
			onUserInput(err, response.data);
		});
	};

	this.moveDialogFromOpenedToAvailable = function (identifier) {
		this.DialogStore.getValue("dialogs", (err, dialogs) => {
			let openedDialogs = dialogs.opened;
			let availableDialogs = dialogs.available;

			delete openedDialogs[identifier.windowName];
			availableDialogs[identifier.windowName] = identifier;

			this.DialogStore.setValue({ field: "dialogs.opened", value: openedDialogs });
			this.DialogStore.setValue({ field: "dialogs.available", value: availableDialogs });
		});
	};

	this.moveDialogFromAvailableToOpened = function (identifier) {
		this.DialogStore.getValue("dialogs", (err, dialogs) => {
			let availableDialogs = dialogs.available;
			let openedDialogs = dialogs.opened;

			//@todo, what about when the dialog isn't available...
			delete availableDialogs[identifier.windowName];
			openedDialogs[identifier.windowName] = identifier;

			this.DialogStore.setValue({ field: "dialogs.available", value: availableDialogs });
			this.DialogStore.setValue({ field: "dialogs.opened", value: openedDialogs });
		});
	};
	this.registerModal = function () {
		this.DialogStore.setValue({ field: "modalIdentifier", value: LauncherClient.myWindowIdentifier });
	};

	this.showModal = function (cb) {
		self.DialogStore.getValue("modalIdentifier", function (err, identifier) {
			LauncherClient.showWindow(identifier, null, function (err, response) {
				fin.desktop.Window.getCurrent().focus();
				response.finWindow.bringToFront(function () {
					fin.desktop.Window.getCurrent().bringToFront();
					if (cb) {
						cb();
					}
				});
			});
		});
	};

	this.open = function (type, options, onUserInput) {
		//show, spawnif there are no available dialogs of that type..
		let self = this;
		this.getAvailableDialog(type, (dialogIdentifier) => {
			if (dialogIdentifier) {

				//send open message
				this.sendQueryToDialog(dialogIdentifier, options, onUserInput);
			} else {
				//spawn, then send open message.
				LauncherClient.spawn(type, {
					options: {
						customData: {
							"foreign": {
								"clients": {
									"dialogManager": {
										"isDialog": true
									}
								}
							}
						}
					}
				}, function (err, response) {
					self.open(type, options, onUserInput);
				});
			}
		});
	};

	this.DialogStore = null;
	this.isDialog = false;
	this.isModal = false;
	//used by dialogs, set in `registerWithStore`.
	this.RESPONDER_CHANNEL = null;
	this.openerMessage = null;
	//invoked by component.
	//says to the opener, 'hey i'm ready, show me.'
	this.registerDialogCallback = function (callback) {
		this.routerClient.addResponder(this.RESPONDER_CHANNEL, (err, message) => {
			this.openerMessage = message;
			callback(err, message);
		});
	};
	this.hideModal = function () {
		self.DialogStore.getValue("modalIdentifier", function (err, identifier) {
			let modalWrap = fin.desktop.Window.wrap(identifier.uuid, identifier.windowName);
			modalWrap.hide();
		});
	};

	this.respondToOpener = function (data) {
		Logger.system.verbose("RespondToOpener", data);
		this.openerMessage.sendQueryResponse(null, data);
		this.hideModal();
		fin.desktop.Window.getCurrent().hide();
		this.openerMessage = null;
	};


	this.registerWithStore = function (callback) {
		if (this.isDialog) {

			Logger.system.verbose("DialogManager.registerWithStore");
			let identifier = LauncherClient.myWindowIdentifier;
			this.RESPONDER_CHANNEL = `Dialog.${identifier.windowName + identifier.uuid}.Show`;
			this.DialogStore.setValue({ field: `dialogs.available.${identifier.windowName}`, value: identifier }, callback);
		} else {
			callback();
		}
	};

	this.checkIfWindowIsDialog = function (cb) {
		let err = null;
		try {
			this.isDialog = WindowClient.options.customData.foreign.clients.dialogManager.isDialog;
		} catch (e) {
			err = e;
		}
		if (cb) {
			cb(err);
		}
	};

	this.createStore = function (callback) {
		let self = this;
		let defaults = {
			dialogs: {
				opened: {},
				available: {}
			}
		};
		StoreClient.createStore({ store: "DialogStore", values: defaults, global: true }, function (err, store) {
			Logger.system.verbose("DialogManager.Store Created");
			self.DialogStore = store;
			callback();
		});
	};
};

// instance of dialogManagerClient that is exported by this module
var dialogManagerClient = new DialogManagerClient({
	onReady: function (cb) {
		Logger.system.log("dialogClient online");
		async.series([
			dialogManagerClient.createStore.bind(dialogManagerClient),
			dialogManagerClient.checkIfWindowIsDialog.bind(dialogManagerClient),
			dialogManagerClient.registerWithStore.bind(dialogManagerClient)
		], cb);
	},
	name: "dialogManagerClient"
});

dialogManagerClient.requiredServices = ["launcherService"]; // service required by this client
dialogManagerClient.requiredClients = ["launcherClient", "windowClient", "dataStoreClient"]; // TODO: launcher not be marked initialized here

module.exports = dialogManagerClient;



/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/


var RouterTransport = __webpack_require__(30);
var Utils = __webpack_require__(1);
var ConfigUtil = __webpack_require__(29);
var Validate = __webpack_require__(2); // Finsemble args validator
var queue = []; // should never be used, but message sent before router ready will be queue

var Logger = __webpack_require__(0);
Logger.system.log("Starting RouterClient");


/**
 * @introduction
 *
 * <h2>Event Router Client</h2>
 *
 * This module contains the RouterClient for sending and receiving events between Finsemble components and services.  See <a href=tutorial-usingTheEventRouter.html>Event Router Tutorial</a> for an overview of the router's functionality.
 *
 * *Event router callbacks for incoming messages are always in the form `callback(error, event)`.  If `error` is null, then the incoming data is always in `event.data`. If error is set, it contains a diagnotic object and message.  On error, the `event` parameter is not undefined.*
 *
 *
 * @constructor
 * @hideConstructor true
 * @publishedName RouterClient
 * @param {string} thisClientName router client name for human readable messages
 * @param {string=} transportName router transport name, currently either "SharedWorker" or "OpenFinBus" (usually this is autoconfigured internally but can be selected for testing or special configurations)
 */
var RouterClientConstructor = function (params) {
	Validate.args(params, "object") && Validate.args2("params.clientName", params.clientName, "string", "params.transportName", params.transportName, "string=");

	///////////////////////////
	// Private Data
	///////////////////////////
	var thisClientName = params.clientName;
	var transportName = params.transportName;
	var handshakeHandler;
	var timeCalibrationHandler;
	var mapListeners = {};
	var mapResponders = {};
	var mapPubSubResponders = {};
	var mapPubSubResponderState = {};
	var mapPubSubResponderRegEx = {};
	var pubsubListOfSubscribers = {};
	var mapSubscribersID = {};
	var mapSubscribersTopic = {};
	var mapQueryResponses = {};
	var mapQueryResponseTimeOut = {};
	var clientIDCounter = 1000;
	var clientName;
	var transport = false;
	var isRouterReady = false;
	var isParentWaiting = false;
	var parentReadyCallbackQueue = []; // must be queue because may be multiple waiters
	var self = this;

	/////////////////////////////////////////////////////////////////////
	// Private Message Contructors for Communicating with RouterService
	/////////////////////////////////////////////////////////////////////

	function InitialHandshakeMessage() {
		this.header = {
			"origin": clientName,
			"type": "initialHandshake",
		};
	}
	function TimeCalibrationHandshakeMessage(clientBaseTime, serviceBaseTime) {
		this.header = {
			"origin": clientName,
			"type": "timeCalibration",
		};
		this.clientBaseTime = clientBaseTime;
		this.serviceBaseTime = serviceBaseTime;
	}
	function AddListenerMessage(channel) {
		this.header = {
			"origin": clientName,
			"type": "addListener",
			"channel": channel
		};
	}
	function TransmitMessage(toChannel, data) {
		this.header = {
			"origin": clientName,
			"type": "transmit",
			"channel": toChannel
		};
		this.data = data;
	}
	function RemoveListenerMessage(channel) {
		this.header = {
			"origin": clientName,
			"type": "removeListener",
			"channel": channel
		};
	}
	function addResponderMessage(channel) {
		this.header = {
			"origin": clientName,
			"type": "addResponder",
			"channel": channel
		};
	}
	function QueryMessage(queryID, channel, data) {
		this.header = {
			"origin": clientName,
			"type": "query",
			"queryID": queryID,
			"channel": channel
		};
		this.data = data;
	}
	function QueryResponseMessage(queryID, error, data) {
		this.header = {
			"origin": clientName,
			"type": "queryResponse",
			"queryID": queryID,
			"error": error
		};
		this.data = data;
	}
	function RemoveResponderMessage(channel) {
		this.header = {
			"origin": clientName,
			"type": "removeResponder",
			"channel": channel
		};
	}
	function SubscribeMessage(subscribeID, topic) {
		this.header = {
			"origin": clientName,
			"type": "subscribe",
			"subscribeID": subscribeID,
			"topic": topic
		};
	}
	function UnsubscribeMessage(subscribeID, topic) {
		this.header = {
			"origin": clientName,
			"type": "unsubscribe",
			"subscribeID": subscribeID,
			"topic": topic
		};
	}
	function PublishMessage(topic, data) {
		this.header = {
			"origin": clientName,
			"type": "publish",
			"topic": topic
		};
		this.data = data;
	}
	function NotifyMessage(subscribeID, topic, error, data) {
		this.header = {
			"origin": clientName,
			"type": "notify",
			"subscribeID": subscribeID,
			"topic": topic,
			"error": error
		};
		this.data = data;
	}
	function AddPubSubResponderMessage(topic) {
		this.header = {
			"origin": clientName,
			"type": "addPubSubResponder",
			"topic": topic
		};
	}
	function RemovePubSubResponderMessage(topic) {
		this.header = {
			"origin": clientName,
			"type": "removePubSubResponder",
			"topic": topic
		};
	}
	function JoinGroupMessage(group) {
		this.header = {
			"origin": clientName,
			"type": "joinGroup",
			"group": group
		};
	}
	function LeaveGroupMessage(group) {
		this.header = {
			"origin": clientName,
			"type": "leaveGroup",
			"group": group
		};
	}
	function GroupTransmitMessage(group, toChannel, message, data) {
		this.header = {
			"origin": clientName,
			"type": "groupTransmit",
			"group": group,
			"channel": toChannel
		};
		this.data = data;
	}

	//////////////////////
	// Private Functions
	//////////////////////

	// router client is being terminated so cleanup
	function destructor(event) {
		var finWindow = fin.desktop.Window.getCurrent();
		Logger.system.info("RouterClient: shutting down on event: " + JSON.stringify(event));
		self.disconnectAll(); // this will let the router know the client is terminating
		finWindow.removeEventListener("closed", destructor);
	}

	// invoked when router init is complete
	function onReadyCallBack() {
		Logger.system.debug("RouterClient Ready: onReadyCallBack invoked", self);
		isRouterReady = true;

		// invoke all the parent callbacks waiting for router to be ready
		while (parentReadyCallbackQueue.length > 0) {
			Logger.system.debug("RouterClient parentReady invoked");
			var nextParentCallback = parentReadyCallbackQueue.shift();
			nextParentCallback();
		}
	}

	// called once on router-client creation
	function constructor(thisClientName, transportName) {
		clientName = thisClientName + "." + window.name;
		console.log("Router", clientName);
		var callbackCounter = 0;

		fin.desktop.main(function () { // wait for openfin to be ready
			if (callbackCounter++ === 0) { // this check should  not be needed; patch for OpenFin bug which invokes callback twice
				// catch "window closing" event so can cleanup
				var finWindow = fin.desktop.Window.getCurrent();
				window.addEventListener("unload", destructor); // this is the correct event to catch but
				finWindow.addEventListener("closed", destructor); // this is the correct event to catch but currently doesn't work on mac
				ConfigUtil.getExpandedRawManifest(function (manifest) {
					Logger.system.debug("Router getExpandedRawManifest", manifest);
					//If manifest is a string, then there was an error getting the manifest because in a seperate application
					if (!manifest || typeof (manifest) === "string") {
						Logger.system.error("getExpandedRawManifest failed -- fatal error", manifest);
					} else {
						asyncConnectToEventRouter(manifest, clientName, transportName, onReadyCallBack); /**** establish connection to router service ****/
					}
				}, function (err) { Logger.system.error(err); });
			}
		});
	}

	// connects to event-router service
	function asyncConnectToEventRouter(manifest, clientName, transportName, onReadyCallBack) {
		var transportNotSpecified = (typeof (transportName) === "undefined");
		var myTimer;
		var myRetryCounter = 0;
		var isFinished = false;

		var routerParams = {
			routerDomainRoot: manifest.finsemble.moduleRoot,
			routerSharedWorker: manifest.finsemble.moduleRoot + "/common/routerSharedWorker.js",
			forceRouterToOFB: manifest.finsemble.forceRouterToOFB
		};
		Logger.system.debug("RouterClient", "MANIFEST ROUTER PARMAS", routerParams);

		if (transportNotSpecified) {
			transport = RouterTransport.getRecommendedTransport(routerParams, incomingMessageHandler, clientName, "RouterService")
				.then(transportReady)
				.catch(errHandler);
		} else { // tranport specified...typically only for regression testing
			transport = RouterTransport.getTransport(routerParams, transportName, incomingMessageHandler, clientName, "RouterService")
				.then(transportReady)
				.catch(errHandler);
		}

		function transportReady(transportObj) {
			Logger.system.debug("RouterClient: transport ready", "TRANSPORT OBJECT", transportObj);
			transport = transportObj;
			handshakeHandler = finished; // set function to receive handshake response
			sendHandshake();
			myTimer = setInterval(sendHandshake, 250); // start time to retry if response not recieved back from router service
		}

		function sendHandshake() {
			Logger.system.debug("RouterClient: sendHandshake");
			sendToRouterService(new InitialHandshakeMessage());
			if (myRetryCounter++ > 20) {
				Logger.system.error("RouterClient: failure to connect to router service");
				clearInterval(myTimer);
			}
		}

		function finished(transportObj) {
			if (!isFinished) { // ensure only invoked once
				Logger.system.debug("RouterClient connected: starting " + clientName + " with transport " + transport.identifier());
				isFinished = true;
				clearInterval(myTimer);
				if (queue) { // this should not happen with proper startup order, which waits on routerClient to be ready
					for (var i = 0; i < queue.length; i++) {
						Logger.system.debug("RouterClient: firing queued msg");
						var msg = queue[i];
						transport.send(msg);
					}
				}
				// notify initialization is complete
				if (onReadyCallBack) {
					onReadyCallBack();
				}
			}
		}

		function errHandler(errorMessage) {
			Logger.system.error(errorMessage);
		}
	}

	// provides unique id within one router client for queries
	function clientID() {
		return clientName + "." + (++clientIDCounter);
	}

	// returns true if this routerClient originated the message
	function originatedHere() {
		return this.header.origin === this.header.lastClient;
	}

	// invoke client callbacks in the input array (that are attached to a specific channel and listener type)
	function invokeListenerCallbacks(map, message) {
		var clientCallbackArray = map[message.header.channel];
		if (clientCallbackArray === undefined) {
			Logger.system.warn("RouterClient: no listener for incoming transmit on channel " + message.header.channel + " from " + message.header.origin, message);
		} else {
			message.originatedHere = originatedHere;// add local function to test origin
			for (var i = 0; i < clientCallbackArray.length; i++) { // for each callback defined for the channel
				if (!Logger.isLogMessage(message.header.channel)) { // logger messages
					Logger.system.info("RouterClient: incoming transmit", "CHANNEL", message.header.channel, "FROM", message.header.origin, "MESSAGE", message);
				}
				clientCallbackArray[i](null, message); // invoke the callback; the error parameter is always null for this case
			}
		}
	}

	function sendQueryResponse(err, responseData) {
		Logger.system.info("RouterClient: outgoing query response", "RESPONSE DATA", responseData, "QUERY ID", this.header.queryID);
		sendToRouterService(new QueryResponseMessage(this.header.queryID, err, responseData));
	}

	// invoke responder-listener callback (attached to a specific channel)
	function invokeResponderCallback(map, queryMessage) {
		var responderCallback = map[queryMessage.header.channel];
		if (responderCallback === undefined) {
			Logger.system.warn("RouterClient: no query responder define on channel " + queryMessage.header.channel + " incoming from " + queryMessage.header.origin, queryMessage);
			responderCallback(null, queryMessage); // invoke the callback (no error), queryMessage);
		} else {
			if (!queryMessage.header.error) {
				queryMessage.originatedHere = originatedHere; // add local function to test origin
				queryMessage.sendQueryResponse = sendQueryResponse; // add callback function to message so responder can respond to query
				Logger.system.info("RouterClient: incoming query", "CHANNEL", queryMessage.header.channel, "FROM", queryMessage.header.origin, "QUERY MESSAGE", queryMessage);
				responderCallback(null, queryMessage); // invoke the callback (no error)
			} else { // invoke the callback with error since  flag in message (from router service)
				Logger.system.warn("RouterClient: queryResponder error", queryMessage);
				responderCallback(queryMessage.header.error, null);
				delete map[queryMessage.header.channel]; // this is a bad responder (e.g. duplicate) so remove it
			}
		}
	}

	// add a callbackHandler into the query-response map for the given queryID
	function addQueryResponseCallBack(map, queryID, responseCallback) {
		map[queryID] = responseCallback;
	}

	// add timer to wait for query response
	function addQueryResponseTimeout(mapQueryResponseTimeOut, newQueryID, channel, timeout) {
		if (timeout > 0) {
			mapQueryResponseTimeOut[newQueryID] = setTimeout(function () {
				Logger.system.warn("RouterClient: timeout waiting on query response on channel " + channel + " for queryID " + newQueryID +
					" on timer " + mapQueryResponseTimeOut[newQueryID] + " timeout=" + timeout);
			}, timeout);
		}
	}

	// delete timer waiting on query response (if it exists)
	function deleteQueryResponseTimeout(mapQueryResponseTimeOut, newQueryID) {
		var theTimer = mapQueryResponseTimeOut[newQueryID];
		if (theTimer !== undefined) {
			clearTimeout(theTimer);
		}
	}

	// invoke query-response callback (that is attached to a specific channel and listener type)
	function invokeQueryResponseCallback(map, responseMessage) {
		var clientCallback = map[responseMessage.header.queryID];
		if (clientCallback === undefined) {
			Logger.system.warn("RouterClient: no handler for incoming query response", "QUERY ID", responseMessage.header.queryID);
		} else {
			// delete any existing timer waiting on the response
			deleteQueryResponseTimeout(mapQueryResponseTimeOut, responseMessage.header.queryID);

			if (!responseMessage.header.error) {
				Logger.system.info("RouterClient: incoming query response", "RESPONSE MESSAGE", responseMessage, "QUERY ID", responseMessage.header.queryID);
				clientCallback(null, responseMessage); // invoke the callback passing the response message
			} else {
				Logger.system.warn("RouterClient: incoming queryResponse error", responseMessage.header, "QUERY ID", responseMessage.header.queryID);
				clientCallback(responseMessage.header.error, responseMessage); // error from router service so pass it back instead of a message
			}
			delete map[responseMessage.header.queryID];
		}
	}

	// add responder callbackHandler for the given channel
	function addResponderCallBack(map, channel, callback) {
		var status = false;
		var clientCallback = map[channel];
		if (clientCallback === undefined) {
			map[channel] = callback;
			status = true;
		}
		return status;
	}

	// support function for sendNotifyToSubscriber -- maintains local list of subscribers for pubsub responder
	function addToPubSubListOfSubscribers(pubsubListOfSubscribers, topic, subscribeID) {
		if (!(topic in pubsubListOfSubscribers)) {
			pubsubListOfSubscribers[topic] = [subscribeID];
		} else {
			pubsubListOfSubscribers[topic].push(subscribeID);
		}
	}

	// support function for addPubSubResponder -- add pubsub responder callbackHandler for the given channel
	function addPubSubResponderCallBack(topic, subscribeCallback, publishCallback, unsubscribeCallback) {
		var status = false;
		var callbacks = mapPubSubResponders[topic.toString()];
		if (callbacks === undefined) {
			if (topic instanceof RegExp) {
				mapPubSubResponderRegEx[topic.toString()] = topic;
				Logger.system.info("RouterClient: PubSub RegEx added for topic " + topic.toString()); // Note: topic may be a RegEx, so use toString() where applicable
			}
			mapPubSubResponders[topic.toString()] = { "subscribeCallback": subscribeCallback, "publishCallback": publishCallback, "unsubscribeCallback": unsubscribeCallback };
			status = true;
		}
		return status;
	}

	// callback function for invokeSubscribePubSubCallback to notify new subscriber
	function sendNotifyToSubscriber(err, notifyData) {
		sendToRouterService(new NotifyMessage(this.header.subscribeID, this.header.topic, err, notifyData));
		if (!err) {
			// add new subscriber to list
			addToPubSubListOfSubscribers(pubsubListOfSubscribers, this.header.topic, this.header.subscribeID);
			Logger.system.info("RouterClient: incoming subscription added", "TOPIC", this.header.topic, "MESSAGE", this);
		} else {
			Logger.system.info("RouterClient: incoming subscription rejected by pubsub responder", "TOPIC", this.header.topic, "MESSAGE", this);
		}
	}

	// for incoming subscribe: invoke notify callback for pubsub responder
	function invokeSubscribePubSubCallback(subscribeMessage) {
		var callbacks = mapPubSubResponders[subscribeMessage.header.topic];

		if (callbacks === undefined) { // if undefined then may be a matching RegEx topic
			for (var key in mapPubSubResponderRegEx) {
				if (mapPubSubResponderRegEx[key].test(subscribeMessage.header.topic)) {
					callbacks = mapPubSubResponders[key];
					var initialState = mapPubSubResponderState[subscribeMessage.header.topic]; // may already be initial state defined from publish
					if (initialState === undefined) { // if there isn't already state defined then use default from regEx
						initialState = mapPubSubResponderState[key]; // initialize the state from RegEx topic
					}
					mapPubSubResponderState[subscribeMessage.header.topic] = initialState;
					break;
				}
			}
		}

		if (callbacks === undefined) { // if still undefined
			Logger.system.warn("RouterClient: no pubsub responder defined for incoming subscribe", subscribeMessage);
		} else {
			if (subscribeMessage.header.error) { // the router service uses the subscribe message in this case to return a pubsub error (ToDO: consider a generic error message)
				Logger.system.warn("RouterClient: pubsub error received from router service: " + JSON.stringify(subscribeMessage.header.error));
			} else {
				subscribeMessage.sendNotifyToSubscriber = sendNotifyToSubscriber; // add callback function to message so pubsub responder can respond with Notify message
				if (callbacks.subscribeCallback) {
					subscribeMessage.data = mapPubSubResponderState[subscribeMessage.header.topic];
					callbacks.subscribeCallback(null, subscribeMessage); // invoke the callback (no error)
				} else { // since no subscribe callback defined, use default functionality
					subscribeMessage.sendNotifyToSubscriber(null, mapPubSubResponderState[subscribeMessage.header.topic]); // must invoke from message to set this properly
				}
			}
		}
	}

	// support function for removeSubscriber callback --  remove one subscribeID from array for the given subscription topic
	function removeFromPubSubListOfSubscribers(pubsubListOfSubscribers, topic, subscribeID) {
		var removed = false;
		if (topic in pubsubListOfSubscribers) {
			var list = pubsubListOfSubscribers[topic];
			for (var i = 0; i < list.length; i++) {
				if (subscribeID === list[i]) {
					list.splice(i, 1);
					if (list.length === 0) {
						delete pubsubListOfSubscribers[topic];
					}
					removed = true;
					Logger.system.info("RouterClient: PubSub removeListener", "TOPIC", topic, "FROM", subscribeID);
					break;
				}
			}
		}
		if (!removed) {
			Logger.system.warn("RouterClient: tried to remove non-existance listener on " + topic + " from " + JSON.stringify(subscribeID));
		}
	}

	// callback function for invokeUnsubscribePubSubCallback to remove the subscriber from the subscription
	function removeSubscriber() {
		removeFromPubSubListOfSubscribers(pubsubListOfSubscribers, this.header.topic, this.header.subscribeID);
	}

	// for incoming unsubscribe: invoke unsubscribe callback for pubsub servier
	function invokeUnsubscribePubSubCallback(unsubscribeMessage) {
		var callbacks = mapPubSubResponders[unsubscribeMessage.header.topic];

		if (callbacks === undefined) { // if undefined then may be a matching RegEx topic
			for (var key in mapPubSubResponderRegEx) {
				if (mapPubSubResponderRegEx[key].test(unsubscribeMessage.header.topic)) {
					callbacks = mapPubSubResponders[key];
					break;
				}
			}
		}

		if (callbacks === undefined) { // if still undefined
			Logger.system.warn("RouterClient: no pubsub responder defined for incoming unsubscribe", "TOPIC", unsubscribeMessage.header.topic, "UNSUBSCRIBE MESSAGE", unsubscribeMessage);
		} else {
			unsubscribeMessage.removeSubscriber = removeSubscriber; // add callback function to message for pubsub responder (but must always remove)
			if (callbacks.unsubscribeCallback) {
				Logger.system.info("RouterClient: incoming unsubscribe callback", "TOPIC", unsubscribeMessage.header.topic, "UNSUBSCRIBE MESSAGE", unsubscribeMessage);
				callbacks.unsubscribeCallback(null, unsubscribeMessage); // invoke the callback (no error)
			} else { // since no unsubscribe callback defined, use default functionality
				Logger.system.info("RouterClient: incoming unsubscribe", "TOPIC", unsubscribeMessage.header.topic, "UNSUBSCRIBE MESSAGE", unsubscribeMessage);
				unsubscribeMessage.removeSubscriber();
			}
		}
	}

	// callback function for invokePublishPubSubCallback to send Notify
	function sendNotifyToAllSubscribers(err, notifyData) {
		if (!err) {
			mapPubSubResponderState[this.header.topic] = notifyData; // store new state
			var listOfSubscribers = pubsubListOfSubscribers[this.header.topic];
			if (typeof (listOfSubscribers) !== "undefined") { // confirm subscribers to send to, if none then nothing to do
				for (var i = 0; i < listOfSubscribers.length; i++) {
					Logger.system.info("RouterClient: sending pubsub notify", "TOPIC", this.header.topic, "NOTIFY DATA", notifyData);
					sendToRouterService(new NotifyMessage(listOfSubscribers[i], this.header.topic, err, notifyData));
				}
			}
		} else {
			Logger.system.info("RouterClient: income publish rejected by pubsub responder", err, notifyData);
		}
	}

	// for incoming Publish: invoke publish callback for pubsub servier
	function invokePublishPubSubCallback(publishMessage) {
		var callbacks = mapPubSubResponders[publishMessage.header.topic];

		if (callbacks === undefined) { // if undefined then may be a matching RegEx topic
			for (var key in mapPubSubResponderRegEx) {
				if (mapPubSubResponderRegEx[key].test(publishMessage.header.topic)) {
					callbacks = mapPubSubResponders[key];
					break;
				}
			}
		}

		if (callbacks === undefined) { // if still undefined
			Logger.system.warn("RouterClient: no pubsub responder defined for incoming publish", "TOPIC", publishMessage.header.topic, "PUBLISH MESSAGE", publishMessage);
		} else {
			publishMessage.sendNotifyToAllSubscribers = sendNotifyToAllSubscribers; // add callback function to message so pubsub responder can respond to publish
			if (callbacks.publishCallback) {
				Logger.system.info("RouterClient: incoming PubSub publish callback invoked", "TOPIC", publishMessage.header.topic, "PUBLISH MESSAGE", publishMessage);
				callbacks.publishCallback(null, publishMessage); // invoke the callback (no error)
			} else { // since no pubish callback defined, use default functionality
				Logger.system.info("RouterClient: incoming PubSub publish", "TOPIC", publishMessage.header.topic, "PUBLISH MESSAGE", publishMessage);
				publishMessage.sendNotifyToAllSubscribers(null, publishMessage.data); // must call from publish message (like a callback) so 'this' is properly set
			}
		}
	}

	// for incoming Notify: invoke notify callback (that are attached to a specific channel and listener type)
	function invokeNotifyCallback(mapSubscribersID, notifyMessage) {
		var notifyCallback = mapSubscribersID[notifyMessage.header.subscribeID];
		if (notifyCallback === undefined) {
			Logger.system.warn("RouterClient: no subscription handler defined for incoming notify for subscriberID", notifyMessage.header.subscribeID, notifyMessage);
		} else {
			if (!notifyMessage.header.error) {
				notifyMessage.originatedHere = originatedHere;// add local function to test origin
				Logger.system.info("RouterClient: incoming PubSub notify", "SUBSCRIBER ID", notifyMessage.header.subscribeID, "NOTIFY MESSAGE", notifyMessage);
				notifyCallback(null, notifyMessage); // invoke the callback passing the response message
			} else {
				Logger.system.info("RouterClient: incoming PubSub notify error for subscriberID", "SUBSCRIBER ID", notifyMessage.header.subscribeID, "NOTIFY MESSAGE", notifyMessage);
				notifyCallback(notifyMessage.header.error, notifyMessage); // error from router service so pass it back instead of a message
			}
		}
	}

	// outgoing Unsubscribe: remove subscriber callbackHandler for the given channel
	function removeSubscriberCallBack(mapSubscribersID, subscribeID) {
		var status = false;
		var notifyCallback = mapSubscribersID[subscribeID];
		if (notifyCallback !== undefined) {
			delete mapSubscribersID[subscribeID];
			status = true;
		}
		return status;
	}

	// for outgoing addSubscriber -- add a callback Handler for the subscribe
	function addSubscriberCallBack(mapSubscribersID, subscribeID, notifyCallback, topic) {
		mapSubscribersID[subscribeID] = notifyCallback;
		mapSubscribersTopic[subscribeID] = topic;

	}

	// for removePubSubResponder: remove responder callbackHandler for the given channel
	function removeResponderCallBack(map, channel) {
		var status = false;
		var clientCallback = map[channel];
		if (clientCallback !== undefined) {
			delete map[channel];
			status = true;
		}
		return status;
	}

	// for addListener: add a callbackHandler into the specified map (which depends on listener type) for the given channel
	function addListenerCallBack(map, channel, callback) {
		var firstChannelClient = false;
		var clientCallbackArray = map[channel];
		if (clientCallbackArray === undefined || clientCallbackArray.length === 0) {
			map[channel] = [callback];
			firstChannelClient = true;
		} else {
			clientCallbackArray.push(callback);
		}
		return firstChannelClient;
	}

	// for removeListener: remove a callbackHandler from the specified map (which depends on listener type) for the given channel
	function removeListenerCallBack(map, channel, callback) {
		var lastChannelClient = false;
		var clientCallbackArray = map[channel];
		if (clientCallbackArray !== undefined) {
			var index = clientCallbackArray.indexOf(callback);
			if (index > -1) {
				clientCallbackArray.splice(index, 1);
				if (clientCallbackArray.length === 0) {
					lastChannelClient = true;
				}
			} else {
				Logger.system.warn("no listener defined for channel: " + channel);
			}
		}
		return lastChannelClient;
	}

	// route incoming message to appropriate callback, which depends on the message type and channel
	function routeIncomingMessage(incomingMessage) {
		Logger.system.verbose("Incoming Message Type", incomingMessage.header.type, incomingMessage);
		switch (incomingMessage.header.type) {
		case "transmit":
			invokeListenerCallbacks(mapListeners, incomingMessage);
			break;
		case "query":
			invokeResponderCallback(mapResponders, incomingMessage);
			break;
		case "queryResponse":
			invokeQueryResponseCallback(mapQueryResponses, incomingMessage);
			break;
		case "notify":
			invokeNotifyCallback(mapSubscribersID, incomingMessage);
			break;
		case "publish":
			invokePublishPubSubCallback(incomingMessage);
			break;
		case "subscribe":
			invokeSubscribePubSubCallback(incomingMessage);
			break;
		case "unsubscribe":
			invokeUnsubscribePubSubCallback(incomingMessage);
			break;
		case "timeCalibration":
			timeCalibrationHandler(incomingMessage);
			break;
		case "initialHandshakeResponse":
			handshakeHandler();
			break;
		default:
		}
	}

	// *** all incoming messages from underlying transport arrive here ***
	// although incoming transport information is available, it is not passed on because not needed
	function incomingMessageHandler(incomingTransportInfo, message) {
		// ToDo: good place to put a function to validate incoming message/data
		message.header.lastClient = clientName; // add last client for diagnostics
		message.header.incomingTransportInfo = incomingTransportInfo;
		routeIncomingMessage(message);
	}

	// *** all outbound messages exit here though the appropriate transport ***
	function sendToRouterService(message) {
		Logger.system.verbose("Outgoing Message", message.header.type, message);
		if (!transport || (transport instanceof Promise)) {
			Logger.system.warn("RouterClient: Queuing message since router initialization not complete", message);
			queue.push(message);
		} else {
			transport.send(message);
		}
	}


	/////////////////////////////////////////////
	// Public Functions -- The Router Client API
	/////////////////////////////////////////////

	/**
	 * Get router client name.
	 *
	 * @param {string} newClientName string identify the client
	 * FSBL.Clients.RouterClient.setClientName("MyComponent");
	 * @private
	 */
	this.getClientName = function () {
		Logger.system.debug("RouterClient.getClientName", clientName);
		return clientName;
	};

	/**
	 * Checks if router is ready. May be invoked multiple times. Invokes cb when ready, which may be immediately.  Router is not ready until underlying transport to router service is ready.
	 *
	 * @param {function} cb callback function to invoke when router is ready
	 */
	this.onReady = function (cb) {
		Validate.args(cb, "function");
		if (isRouterReady) {
			Logger.system.debug("Router Ready: invoking parentReady callback");
			cb();
		} else {
			Logger.system.debug("Router Ready: queuing parentReady callback");
			parentReadyCallbackQueue.push(cb);
		}
	};

	/**
	 * Estimates offset to align the reference time with Router Service.  Does this by exchanging messages with RouterService, getting the service's time, and estimating communication delay.
	 *
	 * @private
	 */
	this.calibrateTimeWithRouterService = function (callback) {
		const TARGET_HANDSHAKE_COUNT = 5;
		var handshakeCounter = 0;
		var timeOffset;
		var offsetForFastest;
		var fastestRRT = Infinity;

		function calibrationCalculation(finalHandshakeMessage) {
			var timeOffset = 0;
			for (var i = 1; i < TARGET_HANDSHAKE_COUNT; i++) {
				var startClientTime = finalHandshakeMessage.clientBaseTime[i - 1];
				var stopClientTime = finalHandshakeMessage.clientBaseTime[i];
				var rtt = stopClientTime - startClientTime; // round-trip time
				var serviceTime = finalHandshakeMessage.serviceBaseTime[i - 1];
				var offset = serviceTime - (startClientTime + (rtt / 2));
				if (rtt < fastestRRT) {
					fastestRRT = rtt;
					offsetForFastest = offset;
				}
				timeOffset += offset;
				Logger.system.debug("calibrationCalculation Intermediate Values", "lastRRT", rtt, "lastOffset", offset, "fastestOffset", offsetForFastest, "fastestRRT", fastestRRT);
			}
			timeOffset /= (TARGET_HANDSHAKE_COUNT - 1);
			Logger.system.debug("RouterClient calibrationCalculation", "Average Offset", timeOffset, "Choosen FastestOffset", offsetForFastest, finalHandshakeMessage);
			callback(offsetForFastest); // use the offset with the shortest RTT since it is often the most accurate
		}

		function timeCalibrationHandlerFunction(message) {
			handshakeCounter++;
			if (handshakeCounter > TARGET_HANDSHAKE_COUNT) {
				calibrationCalculation(message); // enough handshake data gather, so do the calibration
			} else {
				message.clientBaseTime.push(window.performance.timing.navigationStart + window.performance.now());
				sendToRouterService(new TimeCalibrationHandshakeMessage(message.clientBaseTime, message.serviceBaseTime));
			}
		}

		timeCalibrationHandler = timeCalibrationHandlerFunction; // used in routeIncomingMessage to route handshake response back to handler
		timeCalibrationHandler(new TimeCalibrationHandshakeMessage([], [])); // invoke first time to start exchanging handshakes; will be invoked each time handshake message received back from FouterService
	};

	/**
	 * Backward compatibility?
	 */
	this.ready = this.onReady;
	/**
	 * Add listener for incoming transmit events on specified channel. Each of the incoming events will trigger the specified event handler. The number of listeners is not limited (either local to this Finsemble window or in a seperate Finsemble window).
	 *
	 * See [transmit]{@link RouterClientConstructor#transmit} for sending a cooresponding event message to listener. See [removeListener]{@link RouterClientConstructor#removeListener} to remove the listener.
	 *
	 * @param {string} channel any unique string to identify the channel (must match correspond transmit channel name)
	 * @param {function} eventHandler function (see example below)
	 * @example
	 *
	 * FSBL.Clients.RouterClient.addListener("SomeChannelName", function (error, response) {
			if (error) {
				Logger.system.log("ChannelA Error: ' + JSON.stringify(error));
			} else {
				var data = response.data;
				Logger.system.log("ChannelA Response: ' + JSON.stringify(response));
			}
	 * });
	 *
	 */
	this.addListener = function (channel, eventHandler) {
		Logger.system.info("RouterClient.addListener", "CHANNEL", channel);
		Validate.args(channel, "string", eventHandler, "function");
		var firstChannelClient = addListenerCallBack(mapListeners, channel, eventHandler);
		if (firstChannelClient) {
			sendToRouterService(new AddListenerMessage(channel));
		}
	};

	/**
	 * Transmit event to all listeners on the specified channel. If no listeners the event is discarded without error. All listeners to the channel in this Finsemble window and other Finsemble windows will receive the transmit.
	 *
	 * See [addListener]{@link RouterClientConstructor#addListener} to add a listener to receive the transmit.
	 *
	 * @param {string} toChannel any unique string to identify the channel (must match correspond listener channel name)
	 * @param {any} event any object or primitive type to be transmitted
	 * @example
	 *
	 * FSBL.Clients.RouterClient.transmit("SomeChannelName", event);
	 *
	 */
	this.transmit = function (toChannel, event) {
		if (!Logger.isLogMessage(toChannel)) { // logger messages
			Logger.system.info("RouterClient.transmit", "TO CHANNEL", toChannel, "EVENT", event);
		}
		Validate.args(toChannel, "string", event, "any");
		sendToRouterService(new TransmitMessage(toChannel, event));
	};

	/**
	 * Remove event listener from specified channel for the specific event handler (only listeners created locally can be removed).
	 *
	 * See [addListener]{@link RouterClientConstructor#addListener} for corresponding add of a listener.
	 *
	 * @param {string} channel unique channel name to remove listener from
	 * @param {function} eventHandler function used for the event handler when the listener was added
	 */
	this.removeListener = function (channel, eventHandler) {
		Logger.system.info("RouterClient.removelistener", "CHANNEL", channel, "EVENT HANDLER", eventHandler);
		Validate.args(channel, "string", eventHandler, "function");
		var lastChannelListener = removeListenerCallBack(mapListeners, channel, eventHandler);
		if (lastChannelListener) {
			sendToRouterService(new RemoveListenerMessage(channel));
		}
	};

	/**
	 * Add query responder to the specified channel (only one responder allowed per channel within the Finsemble application). The responder's queryEventHander function will receive all incoming queries for the specified channel (whether from this Finsemble window or remote Finsemble windows).
	 *
	 * See [query]{@link RouterClientConstructor#query} for sending a corresponding query-event message to this responder.
	 *
	 * @param {string} channel any unique string to identify the channel (must match correspond query channel name); only one responder allower per channel
	 * @param {function} queryEventHandler function to handle the incoming query (see example below); note incoming queryMessage contains function to send response
	 * @example
	 *
	 * FSBL.Clients.RouterClient.addResponder("ResponderChannelName", function (error, queryMessage) {
	 *	if (error) {
	 *		Logger.system.log('addResponder failed: ' + JSON.stringify(error));
	 *	} else {
	 *		// process income query message
	 *		queryMessage.sendQueryResponse(null, queryMessage.data); // A QUERY RESPONSE MUST BE SENT
	 *	}
	 * });
	 *
	 */
	this.addResponder = function (channel, queryEventHandler) {
		Logger.system.info("RouterClient.addResponder", "CHANNEL", channel);
		Validate.args(channel, "string", queryEventHandler, "function");
		var status = addResponderCallBack(mapResponders, channel, queryEventHandler);
		if (status) {
			sendToRouterService(new addResponderMessage(channel));
		} else {
			Logger.system.warn("RouterClient.addResponder: Responder already locally defined for channel " + channel);
			queryEventHandler({
				"RouteClient QueryError": "Responder already locally defined for channel"
			}, null); // immediately invoke callback passing error
		}
	};

	/**
	 * Send a query to responder listening on specified channel. The responder may be in this Finsemble window or another Finsemble window.
	 *
	 * See [addResponder]{@link RouterClientConstructor#addResponder} to add a responder to receive the query.
	 *
	 * @param {any} responderChannel any unique string to identify the channel (must match correspond responder channel name)
	 * @param {object} queryEvent event message sent to responder
	 * @param {any=} params this object currently can carry only a timeout value (e.g. { timeout: 3000 }) for a query-response timer.  Timer defaults to 5000 milliseconds is no params value is passed in.  A timer is set only when timeout > 0. If the timer expires, only a warning message is display for diagnostics.
	 * @param {function} responseEventHandler event handler to receive in query response (sent from the responder for the specified channel)
	 *
	 * @example
	 *
	 * FSBL.Clients.RouterClient.query("someChannelName", {}, function (error, queryResponseMessage) {
	 *	if (error) {
	 *		Logger.system.log('query failed: ' + JSON.stringify(error));
	 *	} else {
	 *		// process income query response message
	 *		var responseData = queryResponseMessage.data;
	 *		Logger.system.log('query response: ' + JSON.stringify(queryResponseMessage));
	 *	}
	 * });
	 *
	 * FSBL.Clients.RouterClient.query("someChannelName", { queryKey: "abc123"}, { timeout: 1000 }, function (error, queryResponseMessage) {
	 *	if (!error) {
	 *		// process income query response message
	 *		var responseData = queryResponseMessage.data;
	 *	}
	 * }); */
	this.query = function (responderChannel, queryEvent, params, responseEventHandler) {
		var newQueryID = clientID();
		var timestamp = window.performance.timing.navigationStart + window.performance.now();
		var navstart = window.performance.timing.navigationStart;
		var timenow = window.performance.now(); // these timer values used for logging diagnostices

		Logger.system.info("RouterClient.query", "RESPONDER CHANNEL", responderChannel, "QUERY EVENT", queryEvent, "PARAMS", params, "QUERYID", newQueryID, { timestamp, navstart, timenow });
		if (arguments.length === 3) {
			responseEventHandler = params;
			params = { timeout: 5000 };
		}
		Validate.args(responderChannel, "string", queryEvent, "any=", params, "object=", responseEventHandler, "function");
		params = params || {};
		Validate.args2("params.timeout", params.timeout, "number");

		addQueryResponseCallBack(mapQueryResponses, newQueryID, responseEventHandler);
		addQueryResponseTimeout(mapQueryResponseTimeOut, newQueryID, responderChannel, params.timeout);
		sendToRouterService(new QueryMessage(newQueryID, responderChannel, queryEvent));
	};

	/**
	 * Remove query responder from specified channel. Only a locally added responder can be removed (i.e. a responder defined in the same component or service).
	 *
	 * See [addResponder]{@link RouterClientConstructor#addResponder} for corresponding add of a query responder.
	 *
	 * @param {string} responderChannel string identifying the channel to remove responder from
	 *
	 * @example
	 *
	 * FSBL.Clients.RouterClient.removeResponder("someChannelName");
	 *
	 */
	this.removeResponder = function (responderChannel) {
		Logger.system.info("RouterClient.removeResponder", "RESPONDER CHANNEL", responderChannel);
		Validate.args(responderChannel, "string");
		var status = removeResponderCallBack(mapResponders, responderChannel);
		if (status) {
			sendToRouterService(new RemoveResponderMessage(responderChannel));
		}
	};

	/**
	 * Add a PubSub responder for specified topic. All subscribes and publishes to the topic will comes to responder (whether from local window or another window). Only one PubSub responder allowed per topic value in Finsemble application; however, the topic value may be a regular-expression representing a set of related topics, in which case the PubSub responder will responder to all matching topics. When a regEx topic is used, the same default functionality is provides for each matching topic -- the difference is only one PubSub responder is needed to cover a set of related topics, plus the same callback handers can be used (if provided).
	 *
	 * All the callback function are optional because each PubSub responder comes with build-in default functionality (described below).
	 *
	 * Note an exact topic match will take precedence over a regEx match, but otherwise results are unpredictable for overlapping RegEx topics.
	 *
	 * See [subscribe]{@link RouterClientConstructor#subscribe} and [publish]{@link RouterClientConstructor#publish} for corresponding functions sending to the PubSub responder.
	 *
	 * @param {string} topic unique topic for this responder, or a topic RegEx (e.g. '/abc.+/') to handle a set of topics
	 * @param {object} initialState initial state for the topic (defaults to empty struct); can be any object
	 * @param {object=} params optional parameters
	 * @param {function=} params.subscribeCallback allows responder know of incoming subscription and accept or reject it (default is to accept)
	 * @param {function=} params.publishCallback allows responder to use the publish data to form a new state (default is the publish data becomes the new state)
	 * @param {function=} params.unsubscribeCallback allows responder to know of the unsubscribe, but it must be accepted (the default accepts)
	 * @param {function=} callback optional callback(err,res) function. If addPubSubResponder failed then err set; otherwise, res set to "success"
	 *
	 * @example
	 *
	 * function subscribeCallback(error, subscribe) {
	 * 	if (subscribe) {
	 * 		// must make this callback to accept or reject the subscribe (default is to accept). First parm is err and second is the initial state
	 * 		subscribe.sendNotifyToSubscriber(null, { "NOTIFICATION-STATE": "One" });
	 * 	}
	 * }
	 * function publishCallback(error, publish) {
	 * 	if (publish) {
	 * 		// must make this callback to send notify to all subscribers (if error parameter set then notify will not be sent)
	 * 		publish.sendNotifyToAllSubscribers(null, publish.data);
	 * 	}
	 * }
	 * function unsubscribeCallback(error, unsubscribe) {
	 * 	if (unsubscribe) {
	 * 		// must make this callback to acknowledge the unsubscribe
	 * 		unsubscribe.removeSubscriber();
	 * 	}
	 * }
	 * FSBL.Clients.RouterClient.addPubSubResponder("topicABC", { "State": "start" },
	 * 	{
	 * 		subscribeCallback:subscribeCallback,
	 * 		publishCallback:publishCallback,
	 * 		unsubscribeCallback:unsubscribeCallback
	 * 	});
	 *
	 *   or
	 *
	 * FSBL.Clients.RouterClient.addPubSubResponder("topicABC", { "State": "start" });
	 *
	 *   or
	 *
	 * FSBL.Clients.RouterClient.addPubSubResponder(\/topicA*\/, { "State": "start" });
	 *
	 */
	this.addPubSubResponder = function (topic, initialState, params, callback) {
		var error;
		var response;
		Logger.system.info("RouterClient.addPubSubResponder", "TOPIC", topic, "INITIAL STATE", initialState, "PARAMS", params);
		Validate.args(topic, "any", initialState, "object=", params, "object=");
		params = params || {};
		Validate.args2("params.subscribeCallback", params.subscribeCallback, "function=", "params.publishCallback", params.publishCallback, "function=") &&
			Validate.args2("params.unsubscribeCallback", params.unsubscribeCallback, "function=");

		var status = addPubSubResponderCallBack(topic, params.subscribeCallback, params.publishCallback, params.unsubscribeCallback);
		if (status) {
			initialState = initialState || {};
			mapPubSubResponderState[topic.toString()] = Utils.clone(initialState);
			sendToRouterService(new AddPubSubResponderMessage(topic.toString()));
			response = "success";
		} else {
			error = "RouterClient.addPubSubResponder: Responder already locally defined for topic " + topic;
			Logger.system.warn(error);
		}
		if (callback) {
			callback(error, response);
		}
	};

	/**
	 * Remove pubsub responder from specified topic. Only locally created responders (i.e. created in local window) can be removed.
	 *
	 * See [addPubSubResponder]{@link RouterClientConstructor#addPubSubResponder} for corresponding add of a SubPub responder.
	 *
	 * @param {string} topic unique topic for responder being removed (may be RegEx, but if so much be exact regEx used previously with addPubSubResponder)
	 *
	 * @example
	 *
	 * FSBL.Clients.RouterClient.removePubSubResponder("topicABC");
	 *
	 */
	this.removePubSubResponder = function (topic) {
		Logger.system.info("RouterClient.removePubSubResponder", "TOPIC", topic);
		Validate.args(topic, "any");
		var status = removeResponderCallBack(mapPubSubResponders, topic);
		if (status) {
			delete mapPubSubResponderState[topic.toString()]; // remove corresponding state
			delete mapPubSubResponderRegEx[topic.toString()]; // may be a RegEx
			sendToRouterService(new RemovePubSubResponderMessage(topic));
		} else {
			Logger.system.warn("RouterClient.removePubSubResponder failed: Could not find responder for topic " + topic);
		}
	};

	/**
	 * Subscribe to a PubSub Responder. Each responder topic can have many subscribers (local in this window or remote in other windows). Each subscriber immediately (but asyncronouly) receives back current state in a notify; new notifys are receive for each publish sent to the same topic.
	 *
	 * See [addPubSubResponder]{@link RouterClientConstructor#addPubSubResponder} for corresponding add of a SubPub responder to handle the subscribe. See [publish]{@link RouterClientConstructor#publish} for corresponding publish to notify the subscriber.
	 *
	 * @param {string} topic topic being subscribed to
	 * @param {function} notifyCallback invoked for each income notify for the given topic (i.e. initial notify plus for each publish)
	 * @returns subscribe-id object optionally used for unsubscribing later
	 *
	 * @example
	 *
	 * var subscribeId = RouterClient.subscribe("topicABC", function(err,notify) {
	 *		if (!err) {
	 *			var notificationStateData = notify.data;
	 *			// do something with notify data
	 *  	}
	 * });
	 *
	 */
	this.subscribe = function (topic, notifyCallback) {
		Logger.system.info("RouterClient.subscribe", "TOPIC", topic);
		Validate.args(topic, "string", notifyCallback, "function");
		var subscribeID = clientID();
		addSubscriberCallBack(mapSubscribersID, subscribeID, notifyCallback, topic);
		sendToRouterService(new SubscribeMessage(subscribeID, topic));
		return { "subscribeID": subscribeID, "topic": topic };
	};

	/**
	 * Publish to a PubSub Responder, which will trigger a corresponding Notify to be sent to all subscribers (local in this window or remote in other windows). There can be multiple publishers for a topic (again, in same window or remote windows)
	 *
	 * See [addPubSubResponder]{@link RouterClientConstructor#addPubSubResponder} for corresponding add of a SubPub responder to handle the publish (i.e. sending notifications to all subscriber). See [Subscribe]{@link RouterClientConstructor#addPubSubResponder} for corresponding subscription to receive publish results (in the form of a notify event)
	 *
	 * @param {string} topic topic being published to
	 * @param {object} event topic state to be published to all subscriber (unless the SubPub responder optionally modifies in between)
	 *
	 * @example
	 *
	 * FSBL.Clients.RouterClient.publish("topicABC", topicState);
	 *
	 */
	this.publish = function (topic, event) {
		Logger.system.info("RouterClient.publish", "TOPIC", topic, "EVENT", event);
		Validate.args(topic, "string", event, "any");
		sendToRouterService(new PublishMessage(topic, event));
	};

	/**
	 * Unsubscribe from PubSub responder so no more notifications received (but doesn't affect other subscriptions). Only works from the window the PubSub responder was created in.
	 *
	 * See [subscribe]{@link RouterClientConstructor#subscribe} for corresponding subscription being removed.
	 *
	 * @param {object} subscribeID the id return from the corresponding subscribe for the topic
	 *
	 * @example
	 *
	 * FSBL.Clients.RouterClient.unsubscribe(subscribeId);
	 *
	 */
	this.unsubscribe = function (subscribeIDStruct) {
		Logger.system.info("RouterClient.unsubscribe", "SUBSCRIBE ID", subscribeIDStruct);
		Validate.args(subscribeIDStruct, "object") && Validate.args2("subscribeIDStruct.subscribeID", subscribeIDStruct.subscribeID, "string");
		var deletedSubscriber = removeSubscriberCallBack(mapSubscribersID, subscribeIDStruct.subscribeID);
		if (deletedSubscriber) {
			sendToRouterService(new UnsubscribeMessage(subscribeIDStruct.subscribeID, subscribeIDStruct.topic));
		} else {
			Logger.system.warn("RouterClient.unsubscribe: Could not find subscribeID for topic " + subscribeIDStruct.topic);
		}
	};

	/**
	 * Test an incoming router message to see if it originated from the same origin (e.g. a trusted source...not cross-domain). Currently same origin is known only because a sharedWorker transport is used (by definition SharedWorkers do not work cross-domain).  This means any message coming in over the OpenFin IAB will not be trusted; however, by default all same-origin components and services connect to the router using a SharedWorker transport.
	 *
	 * @param {object} incomingMessage an incoming router message (e.g. transmit, query, notification) to test to see if trusted.
	 *
	 * @returns true if message is same origin (i.e. received over SharedWorker transport).
	 * @example
	 *
	 * FSBL.Clients.RouterClient.trustedMessage(incomingRouterMessage);
	 *
	 */
	this.trustedMessage = function (incomingMessage) {
		var isTrusted = false;
		Logger.system.debug("RouterClient.trustedMessage", incomingMessage);
		if (incomingMessage.header.incomingTransportInfo.transportID === "SharedWorker") {
			isTrusted = true;
		}
		return isTrusted;
	};

	/*
	 * @TODO: consider adding disconnectAllListerns(), disconnectAllResponders(), disconnectAllSubscribers()
	*/

	/**
	 * Removes all listeners, responders, and subscribers for this router client -- automatically called when client is shutting down. Can be called multiple times.
	 */
	this.disconnectAll = function () {
		Logger.system.info("RouterClient.disconnectAll");
		for (var channel in mapListeners) {
			Logger.system.debug("RouterClient.disconnectAll is removing listener on " + channel);
			sendToRouterService(new RemoveListenerMessage(channel));
			delete mapListeners[channel];
		}

		for (var responderChannel in mapResponders) {
			Logger.system.debug("RouterClient.disconnectAll is removing responder on " + responderChannel);
			sendToRouterService(new RemoveResponderMessage(responderChannel));
			delete mapResponders[responderChannel];
		}

		for (var topic in mapPubSubResponders) {
			Logger.system.debug("RouterClient.disconnectAll is removing pubsub responder on " + topic);
			sendToRouterService(new RemovePubSubResponderMessage(topic));
			delete mapPubSubResponders[topic.toString()]; // could be a RegEx
			delete mapPubSubResponderState[topic.toString()]; // remove corresponding state
			delete mapPubSubResponderRegEx[topic.toString()]; // may be a RegEx
		}

		for (var subscribeID in mapSubscribersID) {
			var stopic = mapSubscribersTopic[subscribeID];
			Logger.system.debug("RouterClient.disconnectAll is removing subscriber on " + stopic);
			sendToRouterService(new UnsubscribeMessage(subscribeID, stopic));
			delete mapSubscribersID[subscribeID];
			delete mapSubscribersTopic[subscribeID];
		}
	};

	constructor(thisClientName, transportName); // on creation invoke to initialize
};

module.exports = RouterClientConstructor;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

var FSBLUtils = __webpack_require__(1);
var Logger = __webpack_require__(0);

var ConfigUtil = {
	/**
	 * @introduction
	 * <h2>Finsemble Configuration Utility Functions</h2>
	 * @private
	 * @class ConfigUtil
	 */
	// run through the configuration object and resolve any variables definitions (i.e. $applicationRoot)
	resolveConfigVariables(finsembleConfig, startingConfigObject) {
		var pass = 0;
		var needsAnotherPass = true;

		// resolve a variable within a config string
		function resolveString(configString) {
			var seperators = /[/\\:?=&]/; // list of seperators in regex form (will add other seperators if needed)
			var tokens = configString.split(seperators);
			for (var i = 0; i < tokens.length; i++) {
				if (tokens[i][0] === "$") { // special variable character $ has to first char in string
					var variableReference = tokens[i].substring(1); // string off the leading $
					var variableResolution = finsembleConfig[variableReference]; // the variable value is another config property, which already must be set
					var newValue = configString.replace(tokens[i], variableResolution); // replace the variable reference with new value
					Logger.system.verbose("resolveString configString", tokens[i], variableReference, variableResolution, "oldvalue=", configString, "value=", newValue);
					needsAnotherPass = true; // <<-- here is the only place needsAnotherPass is set, since still resolving variables
					configString = newValue;
				}
			}
			return (configString);
		}

		// process an array of config items looking for variables to resolve (a recursive routine)
		function resolveArray(configArray, pass, recursionLevel) {
			Logger.system.verbose("resolveArray", "pass", pass, "recursionLevel", recursionLevel, "configArray:", configArray);
			for (var i = 0; i < configArray.length; i++) {
				var value = configArray[i];
				if (typeof (value) === "string" && value.indexOf("$") > -1) {
					configArray[i] = resolveString(value);
				} else if (value instanceof Array) {
					resolveArray(value, pass, recursionLevel + 1); // array reference passed so don't need return value
				} else if (typeof (value) === "object") {
					resolveObject(value, pass, recursionLevel + 1); // object reference passed so don't need return value
				}
			}
		}

		// process an object of config properties looking for variables to resolve (a recursive routine)
		function resolveObject(configObject, pass, recursionLevel) {
			Logger.system.verbose("resolveObject", "pass", pass, "recursionLevel", recursionLevel, "configObject:", configObject);
			Object.keys(configObject).forEach(function (key) {
				var value = configObject[key];
				if (typeof (value) === "string" && value.indexOf("$") > -1) {
					configObject[key] = resolveString(value);
				} else if (value instanceof Array) {
					resolveArray(value, pass, recursionLevel + 1); // array reference passed so don't need return value
				} else if (typeof (value) === "object") {
					resolveObject(value, pass, recursionLevel + 1); // object reference passed so don't need return value
				}
			});
		}

		// since variables may be nested, keep resolving till no more left
		while (needsAnotherPass) {
			needsAnotherPass = false; // don't need another pass afterwards unless a variable is resolved somewhere in finsembleConfig
			resolveObject(startingConfigObject, ++pass, 1);
		}
	},

	// This does mimimal processing of the manifest, just enough to support getting the router up, which is only expanding variables (e.g. moduleRoot) in the raw manifest
	getExpandedRawManifest(callback) {
		Logger.system.debug("getExpandedRawManifest starting");

		function getRawManifest(callback, application, level) {
			Logger.system.debug("getRawManifest", application, level);


			application.getManifest(function (manifest) { // get raw openfin manifest
				Logger.system.debug("getExpandedRawManifest manifest", manifest);

				ConfigUtil.resolveConfigVariables(manifest.finsemble, manifest.finsemble); // resolve variables first time so can fild config config location
				Logger.system.debug("getExpandedRawManifest Complete", manifest);
				callback(manifest);
			}, function (err) {
				Logger.system.debug("getExpandedRawManifest err", err);
				// no manifest so try parent
				application.getParentUuid(function (parentUuid) {
					var parentApplication = fin.desktop.Application.wrap(parentUuid);
					Logger.system.debug("uuid", parentUuid, "parentApplication", parentApplication);
					if (level < 10) {
						getRawManifest(callback, parentApplication, ++level);
					} else { // still could find so must be a problem (i.e. avoid infinite loop)
						callback("could not find manifest in parent applications");
					}
				});
			});
		}

		fin.desktop.main(function () { // make sure openfin is ready
			var application = fin.desktop.Application.getCurrent();
			getRawManifest(callback, application, 1);
		});
	},

	// This does a "first stage" processing of the manifest, providing enought config to start finsemble.
	// Pull in the initial manifest, which includes gettig the "hiddlen" core config file along with its import definitions, and expand all variables.
	// However, the full config processing, incluing actually doing the imports, is only done in the Config Service.
	getInitialManifest(callback) {
		var CORE_CONFIG; // will hold location of core config file

		// async read of JSON config file
		function getCoreConfig(coreConfigFile, importCallback) {
			Logger.system.debug("fetching " + coreConfigFile);
			fetch(coreConfigFile, {
				credentials: "include"
			}).then(function (response) {
				return response.json();
			}).catch(function (err) {
				importCallback("failure importing " + err, null);
			}).then(function (importObject) {
				importCallback(null, importObject);
			});
		}

		fin.desktop.main(function () { // make sure openfin is ready
			var application = fin.desktop.Application.getCurrent();
			application.getManifest(function (manifest) { // get raw openfin manifest
				ConfigUtil.resolveConfigVariables(manifest.finsemble, manifest.finsemble); // resolve variables first time so can fild config config location
				var CORE_CONFIG = manifest.finsemble.moduleRoot + "/configs/core/config.json"; // <<<--- here is the "hidden" core config file
				getCoreConfig(CORE_CONFIG, function (error, newFinsembleConfigObject) { // fetch the core config file
					if (!error) {
						Object.keys(newFinsembleConfigObject).forEach(function (key) {
							if (key === "importConfig") {
								// add any importConfig items from the core to the existing importConifg
								manifest.finsemble.importConfig = manifest.finsemble.importConfig || [];
								for (var i = 0; i < newFinsembleConfigObject.importConfig.length; i++) {
									manifest.finsemble.importConfig.unshift(newFinsembleConfigObject.importConfig[i]);
								}
							} else if (key === "importThirdPartyConfig") {
								// add any importThirdPartyConfig items from the core to the existing importConifg
								manifest.finsemble.importThirdPartyConfig = manifest.finsemble.importThirdPartyConfig || [];
								for (var i = 0; i < newFinsembleConfigObject.importThirdPartyConfig.length; i++) {
									manifest.finsemble.importThirdPartyConfig.unshift(newFinsembleConfigObject.importThirdPartyConfig[i]);
								}
							} else {
								manifest.finsemble[key] = newFinsembleConfigObject[key];
							}
						});
						ConfigUtil.resolveConfigVariables(manifest.finsemble, manifest.finsemble); // resolve variables with finsemble config
						Logger.system.debug("Initial Manifest after variables Resolved", manifest);
					} else {
						Logger.system.error("failed importing into finsemble config", currentImportURL, error);
					}
					callback(manifest);
				});
			});
		});
	}
};

module.exports = ConfigUtil;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

// This routerTransport module is shared between router clients and the router service.  It supports
// the addition of new transports without any change to the router code. Each transport is
// point-to-point between a router client and the router service (i.e. hub and spoke).  Each router
// client can use a different transport (i.e. the router service connects to them all).


var Utils = __webpack_require__(1);
var console = new Utils.Console("RouterTransport"); // Finsemble console

/**
 * @introduction
 * <h2>Router Transport</h2>
 * **Service-Level Module**.  Manages and contains the point-to-point transports (i.e. Layer 2) supported by Finsemble.
 * Each transport communicates betweew a Finsemble services or component (on one end) and the Finsemble router (on the other end).
 *
 * The OpenFinBus transport is used for cross-domain components (where SharedWorker fails).
 *
 * Requirements for adding a new transport:
 * 1) create new transport object with same interface provided by SharedWorkerTransport and OpenFinTransport in this file.
 * 2) call RouterTransport.addTransport() to make the transport available (see the bottom of this file)
 *
 * Integration into routerService.js is automatic.
 *
 * @namespace RouterTransport
 */
var RouterTransport = {

	activeTransports: {},

	/**
	 * Adds a new type of router transport to pass message between RouterClient and RouterService.
	 *
	 * @param {string} transportName identifies the new transport
	 * @param {object} transportConstructor returns an instance of the new transport
	 */
	addTransport: function (transportName, transportConstructor) {
		this.activeTransports[transportName] = transportConstructor;
		window.console.info("RouterTransport added: " + transportName);
	},

	/**
	 * Gets array of active transports
	 *
	 * @returns array transport names/identifier
	 */
	getActiveTransports: function () {
		var transportNames = [];
		for (var transportIdentifier in this.activeTransports) {
			transportNames.push(transportIdentifier);
		}
		return transportNames;
	},

	/**
	 * Get default transport for event router -- this is the most reliable transport across all contexts
	 *
 	 * @param {object} params parameters for transport
	 * @param {any} incomingMessageHandler
	 * @param {any} source
	 * @param {any} destination
	 * @returns the transport object
	 */
	getDefaultTransport: function (params, incomingMessageHandler, source, destination) {
		return RouterTransport.getTransport(params, "OpenFinBus", incomingMessageHandler, source, destination);
	},

	/**
	 * Get best client transport based on the run-time context. Will only return cross-domain transport if current context is inter-domain.
	 *
 	 * @param {object} params parameters for transport
	 * @param {any} incomingMessageHandler
	 * @param {any} source
	 * @param {any} destination
	 * @returns the transport object
	 */
	getRecommendedTransport: function (params, incomingMessageHandler, source, destination) {
		var newTransport; // return variable

		// Will tell you if the window is in an iframe or not (for future)
		function isInIframe() {
			try {
				return window.self !== window.top;
			} catch (e) {
				return true;
			}
		}

		// returns true if this window's location is in another domain
		function crossDomain() {
			var parser = document.createElement('a');
			parser.href = params.routerDomainRoot;

			var isSameHost = (window.location.hostname === parser.hostname);

			var isSameProtocol = (window.location.protocol === parser.protocol);

			var wport = (window.location.port === undefined) ? window.location.port : 80;
			var pport = (parser.port === undefined) ? parser.port : 80;
			var isSamePort = (wport === pport);

			var isCrossDomain = params.forceRouterToOFB || !(isSameHost && isSamePort && isSameProtocol);
			console.debug("Transport crossDomain=" + isCrossDomain + " (" + params.forceRouterToOFB + ":" + isSameHost + ":" + isSameProtocol + ":" + isSamePort + ")");
			return isCrossDomain;
		}

		// returns name of the best transport for communicating with router service
		function recommendedTransportName() {
			var recommendedName = "SharedWorker"; // default -- fast but doesn't work cross-domain
			if (crossDomain()) {
				recommendedName = "OpenFinBus"; // required for cross-domain event messaging between windows
			}
			return recommendedName;
		}

		var transportName = recommendedTransportName();
		return RouterTransport.getTransport(params, transportName, incomingMessageHandler, source, destination);
	},

	/**
	 * Get a specific transport by name. The transport must be in list of the active transports (i.e. previously added).
	 *
 	 * @param {object} params parameters for transport
	 * @param {any} transportName
	 * @param {any} incomingMessageHandler
	 * @param {any} source
	 * @param {any} destination
	 * @returns the transport object
	 */
	getTransport: function (params, transportName, incomingMessageHandler, source, destination) {
		var self = this;
		return new Promise(function (resolve, reject) {
			var transportConstructor = self.activeTransports[transportName];
			if (transportConstructor) {
				var newTransport = new transportConstructor(params, transportName, incomingMessageHandler, source, destination);
				resolve(newTransport);
			} else {
				reject("unknown transport name: " + transportName);
			}
		});
	}
};

//////////////////////////////////////////////////////////////
// Below all transports are defined then added to active list
//////////////////////////////////////////////////////////////

var RouterTransportImplementation = {}; // a convenience namespace for router-transport implementations

/*
 * Implements the SharedWorker Transport.
 *
 * Required Functions (used by transport clients):
 * 		send(eventMessage) -- transports the event
 * 		identifier() -- returns transport name/identifier
 *
 * @param {object} params parameters for SharedWorker transport
 * @param {object} name the name the transport will be reference by
 * @param {any} parentMessageHandlerParm callback for incoming event
 * @param {any} source for the transport (e.g. "RouterClient" or "RouterService")
 */
RouterTransportImplementation.SharedWorkerTransport = function (params, name, parentMessageHandlerParm, source) {
	var parentMessageHandler;
	var routerThread;
	var transportName;
	var console = new Utils.Console("SharedWorkerTransport." + source); // Finsemble console


	// receives incoming shared-worker messages then passes on to parent with correct "wrapper"
	function sharedWorkerMessageHandler(swMessage) {
		var port = swMessage.data[0];
		var eventMessage = swMessage.data[1];
		var incomingTransportInfo = { "transportID": transportName, "port": port };
		console.debug2("Incoming Transport", incomingTransportInfo, "Message", eventMessage);
		parentMessageHandler(incomingTransportInfo, eventMessage);
	}

	//required function for parent (i.e. routeClient or routeService)
	this.send = function (transport, eventMessage) {
		// handle optional transport parm
		if (arguments.length === 1) {  // clients use just one parm -- eventMessage
			eventMessage = arguments[0];
			transport = null;
			console.debug2("Outgoing Transport", transportName, "Message", eventMessage);
		} else { // router services uses both parameters
			transport = arguments[0];
			eventMessage = arguments[1];
			console.debug2("Outgoing Transport", transport, "Message", eventMessage);
		}
		try {
			routerThread.port.postMessage([transport, eventMessage]);
		}
		catch (e) {
			console.error("routerThread post message failed: " + JSON.stringify(e), "Probable cause is sending illegal data type (e.g. function).");
		}
	};

	//required function for parent (i.e. routeClient or routeService)
	this.identifier = function () {
		return transportName;
	};

	console.debug("SharedWorker " + params.routerSharedWorker + " Initializing: " + source);
	transportName = name;
	parentMessageHandler = parentMessageHandlerParm;
	routerThread = new SharedWorker(params.routerSharedWorker, { name: "Finsemble", credentials: "included" });
	routerThread.port.onmessage = sharedWorkerMessageHandler;
	routerThread.onerror = function (e) {
		console.error("RouteClient SharedWorker Error" + JSON.stringify(e));
	};
	routerThread.port.start();

	if (source === "RouterService") {  // send first message though shared worker to identify router service
		routerThread.port.postMessage({ data: "connect", source: "RouterService" });
	}
};

/*
 * Implements the OpenFin Bus Transport.
 *
 * Required Functions (used by transport clients):
 * 		send(event) -- transports the event
 * 		identifier() -- returns transport name/identifier
 *
 * @param {object} params unused in OpenFin transport
 * @param {object} name the name the transport will be reference by
 * @param {any} parentMessageHandlerParm callback for incoming event
 * @param {any} source for the transport (e.g. "RouterClient" or "RouterService")
 * @param {any} destination for the transport (e.g. "RouterService" or "RouterClient" )
 */
RouterTransportImplementation.OpenFinTransport = function (params, name, parentMessageHandlerParm, source, destination) {
	var parentMessageHandler;
	var transportName;
	var console = new Utils.Console("OpenFinTransport." + source); // Finsemble console
	var uuid = fin.desktop.Application.getCurrent().uuid;

	// receives incoming OpenFin bus messages then passes on to parent with correct "wrapper"
	function openFinMessageHandler(eventMessage, senderUuid, name) {
		var incomingTransportInfo = { "transportID": transportName, "senderUuid": senderUuid, "name": eventMessage.header.origin };
		console.debug2("Incoming Transport", incomingTransportInfo, "Message", eventMessage);
		parentMessageHandler(incomingTransportInfo, eventMessage);
	}

	function subscribeFailure(reason) {
		console.error("OpenFinBus Subscribe Failure: " + reason);
	}

	//required function for the parent (i.e. routeClient or routeService)
	this.send = function (transport, eventMessage) {
		var destTopic;

		// handle optional transport parm
		if (arguments.length === 1) { // client use just one parameter - eventMessage
			destTopic = destination;
			eventMessage = arguments[0];
		} else { // router service uses both parameters
			destTopic = transport.name;
			eventMessage = arguments[1];
		}

		console.debug2("Outgoing Transport", uuid, destTopic, "Message", eventMessage);
		fin.desktop.InterApplicationBus.publish(destTopic, eventMessage,
			function () { }, function (err) { });
	};

	//required function for the parent (i.e. routeClient or routeService)
	this.identifier = function () {
		return transportName;
	};

	transportName = name;
	parentMessageHandler = parentMessageHandlerParm;
	window.console.debug("OpenFinBus Initializing: " + source);
	fin.desktop.InterApplicationBus.subscribe('*', source, openFinMessageHandler, null, subscribeFailure);
};

// add the transports to the available/active list
RouterTransport.addTransport("SharedWorker", RouterTransportImplementation.SharedWorkerTransport);

RouterTransport.addTransport("OpenFinBus", RouterTransportImplementation.OpenFinTransport);

module.exports = RouterTransport;


/***/ }),
/* 31 */
/***/ (function(module, exports) {

/**
 *
 * This file handles common functionality needed in both the client and service.
 *
 */
// Get a value from an object using a string. {abc:{123:"value"}} you would do byString(object,"abc.123")
function byString(o, s) {//Object,String
	s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
	s = s.replace(/^\./, '');           // strip a leading dot
	var a = s.split('.');
	for (var i = 0, n = a.length; i < a.length; ++i) {// Loop through and find the attribute that matches the string passed in
		var k = a[i];
		if (!o) { return null; }
		if (k in o) {
			o = o[k];
		} else {
			return null;
		}
	}
	return o;
};
//can add values to an object from a string. Must be in `.` form abc.123
const setPath = (object, path, value) => path
	.split('.')
	.reduce((o, p) => o[p] = path.split('.').pop() === p ? value : o[p] || {}, object);

// This handles the intial mapping for us. It will crawl through all child objects and map those too. Parent is the current location within the object(`parent.child`). Null is top level. The mapping is all flattened
function initObject(object, parent, mapping) {
	var mapLocation;

	if (!parent) { parent = null; }

	if (typeof object !== "object") {
		mapLocation = parent ? parent + "." + n : n;
		mapping[mapLocation] = parent;
		return;
	}

	for (n in object) {
		if (typeof object[n] === "object" && object[n] !== "undefined") {
			mapLocation = parent ? parent + "." + n : n;
			mapping[mapLocation] = parent;
			initObject(object[n], mapLocation, mapping);// If we have another object, map it
		} else {
			mapLocation = parent ? parent + "." + n : n;
			mapping[mapLocation] = parent;
		}
	}
}
// Will map out a field in an object. So we don't have to loop through the whole thing everytime we have a change.
function mapField(object, s, mapping) {
	if (mapping[s]) { return; }// If we're already mapped move on.
	s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
	s = s.replace(/^\./, '');           // strip a leading dot
	var a = s.split('.');
	var currentLocation = s;
	if (!mapping.hasOwnProperty(currentLocation)) {
		var newString = null;
		if (a.length > 1) {
			a.pop();
			newString = a.join(".");
		}

		mapping[currentLocation] = newString;
	}

	var newObject = byString(object, currentLocation);
	if (newObject === "undefined") { return; }// If the location doesnt exist exit.
	if (typeof newObject === "object") {
		for (var key in newObject) {
			mapField(object, currentLocation + "." + key, mapping);// If we need to ke
		}
	}
}
// To see if we're replacing an existing field/object with an object/field that would make some of the mapping obsolete.
function checkForObjectChange(object, field, mapping) {
	var objectReplacing = byString(object, field);
	if (objectReplacing === null) { return false; }
	if (typeof objectReplacing === "object") {
		// we're replacing an object which requires use to remapp at this level.
		return removeChildMapping(mapping, field);

	}
	if (typeof objectReplacing !== "object" && typeof field === "object") {
		//we're replacing a non object with an object. Need to map out this new object
		return removeChildMapping(mapping, field);
	}
	return null;
}
//This will remove an item from mapping and pass back an array so that we can send out notifications
function removeChildMapping(mapping, field) {
	var removals = [];
	for (var map in mapping) {
		var lookField = field + ".";
		if (map.includes(lookField)) {
			removals.push(map);
			delete mapping[map];
		};
	}
	return removals;
}

module.exports = {
	setPath: setPath,
	byString: byString,
	initObject: initObject,
	mapField: mapField,
	checkForObjectChange: checkForObjectChange
};

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Logger = __webpack_require__(0);

/**
 * Wraps all child functions that have callbacks to insure callbacks are actually called.
 * @param {object} parentObject object with child functions to wrap if they have callbacks
 * @param {object=} params optional parameters
 * @param {string=} [params.successCallbackName="callback"] function's callback signature, defaults to "callback"
 * @param {string=} [params.errorCallbackName="errorCallback"] function's error callback signature, defaults to "errorCallback";
 * @param {number=} [params.noResponseTimeout=10000] no-response timeout value in milliseconds
 * @param {number=} [params.verySlowTimeout=2000]  very-slow-response timeout value in milliseconds
 * @param {number=} [params.slowTimeout=500] slow-response timeout in milliseconds
 * @private
*/
function wrapCallbacks(parentObject, params) { // variable number of parameters
	params = params || {};
	var successCallbackName = params.successCallbackName || "callback";
	var errorCallbackName = params.errorCallbackName || "errorCallback";
	var noResponseTimeout = params.noResponseTimeout || 10000;
	var verySlowTimeout = params.verySlowTimeout || 2000;
	var slowTimeout = params.slowTimeout || 1000;

	/**
	 * Returns an array of a function's argument names from the function's signiture
	 * @param {object} func the function
	 * @returns {array} the array of parameter names (i.e. strings)
	 * @private
	*/
	function getSignatureFromDefinition(func) {
		const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
		const ARGUMENT_NAMES = /([^\s,]+)/g;
		var childPropertyStr = func.toString().replace(STRIP_COMMENTS, ''); // this get the function's signature
		var result = childPropertyStr.slice(childPropertyStr.indexOf('(')+1, childPropertyStr.indexOf(')')).match(ARGUMENT_NAMES);
		if (result === null) {
			result = [];
		}
		return result;
	}

	/**
	 * Returns function-signature overrides
	 * @returns {Object} returns object where function name is key and value is an array of parameters (i.e. the signature)
	 * @private
	*/
	function getSignatureOverrides() {
		var overrides = {};

		// list of hardcoded overrides to address misc problems
		overrides["launchExternalProcess"] = ["options", "callback", "errorCallbackName"];

		return overrides;
	}

	/**
	 * Returns signature for specific function
	 * @param {string} func the function whose signature will be returned
	 * @returns {Array} array of parameter names (i.e. the signature)
	 * @private
	*/
	function getFunctionSignature(func) {
		var signature;
		var sigOverrides = getSignatureOverrides(func); // special exceptions

		if (func.name in sigOverrides) { // use override if it exists
			signature = sigOverrides[func.name];
		} else {
			signature = getSignatureFromDefinition(func); // else parse signature from function's toString()

		}
		Logger.system.verbose(`Signature for ${func.name}: ${signature}`);
		return signature;
	}

	/**
	 * Add callback timers; a timer fires if callback wasn't invoked within time interval; multiple timers provide better diagnostics
	 * @param {object} functionName the function name for diagnostics
	 * @param {object} traceData the called function's trace data for diagnostics
	 * @returns {objects} object containing all the timer IDs (so can be cleared if needed)
	 * @private
	*/
	// add callback timers; a timer fires if callback wasn't invoked within time interval; multiple timers provide better diagnostics
	function addTimeouts(functionName, traceData) {
		var timers = {};
		if (noResponseTimeout) {
			timers.noResponseTimeoutID = setTimeout(function () {
				console.error(`Callback Timeout: ${noResponseTimeout} millisecond timeout waiting on ${functionName}`, traceData);
			}, noResponseTimeout);
		}

		if (verySlowTimeout) {
			timers.verySlowTimeoutID = setTimeout(function () {
				console.warn(`Callback Timeout: ${verySlowTimeout} millisecond timeout waiting on ${functionName}`, traceData);
			}, verySlowTimeout);
		}

		if (slowTimeout) {
			timers.slowTimeoutID = setTimeout(function () {
				console.debug(`Callback Timeout: ${slowTimeout} millisecond timeout waiting on ${functionName}`, traceData);
			}, slowTimeout);
		}
		return timers;
	}

	/**
	 * Remove callback timers
	 * @param {object} timers object containing all the timer IDs (so can be cleared)
	 * @private
	*/
	function removeTimeouts(timers) {
		Logger.system.debug(`wrapCallbacks Clearing Timers:`, timers);
		clearTimeout(timers.noResponseTimeoutID);
		clearTimeout(timers.verySlowTimeoutID);
		clearTimeout(timers.slowTimeoutID);
	}

	/**
	 * Verify input function has a callback parameter at the give argument index; if so wrap it with new callback that clears the timers
	 * @param {string} functionName the number of the function (for diagnostics)
	 * @param {array} args the functions arguments array
	 * @param {number} callbackIndex index within args that may have the callback (if its passed in)
	 * @param {object} timers the object holding all the timers so they can be cleared when callback is invoked
	 * @returns {boolean} true if the callback was wrapped
	 * @private
	*/
	function verifyAndWrapOneCallback(functionName, args, callbackIndex, timers) {
		var isWrapped = false;
		if (callbackIndex > -1 && args.length >= callbackIndex && typeof args[callbackIndex] === 'function') { // confirm the callback parameter passed in
			let originalCB = args[callbackIndex]; // save original CB to use within replacement CB
			// this is the wrap callback function that clears timers then calls the orignal callback
			let successReplacementCB = function wrapCallback() {
				Logger.system.verbose(`In Wrap Callback ${functionName}`);
				removeTimeouts(timers);
				if (originalCB) {
					originalCB.apply(null, arguments); // invoke original callback
				}
			};
			args[callbackIndex] = successReplacementCB;
			isWrapped = true;
		}
		return isWrapped; // return true if callback replaced above
	}

	/**
	 * Walk though each child properties of an object and wrap any function property with callbacks
	 * @param {object} parentObject the parent object
	 * @private
	*/
	function  wrapPropertiesWithCallbacks(parentObject) {
		for (let childProperty in parentObject) {
			if (typeof parentObject[childProperty] === 'function') {
				Logger.system.verbose(`Iterating through function ${childProperty}`);

				let originalFunction = parentObject[childProperty]; // save the original function before overwriting it

				let argNamesFromSignature = getFunctionSignature(originalFunction);
				let successCallbackIndex = argNamesFromSignature.indexOf(successCallbackName); // find the typical argument location of the callback
				let errorCallbackIndex = argNamesFromSignature.indexOf(errorCallbackName); // find the typical argument location of the error callback

				if ((successCallbackIndex > -1) || (errorCallbackIndex > -1)) { // if a callback defined in function definition
					Logger.system.verbose(`Wrapping ${successCallbackName} and/or ${errorCallbackName} in ${childProperty}: ${originalFunction}`);

					// this is the actual wrap function, replacing the original function at run time
					parentObject[childProperty] = function wrapFunction() {
						let args = Array.from(arguments); // copy arguments into real array so can manipulate

						let traceData = new Error().stack.replace("Error", "Callback Trace"); // trace data for diagnostics
						let timers = addTimeouts(childProperty, traceData); // start the timers now (will clear in callbacks below)

						let isWrapped1 = verifyAndWrapOneCallback(childProperty, args, successCallbackIndex, timers);
						let isWrapped2 = verifyAndWrapOneCallback(childProperty, args, errorCallbackIndex, timers);

						if (!isWrapped1 && !isWrapped2) { // if no callback was wrapped then immediately clear the timers
							removeTimeouts(timers);
						}

						originalFunction.apply(this, args); // after executing the above patch function, now call the original function
					};
				}
			}
		}
	}

	/**** wrapCallbacks main ****/
	console.log('WrapCallbacks Start', parentObject);
	if (!("wrapCallbacksDone" in parentObject)) { // only wrap children if hasn't already been wrapped
		wrapPropertiesWithCallbacks(parentObject);
		parentObject.wrapCallbacksDone = true; // annotate object so only wrapped once
	 }
}

module.exports = wrapCallbacks;

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(17);


/***/ })
/******/ ]);
//# sourceMappingURL=FSBL.js.map