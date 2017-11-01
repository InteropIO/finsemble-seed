//  config settings
var enableHMR = true;//Enable Hot Reload
var HMRBlacklist = ["testComponent"];//Components to explude
var HMRWhitelist = [];//Only reload these components

var path = require('path');
var git = require('git-rev-sync');
var glob_entries = require('webpack-glob-entries');
var webpack = require("webpack")
var componentsToBuild = require('./webpack.files.entries.json');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var defaultConfig = require("./defaultWebpackConfig");

if (!process.env.NODE_ENV) {// if we are in production turn off hotreload
	enableHMR = false;
}
function shouldIHMR(key) {
	if (!enableHMR) return false;//Hotreload is off
	if (HMRWhitelist.length) {// If we have a whitelist then the entry must be in here
		if (HMRWhitelist.includes(key)) return true;
	} else if (!HMRBlacklist.includes(key)) {// No whitelist and not in the black list.
		return true;
	}
	return false;// No whitelist and in the blacklist
}

var entries = [];//Are entry list
var entry = {};// Object for non hotreload files
var reloadEntry = {};//We put all of our hotreload files here


for (let key in componentsToBuild) {
	let component = componentsToBuild[key];
	if (!enableHMR || !shouldIHMR(key)) {//add to the non hotreload entry
		entry[component.output] = component.entry;
		continue;
	}
	reloadEntry[component.output] = [
		component.entry,
		path.resolve(__dirname, '../../server/hotreloadmiddleware/') + '/client?reload=true&sockets=true&name=' + key//inject the hotreload client
		//and tell it to use sockets
	];
}

var componentIgnores = [];
function buildComponentIgnore() {//Dont copy files that we build
	var components = componentsToBuild;
	for (var key in components) {
		var filename = components[key].entry.split("/").pop();
		componentIgnores.push("*" + filename);
	}
}
var mainEntry = false;//Where to place the copy.
if (Object.keys(entry).length) {//If we have entries in here build the entry file
	mainEntry = true;
	var newEntry = defaults();
	newEntry.entry = entry;
	newEntry.plugins.push(new CopyWebpackPlugin([
		{
			from: './src/components/',
			to: './components/',
			force: false,
			ignore: ["*.js","*.jsx"]
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
		}));
	entries.push(newEntry);
}

if (Object.keys(reloadEntry).length) {//If we have entries in here build the entry file
	var hotReloadEntry = defaults();
	hotReloadEntry.plugins.push(new webpack.HotModuleReplacementPlugin(),//Add in the hot reload plugins
		new webpack.NoEmitOnErrorsPlugin());
	if (!mainEntry) {
		hotReloadEntry.plugins.push(new CopyWebpackPlugin([
			{
				from: './src/components/',
				to: './dist/components/',
				force: true,
				ignore: ["*.js","*.jsx"]
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
		]));
	}
	hotReloadEntry.entry = reloadEntry;
	entries.push(hotReloadEntry);
}




function defaults() {// Our defualt entry
	return new defaultConfig();
}
module.exports = entries;


