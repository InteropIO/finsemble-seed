var BaseStorage = require("@chartiq/finsemble").models.baseStorage;
var Logger = require("@chartiq/finsemble").Clients.Logger;
Logger.start();

var LocalStorageee = function (uuid) {
	debugger
	BaseStorage.call(this, arguments);

	this.save = function (params, cb) {
		Logger.system.debug("savingggg", params);
		var combinedKey = this.getCombinedKey(this, params);
		try {
			localStorage.setItem(combinedKey, JSON.stringify(params.value));
		} catch (err) {
			Logger.system.error("Storage.saving Error", err,  "key=" + combinedKey, "value=", params.value);
		}
		Logger.system.debug("Storage.save for key=" + combinedKey + " with data=" + params.value);
		return cb(null, { status: "success" });
	};

	this.get = function (params, cb) {
		var combinedKey =this.getCombinedKey(this, params);
		try {
			var data = JSON.parse(localStorage.getItem(combinedKey));
		} catch (err) {
			Logger.system.error("Storage.getItem Error", err,  "key=" + combinedKey);
		}
		Logger.system.debug("Storage.getItem for key=" + combinedKey + " with data=" + data);
		return cb(null, data);
	};

	this.keys = function (params, cb) {
		var keys = [];
		var keyPreface = this.getKeyPreface(this, params);
		var keysRegExp = new RegExp(keyPreface + ".*"); // regex to find all keys for this topic

		for (var i = 0, len = localStorage.length; i < len; ++i ) {
  			var oneKey = localStorage.key(i);
			if (keysRegExp.test(oneKey)) { // if key is for this topic then save it
				keys.push(oneKey);
			}
		}

		Logger.system.debug("Storage.keys for keyPreface=" + keyPreface + " with keys=" + keys);
		return cb(null, keys);
	};

	this.delete = function (params, cb) {
		var combinedKey = this.getCombinedKey(this, params);
		localStorage.removeItem(combinedKey);
		Logger.system.debug("Storage.delete for key=" + combinedKey);
		return cb(null, { status: "success" });
	};
	this.clearCache = function (params, cb) {
		console.log("clear local cache");
		var arr = []; // Array to hold the keys
		// Iterate over localStorage and insert the keys that meet the condition into arr
		for (var i = 0; i < localStorage.length; i++){
			console.log("localStorage.key(i):::",localStorage.key(i).substring(0,(this.baseName + ":" + this.userName).length));
			if (localStorage.key(i).substring(0,(this.baseName + ":" + this.userName).length) ===  this.baseName + ":" + this.userName) {
				arr.push(localStorage.key(i));
			}
		}

		// Iterate over arr and remove the items by key
		for (var i = 0; i < arr.length; i++) {
			console.log("remove Iem",arr[i]);
			localStorage.removeItem(arr[i]);
		}
		return cb();
	};

	this.empty = function (cb) {
		localStorage.clear();
		Logger.system.debug("Storage.empty");
		return cb(null, { status: "success" });
	};

	// placehold -- not used
	this.getMultiple = function (query, cb) {
		var i, results = [];
		for (i in localStorage) {
			if (localStorage.hasOwnProperty(i)) {
				if (i.match(query) || (!query && typeof i === "string")) {
					try {
						value = JSON.parse(localStorage.getItem(i));
					} catch (err) {
						Logger.system.error("Storage.getMultiple Error", err,  "key=" + i);
					}
					results.push({ key: i, val: value });
				}
			}
		}
		Logger.system.debug("results", results);
		return cb(null, results);
	};
};


LocalStorageee.prototype = new BaseStorage();
new LocalStorageee("localStorageee");
module.exports = LocalStorageee;//Allows us to get access to the unintialized object