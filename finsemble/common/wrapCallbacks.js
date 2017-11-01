'use strict';

var Logger = require("../clients/logger");

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