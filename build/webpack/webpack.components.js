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
let webpackConfig = null;//Our list of webpack configs list

let entries = {};

for (let key in componentsToBuild) {
	let component = componentsToBuild[key];
	entries[component.output] = component.entry;
}
webpackConfig = new defaultConfig();
webpackConfig.plugins.push(new CopyWebpackPlugin([
	//This copies everything except javascript and react files.
	{
		from: './src/components/',
		to: './components/',
		force: false,
		ignore: ["*.js", "*.jsx"]
	},
	{
		from: './src-built-in/components/',
		to: './components/',
		force: false,
		ignore: ["*.js", "*.jsx"]
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
		from: './src/clients/',
		to: './clients/',
		force: true,
		ignore: ["*.js"]
	},
	{
		from: './src/thirdParty/',
		to: './thirdParty/',
		force: false,
		ignore: ["*.js"]
	},
	{
		from: './node_modules/@chartiq/finsemble/dist',
		to: path.join(__dirname, "../../finsemble/"),
		force: true
	}
]));
webpackConfig.entry = entries;

module.exports = webpackConfig;


