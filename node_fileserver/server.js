#!/usr/bin/env node

var express = require("express");
var Chat = require("./chat");
var app = express();
var nocache = require('nocache');
var path = require('path');
var finConfig = require("./FinsembleConfigs");
//This is where express will server our system components and the components that you create.
//It should match what's at the end of your `clientRoute` in `configs/startup.json`.
app.use("/yourSubDirectory", express.static(path.join(__dirname, "..", '/node_modules/@chartiq/finsemble/dist')));
app.use("/yourSubDirectory", express.static(path.join(__dirname, "..", '/built/')));
var PORT = process.env.PORT || 3375;

var server = app.listen(PORT, function () {
	app.use(nocache());
	app.get("/config", function (req, res) {
		res.send(finConfig());
	})
	Chat.setup(app, server);
	console.log("listening on port " + PORT);
	app.use(function (req, res, next) {
		console.log("Retrieving: ", req.url);
		next();
	});
});
