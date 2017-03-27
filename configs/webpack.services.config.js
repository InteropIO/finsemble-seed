var path = require('path');
var fs = require("fs");
var glob = require("glob");
var glob_entries = require('webpack-glob-entries');

function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function (file) {
		return fs.statSync(path.join(srcpath, file)).isFile();
	});
}
var entry = glob_entries(path.join(__dirname, '../', "/src/services/**/*"));
var dir = 'services';
for (var key in entry) {
	var currentPath = entry[key];
	delete entry[key];
	var newKey = key.replace("Service", "");
	if (key !== "baseClient") {
		entry[path.join(newKey, newKey)] = currentPath;
	} else {
		entry[path.join(newKey)] = currentPath;
	}
}
module.exports = {
	devtool: 'source-map',
	entry: entry,
	target: 'web',
	context: path.join(__dirname, '/src/services'),
	module: {
		loaders: [{
			test: /\.json$/,
			loader: "json-loader",
			"plugins": [
				"add-module-exports"
			]
		},
			{
				test: /\.html$/,
				loader: "html-loader",				
			}
		]
	},
	output: {
		filename: "[name].js",
		libraryTarget: 'umd',
		path: path.join(__dirname, '../', '/built/services')
	},
	watch: false
};