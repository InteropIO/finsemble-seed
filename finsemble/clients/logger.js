/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
"use strict";

const LOCAL_ONLY_DEFAULT = false; // if true all logging will default to local console; will be overwritten by LoggerService's registration response

// capture everything at startup; will be filtered later as needed when LoggerService's registration response provides settings; overhead here is not too high
var DEFAULT_LOG_SETTING = { Error: true, Warn: true, Info: true, Log: true, Debug: true, Verbose: true, LocalOnly: LOCAL_ONLY_DEFAULT }; // if true captured for logger
var CONSOLE_DEFAULT_LOG_SETTING = { Error: true, Warn: true, Info: true, Log: true, Debug: true }; // if true then goes to console and captured for logger

const MAX_QUEUE_SIZE = 10 * 1000; // maximum logger queue size; plenty of space although shouldn't need much since continuely sending to logger if working correctly;

var Validate = require("../common/validate"); // Finsemble args validator
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
		RouterClient = require("./routerClientInstance");
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
