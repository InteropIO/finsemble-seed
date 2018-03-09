#!/usr/bin / env node

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
(() => {
	"use strict";

	// #region Imports
	// NPM
	const chalk = require("chalk");
	const express = require("express");
	const fs = require("fs");
	const path = require("path");

	// Local
	const hotReload = require("./dev/hotreload");
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
			updateServer: (app, cb) => { cb(); }
		};
	// #endregion

	// #region Constants
	const app = express();
	const rootDir = path.join(__dirname, "..", "dist");
	const moduleDirectory = path.join(__dirname, "..", "finsemble");
	const cacheAge = 0;
	const outputColor = chalk.yellow;
	const PORT = process.env.PORT || 3375;
	// #endregion

	console.log(outputColor(`Server serving from ${rootDir} with caching maxAge = ${cacheAge} ms.`));

	const options = { maxAge: cacheAge };

	console.log(outputColor("Starting Server"));

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

		// For Assimilation
		app.use("/hosted", express.static(path.join(__dirname, "..", "hosted"), options));

		// Sample server root set to "/" -- must align with paths throughout 
		// configs/openfin/manifest-local.json and configs/other/server-environment-startup.json

		// Make the config public
		app.use("/configs", express.static("./configs", options));

		app.use("/", express.static(rootDir, options));

		// Open up the Finsemble Components,services, and clients
		app.use("/finsemble", express.static(moduleDirectory, options));

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

					console.log(chalk.green(`Listening on port ${PORT}`));

					global.host = server.address().address;
					global.port = server.address().port;

					const done = () => {
						console.log(outputColor("Server started"));
						extensions.post(err => {
							if (err) {
								handleError(err);
							} else {
								process.send("serverStarted");
							}	
						});	
					};

					if (process.env.NODE_ENV === "dev") {
						// Setup hot reload in the dev environment
						console.log(outputColor("start hot reload"));
						hotReload(app, server, done);
					} else if (process.send) {
						done();
					}
				});
		});
	}

	extensions.pre(buildServer);
})();