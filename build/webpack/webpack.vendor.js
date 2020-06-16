var webpack = require("webpack");
const path = require("path");
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const {
	DefinePlugin,
	EnvironmentPlugin,
	DllPlugin,
	ProgressPlugin,
} = require("webpack");
const hardSource = require("hard-source-webpack-plugin");

console.log("ENVIRONMENT", env);
let plugins = [
	new DllPlugin({
		name: "vendor_lib",
		path: "build/webpack/vendor-manifest.json",
	}),
	new EnvironmentPlugin(["NODE_ENV"]),
];

if (env === "production") {
	// When building the production environment, minify the code.
	plugins.push(new UglifyJsPlugin());
} else {
	plugins.push(
		new hardSource({
			//root dir here is "dist". Back out so we dump this file into the root.
			cacheDirectory: "../.webpack-file-cache/[confighash]",
			// Either an absolute path or relative to webpack's options.context.
			// Sets webpack's recordsPath if not already set.
			environmentHash: {
				root: process.cwd(),
				directories: [],
				files: ["package-lock.json"],
			},
		})
	);
}

module.exports = {
	entry: {
		vendor: [path.join(__dirname, "./vendor")],
	},
	output: {
		filename: "vendor.bundle.js",
		path: path.join(__dirname, "../../dist"),
		library: "vendor_lib",
	},
	plugins: plugins,
};
