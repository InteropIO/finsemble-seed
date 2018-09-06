/**
 * IndexDB Storage Adapter.
 */

/**
 * We have a baseStorage model that provides some methods, such as `getCombinedKey`, which will return a nice key to save our value under. Example: `Finsemble:defaultUser:finsemble:activeWorkspace`. That key would hold the value of our activeWorkspace.
 */
// var BaseStorage = require("@chartiq/finsemble").models.baseStorage;
// var Logger = require("@chartiq/finsemble").Clients.Logger;
// var Dexie = require('dexie');

import finsemble from "@chartiq/finsemble";
import Dexie from 'dexie';
var BaseStorage = finsemble.models.baseStorage;
var Logger = finsemble.Clients.Logger;


// var BaseStorage = require("@chartiq/finsemble").models.baseStorage;
// var Logger = require("@chartiq/finsemble").Clients.Logger;
// var Dexie = require('dexie');


//Because calls to this storage adapter will likely come from many different windows, we will log successes and failures in the central logger.
Logger.start();

Logger.system.debug("IndexDBAdapter", Dexie);
console.debug("IndexDBAdapter", Dexie);

var IndexDBAdapter = function (uuid) {
	BaseStorage.call(this, arguments);

	var db = new Dexie('finsemble');
	db.version(1).stores({
		fsbl: `key` //only index the storage keys
	});

	Logger.system.debug("IndexDBAdapter init");
	console.debug("IndexDBAdapter init");
	/**
	 * Save method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {any} params.value The value being saved.
	 * @param {function} cb callback to be invoked upon save completion
	 */
	this.save = function (params, cb) {
		Logger.system.debug("saving", params);
		const combinedKey = this.getCombinedKey(this, params);
		
		Dexie.spawn(function*() {
			yield db.fsbl.put({key: combinedKey, value: params.value});
		}).then(function() {
		   // spawn() returns a promise that completes when all is done.
		   return cb(null, { status: "success" });
		}).catch(function(e) {
		   console.error("Failed: " + e);
		   //TODO: can't help think this should be (but localstorage adapter doesn't return errors...)
		   //return cb({ status: "failed" }, null);
		});
	};

	/**
	 * Get method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {function} cb callback to be invoked upon completion
	 */
	this.get = function (params, cb) {

		Logger.system.debug("IndexDBAdapter.get, params: ", params);
		console.debug("IndexDBAdapter.get, params: ", params);

		const combinedKey = this.getCombinedKey(this, params);
	
		Dexie.spawn(function*() {
			let val = yield db.fsbl
				.where('key').equals(combinedKey).first();
			Logger.system.debug("Storage.getItem for key=" + combinedKey + " raw val=" + val);
			console.debug("Storage.getItem for key=" + combinedKey + " val=", val);
			let data = {};
			if (val && val.value) {
			 	data = val.value;
			 }
			// Logger.system.debug("Storage.getItem for key=" + combinedKey + " with data=" + data);
			cb(null, data);
		}).catch(function(err) {
			Logger.system.error("Storage.getItem Error", err, "key=" + combinedKey);
			return cb(null, {});
			//TODO: can't help think this should be (but localstorage adapter doesn't return errors...)
			//return cb({ status: "failed" }, null);
		});
	};

	// return prefix used to filter keys
	this.getKeyPreface = function (self, params) {
		let preface = self.baseName + ":" + self.userName + ":" + params.topic + ":";
		if ("keyPrefix" in params) {
			preface = preface + params.keyPrefix;
		}
		return preface;
	};

	/**
	 * Returns all keys stored in localstorage.
	 * @param {*} params
	 * @param {*} cb
	 */
	this.keys = function (params, cb) {
		let keys = [];
		const keyPreface = this.getKeyPreface(this, params);
		
		Dexie.spawn(function*() {
			keys = yield db.fsbl.where('key').startsWith(keyPreface).primaryKeys();
			Logger.system.debug("Storage.keys for keyPreface=" + keyPreface + " with keys=" + keys);
			cb(null, keys);
		}).catch(function(err) {
			Logger.system.error("Failed to retrieve Storage.keys Error", err, "key=" + combinedKey);
			return cb(null, []);
			//TODO: can't help think this should be (but localstorage adapter doesn't return errors...)
			//return cb({ status: "failed" }, null);
		});
	};

	/**
	 * Delete method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being deleted.
	 * @param {function} cb callback to be invoked upon completion
	 */
	this.delete = function (params, cb) {
		const combinedKey = this.getCombinedKey(this, params);
		Logger.system.debug("Storage.delete for key=" + combinedKey);
		Dexie.spawn(function*() {
			yield db.fsbl.delete(combinedKey);
			cb(null, { status: "success" });
		}).catch(function(err) {
			Logger.system.error("Storage.delete failed Error", err, "key=" + combinedKey);
			cb(null, { status: "success" });
			//TODO: can't help think this should be (but localstorage adapter doesn't return errors...)
			//return cb({ status: "failed" }, null);
		});
	};

	/**
	 * This method should be used very, very judiciously. It's essentially a method designed to wipe the database for a particular user.
	 */
	this.clearCache = function (params, cb) {
		const preface = self.baseName + ":" + self.userName;

		Dexie.spawn(function*() {
			yield db.fsbl.where('key').startsWith(keyPreface).delete();
			Logger.system.debug("Storage.clearCache for keyPreface=" + keyPreface);
			cb();
		}).catch(function(err) {
			Logger.system.debug("Storage.clearCache failed Error", err, "keyPreface=" + keyPreface);
			cb();
			//TODO: can't help think this should be (but localstorage adapter doesn't return errors...)
			//return cb({ status: "failed" }, null);
		});
	};

	/**
	 * Wipes the storage container.
	 * @param {function} cb
	 */
	this.empty = function (cb) {
		Dexie.spawn(function*() {
			yield db.fsbl.clear();
			Logger.system.debug("Storage.empty");
			cb(null, { status: "success" });
		}).catch(function(err) {
			Logger.system.debug("Storage.empty failed Error", err);
			cb(null, { status: "success" });
			//TODO: can't help think this should be (but localstorage adapter doesn't return errors...)
			//return cb({ status: "failed" }, null);
		});
	};

};


IndexDBAdapter.prototype = new BaseStorage();
new IndexDBAdapter("IndexDBAdapter");

//module.exports = IndexDBAdapter;//Allows us to get access to the unintialized object