//  config settings
const path = require('path');
const glob_entries = require('webpack-glob-entries');
const webpack = require("webpack")
const componentsToBuild = require('./webpack.files.entries.json');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const defaultConfig = require("./defaultWebpackConfig");
var enableHMR = true,//Enable Hot Reload
	HMRBlacklist = ["testComponent"],//Components to exclude
	HMRWhitelist = [],//Only reload these components
	componentIgnores = [],
	webpackConfigs = [];//Our list of webpack configs list

if (!process.env.NODE_ENV) {// if we are in production turn off hotreload
	enableHMR = false;
}

function buildComponentIgnore() {//Dont copy files that we build
	var components = componentsToBuild;
	for (var key in components) {
		var filename = components[key].entry.split("/").pop();
		componentIgnores.push("*" + filename);
	}
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

// Our defualt entry
function defaults() {
	return new defaultConfig();
}

for (let key in componentsToBuild) {
	let config = new defaults();

	let component = componentsToBuild[key];
	if (!enableHMR || !shouldIHMR(key)) {
		//If we aren't hot reloading this thing, okay - add the config to our array.
		config.entry[component.output] = component.entry;
		webpackConfigs.push(config);
		continue;
	}

	config.entry[component.output] = [
		component.entry,
		path.resolve(__dirname, '../../server/hotreloadmiddleware/') + '/client?reload=true&sockets=true&name=' + key//inject the hotreload client
	];
	//add the hot reload plugins and push.
	config.plugins.push(new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin());
	webpackConfigs.push(config);
}

webpackConfigs[0].plugins.push(new CopyWebpackPlugin([
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


