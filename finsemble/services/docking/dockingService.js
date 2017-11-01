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
/******/ 	return __webpack_require__(__webpack_require__.s = 73);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
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
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/


const LOCAL_ONLY_DEFAULT = false; // if true all logging will default to local console; will be overwritten by LoggerService's registration response

// capture everything at startup; will be filtered later as needed when LoggerService's registration response provides settings; overhead here is not too high
var DEFAULT_LOG_SETTING = { Error: true, Warn: true, Info: true, Log: true, Debug: true, Verbose: true, LocalOnly: LOCAL_ONLY_DEFAULT }; // if true captured for logger
var CONSOLE_DEFAULT_LOG_SETTING = { Error: true, Warn: true, Info: true, Log: true, Debug: true }; // if true then goes to console and captured for logger

const MAX_QUEUE_SIZE = 10 * 1000; // maximum logger queue size; plenty of space although shouldn't need much since continuely sending to logger if working correctly;

var Validate = __webpack_require__(3); // Finsemble args validator
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
	if (window.top !== window) {
		// amend name if iFrame
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
			} else {
				// only now know LocalOnly for messages, so print those queued out otherwise they will be lost
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
			try {
				throw Error("");
			} catch (err) {
				return err;
			}
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
			if (!isActiveTransmitTimer) {
				// since log message added to queue, only set timer to transmit log if not already set
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
				if (error) {
					// for some very early clients the logger may not be ready yet, so retry after a small wait
					setTimeout(registerClient, 750);
				} else {
					isRegistered = true;
					loggerConsole.system.debug("logger.service.register response", queryMessage.data);
					updatedLogState = queryMessage.data;
					if (loggerClientName !== "routerService") {
						calibratedTimeStampOffset = newCalibratedTimeStampOffset; // from now the real offset time will be used for all timestamps
						setLogState(updatedLogState, true); // true indicates must adjust already queued timestamps by the new offset time
					} else {
						// router services doesn't need to calibrate time since it is the reference time
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
		RouterClient.query("logger.service.unregister", { clientName: loggerClientName }, function () {});
	}

	function registerOnceWhenStarted() {
		if (!isRegistering) {
			registerClient();
			window.addEventListener("beforeunload", unregisterClient);
			isRegistering = true;
		}
	}

	this.isLogMessage = function (channel) {
		return channel === "logger.service.logMessages";
	};

	this.start = function () {
		RouterClient = __webpack_require__(4);
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

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\clients\\logger.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\clients\\logger.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var SystemSettings = __webpack_require__(6);
var Logger = __webpack_require__(1);
module.exports = {
	/**
  * Gets the openfin version in object form.
  */
	getOpenfinVersion: function (cb) {
		return new Promise(function (resolve, reject) {
			fin.desktop.System.getVersion(ver => {
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
		if (typeof val !== "string") {
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
				try {
					throw Error('');
				} catch (err) {
					return err;
				}
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
				var suffix = traceString("error") + " (timestamp " + Math.round(window.performance.now() * 1000) / 1000 + ')';
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
				var suffix = traceString("warn") + " (timestamp " + Math.round(window.performance.now() * 1000) / 1000 + ')';
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
				var suffix = " (timestamp " + Math.round(window.performance.now() * 1000) / 1000 + ')';
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
				var suffix = " (timestamp " + Math.round(window.performance.now() * 1000) / 1000 + ')';
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
				var suffix = " (timestamp " + Math.round(window.performance.now() * 1000) / 1000 + ')';
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
				var suffix = " (timestamp " + Math.round(window.performance.now() * 1000) / 1000 + ')';
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
				var suffix = " (timestamp " + Math.round(window.performance.now() * 1000) / 1000 + ')';
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
				var suffix = " (timestamp " + Math.round(window.performance.now() * 1000) / 1000 + ')';
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
		return new Promise(function (resolve, reject) {
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
		});
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
				if (cb) {
					cb(allMonitors);
				}
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
				if (x >= monitorRect.left && x < monitorRect.right && y >= monitorRect.top && y < monitorRect.bottom) {
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
				if (cb) {
					cb(monitor);
				}
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
					remoteWindow.getInfo(info => {
						Logger.system.log('Util.getFinWindow.remoteWindow.getInfo - callback');
						if (cb) {
							cb(remoteWindow);
						};

						Logger.system.log('Util.getFinWindow - end - 462');
						resolve(remoteWindow);
					}, function (err) {
						Logger.system.log('Util.getFinWindow - end - 465');
						if (cb) {
							cb(null);
						}
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
							if (cb) {
								cb(remoteWindow);
							}
						} else {
							Logger.system.log('Util.getFinWindow - end - 479');
							reject("util.getFinWindow: Component " + windowIdentifier.componentType + " not found.");
							if (cb) {
								cb(null);
							}
						}
					} else {
						Logger.system.log('Util.getFinWindow - end - 484');
						//@TODO, get this through a remote call to Launcher service
						reject("getFinWindow by componentType is currently only operable within LaunchService");
						if (cb) {
							cb(null);
						}
					}
				} else {
					Logger.system.log('Util.getFinWindow - end - 490');
					// return windowDescriptor for current window
					if (cb) {
						cb(myWindow);
					}
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
					if (cb) {
						cb(options);
					}
					Logger.system.log('Util.getWindowDescriptor - End');
					resolve(options);
				});
			}).catch(function (errorMessage) {
				console.warn(errorMessage);
				Logger.system.log('Util.getWindowDescriptor - End -- Warn');
				if (cb) {
					cb(null);
				}
				reject(errorMessage);
			});
		});
	},

	findMonitor: function (monitors, field, value) {
		for (var i = 0; i < monitors.length; i++) {
			var monitor = monitors[i];
			if (monitor[field] === value) {
				return monitor;
			}
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
		var isANumber = commandMonitor && commandMonitor !== "" || commandMonitor === 0;
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
				finWin.getBounds(bounds => {
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
						if (cb) {
							cb(finalMonitorInfo);
						}
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
		if (windowDescriptor.left >= monitorDimensions.left && windowDescriptor.left < monitorDimensions.right || windowDescriptor.right <= monitorDimensions.right && windowDescriptor.right > monitorDimensions.left) {
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
						if (cb) {
							cb(monitor);
						}
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
			finWindow.getOptions(windowDescriptor => {
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

				if (cb) {
					cb(windowIdentifier);
				}
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
		return str.replace(/\s(.)/g, function ($1) {
			return $1.toUpperCase();
		}).replace(/\s/g, '').replace(/^(.)/, function ($1) {
			return $1.toLowerCase();
		});
	},

	/**
  * Convenience method for cloning an object.
  * @param  {any} from The thing you want to copy
  * @param {any} to Where you want your copy to end up.
  * @return {any} to Where you want your copy to end up.
  */
	clone: function (from, to) {
		if (from === null || typeof from !== "object") {
			return from;
		}
		// if (from.constructor != Object && from.constructor != Array) return from;
		if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function || from.constructor == String || from.constructor == Number || from.constructor == Boolean) {
			return new from.constructor(from);
		}

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

	injectJS(path, cb) {
		//Inject a script tag with the path given. Once the script is loaded, it executes the callback.

		var script = document.createElement('script');
		script.onload = cb;
		script.type = 'text/javascript';
		script.async = true;
		script.src = path;
		var head = document.getElementsByTagName('head')[0];
		var firstScript = head.getElementsByTagName('script')[0];
		head.insertBefore(script, firstScript);
	}
};

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\common\\util.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\common\\util.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var SystemSettings = __webpack_require__(6);

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
			try {
				throw Error('');
			} catch (err) {
				return err;
			}
		}

		var err = getErrorObject();

		var caller_line1 = err.stack.split("\n")[5];
		var index1 = caller_line1.indexOf("at ");
		var msgPart1 = caller_line1.slice(index1 + 2, caller_line1.length);

		var caller_line2 = err.stack.split("\n")[6];
		var index2 = caller_line2.indexOf("at ");
		var msgPart2 = caller_line2.slice(index2 + 2, caller_line2.length);

		console.warn("parameter validation failed: parameter " + paramDescript + " is of type '" + typeof thisArg + "' but should be of type '" + thisArgType + "' in" + msgPart1 + " called by" + msgPart2);
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
			if ((parmCount + 1) % 2 !== 0) {
				// parameters must come in pairs (i.e. even number)
				for (var i = 0; i < parmCount; i = i + 2) {
					var optionalArg = false;
					var thisArg = arguments[i];
					var thisArgType = arguments[i + 1];
					if (thisArgType.slice(-1) === "=") {
						// if last char is "=" then optional argument
						thisArgType = thisArgType.slice(0, -1);
						optionalArg = true;
					}
					if (typeof thisArg !== thisArgType) {
						// confirms basic case -- the required type
						if (!optionalArg || typeof thisArg !== "undefined") {
							// but optional parms can be undefined
							if (typeof thisArg === "undefined" || thisArgType !== "any") {
								// but "any" type doesn't have to match but can't be undefined
								var parameterPosition = i / 2 + 1;
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
			if ((parmCount + 1) % 3 !== 0) {
				// parameters must come in sets of three 
				for (var i = 0; i < parmCount; i = i + 3) {
					var optionalArg = false;
					var thisArgName = arguments[i];
					var thisArg = arguments[i + 1];
					var thisArgType = arguments[i + 2];
					if (thisArgType.slice(-1) === "=") {
						// if last char is "=" then optional argument
						thisArgType = thisArgType.slice(0, -1);
						optionalArg = true;
					}
					if (typeof thisArg !== thisArgType) {
						// confirms basic case -- the required type
						if (!optionalArg || typeof thisArg !== "undefined") {
							// but optional parms can be undefined
							if (typeof thisArg === "undefined" || thisArgType !== "any") {
								// but "any" type doesn't have to match but can't be undefined
								var parameterPosition = i / 2 + 1;
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

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\common\\validate.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\common\\validate.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/*!
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



var RouterClientConstructor = __webpack_require__(11);

module.exports = new RouterClientConstructor({ clientName: "RouterClient" });

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\clients\\routerClientInstance.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\clients\\routerClientInstance.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 5 */
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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/*!
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
		return currentDiagLevel >= 4;
	};
};

module.exports = new SystemSettings();

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\common\\systemSettings.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\common\\systemSettings.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 7 */
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

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(16).setImmediate, __webpack_require__(0), __webpack_require__(5), __webpack_require__(12)(module)))

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var Utils = __webpack_require__(2);
var RouterClient = __webpack_require__(4);
var Validate = __webpack_require__(3); // Finsemble args validator
var Logger = __webpack_require__(1);

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
	this.windowName = ""; //The current window

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
		if (!services) {
			return;
		}
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

		if (!clients) {
			return;
		}
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
				if (err) {
					return;
				}
				if (!event.data) {
					return;
				}
				if (event.data.status === "online") {
					self.addClients(self.requiredClients[i]);
				}
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
		if (initialized) {
			return;
		}
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

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\clients\\baseClient.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\clients\\baseClient.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

var FSBLUtils = __webpack_require__(2);
var Logger = __webpack_require__(1);

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
				if (tokens[i][0] === "$") {
					// special variable character $ has to first char in string
					var variableReference = tokens[i].substring(1); // string off the leading $
					var variableResolution = finsembleConfig[variableReference]; // the variable value is another config property, which already must be set
					var newValue = configString.replace(tokens[i], variableResolution); // replace the variable reference with new value
					Logger.system.verbose("resolveString configString", tokens[i], variableReference, variableResolution, "oldvalue=", configString, "value=", newValue);
					needsAnotherPass = true; // <<-- here is the only place needsAnotherPass is set, since still resolving variables
					configString = newValue;
				}
			}
			return configString;
		}

		// process an array of config items looking for variables to resolve (a recursive routine)
		function resolveArray(configArray, pass, recursionLevel) {
			Logger.system.verbose("resolveArray", "pass", pass, "recursionLevel", recursionLevel, "configArray:", configArray);
			for (var i = 0; i < configArray.length; i++) {
				var value = configArray[i];
				if (typeof value === "string" && value.indexOf("$") > -1) {
					configArray[i] = resolveString(value);
				} else if (value instanceof Array) {
					resolveArray(value, pass, recursionLevel + 1); // array reference passed so don't need return value
				} else if (typeof value === "object") {
					resolveObject(value, pass, recursionLevel + 1); // object reference passed so don't need return value
				}
			}
		}

		// process an object of config properties looking for variables to resolve (a recursive routine)
		function resolveObject(configObject, pass, recursionLevel) {
			Logger.system.verbose("resolveObject", "pass", pass, "recursionLevel", recursionLevel, "configObject:", configObject);
			Object.keys(configObject).forEach(function (key) {
				var value = configObject[key];
				if (typeof value === "string" && value.indexOf("$") > -1) {
					configObject[key] = resolveString(value);
				} else if (value instanceof Array) {
					resolveArray(value, pass, recursionLevel + 1); // array reference passed so don't need return value
				} else if (typeof value === "object") {
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

			application.getManifest(function (manifest) {
				// get raw openfin manifest
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
					} else {
						// still could find so must be a problem (i.e. avoid infinite loop)
						callback("could not find manifest in parent applications");
					}
				});
			});
		}

		fin.desktop.main(function () {
			// make sure openfin is ready
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

		fin.desktop.main(function () {
			// make sure openfin is ready
			var application = fin.desktop.Application.getCurrent();
			application.getManifest(function (manifest) {
				// get raw openfin manifest
				ConfigUtil.resolveConfigVariables(manifest.finsemble, manifest.finsemble); // resolve variables first time so can fild config config location
				var CORE_CONFIG = manifest.finsemble.moduleRoot + "/configs/core/config.json"; // <<<--- here is the "hidden" core config file
				getCoreConfig(CORE_CONFIG, function (error, newFinsembleConfigObject) {
					// fetch the core config file
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

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\common\\configUtil.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\common\\configUtil.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

// This routerTransport module is shared between router clients and the router service.  It supports
// the addition of new transports without any change to the router code. Each transport is
// point-to-point between a router client and the router service (i.e. hub and spoke).  Each router
// client can use a different transport (i.e. the router service connects to them all).



var Utils = __webpack_require__(2);
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

			var isSameHost = window.location.hostname === parser.hostname;

			var isSameProtocol = window.location.protocol === parser.protocol;

			var wport = window.location.port === undefined ? window.location.port : 80;
			var pport = parser.port === undefined ? parser.port : 80;
			var isSamePort = wport === pport;

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
		if (arguments.length === 1) {
			// clients use just one parm -- eventMessage
			eventMessage = arguments[0];
			transport = null;
			console.debug2("Outgoing Transport", transportName, "Message", eventMessage);
		} else {
			// router services uses both parameters
			transport = arguments[0];
			eventMessage = arguments[1];
			console.debug2("Outgoing Transport", transport, "Message", eventMessage);
		}
		try {
			routerThread.port.postMessage([transport, eventMessage]);
		} catch (e) {
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

	if (source === "RouterService") {
		// send first message though shared worker to identify router service
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
		if (arguments.length === 1) {
			// client use just one parameter - eventMessage
			destTopic = destination;
			eventMessage = arguments[0];
		} else {
			// router service uses both parameters
			destTopic = transport.name;
			eventMessage = arguments[1];
		}

		console.debug2("Outgoing Transport", uuid, destTopic, "Message", eventMessage);
		fin.desktop.InterApplicationBus.publish(destTopic, eventMessage, function () {}, function (err) {});
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

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\common\\routerTransport.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\common\\routerTransport.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/



var RouterTransport = __webpack_require__(10);
var Utils = __webpack_require__(2);
var ConfigUtil = __webpack_require__(9);
var Validate = __webpack_require__(3); // Finsemble args validator
var queue = []; // should never be used, but message sent before router ready will be queue

var Logger = __webpack_require__(1);
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
			"type": "initialHandshake"
		};
	}
	function TimeCalibrationHandshakeMessage(clientBaseTime, serviceBaseTime) {
		this.header = {
			"origin": clientName,
			"type": "timeCalibration"
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

		fin.desktop.main(function () {
			// wait for openfin to be ready
			if (callbackCounter++ === 0) {
				// this check should  not be needed; patch for OpenFin bug which invokes callback twice
				// catch "window closing" event so can cleanup
				var finWindow = fin.desktop.Window.getCurrent();
				window.addEventListener("unload", destructor); // this is the correct event to catch but
				finWindow.addEventListener("closed", destructor); // this is the correct event to catch but currently doesn't work on mac
				ConfigUtil.getExpandedRawManifest(function (manifest) {
					Logger.system.debug("Router getExpandedRawManifest", manifest);
					//If manifest is a string, then there was an error getting the manifest because in a seperate application
					if (!manifest || typeof manifest === "string") {
						Logger.system.error("getExpandedRawManifest failed -- fatal error", manifest);
					} else {
						asyncConnectToEventRouter(manifest, clientName, transportName, onReadyCallBack); /**** establish connection to router service ****/
					}
				}, function (err) {
					Logger.system.error(err);
				});
			}
		});
	}

	// connects to event-router service
	function asyncConnectToEventRouter(manifest, clientName, transportName, onReadyCallBack) {
		var transportNotSpecified = typeof transportName === "undefined";
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
			transport = RouterTransport.getRecommendedTransport(routerParams, incomingMessageHandler, clientName, "RouterService").then(transportReady).catch(errHandler);
		} else {
			// tranport specified...typically only for regression testing
			transport = RouterTransport.getTransport(routerParams, transportName, incomingMessageHandler, clientName, "RouterService").then(transportReady).catch(errHandler);
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
			if (!isFinished) {
				// ensure only invoked once
				Logger.system.debug("RouterClient connected: starting " + clientName + " with transport " + transport.identifier());
				isFinished = true;
				clearInterval(myTimer);
				if (queue) {
					// this should not happen with proper startup order, which waits on routerClient to be ready
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
		return clientName + "." + ++clientIDCounter;
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
			message.originatedHere = originatedHere; // add local function to test origin
			for (var i = 0; i < clientCallbackArray.length; i++) {
				// for each callback defined for the channel
				if (!Logger.isLogMessage(message.header.channel)) {
					// logger messages
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
			} else {
				// invoke the callback with error since  flag in message (from router service)
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
				Logger.system.warn("RouterClient: timeout waiting on query response on channel " + channel + " for queryID " + newQueryID + " on timer " + mapQueryResponseTimeOut[newQueryID] + " timeout=" + timeout);
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

		if (callbacks === undefined) {
			// if undefined then may be a matching RegEx topic
			for (var key in mapPubSubResponderRegEx) {
				if (mapPubSubResponderRegEx[key].test(subscribeMessage.header.topic)) {
					callbacks = mapPubSubResponders[key];
					var initialState = mapPubSubResponderState[subscribeMessage.header.topic]; // may already be initial state defined from publish
					if (initialState === undefined) {
						// if there isn't already state defined then use default from regEx
						initialState = mapPubSubResponderState[key]; // initialize the state from RegEx topic
					}
					mapPubSubResponderState[subscribeMessage.header.topic] = initialState;
					break;
				}
			}
		}

		if (callbacks === undefined) {
			// if still undefined
			Logger.system.warn("RouterClient: no pubsub responder defined for incoming subscribe", subscribeMessage);
		} else {
			if (subscribeMessage.header.error) {
				// the router service uses the subscribe message in this case to return a pubsub error (ToDO: consider a generic error message)
				Logger.system.warn("RouterClient: pubsub error received from router service: " + JSON.stringify(subscribeMessage.header.error));
			} else {
				subscribeMessage.sendNotifyToSubscriber = sendNotifyToSubscriber; // add callback function to message so pubsub responder can respond with Notify message
				if (callbacks.subscribeCallback) {
					subscribeMessage.data = mapPubSubResponderState[subscribeMessage.header.topic];
					callbacks.subscribeCallback(null, subscribeMessage); // invoke the callback (no error)
				} else {
					// since no subscribe callback defined, use default functionality
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

		if (callbacks === undefined) {
			// if undefined then may be a matching RegEx topic
			for (var key in mapPubSubResponderRegEx) {
				if (mapPubSubResponderRegEx[key].test(unsubscribeMessage.header.topic)) {
					callbacks = mapPubSubResponders[key];
					break;
				}
			}
		}

		if (callbacks === undefined) {
			// if still undefined
			Logger.system.warn("RouterClient: no pubsub responder defined for incoming unsubscribe", "TOPIC", unsubscribeMessage.header.topic, "UNSUBSCRIBE MESSAGE", unsubscribeMessage);
		} else {
			unsubscribeMessage.removeSubscriber = removeSubscriber; // add callback function to message for pubsub responder (but must always remove)
			if (callbacks.unsubscribeCallback) {
				Logger.system.info("RouterClient: incoming unsubscribe callback", "TOPIC", unsubscribeMessage.header.topic, "UNSUBSCRIBE MESSAGE", unsubscribeMessage);
				callbacks.unsubscribeCallback(null, unsubscribeMessage); // invoke the callback (no error)
			} else {
				// since no unsubscribe callback defined, use default functionality
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
			if (typeof listOfSubscribers !== "undefined") {
				// confirm subscribers to send to, if none then nothing to do
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

		if (callbacks === undefined) {
			// if undefined then may be a matching RegEx topic
			for (var key in mapPubSubResponderRegEx) {
				if (mapPubSubResponderRegEx[key].test(publishMessage.header.topic)) {
					callbacks = mapPubSubResponders[key];
					break;
				}
			}
		}

		if (callbacks === undefined) {
			// if still undefined
			Logger.system.warn("RouterClient: no pubsub responder defined for incoming publish", "TOPIC", publishMessage.header.topic, "PUBLISH MESSAGE", publishMessage);
		} else {
			publishMessage.sendNotifyToAllSubscribers = sendNotifyToAllSubscribers; // add callback function to message so pubsub responder can respond to publish
			if (callbacks.publishCallback) {
				Logger.system.info("RouterClient: incoming PubSub publish callback invoked", "TOPIC", publishMessage.header.topic, "PUBLISH MESSAGE", publishMessage);
				callbacks.publishCallback(null, publishMessage); // invoke the callback (no error)
			} else {
				// since no pubish callback defined, use default functionality
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
				notifyMessage.originatedHere = originatedHere; // add local function to test origin
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
		if (!transport || transport instanceof Promise) {
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
				var offset = serviceTime - (startClientTime + rtt / 2);
				if (rtt < fastestRRT) {
					fastestRRT = rtt;
					offsetForFastest = offset;
				}
				timeOffset += offset;
				Logger.system.debug("calibrationCalculation Intermediate Values", "lastRRT", rtt, "lastOffset", offset, "fastestOffset", offsetForFastest, "fastestRRT", fastestRRT);
			}
			timeOffset /= TARGET_HANDSHAKE_COUNT - 1;
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
		if (!Logger.isLogMessage(toChannel)) {
			// logger messages
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
		Validate.args2("params.subscribeCallback", params.subscribeCallback, "function=", "params.publishCallback", params.publishCallback, "function=") && Validate.args2("params.unsubscribeCallback", params.unsubscribeCallback, "function=");

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

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\clients\\routerClientConstructor.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\clients\\routerClientConstructor.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

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
/* WEBPACK VAR INJECTION */(function(process) {

var Logger = __webpack_require__(1);

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
function wrapCallbacks(parentObject, params) {
	// variable number of parameters
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
		var result = childPropertyStr.slice(childPropertyStr.indexOf('(') + 1, childPropertyStr.indexOf(')')).match(ARGUMENT_NAMES);
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

		if (func.name in sigOverrides) {
			// use override if it exists
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
		if (callbackIndex > -1 && args.length >= callbackIndex && typeof args[callbackIndex] === 'function') {
			// confirm the callback parameter passed in
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
	function wrapPropertiesWithCallbacks(parentObject) {
		for (let childProperty in parentObject) {
			if (typeof parentObject[childProperty] === 'function') {
				Logger.system.verbose(`Iterating through function ${childProperty}`);

				let originalFunction = parentObject[childProperty]; // save the original function before overwriting it

				let argNamesFromSignature = getFunctionSignature(originalFunction);
				let successCallbackIndex = argNamesFromSignature.indexOf(successCallbackName); // find the typical argument location of the callback
				let errorCallbackIndex = argNamesFromSignature.indexOf(errorCallbackName); // find the typical argument location of the error callback

				if (successCallbackIndex > -1 || errorCallbackIndex > -1) {
					// if a callback defined in function definition
					Logger.system.verbose(`Wrapping ${successCallbackName} and/or ${errorCallbackName} in ${childProperty}: ${originalFunction}`);

					// this is the actual wrap function, replacing the original function at run time
					parentObject[childProperty] = function wrapFunction() {
						let args = Array.from(arguments); // copy arguments into real array so can manipulate

						let traceData = new Error().stack.replace("Error", "Callback Trace"); // trace data for diagnostics
						let timers = addTimeouts(childProperty, traceData); // start the timers now (will clear in callbacks below)

						let isWrapped1 = verifyAndWrapOneCallback(childProperty, args, successCallbackIndex, timers);
						let isWrapped2 = verifyAndWrapOneCallback(childProperty, args, errorCallbackIndex, timers);

						if (!isWrapped1 && !isWrapped2) {
							// if no callback was wrapped then immediately clear the timers
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
	if (!("wrapCallbacksDone" in parentObject)) {
		// only wrap children if hasn't already been wrapped
		wrapPropertiesWithCallbacks(parentObject);
		parentObject.wrapCallbacksDone = true; // annotate object so only wrapped once
	}
}

module.exports = wrapCallbacks;

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\common\\wrapCallbacks.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\common\\wrapCallbacks.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

/*
 * @introduction
 * Creates an instance of the Base Service of which all service must inherit. Services are spawned from your `service.json` file and managed by a helper thread (Service Manager). Services communicate their status and *receive status of other service through the Service Manager. Services have an intial handshake with the Service Manager on load and then either go online or wait for dependant services to come online. Service *intialization is completly async which allows all services to load at the same time as long as their dependencies have been met.
*/
window.finsemble = {};
var FSBLUtils = __webpack_require__(2);
var RouterClient = __webpack_require__(4);
var Logger = __webpack_require__(1);
var wrapCallbacks = __webpack_require__(13);
var async = __webpack_require__(7);

// ensures all service errors will be caught
window.addEventListener('error', function (errorObject) {
	Logger.error(errorObject.message, "File: " + errorObject.filename, "Line: " + errorObject.lineno, "Column: " + errorObject.colno, "Error Stack: \n    " + errorObject.error.stack.substring(errorObject.error.stack.search("at ")) // strip off irrelevant part of stack
	);
	return false;
});

/**
 * @introduction
 * Creates an instance of the Base Service of which all service must inherit. Services are spawned from your `service.json` file and managed by a helper thread (Service Manager). Services communicate their status and *receive status of other service through the Service Manager. Services have an intial handshake with the Service Manager on load and then either go online or wait for dependant services to come online. Service *intialization is completly async which allows all services to load at the same time as long as their dependencies have been met.
 * @constructor

 @example
	var baseService = require("../baseService");
	function NewService() {

		return this;
	}
	NewService.prototype = new baseService();
	var serviceInstance = new NewService();
	serviceInstance.onBaseServiceReady(function (callback) {
		callback();
	});

	serviceInstance.start();
	module.exports = serviceInstance;
 */
var BaseService = function () {
	var self = this;

	this.name = window.name;
	this.RouterClient = RouterClient;
	this.isRouterInitialized = false;
	this.isWindowConnected = false;

	this.parentUuid; // initialized from custom data and used in sendToParent -- the parent's UUID
	this.servicesStillNeeded = []; // All the services that are required before the connection to the service manager is complete.
	this.clientsStillNeeded = [];
	this.onlineClients = [];
	this.onlineServices = {};
	this.__parent = null; //Should be service manager
	this.clients = [];

	//if the `start()` method is called, this is flipped to false. It's set to true once `debugServiceDelay` has been satisifed.
	this.waitedLongEnough = true;
	/**
  * Service status
  * @type {s}
  */
	this.status = "Offline"; //The services status
	this.onBaseServiceReadyCB = null;
	this.setOnConnectionCompleteCB = null;

	// catches startup problems by logging error is service doesn't start in alloted time
	this.setStartupTimer = function () {
		self.startTimeoutValue = 10000;
		self.startTimer = setTimeout(startupTimeoutHandler, self.startTimeoutValue); // cleared in setServiceOnline
	};

	function startupTimeoutHandler() {
		Logger.system.error('STARTUP WARNING: Service not online after ' + self.startTimeoutValue / 1000 + ' seconds', self.name, 'Clients Still Needed', self.clientsStillNeeded, "Services Still Needed", self.servicesStillNeeded);
	}

	function setServiceOnline() {
		Logger.system.log("STARTUP: SERVICE ONLINE", self.name, self.startTimer);
		clearTimeout(self.startTimer);
		RouterClient.transmit("Finsemble.ServiceManager.online", { serviceName: self.name }); // notify service manager
		self.status = "ServiceOnline";
	}

	// Transmit online to parent
	this.transmitOnLine = function () {
		Logger.system.debug("BaseService transmitOnLine", self.name);
		self.status = "TransitioningToServiceOnline"; // must change from offline here; otherwise race condition waiting to call setServiceOnline
		self.RouterClient.ready(function () {
			if (self.onBaseServiceReadyCB) {
				// if inheriting service provided a "connection complete" callback, then invoke before sending online
				self.onBaseServiceReadyCB(function () {
					setServiceOnline();
				});
			} else if (self.setOnConnectionCompleteCB) {
				// if inheriting service provided a "connection complete" callback, then invoke before sending online
				self.setOnConnectionCompleteCB(function () {
					setServiceOnline();
				});
			} else {
				setServiceOnline();
			}
		});
	};

	// Check if can set service online. Online only happens when all servicesStillNeeded are online.
	// Also, the online is only sent to the parent once all of the 'onBaseServiceReadyCB' functions are complete (if set)
	this.isReadyToSetOnline = function () {
		if (self.waitedLongEnough && self.servicesStillNeeded.length === 0 && self.clientsStillNeeded.length === 0 && self.status === "Offline") {
			self.transmitOnLine();
		} else {
			Logger.system.debug("STARTUP: isReadyToSetOnline", "Clients Still Needed", self.clientsStillNeeded, "Services Still Needed", self.servicesStillNeeded);
		}
	};

	this.onBaseServiceReady = function (func) {
		// used by the inheriting service to know where baseService init is complete
		self.onBaseServiceReadyCB = func;
	};

	this.setOnConnectionComplete = function (func) {
		// used by the inheriting service to know where baseService init is complete
		Logger.system.warn("setOnConnectionComplete is deprecated. It will be removed in the next major version. Use 'onBaseServiceReady' instead.");
		self.setOnConnectionCompleteCB = func;
	};

	/**
 * Add a service to services needed list. This service will wait for all services in this list to be complete.
 * @param {Array} services An array of service names
 */
	this.addNeededServices = function (services) {
		if (!services) {
			return;
		}
		if (!Array.isArray(services)) {
			services = [services];
		}
		for (var i = 0; i < services.length; i++) {
			if (self.servicesStillNeeded.indexOf(services[i]) === -1) {
				self.servicesStillNeeded.push(services[i]);
			}
		}
	};

	/**
 * Add a client to clients needed list. This clientz will wait for all clients in this list to be complete.
 * @param {Array} services An array of service names
 */
	this.addNeededClients = function (clients) {
		if (!clients) {
			return;
		}
		if (!Array.isArray(clients)) {
			clients = [clients];
		}
		for (var i = 0; i < clients.length; i++) {
			if (self.clientsStillNeeded.indexOf(clients[i]) === -1) {
				self.clientsStillNeeded.push(clients[i]);
			}
		}
	};

	/**
 * Clear the services needed. By default, routerClient is in the required service
 * @param {Array} services Add a service to services needed list. This service will wait for all services in this list to be complete.
 */
	this.clearServicesStillNeeded = function () {
		self.servicesStillNeeded = [];
	};

	//Check to see if services are online and remove them from the services needed if they are
	this.checkServicesStillNeeded = function () {
		if (self.servicesStillNeeded.length > 0) {
			for (var i = 0; i < self.servicesStillNeeded.length; i++) {
				if (self.servicesStillNeeded[i] in self.onlineServices) {
					Logger.system.debug("STARTUP: Service Dependency Satisfied", self.clientsStillNeeded[i]);
					self.servicesStillNeeded.splice(i, 1);
					i--; // loop index has to be adjusted after delete
				}
			}
			Logger.system.debug("checkServicesStillNeeded", "Online", self.onlineServices, "Still Needed", self.servicesStillNeeded);
			self.isReadyToSetOnline();
		}
	};

	//Check to see if clients are online and remove them from the clients needed if they are
	this.checkClientsStillNeeded = function () {
		if (self.clientsStillNeeded.length > 0) {
			for (var i = 0; i < self.clientsStillNeeded.length; i++) {
				if (self.onlineClients.indexOf(self.clientsStillNeeded[i]) > -1) {
					Logger.system.debug("STARTUP: Service Client Dependency Satisfied", self.clientsStillNeeded[i]);
					self.clientsStillNeeded.splice(i, 1);
					i--; // loop index has to be adjusted after delete
				}
			}
			Logger.system.debug("checkClientsStillNeeded", "Online", self.onlineClients, "Still Needed", self.clientsStillNeeded);
			self.isReadyToSetOnline();
		}
	};

	this.initializeListeners = function (service) {

		RouterClient.addListener("Finsemble.serviceOnline", function (error, message) {
			if (error) {
				Logger.system.warn('addListener error for Finsemble.serviceOnline');
			} else {
				var serviceName = message.data;
				if (self.status !== "ServiceOnline") {
					Logger.system.debug('Potential Service Dependency Online', serviceName);
				}
				self.onlineServices[serviceName] = true;
				self.checkServicesStillNeeded();
			}
		});

		RouterClient.addListener(self.name + ".clientOnline", function (error, message) {
			if (error) {
				Logger.system.warn('addListener error for clientOnline');
			} else {
				var clientName = message.data;
				Logger.system.debug('Potential Service Client Dependency Online', clientName);
				self.onlineClients.push(clientName);
				self.checkClientsStillNeeded();
			}
		});

		// this section adjust the timeout timer when startup is held up because of authentication
		RouterClient.subscribe("AuthorizationState", function (err, response) {
			var notifyData = response.data;
			Logger.system.debug("AuthorizationState Notification", notifyData);
			if (self.status !== "ServiceOnline") {
				if (notifyData.state === "starting") {
					Logger.system.info("AuthorizationState Starting -- Stopping Timeout Timer", self.startTimer);
					clearTimeout(self.startTimer);
				} else if (notifyData.state === "done") {
					Logger.system.info("AuthorizationState Done - Restarting Timeout Timer");
					service.setStartupTimer();
				}
			}
		});

		self.listenForShutdown();
	};
};

BaseService.prototype.getInitialActiveServices = function (done) {
	var self = this;

	RouterClient.query("Finsemble.ServiceManager.getActiveServices", {}, function (err, response) {
		Logger.system.log('getInitialActiveServices response', response);
		if (response) {
			var activeServices = response.data;
			for (var i = 0; i < activeServices.length; i++) {
				self.onlineServices[activeServices[i]] = true;
			}
			self.checkServicesStillNeeded();
			done();
		}
	});
};

BaseService.prototype.sendOnlineToParent = function () {
	this.transmitOnLine();
};

//This will be set to true after the debugServiceDelay is met. Defaults to 0, but devs can up it if they need to jump in and add breakpoints.
BaseService.prototype.waitedLongEnough = false;
/**
 * Delays startup based on information passed in from the serviceManager.  The delay value come from config setting: debugServiceDelay
 * @private
 */
BaseService.prototype.delayStartup = function (done) {
	// It takes a few seconds for the developers tools to show up. We can easily
	// pass by startup breakpoints in this interim, so we stall for 10 seconds
	// to give the dev tools enough time to materialize, and maybe just enough
	// time for the developer to slide a breakpoint into place!
	var self = this;
	Logger.system.debug("BaseService.start.delayStartup");
	fin.desktop.Window.getCurrent().isShowing(isShowing => {
		Logger.system.log("showDevConsoleOnVisible", self.customData.showDevConsoleOnVisible);
		Logger.system.log("isShowing", isShowing);
		if (isShowing && self.customData.showDevConsoleOnVisible) {
			fin.desktop.System.showDeveloperTools(fin.desktop.Application.getCurrent().uuid, fin.desktop.Window.getCurrent().name, function () {
				let timeoutDuration = self.customData.debugServiceDelay || 0;
				if (timeoutDuration > 0) {
					Logger.system.log('========>DELAYING STARTUP BY ' + timeoutDuration + ' Milliseconds<========');
					setTimeout(done, timeoutDuration);
				} else {
					done();
				}
			});
		} else {
			Logger.system.debug("BaseService.start.delayStartup done");
			done();
		}
	});
};

BaseService.prototype.listeners = {};

BaseService.prototype.addEventListener = function (listenerType, callback) {
	if (!this.listeners[listenerType]) {
		this.listeners[listenerType] = [];
	}
	this.listeners[listenerType].push(callback);
};

/**
 * A convenience function.
 */
BaseService.prototype.onShutdown = function (cb) {
	this.addEventListener('onShutdown', cb);
};

/**
 * When the application sends out a shutdown message, this function is invoked. It iterates through any registered cleanup methods. When all of them have finished (or 10 seconds elapses), it sends a response to the application saying that it's completed cleanup (`shutdownComplete`, below).
 * @private
*/
BaseService.prototype.handleShutdown = function (err, message) {
	var self = this;
	var numCallbacks = 0;
	var cleanupCompleted = 0;
	if (this.listeners.onShutdown) {
		this.RouterClient.transmit('Application.shutdownResponse', {
			waitForMe: true,
			name: this.name
		});

		numCallbacks = this.listeners.onShutdown.length;
		for (let i = 0; i < this.listeners.onShutdown.length; i++) {
			let cleanup = FSBLUtils.castToPromise(this.listeners.onShutdown[i]);
			cleanup().then(function () {
				Logger.system.log('Cleanup completed');
				cleanupCompleted++;
				checkCompletion();
			});
		}
	} else {
		this.RouterClient.transmit('Application.shutdownResponse', {
			waitForMe: false,
			name: this.name
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
 * Fired when all cleanup methods have been finished.
 * @private
*/
BaseService.prototype.shutdownComplete = function () {
	this.RouterClient.transmit('Application.shutdownCompleted', {
		name: this.name,
		uuid: fin.desktop.Application.getCurrent().uuid
	});
};

/**
 *
 * @private
 */
BaseService.prototype.listenForShutdown = function () {
	let self = this;
	this.RouterClient.addListener('Application.shutdownRequest', this.handleShutdown.bind(this));
};

BaseService.prototype.parentUuid = fin.desktop.Application.getCurrent().uuid;
/**
* Starts the service.
 * @private
*/
BaseService.prototype.start = function () {
	var service = this;

	// Wrap OF functions that have callbacks to insure all callbacks invoked;
	// since class/constructor, must wrap at prototype level (otherwise prototypes won't be picked up)
	wrapCallbacks(fin.desktop.Application.prototype);
	wrapCallbacks(fin.desktop.Window.prototype);
	wrapCallbacks(fin.desktop.System); // not a class so done pass in prototype

	service.setStartupTimer(); // if service doesn't start in allotted time then log error

	async.series([fin.desktop.main, cacheCustomData, init, onRouterReady, service.delayStartup.bind(service), service.getInitialActiveServices.bind(service), readyToGo]);

	function cacheCustomData(done) {
		Logger.system.debug('BaseService.start.setParentUUID');
		fin.desktop.Window.getCurrent().getOptions(opts => {
			BaseService.prototype.customData = opts.customData;
			done();
		});
	}

	function init(done) {
		BaseService.prototype.parentUuid = service.customData.parentUuid;
		Logger.system.debug('BaseService.start.init');
		service.waitedLongEnough = false;
		service.__parent = window.opener;
		done();
	}

	function onRouterReady(done) {
		service.RouterClient.ready(function () {
			Logger.system.debug('BaseService.start.onRouterReady');
			service.initializeListeners(service);
			done();
		});
	}

	function readyToGo(done) {
		Logger.system.debug('BaseService.start.readyToGo');
		console.log(performance.now(), 'ReadyToGo called');
		service.waitedLongEnough = true;
		RouterClient.transmit('Finsemble.ServiceManager.service-available.' + service.name, {});
		RouterClient.transmit(`${fin.desktop.Window.getCurrent().name}.onSpawned`, {});
		service.isReadyToSetOnline();
		done();
	};
};

module.exports = BaseService;

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\services\\baseService.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\services\\baseService.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 15 */
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

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5), __webpack_require__(0)))

/***/ }),
/* 16 */
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
__webpack_require__(15);
exports.setImmediate = setImmediate;
exports.clearImmediate = clearImmediate;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/



var Utils = __webpack_require__(2);
var Validate = __webpack_require__(3); // Finsemble args validator
var BaseClient = __webpack_require__(8);

var Logger = __webpack_require__(1);
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

		Validate.args(params, "object", callback, "function=") && Validate.args2("params.newConfig", params.newConfig, "object", "params.overwrite", params.overwrite, "boolean=", "params.replace", params.replace, "boolean=");

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

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\clients\\configClient.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\clients\\configClient.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

var BaseClient = __webpack_require__(8);
var util = __webpack_require__(2);
var Validate = __webpack_require__(3); // Finsemble args validator
var Logger = __webpack_require__(1);

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
		cb = cb || function noop() {}; // cb is optional but not for underlying query
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
		cb = cb || function noop() {}; // cb is optional but not for underlying query
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
		cb = cb || function noop() {}; // cb is optional but not for underlying query
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
		this.routerClient.query("WorkspaceService.getWorkspaces", null, function getWorkspacesCallback(err, response) {
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
		cb = cb || function noop() {}; // cb is optional but not for underlying query

		if (typeof (params.workspace !== undefined) && params.workspace === self.activeWorkspace) {
			cb("Error: Cannot remove active workspace " + self.activeWorkspace.name, null);
			Logger.system.debug("attempt to remove active workspace:" + self.activeWorkspace.name);
		} else if (typeof (params.name !== undefined) && params.name === self.activeWorkspace.name) {
			cb("Error: Cannot remove active workspace name " + self.activeWorkspace.name, null);
			Logger.system.debug("attempt to remove active workspace name:" + self.activeWorkspace.name);
		} else {
			// remove the inactive workspace
			var defaultParams = {
				persist: false,
				workspace: null,
				name: null
			};
			//sets defaults for undefined params.
			params.prototype = Object.create(defaultParams);
			this.routerClient.query("WorkspaceService.remove", params, function removeWorkspaceCallback(err, response) {
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
		cb = cb || function noop() {}; // cb is optional but not for underlying query
		this.routerClient.query("WorkspaceService.removeWindow", params, function removeWindowCallback(err, response) {
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
		cb = cb || function noop() {}; // cb is optional but not for underlying query
		if (!params.overwriteExisting && this.workspaceIsAlreadySaved(params.newName)) {
			cb(new Error("WorkspaceAlreadySaved"), params);
			return;
		}
		this.routerClient.query("WorkspaceService.rename", params, function renameWorkspaceCallback(err, response) {
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
		cb = cb || function noop() {}; // cb is optional but not for underlying query
		this.routerClient.query("WorkspaceService.clone", params, function cloneWorkspaceCallback(err, response) {
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
		cb = cb || function noop() {}; // cb is optional but not for underlying query
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
		cb = cb || function noop() {}; // cb is optional but not for underlying query

		if (!params.force && this.workspaceIsAlreadySaved(params.name)) {
			cb(new Error("WorkspaceAlreadySaved"), null);
			return;
		}
		this.routerClient.query("WorkspaceService.saveAs", params, function workspaceSaveAsCallback(err, response) {
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
				if (matches && typeof (matches[1] !== undefined) && modifier <= matches[1]) {
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

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\clients\\workspaceClient.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\clients\\workspaceClient.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 19 */,
/* 20 */,
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value)
		&& !isSpecial(value)
};

function isNonNullObject(value) {
	return !!value && typeof value === 'object'
}

function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);

	return stringValue === '[object RegExp]'
		|| stringValue === '[object Date]'
		|| isReactElement(value)
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE
}

function emptyTarget(val) {
    return Array.isArray(val) ? [] : {}
}

function cloneIfNecessary(value, optionsArgument) {
    var clone = optionsArgument && optionsArgument.clone === true;
    return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
}

function defaultArrayMerge(target, source, optionsArgument) {
    var destination = target.slice();
    source.forEach(function(e, i) {
        if (typeof destination[i] === 'undefined') {
            destination[i] = cloneIfNecessary(e, optionsArgument);
        } else if (isMergeableObject(e)) {
            destination[i] = deepmerge(target[i], e, optionsArgument);
        } else if (target.indexOf(e) === -1) {
            destination.push(cloneIfNecessary(e, optionsArgument));
        }
    });
    return destination
}

function mergeObject(target, source, optionsArgument) {
    var destination = {};
    if (isMergeableObject(target)) {
        Object.keys(target).forEach(function(key) {
            destination[key] = cloneIfNecessary(target[key], optionsArgument);
        });
    }
    Object.keys(source).forEach(function(key) {
        if (!isMergeableObject(source[key]) || !target[key]) {
            destination[key] = cloneIfNecessary(source[key], optionsArgument);
        } else {
            destination[key] = deepmerge(target[key], source[key], optionsArgument);
        }
    });
    return destination
}

function deepmerge(target, source, optionsArgument) {
    var sourceIsArray = Array.isArray(source);
    var targetIsArray = Array.isArray(target);
    var options = optionsArgument || { arrayMerge: defaultArrayMerge };
    var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

    if (!sourceAndTargetTypesMatch) {
        return cloneIfNecessary(source, optionsArgument)
    } else if (sourceIsArray) {
        var arrayMerge = options.arrayMerge || defaultArrayMerge;
        return arrayMerge(target, source, optionsArgument)
    } else {
        return mergeObject(target, source, optionsArgument)
    }
}

deepmerge.all = function deepmergeAll(array, optionsArgument) {
    if (!Array.isArray(array) || array.length < 2) {
        throw new Error('first argument should be an array with at least two elements')
    }

    // we are sure there are at least 2 values, so it is safe to have no initial value
    return array.reduce(function(prev, next) {
        return deepmerge(prev, next, optionsArgument)
    })
};

var deepmerge_1 = deepmerge;

module.exports = deepmerge_1;


/***/ }),
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var BaseClient = __webpack_require__(8);
var util = __webpack_require__(2);
var Validate = __webpack_require__(3); // Finsemble args validator
var WorkspaceClient = __webpack_require__(18);

var Logger = __webpack_require__(1);

Logger.perf.log("LauncherClientReadyTime", "start", "time it takes for the launcher client to become ready");

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
		if (!params) {
			params = {};
		}
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
		if (!params) {
			params = {};
		}
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
		Logger.perf.log("CallSpawn", "start", "from spawn to callback");
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
						Logger.perf.log("CallSpawn", "stop");
						invokeSpawnCallback(err, result);
					});
				} else {
					Logger.perf.log("CallSpawn", "stop");
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
		launcherClient.getMyWindowIdentifier(identifier => {
			launcherClient.myWindowIdentifier = identifier;
			if (cb) {
				cb();
			}
		});
	},
	name: "launcherClient"
});

module.exports = launcherClient;

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\clients\\launcherClient.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\clients\\launcherClient.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var Logger = __webpack_require__(1);

var BoxMath = {};
BoxMath.pointIsOnSegment = function (point, segment) {
	//y = mx + b;
	//Equation above transforms into this:
	//(y - y1)	 x - x1
	//-------- = --------
	//y2 - y1 	 x2 - x1

	//which is this:
	//(y - y1) * (x2 - x1) = (x - x1) * ( y2 - y1)
	var x = point.x,
	    y = point.y,
	    x1 = segment.min.x,
	    x2 = segment.max.x,
	    y1 = segment.min.y,
	    y2 = segment.max.y;

	var isInBounds = x >= x1 && x <= x2 && y >= y1 && y <= y2;
	//The equation above will tell us whether the point is on the line, assuming it has no start and end. This checks to see if the point is within the beginning and end of the segment. If not, it can't be on our segment.
	if (!isInBounds) {
		return false;
	}
	var isOnLine = (y - y1) * (x1 - x2) === (x - x1) * (y1 - y2);
	return isOnLine;
};

/**
	* @function {function name}
	* @param  {type} req {description}
	* @return {type} {description}
	*/
BoxMath.getVertices = function (req) {

	return [
	//top left
	{
		x: req.left,
		y: req.top,
		label: "topLeft"
	},
	//top right
	{
		x: req.right,
		y: req.top,
		label: "topRight"
	}, {
		x: req.right,
		y: req.bottom,
		label: "bottomRight"
	}, {
		x: req.left,
		y: req.bottom,
		label: "bottomLeft"
	}];
};
/**
* @function {function name}
* @param  {type} segment {description}
* @return {type} {description}
*/
BoxMath.getVertexOnSegment = function (segment) {

	for (vertex in this.vertices) {
		if (BoxMath.pointIsOnSegment(this.vertices[vertex], segment)) {
			return vertex;
		}
	}
	return false;
};

/**
		* @function {function name}
		* @param  {type} bounds     {description}
		* @param  {type} bufferSize {description}
		* @return {type} {description}
		*/
BoxMath.getSnappingRegions = function (bounds, bufferSize) {
	if (bufferSize === undefined) {
		bufferSize = 0;
		Logger.system.warn("NO buffer size provided to BoxMath.getSnappingRegions");
	}
	var buffer = {
		min: {
			x: bounds.left - bufferSize,
			y: bounds.top - bufferSize
		},
		max: {
			x: bounds.right + bufferSize,
			y: bounds.bottom + bufferSize
		}
	};

	return {
		topLeft: {
			min: {
				x: buffer.min.x,
				y: buffer.min.y
			},
			max: {
				x: bounds.left + bufferSize,
				y: bounds.top
			}
		},
		topRight: {
			min: {
				x: bounds.right - bufferSize,
				y: buffer.min.y
			},
			max: {
				x: buffer.max.x,
				y: bounds.top
			}
		},
		rightTop: {
			min: {
				x: bounds.right,
				y: bounds.top
			},
			max: {
				x: buffer.max.x,
				y: bounds.top + bufferSize
			}
		},
		rightBottom: {
			min: {
				x: bounds.right,
				y: bounds.bottom - bufferSize
			},
			max: {
				x: buffer.max.x,
				y: bounds.bottom
			}
		},

		bottomLeft: {
			min: {
				x: buffer.min.x,
				y: bounds.bottom
			},
			max: {
				x: bounds.left + bufferSize,
				y: buffer.max.y
			}
		},
		bottomRight: {
			min: {
				x: bounds.right - bufferSize,
				y: bounds.bottom
			},
			max: {
				x: buffer.max.x,
				y: buffer.max.y
			}
		},
		leftTop: {
			min: {
				x: buffer.min.x,
				y: bounds.top
			},
			max: {
				x: bounds.left,
				y: bounds.top + bufferSize
			}
		},
		leftBottom: {
			min: {
				x: buffer.min.x,
				y: bounds.bottom - bufferSize
			},
			max: {
				x: bounds.left,
				y: bounds.bottom
			}
		},
		left: {
			min: {
				x: buffer.min.x,
				y: bounds.top - bufferSize
			},
			max: {
				x: bounds.left + bufferSize,
				y: bounds.bottom + bufferSize
			}
		},
		bottom: {
			min: {
				x: bounds.left - bufferSize,
				y: bounds.bottom
			},
			max: {
				x: bounds.right + bufferSize,
				y: buffer.max.y
			}
		},
		right: {
			min: {
				x: bounds.right - bufferSize,
				y: bounds.top + bufferSize
			},
			max: {
				x: buffer.max.x,
				y: bounds.bottom + bufferSize
			}
		},
		top: {
			min: {
				x: bounds.left,
				y: buffer.min.y
			},
			max: {
				x: bounds.right,
				y: bounds.top
			}
		},
		inner: {
			min: {
				x: bounds.left,
				y: bounds.top
			},
			max: {
				x: bounds.right,
				y: bounds.bottom
			}
		}
	};
};

/**
	* @function {function name}
	* @param  {type} bounds {description}
	* @return {type} {description}
	*/
BoxMath.getWindowBoundingBox = function (bounds) {
	return {
		min: {
			x: bounds.left,
			y: bounds.top
		},
		max: {
			x: bounds.right,
			y: bounds.bottom
		}
	};
};

BoxMath.between = function (params) {
	var min = params.min,
	    max = params.max,
	    num = params.num,
	    inclusive = params.inclusive;
	if (inclusive) {
		return num >= min && num <= max;
	}
	return num > min && num < max;
};

/**
* @function {function name}
* @param  {type} window1 {description}
* @param  {type} window2 {description}
* @return {type} {description}
*/
BoxMath.intersectBoundingBoxes = function (window1, window2) {
	if (window1.max.x < window2.min.x) {
		return false;
	} // 1 is left of 2
	if (window1.min.x > window2.max.x) {
		return false;
	} // 1 is right of 2
	if (window1.max.y < window2.min.y) {
		return false;
	} // 1 is above 2
	if (window1.min.y > window2.max.y) {
		return false;
	} // 1 is below 2
	return true; // boxes overlap
};
/**
* @function {function name}
* @param  {type} num {description}
* @param  {type} pct {description}
* @return {type} {description}
*/
BoxMath.getPct = function (num, pct) {
	return pct * num;
};
/**
* @function {function name}
* @param  {type} num {description}
* @param  {type} pct {description}
* @return {type} {description}
*/
BoxMath.scaleProportionately = function (num, pct) {
	return Math.floor(num + this.getPct(num, pct));
};
/**
* @function {function name}
* @param  {type} num1 {description}
* @param  {type} num2 {description}
* @return {type} {description}
*/
BoxMath.getPercentChange = function (num1, num2) {
	var pctChange = Math.abs((num1 - num2) / num1);
	if (num2 < num1) {
		pctChange = -pctChange;
	}
	return pctChange;
};
module.exports = BoxMath;

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\services\\docking\\boxMath.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\services\\docking\\boxMath.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, module) {/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
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

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

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

/**
 * Adds the key-value `pair` to `map`.
 *
 * @private
 * @param {Object} map The map to modify.
 * @param {Array} pair The key-value pair to add.
 * @returns {Object} Returns `map`.
 */
function addMapEntry(map, pair) {
  // Don't return `map.set` because it's not chainable in IE 11.
  map.set(pair[0], pair[1]);
  return map;
}

/**
 * Adds `value` to `set`.
 *
 * @private
 * @param {Object} set The set to modify.
 * @param {*} value The value to add.
 * @returns {Object} Returns `set`.
 */
function addSetEntry(set, value) {
  // Don't return `set.add` because it's not chainable in IE 11.
  set.add(value);
  return set;
}

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
      length = array ? array.length : 0;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
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
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array ? array.length : 0;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
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
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
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

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    getPrototype = overArg(Object.getPrototypeOf, Object),
    objectCreate = Object.create,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice;

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
      length = entries ? entries.length : 0;

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
  return this.has(key) && delete this.__data__[key];
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
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
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
      length = entries ? entries.length : 0;

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
      length = entries ? entries.length : 0;

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
  return getMapData(this, key)['delete'](key);
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
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
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
  return this.__data__['delete'](key);
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
  var cache = this.__data__;
  if (cache instanceof ListCache) {
    var pairs = cache.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new MapCache(pairs);
  }
  cache.set(key, value);
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
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    object[key] = value;
  }
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
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @param {boolean} [isFull] Specify a clone including symbols.
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
  var result;
  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      if (isHostObject(value)) {
        return object ? value : {};
      }
      result = initCloneObject(isFunc ? {} : value);
      if (!isDeep) {
        return copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, baseClone, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (!isArr) {
    var props = isFull ? getAllKeys(value) : keys(value);
  }
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
  });
  return result;
}

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(proto) {
  return isObject(proto) ? objectCreate(proto) : {};
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
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
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
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
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
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var result = new buffer.constructor(buffer.length);
  buffer.copy(result);
  return result;
}

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

/**
 * Creates a clone of `map`.
 *
 * @private
 * @param {Object} map The map to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned map.
 */
function cloneMap(map, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
  return arrayReduce(array, addMapEntry, new map.constructor);
}

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

/**
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function cloneSet(set, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
  return arrayReduce(array, addSetEntry, new set.constructor);
}

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

/**
 * Copies own symbol properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
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
 * Creates an array of the own enumerable symbol properties of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

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
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, cloneFunc, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return cloneMap(object, isDeep, cloneFunc);

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return cloneSet(object, isDeep, cloneFunc);

    case symbolTag:
      return cloneSymbol(object);
  }
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
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
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
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return baseClone(value, true, true);
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
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

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
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
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
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
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
  return !!value && (type == 'object' || type == 'function');
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
  return !!value && typeof value == 'object';
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

module.exports = cloneDeep;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5), __webpack_require__(12)(module)))

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {
module.exports = {

	EDGES: ["top", "left", "bottom", "right"],
	CORNERS: ["topLeft", "topRight", "bottomLeft", "bottomRight"],
	MINIMUM_HEIGHT: 32,
	MINIMUM_WIDTH: 98,
	OPPOSITE_EDGE_MAP: {
		left: "right",
		right: "left",
		top: "bottom",
		bottom: "top",
		topLeft: "bottomRight",
		topRight: "bottomLeft",
		bottomLeft: "topRight",
		bottomRight: "topLeft"
	},
	SPLIT_HANDLE_MAP: {
		bottomLeft: ["bottom", "left"],
		bottomRight: ["bottom", "right"],
		leftBottom: ["left", "bottom"],
		rightBottom: ["right", "bottom"],
		topRight: ["top", "right"],
		topLeft: ["top", "left"],
		rightTop: ["right", "top"],
		leftTop: ["left", "top"],
		left: ["left"],
		right: ["right"],
		top: ["top"],
		bottom: ["bottom"]
	}
};

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\services\\docking\\constants.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\services\\docking\\constants.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var BoxMath = __webpack_require__(28);
function DockableBox() {
	/**
 * @function {function name}
 * @param  {type} format         {description}
 * @param  {type} includeCorners {description}
 * @return {type} {description}
 */
	this.getEdges = function (format, includeCorners) {
		if (includeCorners === undefined || includeCorners === true) {
			includeCorners = 0;
		} else {
			includeCorners = 1;
		}

		var top = {
			min: {
				x: this.left + includeCorners,
				y: this.top
			},
			max: {
				x: this.right - includeCorners,
				y: this.top
			}
		};
		var left = {
			min: {
				x: this.left,
				y: this.top + includeCorners
			},
			max: {
				x: this.left,
				y: this.bottom - includeCorners
			}
		};
		var right = {
			min: {
				x: this.right,
				y: this.top + includeCorners
			},
			max: {
				x: this.right,
				y: this.bottom - includeCorners
			}
		};
		var bottom = {
			min: {
				x: this.left + includeCorners,
				y: this.bottom
			},
			max: {
				x: this.right - includeCorners,
				y: this.bottom
			}
		};

		if (format === "obj") {
			return {
				top: top,
				right: right,
				bottom: bottom,
				left: left
			};
		}
		return [top, right, bottom, left];
	};
	this.getCorners = function () {
		return this.getCornerObject(this.getBounds());
	};

	/**
 * @function {function name}
 * @param  {type} point          {description}
 * @param  {type} includeCorners {description}
 * @return {type} {description}
 */
	this.pointIsOnBoundingBox = function (point, includeCorners) {
		//If it's on the top or bottom edge.
		var edges = this.getEdges("arr", includeCorners);

		for (var i = 0; i < edges.length; i++) {
			var segment = edges[i];
			if (BoxMath.pointIsOnSegment(point, segment)) {
				return true;
			}
		}
		return false;
	};

	/**
 * @function {function name}
 * @param  {type} corner {description}
 * @return {type} {description}
 */
	this.getPointByVertex = function (corner) {

		corner = corner.toLowerCase();
		var point = {
			x: this.left,
			y: this.top
		};
		if (corner.includes("bottom")) {
			point.y = this.bottom;
		}
		if (corner.includes("right")) {
			point.x = this.right;
		}
		return point;
	};

	/**
 * @function {function name}
 * @param  {type} point     {description}
 * @param  {type} tolerance {description}
 * @return {type} {description}
 */
	this.getEdgeByPoint = function (point, tolerance) {
		var edges = this.getEdges("obj");

		for (var edge in edges) {
			if (BoxMath.pointIsOnSegment(point, edges[edge])) {
				return edge;
			}
		}
		return false;
	};
	/**
 * @function {function name}
 * @param  {type} point     {description}
 * @param  {type} tolerance {description}
 * @return {type} {description}
 */
	this.getVertexByPoint = function (point, tolerance) {
		if (tolerance === undefined) {
			tolerance = 0;
		}
		var corner = null,
		    justAnEdge = true;
		if (point.y <= this.windowBoundingBox.max.y + tolerance && point.y >= this.windowBoundingBox.max.y - tolerance) {
			corner = "bottom";
		}
		if (point.y <= this.windowBoundingBox.min.y + tolerance && point.y >= this.windowBoundingBox.min.y - tolerance) {
			corner = "top";
		}

		if (!corner) {
			return corner;
		}

		if (point.x <= this.windowBoundingBox.min.x + tolerance && point.x >= this.windowBoundingBox.min.x - tolerance) {
			justAnEdge = false;
			corner += "Left";
		}

		if (point.x <= this.windowBoundingBox.max.x + tolerance && point.x >= this.windowBoundingBox.max.x - tolerance) {
			justAnEdge = false;
			corner += "Right";
		}
		if (justAnEdge) {
			return null;
		}
		return corner;
	};
	/**
 * @function {function name}
 * @param  {type} win2 {description}
 * @return {type} {description}
 */
	this.getSharedEdges = function (win2, tolerance) {
		if (!tolerance) {
			tolerance = 0;
		}
		//from perspective of stationary window;
		var sharedEdges = {
			top: false,
			left: false,
			right: false,
			bottom: false
		};
		if (!BoxMath.intersectBoundingBoxes(this.buffer, win2.windowBoundingBox)) {
			return sharedEdges;
		}
		var inRightTolerance = BoxMath.between({
			num: win2.right,
			min: this.left - tolerance,
			max: this.left + tolerance,
			inclusive: true
		});
		var inLeftTolerance = BoxMath.between({
			num: win2.left,
			min: this.right - tolerance,
			max: this.right + tolerance,
			inclusive: true
		});
		var inTopTolerance = BoxMath.between({
			num: win2.top,
			min: this.bottom - tolerance,
			max: this.bottom + tolerance,
			inclusive: true
		});
		var inBottomTolerance = BoxMath.between({
			num: win2.bottom,
			min: this.top - tolerance,
			max: this.top + tolerance,
			inclusive: true
		});

		if (inRightTolerance) {
			if (win2.bottom > this.top - tolerance && win2.top < this.bottom + tolerance) {
				sharedEdges.left = true;
			}
		}
		if (inLeftTolerance) {
			//if(600 > 0 && 300 < 300)
			if (win2.bottom > this.top - tolerance && win2.top < this.bottom + tolerance) {
				sharedEdges.right = true;
			}
		}

		if (inBottomTolerance) {
			if (win2.left < this.right + tolerance && win2.right > this.left - tolerance) {
				sharedEdges.top = true;
			}
		}

		if (inTopTolerance) {
			if (win2.left < this.right + tolerance && win2.right > this.left - tolerance) {
				sharedEdges.bottom = true;
			}
		}

		return sharedEdges;
	};
	/**
 * @function {function name}
 * @param  {type} win2 {description}
 * @return {type} {description}
 */
	this.getSharedCorners = function (win2) {
		var sharedCorners = {
			topLeft: false,
			topRight: false,
			bottomLeft: false,
			bottomRight: false,

			//distinction is in the placement. a window placed to the side and top aligned would share the rightTop corner, but not the topRight
			rightTop: false,
			rightBottom: false,
			leftTop: false,
			leftBottom: false
		};

		let intersection = !BoxMath.intersectBoundingBoxes(this.innerBuffer, win2.windowBoundingBox) && BoxMath.intersectBoundingBoxes(this.buffer, win2.windowBoundingBox);
		if (!intersection) {
			return sharedCorners;
		}
		let myCorners = BoxMath.getVertices(this.getBounds());
		let theirCorners = BoxMath.getVertices(win2);
		myCorners.forEach(corner => {
			for (var i = 0; i < theirCorners.length; i++) {
				var theirCorner = theirCorners[i];
				if (corner.x === theirCorner.x && corner.y === theirCorner.y) {
					sharedCorners[corner.label] = true;
				}
			}
		});
		var sharedEdges = {
			bottom: this.bottom === win2.bottom || this.bottom === win2.top,
			top: this.top === win2.top || this.top === win2.bottom,
			right: this.right === win2.left || this.right === win2.right,
			left: this.left === win2.right || this.left === win2.left
		};
		var sideTop = false,
		    sideBottom = false;
		if (this.top === win2.top) {
			sideTop = true;
		}
		if (this.bottom === win2.bottom) {
			sideBottom = true;
		}
		if (sharedEdges.right) {
			if (sideTop) {
				sharedCorners.rightTop = true;
			}
			if (sideBottom) {
				sharedCorners.rightBottom = true;
			}
		}

		if (sharedEdges.left) {
			if (sideBottom) {
				sharedCorners.leftBottom = true;
			}
			if (sideTop) {
				sharedCorners.leftTop = true;
			}
		}

		return sharedCorners;
	};
	/**
 * @function {function name}
 * @return {type} {description}
 */
	this.getBounds = function () {
		return {
			left: this.left,
			right: this.right,
			top: this.top,
			bottom: this.bottom,
			width: this.width,
			height: this.height
		};
	};

	/**
 * @function {function name}
 * @param  {type} req {description}
 * @return {type} {description}
 */
	this.getCornerObject = function (req) {
		var corners = {};
		BoxMath.getVertices(req).forEach(corner => {
			corners[corner.label] = corner;
		});
		return corners;
	};
	/**
 * @function {function name}
 * @param  {type} request {description}
 * @return {type} {description}
 */
	this.getResizeHandle = function (request) {
		if (this.resizeHandle) {
			return this.resizeHandle;
		}
		var resizeHandle;
		if (request.changeType !== 0 && request.mousePosition) {
			resizeHandle = this.getVertexByPoint(request.mousePosition, 15);
			if (!resizeHandle) {
				resizeHandle = this.getGrabbedEdge(request.mousePosition);
			}
		}

		if (!resizeHandle) {
			if (request.top !== this.top) {
				resizeHandle = "top";
				if (request.right !== this.right) {
					resizeHandle = "topRight";
				} else if (request.left !== this.left) {
					resizeHandle = "topLeft";
				}
			} else if (request.right !== this.right) {
				resizeHandle = "right";
				if (request.bottom !== this.bottom) {
					resizeHandle = "bottomRight";
				} else if (request.top !== this.top) {
					resizeHandle = "topRight";
				}
			} else if (request.bottom !== this.bottom) {
				resizeHandle = "bottom";

				if (request.left !== this.left) {
					resizeHandle = "bottomLeft";
				} else if (request.right !== this.right) {
					resizeHandle = "bottomRight";
				}
			} else if (request.left !== this.left) {
				resizeHandle = "left";
				if (request.top !== this.top) {
					resizeHandle = "topLeft";
				} else if (request.bottom !== this.bottom) {
					resizeHandle = "bottomLeft";
				}
			}
		}

		if (resizeHandle && request.changeType !== 0) {
			//if we didn't find a resizeHandle, then no edges moved. Send last handle.
			this.resizeHandle = resizeHandle;
		}
		return resizeHandle;
	};
	/**
 * @function {function name}
 * @param  {type} bufferSize {description}
 * @return {type} {description}
 */
	this.setBuffer = function (bufferSize) {
		if (bufferSize === undefined && this.bufferSize === null) {
			return;
		} else if (bufferSize !== undefined) {
			this.bufferSize = bufferSize;
		}

		this.buffer = {
			min: {
				x: this.left - this.bufferSize,
				y: this.top - this.bufferSize
			},
			max: {
				x: this.right + this.bufferSize,
				y: this.bottom + this.bufferSize
			}
		};
	};
	this.sharesACornerWith = function (win) {
		var sharedCorners = this.getSharedCorners(win);
		var corners = ["topLeft", "topRight", "rightTop", "leftTop", "bottomRight", "bottomLeft", "rightBottom", "leftBottom"];
		for (var i = 0; i < corners.length; i++) {
			var corner = corners[i];
			if (sharedCorners[corner]) {
				return true;
			}
		}
		return false;
	};
	/**
 * @function {function name}
 * @param  {type} win {description}
 * @return {type} {description}
 */
	this.sharesAnEdgeWith = function (win) {
		var sharedEdges = this.getSharedEdges(win);

		var edges = ["top", "right", "left", "bottom"];
		for (var i = 0; i < edges.length; i++) {
			var edge = edges[i];
			if (sharedEdges[edge]) {
				return true;
			}
		}
		return false;
	};
	/**
 * @function {function name}
 * @param  {type} request {description}
 * @return {type} {description}
 */
	this.canSnapToWindow = function (request) {
		return this.sharesAnEdgeWith(request) || !BoxMath.intersectBoundingBoxes(this.innerBuffer, request.windowBoundingBox) && BoxMath.intersectBoundingBoxes(this.buffer, request.windowBoundingBox);
	};
	return this;
}
module.exports = new DockableBox();

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\services\\docking\\dockableBox.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\services\\docking\\dockableBox.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {//replace with import when ready
var baseService = __webpack_require__(14);
var util = __webpack_require__(2);
var DockingCalculator = __webpack_require__(55);
var OpenfinWindowWrapper = __webpack_require__(57);
var ExternalWindowWrapper = __webpack_require__(56);
var DockableWindow = __webpack_require__(54);
var serviceConfig = {};
var LauncherClient = __webpack_require__(27);
LauncherClient.initialize();
var ConfigClient = __webpack_require__(17);
ConfigClient.initialize();
var groupData = {};
var DOCKINGSERVICE_AUTO_ARRANGE_CHANNEL = "DockingService.AutoarrangeStatus";

var Logger = __webpack_require__(1);

Logger.system.log("Starting Docking Service");

const merge = __webpack_require__(21);
const clone = function (obj) {
	return merge({}, obj);
};
const async = __webpack_require__(7);
/**
 * The docking Service is great.
 * @constructor
 */
function dockingService() {
	/** @alias dockingService# */

	var self = this;
	this.AutoArrange = {};
	this.AutoArrange.isArranged = false;
	//for reverting autoarrange
	this.cachedPositions = {};
	this.handleHIKeyDown = function (err, response) {
		//doesn't actually send a key yet.
		if (true) {
			DockingCalculator.setShift(true);
		}
	};
	this.handleHIKeyUp = function (err, response) {
		DockingCalculator.setShift(false);
	};
	/**
  * Creates router endpoints for all of our client APIs. Add servers or listeners for requests coming from your clients.
  * @private
  */
	this.createRouterEndpoints = function () {
		this.dockableWindows = {};
		RouterClient.addPubSubResponder("humanInterface.keydown", {});
		RouterClient.addPubSubResponder("humanInterface.keyup", {});
		RouterClient.subscribe("Finsemble.WorkspaceService.update", function (err, response) {
			if (response.data.reason === "workspace:load") {
				self.handleWorkspaceUpdate(err, response);
			}
		});

		RouterClient.subscribe("humanInterface.keydown", this.handleHIKeyDown.bind(this));
		RouterClient.subscribe("humanInterface.keyup", this.handleHIKeyUp.bind(this));
		RouterClient.addResponder("register-docking-window", function (err, message) {
			var data = message.data;
			//prevent a second registration from being made for an individual window.
			var windowWrap = {};
			if (data.type === "openfin") {
				windowWrap = new OpenfinWindowWrapper(data.uuid, data.name);
				if (message.options && message.options.canGroup === false) {
					self.addToGroupBlacklist(data.name);
				}
			} else {
				windowWrap = new ExternalWindowWrapper(data.params);
			}
			self.addWindow(windowWrap).then(function () {
				self.checkIfWindowIsInGroup(data.name);
				message.sendQueryResponse(null, {
					status: "finished"
				});
			});
		});

		/**
   * Not sure we'll need this any more since we have the wrappers. Leaving in until we can clarify.
   */
		RouterClient.addPubSubResponder(/WindowMove.*/, {});
		RouterClient.addPubSubResponder("DockingService.groupUpdate", {});

		RouterClient.subscribe("WindowMove", (err, response) => {
			if (Object.keys(response.data).length) {
				if (!DockingCalculator.getWindow(response.name)) {
					return;
				}
				var moveRequest = response.data;
				DockingCalculator.setMovingWindow(DockingCalculator.dockableWindows[request.name]);
				DockingCalculator.onWindowMove(moveRequest);
			}
		});

		/**
   * When groupMode changes in a toolbar (or any component), it uses PubSub to publish a state change.
   */
		RouterClient.addPubSubResponder("DockingService.groupMode", {});

		RouterClient.subscribe("WindowMoved", (err, response) => {
			//this.onMouseUp();
		});
		RouterClient.subscribe("monitorInfo", function (err, response) {
			self.updateMonitorInfo(response.data);
		});
		RouterClient.addResponder("DockingService.getGroupMode", function (err, message) {
			message.sendQueryResponse(null, self.getGroupMode());
		});

		RouterClient.addResponder("DockingService.getBounds", function (err, message) {
			self.getBounds(message.data, function (err, bounds) {
				message.sendQueryResponse(err, bounds);
			});
		});

		RouterClient.addListener("DockingService.toggleGroupMode", function (err, message) {
			var groupMode = self.getGroupMode();
			groupMode.enabled = !groupMode.enabled;
			self.setGroupMode(groupMode);
		});

		/**
   * Auto-arrange doesn't throw disable-frame-bounds-changed events, since it uses `setBounds` under the hood. So this will just go through the windows and update their positions.
   */
		RouterClient.addListener("DockingService.updateWindowPositions", function (err, response) {
			DockingCalculator.updateWindowPositions();
		});
		RouterClient.addListener("DockingService.formGroup", function (err, response) {
			DockingCalculator.formGroup(response.data.windowName, true);
			if (self.AutoArrange.isArranged) {
				// reset auto arrange if we're grouping while arranged
				self.AutoArrange.isArranged = false;
				self.cachedPositions = {};
				self.sendAutoArrangeStatusUpdate();
			}

			self.updateGroupData();
			self.publishGroupUpdate();
		});
		/**
   * Called from the launcherCLient after `spawn` is invoked. Will group two or more windows.
   */
		RouterClient.addResponder("DockingService.groupWindows", function (err, message) {
			DockingCalculator.groupWindows(message.data, function (err) {
				self.updateGroupData();
				self.publishGroupUpdate();
				message.sendQueryResponse({
					err: err,
					status: err ? "failed" : "success"
				});
			});
		});
		function removeWindowFromGroup(data, groupName) {
			let group = DockingCalculator.getGroup(groupName);
			//this is called when someone clicks the ungroup button and when the window is closed. window may not be part of a group.
			if (group) {
				DockingCalculator.removeWindowFromGroup(data.name, group.name);
				let groupIter = DockingCalculator.groupWindowIterator(group);
				for (let win of groupIter) {
					let windowsInGroup = DockingCalculator.formGroup(win.name, group.isMovable, group.getWindowNames());
					if (!windowsInGroup.length) {
						DockingCalculator.removeWindowFromGroup(win.name, group.name);
					}
				}
			}

			if (self.AutoArrange.isArranged) {
				self.AutoArrange.isArranged = false;
				self.cachedPositions = {};
				self.sendAutoArrangeStatusUpdate();
			}

			self.updateGroupData();
			self.publishGroupUpdate();
		}
		RouterClient.addResponder("DockingService.leaveGroup", function (err, response) {
			let movableGroup = DockingCalculator.getMovableGroup(response.data.name);
			removeWindowFromGroup(response.data, movableGroup.name);

			var groups = DockingCalculator.getGroups();
			var groupList = {};
			for (let group in groups) {
				groupList[group] = groups[group].getWindowNames();
			}
			response.sendQueryResponse(null, groupList);
		});

		RouterClient.addListener("DockingService.joinGroup", function (err, response) {
			self.addWindowToGroup({
				groupName: response.data.groupName,
				win: DockingCalculator.getWindow(response.data.name)
			});
		});

		/**
   * PassThroughs
   */
		RouterClient.addListener("deregister-docking-window", function (err, response) {
			let win = DockingCalculator.getWindow(response.data.name);
			if (win.groupNames.length) {
				let movableGroup = DockingCalculator.getMovableGroup(win.name);
				let immobileGroup = DockingCalculator.getImmobileGroup(win.name);
				if (movableGroup) {
					removeWindowFromGroup(response.data, movableGroup.name);
				}
				if (immobileGroup) {
					removeWindowFromGroup(response.data, immobileGroup.name);
				}
			}
			self.removeWindow(response.data.name);
			self.updateGroupData();
			self.publishGroupUpdate();
			//will handle any group updates that need to be sent.
			if (DockingCalculator.onMoveComplete && response.data.userInitiated === true) {
				DockingCalculator.onMoveComplete();
			}
		});

		RouterClient.addResponder("DockingService.maximizeWindow", function (err, message) {
			self.maximizeWindow(message.data, function (bounds) {
				self.sendQueryResponse(message, bounds);
			});
		});

		RouterClient.addResponder("DockingService.restoreFromMaximize", function (err, message) {
			if (DockingCalculator.getWindow(message.data.name)) {
				self.restoreFromMaximize(message.data, function () {
					self.sendQueryResponse(message);
				});
			} else {
				message.sendQueryResponse("Window not registered with the DockingService.", null);
			}
		});

		RouterClient.addListener("DockingService.constituteGroups", function () {
			self.constituteGroups();
		});

		RouterClient.addResponder("DockingService.autoArrange", function (err, message) {
			if (!message.data.monitorDimensions) {
				message.sendQueryResponse(new Error("No monitor dimensions passed to autoArrange"), null);
				return;
			}
			self.AutoArrange.arrange(message.data.monitorDimensions, function () {
				self.updateGroupData();
				self.publishGroupUpdate();
			});
		});
		RouterClient.addPubSubResponder(DOCKINGSERVICE_AUTO_ARRANGE_CHANNEL, {});
	};
	this.sendQueryResponse = function (message, data) {
		message.sendQueryResponse(null, data);
	};
	this.updateMonitorInfo = function (monitorUpdate) {
		DockingCalculator.removeAllMonitors();
		monitorUpdate.forEach(function (monitor) {
			self.addMonitor({
				name: monitor.name,
				left: monitor.unclaimedRect.left,
				top: monitor.unclaimedRect.top,
				right: monitor.unclaimedRect.right,
				bottom: monitor.unclaimedRect.bottom
			});
		});
		DockingCalculator.updateMonitorInfo(monitorUpdate);
		DockingCalculator.setBufferSize(serviceConfig.BUFFER_SIZE);
	};
	/**
  * This function will maximize a window.
  * @param {object} params
  * @param {object} params.windowIdentifier
  * @param {string} params.name
  */

	this.maximizeWindow = function (params, cb) {
		var win = DockingCalculator.getWindow(params.name);
		win.bringToFront();
		win.cachedBounds = clone(win.getBounds());
		LauncherClient.getMonitorInfo(params, function (err, response) {
			var monitorDimensions = response.unclaimedRect;
			win.setBounds(monitorDimensions, function () {
				win.isMaximized = true;
				if (cb) {
					cb(monitorDimensions);
				}
			}, function (err) {
				Logger.system.error(err);
			});
		});
	};
	/**
  * This function will restore a maximized window.
  * @param {object} params
  * @param {string} params.name
  */
	this.restoreFromMaximize = function (params, cb) {
		var win = DockingCalculator.getWindow(params.name);
		win.isMaximized = false;
		let bounds = win.cachedBounds || win.getBounds();
		win.setBounds(bounds, function () {
			win.cachedBounds = {};
			if (cb) {
				cb();
			}
		}, function (err) {
			Logger.system.error(err);
		});
	};
	/**
  * Function that's called after a window is moved.
  */

	/**
 * Registers a window with the DockingCalculator.
 * @param  {dockableWindow} win
 * @return {Promise}
 */
	this.addWindow = function (win) {
		//If a window reloads, it may try to add itself to the dockingCalc twice.
		if (DockingCalculator.getWindow(win.name)) {
			return Promise.resolve(DockingCalculator.getWindow(win.name));
		}
		return new Promise(function (resolve, reject) {

			win.getBounds(bounds => {
				//@todo, why not get bounds inside of the constructor? Would at least get rid of one param.
				let dockableWindow = new DockableWindow(win, bounds, DockingCalculator);
				//@todo, why not get the name from the dockableWindow?
				DockingCalculator.addWindow(win.name, dockableWindow);
				resolve(dockableWindow);
			});
		});
	};

	this.createGroupMask = function () {
		LauncherClient.spawn("Docking Move Mask", {
			name: "groupMask"
		}, function (err, response) {
			let groupMask = response.finWindow;
			groupMask.getBounds(bounds => {
				var groupMaskWrapper = new OpenfinWindowWrapper(groupMask.uuid, "groupMask");
				var mask = new DockableWindow(groupMaskWrapper, bounds, DockingCalculator);
				mask.canGroup = false;
				DockingCalculator.setGroupMask(mask);
			}, function (err) {});
		});
	};

	/************************************************
  *												*
  * 		Pass Throughs to the DockingCalculator	*
  *												*
  ************************************************/

	/**
  * Used for toolbars. Or anything in the future.
  */
	this.addToGroupBlacklist = function (windowName) {
		DockingCalculator.addToGroupBlacklist(windowName);
	};
	/**
  * @todo remove? Think I just put this in for testing.
  */
	this.eliminateGaps = function () {
		DockingCalculator.eliminateGaps();
	};

	/**
 * @function {function name}
 * @param  {type} windowName {description}
 * @return {type} {description}
 */
	this.getWindow = function (windowName) {
		return DockingCalculator.getWindow(windowName);
	};

	/**
 * @function {function name}
 */
	this.getWindows = function () {
		return DockingCalculator.getWindows();
	};
	/**
 * @function {function name}
 * @param  {type} windowName {description}
 * @return {type} {description}
 */
	this.removeWindow = function (windowName) {
		DockingCalculator.removeWindow(windowName);
		if (this.cachedPositions[windowName]) {
			delete this.cachedPositions[windowName];
		}
	};
	/**
 * @function {function name}
 * @param  {type} request {description}
 * @return {type} {description}
 */
	this.requestMove = function (request) {
		DockingCalculator.requestMove(request);
	};
	/**
 * @function {function name}
 * @return {type} {description}
 */
	this.getDiagnostics = function () {
		return DockingCalculator.getDiagnostics();
	};
	this.setAllowGroupsToSnap = function (bool) {
		DockingCalculator.setAllowGroupsToSnap(bool);
	};
	/**
 *
 * @param  {int} number Size of the buffer for stationary windows. Controls how "magnetic" windows feel.
 * @return {type} {description}
 */
	this.setBufferSize = function (number) {
		DockingCalculator.setBufferSize(number);
	};
	this.setResizeThrottlePeriod = function (throttlePeriod) {
		DockingCalculator.setResizeThrottlePeriod(throttlePeriod);
	};
	this.setSnappingOpacity = function (opacity) {
		DockingCalculator.setSnappingOpacity(opacity);
	};
	/**
  * Sets the initial buffersize.
  */
	this.setupDockingCalculator = function () {
		this.setAllowGroupsToSnap(serviceConfig.ALLOW_GROUPS_TO_SNAP);
		this.setGroupMode(serviceConfig.GROUP_MODE);
		this.setBufferSize(serviceConfig.BUFFER_SIZE);
		this.setSnappingOpacity(serviceConfig.SNAPPING_OPACITY);
		this.setResizeThrottlePeriod(serviceConfig.RESIZE_EVENT_THROTTLE_PERIOD);
		DockingCalculator.setGlobalMinimums(serviceConfig);
	};

	this.addMonitor = function (monitor) {
		DockingCalculator.addMonitor(monitor);
	};

	this.removeMonitor = function (monitor) {
		DockingCalculator.removeMonitor(monitor);
	};

	this.getMonitors = function () {
		return DockingCalculator.getMonitors();
	};

	this.getGroups = function () {
		return DockingCalculator.getGroups();
	};

	this.removeGroup = function (name) {
		return DockingCalculator.removeGroup(name);
	};

	this.addWindowToGroup = function (params, cb) {
		DockingCalculator.addWindowToGroup(params, cb);
	};

	this.getGroupNames = function () {
		return DockingCalculator.getGroupNames();
	};

	this.getGroupMode = function () {
		return DockingCalculator.getGroupMode();
	};

	this.setGroupMode = function (groupMode) {
		DockingCalculator.setGroupMode(groupMode);
		RouterClient.publish("DockingService.groupMode", groupMode);
	};
	this.getGroup = function (name) {
		return DockingCalculator.getGroup(name);
	};

	/************************************************
  *												*
  * 				Debugging Helpers				*
  *												*
  ************************************************/
	/**
 * For debugging.
 * @function {function name}
 * @return {type} {description}
 */
	this.getGridWindows = function () {
		["A", "B", "C", "D", "E", "F", "G", "H", "I"].forEach(windowName => {
			window[windowName + windowName] = DockingCalculator.getWindow(windowName);
		});
	};
	/**
 * @function {function name}
 * @return {type} {description}
 */
	this.resetGrid = function () {
		var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		//creates a 3x3 grid
		var row = 0;
		var column = 0;
		var group1;
		for (var i = 0; i < 9; i++) {
			var windowName = alphabet[i];

			win = DockingCalculator.getWindow(windowName);
			if (!group1) {
				group1 = DockingCalculator.getGroup(win.groupName);
			}
			if (i > 1 && i % 3 === 0) {
				row++;
				column = 0;
			}
			win.setBounds({
				left: 300 * column,
				top: 300 * row,
				width: 300,
				height: 300
			});
			group1.updateWindow(global[windowName]);
			column++;
		}
		group1.calculateOuterBounds();
	};
	/**
 * @function {function name}
 * @return {type} {description}
 */
	this.logger = function () {
		var boundingBoxes = {};
		for (var windowName in this.getWindows()) {
			var win = this.getWindow(windowName);
			boundingBoxes[windowName] = JSON.stringify(win.windowBoundingBox);
		}
		var box = "";
		box += "+----------------------------------------+\n";
		box += "|             |             |            |\n";
		box += "|   " + boundingBoxes["A"] + "          |    " + boundingBoxes["B"] + "         |   " + boundingBoxes["C"] + "         |\n";
		box += "|             |             |            |\n";
		box += "|             |             |            |\n";
		box += "+----------------------------------------+\n";
		box += "|             |             |            |\n";
		box += "|   " + boundingBoxes["D"] + "          |    " + boundingBoxes["E"] + "         |   " + boundingBoxes["F"] + "         |\n";
		box += "|             |             |            |\n";
		box += "|             |             |            |\n";
		box += "+----------------------------------------+\n";
		box += "|             |             |            |\n";
		box += "|   " + boundingBoxes["G"] + "          |    " + boundingBoxes["H"] + "         |   " + boundingBoxes["I"] + "         |\n";
		box += "|             |             |            |\n";
		box += "|             |             |            |\n";
		box += "+----------------------------------------+\n";
		Logger.system.log(box);
	};
	/**
  * Sends a message asking windows to save their position.
  */
	this.tellWindowsToSaveLocation = function () {
		let windowIter = DockingCalculator.windowPoolIterator();
		for (let win of windowIter) {
			RouterClient.transmit("DockingService." + win.name, { command: "saveWindowLocation", bounds: win.getBounds() });
		}
	};
	/**
  * Sends a message asking windows to update their position in memory but not save.
  */
	this.tellWindowsToUpdateLocation = function () {
		let windowIter = DockingCalculator.windowPoolIterator();
		for (let win of windowIter) {
			RouterClient.transmit("DockingService." + win.name, { command: "updateWindowLocation", bounds: win.getBounds() });
		}
	};

	DockingCalculator.onMoveComplete = function () {
		this.tellWindowsToSaveLocation();
		this.updateGroupData();
		this.publishGroupUpdate();
		if (this.AutoArrange.isArranged) {
			this.AutoArrange.isArranged = false;
			this.cachedPositions = {};
			this.sendAutoArrangeStatusUpdate();
		}
	}.bind(this);

	DockingCalculator.updateGroupData = function () {
		this.updateGroupData();
		this.publishGroupUpdate();
	}.bind(this);
	/**
  * Updates the groupData object, which is pushed out to components.
  */
	this.updateGroupData = function () {
		let groups = DockingCalculator.getGroups();
		let groupUpdate = {};
		for (var groupName in groups) {
			groupUpdate[groupName] = {
				windowNames: groups[groupName].getWindowNames(),
				isMovable: groups[groupName].isMovable
			};
		}
		groupData = groupUpdate;
	};
	/**
  * Sends the groupData object out to the rest of the application.
  */
	this.publishGroupUpdate = function () {
		RouterClient.publish("DockingService.groupUpdate", {
			groupData: groupData,
			workspaceName: self.activeWorkspace.name
		});
	};
	/**
  * @todo see if this is used...`formGroups` is probably what we need to use insteade.
  */
	this.constituteGroups = function () {
		return DockingCalculator.constituteGroups();
	};
	this.activeWorkspace = { name: "" };

	this.handleWorkspaceUpdate = function (err, response) {
		// Logger.system.log('HANDLING WORKSPACE UPDATE');
		var data = response.data;
		if (!data || !data.activeWorkspace) {
			return;
		}
		this.activeWorkspace = data.activeWorkspace;
		groupData = data.activeWorkspace.groups;
		self.publishGroupUpdate();
		DockingCalculator.moveCount = 0;
	};

	/**
  * Checks to see if a window belongs to any groups.
  */
	this.checkIfWindowIsInGroup = function (name) {
		if (groupData) {
			for (var groupName in groupData) {
				let groupWindows = groupData[groupName].windowNames;
				if (groupWindows.includes(name)) {
					DockingCalculator.addWindowToGroup({
						groupName: groupName,
						win: DockingCalculator.getWindow(name),
						isMovable: groupData[groupName].isMovable
					});
				}
			}
		}
	};
	/**
  * Sends the update to all toolbars.
  * @todo, this will eventually be monitor-specific.
  */
	this.sendAutoArrangeStatusUpdate = function () {
		RouterClient.publish(DOCKINGSERVICE_AUTO_ARRANGE_CHANNEL, {
			isAutoArranged: this.AutoArrange.isArranged
		});
	};
	/**
  *
  * For more, see {@link https://medium.com/@jtreitz/the-algorithm-for-a-perfectly-balanced-photo-gallery-914c94a5d8af#.c09v4fn1e}. This is a javascript port of a python solution to the linear partition problem.
  * @param {Array} aspectRatios An array of numbers; in this case, aspect ratios.
  * @param {Number} rows Number of rows to distribute aspectRatios across.
  * @returns {Array} ans Returns an array of arrays. Each internal array represents a row.
  * @private
  */
	this.AutoArrange.linearPartition = function (aspectRatios, rows) {
		var numWindows = aspectRatios.length;

		if (rows <= 0) {
			return [];
		}
		if (rows > numWindows) {
			return aspectRatios.map(function (x) {
				return [x];
			});
		}

		var table = [];
		var solution = [];

		for (var i = 0; i < numWindows; i++) {
			var row = [];
			for (var j = 0; j < rows; j++) {
				row.push(0);
			}
			table.push(row);
		}

		for (var i = 0; i < numWindows - 1; i++) {
			var row = [];
			for (var j = 0; j < rows - 1; j++) {
				row.push(0);
			}
			solution.push(row);
		}
		for (var i = 0; i < numWindows; i++) {
			if (i != 0) {
				table[i][0] = aspectRatios[i].ar + table[i - 1][0];
			} else {
				table[i][0] = aspectRatios[i].ar;
			}
		}

		for (var j = 0; j < rows; j++) {
			table[0][j] = aspectRatios[0].ar;
		}

		for (var i = 1; i < numWindows; i++) {
			for (var j = 1; j < rows; j++) {
				var m = [];
				var min;
				for (var x = 0; x < i; x++) {
					var list_of_pairs = [];
					var list_of_maxes = [];
					for (var x = 0; x < i; x++) {
						var max = Math.max(table[x][j - 1], table[i][0] - table[x][0]);
						list_of_pairs.push([max, x]);
						list_of_maxes.push(max);
					}
				}
				min = Math.min.apply(this, list_of_maxes);
				m = list_of_pairs.reduce(function (previous, current) {
					return current[0] < previous[0] ? current : previous;
				}, [Infinity]);
				table[i][j] = m[0];
				solution[i - 1][j - 1] = m[1];
			}
		}

		numWindows = numWindows - 1;
		rows = rows - 2;
		var ans = [];
		while (rows >= 0) {
			var sub_list = [];
			for (var i = solution[numWindows - 1][rows] + 1; i < numWindows + 1; i++) {
				sub_list.push(aspectRatios[i]);
			}
			ans = [sub_list].concat(ans);
			numWindows = solution[numWindows - 1][rows];
			rows--;
		}

		var beginning_list = [];
		for (var i = 0; i < numWindows + 1; i++) {
			beginning_list.push(aspectRatios[i]);
		}
		ans = [beginning_list].concat(ans);

		return ans;
	};

	/**
 * @private
 * @param {LauncherClient~windowDescriptor} windowDescriptor
 * @param {monitorDimensions} monitorDimensions
 * @returns {boolean} Whether window is on the current monitor.
 */
	this.windowOnMonitor = function (windowDescriptor, monitorDimensions) {
		//if right or left edge is within the window's bounds.
		if (windowDescriptor.left >= monitorDimensions.left && windowDescriptor.left < monitorDimensions.right || windowDescriptor.right <= monitorDimensions.right && windowDescriptor.right > monitorDimensions.left) {
			return true;
		}
		return false;
	};
	/**
  * Returns all of the windows living on a monitor.
  */
	this.AutoArrange.getWindowsOnMonitor = function (windowDescriptorList, monitorDimensions) {
		let descriptors = windowDescriptorList.filter((obj, ind) => {
			let win = DockingCalculator.getWindow(obj.name);
			if (!win) {
				return false;
			}
			if (obj.type === "Openfin") {
				try {
					let isArrangable = obj.customData.foreign.services.dockingService.isArrangable;
					if (isArrangable) {
						return self.windowOnMonitor(win.getBounds(), monitorDimensions);
					}
					return false;
				} catch (e) {
					return false;
				}
			}
			return self.windowOnMonitor(win.getBounds(), monitorDimensions);
		});

		let windowsOnMonitor = [];
		for (let i = 0; i < descriptors.length; i++) {
			let descriptor = descriptors[i];
			let win = DockingCalculator.getWindow(descriptor.name);
			if (!self.cachedPositions[win.name]) {
				self.cachedPositions[win.name] = {
					uuid: win.uuid,
					left: win.left,
					right: win.right,
					bottom: win.bottom,
					top: win.top,
					height: win.height,
					width: win.width
				};
			}

			windowsOnMonitor.push({
				name: win.name,
				ar: win.width / win.height,
				top: parseInt(win.top),
				bottom: parseInt(win.bottom),
				left: parseInt(win.left),
				right: parseInt(win.right)
			});
		}

		// before arranging, sort window list based on location to influence final arrangement;
		// note the comparison function is not transitive, so results aren't aways what expected;
		// however, they are usually intuitive when moving a single window.
		windowsOnMonitor.sort(function (a, b) {
			var result;
			if (a.top === b.top && a.left === b.left) {
				result = 0; // a == b
			} else if (a.top < b.top && a.left < b.left) {
				result = -1; // a < b
			} else if (a.top < b.bottom && a.left < b.left) {
				result = -1; // a < b
			} else {
				result = 1; // a > b
			}
			return result;
		});

		windowsOnMonitor.forEach(function (finWin, windex) {
			let wrap = DockingCalculator.getWindow(finWin.name);
			wrap.restore();
			wrap.bringToFront();
		});
		return windowsOnMonitor;
	};
	/**
  * Arranges all windows in the current workspace that are visible on the current monitor. For more about the algorithm used to distribute windows across rows, see {@link https://medium.com/@jtreitz/the-algorithm-for-a-perfectly-balanced-photo-gallery-914c94a5d8af#.c09v4fn1e this post}. The algorithm chooses the number of rows by taking the square root of the number of windows on the monitor and rounding down. 3 windows results in 1 row. 4 windows results in 2 rows. 8 windows will be arranged across 2 rows. 9 windows will be arranged across 3 rows. Other breakpoints are 16, 25, and 36.
  * @param {Object} monitorDimensions Montior dimensions of a given monitor. This value is passed
  * in from {@link util#getMonitorInfo}.
  */
	this.AutoArrange.arrange = function (monitorDimensions, cb) {

		if (self.AutoArrange.isArranged) {
			self.AutoArrange.isArranged = !self.AutoArrange.isArranged;
			//Reverts windows and sends statusUpdate.
			self.revertArrangedWindows();
			return;
		}

		self.AutoArrange.isArranged = !self.AutoArrange.isArranged;
		self.sendAutoArrangeStatusUpdate();
		var resizeQueue = [];
		/**
   * Goes through all windows and returns the windows that are:
   * 1) In the active workspace and
   * 2) On the monitor that autoarrange was clicked on.
   */
		fin.desktop.System.getAllWindows(function (windows) {
			var uuid = windows[0].uuid;
			LauncherClient.getActiveDescriptors(function (err, response) {
				//convert object to an array to make filtering easy.
				let descriptors = Object.keys(response).map(key => {
					return response[key];
				});
				let workspaceWindows = self.AutoArrange.getWindowsOnMonitor(descriptors, monitorDimensions);
				//Number of rows is determined by the square root of the number of windows on the monitor.
				//This gives us a preference for N x N grids. If you have 9 windows, you get 3 rows.
				//If the aspect ratios are set correctly, you get 3x3.
				var rowGroups = self.AutoArrange.linearPartition(workspaceWindows, Math.floor(Math.sqrt(workspaceWindows.length)));
				var height = Math.floor(monitorDimensions.height / rowGroups.length);
				//Iterates through the properly partitioned windows and queues up the movements.
				rowGroups.forEach(function (windowsInGroup, groupIndex) {
					var top = groupIndex * height + 40;
					var width = monitorDimensions.width / windowsInGroup.length;
					//if we're on the last row and the number of rows is not divisible by the monitor's height,
					//we need to add the rounding error to the height so that there isn't a gap
					//between the taskbar and the bottom edge of our last row.
					var rowHeightTotal = height * rowGroups.length;
					if (groupIndex === rowGroups.length - 1 && rowHeightTotal !== monitorDimensions.height) {
						//since we round down the initial height calculation, rowHeightTotal
						//will always be less than the monitor's height.
						height += monitorDimensions.height - rowHeightTotal;
					}
					//Now that the position is set, queue up the movement.
					windowsInGroup.forEach(function (dockableWin, windex) {
						resizeQueue.push({
							dockableWin: DockingCalculator.getWindow(dockableWin.name),
							height: height,
							width: width,
							top: top,
							left: width * windex + monitorDimensions.left
						});
					});
				});
				//animate each window. when they're all done, call the callback, form snapping relationships, and leave this function.
				async.each(resizeQueue, animateWindow, function () {
					DockingCalculator.formGroup(resizeQueue[0].dockableWin.name, false);
					self.AutoArrange.isArranged = true;
					if (cb) {
						cb();
					}
				});
			});
		});

		function animateWindow(request, done) {
			let { height, width, top, left, dockableWin } = request;
			dockableWin.animatePositionAndHeight({
				height: height,
				width: width,
				top: top,
				left: left
			}, function () {
				DockingCalculator.buildSnapRelationships(dockableWin);
				RouterClient.transmit("DockingService." + dockableWin.name, {
					command: "saveWindowLocation",
					bounds: {
						left: left,
						width: width,
						top: top,
						height: height
					}
				});
				done();
			});
		}
	};
	/**
  * Returns windows to where they were before an auto-arrange occured.
  */
	this.revertArrangedWindows = function () {

		for (var windowName in this.cachedPositions) {
			let bounds = this.cachedPositions[windowName];
			if (!bounds.uuid) {
				continue;
			}

			let wrap = DockingCalculator.getWindow(windowName);

			wrap.animatePositionAndHeight({
				height: bounds.height,
				width: bounds.width,
				top: bounds.top,
				left: bounds.left,
				duration: 250
			}, function () {
				DockingCalculator.buildSnapRelationships(wrap);

				RouterClient.transmit("DockingService." + wrap.name, {
					command: "saveWindowLocation",
					bounds: wrap.getBounds()
				});
			});
			delete this.cachedPositions[windowName];
		}
		this.sendAutoArrangeStatusUpdate();
	};
	/**
  * Get bounds for a window.
  */
	this.getBounds = function (params, cb) {
		let win = this.getWindow(params.name);
		var bounds = null;
		if (win) {
			bounds = win.getBounds();
			if (cb) {
				cb(null, bounds);
			}
		} else {
			util.getFinWindow({
				windowName: params.name,
				uuid: params.uuid
			}).then(function (finWin) {
				finWin.getBounds(bounds => {
					cb(null, bounds);
				});
			}).catch(err => {
				cb(err, null);
			});
		}

		return bounds;
	};

	return this;
}

dockingService.prototype = new baseService();
var serviceInstance = new dockingService("dockingService");
serviceInstance.addNeededServices(["authenticationService", "launcherService"]);

fin.desktop.main(function () {
	serviceInstance.onBaseServiceReady(function (callback) {
		Logger.system.log("onBaseServiceReady called");
		Logger.start();
		window.RouterClient = serviceInstance.RouterClient;
		serviceInstance.createGroupMask();
		serviceInstance.createRouterEndpoints();
		ConfigClient.get({ field: "finsemble" }, function (err, response) {
			serviceConfig = response.services.dockingService.config;
			if (typeof response.betaFeatures.docking !== "undefined") {
				serviceConfig.GROUP_MODE = {
					enabled: response.betaFeatures.docking.enabled,
					behavior: "explicit"
				};
			}
			serviceInstance.setupDockingCalculator();
			callback();
		});
	});
});
window.DockingService = serviceInstance;
window.DockingCalculator = DockingCalculator;
serviceInstance.start();
module.exports = serviceInstance;

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\services\\docking\\dockingService.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\services\\docking\\dockingService.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5), __webpack_require__(0)))

/***/ }),
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var Logger = __webpack_require__(1);

var BoxMath = __webpack_require__(28);
var DockableBox = __webpack_require__(34);
var constants = __webpack_require__(33);
var EDGES = constants.EDGES;
var clone = __webpack_require__(32);
function DockableGroup(config) {
	var windows = {};
	var self = this;
	this.name = config.name;
	this.isMovable = typeof config.isMovable !== "undefined" ? config.isMovable : false;
	this.windows = windows;
	this.windowBoundingBox = {
		min: {
			x: 0,
			y: 0
		},
		max: {
			x: 0,
			y: 0
		}
	};
	this.getWindow = function (windowName) {
		return windows[windowName];
	};
	/**
 * @function {function name}
 * @return {type} {description}
 */
	this.getWindows = function () {
		return windows;
	};
	this.setWindows = function (windowList) {
		windows = windowList;
	};
	/**
 * @function {function name}
 * @return {type} {description}
 */
	this.getWindowNames = function () {
		var names = [];
		for (var name in windows) {
			names.push(name);
		}
		return names;
	};
	/**
 * @function {function name}
 * @param  {type} win {description}
 * @return {type} {description}
 */
	this.updateWindow = function (win) {
		windows[win.name] = win;
	};

	/**
 * @function {function name}
 * @param  {type} win {description}
 * @return {type} {description}
 */
	this.addWindow = function (win) {
		if (Object.keys(windows).length === 0) {
			this.windowBoundingBox = clone(win.windowBoundingBox);
		}
		try {
			windows[win.name] = clone(win);
		} catch (e) {
			Logger.system.error("ERROR", e);
		}
		this.windows = windows;
		this.updateBounds();
	};

	this.updateBounds = function () {
		var groupBounds = this.calculateOuterBounds();
		if (!groupBounds) {
			return;
		}
		this.windowBoundingBox = groupBounds;

		this.setBounds({
			left: groupBounds.min.x,
			top: groupBounds.min.y,
			right: groupBounds.max.x,
			bottom: groupBounds.max.y
		});
	};
	this.getWindowsOnEdges = function () {
		var windowsOnSegment = {};
		var windowList = this.getWindows();
		for (var windowName in windowList) {
			let win = this.getWindow(windowName);
			for (var i = 0; i < EDGES.length; i++) {
				var edge = EDGES[i];
				if (win[edge] === this[edge]) {
					windowsOnSegment[win.name] = win;
				}
			}
		}
		return windowsOnSegment;
	};
	this.isARectangle = function () {
		var windows = this.getWindows();
		var groupArea = this.width * this.height;
		var windowArea = 0;
		for (var windowName in windows) {
			let win = this.getWindow(windowName);
			windowArea += win.width * win.height;
		}
		return groupArea === windowArea;
	};
	/**
 * @function {function name}
 * @param  {type} arr {description}
 * @return {type} {description}
 */
	this.addWindows = function (arr) {
		arr.forEach(function (win) {
			self.addWindow(win);
		}, this);
	};

	/**
 * @function {function name}
 * @param  {type} handle {description}
 * @return {type} {description}
 */
	this.getAnchors = function (handle) {
		var edges = {
			top: "bottom",
			right: "left",
			bottom: "top",
			left: "right"
		};

		var edgeArray = handle.split(/(?=[A-Z])/).map(function (s) {
			return s.toLowerCase();
		});

		var anchorNames = [];
		var self = this;

		for (var windowName in windows) {
			if (anchorNames.includes(windowName)) {
				continue;
			}
			var win = windows[windowName];
			var isAnchor = true;
			edgeArray.forEach(requestedEdge => {
				var edge = edges[requestedEdge];
				if (win[edge] !== self[edge]) {
					isAnchor = false;
				}
			});
			if (isAnchor) {
				anchorNames.push(windowName);
			}
		}

		return anchorNames;
	};
	/**
 * @function {function name}
 * @return {type} {description}
 */
	this.calculateOuterBounds = function () {
		var groupBounds = null;

		for (var windowName in windows) {
			var win = windows[windowName];
			if (!groupBounds) {
				groupBounds = clone(win.windowBoundingBox);
				continue;
			}

			var windowBounds = win.windowBoundingBox;
			groupBounds.min.x = windowBounds.min.x < groupBounds.min.x ? windowBounds.min.x : groupBounds.min.x;

			groupBounds.min.y = windowBounds.min.y < groupBounds.min.y ? windowBounds.min.y : groupBounds.min.y;

			groupBounds.max.y = windowBounds.max.y > groupBounds.max.y ? windowBounds.max.y : groupBounds.max.y;

			groupBounds.max.x = windowBounds.max.x > groupBounds.max.x ? windowBounds.max.x : groupBounds.max.x;
		}
		return clone(groupBounds);
	};
	/**
 * @function {function name}
 * @param  {type} name {description}
 * @return {type} {description}
 */
	this.removeWindow = function (name) {
		if (!windows[name]) {
			return;
		}

		if (windows[name]) {
			delete windows[name];
		}
		this.windows = windows;
		this.updateBounds();
	};
	/**
 * @function {function name}
 * @param  {type} bounds {description}
 * @return {type} {description}
 */
	this.getDelta = function (bounds) {
		return {
			left: bounds.left - this.left,
			right: bounds.right - this.right,
			height: bounds.height - this.height,
			width: bounds.width - this.width
		};
	};

	/**
 * @function {function name}
 * @param  {type} bounds {description}
 * @return {type} {description}
 */
	this.setBounds = function (bounds) {
		this.left = bounds.left;
		this.right = bounds.right;
		this.bottom = bounds.bottom;
		this.top = bounds.top;
		this.width = bounds.right - bounds.left;
		this.height = bounds.bottom - bounds.top;
		this.vertices = this.getCornerObject(bounds);
	};

	return this;
}

DockableGroup.prototype = DockableBox;
module.exports = DockableGroup;

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\services\\docking\\dockableGroup.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\services\\docking\\dockableGroup.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var BoxMath = __webpack_require__(28);
function DockableMonitor(bounds) {

	this.left = bounds.left;
	this.top = bounds.top;
	this.right = bounds.right;
	this.bottom = bounds.bottom;
	this.bufferSize = 15;
	/**
 * @function {function name}
 * @param  {type} bufferSize {description}
 * @return {type} {description}
 */
	this.setBufferSize = function (bufferSize) {
		this.bufferSize = bufferSize;
		this.bounds = this.getWindowBoundingBox();
		this.calculateSnappingRegions();
	};

	/**
 * @function {function name}
 * @return {type} {description}
 */
	this.getWindowBoundingBox = function () {
		return {
			min: {
				x: this.left,
				y: this.top
			},
			max: {
				x: this.right,
				y: this.bottom
			}
		};
	};
	/**
 * @function {function name}
 * @param  {type} bounds {description}
 * @param  {type} edge   {description}
 * @return {type} {description}
 */
	this.getSnappingRegion = function (bounds, edge) {
		let map = {
			left: {
				min: {
					x: bounds.left - this.bufferSize,
					y: bounds.top
				},
				max: {
					x: bounds.left + this.bufferSize,
					y: bounds.bottom
				}
			},
			right: {
				min: {
					x: bounds.right - this.bufferSize,
					y: bounds.top
				},
				max: {
					x: bounds.right + this.bufferSize,
					y: bounds.bottom
				}
			},
			bottom: {
				min: {
					x: bounds.left,
					y: bounds.bottom - this.bufferSize
				},
				max: {
					x: bounds.right,
					y: bounds.bottom + this.bufferSize
				}
			},
			top: {
				min: {
					x: bounds.left,
					y: bounds.top - this.bufferSize
				},
				max: {
					x: bounds.right,
					y: bounds.top + this.bufferSize
				}
			}
		};
		return map[edge];
	};
	/**
 * @function {function name}
 * @return {type} {description}
 */
	this.calculateSnappingRegions = function () {
		this.snappingRegions = {
			top: this.getSnappingRegion(bounds, "top"),
			right: this.getSnappingRegion(bounds, "right"),
			bottom: this.getSnappingRegion(bounds, "bottom"),
			left: this.getSnappingRegion(bounds, "left")
		};
	};
	/**
 * @function {function name}
 * @param  {type} region  {description}
 * @param  {type} request {description}
 * @return {type} {description}
 */
	this.canSnapToRegion = function (region, request) {
		var innerAdjustment = 0 - this.bufferSize;
		return BoxMath.intersectBoundingBoxes(this.snappingRegions[region], {
			min: {
				x: request.snappingRegions[region].min.x + innerAdjustment,
				y: request.snappingRegions[region].min.y + innerAdjustment
			},
			max: request.snappingRegions[region].max
		});
	};
	/**
 * @function {function name}
 * @param  {type} request {description}
 * @return {type} {description}
 */
	this.canSnapToWindow = function (request) {
		for (var region in this.snappingRegions) {
			if (this.canSnapToRegion(region, request)) {
				return true;
			}
		}
		return false;
	};
	/**
 * @function {function name}
 * @param  {type} request {description}
 * @return {type} {description}
 */
	this.snapWindow = function (request) {
		var regionsToSnap = [];
		for (var region in this.snappingRegions) {
			if (this.canSnapToRegion(region, request)) {
				regionsToSnap.push(region);
			}
		}
		let originalRequest = Object.assign({}, request);
		regionsToSnap = regionsToSnap.join("");
		if (regionsToSnap) {
			if (regionsToSnap.includes("left")) {
				//if req is to the right of the monitor's left edge.
				if (request.left >= this.snappingRegions.left.min.x) {
					request.left = this.bounds.min.x;
				}
			}
			if (regionsToSnap.includes("top")) {
				//Top edge of request must be below the top edge of the monitor..
				if (request.top >= this.snappingRegions.top.min.y) {
					request.top = this.bounds.min.y;
				}
			}

			if (regionsToSnap.includes("right")) {
				//right edge of request must be to the left of the right edge of the monitor.
				if (request.right <= this.snappingRegions.right.max.x) {
					//move
					if (request.changeType === 0) {
						request.left = this.bounds.max.x - request.width;
					} else {
						request.right = this.bounds.max.x;
					}
				}
			}

			if (regionsToSnap.includes("bottom")) {
				if (request.bottom <= this.snappingRegions.bottom.max.y) {
					if (request.changeType === 0) {
						request.top = this.bounds.max.y - request.height;
					} else {
						request.bottom = this.bounds.max.y;
					}
				}
			}

			if (request.changeType === 0) {
				request.right = request.left + request.width;
				request.bottom = request.top + request.height;
			} else {
				request.width = request.right - request.left;
				request.height = request.bottom - request.top;
			}
			return request;
		}

		return false;
	};
	this.bounds = this.getWindowBoundingBox();
	this.calculateSnappingRegions();
	this.name = bounds.name;

	return this;
}

module.exports = DockableMonitor;

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\services\\docking\\dockableMonitor.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\services\\docking\\dockableMonitor.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var BoxMath = __webpack_require__(28);
var DockableBox = __webpack_require__(34);
var utils = __webpack_require__(2);
var Logger = __webpack_require__(1);

//defaults for the openfin version.
var OF_VERSION = {
	major: 7,
	patch: 0
};
var OF_BUGFIX_REPLACE_WIDTH_AND_HEIGHT = false;

if (typeof fin !== "undefined") {
	//Replace with real version.
	utils.getOpenfinVersion(ver => {
		OF_VERSION = ver;
		OF_BUGFIX_REPLACE_WIDTH_AND_HEIGHT = true;
		// OF_BUGFIX_REPLACE_WIDTH_AND_HEIGHT = OF_VERSION.major === 7 &&
		// 	OF_VERSION.minor <= 21 &&
		// 	OF_VERSION.patch < 6;
		//Bug in 7.53.21.[1-5] adds a pixel to width and height on every request. They fixed in 7.53.21.6.
		Logger.system.log("OF_BUGFIX_REPLACE_WIDTH_AND_HEIGHT", OF_BUGFIX_REPLACE_WIDTH_AND_HEIGHT);
	});
}
function DockableWindow(win, bounds, calculator, updateCB) {
	/**@todo Document these vars */
	this.win = win;

	var self = this;
	var warningsSent = {
		disableFrame: false,
		setOpacity: false,
		addEventListener: false,
		removeEventListener: false
	};
	const BOUND_CHANGING = "disabled-frame-bounds-changing";
	const BOUND_CHANGED = "disabled-frame-bounds-changed";

	/**
 * @function {function name}
 * @return {type} {description}
 */
	var onBoundsChanged = function () {
		//this represents the dockableWindow's context
		self.setOpacity(1);
		self.resizeHandle = null;
		let timestamp = self.getTimestamp();
		self.boundsChangedTimeStamp = timestamp;
		self.lastBoundsAdjustment = timestamp;
		calculator.onMouseUp();
	};

	/**
 * @function {function name}
 * @param  {type} request  {description}
 * @param  {type} callback {description}
 * @return {type} {description}
 */

	var onBoundsChanging = function (request, callback) {
		self.finished = false;
		request.timestamp = self.getTimestamp();
		self.win.getMousePosition(function (position) {
			var invalidateRequest = false;
			var shouldThrottle = request.timestamp < self.lastBoundsAdjustment + self.resizeThrottlePeriod;
			if (shouldThrottle) {
				// Logger.system.log("THROTTLED REQUEST");
				// Logger.system.log('TIMESTAMPS:', request.timestamp, self.lastBoundsAdjustment);
			}
			if (self.win.type === "External") {
				invalidateRequest = shouldThrottle || request.timestamp < self.boundsChangedTimeStamp;
			} else if (self.win.type === "OpenFin") {
				invalidateRequest = shouldThrottle || request.timestamp <= self.boundsChangedTimeStamp;
			}
			if (invalidateRequest) {
				if (callback) {
					callback();
				}
				return;
			}

			if (request.left === self.left && request.right === self.right && request.bottom === self.bottom && request.top === self.top) {
				return;
			}

			self.win.removeEventListener("disabled-frame-bounds-changing", onBoundsChanging);
			if (OF_BUGFIX_REPLACE_WIDTH_AND_HEIGHT) {
				request.width = self.width && request.changeType === 0 ? self.width : request.width;
				request.height = self.height && request.changeType === 0 ? self.height : request.height;
			}
			request.right = request.left + request.width;
			request.bottom = request.top + request.height;
			request.snappingRegions = BoxMath.getSnappingRegions(request, self.bufferSize);
			request.groupNames = self.getGroupNames();
			request.mousePosition = request.mousePosition || position;

			function finishMove() {
				if (callback) {
					callback();
				}
				self.lastBoundsAdjustment = self.getTimestamp();
				self.win.addEventListener("disabled-frame-bounds-changing", onBoundsChanging);
			}
			calculator.requestMove(request, function (bounds) {

				if (!bounds) {
					finishMove();
					return;
				}

				self.setBounds(bounds, function () {
					finishMove();
				}, function (err) {
					Logger.system.error("ERROR IN SET BOUNDS", err);
				});
			});
		});
	};

	this.getTimestamp = function () {
		return typeof performance !== "undefined" ? performance.now() : process.hrtime();
	};

	this.bufferSize = 15;
	this.canGroup = self.win.canGroup;
	this.name = self.win.name;
	this.uuid = self.win.uuid;
	this.top = bounds.top;
	this.left = bounds.left;
	this.right = bounds.right;
	this.bottom = bounds.bottom;
	this.width = bounds.width;
	this.height = bounds.height;
	this.opacity = 1;
	this.scalingFactor = 1;
	this.events = {};
	this.groupNames = [];
	this.getVertices = BoxMath.getVertices;
	this.snappedWindows = [];
	this.type = win.type;
	if (typeof fin !== "undefined") {
		fin.desktop.main(function () {
			fin.desktop.System.getMonitorInfo(info => {
				this.scalingFactor = info.deviceScaleFactor;
			});
		});
	}
	this.resizeThrottlePeriod = 20;
	this.setResizeThrottlePeriod = function (throttlePeriod) {
		this.resizeThrottlePeriod = throttlePeriod;
	};
	/**
  * This removes event listeners. I can't be entirely certain, but from my testing, it _appears_ that openfin isn't actually deleting these objects. if you close the window, then load the window with the same name, old listeners are still registered with your new window. So if you reload a workspace, and then try to move a window, you get weird scenarios where onBoundsChanging is called twice with different values (presumably for old eventlisteners). Removing the eventListeners on close seems to handle this.
  */
	this.removeEventListeners = function () {
		self.win.removeEventListener("disabled-frame-bounds-changing", onBoundsChanging);
		self.win.removeEventListener("disabled-frame-bounds-changed", self.onBoundsChanged);
	};
	/********************************************
  *											*
  *			Window Moving Methods			*
  *											*
  ********************************************/

	/**
  * Hides taskbar icon for openfin windows. This prevents them from being clobbered by aeroshake.
  */
	this.hideTaskbarIcon = function () {
		//Check to see if the method exists. It wouldn't on an external window wrapper.
		if (win.updateOptions) {
			win.updateOptions({ showTaskbarIcon: false });
		}
	};
	/**
  * This shows the taskbar icon for a given window.
  */
	this.showTaskbarIcon = function () {
		if (win.updateOptions) {
			win.updateOptions({ showTaskbarIcon: true });
		}
	};
	this.boundsChangedTimeStamp = self.getTimestamp();
	this.lastBoundsAdjustment = self.getTimestamp();

	/**
 * @function {function name}
 * @param  {type} event {description}
 * @param  {type} cb    {description}
 * @return {type} {description}
 */
	this.addEventListener = function (event, cb) {
		if (self.win.addEventListener) {
			self.win.addEventListener(event, cb);
			if (!this.events[event]) {
				this.events[event] = [];
			}
			this.events[event].push(cb);
		} else if (!warningsSent.addEventListener) {
			warningsSent.addEventListener = true;
			Logger.system.warn("Window wrapper does not have an addEventListener Method.");
		}
	};
	/**
 * @function {function name}
 * @param  {type} event {description}
 * @param  {type} cb    {description}
 * @return {type} {description}
 */
	this.removeEventListener = function (event, cb) {
		if (self.win.addEventListener) {
			self.win.addEventListener(event, cb);
			this.events[event].splice(this.events[event].indexOf(cb), 1);
		} else if (!warningsSent.removeEventListener) {
			warningsSent.removeEventListener = true;
			Logger.system.warn("Window wrapper does not have an removeEventListener Method.");
		}
	};

	/**
 * @function {function name}
 * @return {type} {description}
 */
	this.disableFrame = function () {
		if (self.win.disableFrame) {
			self.win.disableFrame();
		} else if (!warningsSent.disableFrame) {
			warningsSent.disableFrame = true;
			Logger.system.warn("Window wrapper does not have a disableFrame Method");
		}
	};

	this.setOpacity = function (opacity) {
		this.opacity = opacity;
		if (self.win.setOpacity) {
			self.win.setOpacity(opacity);
		} else if (!warningsSent.setOpacity) {
			warningsSent.setOpacity = true;
			Logger.system.warn("Window wrapper does not have a setOpacity Method");
		}
	};
	/**
  * Sets bounds for internal calculations.
  */
	this.setInternalBounds = function (bounds) {
		this.left = typeof bounds.left === "undefined" ? this.left : bounds.left;
		this.top = typeof bounds.top === "undefined" ? this.top : bounds.top;
		this.width = typeof bounds.width === "undefined" ? this.width : bounds.width;
		this.height = typeof bounds.height === "undefined" ? this.height : bounds.height;
		this.right = typeof bounds.right === "undefined" ? this.left + this.width : bounds.right;
		this.bottom = typeof bounds.bottom === "undefined" ? this.top + this.height : bounds.bottom;
		this.setBoundingBoxes();
	};
	/**
 * @function {function name}
 * @param  {type} bounds    {description}
 * @param  {type} successCB {description}
 * @param  {type} errCB     {description}
 * @return {type} {description}
 */
	this.setBounds = function (bounds, successCB, errCB) {
		this.setInternalBounds(bounds);
		self.win.setBounds(this.left, this.top, this.width, this.height, function () {
			if (successCB) {
				successCB();
			}
		}, errCB);
	};
	/**
 * @function {function name}
 * @param  {type} left {description}
 * @param  {type} top  {description}
 * @return {type} {description}
 */
	this.moveTo = function (left, top) {
		this.setBounds({
			left: left,
			top: top,
			right: left + this.width,
			bottom: top + this.height,
			width: this.width,
			height: this.height
		});
	};
	/**
 * @function {function name}
 * @return {type} {description}
 */
	this.getGroupNames = function (changeType) {
		return this.groupsNames;
	};
	/**
 * @function {function name}
 * @param  {type} request  {description}
 * @param  {type} callback {description}
 * @return {type} {description}
 */
	this.requestBoundsChange = function (request, callback) {
		//for testing purposes only
		if (!callback) {
			callback = onBoundsChanged;
		}

		self.win.getMousePosition(position => {
			onBoundsChanging({
				corners: this.getCornerObject(request),
				left: request.left,
				top: request.top,
				width: request.width,
				height: request.height,
				changeType: request.changeType,
				name: this.name,
				uuid: this.uuid,
				mousePosition: request.mousePosition || position
			}, callback);
		});
	};

	/********************************************
  *											*
  *			Helper Functions				*
  *											*
  ********************************************/
	this.resizeHandle = null;
	/**
 * @function {function name}
 * @param  {type} mouse {description}
 * @return {type} {description}
 */
	this.getGrabbedEdge = function (mouse) {
		var tolerance = 15;
		var mouseBox = {
			min: {
				x: mouse.x - tolerance,
				y: mouse.y - tolerance
			},
			max: {
				x: mouse.x + tolerance,
				y: mouse.y + tolerance
			}
		};
		var edges = ["top", "bottom", "left", "right"];
		for (var i = 0; i < edges.length; i++) {
			var edge = edges[i];
			if (BoxMath.intersectBoundingBoxes(mouseBox, this.snappingRegions[edge])) {
				return edge;
			}
		}
		return false;
	};

	/**
 * @function {function name}
 * @return {type} {description}
 */
	this.getInnerBoundingBox = function () {
		var adjustment = this.bufferSize * 2;
		return {
			min: {
				x: this.left + adjustment,
				y: this.top + adjustment
			},
			max: {
				x: this.right - adjustment,
				y: this.bottom - adjustment
			}
		};
	};

	/**
 * @function {function name}
 * @param  {type} bufferSize {description}
 * @return {type} {description}
 */
	this.setBufferSize = function (bufferSize) {
		this.bufferSize = bufferSize;

		this.setBoundingBoxes();
	};
	/**
 * @function {function name}
 * @return {type} {description}
 */
	this.setBoundingBoxes = function () {
		this.setBuffer();
		this.innerBuffer = this.getInnerBoundingBox();
		this.windowBoundingBox = BoxMath.getWindowBoundingBox(this.getBounds());
		this.setSnappingRegions();
		this.vertices = this.getCornerObject(this.getBounds());
	};
	/**
 * @function {function name}
 * @return {type} {description}
 */
	this.setSnappingRegions = function () {
		this.snappingRegions = BoxMath.getSnappingRegions(this.getBounds(), this.bufferSize);
	};

	this.getSnappingRegions = function () {
		return this.snappingRegions;
	};
	this.updateState = function () {
		win.getBounds(bounds => {
			this.setBounds(bounds);
		});
	};
	this.hide = function () {
		win.hide();
	};
	this.show = function () {
		win.show();
	};
	this.bringToFront = function () {
		try {
			win.bringToFront();
		} catch (e) {
			Logger.system.error("Implement bringToFront");
		}
	};

	this.setBoundingBoxes();
	this.notifyWindowTitleBarOfGroupMembership = function () {
		if (typeof RouterClient !== "undefined") {
			RouterClient.transmit(this.name + ".groupMembershipChange", {
				type: "joined"
			});
		}
	};
	this.notifyWindowTitleBarOfGroupEjection = function () {
		if (typeof RouterClient !== "undefined") {
			RouterClient.transmit(this.name + ".groupMembershipChange", {
				type: "ejected"
			});
		}
	};

	this.addSnappedWindow = function (snapObj) {
		if (!this.snappedWindows) {
			this.snappedWindows = [];
		}
		var shouldAdd = true;
		for (var i = 0; i < this.snappedWindows.length; i++) {
			var snappedWin = this.snappedWindows[i];
			if (snappedWin.name === snapObj.name) {
				shouldAdd = false;
				break;
			}
		}

		if (shouldAdd) {
			this.snappedWindows.push(snapObj);
		}
	};

	this.removeSnappedWindow = function (name) {
		if (this.snappedWindows) {
			for (var i = 0; i < this.snappedWindows.length; i++) {
				var snappedWin = this.snappedWindows[i];
				if (name === snappedWin.name) {
					// Logger.system.log("Removing", name, "from", this.name);
					this.snappedWindows.splice(i, 1);
					return;
				}
			}
		}
	};

	this.restore = function () {
		if (win.restore) {
			win.restore();
		} else {
			///Logger.system.warning('Implement restore method on window wrapper.');
		}
	};

	this.animatePositionAndHeight = function (params, cb) {
		var self = this;
		this.setInternalBounds(params);
		if (win.animate) {
			win.animate({
				position: {
					top: params.top || 0,
					left: params.left || 0,
					duration: params.duration || 250
				},
				size: {
					height: params.height || 100,
					width: params.width || 100,
					duration: params.duration || 250
				}
			}, null, cb);
		} else if (win.setBounds) {
			win.setBounds(params.left, params.top, params.width, params.height, cb);
		}
	};

	this.isGrouped = function () {
		return this.groups.length;
	};

	/**
  * Adds eventListenrs so that when the finWIndow moves, we can do things with that data.
  */
	this.addListeners = function () {
		this.addEventListener("disabled-frame-bounds-changed", onBoundsChanged);
		//this.addEventListener('bounds-changed', onBoundsChangedOutside);
		this.addEventListener("disabled-frame-bounds-changing", onBoundsChanging);
	};
	/**
  * Constructor
  */
	this.start = function () {
		this.addListeners();
		//Disable the frame so that users cannot move the window. Only we move the window after we verify that their intended movement shouldn't result in a snap.
		this.disableFrame();
	};

	this.start();
	return this;
}

DockableWindow.prototype = DockableBox;

module.exports = DockableWindow;

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\services\\docking\\dockableWindow.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\services\\docking\\dockableWindow.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {var Logger = __webpack_require__(1);

var DockableMonitor = __webpack_require__(53);
var DockableGroup = __webpack_require__(52);
var BoxMath = __webpack_require__(28);
var MINIMUM_HEIGHT, MINIMUM_WIDTH, ALLOW_GROUPS_TO_SNAP;
var clone = function (obj) {
	//This has been tested a good amount. Previous to this commit we were using a mix of deepmerge and JSON.parse(JSON.stringify()).
	//Trying lodash.deepclone made my tests take 2-3s.
	//JSON.parse everywhere made them take ~ 1s.
	//Using JSON.parse on arrays and deep merge on objects makes them take 7-900ms.
	if (Array.isArray(obj)) {
		return obj.slice();
	} else {
		try {
			return JSON.parse(JSON.stringify(obj));
		} catch (e) {
			Logger.system.error("clone error", e);
			return e;
		}
	}
};
const { CORNERS, EDGES, OPPOSITE_EDGE_MAP } = __webpack_require__(33);
var SNAPPING_OPACITY = 0.8;
var debug = false;
var restrictedAreas = [];

var Logger = __webpack_require__(1);Logger.start();

/**
 *
 *
 * @returns
 */
function DockingCalculator() {
	function uuidv4() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0,
			    v = c === "x" ? r : r & 0x3 | 0x8;
			return v.toString(16);
		});
	}

	/**
  * The pools are just the collection of windows that the DockingCalculator is concerned with
  */

	var windowPool = {},
	    monitorPool = {},
	    groupPool = {},

	//@todo, investigate why I made this a global.
	snappableWindows,

	//Amount of wiggle room to give when trying to figure out whether the user was clicking a corner or not. Since windows can have different resize regions, there's no guarantee that the user will click directly on the corner of a window.
	cornerTolerance = 15,

	//Stationary and moving window are cached onMouseDown and cleared onMouseUp.
	stationaryWindow = null,
	    movingWindow = null,

	//Windows to ignore for grouping functions (e.g., toolbar - it can snap, but shouldn't group)
	groupBlacklist = [],

	//@todo, investigate why I made this global. I suspect it was a mistake, or an early pass. This is used when resizing interior windows of a group.
	joinedWindowNames = [],
	    joinedWindows = [],

	//This allows us to defer adding windows/removing windows from a group until onMouseDown. It's modified onMouseMove. @todo, just calculate it onMouseDown, ya dummy.
	groupAction = {
		name: null,
		windows: []
	};
	//object that's created onMouseDown. Used to cache potentially expensive operations and common information needed accros functions.
	this.resizeObject = {};
	this.groupMode = {
		enabled: true
	};
	this.groupMask = null;
	//Placedholder for the moveRequest. @todo, see if this is necessary. Pretty sure I just pass the reference around everywhere.
	this.moveRequest = null;
	//@todo, see why I even made this. Probably so I could access it in the browser. Kinda dumb.
	this.windowPool = {};
	windowPool = this.windowPool;
	//See comment above.
	this.stationaryWindow = null;
	this.movingWindow = null;
	//Default bufferSize. Can be overwritten by `setBufferSize`.
	this.bufferSize = 15;
	this.resizeEventThrottlePeriod = 0;
	this.moveCount = 0;
	/****************************************
  * Core Loop
  * Docking works like this:
  * A dockableWindow receives a `disabled-frame-bounds-changing` event from the window object that it wraps (e.g., an openfin window). Then the docking calculator gets to work.
  * 1. `this.requestMove`.
  * 2. `this.onMouseDown`.
  * 3. `this.onMouseMove`.
  *
  * As the user moves her mouse around, steps 1 and 3 are executed.When she releases her mouse, the dockableWindow throws a `disabled-frame-bounds-changed` event, which in turn calls `this.onMouseUp`.
  * The general idea is that the user says "Hey, I'd like to move my window 10px to the right of this window. The calculator spins through, notices that the window that the user is moving is within a snapping buffer around the other window. So it responds, "You're too close to that window, sorry, but we're snapping you.". If the movingWindow isn't within the stationaryWindow's buffer, we give the window the all clear to proceed.
  ****************************************/
	/**
 * This is the core controller of the program. It routes the window's moveRequest to the appropriate place, and it recieves the modified bounds afterwards. It communicates the modified bounds to the window via the CB.
 * @param  {moveRequest} Request from the `dockableWindow`.
 * @param  {function} cb What to do after the window's new bounds have been calculated.
 */
	this.requestMove = function (userRequest, cb) {
		if (this.getWindow(userRequest.name).isMaximized) {
			cb(null);
			return;
		}

		if (this.shiftKey && userRequest.changeType === 0 && userRequest.groupNames.length) {
			//Remove from group and move
			let groupNames = clone(userRequest.groupNames);
			groupNames.forEach(groupName => {
				this.removeWindowFromGroup(userRequest.name, groupName);
				this.wipeSnapRelationships(userRequest.name);
			});

			if (this.updateGroupData) {
				this.updateGroupData();
			}
			userRequest.groupName = null;
		}
		function afterMove(bounds) {
			self.onMouseMove(bounds, cb);
		}
		groupAction = {
			name: null,
			windows: []
		};
		//Added the second part of this expression because of aero-snap; if you aero-snap a window to the side or top of a monitor, then move it, it sends in a changeType of 2 - change in position in size. In any normal world, this is a resize. But the user moved the window. So that confuses docking. This check here just makes sure that the changeType doesn't change between mouseDown and mouseUp. This is the only scenario we've seen that happen.
		if (!this.moveRequest || this.moveRequest && this.moveRequest.changeType !== userRequest.changeType) {
			this.onMouseDown(userRequest);
		}

		var moveRequest = this.setMoveRequest(userRequest),
		    self = this;

		if (moveRequest.changeType === undefined) {
			moveRequest.changeType = 0;
		}
		moveRequest.groupNames = movingWindow.groupNames;
		moveRequest.movingRegion = this.resizeObject.correctedHandle;
		moveRequest.resizeHandle = this.resizeObject.correctedHandle;

		if (this.groupMode.enabled && moveRequest.groupNames.length) {
			///Do something if in a group.
			var groupIter = this.groupWindowIterator(this.movingGroup);
			for (let win of groupIter) {
				win.bringToFront();
			}
			this.handleGroup(moveRequest, afterMove);
			return;
		}
		this.checkBuffers(moveRequest, afterMove);
	};
	/**
  * Makes sure that the requested move is occuring in space that is unclaimed by toolbars or other components. This should prevent a window from resizing/moving on top of a toolbar until it passes a threshold.
  * @param {object} moveRequest moverequest.
  */
	this.makeSureMoveIsInUnclaimedSpace = function (moveRequest) {
		var unclaimedSpaceOverlaps = this.getUnclaimedSpaceOverlaps(moveRequest);
		var win = this.getWindow(moveRequest.name);
		for (var i = 0; i < unclaimedSpaceOverlaps.length; i++) {
			var overlap = unclaimedSpaceOverlaps[i];
			for (var e = 0; e < EDGES.length; e++) {
				var edge = EDGES[e];
				if (BoxMath.intersectBoundingBoxes(moveRequest.snappingRegions[edge], overlap)) {
					if (overlap.position === "top") {
						moveRequest.top = overlap.max.y;
						if (moveRequest.changeType === 0 && moveRequest.top === win.top) {
							moveRequest.bottom = moveRequest.top + win.height;
							moveRequest.height = win.height;
						} //do stuff;
					}
					if (overlap.position === "bottom") {
						moveRequest.bottom = overlap.min.y;
						if (moveRequest.changeType === 0 && moveRequest.bottom === win.bottom) {
							moveRequest.top = moveRequest.bottom - win.height;
							moveRequest.height = win.height;
						} //do stuff;
					}
					if (overlap.position === "right") {
						moveRequest.right = overlap.min.x;
						if (moveRequest.changeType === 0 && moveRequest.left === win.left) {
							moveRequest.left = moveRequest.right - win.width;
							moveRequest.width = win.width;
						}
					}
					if (overlap.position === "left") {
						moveRequest.left = overlap.max.x;
						if (moveRequest.changeType === 0 && moveRequest.right === win.right) {
							moveRequest.right = moveRequest.left + win.width;
							moveRequest.width = win.width;
						}
					}
				}
			}
		}
		if (moveRequest.changeType !== 0) {
			moveRequest.height = moveRequest.bottom - moveRequest.top;
			moveRequest.width = moveRequest.right - moveRequest.left;
		}

		return moveRequest;
	};

	/**
  * This function goes through the restricted areas, or claimedSpaces as they're called in the launcherService. If the moveRequest would cause the window to overlap with the claimed space, we return True - this is an invalid request. requestMove then just drops the request on the floor.
  */
	this.getUnclaimedSpaceOverlaps = function (moveRequest) {
		var innerBoundary = {
			min: {
				x: moveRequest.left + moveRequest.width * .25,
				y: moveRequest.top + moveRequest.height * .25
			},
			max: {
				x: moveRequest.right - moveRequest.width * .25,
				y: moveRequest.bottom - moveRequest.bottom * .25
			}
		};
		if (restrictedAreas.length) {
			var overlaps = [];
			for (var i = 0; i < restrictedAreas.length; i++) {
				var boundingBox = restrictedAreas[i];
				if (BoxMath.intersectBoundingBoxes(innerBoundary, boundingBox)) {
					return false;
				}
				if (BoxMath.intersectBoundingBoxes(BoxMath.getWindowBoundingBox(moveRequest), boundingBox)) {
					overlaps.push(boundingBox);
				}
			}
			return overlaps;
		} else {
			return false;
		}
	};
	/**
  * Windows can be part of two groups - one that can move, and one that allows shared border resizing/group resizing. When N windows are snapped together but not explicitly grouped together, they form an "immobileGroup". A movable group is one that the user has explicitly formed. This function returns the appropriate group, given a moveRequest.
  * @param {object} moveRequest moverequest.
  */
	this.getMovingGroup = function (moveRequest) {
		if (debug) {
			Logger.system.log("getMovingGroup", moveRequest.name);
		}

		if (moveRequest.changeType !== 0) {
			return this.getImmobileGroup(moveRequest.name) || this.getMovableGroup(moveRequest.name);
		}
		return this.getMovableGroup(moveRequest.name) || this.getImmobileGroup(moveRequest.name);
	};
	/**
  * This function caches information in the resizeObject so that it doesn't need to be calculated onMouseMove.
  */
	this.onMouseDown = function (moveRequest) {
		if (debug) {
			Logger.system.log("onMouseDown");
		}
		if (this.moveCount === 0) {
			this.recalculateSnaps();
		}
		this.moveCount++;
		movingWindow = this.getWindow(moveRequest.name);
		this.movingWindow = movingWindow;
		if (movingWindow) {
			this.setMovingWindow(movingWindow);
		} else {
			throw new Error("Window not found");
		}
		this.movingGroup = this.getMovingGroup(moveRequest);

		if (this.groupMode.behavior === "explicit") {
			//If there's no moving group, then we're moving an individual window. if it's part of a resizableGroup, it needs to be removed from that group.
			if (moveRequest.changeType === 0 && this.movingGroup && !this.movingGroup.isMovable) {
				this.removeWindowFromGroup(moveRequest.name, this.movingGroup.name);
				this.wipeSnapRelationships(moveRequest.name);
			}
		}
		this.resizeObject = this.constructResizeObject(moveRequest);

		let windowPoolIterator = this.windowPoolIterator();
		for (let win of windowPoolIterator) {
			if (win.name !== moveRequest.name) {
				win.hideTaskbarIcon();
			}
		}

		if (this.resizeObject.scalingGroup) {
			var groupIter = this.groupWindowIterator(this.movingGroup);
			for (let win of groupIter) {
				win.hide();
			}
			this.groupMask.setBounds(this.movingGroup.getBounds());
			this.groupMask.win.bringToFront();
			this.groupMask.show();
		}
	};

	/**
  * This function happens _after_ the calculations have been made. The request comes in, `this.requestMove` routes the request to the appropriate place, and modified bounds are passed into this function. It's a choke point for all docking-sanctioned window movement.
  */
	this.onMouseMove = function (bounds, cb) {
		this.fixWindowOpacity({
			checkForSnappability: true
		});
		if (this.resizeObject.scalingGroup) {
			this.moveGroupMask();
		}
		if (bounds.finished) {
			if (typeof bounds.top === "undefined") {
				bounds = null;
			}
			this.moveWindow(bounds);
			cb(null);
		}
	};
	/**
 * When the user lifts her mouse, this is fired. It cleans up opacity, shows windows if we were moving a group, and cleans up global variables.
 */
	this.onMouseUp = function () {
		if (this.movingWindow && this.movingWindow.isMaximized) {
			return;
		}
		if (debug) {
			Logger.system.log("onMouseUp", "movingAGroupOfWindows", this.movingAGroupOfWindows, "groupMode", this.groupMode, "resizeObject", this.resizeObject);
		}

		if (this.movingAGroupOfWindows) {
			//@todo refactor. correct sounds dumb.
			this.resizeObject = this.correctResizeObject(movingWindow, this.resizeObject);
			var a = this.scaleGroup(this.moveRequest);a;
			var b = this.cleanupGroupResize(this.movingGroup);b;

			var windowBounds = this.getBoundsOfGroupWindows(this.movingGroup);
			windowBounds = this.cleanupSharedEdges(this.movingGroup, windowBounds);
			this.setBoundsOfGroupWindows(this.movingGroup, windowBounds);
			var groupIter = this.groupWindowIterator(this.movingGroup);
			for (let win of groupIter) {
				win.show();
			}
			this.movingAGroupOfWindows = false;
		}

		if (this.groupMode.enabled && movingWindow && movingWindow.groupNames.length) {
			//In explicit docking, movingGroup may be null. GroupMode can be enabled, but the window may only be in a resizable group.
			if (this.movingGroup) {
				this.groupMask.hide();
				let windowBounds = this.getBoundsOfGroupWindows(this.movingGroup);
				//windowBounds = this.cleanupSharedEdges(this.movingGroup, windowBounds, 0);
				windowBounds = this.cleanupGaps(this.movingGroup, windowBounds);
				this.setBoundsOfGroupWindows(this.movingGroup, windowBounds);
				let groupIter = this.groupWindowIterator(this.movingGroup);
				for (let win of groupIter) {
					this.movingGroup.updateWindow(win);
				}
				this.movingGroup.updateBounds();
			}
		}
		let windowPoolIterator = this.windowPoolIterator();
		for (let win of windowPoolIterator) {
			this.buildSnapRelationships(win);
			if (win.snappedWindows.length === 0 && win.groupNames.length) {
				this.removeWindowFromAllGroups(win);
			}
			//Band-aid to prevent aeroshake from pummeling the application.
			win.showTaskbarIcon();
		}

		movingWindow = null;
		stationaryWindow = null;
		for (windowName in windowPool) {
			var win = this.getWindow(windowName);
			win.resizeHandle = null;
			if (win.groupNames.length) {
				win.groupNames.forEach(groupName => {
					let group = this.getGroup(groupName);
					group.updateWindow(win);
					group.updateBounds();
				});
			}
		}

		joinedWindows = [];
		joinedWindowNames = [];

		this.movingGroup = null;
		this.movingWindow = null;
		this.resizeObject = {};
		//moveRequest is null on groupmask resizes..sometimes.
		//@todo, investigate.
		if (this.moveRequest && this.groupMode.enabled && groupAction.name) {
			// let group = this.getGroup(groupAction.name);
			// for (let windowName in groupAction.windows) {
			// 	if (groupBlacklist.includes(windowName)) {
			// 		delete groupAction.windows[windowName];
			// 	}
			// }

			// if (group || (Object.keys(groupAction.windows).length > 1)) {
			// 	for (let windowName in groupAction.windows) {
			// 		Logger.system.log(windowName);
			// 		this.addWindowToGroup({
			// 			groupName: groupAction.name,
			// 			win: this.getWindow(windowName)
			// 		});
			// 	}
			// }
			this.formGroup(this.moveRequest.name, false);
		}
		this.moveRequest = null;
		this.fixWindowOpacity({
			checkForSnappability: false
		});

		shortCircuit = false;

		//function below defined by the service.
		if (this.onMoveComplete) {
			this.onMoveComplete();
		}
	};
	/**
  * Updates local references of monitor information. Happens when a user removes/adds a monitor.
  */
	this.updateMonitorInfo = function (monitorUpdate) {
		monitorInfo = monitorUpdate;
		restrictedAreas = [];
		//@todo, pick up zones that are off limits from terry's update.
		monitorUpdate.forEach(monitor => {
			if (monitor.availableRect.top !== monitor.unclaimedRect.top) {
				restrictedAreas.push({
					min: {
						x: monitor.unclaimedRect.left,
						y: monitor.availableRect.top
					},
					max: {
						x: monitor.unclaimedRect.right,
						y: monitor.unclaimedRect.top
					},
					position: "top"
				});
			}
			if (monitor.availableRect.left !== monitor.unclaimedRect.left) {
				restrictedAreas.push({
					min: {
						x: monitor.availableRect.left,
						y: monitor.unclaimedRect.top
					},
					max: {
						x: monitor.unclaimedRect.right,
						y: monitor.unclaimedRect.bottom
					},
					position: "left"

				});
			}

			if (monitor.availableRect.right !== monitor.unclaimedRect.right) {
				restrictedAreas.push({
					min: {
						x: monitor.unclaimedRect.right,
						y: monitor.unclaimedRect.top
					},
					max: {
						x: monitor.availableRect.right,
						y: monitor.unclaimedRect.bottom
					},
					position: "right"

				});
			}
			if (monitor.availableRect.bottom !== monitor.unclaimedRect.bottom) {
				restrictedAreas.push({
					min: {
						x: monitor.unclaimedRect.left,
						y: monitor.unclaimedRect.bottom
					},
					max: {
						x: monitor.unclaimedRect.right,
						y: monitor.availableRect.bottom
					},
					position: "bottom"

				});
			}
		});
	};

	/****************************************
  *	  Calculators - Window Collections 	*
  ****************************************/

	this.formGroup = function (name, isMovable, whitelist) {
		var self = this;
		if (!whitelist) {
			whitelist = this.getWindowNames();
		}
		let win = this.getWindow(name);
		let windows = win.snappedWindows.map(snapObj => snapObj.name).filter(name => {
			return whitelist.includes(name);
		});

		let processed = [win.name];
		function getSnappedWindows(windo) {
			processed.push(windo.name);
			let snappedWindows = windo.snappedWindows.map(snapObj => snapObj.name).filter(name => {
				return whitelist.includes(name);
			});
			windo.snappedWindows.forEach(snapObj => {
				if (!processed.includes(snapObj.name) && whitelist.includes(snapObj.name)) {
					let snapWin = self.getWindow(snapObj.name);
					let grandSnaps = getSnappedWindows(snapWin);
					snappedWindows = snappedWindows.concat(grandSnaps);
				}
			});
			return snappedWindows;
		}

		win.snappedWindows.forEach(snapObj => {
			if (whitelist.includes(snapObj.name)) {
				let snapWin = self.getWindow(snapObj.name);
				let snappedWindows = getSnappedWindows(snapWin);
				windows = windows.concat(snappedWindows);
			}
		});
		//dedupe.
		windows = windows.filter(function (el, i, arr) {
			return arr.indexOf(el) === i;
		});
		if (windows.length) {
			this.groupWindows({ windows, isMovable: isMovable });
		}
		return windows;
	};
	/**
 * Spins through all of the windows that can group and creates groups based on window position.
 */
	this.constituteGroups = function () {
		for (var groupName in this.getGroups()) {
			this.removeGroup(groupName);
		}
		var self = this;
		this.eliminateGaps();
		var windowPoolIterator = this.windowPoolIterator();
		for (var win of windowPoolIterator) {
			if (groupBlacklist.includes(win.name)) {
				continue;
			}

			var groupList = this.getGroupNames();
			if (!Object.keys(groupList).length) {
				this.addWindowToGroup({
					groupName: uuidv4(),
					win: win
				});
				continue;
			}
			this.buildSnapRelationships(win);
			var snappedWindows = win.snappedWindows;
			for (var i = 0; i < snappedWindows.length; i++) {
				var snapObj = snappedWindows[i];
				var snappedWindow = this.getWindow(snapObj.name);
				if (win.groupNames.length) {
					win.groupNames.forEach(groupName => {
						this.addWindowToGroup({
							groupName: groupName,
							win: snappedWindow
						});
					});
				} else if (snappedWindow.groupNames.length) {
					snappedWindow.groupNames.forEach(groupName => {
						this.addWindowToGroup({
							groupName: groupName,
							win: win
						});
					});
				} else {
					let groupParams = {
						name: uuidv4()
					};
					var newGroup = new DockableGroup(groupParams);
					this.addGroup(newGroup);
					this.addWindowToGroup({
						groupName: newGroup.name,
						win: win
					});
					this.addWindowToGroup({
						groupName: newGroup.name,
						win: snappedWindow
					});
				}
			}
		}
	};
	/**
 * Given a moveRequest, it returns an array of windowNames. The check essentially boils down to "is this window within my snapping buffer?"
 * @param  {moveRequest} moveRequest
 */
	this.getSnappableWindows = function (moveRequest) {
		var windowNames = Object.keys(windowPool),
		    snappableWindows = [];
		for (var i = 0; i < windowNames.length; i++) {
			var stationaryWindowName = windowNames[i];
			//if moveRequest puts the window inside of the stationary window's buffer, snap.
			if (moveRequest.name === stationaryWindowName) {
				continue;
			}
			var stationaryWindow = this.getWindow(stationaryWindowName);
			if (stationaryWindow.canSnapToWindow(moveRequest)) {
				snappableWindows.push(stationaryWindowName);
			}
		}

		return snappableWindows;
	};
	/**
 * Checks to see if the window is within the snapping region of any monitor.
 * @todo, make setBufferSize trickles down to monitors.
 */
	this.getSnappableMonitors = function (moveRequest) {
		var monitorNames = Object.keys(monitorPool),
		    snappableMonitors = [];
		for (var i = 0; i < monitorNames.length; i++) {
			var monitorName = monitorNames[i];
			var monitor = monitorPool[monitorName];

			if (monitor.canSnapToWindow(moveRequest)) {
				snappableMonitors.push(monitorName);
			}
		}

		return snappableMonitors;
	};
	/**
  * Returns an object that describes the edges and corners that are shared between two windows.
  */
	this.getSnapObj = function (win1, win2) {
		return {
			canGroup: !groupBlacklist.includes(win2.name),
			name: win2.name,
			edges: win1.getSharedEdges(win2),
			corners: win1.getSharedCorners(win2)
		};
	};
	/**
  * Snaps two windows..
  */
	this.snapTwoWindows = function (win1, win2) {
		if (groupBlacklist.includes(win1.name) || groupBlacklist.includes(win2.name)) {
			return;
		}
		win1.addSnappedWindow(this.getSnapObj(win1, win2));
		win2.addSnappedWindow(this.getSnapObj(win2, win1));
	};
	/**
  * Wipes all relationships between windows and recalculates them.
  */
	this.recalculateSnaps = function () {
		if (debug) {
			Logger.system.log("RECALCULATING SNAP RELATIONSHIPS");
		}
		var windowIter = this.windowPoolIterator();
		for (let win of windowIter) {
			this.buildSnapRelationships(win);
			if (win.groupNames.length) {
				win.groupNames.forEach(groupName => {
					let group = this.getGroup(groupName);

					group.updateWindow(win);
					group.updateBounds();
				});
			}
		}
	};
	/**
 * Returns an array of `snapObject`s. Just name, shared edges, shared corners, and whether the window canGroup.
 * @param  {dockableWindow} win
 */
	this.buildSnapRelationships = function (win) {
		if (debug) {
			Logger.system.log("ws buildSnapRelationships", win);
		}
		if (win.snappedWindows.length) {
			this.wipeSnapRelationships(win.name);
		}
		var snappedWindows = [];
		var windowPoolIterator = this.windowPoolIterator();

		for (var snappedWindow of windowPoolIterator) {
			if (debug) {
				Logger.system.log("ws windowPoolIterator", snappedWindow);
			}
			if (snappedWindow.name === win.name) {
				continue;
			}
			if (debug) {
				Logger.system.log("ws win.sharesAnEdgeWith(snappedWindow)", win.sharesAnEdgeWith(snappedWindow));
			}
			if (win.sharesAnEdgeWith(snappedWindow) || win.sharesACornerWith(snappedWindow)) {
				this.snapTwoWindows(win, snappedWindow);
			}
		}
		return snappedWindows;
	};

	/**
 * Returns any window with a vertex on a segment.
 * @param  {segment} segment A line segment. An array with 2 points in it (start and end).
 * @return {type}
 */
	this.getWindowsOnSegment = function (segment) {
		var windowsOnSegment = [];
		var windowPoolIterator = this.windowPoolIterator();
		var points = [segment.min, segment.max];
		for (var win of windowPoolIterator) {
			for (var p = 0; p < points.length; p++) {
				var point = points[p];
				if (win.pointIsOnBoundingBox(point)) {
					let snapObj = {
						name: win.name,
						edge: win.getEdgeByPoint(point)
					};
					snapObj.segment = win.getEdges("obj")[snapObj.edge];
					windowsOnSegment.push(snapObj);
					break;
				}
			}
		}
		return windowsOnSegment;
	};

	/**
 * Not sure why this function doesn't use the one above. Similar functionality, but you can pass in a string instead of a line segment.
 * @todo, make it use the function above.
 * @param  {dockableWindow} win
 * @param  {string} edge E.g., 'left', 'right', etc.
 * @return {array}
 */
	this.getWindowsOnEdge = function (win, edge, includeCorners) {
		if (includeCorners === undefined) {
			includeCorners = false;
		}
		var windowsOnEdge = [];
		if (!edge) {

			//@todo, what went wrong to cause this.................
			return [];
		}
		var splitEdge = edge.split(/(?=[A-Z])/).map(function (s) {
			return s.toLowerCase();
		});
		var points;
		if (splitEdge.length > 1) {
			let cornerPoint = win.getPointByVertex(edge);
			var windowsAtCorner = this.getWindowsAtPoint(cornerPoint);

			for (let i = 0; i < windowsAtCorner.length; i++) {
				let possibleSnapper = this.getWindow(windowsAtCorner[i]);

				windowsOnEdge.push({
					name: possibleSnapper.name,
					edge: possibleSnapper.getVertexByPoint(cornerPoint)
				});
			}
		} else {
			var oppEdge = OPPOSITE_EDGE_MAP[edge];
			var windowPoolIterator = this.windowPoolIterator();
			var windowSegment = win.getEdges("obj", includeCorners)[edge];

			for (let possibleSnapper of windowPoolIterator) {
				var A, B, C, D;

				if (possibleSnapper.name === win.name) {
					continue;
				}
				let segment = possibleSnapper.getEdges("obj", includeCorners)[oppEdge];
				var shouldPush = false;
				let points = [{
					name: possibleSnapper.name,
					val: segment.min
				}, {
					name: possibleSnapper.name,
					val: segment.max
				}, {
					name: win.name,
					val: windowSegment.min
				}, {
					name: win.name,
					val: windowSegment.max
				}];
				if (win.name === "B" && possibleSnapper.name === "F") {}
				if (["top", "bottom"].includes(edge)) {
					if (segment.min.y !== windowSegment.min.y) {
						continue;
					}
					points = points.sort((a, b) => {
						return a.val.x > b.val.x;
					});
				}

				if (["left", "right"].includes(edge)) {
					if (segment.min.x !== windowSegment.min.x) {
						continue;
					}
					points = points.sort((a, b) => {
						return a.val.y > b.val.y;
					});
				}
				if (points[0].name !== points[1].name) {
					shouldPush = true;
				}
				if (shouldPush) {
					if (debug) {
						Logger.system.log(windowSegment, segment, win.name, possibleSnapper.name, edge);
					}
					let snapObj = {
						name: possibleSnapper.name,
						edge: oppEdge
					};
					windowsOnEdge.push(snapObj);
				}
			}
		}

		return windowsOnEdge;
	};
	/**
 * Returns a list of windows that straddle a given edge.
 *	+-----------+------------+
 *	|           |            |
 *	|           |            |
 *	|    A      |     B      |
 *	|           |            |
 *	+-----------+--+---------+
 *	|              |         |
 *	|    C         |   D     |
 *	|              |         |
 *	+--------------+---------+
 *
 * In the drawing above, B straddles the left edge of D and the right Edge of C.
 * @param  {dockableWindow} win
 * @param  {string} edge E.g., 'left', 'right', etc.
 */
	this.getStraddlers = function (win, edge) {
		var straddlers = [];
		var windowPoolIterator = this.windowPoolIterator();
		for (var straddler of windowPoolIterator) {

			if (straddler.name === win.name) {
				continue;
			}

			var corners = straddler.vertices;
			for (var corner in corners) {
				if (win.pointIsOnBoundingBox(corners[corner], false)) {
					straddlers.push({
						name: straddler.name,
						edge: win.getEdgeByPoint(corners[corner])
					});
				}
			}
		}
		return straddlers;
	};
	/**
 * Given an X, Y point, it returns a list of windows with that point on their boundingBox.
 * @param  {object} point
 * @return {array}
 */
	this.getWindowsAtPoint = function (point) {
		var windows = [];

		var windowPoolIterator = this.windowPoolIterator();
		for (var win of windowPoolIterator) {
			if (groupBlacklist.includes(win.name)) {
				continue;
			}
			if (win.pointIsOnBoundingBox(point)) {
				windows.push(win.name);
			}
		}
		return windows;
	};

	/**
 * Just a helper to say whether a window has an edge on the edge of the group.
 * @todo refactor to just compare win[edge] to group[edge].
 * @param  {dockableWindow} win
 * @param  {dockableGroup} group
 */
	this.windowIsOnExteriorEdgeOfGroup = function (win, group) {
		var winBounds = win.windowBoundingBox;
		var groupBounds = group.bounds;
		//left
		if (winBounds.min.x === groupBounds.min.x) {
			return true;
		}
		//bottom
		if (winBounds.max.y === groupBounds.max.y) {
			return true;
		}
		//right
		if (winBounds.max.x === groupBounds.max.x) {
			return true;
		}
		//top
		if (winBounds.min.y === groupBounds.min.y) {
			return true;
		}

		return false;
	};
	/**
  * Lets the program know that shift is being held down. This is used when moving a window that's explicitly grouped (if assimilation is turned on). In that case, the window moves out of the group.
  */
	this.setShift = function (bool) {
		this.shiftKey = bool;
	};
	/**
 * Returns an ordered Object. Sorts by Top, then Left.
 * @return {Object} Object where the keys are names of the window.
 */
	this.orderWindows = function (windowList, anchor) {
		//sort windows by top so that when we constitute groups it won't randomly compare windows in the bottom to ones in the top of the monitor.
		var sortableArray = [];
		if (windowList === undefined) {
			windowList = windowPool;
		}
		for (var windowName in windowList) {
			var win = this.getWindow(windowName);
			sortableArray.push([windowName, {
				top: win.top,
				left: win.left,
				bottom: win.bottom,
				right: win.right
			}]);
		}
		sortableArray.sort(function (a, b) {
			var aTop = a[1].top;
			var aLeft = a[1].left;

			var bTop = b[1].top;
			var bLeft = b[1].left;

			if (anchor) {
				//if the window's top is above the anchor's top, compare its bottom to the anchor's top. In a 3x3 grid, this will ensure that windows in row 2 end up after windows in row 3. Looking at the grid below, if we just compared the window's top to the anchor's top, window D would appear in the array before D, even though D is closer to G. By comparing the bottoms of windows above the anchor, we force the algo to look at the left instead of the top. That all may be a crock of shit, too. I Basically, if I resize from the top-right of this group I want it to go: G, H, I, D, E, F, A, B, C. The algo below does that.
				/**
     * +-----------+--------------+-------------+
     * |           |              |             |
     * |           |              |             |
     * |    A      |      B       |     C       |
     * |           |              |             |
     * |           |              |             |
     * +-----------+              +-------------+
     * |           +--------------+             |
     * |           |              |             |
     * |    D      |      E       |      F      |
     * |           |              |             |
     * +----------------------------------------+
     * |           |              |             |
     * |           |              |             |
     * |   G       |       H      |      I      |
     * |           |              |             |
     * |           |              |             |
     * +-----------+--------------+-------------+
    	 */
				let aDelta = {
					left: Math.abs(anchor.left - a[1].left),
					top: a[1].bottom === anchor.top ? Math.abs(anchor.top - a[1].bottom) : Math.abs(anchor.top - a[1].top)
				};
				let bDelta = {
					left: Math.abs(anchor.left - b[1].left),
					top: b[1].bottom === anchor.top ? Math.abs(anchor.top - b[1].bottom) : Math.abs(anchor.top - b[1].top)
				};

				if (aDelta.left === bDelta.left) {
					return aDelta.top > bDelta.top;
				} else {
					return aDelta.left > bDelta.left;
				}
			} else {
				//orders windows ascending by their Top values.
				if (aTop === bTop) {
					return aLeft - bLeft;
				} else {
					return aTop - bTop;
				}
			}
		});

		var sortedWindows = {};
		sortableArray.forEach(arr => {
			sortedWindows[arr[0]] = windowPool[arr[0]];
		});
		return sortedWindows;
	};

	/****************************************
  *			Getters/Setters				*
  ****************************************/
	/**
 * Registers the window with the calculator
 * @param  {string} name
 * @param  {dockableWindow} val
 */
	this.addWindow = function (name, val) {
		val.setBufferSize(this.bufferSize);
		val.setResizeThrottlePeriod(this.resizeEventThrottlePeriod);
		windowPool[name] = val;
		windowPool = this.orderWindows(windowPool);
		if (windowPool[name].groupName) {
			let group = this.getGroup(windowPool[name].groupName);
			group.updateWindow(windowPool[name]);
			group.updateBounds();
		}
		this.buildSnapRelationships(val);
	};
	/**
  * Virtually unsnaps a window from all other windows. This doesn't affect physical positioning. Only the relationships that Docking is a warae of.
  */
	this.wipeSnapRelationships = function (name) {
		let win = this.getWindow(name);
		if (win && win.snappedWindows) {
			let snappedWindows = clone(win.snappedWindows);
			for (var i = 0; i < snappedWindows.length; i++) {
				var snapObj = snappedWindows[i];
				var snappedWindow = this.getWindow(snapObj.name);
				win.removeSnappedWindow(snappedWindow.name);
				if (snappedWindow) {
					snappedWindow.removeSnappedWindow(win.name);
				}
			}
		}
	};
	/**
  * Removes a window from all groups.
  */
	this.removeWindowFromAllGroups = function (win) {
		let groupNames = clone(win.groupNames);
		for (var i = 0; i < groupNames.length; i++) {
			var groupName = groupNames[i];
			this.removeWindowFromGroup(win.name, groupName);
		}
	};
	/**
 * Deregisters the window.
 * @param  {string} name
 */
	this.removeWindow = function (name) {

		let win = this.getWindow(name);
		if (!win) {
			Logger.system.warn("window was not found:", name);
			return;
		}
		//Removes event listeners from the window.
		win.removeEventListeners();
		var windowPoolIterator = this.windowPoolIterator();

		if (win && win.groupNames.length) {
			this.removeWindowFromAllGroups(win);
		}

		this.wipeSnapRelationships(win.name);
		delete windowPool[name];
	};
	/**
  * Returns an array of window names.
  */
	this.getWindowNames = function () {
		return Object.keys(windowPool);
	};
	/**
 * @return {windowPool}
 */
	this.getWindows = function () {
		return windowPool;
	};
	/**
  * Gets a window object by name.
 * @param  {type} name
 * @return {type}
 */
	this.getWindow = function (name) {
		return windowPool[name];
	};
	/**
  * Returns a monitor object.
  * @param {string} name name of monitor.
  */
	this.getMonitor = function (name) {
		return monitorPool[name];
	};
	/**
  * Registers a monitor with the calculator.
 * @param  {type} bounds
 */
	this.addMonitor = function (bounds) {
		var monitor = new DockableMonitor(bounds);
		monitor.setBufferSize(this.bufferSize);
		monitorPool[bounds.name] = monitor;
	};
	/**
 * Deregisters a monitor with the calculator.
 * @param  {type} name
 * @return {type}
 */
	this.removeMonitor = function (name) {
		if (monitorPool[name]) {
			delete monitorPool[name];
		}
	};
	/**
 * @return {monitorPool}
 */
	this.getMonitors = function () {
		return monitorPool;
	};

	/**
  *
  */
	this.removeAllMonitors = function () {
		if (Object.keys(monitorPool).length === 0) {
			return;
		}
		for (var monitorName in monitorPool) {
			this.removeMonitor(monitorName);
		}
	};
	/**
  * Sets the resize throttle period. This allows the system to drop events that occur too quickly.
  */
	this.setResizeThrottlePeriod = function (throttlePeriod) {
		this.resizeEventThrottlePeriod = throttlePeriod;
		let windowIter = this.windowPoolIterator();
		for (let win of windowIter) {
			win.setResizeThrottlePeriod(throttlePeriod);
		}
	};
	/**
  * Sets the opacity that windows take when entering another window's snapping region.
  */
	this.setSnappingOpacity = function (opacity) {
		SNAPPING_OPACITY = opacity;
	};
	/**
  * At one point we weren't sure if we were going to allow groups to snap because of bugs. This is vestigal and should be removed at some point.
  */
	this.setAllowGroupsToSnap = function (bool) {
		ALLOW_GROUPS_TO_SNAP = bool;
	};
	/**
  * Sets the size of the region around windows that will trigger a snap.
  */
	this.setBufferSize = function (buffer) {
		this.bufferSize = buffer;
		var windowPoolIterator = this.windowPoolIterator();
		for (var win of windowPoolIterator) {
			win.setBufferSize(buffer);
		}
		for (var monitorName in monitorPool) {
			let monitor = this.getMonitor(monitorName);
			monitor.setBufferSize(buffer);
		}
	};
	/**
  * Will prevent a window from being added to groups.
  */
	this.addToGroupBlacklist = function (windowName) {
		groupBlacklist.push(windowName);
	};
	/**
  * Will allow a window previously blacklisted to be included in group operations.
  */
	this.removeFromGroupBlacklist = function (windowName) {
		if (groupBlacklist.includes(windowName)) {
			groupBlacklist.splice(groupBlacklist.indexOf(windowName), 1);
		}
	};

	/**
  * Adds a group to the calculator.
 * @param  {type} group
 */
	this.addGroup = function (group) {
		groupPool[group.name] = group;
	};
	/**
 * Removes a group from the calculator.
 * @param  {type} groupName
 */
	this.removeGroup = function (groupName) {
		let group = this.getGroup(groupName);
		let groupIter = this.groupWindowIterator(group);

		if (group.getWindowNames().length) {
			for (var win of groupIter) {
				if (debug) {
					Logger.system.log("removing group", win.name);
				}
				this.removeWindowFromGroup(win.name, groupName);
			}
		}
		delete groupPool[groupName];
	};
	/**
  * Returns a list of groups that are capable of moving together.
  */
	this.getMovableGroups = function () {
		let groupNames = this.getGroupNames();
		let groups = {};

		for (let i = 0; i < groupNames.length; i++) {
			let groupName = groupNames[i];
			let group = this.getGroup(groupName);
			if (group.isMovable) {
				groups[groupName] = group;
			}
		}
		return groups;
	};

	/**
 * Returns the group Pool
 * @return {type}
 */
	this.getGroups = function () {
		return groupPool;
	};
	/**
 * Gets a group by name.
 * @param  {type} name
 * @return {type}
 */
	this.getGroup = function (name) {
		return groupPool[name];
	};

	/**
 * Gets an array of group names.
 * @return {type}
 */
	this.getGroupNames = function () {
		var names = [];
		for (var name in groupPool) {
			names.push(name);
		}
		return names;
	};
	/**
  * Imagine 3 windows snapped horizontally. All are grouped ([A][B][C]). You ungroup B. This function will remove A and C. It iterates through all of the windows in the group and makes sure it's still attached to the group.
  */
	this.checkGroupMemebership = function (win) {
		let groupNames = clone(win.groupNames);
		let snappedWindowGroupNames = win.snappedWindows.map(snapObj => {
			let snapWin = this.getWindow(snapObj.name);
			return snapWin.groupNames;
		});
		groupNames.forEach(groupName => {
			let hasSnappedWindowAttachedToGroup = snappedWindowGroupNames.some(arr => {
				return arr.includes(groupName);
			});
			if (!hasSnappedWindowAttachedToGroup) {
				this.removeWindowFromGroup(win.name, groupName);
			}
		});
	};
	/**
  * Removes a window from a group.
  */
	this.removeWindowFromGroup = function (windowName, groupName) {
		if (debug) {
			Logger.system.log("removing window from group", windowName, groupName);
		}
		let win = this.getWindow(windowName);
		if (!win || !groupName || !win.groupNames.includes(groupName)) {
			return;
		}
		var self = this;
		win.groupNames.splice(win.groupNames.indexOf(groupName), 1);
		let group = this.getGroup(groupName);
		if (!group) {
			return;
		}
		group.removeWindow(win.name);
		if (group.getWindowNames().length === 1) {
			this.removeWindowFromGroup(group.getWindowNames()[0], group.name);
			this.removeGroup(group.name);
		}
	};

	/**
  * Groups n-Windows.
  *
  * @param {any} params
  * @param {any} cb
  */
	this.groupWindows = function (params, cb) {
		var groupName = params.groupName || uuidv4();
		for (var i = 0; i < params.windows.length; i++) {
			var windowName = params.windows[i];
			let win = this.getWindow(windowName);
			this.addWindowToGroup({
				win: win,
				groupName: groupName,
				isMovable: typeof params.isMovable !== "undefined" ? params.isMovable : false
			});

			if (i === 0) {
				groupName = groupName;
			}
		}
		if (cb) {
			cb(null);
		}
	};

	/**
 * @param  {type} groupName
 * @param  {dockableWindow} win
 */
	this.addWindowToGroup = function (params, cb) {
		let { groupName, win } = params;
		//in the explicit paradigm, groups default to not being immobile, but resizable.
		let isMovable = typeof params.isMovable !== "undefined" ? params.isMovable : false;

		if (debug) {
			Logger.system.log("add to group", win.name, isMovable, groupName);
		}
		if (groupBlacklist.includes(win.name)) {
			return;
		}
		if (win.groupNames.includes(groupName)) {
			return;
		}

		let groupParams = {
			name: groupName,
			isMovable: isMovable
		};

		var group = this.getGroup(groupName);

		if (!group) {
			if (!groupName) {
				groupName = uuidv4();
			}
			groupParams.name = groupName;
			group = new DockableGroup(groupParams);
			this.addGroup(group);
		}
		//You can only be in two groups at a time. a movable one, and a resizable one.
		if (group.isMovable) {
			let movableGroup = this.getMovableGroup(win.name);
			if (movableGroup) {
				this.removeWindowFromGroup(win.name, movableGroup.name);
			}
		} else {
			let immobileGroup = this.getImmobileGroup(win.name);
			if (immobileGroup) {
				this.removeWindowFromGroup(win.name, immobileGroup.name);
			}
		}

		win.groupNames.push(groupName);
		group.addWindow(win);

		if (cb) {
			cb(win);
		}
	};
	/**
  * Vestigal function; used to pop a window out of a group. Can likely be removed in the future.
  */
	this.ejectWindow = function (name) {
		var win = this.getWindow(name);
		var newBounds = win.getBounds();
		newBounds.left += 40;
		newBounds.top -= 40;
		newBounds.name = win.name;
		this.moveWindow(newBounds);
	};
	/**
 * @return {boolean}
 */
	this.getGroupMode = function () {
		return this.groupMode;
	};
	/**
 * @param  {boolean} bool
 */
	this.setGroupMode = function (groupMode) {
		let bool = groupMode.enabled;
		let behavior = groupMode.behavior;
		if (!bool) {
			shortCircuit = false;
			this.getGroupNames().forEach(groupName => {
				this.removeGroup(groupName);
			});
		} else if (bool) {
			this.constituteGroups();
		}
		this.groupMode = groupMode;
	};

	/**
 * Adds useful properties to a raw request.
 * @param  {moveRequest} req
 * @return {moveRequest}
 */
	this.setMoveRequest = function (req, win) {

		req.windowBoundingBox = BoxMath.getWindowBoundingBox(req);
		req.innerBuffer = this.getInnerBoundingBox(req);
		req.snappingRegions = BoxMath.getSnappingRegions(req, this.bufferSize);
		req.movingDirection = this.getMovingDirection(req, win);
		req = this.makeSureMoveIsInUnclaimedSpace(req);

		this.moveRequest = req;
		return req;
	};
	/**
 * @param  {dockableWindow} win
 */
	this.setStationaryWindow = function (win) {
		stationaryWindow = win;
	};
	/**
 * @param  {dockableWindow} win
 */
	this.setMovingWindow = function (win) {
		win.bringToFront();
		win.setOpacity(SNAPPING_OPACITY);
		movingWindow = win;
	};
	/**
 * Convenience function I used for like 2 minutes.
 * @todo, remove this funciton.
 * @param  {dockableWindow} stationary
 * @param  {dockableWindow} moving
 */
	this.setWindows = function (stationary, moving) {
		stationaryWindow = stationary;
		movingWindow = moving;
	};

	/****************************************************
  *													*
  *		Calculators - Multiple Positions/Sizes		*
  *													*
  ****************************************************/

	/**
  * when a non-docking movement is made, we don't grab the bounds changing events.
  * So this updates everything. Example: auto-arrange.
  */
	this.updateWindowPositions = function () {
		var windowPoolIterator = this.windowPoolIterator();
		for (var win of windowPoolIterator) {
			win.updateState();
		}
	};
	/**
  * Returns the movableGroup for a window.
  */
	this.getMovableGroup = function (windowName) {
		let win = this.getWindow(windowName);
		if (debug) {
			Logger.system.log("Getting movable group", windowName, win.groupNames);
		}
		for (var i = 0; i < win.groupNames.length; i++) {
			var groupName = win.groupNames[i];
			let group = this.getGroup(groupName);
			if (group.isMovable) {
				if (debug) {
					Logger.system.log("FOund movableGroup", groupName);
				}
				return group;
			}
		}
		return null;
	};
	/**
  * Returns the immobile group for a window. This is one where it is snapped to other windows, but not explicitly grouped by the user.
  */
	this.getImmobileGroup = function (windowName) {
		if (debug) {
			Logger.system.log("Getting immobileGroup", windowName);
		}
		let win = this.getWindow(windowName);
		for (var i = 0; i < win.groupNames.length; i++) {
			var groupName = win.groupNames[i];
			let group = this.getGroup(groupName);
			if (group.isMovable) {
				continue;
			}
			return group;
		}
		return null;
	};
	/**
 * Basically just code flow controller. Figures out whether the move will affect just a couple, a single window, or all windows in the group.
 * @param  {moveRequest} moveRequest
 * @param  {function} cb
 */
	this.handleGroup = function (moveRequest, cb) {
		this.setMoveRequest(moveRequest);
		moveRequest = this.moveRequest;
		var self = this;

		if (this.movingGroup.isMovable && moveRequest.changeType === 0) {
			this.handleGroupMove(moveRequest, cb); //Move a group
		} else {
			if (this.resizeObject.scalingGroup) {
				this.movingAGroupOfWindows = true;
			} else {
				this.resizeInteriorWindow(moveRequest);
			}
			cb({ finished: true });
		}
	};
	/**
  * I wrote this to kill any gap that may have happened after scaling a group proportionately. It seems to work.
  * @todo, make sure this is necessary. Consider a better way to do it.
  */
	this.eliminateGaps = function () {
		var self = this;
		var edges = ["left", "right", "top", "bottom"];
		var dimensionsToChange = {
			left: "width",
			right: "width",
			bottom: "height",
			top: "height"
		};
		var windowPoolIterator = this.windowPoolIterator();
		for (var win of windowPoolIterator) {
			var snappableWindows = this.getSnappableWindows(win);
			var bounds = win.getBounds();
			snappableWindows.forEach(windowName => {
				var snappedWin = self.getWindow(windowName);
				var sharedEdges = win.getSharedEdges(snappedWin, self.bufferSize);
				for (var edge in sharedEdges) {
					var oppEdge = OPPOSITE_EDGE_MAP[edge];
					var dimToChange = dimensionsToChange[edge];
					if (sharedEdges[edge] && win[edge] !== snappedWin[oppEdge]) {
						bounds[edge] = snappedWin[oppEdge];
						if (edge === "left") {
							bounds.right = bounds.left + bounds.width;
						}

						if (edge === "right") {
							bounds.left = bounds.right - bounds.width;
						}

						if (edge === "top") {
							bounds.bottom = bounds.top + bounds.height;
						}
						if (edge === "bottom") {
							bounds.top = bounds.bottom - bounds.height;
						}
					}
				}
				bounds.name = win.name;
				self.moveWindow(bounds);
			});
			if (win.groupNames.length) {
				win.groupNames.forEach(groupName => {
					this.getGroup(groupName).updateWindow(win);
				});
			}
		}
	};

	/****************************************************
  *													*
  *	Calculators - Individual Window Position/Size	*
  *													*
  ****************************************************/
	/**
 * Returns a modified moveRequest. If the code gets here, its' because the moving window was inside of the stationary window's buffer, and a snap needed to occur.
 * @param  {moveRequest} request
 * @return {moveRequest}
 */
	this.snapWindow = function (request) {
		var self = this;
		var intersection = null;
		//order matters here. corners should take precedence, as they'll also handle the vanilla bottom/top/left/right order. The algo stops with the first intersection.
		var regions = ["bottomLeft", "bottomRight", "topLeft", "topRight", "leftTop", "leftBottom", "rightTop", "rightBottom", "top", "left", "right", "bottom"];

		var stationaryBoundingBoxes = stationaryWindow.snappingRegions;
		var movingBoundingBoxes = request.snappingRegions;
		var intersectionFound = false;
		var sharedEdges = stationaryWindow.getSharedEdges(request);
		for (var i = 0; i < regions.length; i++) {
			var region = regions[i];
			if (intersectionFound && request.changeType === 1) {
				break;
			}
			intersection = null;
			//Two checks:
			//1) Is it inside of the stationary window? If so, exit.
			//2) Is it within one of the region bounding boxes.

			if (BoxMath.intersectBoundingBoxes(stationaryBoundingBoxes[region], request.windowBoundingBox)) {
				if (request.changeType === 0) {
					request.movingRegion = this.getIntersections(request, stationaryWindow, region)[0];
				}
				var movingRegion = request.movingRegion;

				if (movingRegion && BoxMath.intersectBoundingBoxes(stationaryBoundingBoxes[region], movingBoundingBoxes[movingRegion])) {
					intersection = {
						stationaryRegion: region,
						movingRegion: movingRegion
					};
					intersectionFound = true;
				}
			}
			if (intersection) {
				this.intersection = intersection;
				request = this.getNewCoordinates({
					eventType: request.changeType === 0 ? "move" : "resize",
					intersection: intersection,
					stationaryWindow: stationaryWindow,
					request: request
				});
				// this.snapTwoWindows(movingWindow, stationaryWindow);
				movingWindow.removedBoundsChanging = true;

				//if moving window isn't in a group, see if stationary window is. if so, add moving to the stationary group. if not, create a new group with them.
				//GroupAction is just a placeholder. We only modify groups on mouseDown defers this
				let sharedEdges = stationaryWindow.getSharedEdges(request);
				let sharedEdgesArr = Object.keys(sharedEdges).map(edge => {
					return { edge: sharedEdges[edge] };
				});
				if (!sharedEdgesArr.some(obj => obj.edge)) {
					let sharedCorners = stationaryWindow.getSharedCorners(request);
					let sharedCornersArr = Object.keys(sharedCorners).map(corner => {
						return { corner: sharedCorners[corner] };
					});
					if (!sharedCornersArr.some(obj => obj.corner)) {
						return request;
					}
				}

				if (!groupBlacklist.includes(stationaryWindow.name)) {
					groupAction = this.getDeferredGroupAction(stationaryWindow, movingWindow);
				}
			} else {
				this.intersection = {
					stationaryRegion: null,
					movingRegion: null
				};
			}
		}

		this.requestMade = request;
		return request;
	};
	/**
  * When moving a window, we don't want to add it to a group until all the calculations are complete. If two windows snap, this function is called. It figures out which group that the windows should form. Note: It always forms an immobile group (one that allows shared-border resizing). This is because a snap is not an explicit group.
  */
	this.getDeferredGroupAction = function (stationaryWin, movingWin) {
		let action = groupAction;
		let stationaryGroup = this.getImmobileGroup(stationaryWin.name);
		let movingWindowGroup = this.getImmobileGroup(movingWin.name);
		if (stationaryGroup && !movingWindowGroup) {
			action.name = stationaryGroup.name;
			action.windows[movingWin.name] = true;
		} else if (movingWindowGroup && !stationaryGroup) {
			action.name = movingWindowGroup.name;
			action.windows[stationaryWin.name] = true;
		} else if (!movingWindowGroup && !stationaryGroup) {
			action.name = uuidv4();
			action.windows[stationaryWin.name] = true;
			action.windows[movingWin.name] = true;
		} else {
			action.name = stationaryGroup.name;
			action.windows[stationaryWin.name] = true;
			action.windows[movingWin.name] = true;
		}
		return action;
	};
	/**
 * Calculates resize bounds.
 * @param  {object} params
 * @return {moveRequest}
 */
	this.adjustSize = function (params) {
		var request = params.request,
		    stationaryWindow = params.stationaryWindow,
		    movingRegion = params.intersection.movingRegion,
		    stationaryRegion = params.intersection.stationaryRegion;
		var intersections = this.getIntersections(request, stationaryWindow, stationaryRegion).toString().toLowerCase();
		if (!intersections) {
			return request;
		}

		switch (stationaryRegion) {
			case "leftBottom":
			case "bottomLeft":
				if (intersections.includes("top") || intersections.includes("topleft") || intersections.includes("topright")) {
					request.top = stationaryWindow.bottom;
				}
				if (intersections.includes("topright") || intersections.includes("right")) {
					request.right = stationaryWindow.left;
				}
				if (intersections.includes("topleft") || intersections.includes("left")) {
					request.left = stationaryWindow.left;
				}
				if (intersections.includes("bottom")) {
					request.bottom = stationaryWindow.bottom;
				}
				break;
			case "rightBottom":
			case "bottomRight":
				if (intersections.includes("top") || intersections.includes("topleft") || intersections.includes("topright")) {
					request.top = stationaryWindow.bottom;
				}
				if (intersections.includes("topleft") || intersections.includes("left")) {
					request.left = stationaryWindow.right;
				}

				if (intersections.includes("topright") || intersections.includes("right")) {
					request.right = stationaryWindow.right;
				}
				if (intersections.includes("bottom")) {
					request.bottom = stationaryWindow.bottom;
				}

				break;
			case "topLeft":
			case "leftTop":
				if (intersections.includes("bottom") || intersections.includes("bottomleft") || intersections.includes("bottomright")) {
					request.bottom = stationaryWindow.top;
				}
				if (intersections.includes("bottomleft") || intersections.includes("left")) {
					request.bottom = stationaryWindow.top;
					request.left = stationaryWindow.left;
				}
				if (intersections.includes("bottomright") || intersections.includes("right")) {
					request.right = stationaryWindow.left;
				}
				if (intersections.includes("top")) {
					request.top = stationaryWindow.top;
				}

				break;
			case "rightTop":
			case "topRight":
				if (intersections.includes("bottom") || intersections.includes("bottomleft") || intersections.includes("bottomright")) {
					request.bottom = stationaryWindow.top;
				}
				if (intersections.includes("bottomleft") || intersections.includes("left")) {
					request.left = stationaryWindow.right;
				}
				if (intersections.includes("bottomright") || intersections.includes("right")) {
					request.right = stationaryWindow.right;
				}
				if (intersections.includes("top")) {
					request.top = stationaryWindow.top;
				}
				break;
			case "top":
				if (intersections.includes("bottom")) {
					request.bottom = stationaryWindow.top;
				}
				break;
			case "right":
				if (intersections.includes("left")) {
					request.left = stationaryWindow.right;
				}
				break;
			case "bottom":
				if (intersections.includes("top")) {
					request.top = stationaryWindow.bottom;
				}
				break;
			case "left":
				if (intersections.includes("right")) {
					request.right = stationaryWindow.left;
				}
				break;
		}

		request.width = request.right - request.left;
		request.height = request.bottom - request.top;

		request = this.checkShortCircuits(request);
		return request;
	};
	/**
  * Checks to see if a window has gotten too narrow, or too short.
  */
	this.checkShortCircuitsWithEdge = function (request, edge) {
		switch (edge) {
			case "top":
				if (request.height <= MINIMUM_HEIGHT) {
					request.height = MINIMUM_HEIGHT;
					request.bottom = request.top + MINIMUM_HEIGHT;
				}
				break;
			case "bottom":
				if (request.height <= MINIMUM_HEIGHT) {
					request.height = MINIMUM_HEIGHT;
					request.top = request.bottom - MINIMUM_HEIGHT;
				}
				break;
			case "left":
				if (request.width < MINIMUM_WIDTH) {
					request.width = MINIMUM_WIDTH;
					request.right = request.left + MINIMUM_WIDTH;
				}
				break;
			case "right":
				if (request.width < MINIMUM_WIDTH) {
					request.width = MINIMUM_WIDTH;
					request.left = request.right - MINIMUM_WIDTH;
				}
				break;
		}
		return request;
	};
	/**
  * Checks to see if a request is allowed. Are you trying to make my window -20px? or 10px? Get out of here.
  */
	this.checkShortCircuits = function (request) {
		var currentBounds;
		if (request.name) {
			currentBounds = this.getWindow(request.name).getBounds();
		} else {
			currentBounds = request;
		}

		//handles shortCircuits for the moving window.
		if (request.width <= MINIMUM_WIDTH) {
			request.width = MINIMUM_WIDTH;
			request.left = currentBounds.left;
			request.right = request.left + MINIMUM_WIDTH;
		}
		if (request.height <= MINIMUM_HEIGHT) {
			request.height = MINIMUM_HEIGHT;
			request.top = currentBounds.top;
			request.bottom = request.top + MINIMUM_HEIGHT;
		}
		return request;
	};
	/**
 * Use when a window is moving and needs to be snapped. Width/Height aren't modified like in `this.adjustSize`.
 * @param  {type} params
 * @return {type}
 */
	this.getNewCoordinates = function (params) {
		var request = params.request,
		    stationaryWindow = params.stationaryWindow,
		    movingRegion = params.intersection.movingRegion,
		    stationaryRegion = params.intersection.stationaryRegion;

		if (params.eventType === "resize") {
			return this.adjustSize(params);
		}

		switch (stationaryRegion) {
			case "bottomLeft":
				if (movingRegion.toLowerCase().includes("top")) {
					request.top = stationaryWindow.bottom;
				}
				if (movingRegion.toLowerCase().includes("right")) {
					request.left = stationaryWindow.left - request.width;
				}
				if (movingRegion.toLowerCase().includes("left")) {
					request.left = stationaryWindow.left;
				}
				if (movingRegion.toLowerCase().includes("bottom")) {
					request.top = stationaryWindow.bottom - request.height;
				}
				break;
			case "bottomRight":
				if (movingRegion.toLowerCase().includes("top")) {
					request.top = stationaryWindow.bottom;
				}
				if (movingRegion.toLowerCase().includes("left")) {
					request.left = stationaryWindow.right;
				}
				if (movingRegion.toLowerCase().includes("right")) {
					request.left = stationaryWindow.right - request.width;
				}
				if (movingRegion.toLowerCase().includes("bottom")) {
					request.top = stationaryWindow.bottom - request.height;
				}
				break;
			case "topLeft":
				if (movingRegion.toLowerCase().includes("bottom")) {
					request.top = stationaryWindow.top - request.height;
				}
				if (movingRegion.toLowerCase().includes("left")) {
					request.left = stationaryWindow.left;
				}

				if (movingRegion.toLowerCase().includes("right")) {
					request.left = stationaryWindow.left - request.width;
				}
				if (movingRegion.toLowerCase().includes("top")) {
					request.top = stationaryWindow.top;
				}
				break;
			case "topRight":
				if (movingRegion.toLowerCase().includes("bottom")) {
					request.top = stationaryWindow.top - request.height;
				}
				if (movingRegion.toLowerCase().includes("left")) {
					request.left = stationaryWindow.right;
				}
				if (movingRegion.toLowerCase().includes("right")) {
					request.left = stationaryWindow.right - request.width;
				}
				if (movingRegion.toLowerCase().includes("top")) {
					request.top = stationaryWindow.top;
				}
				break;
			case "leftTop":
				if (movingRegion.toLowerCase().includes("right")) {
					request.left = stationaryWindow.left - request.width;
				}
				if (movingRegion.toLowerCase().includes("top")) {
					request.top = stationaryWindow.top;
				}
				if (movingRegion.toLowerCase().includes("bottom")) {
					request.top = stationaryWindow.top - request.height;
				}
				break;
			case "leftBottom":
				if (movingRegion.toLowerCase().includes("right")) {
					request.left = stationaryWindow.left - request.width;
				}
				if (movingRegion.toLowerCase().includes("bottom")) {
					request.top = stationaryWindow.bottom - request.height;
				}
				if (movingRegion.toLowerCase().includes("top")) {
					request.top = stationaryWindow.bottom;
				}
				break;
			case "rightTop":
				if (movingRegion.toLowerCase().includes("left")) {
					request.left = stationaryWindow.right;
				}
				if (movingRegion.toLowerCase().includes("top")) {
					request.top = stationaryWindow.top;
				}
				if (movingRegion.toLowerCase().includes("bottom")) {
					request.top = stationaryWindow.top - request.height;
				}
				break;
			case "rightBottom":
				if (movingRegion.toLowerCase().includes("left")) {
					request.left = stationaryWindow.right;
				}
				if (movingRegion.toLowerCase().includes("bottom")) {
					request.top = stationaryWindow.bottom - request.height;
				}
				if (movingRegion.toLowerCase().includes("top")) {
					request.top = stationaryWindow.bottom;
				}
				break;
			case "top":
				if (movingRegion.toLowerCase().includes("bottom")) {
					request.top = stationaryWindow.top - request.height;
				}
				break;
			case "right":
				if (movingRegion.toLowerCase().includes("left")) {
					request.left = stationaryWindow.right;
				}
				break;
			case "bottom":
				if (movingRegion.toLowerCase().includes("top")) {
					request.top = stationaryWindow.bottom;
				}
				break;
			case "left":
				if (movingRegion.toLowerCase().includes("right")) {
					request.left = stationaryWindow.left - request.width;
				}
				break;
		}
		request.right = request.left + request.width;
		request.bottom = request.top + request.height;
		return request;
	};

	/**
 * Helper function for figuring out why snapping isn't working.
 * @todo, consider deleting.
 * @return {type}
 */
	this.getDiagnostics = function () {
		return {
			requestMade: this.moveRequest,
			stationaryWindow: stationaryWindow,
			movingWindow: movingWindow,
			stationaryBoundingBoxes: stationaryWindow.snappingRegions,
			movingBoundingBoxes: this.moveRequest.snappingRegions,
			intersection: this.intersection
		};
	};

	/**
  * Helper to return an object that says which edges are moving.
  * @todo, why not just use splitHandle and a regex? This seems unnecessary.
 * @function this.getMovingEdgesFromResizeHandle
 * @param  {type} handle
 * @return {type}
 */
	this.getMovingEdgesFromResizeHandle = function (handle) {
		var edges = {
			top: false,
			right: false,
			left: false,
			bottom: false
		};
		if (!handle) {
			return edges;
		}
		handle = handle.toLowerCase();
		for (var edge in edges) {
			if (handle.includes(edge)) {
				edges[edge] = true;
			}
		}
		return edges;
	};

	/**
  * Setter for the group Mask.
  * @param {dockableWindow} win
  */
	this.setGroupMask = function (win) {
		this.groupMask = win;
	};

	/**
  * NOT CALLED RIGHT NOW.
  * Will basically be like `this.onMouseUp`, but for groups...once I can get that stuff working.
  */
	this.onGroupMaskMoved = function (cb) {

		var maskBounds = this.groupMask.getBounds();
		var initialWindowBounds = movingWindow.initialBounds || movingWindow.getBounds();
		var groupName = this.movingGroup.name;
		var boundsDelta = this.getBoundsDelta(movingWindow.getBounds(), initialWindowBounds);
		if (debug) {
			Logger.system.log("ongroupmaskmoved", boundsDelta);
		}
		if (boundsDelta.height === 0 && boundsDelta.width === 0) {
			//move group.
			this.handleGroupMove(groupName, boundsDelta.left, boundsDelta.top);
		} else {
			this.handleGroupResize(boundsDelta);
		}

		var groupIter = this.groupWindowIterator(this.movingGroup);
		for (var win of groupIter) {
			win.show();
		}
		// this.resizeObject = {};
		movingWindow.initialBounds = null;
		this.fixWindowOpacity({
			checkForSnappability: false
		});
	};
	/**
  * NOT CURRENTLY USED.
  * Will be like `onMouseMove`, but for groups. Goal is to only move all grouped windows `onMouseUp`. In the interim, just move the mask around. Right now I move every window on every resizeEvent
  */
	this.moveGroupMask = function () {
		var moveRequest = clone(this.moveRequest);
		var bounds = this.groupMask.getBounds();
		if (moveRequest.changeType !== 0) {
			var resizeHandle = this.resizeObject.correctedHandle;
			//@todo figure out why the handle wouldn't be set. sometimes, under strange circumstances (e.g., resizing a group of windows), this is undefined.
			if (resizeHandle) {
				var splitHandle = resizeHandle.split(/(?=[A-Z])/).map(function (s) {
					return s.toLowerCase();
				});

				splitHandle.forEach(handle => {
					if (handle === "top" || handle === "bottom") {
						bounds[handle] = moveRequest.mousePosition.y;
					}
					if (handle === "right" || handle === "left") {
						bounds[handle] = moveRequest.mousePosition.x;
					}
				});
			}
		}
		bounds.width = bounds.right - bounds.left;
		bounds.height = bounds.bottom - bounds.top;
		bounds.name = "groupMask";
		this.groupMask.setBounds(bounds);
	};

	/**
  * Scales a group of windows proportionately.
  * @param {moveRequest} moveRequest
  */
	this.scaleGroup = function (moveRequest) {
		var self = this;
		var group = this.getMovingGroup(moveRequest);
		var groupIter = this.groupWindowIterator(group);
		var resizeHandle = this.resizeObject.correctedHandle;
		var delta = this.getGroupDelta(group.name, moveRequest);
		var newGroupDimensions = {
			height: self.groupMask.height,
			width: self.groupMask.width
		};
		var splitHandle = resizeHandle.split(/(?=[A-Z])/).map(function (s) {
			return s.toLowerCase();
		});

		var anchors = group.getAnchors(resizeHandle);
		group.setWindows(this.orderWindows(group.windows, this.getWindow(anchors[0])));
		groupIter = this.groupWindowIterator(group);
		var movements = {};
		for (let win of groupIter) {
			win.onGroupEdge = {};
			win.resizeHandle = this.resizeObject.correctedHandle;
			["top", "right", "left", "bottom"].forEach(handle => {
				let oppEdge = OPPOSITE_EDGE_MAP[handle];
				if (win[handle] === group[handle]) {
					win.onGroupEdge[handle] = true;
				}
			});
			var newHeight = Math.round(newGroupDimensions.height * (win.height / group.height));
			var newWidth = Math.round(newGroupDimensions.width * (win.width / group.width));
			var request = win.getBounds();
			request.width = newWidth;
			request.height = newHeight;
			request.right = request.left + request.width;
			request.bottom = request.top + request.height;
			request.name = win.name;

			movements[request.name] = this.checkShortCircuits(request);
		}
		splitHandle.forEach(handle => {
			groupIter = this.groupWindowIterator(group);
			//cleans up the edges of the group in case rounding error messed us up.
			var oppEdge = OPPOSITE_EDGE_MAP[handle];
			for (var win of groupIter) {
				var moveRequest = movements[win.name];
				if (win.onGroupEdge && win.onGroupEdge[oppEdge] && moveRequest[oppEdge] !== self.groupMask[oppEdge]) {
					moveRequest.name = win.name;
					moveRequest[oppEdge] = self.groupMask[oppEdge];
					if (oppEdge === "bottom") {
						moveRequest.top = moveRequest.bottom - moveRequest.height;
					}
					if (oppEdge === "top") {
						moveRequest.bottom = moveRequest.top + moveRequest.height;
					}
					if (oppEdge === "left") {
						moveRequest.right = moveRequest.left + moveRequest.width;
					}
					if (oppEdge === "right") {
						moveRequest.left = moveRequest.right - moveRequest.width;
					}
					moveRequest.width = moveRequest.right - moveRequest.left;
					moveRequest.height = moveRequest.bottom - moveRequest.top;
					movements[win.name] = self.checkShortCircuits(moveRequest);
				}
			}
		});
		for (var windowName in movements) {
			self.moveWindow(movements[windowName]);
		}
	};
	/**
 * This basically will re-snap all windows after the movingWindow moves.
 * @todo, document inline.
 * @param  {type} group
 * @param  {function} cb
 */
	this.cleanupGroupResize = function (group, cb) {
		var resizeHandle = this.resizeObject.correctedHandle;
		var oppositeEdge = OPPOSITE_EDGE_MAP[resizeHandle];
		var splitHandle = resizeHandle.split(/(?=[A-Z])/).map(function (s) {
			return s.toLowerCase();
		});

		var self = this;
		var alreadyDanced = [];
		var groupIter = this.groupWindowIterator(group);
		splitHandle.forEach(handle => {
			var groupIter = this.groupWindowIterator(group);
			alreadyDanced = [];
			for (var anchor of groupIter) {
				if (!alreadyDanced.includes(anchor.name)) {
					var b = doTheConga(anchor, handle);b;
				}
			}
			// group.updateBounds();
			groupIter = this.groupWindowIterator(group);
			//cleans up the edges of the group in case rounding error messed us up.
			for (var win of groupIter) {
				if (win.onGroupEdge && win.onGroupEdge[handle] && win[handle] !== self.groupMask[handle]) {
					var moveRequest = win.getBounds();
					moveRequest.name = win.name;
					moveRequest[handle] = self.groupMask[handle];

					moveRequest.width = moveRequest.right - moveRequest.left;
					moveRequest.height = moveRequest.bottom - moveRequest.top;

					self.moveWindow(self.checkShortCircuits(moveRequest));
					var b = doTheConga(win, handle);b;
				}
			}
			group.updateBounds();
		});

		function doTheConga(win, handle) {
			var oppEdge = OPPOSITE_EDGE_MAP[handle];

			for (var i = 0; i < win.snappedWindows.length; i++) {
				var snappedWindowObj = win.snappedWindows[i];
				var snappedWin = self.getWindow(snappedWindowObj.name);
				let groupIntersection = snappedWin.groupNames.some(name => win.groupNames.includes(name));
				if (!snappedWindowObj.edges[handle] || !groupIntersection) {
					continue;
				}

				var req = snappedWin.getBounds();
				req.name = snappedWin.name;

				var stationaryWindowHasSnapped = alreadyDanced.includes(win.name);
				snappedWin[oppEdge] = win[handle];
				var top = snappedWin.top,
				    left = snappedWin.left;
				if (handle === "top") {
					top = win.top - snappedWin.height;
				}

				if (handle === "bottom") {
					top = win.bottom;
				}

				if (handle === "right") {
					left = win.right;
				}

				if (handle === "left") {
					left = win.left - snappedWin.width;
				}

				snappedWin.moveTo(left, top);
				group.updateWindow(snappedWin);
				var b = doTheConga(snappedWin, handle);b;
				alreadyDanced.push(snappedWin.name);
			}
		}
	};
	/**
  * This returns an object with all of the bounds of all of the windows in a given group. This should be moved in to the dockabeGroup.
  */
	this.getBoundsOfGroupWindows = function (group) {
		var groupIter = this.groupWindowIterator(group);
		var bounds = {};
		for (var win of groupIter) {
			bounds[win.name] = win.getBounds();
			//bounds[win.name].name = win.name;
		}
		return bounds;
	};
	/**
  * For a group, it will iterate through its windows and set bounds on each of them.
  */
	this.setBoundsOfGroupWindows = function (group, windowBounds) {
		var groupIter = this.groupWindowIterator(group);
		for (var win of groupIter) {
			windowBounds[win.name].name = win.name;
			this.moveWindow(windowBounds[win.name]);
		}
	};
	/**
  * A resize-helper that needs better documentation. I'm pretty sure this re-snaps windows during group resizes.
  */
	this.cleanupSharedEdges = function (group, windowBounds) {
		var groupIter = this.groupWindowIterator(group);

		// find everything attached to right and bottom of group mask
		alignRight = [];
		alignBottom = [];

		for (var win of groupIter) {
			var bounds = windowBounds[win.name];
			if (bounds.right == this.groupMask.right) {
				alignRight.push(win);
			}
			if (bounds.bottom == this.groupMask.bottom) {
				alignBottom.push(win);
			}
			bounds = this.checkShortCircuitsWithEdge(bounds, "left");
			bounds = this.checkShortCircuitsWithEdge(bounds, "top");
		}

		this.setBoundsOfGroupWindows(group, windowBounds);

		groupIter = this.groupWindowIterator(group);
		// move stuff right / down
		for (let win of groupIter) {
			win.snappedWindows.forEach(val => {
				let sWin = this.getWindow(val.name);
				var bounds = windowBounds[win.name];
				var sBounds = windowBounds[sWin.name];
				//windows can be snapped but in different groups.
				if (sBounds) {
					var sharedEdges = val.edges;
					if (sharedEdges.right) {
						if (bounds.right > sBounds.left) {
							sBounds.left = bounds.right;
							sBounds.right = sBounds.width + sBounds.left;
						}
					}
					if (sharedEdges.bottom) {
						if (bounds.bottom > sBounds.top) {
							sBounds.top = bounds.bottom;
							sBounds.bottom = sBounds.height + sBounds.top;
						}
					}
				}
			});
		}

		this.setBoundsOfGroupWindows(group, windowBounds);

		groupIter = this.groupWindowIterator(group);
		// resize to fit
		for (let win of groupIter) {
			win.snappedWindows.forEach(val => {
				let sWin = this.getWindow(val.name);
				var bounds = windowBounds[win.name];
				var sBounds = windowBounds[sWin.name];
				if (sBounds) {
					var sharedEdges = val.edges;
					if (sharedEdges.right) {
						if (sBounds.left > bounds.right) {
							bounds.right = sBounds.left;
							bounds.width = bounds.right - bounds.left;
						}
					}
					if (sharedEdges.bottom) {
						if (sBounds.top > bounds.bottom) {
							bounds.bottom = sBounds.top;
							bounds.height = bounds.bottom - bounds.top;
						}
					}
				}
			});
		}

		groupIter = this.groupWindowIterator(group);

		var maxRight = false;
		var maxBottom = false;
		var minLeft = false;
		var minTop = false;

		for (var win of groupIter) {
			let bounds = windowBounds[win.name];
			if (maxRight === false || bounds.right > maxRight) {
				maxRight = bounds.right;
			}
			if (maxBottom === false || bounds.bottom > maxBottom) {
				maxBottom = bounds.bottom;
			}
			if (minLeft === false || bounds.left < minLeft) {
				minLeft = bounds.left;
			}
			if (minTop === false || bounds.top < minTop) {
				minTop = bounds.top;
			}
		}

		groupIter = this.groupWindowIterator(group);

		for (var win of groupIter) {
			let bounds = windowBounds[win.name];
			if (win.onGroupEdge && win.onGroupEdge.right && maxRight > bounds.right) {
				bounds.right = maxRight;
				bounds.width = bounds.right - bounds.left;
			}

			if (win.onGroupEdge && win.onGroupEdge.bottom && maxBottom > bounds.bottom) {
				bounds.bottom = maxBottom;
				bounds.height = bounds.bottom - bounds.top;
			}

			if (win.onGroupEdge && win.onGroupEdge.left && minLeft < bounds.left) {
				bounds.left = minLeft;
				bounds.width = bounds.right - bounds.left;
			}

			if (win.onGroupEdge && win.onGroupEdge.top && minTop < bounds.top) {
				bounds.top = minTop;
				bounds.height = bounds.bottom - bounds.top;
			}
		}
		return windowBounds;
	};

	/**
  * Run after everything, it removes any gaps that might have occured (e.g., from fractional pixels, rounding, etc). It needs better inline documentation.
  */
	this.cleanupGaps = function (group, windowBounds) {
		var groupIter = this.groupWindowIterator(group);

		var xs = [];
		var ys = [];
		for (var win of groupIter) {
			var bounds = windowBounds[win.name];
			//if (!xs.length) xs.push(bounds.left);
			let found = false;
			for (let i = 0; i < xs.length; i++) {
				var x = xs[i];
				if (Math.abs(bounds.left - x) < 5) {
					bounds.left = x;
					found = true;
					break;
				}
			}
			if (!found) {
				xs.push(bounds.left);
			}

			found = false;
			for (let i = 0; i < xs.length; i++) {
				var x = xs[i];
				if (Math.abs(bounds.right - x) < 5) {
					bounds.right = x;
					found = true;
					break;
				}
			}
			if (!found) {
				xs.push(bounds.right);
			}

			bounds.width = bounds.right - bounds.left;

			//if (!ys.length) ys.push(bounds.top);
			found = false;
			for (let i = 0; i < ys.length; i++) {
				var y = ys[i];
				if (Math.abs(bounds.top - y) < 5) {
					bounds.top = y;
					found = true;
					break;
				}
			}
			if (!found) {
				ys.push(bounds.top);
			}

			found = false;
			for (let i = 0; i < ys.length; i++) {
				var y = ys[i];
				if (Math.abs(bounds.bottom - y) < 5) {
					bounds.bottom = y;
					found = true;
					break;
				}
			}
			if (!found) {
				ys.push(bounds.bottom);
			}

			bounds.height = bounds.bottom - bounds.top;
			//win.setBounds(bounds)
		}

		return windowBounds;
	};

	/**
  * Resizes a window or group of windows on the interior of a group
  * @param {moveRequest} moveRequest
  */
	this.resizeInteriorWindow = function (moveRequest) {
		var shortCircuits = {
			width: false,
			height: false
		};
		if (moveRequest.width <= MINIMUM_WIDTH) {
			shortCircuits.width = true;
		}
		if (moveRequest.height <= MINIMUM_HEIGHT) {
			shortCircuits.height = true;
			if (debug) {
				Logger.system.log("short circuiting height because of", joinedWindow.name, joinedWindow.height);
			}
		}

		//the moverequest is bad and shouldn't be allowed to proceed.
		if (shortCircuits.width || shortCircuits.height) {
			return;
		}

		var resizeHandle = this.resizeObject.correctedHandle;
		var group = this.getMovingGroup(moveRequest);
		var self = this;
		if (!resizeHandle) {
			return;
		}

		var movements = {};
		var windowsToMove = [moveRequest.name];
		var snappableWindows = this.getSnappableWindows(moveRequest);
		var modifiedRequest = clone(moveRequest);
		var splitHandle = resizeHandle.split(/(?=[A-Z])/).map(function (s) {
			return s.toLowerCase();
		});

		var snappedWindowNames = [];
		for (let i = 0; i < movingWindow.snappedWindows.length; i++) {
			let snapObj = movingWindow.snappedWindows[i];
			for (var h = 0; h < splitHandle.length; h++) {
				let handle = splitHandle[h];
				if (snapObj.edges[handle] || snapObj.corners[resizeHandle]) {
					snappedWindowNames.push(snapObj.name);
					break;
				}
			}
		}
		//will snap the window to other windows before goign and modifying the rest of it
		for (let i = 0; i < snappableWindows.length; i++) {

			if (snappedWindowNames.includes(snappableWindows[i]) || snappableWindows[i] === movingWindow.name) {
				continue;
			}
			if (groupBlacklist.includes(snappableWindows[i])) {
				continue;
			}
			let win = this.getWindow(snappableWindows[i]);

			this.setStationaryWindow(win);
			modifiedRequest.movingRegion = resizeHandle;
			var shouldContinue = false;
			for (var h = 0; h < splitHandle.length; h++) {
				var handle = splitHandle[h];
				if (modifiedRequest[handle] === moveRequest[handle]) {
					shouldContinue = true;
					break;
				}
			}
			modifiedRequest = this.snapWindow(modifiedRequest);

			if (shouldContinue) {
				continue;
			}

			modifiedRequest.snappingRegions = BoxMath.getSnappingRegions(modifiedRequest, this.bufferSize);

			modifiedRequest.windowBoundingBox = BoxMath.getWindowBoundingBox(modifiedRequest);
			break;
		}
		moveRequest = modifiedRequest;
		movements[moveRequest.name] = moveRequest;

		var toProcess = [{
			name: moveRequest.name,
			edge: moveRequest.movingRegion
		}];

		var copy = clone(movingWindow.snappedWindows);
		var movingWindowSnappedWindows = [];
		var terds = [];

		function recurse(snappedWindows, handle, originalHandle) {
			var oppEdge = OPPOSITE_EDGE_MAP[handle];
			for (let i = 0; i < snappedWindows.length; i++) {
				let snapObj = snappedWindows[i];

				let snappedWindow = self.getWindow(snapObj.name);
				if (!terds.includes(snapObj.name + oppEdge)) {
					terds.push(snapObj.name + oppEdge);
					movingWindowSnappedWindows.push({
						name: snapObj.name,
						edge: oppEdge,
						handle: originalHandle
					});
					var a = recurse(self.getWindowsOnEdge(snappedWindow, oppEdge), oppEdge, originalHandle);
				}
			}
			return;
		}
		function recurseCorner(cornerWindows, handle, originalHandle) {

			for (let i = 0; i < cornerWindows.length; i++) {

				let snapObj = cornerWindows[i];

				let snappedWindow = self.getWindow(snapObj.name);
				if (snapObj.corner && !terds.includes(snapObj.name + snapObj.corner)) {
					var splitHandle = snapObj.corner.split(/(?=[A-Z])/).map(function (s) {
						return s.toLowerCase();
					});
					splitHandle.forEach(handle => {
						//if splitHandle == bottomLeft and the originalHandle is bottom, we don't want to do anything with the Left edge. The algo will run through this function twice.
						var doStuff = handle === originalHandle || handle === OPPOSITE_EDGE_MAP[originalHandle];
						if (doStuff && !terds.includes(snapObj.name + handle)) {
							movingWindowSnappedWindows.push({
								name: snapObj.name,
								edge: handle,
								handle: originalHandle
							});
							var a = recurse(self.getWindowsOnEdge(snappedWindow, handle), handle, originalHandle);
							terds.push(snapObj.name + handle);
						}
					});
				}

				// recurseCorner(snappedWindow, snapObj.corner);
			}
			return;
		}

		var movingCorner = CORNERS.includes(resizeHandle);
		if (movingCorner) {
			var cornerPoint = movingWindow.getPointByVertex(resizeHandle);
			var cornerWindows = self.getWindowsAtPoint(cornerPoint).map((val, i) => {
				return {
					name: val,
					corner: self.getWindow(val).getVertexByPoint(cornerPoint),
					edge: self.getWindow(val).getEdgeByPoint(cornerPoint)
				};
			});

			splitHandle.forEach(handle => {
				var b = recurseCorner(cornerWindows, resizeHandle, handle);
			});
		} else {
			var clonedSnaps = self.getWindowsOnEdge(movingWindow, resizeHandle);
			var b = recurse(clonedSnaps, resizeHandle, resizeHandle);
		}

		for (let i = 0; i < movingWindowSnappedWindows.length; i++) {
			let snapObj = movingWindowSnappedWindows[i];

			var snappedWindow = self.getWindow(snapObj.name);
			let newBounds = movements[snapObj.name] ? movements[snapObj.name] : snappedWindow.getBounds();
			newBounds.name = snapObj.name;
			newBounds[snapObj.edge] = moveRequest[snapObj.handle];

			newBounds.width = newBounds.right - newBounds.left;
			newBounds.height = newBounds.bottom - newBounds.top;
			if (newBounds.width <= MINIMUM_WIDTH) {
				shortCircuits.width = true;
			}
			if (newBounds.height <= MINIMUM_HEIGHT) {
				shortCircuits.height = true;
				if (debug) {
					Logger.system.log("short circuiting height because of", joinedWindow.name, joinedWindow.height);
				}
			}

			newBounds = self.checkShortCircuits(newBounds);
			movements[newBounds.name] = newBounds;
		}
		for (var windowName in movements) {
			if (groupBlacklist.includes(windowName)) {
				continue;
			}
			var movement = movements[windowName];
			let win = this.getWindow(windowName);
			if (shortCircuits.width) {
				movement.width = win.width;
				movement.left = win.left;
				movement.right = win.right;
			}
			if (shortCircuits.height) {

				movement.height = win.height;
				movement.top = win.top;
				movement.bottom = win.bottom;
			}

			this.moveWindow(movement);
		}
	};

	/**
  * function for debugging a 3x3 grid.
 */
	this.logger = function () {
		var boundingBoxes = {};
		var windowPoolIterator = this.windowPoolIterator();
		for (var win of windowPoolIterator) {
			boundingBoxes[windowName] = JSON.stringify(win.windowBoundingBox);
		}
		var box = "";
		box += "+----------------------------------------+\n";
		box += "|             |             |            |\n";
		box += "|   " + boundingBoxes["A"] + "          |    " + boundingBoxes["B"] + "         |   " + boundingBoxes["C"] + "         |\n";
		box += "|             |             |            |\n";
		box += "|             |             |            |\n";
		box += "+----------------------------------------+\n";
		box += "|             |             |            |\n";
		box += "|   " + boundingBoxes["D"] + "          |    " + boundingBoxes["E"] + "         |   " + boundingBoxes["F"] + "         |\n";
		box += "|             |             |            |\n";
		box += "|             |             |            |\n";
		box += "+----------------------------------------+\n";
		box += "|             |             |            |\n";
		box += "|   " + boundingBoxes["G"] + "          |    " + boundingBoxes["H"] + "         |   " + boundingBoxes["I"] + "         |\n";
		box += "|             |             |            |\n";
		box += "|             |             |            |\n";
		box += "+----------------------------------------+\n";
		global.Logger.system.log(box);
	};
	/**
  * Helper to determine whether a moveRequest will affect a window, the group, or just a local collection of windows that are snapped to the movingWindow.
  */
	this.moveAffectsGroup = function (moveRequest) {
		if (!this.groupMode.enabled) {
			return false;
		}
		var win = this.getWindow(moveRequest.name);

		if (!win.groupNames.length) {
			return false;
		}

		var group = this.getMovingGroup(moveRequest);
		var groupIter = this.groupWindowIterator(group);
		if (!group.isARectangle()) {
			return false;
		}

		//if the handle that's being dragged is on an exterior edge of a group resizing all.
		var resizeHandle = this.resizeObject.correctedHandle || win.getResizeHandle(moveRequest);

		var edges = ["top", "left", "right", "bottom"];
		if (moveRequest.changeType !== 0 && CORNERS.includes(resizeHandle)) {
			var cornerPoint = win.getPointByVertex(resizeHandle);
			return group.pointIsOnBoundingBox(cornerPoint);
		}

		if (moveRequest.changeType !== 0) {
			return win[resizeHandle] === group[resizeHandle];
		}
		//never used, but could be used if you wanted to only allow exterior windows the ability to move the group.
		for (var i = 0; i < edges.length; i++) {
			var edge = edges[i];
			if (win[edge] === group[edge]) {
				return true;
			}
		}

		return false;
	};

	/**
  * Should use this. Computes the difference between two boundsObjects.
  * @param {moveRequest} newBounds
  * @param {moveRequest} old
  */
	this.getBoundsDelta = function (newBounds, old) {
		var boundsDelta = {};
		var widthDelta = newBounds.width - old.width;

		var heightDelta = newBounds.height - old.height;

		boundsDelta.width = widthDelta;
		boundsDelta.height = heightDelta;
		boundsDelta.top = Math.abs(newBounds.top - old.top);
		boundsDelta.left = Math.abs(newBounds.left - old.left);
		if (newBounds.top < old.top) {
			boundsDelta.top = -boundsDelta.top;
		}
		if (newBounds.left < old.left) {
			boundsDelta.left = -boundsDelta.left;
		}

		return boundsDelta;
	};
	/**
 * Will move a group of windows.
 * @param  {moveRequest} moveRequest
 * @param  {function} cb
 */
	this.handleGroupMove = function (moveRequest, cb) {
		if (movingWindow.isMaximized) {
			cb({ finished: true });
			return;
		}
		var self = this;
		var group = this.getMovableGroup(moveRequest.name);
		var updateGroupWindowsByDelta = function (delta, moveWindows) {
			var groupIter = self.groupWindowIterator(group);
			//don't need to add anything if the delta is 0.
			var modifyBounds = delta.x || delta.y;
			for (let win of groupIter) {
				let bounds = win.getBounds();
				if (modifyBounds) {
					var newLeft = win.left + delta.x;
					var newTop = win.top + delta.y;
					bounds.left = newLeft;
					bounds.top = newTop;
					bounds.bottom = newTop + bounds.height;
					bounds.right = newLeft + bounds.width;
					bounds.name = win.name;
				}

				if (moveWindows) {
					//I'm breaking my own rule by calling setBounds directly. Sadly, isJiggling was being triggered (I think...didn't really investigate), and the window wasn't moving with small adjustments. Set bounds fixes that.
					win.setBounds(bounds);
				} else {
					win.setInternalBounds(bounds);
				}
				group.updateWindow(win);
			}
			group.updateBounds();
		};
		let initialBounds = clone(group.getBounds());

		let delta = self.getMoveDelta(moveRequest);
		let groupIter = self.groupWindowIterator(group);
		if (ALLOW_GROUPS_TO_SNAP) {
			//make the group get its new bounds, but don't move the windows until the snap calculation is finished.
			updateGroupWindowsByDelta(delta, false);
			let preSnapBounds = clone(group.getBounds());
			let mr = group.getBounds();
			mr.name = moveRequest.name;
			let groupMoveRequest = this.setMoveRequest(mr, initialBounds);
			groupMoveRequest.changeType = moveRequest.changeType;
			this.checkBuffers(groupMoveRequest, function (modifiedRequest) {

				if (modifiedRequest.finished) {
					var delta = self.getMoveDelta(modifiedRequest, preSnapBounds);
					updateGroupWindowsByDelta(delta, true);
					cb({ finished: true });
				}
			});
		} else {
			updateGroupWindowsByDelta(delta, true);
			cb({ finished: true });
		}
	};
	/**
 * Calculates the % change that a moveRequest inflicts on a group of windows.
 * @param  {moveRequest} moveRequest
 * @return {type}
 */
	this.getGroupDelta = function (groupName, moveRequest) {
		var group = this.getGroup(groupName);
		var win = this.getWindow(moveRequest.name);
		var widthDelta = moveRequest.width - win.width;
		var heightDelta = moveRequest.height - win.height;

		var delta = {
			height: BoxMath.getPercentChange(group.height, group.height + heightDelta),
			width: BoxMath.getPercentChange(group.width, group.width + widthDelta)
		};
		return delta;
	};
	/**
  * Creates the resizeObject. Put anything here that should be cached onMouseDown. Will be cleared onMouseUp.
  * @param {moveRequest} moveRequest
  * @return {resizeObject}
  */
	this.constructResizeObject = function (moveRequest) {
		var win = this.getWindow(moveRequest.name);
		var resizeObject = {
			handle: win.getResizeHandle(moveRequest),
			type: "edge",
			scalingGroup: moveRequest.changeType !== 0 ? this.moveAffectsGroup(moveRequest) : false
		};

		resizeObject.correctedHandle = resizeObject.handle;
		if (CORNERS.includes(resizeObject.handle)) {
			resizeObject.type = "corner";
			if (resizeObject.scalingGroup) {
				resizeObject = this.correctResizeObject(win, resizeObject);
			}
		}

		resizeObject.movingEdges = this.getMovingEdgesFromResizeHandle(resizeObject.correctedHandle);
		win.resizeHandle = resizeObject.correctedHandle;

		return resizeObject;
	};
	/**
  * If a corner of a window is on the edge of the group, but it's not an actual corner, we need to treat that as an edge resize. See inline documentation for more. This is basically correcting errant resize-handles.
  */
	this.correctResizeObject = function (win, resizeObject, force) {

		if (CORNERS.includes(resizeObject.handle)) {
			let group = this.movingGroup;
			let cornerPoint = win.getPointByVertex(resizeObject.handle);
			let groupEdge = group.getEdgeByPoint(cornerPoint);
			if (group.pointIsOnBoundingBox(cornerPoint, false)) {
				let splitHandle = resizeObject.handle.split(/(?=[A-Z])/).map(function (s) {
					return s.toLowerCase();
				});

				if (this.moveRequest) {
					//E.g., 'bottomRight'. Takes and resets the bottom to whatever it was before the user started moving. So even if I grab the bottom right corner and drag it down, the window's bottom edge will not shift.
					this.moveRequest[splitHandle[0]] = movingWindow[splitHandle[0]];
					this.moveRequest.height = this.moveRequest.bottom - this.moveRequest.top;
					this.moveRequest.width = this.moveRequest.right - this.moveRequest.left;
				}
				resizeObject.type = "edge";
				//e.g., bottomRight; this will just choose 'right'. This happens when you grab the corner of a window that's also on the edge of the window...but isn't the corner of the group.

				resizeObject.correctedHandle = groupEdge;
			}
		}
		return resizeObject;
	};
	/**
 * Resizes a window based on some delta.
 * @param  {dockableWindow} win
 * @param  {Object} delta Object with a width/height change.
 * @return {type}
 */
	this.resizeByDelta = function (win, delta) {
		var bounds = win.getBounds();
		bounds.width = BoxMath.scaleProportionately(win.width, delta.width);
		bounds.height = BoxMath.scaleProportionately(win.height, delta.height);
		if (win.resizeHandle.toLowerCase().includes("right")) {
			bounds.right = bounds.left + bounds.width;
		}
		if (win.resizeHandle.toLowerCase().includes("bottom")) {

			bounds.bottom = bounds.top + bounds.height;
		}

		if (win.resizeHandle.toLowerCase().includes("top")) {

			bounds.top = bounds.bottom - bounds.height;
		}

		if (win.resizeHandle.toLowerCase().includes("left")) {

			bounds.left = bounds.right - bounds.width;
		}
		return bounds;
	};
	this.getMovingDirection = function (bounds, win) {
		if (!win) {
			win = this.getWindow(bounds.name);
		}
		if (win.left > bounds.left) {
			return "left";
		}
		if (win.left < bounds.left) {
			return "right";
		}
		if (win.top > bounds.top) {
			return "top";
		}
		if (win.top < bounds.top) {
			return "bottom";
		}
		return "Window not moving";
	};
	/**
  * I really question this function's existance. I don't think it does anything. I put it in to see if I could catch when aero-shake was going to be triggered.
  * @todo investigate removing this.
  */
	this.isJiggling = function (bounds) {
		var movingDirection = bounds.movingDirection;
		let win = this.getWindow(bounds.name);
		if (["left", "top"].includes(movingDirection)) {
			if (bounds[movingDirection] > win[movingDirection]) {
				return true;
			}
		}
		if (["right", "bottom"].includes(movingDirection)) {
			if (bounds[movingDirection] < win[movingDirection]) {
				return true;
			}
		}
		return false;
	};
	/**
 * Does the dirty work of actually moving windows.
 * @todo, shortCircuit moves that try to squash windows beyond a minimum width/height.
 * @param  {moveRequest} bounds
 * @param  {function} callback
 */
	this.moveWindow = function (bounds, callback) {
		//if window resize causes ANY window to be smaller than the minimum_width, quit that shit.
		if (!bounds) {
			if (callback) {
				callback();
			}
			return;
		}

		var isJiggling = this.isJiggling(bounds);
		if (isJiggling) {
			if (callback) {
				callback();
			}
			return;
		}
		if (!callback) {
			callback = function noop() {};
		}

		var win = this.getWindow(bounds.name);
		if (win) {
			win.setBounds(bounds, callback, setBoundsErrorCB);
		}
	};
	function setBoundsErrorCB(err) {
		Logger.system.error(err);
	}

	/**
 * Checks to see whether a window can be snapped to other windows/monitors.
 * @param  {moveRequest} bounds
 * @param  {function} callback
  */
	this.checkBuffers = function (moveRequest, cb) {
		var snappableWindows = this.getSnappableWindows(moveRequest);
		var snappableMonitors = this.getSnappableMonitors(moveRequest);
		if (!snappableWindows.length && !snappableMonitors.length && cb) {
			moveRequest.finished = true;
			cb(moveRequest);
			return;
		}

		var modifiedRequest;

		for (let i = 0; i < snappableMonitors.length; i++) {
			var monitor = monitorPool[snappableMonitors[i]];
			// let clonedRequest = clone(moveRequest);
			let snapRequest = monitor.snapWindow(moveRequest);
			let windowWasSnapped = false;
			if (snapRequest) {
				moveRequest = snapRequest;
			}

			if (i === snappableMonitors.length - 1 && snappableWindows.length === 0) {
				moveRequest.finished = true;
				cb(moveRequest);
				break;
			}
		}

		for (var i = 0; i < snappableWindows.length; i++) {
			var win = this.getWindow(snappableWindows[i]);
			this.setStationaryWindow(win);
			win.setOpacity(SNAPPING_OPACITY);
			modifiedRequest = this.snapWindow(moveRequest);
			//The original request has been changed because of a snap to anstraddler window. replace the reference so new comparisons are made against the newly snapped window.
			moveRequest = modifiedRequest;

			moveRequest.windowBoundingBox = BoxMath.getWindowBoundingBox(moveRequest);
			if (i === snappableWindows.length - 1) {
				modifiedRequest.finished = true;
			}

			cb(modifiedRequest);
		}
	};

	/**
 * Spins through windows and fixes opacity. For onMouseMove, we skip any windows that could be snapped to the movingWindow. onMouseUp, everything gets hit.
 * @todo, see if I can keep a list of windows that are set to 0.5. I don't need to loop through all windows here. Only the ones that aren't set to 1.
 * @param  {object} params
 * @param  {object} params.checkForSnappability
 */
	this.fixWindowOpacity = function (params) {
		var windowPoolIterator = this.windowPoolIterator();
		for (var win of windowPoolIterator) {
			if (params.checkForSnappability) {
				if (win.canSnapToWindow(this.moveRequest)) {
					continue;
				}
			}
			win.setOpacity(1);
		}
	};
	/**
  * Happens when config is loaded from the configClient.
  */
	this.setGlobalMinimums = function (serviceConfig) {
		MINIMUM_HEIGHT = serviceConfig.MINIMUM_HEIGHT;
		MINIMUM_WIDTH = serviceConfig.MINIMUM_WIDTH;
	};
	/****************************************
  *			Calculators - general		*
  ****************************************/
	/**
 * Given an object, will set boundingboxes on it. If it's a dockableWindow, it'll let the window set itself up.
 * @param  {dockableWindow} win
 * @return {type}
 */
	this.setBoundingBoxes = function (win) {

		if (win.setBoundingBoxes) {
			win.setBoundingBoxes();
		} else {
			win.buffer = this.getBuffer(win);
			win.snappingRegions = BoxMath.getSnappingRegions(win, this.bufferSize);
			win.windowBoundingBox = BoxMath.getWindowBoundingBox(win);
			win.innerBuffer = this.getInnerBoundingBox(win);
		}
		return win;
	};
	/**
  * Returns the difference between the movingWindow's location and the requested movement.
 * @param  {moveRequest} moveRequest
 * @return {type}
 */
	this.getMoveDelta = function (moveRequest, oldBounds) {
		var movingWin = oldBounds || this.getWindow(moveRequest.name);
		var delta = {
			x: moveRequest.left - movingWin.left,
			y: moveRequest.top - movingWin.top
		};
		return delta;
	};

	/**
 * Returns the inner bounds. We use this to give the windows some internal stickiness.
 * @param  {type} bounds
 * @return {object}
 */
	this.getInnerBoundingBox = function (bounds) {
		return {
			min: {
				x: bounds.left + this.bufferSize,
				y: bounds.top + this.bufferSize
			},
			max: {
				x: bounds.right - this.bufferSize,
				y: bounds.bottom - this.bufferSize
			}
		};
	};

	/**
 * Gets the snapping buffer of a request.
 * @param  {type} request
 * @return {type}
 */
	this.getBuffer = function (request) {
		return {
			min: {
				x: request.left - this.bufferSize,
				y: request.top - this.bufferSize
			},
			max: {
				x: request.right + this.bufferSize,
				y: request.bottom + this.bufferSize
			}
		};
	};

	this.intersection = null;

	/**
 * Given a request, a window, and a region, it'll tell you whether they intersect. We use this to figure out which corner/edge to snap to.
 * @param  {moveRequest} moveRequest
 * @param  {dockableWindow} stationaryWindow
 * @param  {string} stationaryRegion
 * @return {object}
 */
	this.getIntersections = function (moveRequest, stationaryWindow, stationaryRegion) {

		var movingBoundingBoxes = moveRequest.snappingRegions;
		var stationaryBoundingBoxes = stationaryWindow.snappingRegions;
		var sharedEdges = stationaryWindow.getSharedEdges(moveRequest);
		var intersections = [];
		for (var movingRegion in movingBoundingBoxes) {

			if (movingRegion === "inner") {
				continue;
			}
			if (BoxMath.intersectBoundingBoxes(stationaryBoundingBoxes[stationaryRegion], movingBoundingBoxes[movingRegion])) {
				intersections.push(movingRegion);
			}
		}
		return intersections;
	};

	/****************************************
  *				Iterators				*
  ****************************************/
	this.windowPoolIterator = function* () {
		windowPool = this.orderWindows(windowPool);
		for (var windowName in windowPool) {
			yield this.getWindow(windowName);
		}
	};

	this.groupWindowIterator = function* (group) {
		var windowNames = group.getWindowNames();
		for (var i = 0; i < windowNames.length; i++) {
			var windowName = windowNames[i];
			yield this.getWindow(windowName);
		}
	};
	return this;
}
module.exports = new DockingCalculator();

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\services\\docking\\dockingCalculator.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\services\\docking\\dockingCalculator.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5), __webpack_require__(0)))

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {

const BOUND_CHANGING = "disabled-frame-bounds-changing";
const BOUND_CHANGED = "disabled-frame-bounds-changed";
var clone = __webpack_require__(32);
var Logger = __webpack_require__(1);

function externalWindowWrapper(params) {
	Logger.system.log("registered");
	var self = this;
	var windowWrap = {}; //@TODO WRITE THIS;
	routerClient = __webpack_require__(4);
	obj = params;
	this.name = params.uuid;
	this.type = "External";
	this.key = params.uuid;
	this.uuid = params.uuid;
	this.saveOnBoundsChanged = params.launchedByApp;
	var key = params.uuid;
	this.movements = [];
	var mouseLocation = {
		x: 0,
		y: 0
	};
	var location = params.location;
	var lastLocation = params.location;
	this.b = location;
	// Logger.system.log("window",self);
	this.setBounds = function (left, top, width, height, success, errCB, snappedWindows) {
		Logger.system.log("send move ", self);
		var newLocation = {
			left: Number(left),
			top: Number(top),
			width: Number(width),
			height: Number(height),
			right: Number(left) + Number(width),
			bottom: Number(top) + Number(height)
		};
		lastLocation = newLocation;
		location = newLocation;
		routerClient.transmit("Assimilation.moveWindow", { key: self.key, location: newLocation });

		if (success) {
			success();
		}
	};
	this.hide = function () {
		routerClient.transmit("Assimilation.hideWindow", { key: self.key, location: location });
	};
	this.show = function () {
		routerClient.transmit("Assimilation.showWindow", { key: self.key, location: location });
	};
	this.bringToFront = function () {};
	this.setOpacity = function (opacity) {
		// window.Logger.system.log("setOpacity wrapper", location);
		this.opacity = opacity;
		//routerClient.transmit("Assimilation.setOpacity",{key:key,opacity:opacity});
	};
	this.disableFrame = function () {
		this.frame = false; //paint
	};
	this.events = {};

	this.addEventListener = function (event, cb) {
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(cb);
	};

	this.transmitEvent = function (eventName, data) {
		if (this.events[eventName]) {
			for (var i = 0; i < this.events[eventName].length; i++) {
				//	window.Logger.system.log("this.events",this.events,eventName);
				var cloneData = clone(data);
				this.events[eventName][i](cloneData);
			}
		}
	};

	this.removeEventListener = function (event, cb) {
		if (this.events[event]) {
			this.events[event].splice(this.events[event].indexOf(cb), 1);
		}
	};
	this.getMousePosition = function (cb) {

		cb(mouseLocation);
	};
	function load() {
		//	var self = this;
		RouterClient.addListener(key + ".move", function (err, message) {
			//debugger;
			Logger.system.log("got move ", self);
			self.key = message.data.uuid;
			//window.Logger.system.log("update location", message);
			// Logger.system.log("message", message);
			mouseLocation = {
				x: Number(message.data.mouseLocation.x),
				y: Number(message.data.mouseLocation.y)
			};
			if (err) {
				return Logger.system.error(err);
			}
			if (!message.data.location) {
				return;
			}

			templocation = message.data.location;
			templocation.name = self.name;

			self.transmitEvent(BOUND_CHANGING, templocation);
		});
		RouterClient.addListener(key + ".endMovement", function (err, message) {
			if (err) {
				return Logger.system.error(err);
			}
			// Logger.system.log("end sent");
			if (!message.data.location) {
				return;
			}

			location.name = self.name;
			self.transmitEvent(BOUND_CHANGED, location);
		});
	}

	this.getBounds = function (success, errCB) {
		location.width = location.right - location.left;
		location.height = location.bottom - location.top;
		success(location);
	};
	load();
	return this;
}

module.exports = externalWindowWrapper;

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\services\\docking\\models\\externalWindowWrapper.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\services\\docking\\models\\externalWindowWrapper.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {function OpenfinWindowWrapper(uuid, name) {
	var windowWrap = fin.desktop.Window.wrap(uuid, name);
	windowWrap.type = "OpenFin";
	/**
 * @function {function name}
 * @param  {type} opacity {description}
 * @return {type} {description}
 */
	windowWrap.setOpacity = function (opacity) {
		this.updateOptions({
			opacity: opacity
		});
	}.bind(windowWrap);
	/**
 * @function {function name}
 * @param  {type} cb {description}
 * @return {type} {description}
 */
	windowWrap.getMousePosition = function (cb) {
		fin.desktop.System.getMousePosition(position => {
			cb({
				x: position.left,
				y: position.top
			});
		});
	};

	return windowWrap;
}

module.exports = OpenfinWindowWrapper;

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\services\\docking\\models\\openfinWindowWrapper.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\services\\docking\\models\\openfinWindowWrapper.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(41);


/***/ })
/******/ ]);
//# sourceMappingURL=dockingService.js.map