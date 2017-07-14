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
var path = require('path');
var rootDir = path.join(__dirname, "/../");
var cacheAge;
var oneDay = 60 * 60 * 24 * 1000; // in millseconds

// No caching in development, but cache otherwise
if (process.env.NODE_ENV === "dev") {
	cacheAge = 0;
} else {
	cacheAge = 5 * oneDay;
}

console.log(outputColor("SERVER SERVING FROM " + rootDir + " with caching maxage = ", cacheAge));

// For Assimulation
app.use("/hosted", express.static(path.join(__dirname, "/../hosted"), {
	maxage: cacheAge
}));

// Can here set up you own directory path to replace "/fin" sample below -- must align with paths thoughout openfin/minifest-*.json
app.use("/yourSubDirectory", express.static(rootDir, {
	maxage: cacheAge
}));
app.use("/yourSubDirectory", express.static(path.join(__dirname, "..", '/node_modules/@chartiq/finsemble/dist')));
global.root = "/yourSubDirectory";

// Sample Application Root set to "/fin" -- must align with paths thoughout openfin/minifest-*.json
app.use("/fin", express.static(rootDir, {
	maxage: cacheAge
}));
global.root = "/fin";

var PORT = process.env.PORT || 3375;

var server = app.listen(PORT, function () {
	console.log(chalk.green("listening on port " + PORT));
	global.host = server.address().address;
	global.port = server.address().port;
	console.log(chalk.green("server up.........................."));
});