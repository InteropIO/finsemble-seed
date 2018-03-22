//  config settings
const path = require('path');
const glob_entries = require('webpack-glob-entries');
const webpack = require("webpack")
const componentsToBuild = require('./webpack.files.entries.json');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const defaultConfig = require("./defaultWebpackConfig");

function defaults() {
	return new defaultConfig();
}
var adapters = glob_entries(path.join(__dirname, '../../', "/src/adapters/**/*.js"));
console.log('adapters', adapters);
var entry = {};

//process service files found
for (var key in adapters) {
	var currentPath = adapters[key];
	//This object builds up an object where every key is the output directory of the file, and the value is the entry file. Typically we want to preserve the path. For services, we default to putting them in their named folder (below).
	var entryKey = 'adapters/' + key;

	entry[entryKey] = [currentPath];
}


config = new defaults();
config.entry = entry;
module.exports = config;


