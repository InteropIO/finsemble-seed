const path = require("path");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const { DllReferencePlugin, DefinePlugin } = require("webpack");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";

module.exports = class WebpackDefaults {
	constructor() {
		let plugins = [
			new DefinePlugin({
				"process.env": {
					NODE_ENV: JSON.stringify(env),
				},
			}),
			new HardSourceWebpackPlugin({
				info: {
					level: "warn",
				},
				cacheDirectory: "../.webpack-file-cache/[confighash]",
			}),
		];

		try {
			const VENDOR_MANIFEST = require("./vendor-manifest.json");
			plugins.push(
				new DllReferencePlugin({
					manifest: VENDOR_MANIFEST,
				})
			);
		} catch (e) {
			//This should never happen. Vendor-manifest is built prior to files being built. But it's here just in case.
			console.error(
				`[WEBPACK ERROR:] You have not generated a vendor-manifest for your webpack configuration. This is an important optimization that reduces build times by 30-40%. Please run "npm run build:vendor-manifest", and then run "npm run dev" once more. You are required to build the vendor manifest when you delete your dist folder, when your node modules update, or when you update the Finsemble Seed project.`
			);
			process.exit(1);
		}

		if (env === "production") {
			// When building the production environment, minify the code.
			plugins.push(new UglifyJsPlugin());
		}
		return {
			devtool: env === "production" ? "source-map" : "eval-source-map",
			entry: {},
			stats: "minimal",
			module: {
				rules: [
					{
						test: /\.s?css$/i,
						use: [
							"style-loader",
							{
								loader: "css-loader",
								options: {
									sourceMap: env !== "production",
								},
							},
						],
					},
					{
						test: /\.(png|img|ttf|ottf|eot|woff|woff2)$/,
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
						loader: "url-loader",
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
					{
						test: /\.ts(x)?$/,
						loader: "ts-loader",
						exclude: /node_modules/,
					},
					// All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
					{
						enforce: "pre",
						test: /\.js$/,
						loader: "source-map-loader",
					},
				],
			},
			mode: env,
			plugins: plugins,
			optimization: {
				usedExports: true,
			},
			output: {
				filename: "[name].js",
				sourceMapFilename: "[name].map.js",
				path: path.resolve(__dirname, "../../dist/"),
			},
			resolve: {
				alias: {
					react: path.resolve("./node_modules/react"),
					"react-dom": path.resolve("./node_modules/react-dom"),
					"@babel/runtime": path.resolve("./node_modules/@babel/runtime"),
					async: path.resolve("./node_modules/async"),
				},
				extensions: [
					".tsx",
					".ts",
					".js",
					".jsx",
					".json",
					".scss",
					".css",
					".html",
				],
				modules: ["./node_modules"],
			},
		};
	}
};
