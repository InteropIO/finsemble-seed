/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

var Utils = require("../common/util");
var Validate = require("../common/validate"); // Finsemble args validator

var Logger = require("./logger");

Logger.system.log("Starting StorageClient");

/**
 *
 */
var BaseClient = require("./baseClient");

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


