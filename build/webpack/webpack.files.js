//  config settings
const path = require('path');
const glob_entries = require('webpack-glob-entries');
const webpack = require("webpack")
const componentsToBuild = require('./webpack.files.entries.json');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const defaultConfig = require("./defaultWebpackConfig");

let enableHMR = false,//Enable Hot Reload
	HMRBlacklist = ["testComponent"],//Components to explude
	HMRWhitelist = [],//Only reload these components
	componentIgnores = [],
	webpackConfigs = [];//Our list of webpack configs list

if (process.env.NODE_ENV === "production") {// if we are in production turn off hotreload
	enableHMR = false;
}

for (var key in componentsToBuild) {
	var filename = componentsToBuild[key].entry.split("/").pop();
	componentIgnores.push("*" + filename);
}

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
// console.log(webpackConfig.entry);

// webpackConfig.plugins.push(new webpack.optimize.CommonsChunkPlugin({
// 	name: "vendor",
// 	// filename: "vendor.js"
// 	// (Give the chunk a different name)

// 	minChunks: Infinity,
// 	// (with more entries, this ensures that no other module
// 	//  goes into the vendor chunk)
// }));
// webpackConfig.plugins.push(new webpack.optimize.CommonsChunkPlugin({
// 	name: 'manifest',
// 	chunks: ['vendor']
// }));
webpackConfig.plugins.push(new CopyWebpackPlugin([
	{
		from: './src/components/',
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
	}
], { ignore: componentIgnores }));

module.exports = webpackConfigs;


