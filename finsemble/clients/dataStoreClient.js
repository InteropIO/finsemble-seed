/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var Dispatcher = require("flux").Dispatcher;

var Utils = require("../common/util");
var Validate = require("../common/validate"); // Finsemble args validator

var BaseClient = require("./baseClient");
var Logger = require("./logger");
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
		StoreModel = require("./StoreModel");
		storeClient.load(cb);

	},
	name: "dataStoreClient"
});


window.dataStoreClient = storeClient;
storeClient.requiredServices = [];
module.exports = storeClient;
