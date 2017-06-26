
var Finsemble = require("@chartiq/finsemble/libs/Server");
var path = require('path');

// //Gets your hostname/port/etc for your application.
var StartupConfig = require("../configs/startup");
var env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
Finsemble.setUUID("Finsemble" + "-" + env);
var hostname = StartupConfig[env].clientRoute;

//Soon you will be able to change your default storage
Finsemble.setDefaultStorage("localStorage");


Finsemble.updateBaseUrl(hostname);


module.exports = function (req, res) {
	return Finsemble.getConfig(); // returns the manifest file (e.g. desktop-local.json) with optional server-side changes in this module before returning the manifest
};