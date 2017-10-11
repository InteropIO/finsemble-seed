
var webpack = require('webpack');
var path = require('path');
/**
 *This file loads our webpack files, builds them, and stores them in memory. This should only be used when in the local dev env
 *
 */
var glob_entries = require('webpack-glob-entries');
module.exports = function loadDev(app, cb) {
	var webPackFiles = glob_entries(path.join(__dirname, "../../", "/build/webpack/webpack.*.js"));//get all build files
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
	var compiler = webpack(webpackArray);
	if (webpackArray.length === 0) return cb(compiler);

	var webpackDevMiddlewareInstance = require("webpack-dev-middleware")(compiler, {//build the webpack files and store them in memory
		noInfo: true, publicPath: "http://localhost:3375/yourSubDirectory/"
	});

	app.use(webpackDevMiddlewareInstance);

	webpackDevMiddlewareInstance.waitUntilValid(function () {//When build is complete we call the callback.
		//The compiler is sent through so that hot reload can pick it up
		cb(compiler);
	});
};