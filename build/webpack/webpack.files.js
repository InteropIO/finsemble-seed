var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');
var componentsToBuild = require('./webpack.files.entries.json');
var git = require('git-rev-sync');

var entry = {};
var glob_entries = require('webpack-glob-entries');

for (let key in componentsToBuild) {
	let component = componentsToBuild[key];
	entry[component.output] = component.entry;
}

var services = glob_entries(path.join(__dirname, '/../../', "/src/services/**/*.js"));
var dir = 'services';
for (var key in services) {
	var currentPath = services[key];
	delete services[key];
	var newKey = key.replace("Service", "");
	if (key !== "baseClient") {
		entry[path.join('services', newKey, newKey +'Service')] = currentPath;
	} else {
		entry[path.join(newKey)] = currentPath;
	}
}

var clients = glob_entries(path.join(__dirname, '/../../', "/src/clients/*.js"));
var dir = "clients";
for (var key in clients) {
	var currentPath = clients[key];
	delete clients[key];
	//e.g., clients/testClient : testClient.js
	//This is so the clients are put in the right folder.
	entry[path.join(dir, key)] = key;
}
console.log("ENTRY", entry);
if (!entry) {
	module.exports = null;
}
module.exports = {
	devtool: 'source-map',
	entry: entry,
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
	plugins: [
		new CopyWebpackPlugin([
			{
				from: './src/components/',
				to: './components/',
				force: false,
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
				force: true
			},
			{
				from: './src/thirdParty/',
				to: './thirdParty/',
				force: false,
				ignore: ["*.js"]
			},
		])
	],
	output: {
		filename: "[name].js",
		sourceMapFilename: "[name].map.js",
		path: path.resolve(__dirname, '../../dist/')
	},
	watch: true,
	resolve: {
		extensions: ['.js', '.jsx', '.json', 'scss'],
		modules: [
			'./node_modules',
			'./src/components',
			'./src/clients',
			'./src/services'
		],
	},
};