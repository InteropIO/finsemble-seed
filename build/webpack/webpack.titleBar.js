//The title bar can be injected into any component or page - that component or page may not be aware of finsemble, and may not include the vendor.bundle.js file that's required to make the DLL plugin work. This webpack config is to build that component independent of any code splitting done for the rest of the presentation components.
const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const { DefinePlugin } = require("webpack");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
let plugins = [
	new HardSourceWebpackPlugin({
		info: {
			level: "warn",
		},
		cacheDirectory: "../.webpack-file-cache/[confighash]",
	}),
	new DefinePlugin({
		"process.env": {
			NODE_ENV: JSON.stringify(env),
		},
	}),
];

if (env === "production") {
	// When building the production environment, minify the code.
	plugins.push(new UglifyJsPlugin());
}

const windowTitleBarPath =
	"./src/components/windowTitleBar/windowTitleBarLoader.js";
module.exports = {
	devtool: env === "production" ? "source-map" : "eval-source-map",
	entry: {
		"components/windowTitleBar/windowTitleBar": windowTitleBarPath,
	},
	stats: "minimal",
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.scss$/,
				use: ["style-loader", "css-loader", "sass-loader"],
			},
			{
				test: /\.png|img$/,
				loader: "url-loader",
			},
			{
				test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
				issuer: {
					test: /\.jsx?$/,
				},
				use: ["@svgr/webpack"],
			},
			{
				test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
				loader:
					"url-loader?limit=65000&mimetype=image/svg+xml&name=/public/fonts/[name].[ext]",
			},
			{
				test: /\.woff$/,
				loader:
					"url-loader?limit=65000&mimetype=application/font-woff&name=/public/fonts/[name].[ext]",
			},
			{
				test: /\.woff2$/,
				loader:
					"url-loader?limit=65000&mimetype=application/font-woff2&name=/public/fonts/[name].[ext]",
			},
			{
				test: /\.[ot]tf$/,
				loader:
					"url-loader?limit=65000&mimetype=application/octet-stream&name=/public/fonts/[name].[ext]",
			},
			{
				test: /\.eot$/,
				loader:
					"url-loader?limit=65000&mimetype=application/vnd.ms-fontobject&name=/public/fonts/[name].[ext]",
			},
			{
				test: /semver\.browser\.js/,
				use: ["imports?define=>undefined"],
			},
			{
				test: /\.js(x)?$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						cacheDirectory: ".webpack-file-cache",
						presets: [
							[
								"@babel/preset-env",
								{
									targets: {
										browsers: "Chrome 70",
									},
									modules: "commonjs",
								},
							],
							"@babel/preset-react",
						],
						plugins: [
							"babel-plugin-add-module-exports",
							"@babel/plugin-proposal-export-default-from",
							"@babel/plugin-transform-modules-commonjs",
							"@babel/plugin-proposal-class-properties",
							[
								"@babel/plugin-proposal-decorators",
								{ decoratorsBeforeExport: false },
							],
							["@babel/plugin-transform-runtime", { regenerator: true }],
						],
					},
				},
			},
		],
	},
	mode: env,
	plugins: plugins,
	output: {
		filename: "[name].js",
		sourceMapFilename: "[name].map.js",
		path: path.resolve(__dirname, "../../dist/"),
	},
	resolve: {
		extensions: [".js", ".jsx", ".json", "scss", "html"],
		alias: {
			react: path.resolve("./node_modules/react"),
			"react-dom": path.resolve("./node_modules/react-dom"),
			"@babel/runtime": path.resolve("./node_modules/@babel/runtime"),
			async: path.resolve("./node_modules/async"),
		},
	},
};
