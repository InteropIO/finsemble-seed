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