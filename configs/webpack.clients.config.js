var path = require('path');
var fs = require("fs");
var glob = require("glob");
var glob_entries = require('webpack-glob-entries');

function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function (file) {
		return fs.statSync(path.join(srcpath, file)).isFile();
	});
}
var entry = glob_entries(path.join(__dirname, '../', "/src/clients/*.js"));
console.log(entry);
var dir = "clients";
for (var key in entry) {
	var currentPath = entry[key];
	delete entry[key];
	//e.g., clients/testClient : testClient.js
	//This is so the clients are put in the right folder.
	entry[path.join(dir, key)] = key;
}
console.log(entry);

module.exports = {
	devtool: 'source-map',
	entry: entry,
	target: 'web',
	context:path.resolve(__dirname, '../src/clients'),
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
		path: path.resolve(__dirname, '../built/')
	},
	watch: false,
	resolve: {
		extensions: ['.js', '.json'],
		modulesDirectories: [
			'./src/clients',
			'./src/components',
			'./node_modules'
		]
	}
};