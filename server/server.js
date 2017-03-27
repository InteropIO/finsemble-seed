#!/usr/bin/env node

var express = require("express");
var Chat = require("./chat");
var app = express();
var nocache = require('nocache');
var path = require('path');
//app.use(express.static(rootDir));
app.use(express.static(path.join(__dirname,"..",'/node_modules/finsemble/dist')));
app.use("/localServices",express.static(path.join(__dirname,"..",'/built/')));
console.log("/localServices",__dirname + '/built/')
var PORT = process.env.PORT || 80;

var server = app.listen(PORT, function () {
	app.use(nocache());
	Chat.setup(app, server);
	console.log("listening on port " + PORT);
	app.use(function (req, res, next) {
		console.log("Retrieving: ", req.url);
		next();
	});
});
