/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

var Utils = require("../common/util");
var Validate = require("../common/validate"); // Finsemble args validator

/**
 *
 */
var BaseClient = require("./baseClient");
var Logger = require("./logger");

Logger.system.log("Starting ExternalClient");

/**
 *
 * @introduction
 * <h2>External Client</h2>
 * The Storage client handles saving and retrieving data for your application.
 * @hideConstructor true
 *  @todo add clear method
 * @constructor
 */
var ExternalClient = function (params) {
	Validate.args(params, "object=") && params && Validate.args2("params.onReady", params.onReady, "function=");
	var self = this;
	BaseClient.call(this, params);
	var windows = null;
	this.topics = {
		"onApplicationChange": "onApplicationChange",
		"onApplicationCreated": "onApplicationCreated",
		"onApplicationClosed": "onApplicationClosed"
	};
	this.RouterClient = this.routerClient;
	var listeners = {};
	this.addListener = function (topic, func) {
		if (!listeners[topic]) { listeners[topic] = []; }
		listeners[topic].push(func);
	};

	this.getWindows = function () {
		return windows;
	};
	proccessListener = function (topic, data) {
		for (var i = 0; i < listeners[topic].length; i++) {
			listeners[topic](data);
		}
	};
	onApplicationChange = function (err, response) {
		if (err) { return; }
		windows[response.data.key] = response.data;
		proccessListener("onApplicationChange", response.data);

	};
	onApplicationCreated = function (err, response) {
		if (err) { return; }
		windows[response.data.key] = response.data;
		proccessListener("onApplicationCreated", response.data);

	};
	onApplicationClosed = function (err, response) {
		if (err) { return; }
		if (windows[response.data.key]) { delete windows[response.data.key]; }
		proccessListener("onApplicationCreated", response.data);

	};

	self.routerClient.addListener("External.applicationAdded", onApplicationCreated);
	self.routerClient.addListener("External.applicationChanged", onApplicationChange);
	self.routerClient.addListener("External.applicationClosed", onApplicationClosed);


	this.routerClient.query("External.applications", {}, function (err, response) {
		Logger.system.log("got applications", response);
		window = response.data;
	});


};

var externalClient = new ExternalClient({
	onReady: function (cb) {
		Logger.system.log("externalClient online");
		if (cb) {
			cb();
		}
	},
	name: "externalClient"
});
externalClient.requiredServices = ["externalService"];
module.exports = externalClient;


