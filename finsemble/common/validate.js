/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var SystemSettings = require("./systemSettings");

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