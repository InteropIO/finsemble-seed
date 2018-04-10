//  config settings
const path = require('path');
const glob_entries = require('webpack-glob-entries');
const webpack = require("webpack");
const fs = require("fs");
const builtInComponents = fs.existsSync(path.join(__dirname, 'webpack.finsemble-built-in.entries.json')) ? require('./webpack.finsemble-built-in.entries.json') : {};
const myComponents = fs.existsSync(path.join(__dirname, 'webpack.components.entries.json')) ? require('./webpack.components.entries.json') : {};
const componentsToBuild = Object.assign(builtInComponents, myComponents);
const CopyWebpackPlugin = require('copy-webpack-plugin');
const defaultConfig = require("./defaultWebpackConfig");
let webpackConfig = null; //Our list of webpack configs list


// Our default entry
function defaults() {
	return new defaultConfig();
}
let entries = {};

for (let key in componentsToBuild) {
	let component = componentsToBuild[key];
	entries[component.output] = component.entry;
}
webpackConfig = new defaults();

webpackConfig.entry = entries;

module.exports = webpackConfig;


