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

class MongoStorageAdapter extends BaseStorage {
	constructor(uuid) {
		super(arguments);

		Logger.system.log("MongoStorageAdapter init");
		this.baseURL = "http://localhost:3001";

		this.ROUTES = {
			SAVE: `${this.baseURL}/save`,
			GET: `${this.baseURL}/get`,
			KEYS: `${this.baseURL}/keys`,
			DELETE: `${this.baseURL}/delete`
		};
	}

	/**
	 * Get method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {function} cb Callback to be invoked upon completion.
	 */
	get = function(params, cb) {
		console.log('get')
		let combinedKey = this.getCombinedKey(this, params);
		
		fetch(`${this.ROUTES.GET}?key=${combinedKey}`)
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

	/**
	 * Save method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {any} params.value The value being saved.
	 * @param {function} cb Callback to be invoked upon save completion.
	 */
	save = function(params, cb) {
		let combinedKey = this.getCombinedKey(this, params);

		Logger.system.debug("Mongo.save for key=" + combinedKey + " with data=" + params.value);
		
		fetch(`${this.ROUTES.SAVE}`, {
			method: "POST",
			body: JSON.stringify({ key: combinedKey, value: params.value }),
			headers: {
				"Content-Type": "application/json"
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
	 * Returns all keys stored in MongoDB for the user and an optional topic and keyPrefix.
	 *
	 * @param {object} params
	 * @param {string} params.topic The topic (optional).
	 * @param {string} params.keyPrefix The key prefix (optional).
	 * @param {function} cb
	 */
	keys = function(params, cb) {
		const keyPreface = this.getKeyPreface(params);

		fetch(`${this.ROUTES.KEYS}?param=${keyPreface}`)
			.then(response => response.json())
			.then(data => {
				Logger.system.debug("Mongo.get for keys" + keyPreface + " data=", data.value);
				cb(null, data.value);
			})
			.catch(err => {
				Logger.system.error("Mongo.get keys" + keyPreface + ", Error", err);
				cb(err, { status: "failed" });
			});
	};

	/**
	 * Delete method.
	 * @param {object} params
	 * @param {string} params.topic The topic under which the data is stored.
	 * @param {string} params.key The key whose value is being deleted.
	 * @param {function} cb Callback to be invoked upon completion.
	 */
	delete = function(params, cb) {
		let combinedKey = this.getCombinedKey(this, params);

		Logger.system.debug("Mongo.delete for key=" + combinedKey);


		fetch(`${this.ROUTES.DELETE}`, {
			method: "DELETE",
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

	/**
	 * Get the prefix used to filter keys with an optional topic and keyPrefix.
	 * Note that if topic is not provided, keyPrefix is also ignored.
	 *
	 * @param {object} params
	 * @param {string} params.topic The topic (optional).
	 * @param {string} params.keyPrefix The key prefix (optional).
	 * @private
	 */
	getKeyPreface = function(params) {
		const keyPrefix = "keyPrefix" in params ? params.keyPrefix : "";
		if (params && params.topic){
			return `${this.getUserPreface()}${params.topic}:${keyPrefix}`;
		} else {
			return `${this.getUserPreface()}`;
		}

		return preface;
	};

	/**
	 * Get prefix for all the users stored data.
	 * @private
	 */
	getUserPreface = function() {
		const preface = `${this.baseName}:${this.userName}:`;
		return preface;
	};

	/**
	 * This method should be used very, very judiciously. It's essentially a method designed to wipe the database for a
	 * particular user.
	 */
	clearCache = function(params, cb) {
		Logger.system.error("clearCache is not implemented for the MongoStorageAdapter");
	};

	/**
	 * Wipes the storage container.
	 * @param {function} cb
	 */
	empty = function(cb) {
		Logger.system.error("empty is not implemented for the MongoStorageAdapter");
	};
}

let mongoAdapter = new MongoStorageAdapter("MongoStorageAdapter")
module.exports = mongoAdapter; // Allows us to get access to the uninitialized object
