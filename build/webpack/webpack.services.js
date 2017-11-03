var path = require('path');
var fs = require("fs");
var glob = require("glob");
var glob_entries = require('webpack-glob-entries');
var CopyWebpackPlugin = require('copy-webpack-plugin');


function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function (file) {
		return fs.statSync(path.join(srcpath, file)).isFile();
	});
}

var services = glob_entries(path.join(__dirname, '../', "/src/services/**/*"));

var entry = {};

for (var key in services) {
	var currentPath = services[key];
	var folder = key.replace("Service", "");
	var newKey = key.replace("Service", "");
	var entryKey = 'services/' + folder + "/" + key;
	entry[entryKey] = [currentPath];
}

function buildComponentIgnore() {
	var components = require('./webpack.entries.json');
	for (var key in components) {
		var filename = components[key].entry.split("/").pop();
		componentIgnores.push("*" + filename);
	}
}

if (Object.keys(entry).length === 0) {
	return module.exports = null;//If we don't have services there is no need to create an entry json
};

module.exports = {
	name: "services",
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
	plugins: [
		new CopyWebpackPlugin([
			{
				from: './src/components/',
				to: './components/',
				force: false,
				ignore: ['*.js']
			},
			{
				from: './configs/',
				to: './configs/',
				force: true
			},
			{
				from: './src/services/',
				to: './services/',
				force: true,
				ignore: ["*.js"]
			},
			{
				from: './src/thirdParty/',
				to: './thirdParty/',
				force: false,
				ignore: ["*.js"]
			},
		], {
				ignore: componentIgnores
			})
	],
	output: {
		filename: "[name].js",
		libraryTarget: 'umd',
		path: path.join(__dirname, '../', '/built/services'),
		publicPath: 'http://localhost:3375/'
	},
	watch: false
};