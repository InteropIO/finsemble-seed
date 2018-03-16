const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { DefinePlugin } = require("webpack");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";

const plugins =
	[
		new DefinePlugin({ 
			"process.env": {
				"NODE_ENV": JSON.stringify(env)
			}
		})
	]

if (env === "production") {
	// When building the production environment, minify the code.
	plugins.push(new UglifyJsPlugin());
}

module.exports = function () {
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
		plugins: plugins,
		output: {
			filename: "[name].js",
			sourceMapFilename: "[name].map.js",
			path: path.resolve(__dirname, '../../dist/'),
			publicPath: 'http://localhost:3375/'
		},
		watch: false,
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