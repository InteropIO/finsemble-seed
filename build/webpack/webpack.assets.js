/**
 * This webpack configuration is responsible for building the "assets" directory.
 * Currently the `finsemble.css` file is the only asset that is built.
 */
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { generateDefaultConfig } = require("./defaultWebpackConfig");
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";

/**
 * First retrieve the seed project's default webpack configuration. We will use this
 * as the base for building our assets directory.
 */
let config = generateDefaultConfig();

/**
 * Load the plugins that we use. We'll use MiniCssExtractPlugin to generate static CSS files.
 */
config.plugins.push(
	new MiniCssExtractPlugin({
		filename: "[name].css",
		chunkFilename: "[id].css",
	})
);

/**
 * We use the CopyWebpackPlugin to copy assets from the source folder to our dist directory.
 * This plugin is smart enough not to copy over any files that are built by webpack (like finsemble.css)
 */

config.plugins.push(
	new CopyWebpackPlugin([
		{
			from: "./assets/",
			to: "./assets/",
		},
	])
);

/**
 * Currently we only have one asset that we need to build: `finsemble.css`. This is a static
 * representation of the finsemble.css export out of the finsemble-ui library (@chartiq/finsemble-ui).
 */
config.entry = {
	"assets/css/finsemble": "./assets/css/finsemble.css",
	"assets/css/font-finance": "./assets/css/font-finance.css",
};

/**
 * Override the default configuration's rule for css. Normally, css styles are inlined through
 * use of the `style-loader` loader. But here, we want to actually create a static CSS file.
 * MiniCssExtractPlugin is webpack's preferred plugin for creating static CSS files.
 *
 * Note: this will leave behind an extraneous finsemble.js file which is an importable version of the CSS.
 * This can be ignored, or removed if desired: https://stackoverflow.com/questions/50430534/how-to-skip-javascript-output-in-webpack-4
 */
config.module.rules.push({
	test: /\.css$/,
	use: [
		{
			loader: MiniCssExtractPlugin.loader,
			options: {
				publicPath: (resourcePath, context) =>
					`${path.relative(path.dirname(resourcePath), context)}/`,
			},
		},
		{
			loader: "css-loader",
			options: {
				sourceMap: env !== "production",
			},
		},
	],
});

module.exports = config;
