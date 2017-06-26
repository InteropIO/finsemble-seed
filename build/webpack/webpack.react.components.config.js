var path = require('path');
var fs = require("fs");
var glob = require("glob");
var glob_entries = require('webpack-glob-entries');
var componentsToBuild = require('../configs/componentsToBuild.json');

function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function (file) {
		return fs.statSync(path.join(srcpath, file)).isFile();
	});
}

console.log(componentsToBuild);
module.exports = {
	devtool: 'source-map',
	entry: componentsToBuild,
	target: 'web',
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
		},
		{
			test: /\.js(x)?$/,
			loader: 'babel',
			query: {
				presets: ['react', 'es2015', 'stage-1']
			}
		},
		]
	},
	output: {
		filename: "[name].js",
		libraryTarget: 'umd',
		path: path.join(__dirname, '../built/')
	},
	watch: false,
	stats: {
		errorDetails: true
	},
	resolve: {
		extensions: ['', '.js', '.jsx', '.json'],
		modulesDirectories: [
			'./components/**/*',
			'./node_modules'
		],
	},
};