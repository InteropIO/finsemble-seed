
var webpack = require('webpack');
var path = require('path');
var chalk = require('chalk');

/**
 *This file loads our webpack files, builds them, and stores them in memory. This should only be used when in the local dev env
 *
 */
var glob_entries = require('webpack-glob-entries');
module.exports = function loadDev(app, server, cb) {
	var webPackFiles = glob_entries(path.join(__dirname, "../../", "/build/webpack/webpack*.js"));//get all build files
	var webpackArray = [];

	for (var item in webPackFiles) {
		var buildItem = require(webPackFiles[item]);
		if (!buildItem) continue;
		if (Array.isArray(buildItem)) {//If our webpack is an array then merge it in
			webpackArray = webpackArray.concat(buildItem);
			continue;
		}
		webpackArray.push(buildItem);
	}

	var allBuilt = false;
	var compiler = webpack(webpackArray);
	if (webpackArray.length === 0) return cb(compiler);
	var webpackDevMiddlewareInstance = require("webpack-dev-middleware")(compiler, {//build the webpack files and store them in memory
		noInfo: true, publicPath: "http://localhost:3375/", error: handleWebpackError, reporter: webpackReporter
	});

	function webpackReporter(item) {//For some reason this allows us to get more than three builds in.

	}

	compiler.plugin("done", function (statsResult) {
		// Keep hold of latest stats so they can be propagated to new clients
		var latestStats = statsResult;
		var prevError = null;
		for (var i = 0; i < statsResult.stats.length; i++) {
			var statComp = statsResult.stats[i].compilation;
			for (var j = 0; j < statComp.errors.length; j++) {
				var err = statComp.errors[j];
				if (err.error && err.error.message !== prevError) {
					prevError = err.error.message;
					if (!err.error.file) {
						console.error(chalk.bold.bgRed.underline("MSG:"), err.error.error ? err.error.error.message : err.error.message,
							"\n", chalk.bold.bgRed.underline("line:"), err.error.error ? err.error.error.loc.line : null);
					} else {
						console.error(chalk.bold.bgRed.underline("File:"), err.error.file,
							"\n", chalk.bold.bgRed.underline("Error MSG:"), err.error.formatted,
							"\n", chalk.bold.bgRed.underline("line:"), err.error.line);
					}
				} else {
					// Uglify returns errors as strings, not as objects
					console.error(chalk.bold.bgRed(err));
				}
			}
		}
		console.log("wepack build complete");
	});

	function handleWebpackError(err) {
		if (!allBuilt) {
			console.error("There was in error before the server started. Please fix and restart");
			process.exit();
		}
	}

	app.use(webpackDevMiddlewareInstance);

	require("../hotreloadmiddleware/middleware").webpackSocketHotMiddleware(compiler, { sockets: true, server: server });

	webpackDevMiddlewareInstance.waitUntilValid(function () {//When build is complete we call the callback.
		//The compiler is sent through so that hot reload can pick it up
		allBuilt = true;
		console.log("build complete");
		cb(compiler);
	});
};