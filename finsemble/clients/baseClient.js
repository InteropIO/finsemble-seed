/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var Utils = require("../common/util");
var RouterClient = require("./routerClientInstance");
var Validate = require("../common/validate"); // Finsemble args validator
var Logger = require("./logger");

/**
 * @introduction
 * <h2>Base Client</h2>
 * The Base Client is inherited by every client to provide common functionality to the clients. Clients communicate their status to each other through the Router and receive service status from the service manager. Once all dependecies are met, either client or service, the client's `onReady` method is fired.
 * @constructor
 * @param {Object} params
 * @param {Function} params.onReady - A function to be called after the client has initialized.
 * @param {String} params.name - The name of the client


 @example
	var BaseClient = require("./baseClient");
	var NewClient = function (params) {
		BaseClient.call(this, params);
		var self = this;

		return this;
	};

	var clientInstance = new NewClient({
		onReady: function (cb) {
			Logger.system.log("NewClient Online");
			cb();
		},
		name:"NewClient"
	});
	clientInstance.requiredServices = [REPLACE_THIS_ARRAY_WITH_DEPENENCIES];
	clientInstance.initialize();
	module.exports = clientInstance;
 */
var BaseClient = function (params) {
	Validate.args(params, "object=");
	var self = this;
	var status = "offline";
	var onReady;
	var initialized = false;

	if (params) {
		if (params.onReady) {
			onReady = params.onReady;
		}
		this.name = params.name;
	}

	/**
	 * Reference to the RouterClient
	 *  @type {Object}
	 */
	this.routerClient = RouterClient;

	/**
	 * Gets the current window
	 * @type {object}
	 */

	this.finWindow = null;
	/**
	 * Gets the cusrrent window name
	 *  @type {string}
	 */
	this.windowName = "";//The current window

	/**
	 * Services the are required to be online before the service can come online
	 *  @type {array}
	 */
	this.requiredServices = [];
	/**
	 * A list of online services
	 *  @type {arrays}
	 */
	this.onlineServices = {};
	/**
	 * Clients the are required to be online before the service can come online
	 *  @type {array}
	 */
	this.requiredClients = [];
	/**
	 * A list of online clients
	 *  @type {arrays}
	 */
	this.onlineClients = [];

	/**
	* This is where services are added to online list
	* @param {Array} services
	*/
	this.markServicesOnline = function (services) {
		Logger.system.debug("markServicesOnline", services);
		Validate.args(services, "any");
		if (!Array.isArray(services)) {
			services = [services];
		}

		for (var i = 0; i < services.length; i++) {
			Logger.system.info("Service Marked Online", services[i]);
			this.onlineServices[services[i]] = true;
		}
		this.checkRequiredServices();
	};

	this.addNeededServices = function (services) {
		Validate.args(services, "any");
		if (!services) { return; }
		if (!Array.isArray(services)) {
			services = [services];
		}
		for (var i = 0; i < services.length; i++) {
			if (this.requiredServices.indexOf(services[i]) === -1) {
				this.requiredServices.push(services[i]);
			}
		}
	};

	//Check to see if all required services are online
	this.checkRequiredServices = function () {
		for (var i = 0; i < this.requiredServices.length; i++) {
			if (this.requiredServices[i] in self.onlineServices) {
				Logger.system.debug("STARTUP", this.name, "Client Service Dependency Satisfied", this.requiredServices[i]);
				this.requiredServices.splice(i, 1);
				i--; // loop index has to be adjusted after delete
			}
		}
		this.checkOnline();
	};

	/**
	 * Queue of functions to process once the client goes online.
	 */
	this.clientReadyQueue = [];

	/**
	 * Iterates through the clientReadyQueue, invoking each call to `.ready`.
	 */
	this.processClientReadyQueue = function () {
		for (var i = 0; i < this.clientReadyQueue.length; i++) {
			let callback = this.clientReadyQueue[i];
			if (typeof callback === "function") {
				callback();
			}
		}
		this.clientReadyQueue = [];
	};

	/**
	 * Method for adding callbacks to each client.
	 */
	this.onReady = function (cb) {
		this.clientReadyQueue.push(cb);
		if (status === "online") {
			this.processClientReadyQueue();
		}
	};

	//Check to see if the client can come online. We check this against the required services and clients
	this.checkOnline = function () {
		var self = this;
		if (status !== "online") {
			if (this.requiredServices.length === 0 && this.requiredClients.length === 0) {
				status = "online";
				if (onReady) {
					onReady(function () {
						Logger.system.log("STARTUP: CLIENT ONLINE", self.name);
						self.processClientReadyQueue();
						self.routerClient.transmit(self.windowName + ".clientOnline", self.name);
					});
				} else {
					Logger.system.log("STARTUP: CLIENT ONLINE", self.name);
					self.processClientReadyQueue();
					self.routerClient.transmit(self.windowName + ".clientOnline", self.name);
				}
			} else {
				Logger.system.debug("STARTUP", this.name, "Required Services", this.requiredServices, "Required Clients", this.requiredClients);
			}
		}
	};
	//add a client/clients to the online list
	this.addClients = function (clients) {
		Validate.args(clients, "any");

		if (!clients) { return; }
		if (!Array.isArray(clients)) {
			clients = [clients];
		}
		for (var i = 0; i < clients.length; i++) {
			if (this.onlineClients.indexOf(clients[i]) === -1) {
				this.onlineClients.push(clients[i]);
			}
		}
		this.checkRequiredClients();
	};
	// checks to see if we have all of the required clients online.
	this.checkRequiredClients = function () {
		for (var i = 0; i < this.requiredClients.length; i++) {
			if (this.onlineClients.indexOf(this.requiredClients[i]) > -1) {
				Logger.system.debug("STARTUP", this.name, "Client Dependency Satisfied", this.requiredClients[i]);
				this.requiredClients.splice(i, 1);
				i--; // decrement because of splice to keep for loop correct
			}
		}
		this.checkOnline();
	};

	// setup listeners for services
	function setupListeners() {

		self.routerClient.query("Finsemble.ServiceManager.getActiveServices", {}, function (err, event) {
			self.markServicesOnline(event.data);
		});

		self.routerClient.addListener("Finsemble.serviceOnline", function (err, event) {
			self.markServicesOnline(event.data);
		});

		for (var i = 0; i < self.requiredClients.length; i++) {
			self.routerClient.query(self.windowName + "." + self.requiredClients[i] + ".status", {}, function (err, event) {
				if (err) { return; }
				if (!event.data) { return; }
				if (event.data.status === "online") { self.addClients(self.requiredClients[i]); }
			});
		}

		self.routerClient.addListener(self.windowName + ".clientOnline", function (err, event) {
			self.addClients(event.data);
		});
	}

	/**
	* Starts the process of checking services and any other function required before the client can come online
	*/
	this.initialize = function () {
		if (initialized) { return; }
		initialized = true;
		fin.desktop.main(function () {

			self.routerClient.onReady(function () {
				Logger.system.debug("Baseclient Init Router Ready", self.name);
				self.finWindow = fin.desktop.Window.getCurrent();
				self.windowName = self.finWindow.name;
				setupListeners();
				self.checkRequiredServices();
				self.checkRequiredClients();
			});
		});
	};

	this.onClose = function () {};

};

module.exports = BaseClient;