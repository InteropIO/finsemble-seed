/**
 * IndexDB Storage Adapter.
 * 
 * We have a baseStorage model that provides some methods, such as `getCombinedKey`, which will return a nice key to 
 * save our value under. Example: `Finsemble:defaultUser:finsemble:activeWorkspace`. That key would hold the value of 
 * our activeWorkspace.
 */
import finsemble from "@chartiq/finsemble";
import dexie from "dexie";

const BaseStorage = finsemble.models.baseStorage;
const Logger = finsemble.Clients.Logger;

// Because calls to this storage adapter will likely come from many different windows, we will log successes and 
// failures in the central logger.
Logger.start();

const IndexDBAdapter = function () {
	BaseStorage.call(this, arguments);

	const db = new dexie("finsemble");
	db.version(1).stores({
		fsbl: "key" //only index the storage keys
	});

	Logger.system.debug("IndexDBAdapter init");
	console.debug("IndexDBAdapter init");

	/**
	 * Save method.
	 * 
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {any} params.value The value being saved.
	 * @param {function} cb callback to be invoked upon save completion
	 */
	this.save = (params, cb) => {
		Logger.system.debug("IndexDBAdapter.save, params: ", params);
		console.debug("IndexDBAdapter.save, params: ", params);
		const combinedKey = this.getCombinedKey(this, params);

		dexie
			.spawn(function* () {
				yield db.fsbl.put({ key: combinedKey, value: params.value });
			})
			.then(() => {
				// spawn() returns a promise that completes when all is done.
				return cb(null, { status: "success" });
			})
			.catch((err) => {
				console.error("Failed: " + JSON.stringify(err, null, "\t"));
				return cb(err, { status: "failed" });
			});
	};

	/**
	 * Get method.
	 * 
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {function} cb callback to be invoked upon completion
	 */
	this.get = (params, cb) => {
		Logger.system.debug("IndexDBAdapter.get, params: ", params);
		console.debug("IndexDBAdapter.get, params: ", params);

		const combinedKey = this.getCombinedKey(this, params);

		dexie
			.spawn(function* () {
				const val = yield db.fsbl
					.where("key")
					.equals(combinedKey)
					.first();
				Logger.system.debug("IndexDBAdapter.get for key=" + combinedKey + " raw val=" + val);
				console.debug("IndexDBAdapter.get for key=" + combinedKey + " val=", val);
				const data = val && val.value ? val.value : {};
				cb(null, data);
			})
			.catch((err) => {
				Logger.system.error("IndexDBAdapter.get Error", err, "key=" + combinedKey);
				return cb(err, { status: "failed" });
			});
	};

	/**
	 * return prefix used to filter keys
	 * @param {*} self 
	 * @param {*} params 
	 */
	this.getKeyPreface = (self, params) => {
		const keyPrefix = "keyPrefix" in params ? params.keyPrefix : "";
		const preface = `${self.baseName}:${self.userName}:${params.topic}:${keyPrefix}`;

		return preface;
	};

	/**
	 * Returns all keys stored in IndexDB.
	 * 
	 * @param {*} params
	 * @param {*} cb
	 */
	this.keys = (params, cb) => {
		let keys = [];
		const keyPreface = this.getKeyPreface(this, params);

		dexie
			.spawn(function* () {
				keys = yield db.fsbl.where("key").startsWith(keyPreface).primaryKeys();
				Logger.system.debug("IndexDBAdapter.keys for keyPreface=" + keyPreface + " with keys=", keys);
				console.debug("IndexDBAdapter.keys for keyPreface=" + keyPreface + " with keys=", keys);
				cb(null, keys);
			})
			.catch((err) => {
				Logger.system.error("Failed to retrieve IndexDBAdapter.keys Error", err, "key=" + combinedKey);
				console.error("Failed to retrieve IndexDBAdapter.keys Error", err, "key=" + combinedKey);
				return cb(err, { status: "failed" });
			});
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
		Logger.system.debug("IndexDBAdapter.delete for key=" + combinedKey);
		console.debug("IndexDBAdapter.delete for key=" + combinedKey);
		dexie
			.spawn(function* () {
				yield db.fsbl.delete(combinedKey);
				cb(null, { status: "success" });
			})
			.catch((err) => {
				Logger.system.error("IndexDBAdapter.delete Error", err, "key=" + combinedKey);
				cb(err, { status: "failed" });
			});
	};

	/**
	 * This method should be used very, very judiciously. It's essentially a method designed to wipe the database for a 
	 * particular user.
	 */
	this.clearCache = (params, cb) => {
		const keyPreface = self.baseName + ":" + self.userName;

		dexie
			.spawn(function* () {
				yield db.fsbl.where("key").startsWith(keyPreface).delete();
				Logger.system.debug("IndexDBAdapter.clearCache for keyPreface=" + keyPreface);
				console.debug("IndexDBAdapter.clearCache for keyPreface=" + keyPreface);
				cb();
			})
			.catch((err) => {
				Logger.system.debug("IndexDBAdapter.clearCache failed Error", err, "keyPreface=" + keyPreface);
				console.debug("IndexDBAdapter.clearCache failed Error", err, "keyPreface=" + keyPreface);
				cb(err, { status: "failed" });
			});
	};

	/**
	 * Wipes the storage container.
	 * @param {function} cb
	 */
	this.empty = (cb) => {
		dexie
			.spawn(function* () {
				yield db.fsbl.clear();
				Logger.system.debug("IndexDBAdapter.empty");
				console.debug("IndexDBAdapter.empty");
				cb(null, { status: "success" });
			})
			.catch((err) => {
				Logger.system.debug("IndexDBAdapter.empty failed Error", err);
				console.debug("IndexDBAdapter.empty failed Error", err);
				cb(err, { status: "failed" });
			});
	};
};

IndexDBAdapter.prototype = new BaseStorage();
new IndexDBAdapter("IndexDBAdapter");