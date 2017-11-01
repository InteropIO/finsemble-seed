/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var Utils = require("../common/util");
var Validate = require("../common/validate"); // Finsemble args validator
var BaseClient = require("./baseClient");
var windowClient = require("./windowClient");
var dataStoreClient = require("./dataStoreClient");
var async = require("async");

var Logger = require("./logger");
Logger.system.log("Starting LinkerClient");
var sysinfo = Logger.system.info;
var sysdebug = Logger.system.debug;

/**
 *
 * @introduction
 * <h2>Linker Client</h2>
 * <h3>Public API for The Linker Service</h3>
 * <p>The Linker Client acts as an API between components and the Linker Service. The Linker Client allows for sharing of data between components such as when a symbol or an account changes in one window, it can be changed in all Linked windows automatically. See our tutorial on <a href="tutorial-linkingComponents.html">Linking Components</a>.</p>
 *
 * <p>When a Component is "linked", it is added to a Linker group. Linker groups are not related to Docking groups. All clients belonging to a Linker group can subscribe and receive published items for any dataType on the same group.</p>
 *
 * @hideConstructor true
 *
 * @constructor
 */

// @todo catch refesh events so that we can close down the Linker window if open <-- not sure what this is about so moved it out of the header


var LinkerClient = function (params) {
	Validate.args(params, "object=") && params && Validate.args2("params.onReady", params.onReady, "function=");
	BaseClient.call(this, params);

	this.onGroupsUpdate = [];
	this.onLinksUpdate = this.onGroupsUpdate; // backward compatibility

	// Linker Data
	this.allGroups = {};
	this.groups = [];
	this.clients = {};


	this.groupListenerList = [];
	var dataListenerList = {};

	var linkerWindow = null;
	var loading = false;

	var self = this;

	// Had to do this instead of just making it an object because that did not work (windowClient.options was undefined)
	/**
	 * @private
	 */
	this.windowIdentifier = function () {
		return {
			windowName: windowClient.options.name,
			uuid: windowClient.options.uuid,
			componentType: windowClient.options.customData.component.type
		};
	};

	/**
	 * @private
	 */
	this.makeKey = function (windowIdentifier) {
		return (windowIdentifier.windowName + "::" + windowIdentifier.uuid).replace(".", "_");
	};

	/**
	 * Create a new Linker group
	 * @param {LinkerClient~group} group -  An object that describes the new group. Needs name, color and border properties
	 * @param {LinkerClient~groupCB} [cb] -  callback to be called on success
	 * @private
	 *
	 * @example
	 * LinkerClient.createGroup({name: "groupname", color: "#ffcc00", border: "#ffffff"}, callback)
	 */
	this.createGroup = function (group, cb) {
		sysinfo("LinkerClient.createGroup", "GROUP", group);
		Validate.args(group, "object", cb, "function");

		if (!group.name) {
			cb("Name is required", null);
			return;
		}

		if (self.getGroup(group.name)) {
			cb("Group Already Exists", null);
			return;
		}

		self.allGroups.push(group);
		self.linkerStore.setValue({ field: "groups", value: self.allGroups });

		cb(null, self.allGroups);
	};

	/**
	 * Delete a Linker group.
	 *
	 * @param {string} groupName - The name of the group
	 * @param {LinkerClient~groupCB} [cb]
	 * @private
	 *
	 * @example
	 * LinkerClient.deleteGroup("group1", callback)
	 *
	 */
	this.deleteGroup = function (groupName, cb) {
		sysinfo("LinkerClient.deleteGroup", "GROUP NAME", groupName);
		Validate.args(groupName, "string", cb, "function");
		if (!self.getGroup(groupName)) {
			cb("Group does not exist", null);
			return;
		}
		let groups = self.allGroups;
		for (var i = 0; i < groups.length; i++) {
			if (groupName === groups[i].name) {
				groups.splice(i, 1);
				break;
			}
		}

		self.linkerStore.setValue({ field: "groups", value: self.allGroups });

		// TODO: Verify that this even works
		let clients = self.clients;
		for (c in clients) {
			client = clients[c];
			for (group in client.groups) {
				if (groupName === group) {
					delete client[group];
					break;
				}
			}
		}

		self.linkerStore.setValue({ field: "clients", value: self.clients });


		cb(null, self.allGroups);
	};

	/**
	 * Update a Linker group's info.
	 *
	 * @param {string} groupName - The name of the group
	 * @param {LinkerClient~group} newGroup -  Properties of the new group
	 * @param {LinkerClient~groupsCB} [cb]
	 * @private
	 *
	 * @example
	 * LinkerClient.updateGroup("group1", {name:"newGroup1", color:"black", border:"white"}, callback)
	 *
	 */
	this.updateGroup = function (groupName, newGroup, cb) {
		sysinfo("LinkerClient.updateGroup", "GROUP NAME", groupName, "NEW GROUP", newGroup);
		Validate.args(groupName, "string", newGroup, "object", cb, "function");
		if (!self.getGroup(groupName)) {
			cb("Group does not exist", null);
			return;
		}
		let groups = self.allGroups;
		for (var i = 0; i < groups.length; i++) {
			if (groupName === groups[i].name) {
				groups[i] = Object.assign(groups[i], newGroup);
				break;
			}
		}

		self.linkerStore.setValue({ field: "groups", value: self.allGroups });

		// TODO: Verify that this even works
		var clients = self.clients;
		for (c in clients) {
			client = clients[c];
			for (group in client.groups) {
				if (groupName === group) {
					delete client[group];
					client[newGroup.name] = true;
					break;
				}
			}
		}

		self.linkerStore.setValue({ field: "clients", value: self.clients });

		cb(null, self.allGroups);
	};

	/**
	 * Add a client to a Linker group programatically. Clients will receive all items published to this group. The Window manager uses this internally to add a component to a group when the user clicks on a color in the Linker Window.
	 *
	 * @param {string} groupName - Group to add to
	 * @param {windowIdentifier} client -  Window Identifier for the client (optional)
	 * @param {LinkerClient~groupsCB} [cb] Returns all the groups for the client
	 * @example
	 *
	 * LinkerClient.addToGroup("group1", null, callback); // Automatically uses current window if no windowIdentifier is specified
	 * LinkerClient.addToGroup("group1", windowIdentifier, callback);
	 *
	 */
	this.addToGroup = function (groupName, client, cb) {
		sysinfo("LinkerClient.addToGroup", "GROUP NAME", groupName, "CLIENT", client);
		Validate.args(groupName, "string", client, "object", cb, "function");
		if (!client) client = self.windowIdentifier();

		var clientKey = self.makeKey(client);

		if (!self.clients[clientKey]) {
			self.clients[clientKey] = {
				client: client,
				groups: {}
			};
		}

		self.clients[clientKey].groups[groupName] = true;
		self.linkerStore.setValue({ field: "clients." + clientKey, value: self.clients[clientKey] });

		return self.getGroups(client, cb);
	};

	/**
	 * @private
	 */
	this.addToGroups = function (groupNames, client, cb) {
		sysinfo("LinkerClient.addToGroups", "GROUP NAMES", groupNames, "CLIENT", client);
		var clientKey = self.makeKey(client);

		if (!self.clients[clientKey]) {
			self.clients[clientKey] = {
				client: client,
				groups: {}
			};
		}

		for (var i = 0; i < groupNames.length; i++) {
			self.clients[clientKey].groups[groupNames[i]] = true;
		}

		self.linkerStore.setValue({ field: "clients." + clientKey, value: self.clients[clientKey] });

		return self.getGroups(client, cb);

	};

	/**
	 * Removes a client from a Linker group programatically. The Window manager uses this internally to remove a component from a group when the user clicks on a color in the Linker Window corresponding to a Linker group that the window belongs to.
	 *
	 * @param {string} groupName - Group to remove
	 * @param {windowIdentifier} client -  Window Identifier for the client (optional)
	 * @param {LinkerClient~groupsCB} [cb] Returns all the groups for the client
	 *
	 * @example
	 *
	 * LinkerClient.removeFromGroup("group1", null, callback); // Automatically uses current window if no windowIdentifier is specified
	 * LinkerClient.removeFromGroup("group1", windowIdentifier, callback)
	 *
	 */
	this.removeFromGroup = function (groupName, client, cb) {
		sysinfo("LinkerClient.removeFromGroup", "GROUP NAME", groupName, "CLIENT", client);
		Validate.args(groupName, "string", client, "object", cb, "function");
		if (!client) client = self.windowIdentifier();

		var clientKey = self.makeKey(client);

		if (!self.clients[clientKey] || !self.clients[clientKey].groups[groupName]) {
			sysdebug("Client was not in specified group", self.linkerStorage.clients[clientKey], self.linkerStorage.clients[clientKey].groups[groupName]);
			var clientGroups = self.getGroups(client);
			cb("Client was not in specified group", clientGroups);
			return clientGroups;
		}
		delete self.clients[clientKey].groups[groupName];

		self.linkerStore.setValue({ field: "clients." + clientKey, value: self.clients[clientKey] });
		return self.getGroups(client, cb);

	};

	/**
	 * Get a Linker group
	 * @param {string} groupName -  The name of the group
	 * @param {LinkerClient~groupCB} [cb] -  callback to be called on success
	 * @private
	 *
	 * @example
	 * LinkerClient.getGroup("groupname", callback)
	 */
	this.getGroup = function (groupName, cb) {
		sysinfo("LinkerClient.getGroup", "GROUP NAME", groupName);
		Validate.args(groupName, "string", cb, "function");

		for (var i = 0; i < self.allGroups.length; i++) {
			if (self.allGroups[i].name == groupName) {
				group = self.allGroups[i];
				if (cb) {
					Validate.args(cb, "function");
					cb(null, group);
				}
				return group;
			}
		}

		cb("Group Not Found", null);
		return null;
	};

	/**
	 * Get all Linker groups
	 * @param {LinkerClient~groupsCB} [cb] -  callback to be called on success
	 * @private
	 *
	 * @example
	 * LinkerClient.getAllGroups(callback)
	 */
	this.getAllGroups = function (cb) {
		sysinfo("LinkerClient.getAllGroups");
		if (cb) {
			Validate.args(cb, "function");
			cb(null, self.allGroups);
		}
		return self.allGroups;
	};

	/**
	 * Get all Linker groups that a window has been added to
	 * @param {windowIdentifier} client -  Window Identifier for the client
	 * @param {LinkerClient~groupsCB} [cb] -  callback to be called on success
	 * @private
	 *
	 * @example
	 * LinkerClient.getGroups(windowIdentifier, callback)
	 */
	this.getGroups = function (client, cb) {
		sysinfo("LinkerClient.getGroups", "CLIENT", client);
		if (cb) { Validate.args(cb, "function"); }
		if (!client) {
			client = self.windowIdentifier();
		}
		if (!Object.keys(self.clients).length) {
			if (cb) { cb(null, { groups: [] }); }
			return { groups: [] };
		}
		var clientKey = self.makeKey(client);
		if (!self.clients[clientKey]) {
			if (cb) { cb(null, { groups: [] }); }
			return { groups: [] };
		}
		var clientGroups = self.clients[clientKey].groups;

		var clientGroupList = [];
		if (clientGroups) {
			clientGroupList = self.allGroups.filter(function (value) {
				return clientGroups[value.name] === true;
			});
		}

		if (!self.clients[clientKey].active) {
			self.clients[clientKey].active = true;
			self.linkerStore.setValue({ field: "clients." + clientKey, value: self.clients[clientKey] });
		}

		if (cb) {
			cb(null, { groups: clientGroupList });
		}
		return { groups: clientGroupList };
	};


	/**
	 * Get all Linker groups and linker groups that this client belongs to.
	 * @param {windowIdentifier} [client] - Window Identifier for the client
	 * @param {LinkerClient~stateCB} [cb] -  callback to be called on success
	 * @private
	 *
	 * @example
	 * LinkerClient.getState(windowIdentifier, callback)
	 */
	this.getState = function (client, cb) {
		sysinfo("LinkerClient.getState", "CLIENT", client);
		if (cb) { Validate.args(cb, "function"); }
		if (!client) { client = this.windowIdentifier(); }
		var clientKey = self.makeKey(client);
		var state = {
			groups: self.getGroups(client),
			allGroups: self.allGroups
		};
		if (cb) { cb(null, state); }

		return state;
	};


	/**
	 * @private
	 */
	this.showLinkerWindowInner = function (cb) {
		sysinfo("LinkerClient.showLinkerWindowInner");
		this.routerClient.query("Finsemble.LinkerWindow.Show", {
			groups: self.getGroups().groups,
			windowIdentifier: self.windowIdentifier(),
			windowBounds: FSBL.Clients.WindowClient.getWindowBounds()
		}, function () {

		});
	};

	/**
	* Opens the linker popup and sends the current windows information
	* @param {function} [cb] -  callback to be called on success
	* @private
	*
	* @example
	* LinkerClient.openLinkerWindow(cb)
	*/
	this.openLinkerWindow = function (cb) {
		sysinfo("LinkerClient.openLinkerWindow");
		Validate.args(cb, "function");
		if (loading) { return; } // If in process of loading then return. This prevents double clicks on the icon.
		var self = this;

		// @TODO, set a flag with a timeout to prevent the blurred in linker.jsx
		if (linkerWindow) {
			linkerWindow.isShowing(function (showing) {
				if (showing) {
					linkerWindow.hide();
				} else {
					self.showLinkerWindowInner(cb);
				}
			});
			return;
		}

		this.showLinkerWindowInner(cb);

	};

	/**
	* Remove a listener to the specified group and data type
	* @param {String}  dataType - The data type be subscribed to
	* @param {function} [cb] -callback to be called on success
	*
	* @example
	* LinkerClient.subscribe("group1","symbol",cb)
	*/
	this.unSubscribe = function (dataType) {
		sysinfo("LinkerClient.unSubscribe", "DATA TYPE", dataType);
		Validate.args(groupName, "string", dataType, "string");
		delete dataListenerList[dataType];
	};

	/**
	* Publish data to all listeners for a group and data type.
	* @param {Object}  params
	* @param {String}  params.dataType - The data type sending
	* @param {any}  params.data - the data being transmitted
	* @param {function} [cb] - callback to be called on success
	* @example
	* LinkerClient.publish({dataType:"symbol",data:"AAPL"})
	*/
	this.publish = function (params) {
		sysinfo("LinkerClient.publish", "PARAMS", params);
		Validate.args(params.dataType, "string", params.data, "any");
		let groups = Object.keys(self.groups);
		for (var i = 0; i < groups.length; i++) {
			var group = groups[i];
			this.routerClient.transmit(group + "." + params.dataType, { type: params.dataType, data: params.data });
			this.routerClient.transmit(group, { type: params.dataType, data: params.data });
		}
	};

	function removeListeners() {
		let groups = Object.keys(self.groups);
		for (var i = 0; i < groups.length; i++) {
			var group = groups[i];
			self.routerClient.removeListener(group, handleListeners);
		}
	}

	/**
	* Registers a client for a specific data type that is sent to a group.
	* @param {String} dataType
	* @param {function} [cb] -  a function to be called once the linker receives the specific data.
	* @example
	* LinkerClient.subscribe("symbol",func)
	*/
	this.subscribe = function (dataType, cb) {
		sysinfo("LinkerClient.subscribe", "DATA TYPE", dataType);
		Validate.args(dataType, "string", cb, "function");
		if (dataListenerList[dataType]) {
			return dataListenerList[dataType].push(cb);
		}
		dataListenerList[dataType] = [cb];
	};

	/**
	 * Gets all Windows in a specific group
	 * 
	 * @param {string} groupName 
	 * @param {function} cb 
	 */
	this.getAllWindowsInGroup = function (groupName, cb) {
		sysinfo("LinkerClient.getAllWindowsInGroup", "GROUP NAME", groupName);
		Validate.args(groupName, "string", cb, "function");
		var clientsInGroup = [];
		for (let clientKey in self.clients) {
			let client = self.clients[clientKey];
			if (client.active && Object.keys(client.groups).includes(groupName)) {
				clientsInGroup.push(client.client);
			}
		}
		if (cb) { cb(null, clientsInGroup); }
		return clientsInGroup;
	};

	//Need to do this better. Get newest items so we don't create it every time
	//This looks to see if there is a listener for a specific data type
	function handleListeners(err, data) {
		var listeners = dataListenerList[data.data.type];
		if (listeners && listeners.length > 0) {
			for (var i = 0; i < listeners.length; i++) {
				listeners[i](data.data.data, { data: data.data.data, header: data.header, originatedHere: data.originatedHere });
			}
		}
	}

	//add new listeners for groups when groups are updated
	function updateListeners() {
		//remove listeners
		for (var i = self.groupListenerList.length - 1; i >= 0; i--) {
			let group = self.groupListenerList[i];
			let groups = Object.keys(self.groups);
			if (!groups.filter(function (g) { return g == group; }).length) {
				self.routerClient.removeListener(group, handleListeners);
				self.groupListenerList.splice(i, 1);
			}
		}

		//setup new listeners if needed
		var groups = Object.keys(self.groups);
		for (var i = 0; i < groups.length; i++) {
			let group = groups[i];
			if (!self.groupListenerList.includes(group)) {
				self.routerClient.addListener(group, handleListeners);
				self.groupListenerList.push(group);
			}
		}
	}

	// @TODO, terry: this could be named better. Let's call it emitLocalLinkUpdateEvents
	function sendOutLinkUpdates() {
		for (var i = 0; i < self.onGroupsUpdate.length; i++) {
			self.onGroupsUpdate[i](null, self.getState());
		}
	}

	// load all linkages and register listeners for updated data.
	/**
	 * @private
	 */
	this.loadGroups = function (cb) {
		sysdebug("LinkerClient Loading Groups");
		var wi = self.windowIdentifier();
		var clientKey = self.makeKey(wi);
		dataStoreClient.getStore({ store: "Finsemble_Linker", global: true }, function (err, linkerStore) {
			self.linkerStore = linkerStore;
			linkerStore.getValues(["groups"], function (err, values) {
				if (values) {
					if (values["groups"]) {
						self.allGroups = values["groups"];
					}
				}
				windowClient.getComponentState({ field: "Finsemble_Linker" }, function (err, linkerData) {
					self.clients[clientKey] = {
						client: wi,
						active: true,
						groups: {}
					};
					if (linkerData) {
						self.groups = linkerData;
						self.clients[clientKey].groups = linkerData;
					}
					linkerStore.setValue({ field: "clients." + clientKey, value: self.clients[clientKey] });
					var spawnData = windowClient.getSpawnData();
					if (spawnData && spawnData.linker && spawnData.linker.groups) {
						self.addToGroups(spawnData.linker.groups, wi);
					} else {
						updateListeners();
						sendOutLinkUpdates();
					}
					cb();
					linkerStore.addListener({ field: "clients." + clientKey }, function (err, response) {
						sysdebug("My Groups Updated");
						updateListeners();
						sendOutLinkUpdates();
						if (response.groups) self.groups = response.groups;
						windowClient.setComponentState({ field: "Finsemble_Linker", value: self.groups });
						
					});
					linkerStore.addListener({}, function (err, response) {
						var values = response.value.values;
						self.allGroups = values.groups;
						self.clients = values.clients;
						if (values.clients[clientKey] && values.clients[clientKey].groups) {
							self.groups = values.clients[clientKey].groups;
						}
						windowClient.setComponentState({ field: "Finsemble_Linker", value: self.groups });
					});
				});
			});

			linkerStore.addListener({ field: "clients." + clientKey }, function (err, response) {
				sysdebug("My Groups Updated");
				updateListeners();
				sendOutLinkUpdates();
			});

			linkerStore.addListener({}, function (err, response) {
				var values = response.value.values;
				self.allGroups = values.groups;
				self.clients = values.clients;
				if (values.clients[clientKey]) self.groups = values.clients[clientKey].groups;
			});

		});



	};

	this.onClose = function () {
		var wi = self.windowIdentifier();
		var clientKey = self.makeKey(wi);
		self.clients[clientKey].active = false;
		self.linkerStore.setValue({ field: "clients." + clientKey, value: self.clients[clientKey] });
	};
	return this;
};

var linkerClient = new LinkerClient({
	onReady: function (cb) {
		sysdebug("Linker onReady");
		linkerClient.loadGroups(cb);
	},
	name: "linkerClient"
});

linkerClient.requiredServices = ["linkerService"];
linkerClient.requiredClients = ["windowClient", "dataStoreClient"];
module.exports = linkerClient;

/**
 * Window Identifier - You can get the window Identifier of a Window by calling FSBL.Utils.getMyWindowIdentifer
 * @typedef {Object} windowIdentifier
 * @property {string} windowName
 * @property {string} uuid
 * @property {string} componentType
 */

/**
 * Linker group
* @typedef {Object} LinkerClient~group
* @property  {string}  name
* @property  {string}  color
* @property  {string}  border
 */

/**
 * Callback that returns a list of groups in the responseMessage
* @callback LinkerClient~groupCB
* @param {Object} err
* @param {LinkerClient~groups} responseMessage
*/

/**
* @callback LinkerClient~stateCB
* @param {Object} err
* @param {LinkerClient~state} responseMessage
* @private
*/