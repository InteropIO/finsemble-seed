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
/******/ 	return __webpack_require__(__webpack_require__.s = 378);
/******/ })
/************************************************************************/
/******/ ({

/***/ 105:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return null !== obj && 'object' === typeof obj;
}

module.exports = isObject;


/***/ }),

/***/ 106:
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



var Utils = __webpack_require__(17);
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

/***/ }),

/***/ 11:
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

var Validate = __webpack_require__(27); // Finsemble args validator
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
		RouterClient = __webpack_require__(34);
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

/***/ 120:
/***/ (function(module, exports, __webpack_require__) {

/**
 * Root reference for iframes.
 */

var root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  console.warn("Using browser-only version of superagent in non-browser environment");
  root = this;
}

var Emitter = __webpack_require__(122);
var RequestBase = __webpack_require__(231);
var isObject = __webpack_require__(105);
var ResponseBase = __webpack_require__(232);
var Agent = __webpack_require__(230);

/**
 * Noop.
 */

function noop(){};

/**
 * Expose `request`.
 */

var request = exports = module.exports = function(method, url) {
  // callback
  if ('function' == typeof url) {
    return new exports.Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
}

exports.Request = Request;

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  throw Error("Browser-only version of superagent could not find XHR");
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    pushEncodedKeyValuePair(pairs, key, obj[key]);
  }
  return pairs.join('&');
}

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, val) {
  if (val != null) {
    if (Array.isArray(val)) {
      val.forEach(function(v) {
        pushEncodedKeyValuePair(pairs, key, v);
      });
    } else if (isObject(val)) {
      for(var subkey in val) {
        pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]);
      }
    } else {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(val));
    }
  } else if (val === null) {
    pairs.push(encodeURIComponent(key));
  }
}

/**
 * Expose serialization method.
 */

request.serializeObject = serialize;

/**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var pair;
  var pos;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    pos = pair.indexOf('=');
    if (pos == -1) {
      obj[decodeURIComponent(pair)] = '';
    } else {
      obj[decodeURIComponent(pair.slice(0, pos))] =
        decodeURIComponent(pair.slice(pos + 1));
    }
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'text/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

request.serialize = {
  'application/x-www-form-urlencoded': serialize,
  'application/json': JSON.stringify,
};

/**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse,
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    if (index === -1) { // could be empty line, just skip it
      continue;
    }
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
}

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req) {
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  var status = this.xhr.status;
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
    status = 204;
  }
  this._setStatusProperties(status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this._setHeaderProperties(this.header);

  if (null === this.text && req._responseType) {
    this.body = this.xhr.response;
  } else {
    this.body = this.req.method != 'HEAD'
      ? this._parseBody(this.text ? this.text : this.xhr.response)
      : null;
  }
}

ResponseBase(Response.prototype);

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype._parseBody = function(str) {
  var parse = request.parse[this.type];
  if (this.req._parser) {
    return this.req._parser(this, str);
  }
  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case
  this._header = {}; // coerces header names to lowercase
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      // issue #675: return the raw response if the response parsing fails
      if (self.xhr) {
        // ie9 doesn't have 'response' property
        err.rawResponse = typeof self.xhr.responseType == 'undefined' ? self.xhr.responseText : self.xhr.response;
        // issue #876: return the http status code if the response parsing fails
        err.status = self.xhr.status ? self.xhr.status : null;
        err.statusCode = err.status; // backwards-compat only
      } else {
        err.rawResponse = null;
        err.status = null;
      }

      return self.callback(err);
    }

    self.emit('response', res);

    var new_err;
    try {
      if (!self._isResponseOK(res)) {
        new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
      }
    } catch(custom_err) {
      new_err = custom_err; // ok() callback can throw
    }

    // #1000 don't catch errors from the callback to avoid double calling it
    if (new_err) {
      new_err.original = err;
      new_err.response = res;
      new_err.status = res.status;
      self.callback(new_err, res);
    } else {
      self.callback(null, res);
    }
  });
}

/**
 * Mixin `Emitter` and `RequestBase`.
 */

Emitter(Request.prototype);
RequestBase(Request.prototype);

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} [pass] optional in case of using 'bearer' as type
 * @param {Object} options with 'type' property 'auto', 'basic' or 'bearer' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass, options){
  if (1 === arguments.length) pass = '';
  if (typeof pass === 'object' && pass !== null) { // pass is optional and can be replaced with options
    options = pass;
    pass = '';
  }
  if (!options) {
    options = {
      type: 'function' === typeof btoa ? 'basic' : 'auto',
    };
  }

  var encoder = function(string) {
    if ('function' === typeof btoa) {
      return btoa(string);
    }
    throw new Error('Cannot use basic auth, btoa is not a function');
  };

  return this._auth(user, pass, options, encoder);
};

/**
 * Add query-string `val`.
 *
 * Examples:
 *
 *   request.get('/shoes')
 *     .query('size=10')
 *     .query({ color: 'blue' })
 *
 * @param {Object|String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `options` (or filename).
 *
 * ``` js
 * request.post('/upload')
 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String|Object} options
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, options){
  if (file) {
    if (this._data) {
      throw Error("superagent can't mix .send() and .attach()");
    }

    this._getFormData().append(field, file, options || file.name);
  }
  return this;
};

Request.prototype._getFormData = function(){
  if (!this._formData) {
    this._formData = new root.FormData();
  }
  return this._formData;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  if (this._shouldRetry(err, res)) {
    return this._retry();
  }

  var fn = this._callback;
  this.clearTimeout();

  if (err) {
    if (this._maxRetries) err.retries = this._retries - 1;
    this.emit('error', err);
  }

  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;

  err.status = this.status;
  err.method = this.method;
  err.url = this.url;

  this.callback(err);
};

// This only warns, because the request is still likely to work
Request.prototype.buffer = Request.prototype.ca = Request.prototype.agent = function(){
  console.warn("This is not supported in browser version of superagent");
  return this;
};

// This throws, because it can't send/receive data as expected
Request.prototype.pipe = Request.prototype.write = function(){
  throw Error("Streaming is not supported in browser version of superagent");
};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */
Request.prototype._isHost = function _isHost(obj) {
  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
  return obj && 'object' === typeof obj && !Array.isArray(obj) && Object.prototype.toString.call(obj) !== '[object Object]';
}

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  if (this._endCalled) {
    console.warn("Warning: .end() was called twice. This is not supported in superagent");
  }
  this._endCalled = true;

  // store callback
  this._callback = fn || noop;

  // querystring
  this._finalizeQueryString();

  return this._end();
};

Request.prototype._end = function() {
  var self = this;
  var xhr = (this.xhr = request.getXHR());
  var data = this._formData || this._data;

  this._setTimeouts();

  // state change
  xhr.onreadystatechange = function(){
    var readyState = xhr.readyState;
    if (readyState >= 2 && self._responseTimeoutTimer) {
      clearTimeout(self._responseTimeoutTimer);
    }
    if (4 != readyState) {
      return;
    }

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (!status) {
      if (self.timedout || self._aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(direction, e) {
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    e.direction = direction;
    self.emit('progress', e);
  };
  if (this.hasListeners('progress')) {
    try {
      xhr.onprogress = handleProgress.bind(null, 'download');
      if (xhr.upload) {
        xhr.upload.onprogress = handleProgress.bind(null, 'upload');
      }
    } catch(e) {
      // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
      // Reported here:
      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
    }
  }

  // initiate request
  try {
    if (this.username && this.password) {
      xhr.open(this.method, this.url, true, this.username, this.password);
    } else {
      xhr.open(this.method, this.url, true);
    }
  } catch (err) {
    // see #1149
    return this.callback(err);
  }

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if (!this._formData && 'GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !this._isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];
    var serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (!serialize && isJSON(contentType)) {
      serialize = request.serialize['application/json'];
    }
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;

    if (this.header.hasOwnProperty(field))
      xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  }

  // send stuff
  this.emit('request', this);

  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined
  xhr.send(typeof data !== 'undefined' ? data : null);
  return this;
};

request.agent = function() {
  return new Agent();
};

["GET", "POST", "OPTIONS", "PATCH", "PUT", "DELETE"].forEach(function(method) {
  Agent.prototype[method.toLowerCase()] = function(url, fn) {
    var req = new request.Request(method, url);
    this._setDefaults(req);
    if (fn) {
      req.end(fn);
    }
    return req;
  };
});

Agent.prototype.del = Agent.prototype['delete'];

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn) {
  var req = request('GET', url);
  if ('function' == typeof data) (fn = data), (data = null);
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn) {
  var req = request('HEAD', url);
  if ('function' == typeof data) (fn = data), (data = null);
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * OPTIONS query to `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.options = function(url, data, fn) {
  var req = request('OPTIONS', url);
  if ('function' == typeof data) (fn = data), (data = null);
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

function del(url, data, fn) {
  var req = request('DELETE', url);
  if ('function' == typeof data) (fn = data), (data = null);
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
}

request['del'] = del;
request['delete'] = del;

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn) {
  var req = request('PATCH', url);
  if ('function' == typeof data) (fn = data), (data = null);
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn) {
  var req = request('POST', url);
  if ('function' == typeof data) (fn = data), (data = null);
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn) {
  var req = request('PUT', url);
  if ('function' == typeof data) (fn = data), (data = null);
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};


/***/ }),

/***/ 122:
/***/ (function(module, exports, __webpack_require__) {


/**
 * Expose `Emitter`.
 */

if (true) {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};


/***/ }),

/***/ 17:
/***/ (function(module, exports, __webpack_require__) {

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var SystemSettings = __webpack_require__(45);
var Logger = __webpack_require__(11);
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

/***/ }),

/***/ 230:
/***/ (function(module, exports) {

function Agent() {
  this._defaults = [];
}

["use", "on", "once", "set", "query", "type", "accept", "auth", "withCredentials", "sortQuery", "retry", "ok", "redirects",
 "timeout", "buffer", "serialize", "parse", "ca", "key", "pfx", "cert"].forEach(function(fn) {
  /** Default setting for all requests from this agent */
  Agent.prototype[fn] = function(/*varargs*/) {
    this._defaults.push({fn:fn, arguments:arguments});
    return this;
  }
});

Agent.prototype._setDefaults = function(req) {
    this._defaults.forEach(function(def) {
      req[def.fn].apply(req, def.arguments);
    });
};

module.exports = Agent;


/***/ }),

/***/ 231:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = __webpack_require__(105);

/**
 * Expose `RequestBase`.
 */

module.exports = RequestBase;

/**
 * Initialize a new `RequestBase`.
 *
 * @api public
 */

function RequestBase(obj) {
  if (obj) return mixin(obj);
}

/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in RequestBase.prototype) {
    obj[key] = RequestBase.prototype[key];
  }
  return obj;
}

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.clearTimeout = function _clearTimeout(){
  clearTimeout(this._timer);
  clearTimeout(this._responseTimeoutTimer);
  delete this._timer;
  delete this._responseTimeoutTimer;
  return this;
};

/**
 * Override default response body parser
 *
 * This function will be called to convert incoming data into request.body
 *
 * @param {Function}
 * @api public
 */

RequestBase.prototype.parse = function parse(fn){
  this._parser = fn;
  return this;
};

/**
 * Set format of binary response body.
 * In browser valid formats are 'blob' and 'arraybuffer',
 * which return Blob and ArrayBuffer, respectively.
 *
 * In Node all values result in Buffer.
 *
 * Examples:
 *
 *      req.get('/')
 *        .responseType('blob')
 *        .end(callback);
 *
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.responseType = function(val){
  this._responseType = val;
  return this;
};

/**
 * Override default request body serializer
 *
 * This function will be called to convert data set via .send or .attach into payload to send
 *
 * @param {Function}
 * @api public
 */

RequestBase.prototype.serialize = function serialize(fn){
  this._serializer = fn;
  return this;
};

/**
 * Set timeouts.
 *
 * - response timeout is time between sending request and receiving the first byte of the response. Includes DNS and connection time.
 * - deadline is the time from start of the request to receiving response body in full. If the deadline is too short large files may not load at all on slow connections.
 *
 * Value of 0 or false means no timeout.
 *
 * @param {Number|Object} ms or {response, deadline}
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.timeout = function timeout(options){
  if (!options || 'object' !== typeof options) {
    this._timeout = options;
    this._responseTimeout = 0;
    return this;
  }

  for(var option in options) {
    switch(option) {
      case 'deadline':
        this._timeout = options.deadline;
        break;
      case 'response':
        this._responseTimeout = options.response;
        break;
      default:
        console.warn("Unknown timeout option", option);
    }
  }
  return this;
};

/**
 * Set number of retry attempts on error.
 *
 * Failed requests will be retried 'count' times if timeout or err.code >= 500.
 *
 * @param {Number} count
 * @param {Function} [fn]
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.retry = function retry(count, fn){
  // Default to 1 if no count passed or true
  if (arguments.length === 0 || count === true) count = 1;
  if (count <= 0) count = 0;
  this._maxRetries = count;
  this._retries = 0;
  this._retryCallback = fn;
  return this;
};

var ERROR_CODES = [
  'ECONNRESET',
  'ETIMEDOUT',
  'EADDRINFO',
  'ESOCKETTIMEDOUT'
];

/**
 * Determine if a request should be retried.
 * (Borrowed from segmentio/superagent-retry)
 *
 * @param {Error} err
 * @param {Response} [res]
 * @returns {Boolean}
 */
RequestBase.prototype._shouldRetry = function(err, res) {
  if (!this._maxRetries || this._retries++ >= this._maxRetries) {
    return false;
  }
  if (this._retryCallback) {
    try {
      var override = this._retryCallback(err, res);
      if (override === true) return true;
      if (override === false) return false;
      // undefined falls back to defaults
    } catch(e) {
      console.error(e);
    }
  }
  if (res && res.status && res.status >= 500 && res.status != 501) return true;
  if (err) {
    if (err.code && ~ERROR_CODES.indexOf(err.code)) return true;
    // Superagent timeout
    if (err.timeout && err.code == 'ECONNABORTED') return true;
    if (err.crossDomain) return true;
  }
  return false;
};

/**
 * Retry request
 *
 * @return {Request} for chaining
 * @api private
 */

RequestBase.prototype._retry = function() {

  this.clearTimeout();

  // node
  if (this.req) {
    this.req = null;
    this.req = this.request();
  }

  this._aborted = false;
  this.timedout = false;

  return this._end();
};

/**
 * Promise support
 *
 * @param {Function} resolve
 * @param {Function} [reject]
 * @return {Request}
 */

RequestBase.prototype.then = function then(resolve, reject) {
  if (!this._fullfilledPromise) {
    var self = this;
    if (this._endCalled) {
      console.warn("Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises");
    }
    this._fullfilledPromise = new Promise(function(innerResolve, innerReject) {
      self.end(function(err, res) {
        if (err) innerReject(err);
        else innerResolve(res);
      });
    });
  }
  return this._fullfilledPromise.then(resolve, reject);
};

RequestBase.prototype.catch = function(cb) {
  return this.then(undefined, cb);
};

/**
 * Allow for extension
 */

RequestBase.prototype.use = function use(fn) {
  fn(this);
  return this;
};

RequestBase.prototype.ok = function(cb) {
  if ('function' !== typeof cb) throw Error("Callback required");
  this._okCallback = cb;
  return this;
};

RequestBase.prototype._isResponseOK = function(res) {
  if (!res) {
    return false;
  }

  if (this._okCallback) {
    return this._okCallback(res);
  }

  return res.status >= 200 && res.status < 300;
};

/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

RequestBase.prototype.get = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Get case-insensitive header `field` value.
 * This is a deprecated internal API. Use `.get(field)` instead.
 *
 * (getHeader is no longer used internally by the superagent code base)
 *
 * @param {String} field
 * @return {String}
 * @api private
 * @deprecated
 */

RequestBase.prototype.getHeader = RequestBase.prototype.get;

/**
 * Set header `field` to `val`, or multiple fields with one object.
 * Case-insensitive.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 * Case-insensitive.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 */
RequestBase.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Write the field `name` and `val`, or multiple fields with one object
 * for "multipart/form-data" request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 *
 * request.post('/upload')
 *   .field({ foo: 'bar', baz: 'qux' })
 *   .end(callback);
 * ```
 *
 * @param {String|Object} name
 * @param {String|Blob|File|Buffer|fs.ReadStream} val
 * @return {Request} for chaining
 * @api public
 */
RequestBase.prototype.field = function(name, val) {
  // name should be either a string or an object.
  if (null === name || undefined === name) {
    throw new Error('.field(name, val) name can not be empty');
  }

  if (this._data) {
    console.error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObject(name)) {
    for (var key in name) {
      this.field(key, name[key]);
    }
    return this;
  }

  if (Array.isArray(val)) {
    for (var i in val) {
      this.field(name, val[i]);
    }
    return this;
  }

  // val should be defined now
  if (null === val || undefined === val) {
    throw new Error('.field(name, val) val can not be empty');
  }
  if ('boolean' === typeof val) {
    val = '' + val;
  }
  this._getFormData().append(name, val);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */
RequestBase.prototype.abort = function(){
  if (this._aborted) {
    return this;
  }
  this._aborted = true;
  this.xhr && this.xhr.abort(); // browser
  this.req && this.req.abort(); // node
  this.clearTimeout();
  this.emit('abort');
  return this;
};

RequestBase.prototype._auth = function(user, pass, options, base64Encoder) {
  switch (options.type) {
    case 'basic':
      this.set('Authorization', 'Basic ' + base64Encoder(user + ':' + pass));
      break;

    case 'auto':
      this.username = user;
      this.password = pass;
      break;

    case 'bearer': // usage would be .auth(accessToken, { type: 'bearer' })
      this.set('Authorization', 'Bearer ' + user);
      break;
  }
  return this;
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

RequestBase.prototype.withCredentials = function(on) {
  // This is browser-only functionality. Node side is no-op.
  if (on == undefined) on = true;
  this._withCredentials = on;
  return this;
};

/**
 * Set the max redirects to `n`. Does noting in browser XHR implementation.
 *
 * @param {Number} n
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.redirects = function(n){
  this._maxRedirects = n;
  return this;
};

/**
 * Maximum size of buffered response body, in bytes. Counts uncompressed size.
 * Default 200MB.
 *
 * @param {Number} n
 * @return {Request} for chaining
 */
RequestBase.prototype.maxResponseSize = function(n){
  if ('number' !== typeof n) {
    throw TypeError("Invalid argument");
  }
  this._maxResponseSize = n;
  return this;
};

/**
 * Convert to a plain javascript object (not JSON string) of scalar properties.
 * Note as this method is designed to return a useful non-this value,
 * it cannot be chained.
 *
 * @return {Object} describing method, url, and data of this request
 * @api public
 */

RequestBase.prototype.toJSON = function() {
  return {
    method: this.method,
    url: this.url,
    data: this._data,
    headers: this._header,
  };
};

/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
 *      request.post('/user')
 *        .send('name=tobi')
 *        .send('species=ferret')
 *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.send = function(data){
  var isObj = isObject(data);
  var type = this._header['content-type'];

  if (this._formData) {
    console.error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObj && !this._data) {
    if (Array.isArray(data)) {
      this._data = [];
    } else if (!this._isHost(data)) {
      this._data = {};
    }
  } else if (data && this._data && this._isHost(this._data)) {
    throw Error("Can't merge these send calls");
  }

  // merge
  if (isObj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    // default to x-www-form-urlencoded
    if (!type) this.type('form');
    type = this._header['content-type'];
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!isObj || this._isHost(data)) {
    return this;
  }

  // default to json
  if (!type) this.type('json');
  return this;
};

/**
 * Sort `querystring` by the sort function
 *
 *
 * Examples:
 *
 *       // default order
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery()
 *         .end(callback)
 *
 *       // customized sort function
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery(function(a, b){
 *           return a.length - b.length;
 *         })
 *         .end(callback)
 *
 *
 * @param {Function} sort
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.sortQuery = function(sort) {
  // _sort default to true but otherwise can be a function or boolean
  this._sort = typeof sort === 'undefined' ? true : sort;
  return this;
};

/**
 * Compose querystring to append to req.url
 *
 * @api private
 */
RequestBase.prototype._finalizeQueryString = function(){
  var query = this._query.join('&');
  if (query) {
    this.url += (this.url.indexOf('?') >= 0 ? '&' : '?') + query;
  }
  this._query.length = 0; // Makes the call idempotent

  if (this._sort) {
    var index = this.url.indexOf('?');
    if (index >= 0) {
      var queryArr = this.url.substring(index + 1).split('&');
      if ('function' === typeof this._sort) {
        queryArr.sort(this._sort);
      } else {
        queryArr.sort();
      }
      this.url = this.url.substring(0, index) + '?' + queryArr.join('&');
    }
  }
};

// For backwards compat only
RequestBase.prototype._appendQueryString = function() {console.trace("Unsupported");}

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

RequestBase.prototype._timeoutError = function(reason, timeout, errno){
  if (this._aborted) {
    return;
  }
  var err = new Error(reason + timeout + 'ms exceeded');
  err.timeout = timeout;
  err.code = 'ECONNABORTED';
  err.errno = errno;
  this.timedout = true;
  this.abort();
  this.callback(err);
};

RequestBase.prototype._setTimeouts = function() {
  var self = this;

  // deadline
  if (this._timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self._timeoutError('Timeout of ', self._timeout, 'ETIME');
    }, this._timeout);
  }
  // response timeout
  if (this._responseTimeout && !this._responseTimeoutTimer) {
    this._responseTimeoutTimer = setTimeout(function(){
      self._timeoutError('Response timeout of ', self._responseTimeout, 'ETIMEDOUT');
    }, this._responseTimeout);
  }
};


/***/ }),

/***/ 232:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Module dependencies.
 */

var utils = __webpack_require__(233);

/**
 * Expose `ResponseBase`.
 */

module.exports = ResponseBase;

/**
 * Initialize a new `ResponseBase`.
 *
 * @api public
 */

function ResponseBase(obj) {
  if (obj) return mixin(obj);
}

/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in ResponseBase.prototype) {
    obj[key] = ResponseBase.prototype[key];
  }
  return obj;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

ResponseBase.prototype.get = function(field) {
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

ResponseBase.prototype._setHeaderProperties = function(header){
    // TODO: moar!
    // TODO: make this a util

    // content-type
    var ct = header['content-type'] || '';
    this.type = utils.type(ct);

    // params
    var params = utils.params(ct);
    for (var key in params) this[key] = params[key];

    this.links = {};

    // links
    try {
        if (header.link) {
            this.links = utils.parseLinks(header.link);
        }
    } catch (err) {
        // ignore
    }
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

ResponseBase.prototype._setStatusProperties = function(status){
    var type = status / 100 | 0;

    // status / class
    this.status = this.statusCode = status;
    this.statusType = type;

    // basics
    this.info = 1 == type;
    this.ok = 2 == type;
    this.redirect = 3 == type;
    this.clientError = 4 == type;
    this.serverError = 5 == type;
    this.error = (4 == type || 5 == type)
        ? this.toError()
        : false;

    // sugar
    this.accepted = 202 == status;
    this.noContent = 204 == status;
    this.badRequest = 400 == status;
    this.unauthorized = 401 == status;
    this.notAcceptable = 406 == status;
    this.forbidden = 403 == status;
    this.notFound = 404 == status;
};


/***/ }),

/***/ 233:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.type = function(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

exports.params = function(str){
  return str.split(/ *; */).reduce(function(obj, str){
    var parts = str.split(/ *= */);
    var key = parts.shift();
    var val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Parse Link header fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

exports.parseLinks = function(str){
  return str.split(/ *, */).reduce(function(obj, str){
    var parts = str.split(/ *; */);
    var url = parts[0].slice(1, -1);
    var rel = parts[1].split(/ *= */)[1].slice(1, -1);
    obj[rel] = url;
    return obj;
  }, {});
};

/**
 * Strip content related fields from `header`.
 *
 * @param {Object} header
 * @return {Object} header
 * @api private
 */

exports.cleanHeader = function(header, shouldStripCookie){
  delete header['content-type'];
  delete header['content-length'];
  delete header['transfer-encoding'];
  delete header['host'];
  if (shouldStripCookie) {
    delete header['cookie'];
  }
  return header;
};


/***/ }),

/***/ 27:
/***/ (function(module, exports, __webpack_require__) {

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var SystemSettings = __webpack_require__(45);

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

/***/ }),

/***/ 338:
/***/ (function(module, exports) {

//Abstract
//Takes the name of the storage
var BaseStorage = function (args) {
	if (args) {
		try {
			//webpack was crying here. It wouldnt let it build without this. Window does not exist server side.
			if (window.finsemble.storageModels) {
				window.finsemble.storageModels[args[0]] = this;
			}
		} catch (e) {}
	}
	this.setBaseName = function (baseName) {
		this.baseName = baseName;
	};

	this.setUser = function (user) {
		this.userName = user;
	};

	this.save = function (params) {};

	this.get = function (params) {};

	this.keys = function (params) {};

	this.delete = function (params) {};

	this.clearCache = function (params) {};

	this.empty = function () {};
	this.getMultiple = function (query) {};

	// return full underlying key (based baseName + userName + topic + key)
	this.getCombinedKey = function (self, params) {
		return self.baseName + ":" + self.userName + ":" + params.topic + ":" + params.key;
	};

	// return prefix used to filter keys
	this.getKeyPreface = function (self, params) {
		var preface = self.baseName + ":" + self.userName + ":" + params.topic + ":";
		if ("keyPrefix" in params) {
			preface = preface + params.keyPrefix;
		}
		return preface;
	};
};

module.exports = BaseStorage;

/***/ }),

/***/ 34:
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



var RouterClientConstructor = __webpack_require__(66);

module.exports = new RouterClientConstructor({ clientName: "RouterClient" });

/***/ }),

/***/ 378:
/***/ (function(module, exports, __webpack_require__) {

var BaseStorage = __webpack_require__(338);
var Request = __webpack_require__(120);
var Logger = __webpack_require__(11);

var Redis = function () {

	BaseStorage.call(this, arguments);
	this.save = function (params, cb) {
		Logger.system.debug("redis-params", params);
		Request.post("/redis").set("Content-Type", "application/x-www-form-urlencoded").send({
			key: this.getCombinedKey(this, params),
			value: JSON.stringify(params.value)
		}).end(function (err, res) {
			return cb(err, res.body);
		});
	};

	this.get = function (params, cb) {
		var self = this;
		Request.get("/redis").query({
			key: this.getCombinedKey(this, params)
		}).end(function (err, res) {

			var returnValue = res.text ? res.text : null;
			return cb(err, JSON.parse(returnValue));
		});
	};

	this.keys = function (params, cb) {
		Logger.system.debug("call to keys", params);
		var self = this;
		Request.get("/redis").query({
			keys: true
		}).end(function (err, res) {
			Logger.system.debug("keys response:" + JSON.stringify(res.text));
			var keys = [];
			var keyPreface = self.getKeyPreface(self, params);
			var keysRegExp = new RegExp(keyPreface + ".*"); // regex to find all keys for this topic
			var allKeys = JSON.parse(res.text);
			for (var i = 0, len = allKeys.length; i < len; ++i) {
				var oneKey = allKeys[i];
				Logger.system.debug("keyPrefix=" + keyPreface);
				if (keysRegExp.test(oneKey)) {
					// if key is for this topic then save it
					keys.push(oneKey);
				}
			}
			Logger.system.debug("Storage.keys for keyPreface=" + keyPreface + " with keys=" + keys);
			return cb(err, keys);
		});
	};

	this.delete = function (params, cb) {
		Logger.system.debug("call to delete", params);
		Request.delete("/redis").query({
			key: this.getCombinedKey(this, params)
		}).end(function (err, res) {
			return cb(err, res.texts);
		});
	};
	this.clearCache = function (params, cb) {
		Logger.system.debug("call to delete", params);
		Request.delete("/redis/user").query({
			key: this.baseName + ":" + this.userName
		}).end(function (err, res) {
			return cb(err, res.texts);
		});
	};

	this.empty = function () {

		return { status: "success" };
	};

	this.getMultiple = function (query) {};
};

Redis.prototype = new BaseStorage();
new Redis("redis");
module.exports = Redis; //Allows us to get access to the unintialized object

/***/ }),

/***/ 45:
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
		return currentDiagLevel >= 4;
	};
};

module.exports = new SystemSettings();

/***/ }),

/***/ 66:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/



var RouterTransport = __webpack_require__(106);
var Utils = __webpack_require__(17);
var ConfigUtil = __webpack_require__(71);
var Validate = __webpack_require__(27); // Finsemble args validator
var queue = []; // should never be used, but message sent before router ready will be queue

var Logger = __webpack_require__(11);
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

/***/ }),

/***/ 71:
/***/ (function(module, exports, __webpack_require__) {

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

var FSBLUtils = __webpack_require__(17);
var Logger = __webpack_require__(11);

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

/***/ })

/******/ });
//# sourceMappingURL=redis.js.map