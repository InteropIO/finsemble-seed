const express = require("express");
const https = require('https');
const fs = require('fs');
const path = require('path')
const bodyParser = require("body-parser");
const compression = require("compression");
const chalk = require('chalk');

const PORT = process.env.PORT || 3375;
const rootDir = path.join(__dirname, "..", "dist");
const moduleDirectory = path.join(__dirname, "..", "finsemble");
const installersDirectory = path.resolve(__dirname, "..", "installers");

const ONE_HOUR = 3600 * 1000;
let cacheAge = ONE_HOUR;
if (["dev", "development"].includes(process.env.NODE_ENV)) cacheAge = 0;

chalk.enabled = true;
let options = { maxAge: cacheAge };
//This will prevent config files from being cached by the server, allowing an application restart instead of a rebuild when in development.
if (cacheAge === 0) {
    options.setHeaders = function (res, path, stat) {
        res.set("cache-control", "no-cache")
    }
}

const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certs/localhost.chartiq.com.key')),
    cert: fs.readFileSync(path.join(__dirname, 'certs/localhost.chartiq.com.crt')),
    ca: fs.readFileSync(path.join(__dirname, 'certs/intermediate.crt')),
    requestCert: false,
    rejectUnauthorized: false
};

((module) => {
	"use strict";

	module.exports = {
		/**
		 * Method called before starting the server.
		 *
		 * @param done Function used to signal when pre function has finished. Can optionally pass an error message if
		 * one occurs.
		 */
		pre: (done) => {
			console.log("pre server startup");
			done();
		},

		/**
		 * Method called after the server has started.
		 *
		 * @param done Function used to signal when pre function has finished. Can optionally pass an error message if
		 * one occurs.
		 */
		post: (done) => {
			console.log("post server startup");
			done();
		},

		/**
		 * Method called to update the server.
		 *
		 * @param {express} app The express server.
		 * @param {function} cb The function to call once finished adding functionality to the server. Can optionally
		 * pass an error message if one occurs.
		 */
		updateServer: (app, cb) => {
			console.log("modifying server");

			app.use(bodyParser.urlencoded({
				extended: true
			}));
			const shouldCompress = (req, res) => {
				if (req.originalUrl.toLowerCase().includes("installers")) {
					// don't compress responses from the installers folder
					return false
				}
		
				// fallback to standard filter function
				return compression.filter(req, res)
			}
			app.use(compression({ filter: shouldCompress }));

			// Sample server root set to "/" -- must align with paths throughout
			app.use("/", express.static(rootDir, options));
			// Open up the Finsemble Components,services, and clients
			app.use("/finsemble", express.static(moduleDirectory, options));
			app.use(
				"/installers",
				express.static(path.join(__dirname, "..", "installers"), options)
			);
			// For Assimilation
			app.use(
				"/hosted",
				express.static(path.join(__dirname, "..", "hosted"), options)
			);

			// configs/application/manifest-local.json and configs/other/server-environment-startup.json
			// Make the config public
			app.use("/configs", express.static("./configs", options));
			app.use("/pkg", express.static("./pkg", options));

			var server = https.createServer(sslOptions, app);
			server.listen(PORT, function () {
				
				global.host = server.address().address;
				global.port = server.address().port;

				cb();
			});
		},
	};
})(module);