/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

"use strict";
var Utils = require("../common/util");
var Validate = require("../common/validate"); // Finsemble args validator
var BaseClient = require("./baseClient");

var Logger = require("./logger");
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