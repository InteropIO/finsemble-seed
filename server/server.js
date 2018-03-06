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
	const path = require("path");

	// Local
	const hotreload = require("./dev/hotreload");
	// #endregion

	// #region Constants
	const app = express();
	const rootDir = path.join(__dirname, "..", "dist");
	const moduleDirectory = path.join(__dirname, "..", "finsemble");
	const cacheAge = 0;
	const outputColor = chalk.yellow;
	const PORT = process.env.PORT || 3375;
	// #endregion

	console.log(outputColor(`SERVER SERVING FROM ${rootDir} with caching maxage = ${cacheAge}`));

	const startServer = () => {
		console.log("Starting Server");

		// For Assimulation
		app.use("/hosted", express.static(path.join(__dirname, "..", "hosted"), { maxage: cacheAge }));

		// Sample server root set to "/" -- must align with paths thoughout configs/openfin/manifest-local.json and configs/other/server-environment-startup.json

		//Make the config public
		app.use("/configs", express.static("./configs", { maxage: cacheAge }));


		app.use("/", express.static(rootDir, { maxage: cacheAge }));

		//Open up the Finsemble Components,services, and clients
		app.use("/finsemble", express.static(moduleDirectory, { maxage: cacheAge }));

		const server = app.listen(
			PORT,
			() => {
				console.log(chalk.green(`listening on port ${PORT}`));

				global.host = server.address().address;
				global.port = server.address().port;

				if (process.env.NODE_ENV === "dev") {
					// Setup hotreload in the dev environment
					console.log("start hotreload")
					hotreload(app, server, () => {
						process.send("serverStarted");
					});
				} else if (process.send) {
					process.send("serverStarted");
				}
			});
	}

	startServer();
})();