var path = require('path');
var git = require('git-rev-sync');
var glob_entries = require('webpack-glob-entries');
var webpack = require("webpack")
var componentsToBuild = require('./webpack.files.entries.json');

var enableHMR = true;//Enable Hot Reload
var HMRBlacklist = [];//Components to explude
var HMRWhitelist = [];//Only reload these components
var HMRMethod = 'blacklist';
if (HMRWhitelist.length) { HMRMethod = 'whitelist'; }
var entry = {};

function shouldIHMR(key) {
	if (HMRMethod === 'whitelist' && HMRWhitelist.includes(key)) {
		return true;
	} else if (HMRMethod === 'blacklist' && !HMRBlacklist.includes(key)) {
		return true;
	}
	return false;
}
var entries = [];
for (let key in componentsToBuild) {
	let component = componentsToBuild[key];
	var newEntry = defaults();
	newEntry.name = key;
	newEntry.entry[component.output] = Array.isArray(component.entry) ? component.entry : [component.entry];
	if (enableHMR && shouldIHMR(key)) {
		path.resolve(__dirname, '../../server/hotreloadmiddleware/'),
			newEntry.entry[component.output].push(path.resolve(__dirname, '../../server/hotreloadmiddleware/') + '/client?reload=true&sockets=true&name=' + key);

		newEntry.plugins.push(new webpack.HotModuleReplacementPlugin(),
			new webpack.NoEmitOnErrorsPlugin());
	}
	entries.push(newEntry);
}

var clients = glob_entries(path.join(__dirname, '/../../', "/src/clients/*.js"));
var dir = "clients";
for (var key in clients) {
	var currentPath = clients[key];
	delete clients[key];
	//e.g., clients/testClient : testClient.js
	//This is so the clients are put in the right folder.
	var newEntry = defaults();
	newEntry.name = key;
	newEntry.entry[component.output] = [path.join(dir, key)];
	entries.push(newEntry);
	//entry[path.join(dir, key)] = key;
}

if (Object.keys(entry).length === 0) {
	//If you have no clients, services, or components, we throw a json file in there just to get webpack copying the requisite files over for you.
	//var configPath = path.normalize("configs/application/config");
	//entry[configPath] = "/configs/application/config.json"
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