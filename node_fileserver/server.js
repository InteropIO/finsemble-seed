#!/usr/bin/env node

var express = require("express");
var Chat = require("./chat");
var app = express();
var nocache = require('nocache');
var path = require('path');
var finConfig = require("./FinsembleConfigs");
app.use(express.static(path.join(__dirname, "..", '/node_modules/@chartiq/finsemble/dist')));
app.use(express.static(path.join(__dirname, "..", '/built/')));
console.log("/localServices", __dirname + '/built/')
var PORT = process.env.PORT || 3375;

var server = app.listen(PORT, function () {
	//new	
	global.host = server.address().address;
	global.port = server.address().port;

	app.use(nocache());
	app.get("/config", function (req, res) {
		//new
		res.send(finConfig(req, res));
	})
	Chat.setup(app, server);
	console.log("listening on port " + PORT);
	app.use(function (req, res, next) {
		console.log("Retrieving: ", req.url);
		next();
	});
});
