var path = require('path');
var fs = require("fs");
var glob = require("glob");
var glob_entries = require('webpack-glob-entries');

function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function (file) {
		return fs.statSync(path.join(srcpath, file)).isFile();
	});
}
var entry = glob_entries(path.join(__dirname, '../', "/src/components/**/*"));
console.log(entry);
for (var key in entry) {
	var currentPath = entry[key];
	delete entry[key];
	//e.g., components/myComponent/myComponent
	entry[path.join(key, key)] = currentPath;
}
module.exports = {
	devtool: 'source-map',
	entry: entry,
	target: 'web',
	context: path.join(__dirname, '../src/components'),
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
		path: path.join(__dirname, '../built/components')
	},
	watch: false,
	stats: {
		errorDetails: true
	}
};