/**
 * This file is a copy of the default localStorage adapter, the default storage model used by finsemble-seed.
 * It's provided as an example. Feel free to modify, add to, or erase parts of it.
 *
 * Core Finsemble calls are written with key-value pair databases in mind. If you want to use a different database type, you will need to translate the key/value pairs passed in from finsemble so that you can successfully retrieve them at a later time.
 */

/**
 * We have a baseStorage model that provides some methods, such as `getCombinedKey`, which will return a nice key to save our value under. Example: `Finsemble:defaultUser:finsemble:activeWorkspace`. That key would hold the value of our activeWorkspace.
 */
var BaseStorage = require("@chartiq/finsemble").models.baseStorage;
var Logger = require("@chartiq/finsemble").Clients.Logger;
// Because calls to this storage adapter will likely come from many different windows, we will log successes and failures in the central logger.
Logger.start();

var LocalStorageAdapter = function (uuid) {
	BaseStorage.call(this, arguments);
	/**
	 * Save method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {any} params.value The value being saved.
	 * @param {function} cb Callback to be invoked upon save completion.
	 */
	this.save = function (params, cb) {
		Logger.system.debug("saving", params);
		var combinedKey = this.getCombinedKey(this, params);
		try {
			localStorage.setItem(combinedKey, JSON.stringify(params.value));
		} catch (err) {
			Logger.system.error("Storage.saving Error", err, "key=" + combinedKey, "value=", params.value);
		}
		Logger.system.debug("Storage.save for key=" + combinedKey + " with data=" + params.value);
		return cb(null, { status: "success" });
	};

	/**
	 * Get method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {function} cb Callback to be invoked upon completion.
	 */
	this.get = function (params, cb) {
		var combinedKey = this.getCombinedKey(this, params);
		try {
			var data = JSON.parse(localStorage.getItem(combinedKey));
		} catch (err) {
			Logger.system.error("Storage.getItem Error", err, "key=" + combinedKey);
		}
		Logger.system.debug("Storage.getItem for key=" + combinedKey + " with data=" + data);
		return cb(null, data);
	};

	// Return prefix used to filter keys.
	this.getKeyPreface = function (self, params) {
		var preface = self.baseName + ":" + self.userName + ":" + params.topic + ":";
		if ("keyPrefix" in params) {
			preface = preface + params.keyPrefix;
		}
		return preface;
	};

	/**
	 * Returns all keys stored in localstorage of a given topic and keyPrefix.
	 * 
	 * LocalStorage is synchronous, so the callback is optional (the function
	 * immediately returns the results if the callback is ommitted).
	 * 
	 * @param {*} params An object that must include the topic and keyPrefix of the desired keys.
	 * @param {*} cb An optional callback that will be passed any errors that occured and the found keys.
	 */
	this.keys = function (params, cb) {
			/**
			 * Daniel H. 1/3/2019 - Validate.args is still broken, so I'm doing it ad-hoc here.
			 * @TODO Replace ad-hoc validation with Validate.args. */
		let errMessage;
		if (!params) {
			errMessage = "You must pass params to localStorageAdapter.keys";
		} else {
			const missingArgs = params && ["topic", "keyPrefix"].filter(k => !params[k]);
			if (missingArgs.length) {
				errMessage = `Missing parameters to localStorageAdapter.keys: ${missingArgs.join(", ")}`;
			}
		}

		if (errMessage) {
			if (cb) {
				cb(errMessage)
			} else {
				throw new Error(errMessage);
			}
		}

		const keys = [];
		const keyPreface = this.getKeyPreface(this, params);

		for (let i = 0, len = localStorage.length; i < len; ++i) {
			const oneKey = localStorage.key(i);
			
			// If key is for this topic then save it.
			if (oneKey.startsWith(keyPreface)) {
				// Remove keyPreface from the keys returned. Finsemble storage adapter methods add the preface back in.
				const fsblKey = oneKey.replace(keyPreface, "");
				keys.push(fsblKey);
			}
		}

		Logger.system.debug(`Storage.keys for keyPreface=${keyPreface} with keys=`, keys);

		if (cb) {
			cb(null, keys);
		} else {
			return keys;
		}
	};

	/**
	 * Delete method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being deleted.
	 * @param {function} cb Callback to be invoked upon completion.
	 */
	this.delete = function (params, cb) {
		var combinedKey = this.getCombinedKey(this, params);
		localStorage.removeItem(combinedKey);
		Logger.system.debug("Storage.delete for key=" + combinedKey);
		return cb(null, { status: "success" });
	};

	/**
	 * This method should be used very, very judiciously. It's essentially a method designed to wipe the database for a particular user.
	 */
	this.clearCache = function (params, cb) {
	//console.log("clear local cache");
		var arr = []; // Array to hold the keys.
		// Iterate over localStorage and insert data related to the user into an array.
		for (var i = 0; i < localStorage.length; i++) {
		//console.log("localStorage.key(i):::", localStorage.key(i).substring(0, (this.baseName + ":" + this.userName).length));
			if (localStorage.key(i).substring(0, (this.baseName + ":" + this.userName).length) === this.baseName + ":" + this.userName) {
				arr.push(localStorage.key(i));
			}
		}

		// Iterate over arr and remove the items by key.
		for (var i = 0; i < arr.length; i++) {
		//console.log("remove Iem", arr[i]);
			localStorage.removeItem(arr[i]);
		}
		return cb();
	};

	/**
	 * Wipes the storage container.
	 * @param {function} cb
	 */
	this.empty = function (cb) {
		localStorage.clear();
		Logger.system.debug("Storage.empty");
		return cb(null, { status: "success" });
	};
};


LocalStorageAdapter.prototype = new BaseStorage();
new LocalStorageAdapter("LocalStorageAdapter");

module.exports = LocalStorageAdapter; // Allows us to get access to the unintialized object.
