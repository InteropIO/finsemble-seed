#!/usr/bin / env node

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var bodyParser = require("body-parser");
var chalk = require('chalk');
var outputColor = chalk.yellow;
var express = require("express");
var app = express();
var nocache = require('nocache');
var path = require('path');
var rootDir = path.join(__dirname, "/../dist");
var finConfig = require("./FinsembleConfigs");
var cacheAge;
var oneDay = 60 * 60 * 24 * 1000; // in millseconds

if (process.env.NODE_ENV === "dev") {
	cacheAge = 0;
} else {
	cacheAge = 5 * oneDay;
}

console.log(outputColor("SERVER SERVING FROM " + rootDir + " with caching maxage = ", cacheAge));

app.use(function (req, res, next) {
	var filename = path.basename(req.url);
	var extension = path.extname(filename);
	if (extension === '.html') {
		console.log(outputColor("Node Server Retriving " + req.url));
	}
	next();
});

console.log(rootDir);
app.use("/yourSubDirectory", express.static(rootDir, {
	maxage: cacheAge
}));
app.use("/yourSubDirectory", express.static(path.join(__dirname, "..", '/node_modules/@chartiq/finsemble/dist')));
global.root = "/yourSubDirectory";

app.use(bodyParser.urlencoded({
	extended: false
}));
var PORT = process.env.PORT || 3375;

var server = app.listen(PORT, function () {
	global.host = server.address().address;
	global.port = server.address().port;
	app.use(nocache());
	app.get("/config", function (req, res) {
		res.send(finConfig(req, res));
	});
	console.log(chalk.green("listening on port " + PORT));
	app.use(function (req, res, next) {
		next();
	});

});
