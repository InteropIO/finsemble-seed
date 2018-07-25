#!/usr/bin/env node

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

//This file is referenced in the environment switching tutorial

(() => {
	"use strict";
	if (!process.send) process.send = console.log;
	// #region Imports
	// NPM
	const chalk = require("chalk");
	chalk.enabled = true;
	//force color output
	chalk.level = 1;
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
				const server = app.listen(
					PORT,
					e => {
						handleError(e);

						logToTerminal(outputColor(`Listening on port ${ PORT } `));

						global.host = server.address().address;
						global.port = server.address().port;
				});

				app.use(compression());
				// Sample server root set to "/" -- must align with paths throughout
				app.use("/", express.static(rootDir, options));
				// Open up the Finsemble Components,services, and clients
				app.use("/finsemble", express.static(moduleDirectory, options));
				// For Assimilation
				app.use("/hosted", express.static(path.join(__dirname, "..", "hosted"), options));

				// configs/openfin/manifest-local.json and configs/other/server-environment-startup.json
				// Make the config public
				app.use("/configs", express.static("./configs", options));

				/**
				 * Fill in the ProxyMap with entries in order to proxy remote components.
				 * For instance /connect4/blah/mycomponent.html would be proxied to http://connect4.chartiq.com/blah/mycomponent.html
				 *
				 * This proxy further uses the referer http header to redirect assets from within the component.
				 */
				let ProxyMap = [
				/* Examples
					{
						root: "connect4",
						proxyTarget: "http://connect4.chartiq.com",
						host: "connect4.chartiq.com"
					},
					{
						root: "connect3",
						proxyTarget: "http://connect3.chartiq.com",
						host: "connect3.chartiq.com"
					},
					{
						root: "connect2",
						proxyTarget: "http://connect2.chartiq.com",
						host: "connect2.chartiq.com"
					}
				*/
				];

				if (ProxyMap.length) {

					const { URL } = require("url");
					ProxyMap.forEach((config) => {
						console.log("Setting up proxy for", config.host);
						const proxy = httpProxy({
							target: config.proxyTarget,
							changeOrigin: true,
							//Removes the root in the path of the original request, so that the resulting request goes to target/path (without the proxy root)
							pathRewrite: {
								[`${config.root}`]: '/'
							}
						});
						config.proxy = proxy;
						app.use("/" + config.root, proxy);
					});

					app.use("*", (req, res, next) => {
						let referer = req.get("referer");
						if (referer) {
							referer = new URL(referer);
							//Check to see the referer matches any of the hosts we're trying to proxy. If so, redirect the request.
							let proxyConfig = ProxyMap.filter((config) => referer.pathname.includes(config.root))[0];
							if (proxyConfig) {
								console.log("Proxying because of referer", req.path, req.originalUrl, "to", proxyConfig.host);
								return proxyConfig.proxy(req, res, next);
							} else {
								//console.log("Request with referer did not match any proxied hosts.", "Request originalUrl", req.originalUrl);
							}
						}
						next();
					});

				}
				cb();
			}
		};
	// #endregion

	// #region Constants
	const app = express();
	const rootDir = path.join(__dirname, "..", "dist");
	const moduleDirectory = path.join(__dirname, "..", "finsemble");
	const ONE_DAY = 24 * 3600 * 1000;
	const cacheAge = process.env.NODE_ENV === "development" ? 0 : ONE_DAY;
	const PORT = process.env.PORT || 3375;
	// #endregion
	const logToTerminal = (msg, color = "white", bgcolor = "bgBlack") => {
		if (!chalk[color]) color = "white";
		if (!chalk[color][bgcolor]) bg = "black";
		console.log(`[${new Date().toLocaleTimeString()}] ${chalk[color][bgcolor](msg)}.`);
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
	if (process.env.NODE_ENV === "development") {
		//JSON file that has start times and retrieval times for the manifest and startup_app.
		const STATS_PATH = path.join(__dirname, "./stats.json");
		//Listens for the first time that the config and the serviceManager are retrieved, and logs output to the console.
		let notified_config = false, notified_sm = false;
		let serviceManagerRetrievedTimeout;
		app.get("/configs/openfin/manifest-local.json", (req, res, next) => {
			if (!notified_config) {
				let stats = require(STATS_PATH);
				const now = Date.now();
				const launchDuration = (now - stats.startTime) / 1000;
				stats.manifest_retrieval = now;
				stats.manifest_retrieval_diff_in_s = launchDuration;
				fs.writeFileSync(STATS_PATH, JSON.stringify(stats), "utf-8");

				logToTerminal(outputColor(`Application manifest retrieved ${launchDuration}s after launch`));
				notified_config = true;
				serviceManagerRetrievedTimeout = setTimeout(() => {
					logToTerminal(errorColor(`ERROR: Finsemble application manifest has been retrieved from the server, but the Finsemble Service Manager has not. This can be caused by a slow internet connection (e.g., downloading assets). This can also be a symptom that you have a hanging openfin process. Please inspect your task manager to ensure that there are no lingering processes. Alternatively, run 'finsemble-cli kill'`))
				}, 10000);
			}
			next();
		});

		app.get("/finsemble/components/system/serviceManager/serviceManager.html", (req, res, next) => {
			if (!notified_sm) {
				clearTimeout(serviceManagerRetrievedTimeout);
				const stats = require(STATS_PATH);
				const now = Date.now();
				const launchDuration = (now - stats.startTime) / 1000;
				stats.sm_retrieval = now;
				stats.sm_retrieval_diff_in_s = launchDuration;
				fs.writeFileSync(STATS_PATH, JSON.stringify(stats), "utf-8");

				logToTerminal(outputColor(`Application started ${launchDuration}s after launch`));
				notified_sm = true;
			}
			next();
		});
	}
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

		extensions.updateServer(app, err => {
			handleError(err);
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
	}

	extensions.pre(buildServer);
})();
