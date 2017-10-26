var path = require('path');
var git = require('git-rev-sync');
var glob_entries = require('webpack-glob-entries');
var webpack = require("webpack")
var componentsToBuild = require('./webpack.files.entries.json');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var enableHMR = true;//Enable Hot Reload
var HMRBlacklist = [];//Components to explude
var HMRWhitelist = [];//Only reload these components

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
				force: true
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
	return {
		devtool: 'source-map',
		entry: {},
		stats: {
			warnings: true
		},
		module: {
			rules: [
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader']
				},
				{
					test: /\.scss$/,
					use: ["style-loader", "css-loader", "sass-loader"]
				},
				{
					test: /\.png|img$/,
					loader: 'url-loader'
				},
				{
					test: /\.svg$/,
					loader: 'url-loader?limit=65000&mimetype=image/svg+xml&name=public/fonts/[name].[ext]'
				},
				{
					test: /\.woff$/,
					loader: 'url-loader?limit=65000&mimetype=application/font-woff&name=public/fonts/[name].[ext]'
				},
				{
					test: /\.woff2$/,
					loader: 'url-loader?limit=65000&mimetype=application/font-woff2&name=public/fonts/[name].[ext]'
				},
				{
					test: /\.[ot]tf$/,
					loader: 'url-loader?limit=65000&mimetype=application/octet-stream&name=public/fonts/[name].[ext]'
				},
				{
					test: /\.eot$/,
					loader: 'url-loader?limit=65000&mimetype=application/vnd.ms-fontobject&name=public/fonts/[name].[ext]'
				},
				{
					test: /semver\.browser\.js/,
					use: ['imports?define=>undefined']
				},

				{
					test: /\.js(x)?$/,
					exclude: [/node_modules/, "/chartiq/"],
					loader: 'babel-loader',
					options: {
						presets: ['react', 'stage-1']
					}
				}
			]
		},
		plugins: [],
		output: {
			filename: "[name].js",
			sourceMapFilename: "[name].map.js",
			path: path.resolve(__dirname, '../../dist/'),
			publicPath: 'http://localhost:3375/'
		},
		watch: true,
		resolve: {
			extensions: ['.js', '.jsx', '.json', 'scss', 'html'],
			modules: [
				'./node_modules',
				'./src/components',
				'./src/clients',
				'./src/services'
			],
		},
	};
}
module.exports = entries;



