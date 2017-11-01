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
/******/ 	return __webpack_require__(__webpack_require__.s = 74);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
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

/***/ 1:
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

/***/ 10:
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

/***/ 11:
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

/***/ 2:
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

/***/ 3:
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

/***/ 4:
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

/***/ 42:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var RouterClient, thisApp, Logger;
/**
 * This file receives SpawnRequests from a master `SplinterAgent`.
 */
fin.desktop.main(function () {
	RouterClient = __webpack_require__(4);
	Logger = __webpack_require__(1);
	Logger.start();
	thisApp = fin.desktop.Application.getCurrent();
	RouterClient.ready(onRouterReady);
});

function onSetTitle(err, message) {
	document.title = message.data.title;
}
function onRouterReady() {
	Logger.system.verbose("SpltinerAgentSlave ready.");
	RouterClient.addListener(`${thisApp.uuid}.spawn`, onSpawnRequest);
	RouterClient.addListener(`${thisApp.uuid}.setTitle`, onSetTitle);
	RouterClient.transmit(`${thisApp.window.name}.onSpawned`, {});
}

function onSpawnRequest(err, message) {
	Logger.system.verbose("SpltinerAgentSlave.onSpawnRequest.", message.data.windowDescriptor);
	let descriptor = message.data.windowDescriptor;
	if (!descriptor) {
		Logger.system.error("SplinterAgentSlave.onSpawnRequest ERROR: No windowDescriptor", message);
		return;
	}
	let finWin = new fin.desktop.Window(descriptor, function () {
		Logger.system.verbose(`SplinterAgentSlave.onSpawnRequest: Window successfully spawned. WindowName: ${descriptor.name}`);
	}, function (err) {
		Logger.system.error("SplinterAgentSlave.onSpawnRequest ERROR", err);
	});
}

 ;(function register() { /* react-hot-loader/webpack */ if (process.env.NODE_ENV !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } /* eslint-disable camelcase, no-undef */ var webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : module.exports; /* eslint-enable camelcase, no-undef */ if (typeof webpackExports === 'function') { __REACT_HOT_LOADER__.register(webpackExports, 'module.exports', "E:\\chartiq\\finsemble\\src\\services\\launcher\\SplinterAgentSlave.js"); return; } /* eslint-disable no-restricted-syntax */ for (var key in webpackExports) { /* eslint-enable no-restricted-syntax */ if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) { continue; } var namedExport = void 0; try { namedExport = webpackExports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "E:\\chartiq\\finsemble\\src\\services\\launcher\\SplinterAgentSlave.js"); } } })();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),

/***/ 6:
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

/***/ 74:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(42);


/***/ }),

/***/ 9:
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

/***/ })

/******/ });
//# sourceMappingURL=SplinterAgentSlave.js.map