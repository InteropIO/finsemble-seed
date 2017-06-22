#!/usr/bin/env node

var express = require("express");
var app = express();
var nocache = require('nocache');
var path = require('path');
var finConfig = require("./FinsembleConfigs");

// picks up built components and services defined in seed
app.use("/fin", express.static(path.join(__dirname, "..", '/built/')));

// picks up application config from seed
app.use("/fin/configs/", express.static(path.join(__dirname, "..", '/configs/')));

// picks up the rest from the Finsemble NPM module
app.use("/fin", express.static(path.join(__dirname, "..", '/node_modules/@chartiq/finsemble/dist')));

var PORT = process.env.PORT || 3375;

var server = app.listen(PORT, function () {
	app.use(nocache());

	// "/config" as defined in the startup.json maps below to the OpenFin manifest/config file 
	// (e.g. config/desktop-local.json) located in the Finsemble Module. The manifest includes the top 
	// level finsemble config. This "dynamic" approach supports OPTIONAL server-side changes 
	// to the config (see FinsembleConfig.js)
	app.get("/config", function (req, res) {
		res.send(finConfig());
	})

	console.log("listening on port " + PORT);
	app.use(function (req, res, next) {
		console.log("Retrieving file...");
		next();
	});
});
