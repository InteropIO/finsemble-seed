/**
 * This file is a copy of the default MongoStorage adapter, the default storage model used by finsemble-seed.
 * It's provided as an example. Feel free to modify, add to, or erase parts of it.
 *
 * Core Finsemble calls are written with key-value pair databases in mind. If you want to use a different database type, you will need to translate the key/value pairs passed in from finsemble so that you can successfully retrieve them at a later time.
 */

/**
 * We have a baseStorage model that provides some methods, such as `getCombinedKey`, which will return a nice key to save our value under. Example: `Finsemble:defaultUser:finsemble:activeWorkspace`. That key would hold the value of our activeWorkspace.
 */
const BaseStorage = require("@chartiq/finsemble").models.baseStorage;
const Logger = require("@chartiq/finsemble").Clients.Logger;
// Because calls to this storage adapter will likely come from many different windows, we will log successes and failures in the central logger.
Logger.start();

const MongoStorageAdapter = function (uuid) {
	const baseURL = "http://localhost:3001";
	BaseStorage.call(this, arguments);

	Logger.system.log("MongoStorageAdapter init");
	console.log("MongoStorageAdapter init");

	/**
	 * Save method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {any} params.value The value being saved.
	 * @param {function} cb Callback to be invoked upon save completion.
	 */
	this.save = function (params, cb) {
		Logger.system.debug("MongoStorageAdapter.save, params: ", params);
		console.debug("MongoStorageAdapter.save, params: ", params);

		let combinedKey = this.getCombinedKey(this, params);
		try {
			Logger.system.debug("MongoStorageAdapter.save for key=" + combinedKey + " with data=" + params.value);
			MongoStorage.setItem(combinedKey, JSON.stringify(params.value));
			cb(null, { status: "success" });
		} catch (err) {
			Logger.system.error("MongoStorageAdapter.save Error", err, "key=" + combinedKey, "value=", params.value);
			cb(err, { status: "failed" });
		}
	};

	/**
	 * Get method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {function} cb Callback to be invoked upon completion.
	 */
	/*this.get = async (params, cb) => {
		console.log('get');
		let combinedKey = this.getCombinedKey(this, params);
		Logger.system.debug("MongoStorageAdapter.get, params: ", params);
		console.debug("MongoStorageAdapter.get, params: ", params);

			console.log('get')
	
			const data = await fetch(baseURL + `/get?topic=${params.topic}&key=${params.key}`);		
			let returnValue;
			let err;
			try {
				returnValue = await data.json();
				console.log(returnValue)
			} catch(e) {
				err = `No data found for key ${params.key}, ${e}`;
				console.log(err);	
				const workspace = await FSBL.Clients.WorkspaceClient.createWorkspace();
				const name = await workspace.name();
				console.log('workspacename',name);
				
				this.save(workspace, (e) => {
					console.log(e)
				});
			}
	
			return cb(err, 1);

	};*/

	this.get = (params, cb) => {
		return cb(null, 1)
	}

	// Return prefix used to filter keys.
	this.getKeyPreface = function (self, params) {
		let preface = self.baseName + ":" + self.userName + ":" + params.topic + ":";
		if ("keyPrefix" in params) {
			preface = preface + params.keyPrefix;
		}
		return preface;
	};

	/**
	 * Returns all keys stored in MongoStorage of a given topic and keyPrefix.
	 *
	 * MongoStorage is synchronous, so the callback is optional (the function
	 * immediately returns the results if the callback is omitted).
	 *
	 * @param {*} params An object that must include the topic and keyPrefix of the desired keys.
	 * @param {*} cb An optional callback that will be passed any errors that occurred and the found keys.
	 */
	this.keys = function (params, cb) {
			/**
			 * Daniel H. 1/3/2019 - Validate.args is still broken, so I'm doing it ad-hoc here.
			 * @TODO Replace ad-hoc validation with Validate.args. */
		let errMessage;
		if (!params) {
			errMessage = "You must pass params to MongoStorageAdapter.keys";
		} else {
			const missingArgs = params && ["topic", "keyPrefix"].filter(k => !params[k]);
			if (missingArgs.length) {
				errMessage = `Missing parameters to MongoStorageAdapter.keys: ${missingArgs.join(", ")}`;
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
		try {

			for (let i = 0, len = MongoStorage.length; i < len; ++i) {
				const oneKey = MongoStorage.key(i);

				// If key is for this topic then save it
				if (oneKey.startsWith(keyPreface)) {
					// Remove keyPreface from the keys returned. Finsemble storage adapter methods add the preface back in.
					const fsblKey = oneKey.replace(keyPreface, "");
					keys.push(fsblKey);
				}
			}

			Logger.system.debug(`MongoStorageAdapter.keys for keyPreface=${keyPreface} keys=`, keys);
			console.debug(`MongoStorageAdapter.get keys keyPreface=${keyPreface} keys=`, keys);
			cb(null, keys);
		} catch (err) {
			Logger.system.error("Failed to retrieve MongoStorageAdapter.keys keyPreface=" + keyPreface + ", Error", err);
			console.error("Failed to retrieve MongoStorageAdapter.keys keyPreface=" + keyPreface + ", Error", err);
			cb(err, { status: "failed" });
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
		let combinedKey = this.getCombinedKey(this, params);

		Logger.system.debug("MongoStorageAdapter.delete for key=" + combinedKey);
		console.debug("MongoStorageAdapter.delete for key=" + combinedKey);

		try {
			MongoStorage.removeItem(combinedKey);
			Logger.system.debug("MongoStorageAdapter.delete key=" + combinedKey + ", Success");
			console.debug("MongoStorageAdapter.delete key=" + combinedKey + ", Success");
			cb(null, { status: "success" });
		} catch (err) {
			Logger.system.error("MongoStorageAdapter.delete key=" + combinedKey + ", Error", err);
			console.error(".delete key=" + combinedKey + ", Error", err);
			cb(err, { status: "failed" });
		}
	};

	/**
	 * This method should be used very, very judiciously. It's essentially a method designed to wipe the database for a particular user.
	 */
	this.clearCache = function (params, cb) {
		//console.log("clear local cache");
		Logger.system.debug("MongoStorageAdapter.clearCache for userPreface=" + userPreface);
		console.debug("MongoStorageAdapter.clearCache for userPreface=" + userPreface);

		try {
			let arr = []; // Array to hold the keys
			// Iterate over MongoStorage and insert data related to the user into an array.
			for (let i = 0; i < MongoStorage.length; i++) {
				//console.log("MongoStorage.key(i):::", MongoStorage.key(i).substring(0, (this.baseName + ":" + this.userName).length));
				if (MongoStorage.key(i).substring(0, (this.baseName + ":" + this.userName).length) === this.baseName + ":" + this.userName) {
					arr.push(MongoStorage.key(i));
				}
			}

			// Iterate over arr and remove the items by key
			for (let i = 0; i < arr.length; i++) {
				//console.log("remove Iem", arr[i]);
				MongoStorage.removeItem(arr[i]);
			}
			Logger.system.log("MongoStorageAdapter.clearCache Success: userPreface=" + userPreface);
			console.log("MongoStorageAdapter.clearCache Success: userPreface=" + userPreface);

			cb(null, { status: "success" });
		} catch (err) {
			Logger.system.error("MongoStorageAdapter.clearCache failed Error", err, "userPreface=" + userPreface);
			console.error("MongoStorageAdapter.clearCache failed Error", err, "userPreface=" + userPreface);

			cb(err, { status: "failed" });
		}
	};

	/**
	 * Wipes the storage container.
	 * @param {function} cb
	 */
	this.empty = function (cb) {
		Logger.system.log("MongoStorageAdapter.empty");
		console.log("MongoStorageAdapter.empty");

		try {
			MongoStorage.clear();
			Logger.system.log("MongoStorageAdapter.empty Success");
			console.log("MongoStorageAdapter.empty Success");

			cb(null, { status: "success" });
		} catch (err) {
			Logger.system.error("MongoStorageAdapter.empty failed Error", err);
			console.error("MongoStorageAdapter.empty failed Error", err);
			cb(err, { status: "failed" });
		}
	};
};


MongoStorageAdapter.prototype = new BaseStorage();
new MongoStorageAdapter("MongoStorageAdapter");
module.exports = MongoStorageAdapter;//Allows us to get access to the uninitialized object
