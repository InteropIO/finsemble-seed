var async = require("async");
var storeUtils = require("../common/storeUtils");
var Logger = require("./logger");
Logger.system.log("Starting DataStoreModelClient");

/**
 *
 * @introduction
 * <h2>Store Model</h2>
 * The store model is the store instances. This handles getters/setters of data
 * @hideConstructor true
 * @class
 */

var StoreModel = function (params, routerClient) {

	this.routerClient = routerClient;
	var isGlobal = params.global;
	var self = this;
	this.name = params.store ? params.store : "finsemble";
	this.values = params.values ? params.values : {};
	var listeners = [];
	this.lst = listeners;
	this.registeredDispatchListeners = [];
	var mapping = {};
	storeUtils.initObject(this.values, null, mapping);

	/** @member {Object}  - This is the flux dispatcher. It can be used dispatch actions accross stores. These action are not caught inside of the global store service. https://facebook.github.io/flux/docs/overview.html

	* @example
	store.Dispatcher.register(function(action){
		if(action.actionType === "ACTION1"){

		// Do something with the action here
		}


	});

	store.Dispatcher.dispatch({actionType:ACTION1,data:myData});
	*/

	this.Dispatcher = {
		register: function (fn) {
			self.registeredDispatchListeners.push(fn);
		},
		dispatch: function (data) {
			self.routerClient.transmit("storeService.dispatch", data);
		}
	};
	this.routerClient.addListener("storeService.dispatch", function (err, message) {
		for (var i=0; i < self.registeredDispatchListeners.length; i++) {
			self.registeredDispatchListeners[i](message.data);
		}
	});

	/**
	 * Set a value in the store. Two events will be triggered with topics of: store and field.
	 * @param {Object} params - Params object
	 * @param {String} params.field - The name of the field where data will be stored
	 * @param {String} params.value - Value to be stored
	 * @returns {null}
	 *
	 * @example
	 * store.setValue({field:'field1',value:"new value"});
	 */
	this.setValue = function (params, cb) {
		if (!params.field) { Logger.system.error("no field provided", params); }
		if (!params.hasOwnProperty("value")) { Logger.system.error("no value provided", params); }
		if (isGlobal) {

			var data = {
				store: self.name,
				field: params.field,
				value: params.value
			};
			return dataStoreClient.routerClient.query("storeService.setValue", data, function (err) {
				return cb ? cb() : null;
			});

		}
		var removals = storeUtils.checkForObjectChange(this.values, params.field, mapping);

		storeUtils.setPath(this.values, params.field, params.value);

		storeUtils.mapField(this.values, params.field, mapping);

		if (removals) { sendRemovals(removals); }

		var combined = this.name + (params.field ? "." + params.field : "");

		//triggerListeners(combined, params.value);
		triggerListeners(self.name, this);
		publishObjectUpdates(params.field, mapping);
		return cb ? cb() : null;
	};

	function publishObjectUpdates(startfield, mappings) {// Handles changes to the store. Will publish from the field that was changed and back.
		var currentMapping = mappings;
		while (startfield) {
			triggerListeners(self.name + "." + startfield, storeUtils.byString(self.values, startfield));
			startfield = currentMapping[startfield];
		}
	}

	//Send items that are no longer mapped or had their map change. If a value is remapped we'll send out the new value.
	function sendRemovals(removals) {
		for (var i = 0; i < removals.length; i++) {
			triggerListeners(self.name + "." + removals[i], storeUtils.byString(self.values, removals[i]));
		}
	}

	/**
	 * This will set multiple values in the store.
	 * @param {Object[]} fields - An Array of field objects
	 * @param {String} fields[].field - The name of the field
	 * @param {Any} fields[].value - Field value
	 * @returns {null}
	 *
	 * @example
	 * store.setValues([{field:'field1',value:"new value"}]);
	 */
	this.setValues = function (fields, cb) {
		var self = this;
		if (!fields) {
			return Logger.system.error("no params given");
		}
		if (!Array.isArray(fields)) { return console.error("params must be an array"); }
		async.each(fields, function (field, done) {
			self.setValue(field, done);

		}, function (err) {

			return cb ? cb() : null;
		});
		/*for (var i = 0; i < fields.length; i++) {
			var item = fields[i];
			this.setValue(item);
		}
		return cb ? cb() : null;*/
	};

	/**
	 * Get a value from the store. If global is not set, we'll check local first then we'll check global.
	 * @param {Object| String} params - Params object. This can also be a string
	 * @param {String} params.field - The field where the value is stored.
	 * @param {Function} [cb] -  Will return the value if found.
	 * @returns {Any} - The value of the field. If no callback is given and the value is local, this will run synchronous
	 * @example
	store.getValue({field:'field1'},function(err,value){});
store.getValue('field1',function(err,value){});
	 */
	this.getValue = function (params, cb) {
		if (typeof params === "string") { params = { field: params }; }
		if (!params.field) {
			if (!cb) { return "no field provided"; }
			return cb("no field provided");
		}

		if (isGlobal) { return getGlobalValue(params, cb); }
		var combined = this.name + (params.field ? "." + params.field : "");
		var fieldValue = storeUtils.byString(this.values, params.field);
		if (fieldValue !== undefined) {
			if (!cb) { return fieldValue; }
			return cb(null, fieldValue);
		}
		if (!cb) { return null; }
		return cb("couldn't find a value");
	};
	/**
	 * Get multiple values from the store.
	* @param {Object[] | String[]} fields - An Array of field objects. If there are no fields proviced, all values in the store are returned.
	 * @param {String} fields[].field - The name of the field
	 * @param {Function} [cb] -  Will return the value if found.
	 * @returns {Object} - returns an object of with the fields as keys.If no callback is given and the value is local, this will run synchronous
	 * @example
	 * store.getValues([{field:'field1'},{field2:'field2'}],function(err,values){});
store.getValues(['field1','field2'],function(err,values){});
	 */
	this.getValues = function (fields, cb) {
		if (typeof fields === "function") {
			cb = fields;
			if (isGlobal) { return getGlobalValues(null, cb); }

			if (!cb) { return this.values; }
			return cb(null, this.values);
		}
		if (!Array.isArray(fields)) {
			return this.getValue(fields, cb);
		}

		if (isGlobal) { return getGlobalValues(fields, cb); }
		var values = {};

		for (var i = 0; i < fields.length; i++) {
			var item = fields[i];
			var field = typeof item === "string" ? item : item.field;
			var combined = this.name + (field ? "." + field : "");
			var fieldValue = storeUtils.byString(this.values, field);
			values[field] = fieldValue;
		}
		if (!cb) { return values; }
		return cb(null, values);
	};

	//get a single value from the global store
	function getGlobalValue(params, cb) {
		dataStoreClient.routerClient.query("storeService.getValue",
			{
				store: self.name,
				field: params.field
			}
			, function (err, response) {
				if (err) { return cb(err); }
				return cb(err, response.data);
			});
	}
	//get values from the global store
	function getGlobalValues(params, cb) {
		dataStoreClient.routerClient.query("storeService.getValues",
			{
				store: self.name,
				fields: params
			}
			, function (err, response) {
				if (err) { return cb(err); }
				return cb(err, response.data);
			});
	}

	/**
	 * Remove a value from the store.
	* @param {Object | String} params - Either an object or string
	 * @param {String} param.field - The name of the field
	 * @param {Function} [cb] -  returns an error if there is one
	 * @example
	 * store.removeValue({field:'field1'},function(err,bool){});
	 */
	this.removeValue = function (params, cb) {
		if (!params.field) {
			if (params !== undefined) {
				params = { field: params };
			}
			else {
				return cb("no field provided");
			}
		}
		params.value = null;
		return self.setValue(params, cb);
	};

	/**
	 * Removes multiple values from the store.
	 * @param {Object[] | String[]} params - An Array of field objects
	 * @param {String} param[].field - The name of the field
	 * @param {Function} [cb] -  returns an error if there is one.
	 * @example
	 * store.removeValue({field:'field1'},function(err,bool){});
	 */
	this.removeValues = function (params, cb) {
		if (!Array.isArray(params)) { return cb("The passed in parameter needs to be an array"); }
		async.map(params, this.removeValue, function (err, data) {
			return cb(err, data);
		});
	};

	/**
	 * Destroys the store.
	 * @param {Function} [cb] -  Will return the value if found.
	 * @example
	 * store.destroy();
	 */
	this.destroy = function (cb) {
		var self = this;
		var params = {};
		params.store = this.name;
		params.global = isGlobal;
		dataStoreClient.removeStore(params, function (err, response) {
			if (err) { return cb(err); }
			self = null;
			return cb(null, true);
		});
	};

	/**
	* Add a listener to the store at either the store or field level. If no field is given, the store level is used. You can also listen to nested object -- field1.nestedField
	* @param {Object} params - Params object
	* @param {String} [params.field] - The data field to listen for. If this is empty it listen to all changes of the store.
	* @param {Function} fn -  the function to call when a listener is triggered
	* @param {Function} [cb] - callback
	* @example
	*var myFunction = function(err,data){
	}
	* store.addListener({field:'field1'},myFunction,cb);

	*/
	this.addListener = function (params, fn, cb) {
		var field = null;
		if (typeof params === "function") {
			fn = params;
			params = {};
		}
		if (params.field) { field = params.field; }

		var combined = this.name + (field ? "." + field : "");
		if (listeners[combined]) {
			listeners[combined].push(fn);
		}
		else {
			listeners[combined] = [fn];
		}

		dataStoreClient.routerClient.subscribe("storeService" + combined, handleChanges);
		return cb ? cb() : null;
	};

	/**
	* Add an array of listeners as  objects or strings. If using strings, you must provide a function callback.
	* @param {Object[] | String[]} params - Params object
	* @param {String} params[].field - The data field to listen for.
	* @param {String} params[].listener - the function to call when a listener is triggered. If this is empty, fn is used.
	* @param {function=} fn -  the function to call when a listener is triggered
	*
	* @example
	*var myFunction = function(err,data){

	}
	store.addListeners([{field:'field1',listener:myFunction},{field:'field2',listener:myFunction}],null,cb);

	store.addListeners([{field:'field1'},{field:'field2',listener:myFunction}],myFunction,cb);

	store.addListeners(['field1','field2'],myFunction,cb);
	*/
	this.addListeners = function (params, fn, cb) {
		if (!Array.isArray(params)) {
			return this.addListener(params, fn, cb);
		}

		for (var i = 0; i < params.length; i++) {
			var field = null;
			var item = params[i];
			var ls;
			if (typeof item === "string") {
				field = item;
			} else if (item.field) {
				field = item.field;
				ls = params[i].listener;
			}

			var combined = this.name + (field ? "." + field : "");
			if (!ls) {
				if (fn && typeof fn === "function") {
					ls = fn;
				}
			}
			if (listeners[combined]) {
				listeners[combined].push(ls);
			}
			else {
				listeners[combined] = [ls];
			}
			dataStoreClient.routerClient.subscribe("storeService" + combined, handleChanges);
		}
		return cb ? cb() : null;

	};

	/**
	 * Remove a listener from  store. If no field is given, we look for a store listener
	 * @param {Object} params - Params object
	 * @param {String} [params.field] - The data field
	 * @param {function=} fn -  the function to remove from the listeners
	 * @param {function=}cb -  returns true if it was succesfull in removing the listener.
	 *
	 * @example
	 * var myFunction = function(err,data){
			}
	 * store.removeListener({field:'field1'},MyFunction,function(bool){});
	StoreCstorelient.removeListener(MyFunction,function(bool){});
	 */
	this.removeListener = function (params, fn, cb) {
		var field = null;

		if (typeof params === "function") {
			cb = fn;
			fn = params;
			params = {};
		}

		if (params.field) { field = params.field; }
		var combined = this.name + (field ? "." + field : "");
		if (listeners[combined]) {
			for (var i = 0; i < listeners[combined].length; i++) {
				if (listeners[combined][i] === fn) {
					listeners[combined].pop(i);
					return cb ? cb(null, true) : null;
				}
			}
		}
		return cb ? cb(null, false) : null;
	};
	/**
	 * Remove an array of listeners from the store
	 * @param {Object[] | String[]} params - Params object
	 * @param {String} params[].field - The data field to listen for. If this is empty it listen to all changes of the store.
	 * @param {String} params[].listener - The listener function
	 * @param {function=} fn -  the function to remove from the listeners
	 * @param {function=}cb -  returns true if it was succesfull in removing the listener.
	 *
	 * @example
	 * var myFunction = function(err,data){
			}
	 * store.removeListeners({field:'field1'},MyFunction,function(bool){});
	store.removeListeners([{field:'field1',listener:MyFunction}],function(bool){});
	store.removeListeners(['field1'],MyFunction,function(bool){});
	 */

	this.removeListeners = function (params, fn, cb) {
		if (!Array.isArray(params)) {
			if (typeof params === "function") {
				this.removeListener({}, params, cb);
			} else if (params.field) {
				this.removeListener(params, fn, cb);
			}
			return cb("missing fields");
		}
		var removeCount = 0;
		for (var i = 0; i < params.length; i++) {
			var field = null;
			var item = params[i];
			var ls;
			if (typeof item === "string") {
				field = item;
			} else if (item.field) {
				field = item.field;
				ls = params[i].listener;
			}

			var combined = this.name + (field ? "." + field : "");
			if (!ls) {
				if (fn && typeof fn === "function") {
					ls = fn;
				} else {
					continue;
				}
			}

			for (var j = 0; j < listeners[combined].length; j++) {
				if (listeners[combined][j] === ls) {
					listeners[combined].pop(i);
					removeCount++;
				}
			}
		}

		if (removeCount < params.length) {
			return cb("All listeners could not be found", false);
		}
		return cb ? cb(null, true) : null;
	};
	//This handles all changes coming in from the service
	function handleChanges(err, response) {// we use this to format our responses
		if (err) { Logger.system.error(err); }
		if (!response.data.store) { return; }
		if (!response.data.field) { response.data.field = null; }
		var combined = self.name + (response.data.field ? "." + response.data.field : "");
		var val = response.data.storeData ? response.data.storeData : response.data.value;
		triggerListeners(combined, val);
	}
	// Trigger any function that is listening for changes
	function triggerListeners(listenerKey, data) {
		if (listeners[listenerKey]) {
			for (var i = 0; i < listeners[listenerKey].length; i++) {
				if (typeof listeners[listenerKey][i] === "function") {
					listeners[listenerKey][i](null, { field: listenerKey, value: data });
				} else {
					Logger.system.warn("triggerListeners: listener is not a function", listenerKey, i, listeners[listenerKey][i]);
				}
			}
		}
	}
	return this;
};

module.exports = StoreModel;
