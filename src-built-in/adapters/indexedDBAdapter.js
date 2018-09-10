import finsemble from "@chartiq/finsemble";

const BaseStorage = finsemble.models.baseStorage;
const Logger = finsemble.Clients.Logger;

// Because calls to this storage adapter will likely come from many different windows, we will log successes and 
// failures in the central logger.
Logger.start();

/**
 * IndexDB Storage Adapter.
 * 
 * We have a baseStorage model that provides some methods, such as `getCombinedKey`, which will return a nice key to 
 * save our value under. Example: `Finsemble:defaultUser:finsemble:activeWorkspace`. That key would hold the value of 
 * our activeWorkspace.
 */
const IndexedDBAdapter = function () {
	BaseStorage.call(this, arguments);
	let db;

	Logger.system.debug("IndexedDBAdapter init");
	console.debug("IndexedDBAdapter init");

	// Open the IndexedDB connection
	const request = window.indexedDB.open("finsemble");

	// Create the object store if necessary 
	request.onupgradeneeded = (event) => {
		// Save the IDBDatabase interface 
		db = event.target.result;

		// Create an objectStore for this database
		const objectStore = db.createObjectStore("fsbl", { keyPath: "key" });

		// Use transaction oncomplete to make sure the objectStore creation is 
		// finished before adding data into it.
		objectStore.transaction.oncomplete = () => {
			Logger.system.debug("IndexedDBAdapter object store created");
			console.debug("IndexedDBAdapter object store created");
		};

	};

	request.onsuccess = (event) => {
		Logger.system.debug("IndexedDBAdapter initialized successfully");
		console.debug("IndexedDBAdapter initialized successfully");

		db = event.target.result;
	};

	request.onerror = (err) => {
		Logger.system.error("IndexedDBAdapter DB connection initialization failed, Error: ", err);
		console.error("IndexedDBAdapter DB connection initialization failed, Error: ", err);
	};
	
	// PolyFill IDBKeyRange for a key prefix search
	IDBKeyRange.forPrefix = (prefix) => {
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
		if (upperKey) {
			return IDBKeyRange.lowerBound(prefix);
		}

		return IDBKeyRange.bound(prefix, upperKey, false, true);
	};

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
		Logger.system.debug("IndexedDBAdapter.save, params: ", params);
		console.debug("IndexedDBAdapter.save, params: ", params);

		const combinedKey = this.getCombinedKey(this, params);
		const objectStore = db.transaction(["fsbl"], "readwrite").objectStore("fsbl");
		const request = objectStore.put({ key: combinedKey, value: params.value });

		request.onsuccess = () => {
			Logger.system.debug("IndexedDBAdapter.save Request Succeeded");
			console.debug("IndexedDBAdapter.save Request Succeeded");
			
			cb(null, { status: "success" });
		};

		request.onerror = (err) => {
			Logger.system.error("IndexedDBAdapter.save Request Failed: ", err);
			console.error("IndexedDBAdapter.save Request Failed: ", err);
			
			cb(err, { status: "failed" });
		};
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
		Logger.system.debug("IndexedDBAdapter.get, params: ", params);
		console.debug("IndexedDBAdapter.get, params: ", params);

		const combinedKey = this.getCombinedKey(this, params);
		const objectStore = db.transaction(["fsbl"], "readwrite").objectStore("fsbl");
		const request = objectStore.get(combinedKey);

		request.onsuccess = (event) => {
			const data = event.target.result && event.target.result.value ? event.target.result.value : {};

			Logger.system.debug("IndexedDBAdapter.get for key=" + combinedKey + " data=", data);
			console.debug("IndexedDBAdapter.get for key=" + combinedKey + " data=", data);
			
			cb(null, data);
		};

		request.onerror = (err) => {
			Logger.system.error("IndexedDBAdapter.get key=" + combinedKey + ", Error", err);
			console.error("IndexedDBAdapter.get key=" + combinedKey + ", Error", err);
			
			cb(err, { status: "failed" });
		};
	};

	/**
	 * Get the prefix used to filter keys for particular topics and key prefixes.
	 * 
	 * @param {object} params 
	 * @param {string} params.topic The topic
	 * @param {string} params.keyPrefix The key prefix (optional).
	 */
	this.getKeyPreface = (params) => {
		const keyPrefix = "keyPrefix" in params ? params.keyPrefix : "";
		const preface = `${this.getUserPreface()}:${params.topic}:${keyPrefix}`;

		return preface;
	};

	/**
	 * Get prefix for all the users stored data.
	 */
	this.getUserPreface = () => {
		const preface = `${this.baseName}:${this.userName}`;
		return preface;
	};

	/**
	 * Returns all keys stored in IndexDB.
	 * 
	 * @param {object} params
	 * @param {function} cb
	 */
	this.keys = (params, cb) => {
		const keyPreface = this.getKeyPreface(params);
		const keyRange = IDBKeyRange.forPrefix(keyPreface);
		const objectStore = db.transaction(["fsbl"], "readwrite").objectStore("fsbl");
		const request = objectStore.getAllKeys(keyRange);

		request.onsuccess = (event) => {
			const data = event.target.result && event.target.result.value ? event.target.result : [];

			Logger.system.debug("IndexedDBAdapter.keys for keyPreface=" + keyPreface + " keys=", data);
			console.debug("IndexedDBAdapter.get keys keyPreface=" + keyPreface + " keys=", data);
			
			cb(null, data);
		};

		request.onerror = (err) => {
			Logger.system.error("Failed to retrieve IndexedDBAdapter.keys keyPreface=" + keyPreface + ", Error", err);
			console.error("Failed to retrieve IndexedDBAdapter.keys keyPreface=" + keyPreface + ", Error", err);
			
			return cb(err, { status: "failed" });
		};
	};

	/**
	 * Delete method.
	 * 
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being deleted.
	 * @param {function} cb callback to be invoked upon completion
	 */
	this.delete = (params, cb) => {
		const combinedKey = this.getCombinedKey(this, params);

		Logger.system.debug("IndexedDBAdapter.delete for key=" + combinedKey);
		console.debug("IndexedDBAdapter.delete for key=" + combinedKey);

		const objectStore = db.transaction(["fsbl"], "readwrite").objectStore("fsbl");
		const request = objectStore.delete(combinedKey);

		request.onsuccess = () => {
			Logger.system.debug("IndexedDBAdapter.delete key=" + combinedKey + ", Success");
			console.debug("IndexedDBAdapter.delete key=" + combinedKey + ", Success");
			
			cb(null, { status: "success" });
		};

		request.onerror = (err) => {
			Logger.system.error("IndexedDBAdapter.delete key=" + combinedKey + ", Error", err);
			console.error("IndexedDBAdapter.delete key=" + combinedKey + ", Error", err);

			return cb(err, { status: "failed" });
		};
	};

	/**
	 * This method should be used very, very judiciously. It's essentially a method designed to wipe the database for a 
	 * particular user.
	 */
	this.clearCache = (params, cb) => {
		const userPreface = this.getUserPreface(this);

		Logger.system.debug("IndexedDBAdapter.clearCache for userPreface=" + userPreface);
		console.debug("IndexedDBAdapter.clearCache for userPreface=" + userPreface);

		const keyRange = IDBKeyRange.forPrefix(userPreface);
		const objectStore = db.transaction(["fsbl"], "readwrite").objectStore("fsbl");
		const request = objectStore.delete(keyRange);

		request.onsuccess = () => {
			Logger.system.debug("IndexedDBAdapter.clearCache Success: userPreface=" + userPreface);
			console.debug("IndexedDBAdapter.clearCache Success: userPreface=" + userPreface);
			
			cb();
		};

		request.onerror = (err) => {
			Logger.system.error("IndexedDBAdapter.clearCache failed Error", err, "userPreface=" + userPreface);
			console.error("IndexedDBAdapter.clearCache failed Error", err, "userPreface=" + userPreface);

			return cb(err, { status: "failed" });
		};
	};

	/**
	 * Wipes the storage container.
	 * @param {function} cb
	 */
	this.empty = (cb) => {
		Logger.system.debug("IndexedDBAdapter.empty");
		console.debug("IndexedDBAdapter.empty");

		const objectStore = db.transaction(["fsbl"], "readwrite").objectStore("fsbl");
		const request = objectStore.clear();

		request.onerror = (err) => {
			Logger.system.error("IndexedDBAdapter.empty failed Error", err);
			console.error("IndexedDBAdapter.empty failed Error", err);

			return cb(err, { status: "failed" });
		};

		request.onsuccess = () => {
			Logger.system.debug("IndexedDBAdapter.empty Success");
			console.debug("IndexedDBAdapter.empty Success");

			cb();
		};
	};
};

IndexedDBAdapter.prototype = new BaseStorage();
new IndexedDBAdapter("IndexedDBAdapter");