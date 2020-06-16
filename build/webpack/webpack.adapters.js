const path = require("path");
const adaptersToBuild = require("./webpack.adapters.entries.json");

let entries = {};
for (let key in adaptersToBuild) {
	let component = adaptersToBuild[key];
	entries[component.output] = component.entry;
}

module.exports = {
	devtool: "source-map",
	entry: entries,
	stats: "minimal",
	module: {
		rules: [
			{
				test: /\.js(x)?$/,
				exclude: [/node_modules/, "/chartiq/"],
				loader: "babel-loader",
				options: {
					cacheDirectory: "./.babel_cache/",
					presets: ["react", "stage-1"],
				},
			},
		],
	},
	output: {
		filename: "[name].js",
		sourceMapFilename: "[name].map.js",
		path: path.resolve(__dirname, "../../dist/"),
	},
	resolve: {
		extensions: [".js", ".jsx", ".json", "scss", "html"],
	},
};
