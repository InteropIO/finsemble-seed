const path = require('path');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { DllReferencePlugin, EnvironmentPlugin, ProgressPlugin } = require("webpack");
const hardSource = require("hard-source-webpack-plugin");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";

module.exports = class WebpackDefaults {
	constructor() {
		let plugins =
			[
				new EnvironmentPlugin(['NODE_ENV']),
				new ProgressPlugin({ profile: false })
			]

		try {
			const VENDOR_MANIFEST = require('./vendor-manifest.json');
			plugins.push(new DllReferencePlugin({
				manifest: VENDOR_MANIFEST
			}));
		} catch (e) {
			//This should never happen. Vendor-manifest is built prior to files being built. But it's here just in case.
			console.error(`[WEBPACK ERROR:] You have not generated a vendor-manifest for your webpack configuration. This is an important optimization that reduces build times by 30-40%. Please run "npm run build:vendor-manifest", and then run "npm run dev" once more. You are required to build the vendor manifest when you delete your dist folder, when your node modules update, or when you update the Finsemble Seed project.`);
			process.exit(1);
		}

		if (env === "production") {
			// When building the production environment, minify the code.
			plugins.push(new UglifyJsPlugin());
		} else {
			plugins.push(new hardSource({
				//root dir here is "dist". Back out so we dump this file into the root.
				cacheDirectory: '../.webpack-file-cache/[confighash]',
				// Either an absolute path or relative to webpack's options.context.
				// Sets webpack's recordsPath if not already set.
				environmentHash: {
					root: process.cwd(),
					directories: [],
					files: ['package-lock.json'],
				}
			}));
		}
		return {
			devtool: 'source-map',
			entry: {},
			stats: "minimal",
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
						test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
						issuer: {
							test: /\.jsx?$/
						},
						use: ['@svgr/webpack']
					},
					{
						test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
						loader: 'url-loader?limit=65000&mimetype=image/svg+xml&name=/public/fonts/[name].[ext]'
					},
					{
						test: /\.woff$/,
						loader: 'url-loader?limit=65000&mimetype=application/font-woff&name=/public/fonts/[name].[ext]'
					},
					{
						test: /\.woff2$/,
						loader: 'url-loader?limit=65000&mimetype=application/font-woff2&name=/public/fonts/[name].[ext]'
					},
					{
						test: /\.[ot]tf$/,
						loader: 'url-loader?limit=65000&mimetype=application/octet-stream&name=/public/fonts/[name].[ext]'
					},
					{
						test: /\.eot$/,
						loader: 'url-loader?limit=65000&mimetype=application/vnd.ms-fontobject&name=/public/fonts/[name].[ext]'
					},
					{
						test: /semver\.browser\.js/,
						use: ['imports?define=>undefined']
					},
					{
						test: /\.js(x)?$/,
						exclude: /node_modules/,
						use: {
							loader: "babel-loader",
							options: {
								presets: [
									["@babel/preset-env", {
										targets: {
											browsers: "Chrome 70"
										},
										modules: "commonjs"
									}],
									"@babel/preset-react"],
								plugins: [
									"babel-plugin-add-module-exports",
									"@babel/plugin-proposal-export-default-from",
									"@babel/plugin-transform-modules-commonjs",
									"@babel/plugin-proposal-class-properties",
									["@babel/plugin-proposal-decorators", { decoratorsBeforeExport: false }],
									["@babel/plugin-transform-runtime", { regenerator: true }]
								]
							}
						}
					},
					{
						test: /\.tsx?$/,
						loader: 'ts-loader',
						exclude: /node_modules/
					}
				]
			},
			mode: env,
			plugins: plugins,
			optimization: {
				usedExports: true,
			},
			output: {
				filename: "[name].js",
				sourceMapFilename: "[name].map.js",
				path: path.resolve(__dirname, '../../dist/')
			},
			resolve: {
				alias: {
					react: path.resolve('./node_modules/react'),
					'react-dom': path.resolve('./node_modules/react-dom'),
					'@babel/runtime': path.resolve('./node_modules/@babel/runtime')
				},
				extensions: ['.tsx', '.ts', '.js', '.jsx', '.json', 'scss', 'html'],
				modules: [
					'./node_modules'
				],
			}
		}
	};
}