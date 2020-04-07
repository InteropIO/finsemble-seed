//  config settings
const path = require('path');
const glob_entries = require('webpack-glob-entries');
const webpack = require("webpack");
const fs = require("fs");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const __homename = path.resolve(__dirname, "..", "..");

// The standard webpack files that we always look in
// webpack.finsemble-built-in.entries.json - src-built-in components
// webpack.components.entries.json - components that have been added with finsemble-cli
var listOfWebpackEntryFiles = [
	path.join(__dirname, 'webpack.finsemble-built-in.entries.json'),
	path.join(__dirname, 'webpack.components.entries.json')
];

// Look through the src directory for webpack.entries.json files at the top level.
const srcPath = path.join(__homename, "src");

/**
 * Recursively searches a path for files of a specific name.
 * 
 * @param {string} base The base path 
 * @param {string} searchFilename the name of the file to search for
 * @param {string[]} array of file/folder names to search in base path
 * @param {string[]} result array of files found 
 */
const recursiveFind = (base, searchFilename, files, result) => {
	files = files || fs.readdirSync(base)
	result = result || []

	files.forEach((file) => {
		const newBase = path.join(base, file)
		if (fs.statSync(newBase).isDirectory()) {
			result = recursiveFind(newBase, searchFilename, fs.readdirSync(newBase), result)
		}
		else {
			if (path.basename(file) === searchFilename) {
				result.push(newBase)
			}
		}
	});

	return result
}

// For each file in the directory (src/*)
listOfWebpackEntryFiles.push(...recursiveFind(srcPath, "finsemble.webpack.json"));

// Compile all of those files into a single webpack entries object "componentsToBuild"
// If a file doesn't exist, then no big deal ": {}"
let componentsToBuild = {};
listOfWebpackEntryFiles.forEach((filename) => {
	let entries = fs.existsSync(filename) ? require(filename) : {};

	let additionalComponents = {};
	if (Array.isArray(entries)) {
		// Process arrays (finsemble.webpack.json files) by automatically building the output & entry fields that webpack needs
		entries.forEach((assetName) => {
			const outputPath = path.relative(srcPath, path.dirname(filename));
			const assetNoSuffix = assetName.replace(/\.[^/.]+$/, ""); // Remove the .js or .jsx extension
			const entryPath = path.relative(__homename, path.dirname(filename))
			additionalComponents[assetNoSuffix] = {
				output: path.join(outputPath, assetNoSuffix).replace(/\\/g, "/"),
				entry: `.${path.sep}${path.join(entryPath, assetName)}`.replace(/\\/g, "/")
			};
		});
	} else {
		// Otherwise assume it's already in object format (webpack.components.entries.json)
		additionalComponents = entries;
	}

	componentsToBuild = Object.assign(componentsToBuild, additionalComponents);
});

let entries = {};

// Convert componentsToBuild into the format that webpack likes
for (let key in componentsToBuild) {
	let component = componentsToBuild[key];
	entries[component.output] = component.entry;
}

// Set up an actual webpack config object. Start with a default that we've set up, then add our entries
const defaultConfig = require("./defaultWebpackConfig");
let webpackConfig = new defaultConfig();
webpackConfig.entry = entries;

// This function iterates through src-built-in and src, building a list of all the directories but eliminating duplicates.
// In other words, this allows src/components folders to *override* (replace) folders in src-built-in.
function collapseBuiltInFiles() {
	var combinedList = {}; // contains the final compressed list
	var builtInPath = path.join(__homename, "src-built-in/components"); // path to built in components
	var srcPath = path.join(__homename, "src/components"); // path to src components

	// First put all the built in items into our combined list
	var builtInItems = fs.readdirSync(builtInPath);
	for (let i = 0; i < builtInItems.length; i++) {
		let folder = builtInItems[i];
		combinedList[folder] = path.join(builtInPath, folder);
		//combinedList[folder] = "./src-built-in/components/" + folder + "/";
	}

	// Now put all the src items into our combined list. If there's a dup, then it will override the built in
	var srcItems = fs.readdirSync(srcPath);
	for (let i = 0; i < srcItems.length; i++) {
		let folder = srcItems[i];
		if (folder === ".gitignore") {
			// Don't copy a .gitignore folder.
			continue;
		}

		combinedList[folder] = path.join(srcPath, folder);
		//combinedList[folder] = "./src/components/" + folder + "/";
	}
	return combinedList;
}

/**
 * Creates the copy-webpack-plugin config.
 * We use this to copy all assets from component folders over to dist.
 * Critically, src-built-in folders are overriden by any src folders with the same name.
 * 
 * TODO, define a way for a component's webpack entry to specify whether it does or doesn't need to have assets copied
 */
function createCopyWebpackConfig() {
	// Copy configs and finsemble library
	var config = [
		{
			from: './configs/',
			to: './configs/'
		},
		{
			from: './assets/',
			to: './assets/'
		},
		/* // Enabling this causes the favicon to show up as a background image in localhost:9090
		{
			from: './assets/img/favicon.ico',
			to: './favicon.ico'
		},
		*/
		{
			from: './node_modules/@chartiq/finsemble/core/dist',
			to: path.join(__dirname, "../../finsemble/")
		}
	];

	// Create a copy entry for each folder in our collapsed list
	// ignore node_modules/* and */node_modules/*
	var folders = collapseBuiltInFiles();
	for (let name in folders) {
		config.push({
			from: folders[name],
			to: "./components/" + name,
			ignore: ["node_modules/**/*", "**/*/node_modules/**/*"]
		});
	}
	return config;
}

webpackConfig.plugins.push(new CopyWebpackPlugin(createCopyWebpackConfig()));


module.exports = webpackConfig;