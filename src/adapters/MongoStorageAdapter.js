/**
 * This file is an example of using MongoDB as the default storage for finsemble-seed. It is based on the built-in IndexedDB storage adapter, which is the seed project's default storage adapter.
 * It's provided as an example. Feel free to modify, add to, or erase parts of it.
 *
 * This example utilizes an Express server on localhost:3001 to communicate with a local MongoDB server running on port 27017.
 * See https://github.com/sonyl-ciq/mongodb-express for an example of this Express server.
 */


/**
 * We have a baseStorage model that provides some methods, such as `getCombinedKey`, which will return a nice key to save our value under. Example: `Finsemble:defaultUser:finsemble:activeWorkspace`. That key would hold the value of our activeWorkspace.
 */
const BaseStorage = require("@chartiq/finsemble").models.baseStorage;
const Logger = require("@chartiq/finsemble").Clients.Logger;

// Because calls to this storage adapter will likely come from many different windows, we will log successes and failures in the central logger.
Logger.start();

const MongoStorageAdapter = function (uuid) {
	BaseStorage.call(this, arguments);

	Logger.system.log("MongoStorageAdapter init");

	// This baseURL is the middleware to allow communication with MongoDB.
	this.baseURL = "http://localhost:3001"; 

	/**
	 * Save method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {any} params.value The value being saved.
	 * @param {function} cb Callback to be invoked upon save completion.
	 */
	this.save = function (params, cb) {
		let combinedKey = this.getCombinedKey(this, params);

		Logger.system.debug("Mongo.save for key=" + combinedKey + " with data=" + params.value);
		
		fetch(`${this.baseURL}/save`, {
			method: 'POST',
			body: JSON.stringify({ key: combinedKey, value: params.value }),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(data => {
			cb(null, { status: "success" });
		})		
		.catch(err => {
			Logger.system.error("Mongo.save Error", err, "key=" + combinedKey, "value=", params.value);
			cb(err, { status: "failed" });
		});
	};

	/**
	 * Get method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {function} cb Callback to be invoked upon completion.
	 */
	this.get = function (params, cb) {
		let combinedKey = this.getCombinedKey(this, params);
		
		fetch(`${this.baseURL}/get?key=${combinedKey}`)
			.then(response => response.json())
			.then(data => {
				Logger.system.debug("Mongo.get for key=" + combinedKey + " data=", data.value);
				cb(null, data.value);
			})
			.catch(err => {
				Logger.system.error("Mongo.get key=" + combinedKey + ", Error", err);
				cb(err, { status: "failed" });
			});
	};

	// Return prefix used to filter keys.
	this.getKeyPreface = function (self, params) {
		let preface = self.baseName + ":" + self.userName + ":" + params.topic + ":";
		if ("keyPrefix" in params) {
			preface = preface + params.keyPrefix;
		}
		return preface;
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

		Logger.system.debug("Mongo.delete for key=" + combinedKey);


		fetch(`${this.baseURL}/delete`, {
			method: 'DELETE',
			body: JSON.stringify({ key: combinedKey }),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(data => {
			cb(null, { status: "success" });
		})		
		.catch(err => {
			Logger.system.error("Mongo.delete key=" + combinedKey + ", Error", err);
			cb(err, { status: "failed" });
		});
	};
};


MongoStorageAdapter.prototype = new BaseStorage();
new MongoStorageAdapter("MongoStorageAdapter");
module.exports = MongoStorageAdapter;//Allows us to get access to the uninitialized object
