#!/usr/bin / env node

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

//This file is referenced in the environment switching tutorial

(() => {
	"use strict";

	// #region Imports
	// NPM
	const chalk = require("chalk");
	chalk.enabled = true;
	const express = require("express");
	const fs = require("fs");
	const path = require("path");
	const compression = require("compression");
	// Local
	const extensions = fs.existsSync(path.join(__dirname, "server-extensions.js")) ?
		require("./server-extensions") :
		{
			/**
			 * Method called before starting the server.
			 *
			 * @param {function} done Function can take one argument; an error message if one occurred.
			 			 * @example
			 * const pre => {
			 * 	try {
			 * 		// do something that could throw an error
			 *  } catch(e) {
			 *		done(e);
			 *  }
			 * }*/
			pre: done => { done(); },

			/**
			 * Method called after the server has started.
			 *
			 * @param {function} done Function can take one argument; an error message if one occurred.
			 *
			 * @example
			 * const post => {
			 * 	try {
			 * 		// do something that could throw an error
			 *  } catch(e) {
			 *		done(e);
			 *  }
			 * }
			 */
			post: done => { done(); },

			/**
			 * Method called to update the server.
			 *
			 * @param {express} app The express server.
			 * @param {function} cb The function to call once finished adding functionality to the server.
			 * @example
			 * const cb => {
			 * 	try {
			 * 		// do something that could throw an error
			 *  } catch(e) {
			 *		done(e);
			 *  }
			 * }*/
			updateServer: (app, cb) => {
				app.use(compression());
				// Sample server root set to "/" -- must align with paths throughout
				app.use("/", express.static(rootDir, options));
				// Open up the Finsemble Components,services, and clients
				app.use("/Finsemble", express.static(moduleDirectory, options));
				// For Assimilation
				app.use("/hosted", express.static(path.join(__dirname, "..", "hosted"), options));

				// configs/openfin/manifest-local.json and configs/other/server-environment-startup.json
				// Make the config public
				app.use("/configs", express.static("./configs", options));

				cb();
			}
		};
	// #endregion

	// #region Constants
	const app = express();
	const rootDir = path.join(__dirname, "..", "dist");
	const moduleDirectory = path.join(__dirname, "..", "Finsemble");
	const ONE_DAY = 24 * 3600 * 1000;
	const cacheAge = process.env.NODE_ENV === "development" ? 0 : ONE_DAY;
	const outputColor = chalk.white;
	const PORT = process.env.PORT || 3375;
	// #endregion
	const logToTerminal = (msg) => {
		console.log(`[${new Date().toLocaleTimeString()}] ${msg}.`);
	}

	logToTerminal(outputColor(`Server serving from ${rootDir} with caching maxAge = ${cacheAge} ms.`));

	let options = { maxAge: cacheAge };
	//This will prevent config files from being cached by the server, allowing an application restart instead of a rebuild.
	if (cacheAge === 0) {
		options.setHeaders = function (res, path, stat) {
			res.set("cache-control", "no-cache")
		}
	}

	logToTerminal(outputColor("Starting Server"));

	/**
	 * Builds the server.
	 *
	 * @param {string} err Error message, if an error occurred.
	 */
	const buildServer = err => {
		if (err) {
			console.error(err);
			return;
		}

		const handleError = e => {
			if (e) {
				console.error(e);
				process.send("serverFailed");
				process.exit(1);
			}
		}

		extensions.updateServer(app, err => {
			handleError(err);

			const server = app.listen(
				PORT,
				e => {
					handleError(e);

					logToTerminal(outputColor(`Listening on port ${PORT}`));

					global.host = server.address().address;
					global.port = server.address().port;

					const done = () => {
						logToTerminal(chalk.green("Server started"));
						extensions.post(err => {
							if (err) {
								handleError(err);
							} else {
								process.send("serverStarted");
							}
						});
					};
					done();
				});
		});
	}

	extensions.pre(buildServer);
})();