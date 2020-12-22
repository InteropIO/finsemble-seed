/* 
 * This configuration is meant as an illustration of how to load sample-template-advanced in webpack.
 * We've already split the file into index.html and sample-template-webpack.js.
 */
/* eslint-env node */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin'); // copies 3rd party libraries loaded on demand such as html2canvas
const CssPlugin = require('extract-css-chunks-webpack-plugin');  // used for packaging css into bundles
const HtmlWebpackPlugin = require('html-webpack-plugin');  // used to load html
const HtmlWebpackPartialsPlugin = require('html-webpack-partials-plugin');  // used to load html partials
const defaultDir = path.join(__dirname, '.');
const env = process.env.NODE_ENV || 'production';
module.exports = {
	entry: './src/sample-template-webpack.js',
	externals: {
		jquery: 'jQuery'
	},
	mode: env,
	module: {
		/**
		 * Webpack uses a loaders to handle files types other than JavaScript
		 * This section is where we configure all of the loaders used to it easy to consume ChartIQ
		 * These loaders will grab any file that matches the test in the dependency graph created from an entry.
		 * Read more about loaders in webpack:
		 * https://webpack.js.org/concepts/#loaders
		 */
		rules: [
			{
			/**
			 * Tests any file in the bundle for .html extension using the html-loader
			 * We use this to load HTML files for our plugins but it can be used to require any HTML file you need.
			 * Once you load an HTML file you can append it like you would with any any ther reference to the DOM.
			 * Read more about the html-loader:
			 * https://webpack.js.org/loaders/html-loader/
			 */
				test: /\.html/,
				use: [
					{loader: "html-loader"}
				]
			},
			{
			/**
			 * Tests any file in the bundle for .scss or .css extension using the scss-loader or secondarily the css-loader
			 * Use it for loading any styles in the dependency graph of your bundle.
			 * By default it will load SASS files and bundle them and check for CSS files.
			 * The options object sets a public path where you can find the output.
			 * Read more about scss-loader:
			 * https://webpack.js.org/loaders/sass-loader/
			 * Read more about css-loader:
			 * https://webpack.js.org/loaders/css-loader/
			 */
				test: /\.(s)?css$/,
				use: [
					{loader: CssPlugin.loader, options: {publicPath: 'css/'}},
					'css-loader',
					'sass-loader'
				]
			},
			{
			/**
			 * Tests any file for a variety of different file endings using file-loader
			 * This loader allows you to include a variety of file types in your bundle, it's very useful for iamges.
			 * It is used for packaging imported images and images in stylesheets when referenced with url() in setting a CSS property value (both CSS and SCSS).
			 * The options object sets a public path where you can find the output.
			 * Read more about file-loader:
			 * https://webpack.js.org/loaders/file-loader/
			 */
				test: /\.(jpg|gif|png|svg|cur)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
							outputPath: function(url, resourcePath, context) {
								// if folder named "images", asset is loaded outside of css.
								return './' + (/images/.test(resourcePath) ? '' : 'css') + '/img/' + url;
							},
							publicPath: 'img/'
						}
					}
				]
			}
		]
	},
	optimization: {
		/**
		 * SplitChunks used to achieve bundle splitting for more efficient loading.
		 * Here we are creating four additional chunks instead of one massive chunk
		 * You may find that you need to prioritize loading certain features and lazy load others,
		 * creating multiple bundles allows for this flexibility.
		 *
		 * Bundle splitting is an optional feature that you can use with Webpack.
		 * If you prefer one large bundle, you can remove this section of the config and webpack will produce one large JS file.
		 *
		 * This is just an example of what you can do with Webpack's bundle splitting,
		 * for more information please refer to Webpack's documentation.
		 * https://webpack.js.org/guides/code-splitting/#root
		 */
		splitChunks: {
			chunks: 'all',
			maxInitialRequests: Infinity,
			minSize: 1000,
			name: false,
			cacheGroups: {
				components: {
					name: 'components',
					priority: 10,
					test: /[\\/]js[\\/]component(s|UI)[.]js/
				},
				addons: {
					name: 'addOns',
					priority: 20,
					test: /[\\/](plugins[\\/].+[.](js(on)?|html)|js[\\/]addOns[.]js)/
				},
				thirdparty: {
					name: 'thirdparty',
					priority: 30,
					test: /[\\/]node_modules|[\\/]thirdparty[\\/]/
				},
				examples: {
					name: 'examples',
					priority: 40,
					test: /[\\/]examples[\\/].+[.]js/
				},
			}
		}
	},
	output: {
		chunkFilename: 'js/chartiq-[name].js',
		filename: 'js/chartiq-core.js',
		path: path.resolve('dist')
	},
	plugins: [
		/***
		 * Extracts all of our CSS and SCSS bundles and converts them into one unified stylesheet output.
		 * We use the extract-css-chunks-plugin for the benefits it has like Hot Module Reloading
		 * Read more about the Extract CSS Chunks Plugin:
		 * https://www.npmjs.com/package/extract-css-chunks-webpack-plugin
		 */
		new CssPlugin({
			filename: './css/chartiq.css'
		}),
		/**
		 * Generates an HTML file for your bundle and inserts the output files into it with script tags.
		 * By using the HTML Plugin you can create a fresh copy of your HTML page on each build,
		 * this allows you to serve the entire output of /dist/ instead of needing to reference files from /dist/ in your index.html
		 * Read more about the HTML Plugin:
		 * https://webpack.js.org/plugins/html-webpack-plugin/
		 */
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, 'src', 'index.html')
		}),
		/**
		 * Replaces a tag in your HTML with a another HTML file allowing you do use partials for building a larger more complex output.
		 * Partials allow you to reuse whole HTML files, similar to using a Template element in your page.
		 * We use partials to include the HTML for creating an advanced chart all from a single tag defined in the HTMLWebpackPlugin.
		 * Read more about the HTTML Webpack Partials Plugin:
		 * https://github.com/jantimon/html-webpack-plugin
		 */
		new HtmlWebpackPartialsPlugin({
			path: path.join(defaultDir, 'examples', 'templates', 'partials', 'sample-template-advanced-context.html'),
			location: 'cq-context'
		}),
		/**
		 * The Copy plugin will copy required files or directories to the build directory
		 * Read more about the Copy Plugin:
		 * https://www.webpackjs.com/plugins/copy-webpack-plugin/
		 * If you are using ChartIQ in a tarball format you may need to change the from: path to search in "node_modules/chartiq/"
		 * 
		 */
		new CopyPlugin([
			{ from: 'js/thirdparty/html2canvas.min.js', to: 'js/thirdparty/html2canvas.min.js'}
		])
		//new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)  // awesome tool for inspecting your bundle
	],
	resolve: {
		/**
		 * If you're not using ChartIQ in a tarball format readable by NPM then you'll need to inform Webpack where the files are located
		 * This alias tell webpack to make these files and folders available for anything any file that needs them in the dependency graph.
		 */
		alias: {
			chartiq: defaultDir
		}
	}
};
