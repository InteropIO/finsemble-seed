/*
* We have a baseStorage model that provides some methods, such as `getCombinedKey`, which will return a nice key to save our value under. Example: `Finsemble:defaultUser:finsemble:activeWorkspace`. That key would hold the value of our activeWorkspace.
*/
var BaseStorage = require("@chartiq/finsemble").models.baseStorage;
var { Clients: { Logger } } = require("@chartiq/finsemble");
//Because calls to this storage adapter will likely come from many different windows, we will log successes and failures in the central logger.
Logger.start();

const IntraSessionStorageAdapter = function () {
	// #region Initializes a new instance of the IntraSessionStorageAdapter.
	BaseStorage.call(this, arguments);

	this.myStorage = {};

	/**
	 * Save method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {any} params.value The value being saved.
	 * @param {function} cb callback to be invoked upon save completion
	 */
	this.save = (params, cb) => {
		//retrieves a key that looks like this:
		//applicationUUID:userName:topic:key
		const combinedKey = this.getCombinedKey(this, params);

		//We just assign the value to the key on our storage object. _easy_.
		this.myStorage[combinedKey] = params.value;

		return cb(null, { status: "success" });
	};

	/**
	 * Get method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {function} cb callback to be invoked upon completion
	 */
	this.get = (params, cb) => {
		const combinedKey = this.getCombinedKey(this, params);
		const data = this.myStorage[combinedKey];
		let err = null;
		if (!data) {
			err = `No data found for key ${params.key}`
		}
		return cb(err, data);
	};

	/**
	 * Returns all keys that we're saving data for.
	 * @param {*} params
	 * @param {*} cb
	 */
	this.keys = (params, cb) => {
		//need to implement
		return cb(null, keys);
	};

	/**
	 * Delete method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being deleted.
	 * @param {function} cb callback to be invoked upon completion
	 */
	this.delete = (params, cb) => {
		const combinedKey = this.getCombinedKey(this, params);
		let err = null;
		if (this.myStorage[combinedKey]) {
			delete this.myStorage[combinedKey];
		} else {
			err = `No data found for key ${params.key}`
		}
		cb(err, null);
	};

	/**
	 * This method should be used very, very judiciously. It's essentially a method designed to wipe the database for a particular user.
	 */
	this.clearCache = (params, cb) => {
		//need to implement
		return cb();
	};

	/**
	 * Wipes the storage container.
	 * @param {function} cb
	 */
	this.empty = (cb) => {
		//todo need to implement
	};
}

new IntraSessionStorageAdapter("IntraSessionStorageAdapter");