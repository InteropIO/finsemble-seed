import finsemble from "@chartiq/finsemble";

// A Badly behaved IndexedDebAdapter for storage service testing. Do not use this except to test how resiliant your code is to storage failures!

// To test
// add an entry to build / webpack / webpack.adapters.entries.json
// add a config.json for your adapter under `dataStoreAdapters`
// change your config.json `defaultStorage` to point to this test adapter.

/**
 * Maximum delay to be applied to get and save operations in millseconds. Actual delay is random but bounded by this amount.
 */
const getMaxDelay = 11000;
const saveMaxDelay = 12000;

/**
 * Chance that any get or save operation will fail (after the delay) with an artifical error message.
 */
const getFailChance = 0.02;
const saveFailChance = 0.1;


// #region 
const BaseStorage = finsemble.models.baseStorage;
const Logger = finsemble.Clients.Logger;
Logger.start();

/**
 * The schema version for the IndexedDB. Changing this signals onupgradeneeded so the existing database can be upgraded
 * to the new schema.
 */
const SCHEMA_VERSION = 1;

/**
 * Flag indicating that the IndexedDB connection is initialized. Will be set in releaseQueue after the connection has been created and any schema version changes applied.
 */
let initialized = false;

// #region 
/** 
 * PolyFill IDBKeyRange for a key prefix search. 
 * 
 * In IndexedDB, Primary keys are ordered, and a key range is used to selectively retrieve them without having 
 * to iterate the whole set and test each. We use string keys built up with various prefixes. This polyfill makes it 
 * possible to easily retrieve all keys with a specified prefix.
 * 
 * @param prefix The string by which to filter the primary keys.
 */
IDBKeyRange.forPrefix = (prefix) => {
	/** 
	 * Determines the string that would sort immediately after all strings with the specified prefix and hence can be 
	 * used as the upper bound for an IDBKeyRange to retrieve all keys with a specified prefix (where the lower bound is 
	 * the prefix itself). 
	 * 
	 * @param key 
	 */
	const successor = (key) => {
		let len = key.length;
		while (len > 0) {
			const head = key.substring(0, len - 1);
			const tail = key.charCodeAt(len - 1);

			if (tail !== 0xFFFF) {
				return head + String.fromCharCode(tail + 1);
			}

			key = head;
			--len;
		}

		return UPPER_BOUND.STRING;
	}

	const upperKey = successor(prefix);
	if (upperKey === undefined) {
		return IDBKeyRange.lowerBound(prefix);
	}

	return IDBKeyRange.bound(prefix, upperKey, false, true);
};
// #endregion

/**
 * IndexDB Storage Adapter.
 * 
 * We have a baseStorage model that provides some methods, such as `getCombinedKey`, which will return a nice key to 
 * save our value under. Example: `Finsemble:defaultUser:finsemble:activeWorkspace`. That key would hold the value of 
 * our activeWorkspace.
 */
const BadIndexedDBAdapter = function () {
	// #region Initializes a new instance of the IndexedDBAdapter.
	BaseStorage.call(this, arguments);

	/**
	 * The IndexedDB instance.
	 */
	this.db;

	/**
	 * Array of commands received before the IndexedDB is initialized. These commands are executed once the connection
	 * has been established.
	 */
	this.queue = [];

	Logger.system.debug("BadIndexedDBAdapter init");
	console.debug("BadIndexedDBAdapter init");

	// #region Initialize IndexedDB connection.
	// Open the IndexedDB connection
	const request = window.indexedDB.open("finsemble", SCHEMA_VERSION);

	// Create the object store if necessary 
	request.onupgradeneeded = (event) => {
		// Save the IDBDatabase interface 
		this.db = event.target.result;

		// Create an objectStore for this database
		const objectStore = this.db.createObjectStore("fsbl", { keyPath: "key" });

		// Use transaction oncomplete to make sure the objectStore creation is 
		// finished before adding data into it.
		objectStore.transaction.oncomplete = () => {
			Logger.system.debug("BadIndexedDBAdapter object store created");
			console.debug("BadIndexedDBAdapter object store created");
			this.releaseQueue();
		};
	};

	request.onsuccess = (event) => {
		Logger.system.debug("BadIndexedDBAdapter initialized successfully");
		console.debug("BadIndexedDBAdapter initialized successfully");

		this.db = event.target.result;
		this.releaseQueue();
	};

	request.onerror = (err) => {
		Logger.system.error("BadIndexedDBAdapter DB connection initialization failed, Error: ", err);
		console.error("BadIndexedDBAdapter DB connection initialization failed, Error: ", err);
	};
	// #endregion
	// #endregion

	/**
	 * Get the prefix used to filter keys for particular topics and key prefixes.
	 * 
	 * @param {object} params 
	 * @param {string} params.topic The topic
	 * @param {string} params.keyPrefix The key prefix (optional).
	 * @private
	 */
	this.getKeyPreface = (params) => {
		const keyPrefix = "keyPrefix" in params ? params.keyPrefix : "";
		const preface = `${this.getUserPreface()}:${params.topic}:${keyPrefix}`;

		return preface;
	}

	/**
	 * Get prefix for all the users stored data.
	 * @private
	 */
	this.getUserPreface = () => {
		const preface = `${this.baseName}:${this.userName}`;
		return preface;
	}

	/**
	 * Process the commands queued for execution after the IndexedDB connection is established.
	 * @private
	 */
	this.releaseQueue = () => {
		initialized = true;
		Logger.system.debug(`BadIndexedDBAdapter.releaseQueue: ${this.queue.length} commands`);
		console.debug(`BadIndexedDBAdapter.releaseQueue: ${this.queue.length} commands`);

		while (this.queue.length) {
			const action = this.queue.shift();
			this[action.method].apply(this, action.args);
		}
	}
	// #region Interface Methods
	/**
	 * This method should be used very, very judiciously. It's essentially a method designed to wipe the database for a 
	 * particular user.
	 */
	this.clearCache = (params, cb) => {
		if (!initialized) {
			Logger.system.debug("queuing", "clearCache", [params, cb]);
			console.debug("queuing", "clearCache", [params, cb]);
			this.queue.push({ method: "clearCache", args: [params, cb] });
			return;
		}

		setTimeout(() => {
			const userPreface = this.getUserPreface(this);

			Logger.system.debug("BadIndexedDBAdapter.clearCache for userPreface=" + userPreface);
			console.debug("BadIndexedDBAdapter.clearCache for userPreface=" + userPreface);

			const keyRange = IDBKeyRange.forPrefix(userPreface);
			const objectStore = this.db.transaction(["fsbl"], "readwrite").objectStore("fsbl");
			const request = objectStore.delete(keyRange);

			request.onsuccess = () => {
				Logger.system.debug("BadIndexedDBAdapter.clearCache Success: userPreface=" + userPreface);
				console.debug("BadIndexedDBAdapter.clearCache Success: userPreface=" + userPreface);

				cb();
			};

			request.onerror = (err) => {
				Logger.system.error("BadIndexedDBAdapter.clearCache failed Error", err, "userPreface=" + userPreface);
				console.error("BadIndexedDBAdapter.clearCache failed Error", err, "userPreface=" + userPreface);

				return cb(err, { status: "failed" });
			};			
		}, delay);
	}

	/**
	 * Delete method.
	 * 
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being deleted.
	 * @param {function} cb callback to be invoked upon completion
	 */
	this.delete = (params, cb) => {
		if (!initialized) {
			Logger.system.debug("queuing", "delete", [params, cb]);
			console.debug("queuing", "delete", [params, cb]);
			this.queue.push({ method: "delete", args: [params, cb] });
			return;
		}

		const combinedKey = this.getCombinedKey(this, params);

		Logger.system.debug("BadIndexedDBAdapter.delete for key=" + combinedKey);
		console.debug("BadIndexedDBAdapter.delete for key=" + combinedKey);

		const objectStore = this.db.transaction(["fsbl"], "readwrite").objectStore("fsbl");
		const request = objectStore.delete(combinedKey);

		request.onsuccess = () => {
			Logger.system.debug("BadIndexedDBAdapter.delete key=" + combinedKey + ", Success");
			console.debug("BadIndexedDBAdapter.delete key=" + combinedKey + ", Success");

			cb(null, { status: "success" });
		};

		request.onerror = (err) => {
			Logger.system.error("BadIndexedDBAdapter.delete key=" + combinedKey + ", Error", err);
			console.error("BadIndexedDBAdapter.delete key=" + combinedKey + ", Error", err);

			return cb(err, { status: "failed" });
		};
	}

	/**
	 * Wipes the storage container.
	 * @param {function} cb
	 */
	this.empty = (cb) => {
		if (!initialized) {
			Logger.system.debug("queuing", "empty", [cb]);
			console.debug("queuing", "empty", [cb]);
			this.queue.push({ method: "empty", args: [cb] });
			return;
		}

		Logger.system.debug("BadIndexedDBAdapter.empty");
		console.debug("BadIndexedDBAdapter.empty");

		const objectStore = this.db.transaction(["fsbl"], "readwrite").objectStore("fsbl");
		const request = objectStore.clear();

		request.onerror = (err) => {
			Logger.system.error("BadIndexedDBAdapter.empty failed Error", err);
			console.error("BadIndexedDBAdapter.empty failed Error", err);

			return cb(err, { status: "failed" });
		};

		request.onsuccess = () => {
			Logger.system.debug("BadIndexedDBAdapter.empty Success");
			console.debug("BadIndexedDBAdapter.empty Success");

			cb();
		};
	}

	/**
	 * Get method.
	 * 
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {function} cb callback to be invoked upon completion
	 */
	this.get = (params, cb) => {
		if (!initialized) {
			Logger.system.debug("queuing", "get", [params, cb]);
			console.debug("queuing", "get", [params, cb]);
			this.queue.push({ method: "get", args: [params, cb] });
			return;
		}

		setTimeout(() => {
			const combinedKey = this.getCombinedKey(this, params);
			if (Math.random() <= getFailChance) {
				Logger.system.error("BadIndexedDBAdapter.get key=" + combinedKey + ", Artificial failure");
				console.error("BadIndexedDBAdapter.get key=" + combinedKey + ", Artificial failure");

				cb("Artificial failure", { status: "failed" });

			}  else {
				Logger.system.debug("BadIndexedDBAdapter.get, params: ", params);
				console.debug("BadIndexedDBAdapter.get, params: ", params, cb);

				
				const objectStore = this.db.transaction(["fsbl"], "readwrite").objectStore("fsbl");
				const request = objectStore.get(combinedKey);

				request.onsuccess = (event) => {
					let data;
					if(event.target.result) data = event.target.result.value;

					Logger.system.debug("BadIndexedDBAdapter.get for key=" + combinedKey + " data=", data);
					console.debug("BadIndexedDBAdapter.get for key=" + combinedKey + " data=", data);

					cb(null, data);
				};

				request.onerror = (err) => {
					Logger.system.error("BadIndexedDBAdapter.get key=" + combinedKey + ", Error", err);
					console.error("BadIndexedDBAdapter.get key=" + combinedKey + ", Error", err);

					cb(err, { status: "failed" });
				};
			}
		}, Math.floor(Math.random() * getMaxDelay));
	}

	/**
	 * Returns all keys stored in IndexDB.
	 * 
	 * @param {object} params
	 * @param {function} cb
	 */
	this.keys = (params, cb) => {
		if (!initialized) {
			Logger.system.debug("queuing", "keys", [params, cb]);
			console.debug("queuing", "keys", [params, cb]);
			this.queue.push({ method: "keys", args: [params, cb] });
			return;
		}

		const keyPreface = this.getKeyPreface(params);
		const keyRange = IDBKeyRange.forPrefix(keyPreface);
		const objectStore = this.db.transaction(["fsbl"], "readwrite").objectStore("fsbl");
		const request = objectStore.getAllKeys(keyRange);

		request.onsuccess = (event) => {
			// Get results, if defined, otherwise default to an empty array
			const data = event.target.result ? event.target.result : [];

			// Remove the keyPreface from the key, the methods add the key preface back in.
			const keys = data
				.map(key => key.replace(keyPreface, ""));

			Logger.system.debug(`BadIndexedDBAdapter.keys for keyPreface=${keyPreface} keys=`, keys);
			console.debug(`BadIndexedDBAdapter.get keys keyPreface=${keyPreface} keys=`, keys);

			cb(null, keys);
		};

		request.onerror = (err) => {
			Logger.system.error("Failed to retrieve BadIndexedDBAdapter.keys keyPreface=" + keyPreface + ", Error", err);
			console.error("Failed to retrieve BadIndexedDBAdapter.keys keyPreface=" + keyPreface + ", Error", err);

			return cb(err, { status: "failed" });
		};
	}

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
		if (!initialized) {
			Logger.system.debug("queuing", "save", [params, cb]);
			console.debug("queuing", "save", [params, cb]);
			this.queue.push({ method: "save", args: [params, cb] });
			return;
		}

		setTimeout(() => {
			const combinedKey = this.getCombinedKey(this, params);
				
			if (Math.random() <= saveFailChance) {
				Logger.system.error("BadIndexedDBAdapter.save key=" + combinedKey + ", Artificial failure");
				console.error("BadIndexedDBAdapter.save key=" + combinedKey + ", Artificial failure");

				cb("Artificial failure", { status: "failed" });

			} else {
				Logger.system.debug("BadIndexedDBAdapter.save, params: ", params);
				console.debug("BadIndexedDBAdapter.save, params: ", params);

				const objectStore = this.db.transaction(["fsbl"], "readwrite").objectStore("fsbl");
				const request = objectStore.put({ key: combinedKey, value: params.value });

				request.onsuccess = () => {
					Logger.system.debug("BadIndexedDBAdapter.save Request Succeeded");
					console.debug("BadIndexedDBAdapter.save Request Succeeded");

					cb(null, { status: "success" });
				};

				request.onerror = (err) => {
					Logger.system.error("BadIndexedDBAdapter.save Request Failed: ", err);
					console.error("BadIndexedDBAdapter.save Request Failed: ", err);

					cb(err, { status: "failed" });
				};
			}
			
		}, Math.floor(Math.random() * saveMaxDelay));
	}
	// #endregion
}

BadIndexedDBAdapter.prototype = new BaseStorage();
new BadIndexedDBAdapter("BadIndexedDBAdapter");