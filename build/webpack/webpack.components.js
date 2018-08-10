//  config settings
const path = require('path');
const webpack = require("webpack");
const fs = require("fs");
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Set up an actual webpack config object. Start with a default that we've set up, then add our entries
const defaultConfig = require("./defaultWebpackConfig");

class ConfigMaker {
	constructor() {
		this.__homename = path.join(__dirname, "../../");
		// The standard webpack files that we always look in
		// webpack.finsemble-built-in.entries.json - src-built-in components
		// webpack.components.entries.json - components that have been added with finsemble-cli
		this.listOfWebpackEntryFiles = [
			path.join(__dirname, 'webpack.finsemble-built-in.entries.json'),
			path.join(__dirname, 'webpack.components.entries.json')
		];

		this.componentsToBuild = {};
	}

	generatePossibleWebPackEntries(folder) {
		let componentsPath = path.join(this.__homename, folder);
		let items = fs.readdirSync(componentsPath);
		// For each subdirectory in the folder...
		for (let i = 0; i < items.length; i++) {
			// slap finsemble.webpack.json into the list as a possibility webpack entry point
			let possibleWebpackEntry = path.join(componentsPath, items[i] + "/finsemble.webpack.json");
			this.listOfWebpackEntryFiles.push(possibleWebpackEntry);
		}
	}

	createListOfComponentsToBuild() {
		// Compile all of possible files into a single webpack entries object "componentsToBuild"
		// If a file doesn't exist, then no big deal, it becomes a no-op ": {}"
		this.listOfWebpackEntryFiles.forEach(filename => {
			let entries = fs.existsSync(filename) ? require(filename) : {};
			let componentDirectory = path.dirname(filename);
			let subDirectory = componentDirectory.replace(/^.*[\\\/]/, '');

			let additionalComponents = {};
			if (Array.isArray(entries)) {
				// Process arrays (finsemble.webpack.json files) by automatically building the output & entry fields that webpack needs
				entries.forEach(function (assetName) {
					let assetNoSuffix = assetName.replace(/\.[^/.]+$/, ""); // Remove the .js or .jsx extension
					additionalComponents[assetName] = {
						output: "components/" + subDirectory + "/" + assetNoSuffix,
						entry: path.join(componentDirectory, assetName)
					};		
				});		
			} else {
				// Otherwise assume it's already in object format (webpack.components.entries.json)
				additionalComponents = entries;
			}

			this.componentsToBuild = Object.assign(this.componentsToBuild, additionalComponents);
		});		
	}

	makeConfig(params) {
		params = params ? params : {};
		if (!params.includes) params.includes = [];

		let webpackConfig = new defaultConfig();
		webpackConfig.entry = {};

		// Look through the src/components directory for webpack.entries.json files at the top level.
		this.generatePossibleWebPackEntries("src/components");
		// Look through any includes (other repos)
		params.includes.forEach(folder => {
			this.generatePossibleWebPackEntries(folder + "/src/components");
		});


		//console.log("Webpack entry files: components", this.listOfWebpackEntryFiles);
		this.createListOfComponentsToBuild();

		// Convert componentsToBuild into the format that webpack likes
		for (let key in this.componentsToBuild) {
			let component = this.componentsToBuild[key];
			webpackConfig.entry[component.output] = component.entry;
		}

		webpackConfig.plugins.push(new CopyWebpackPlugin(this.createCopyWebpackConfig(params)));
		return webpackConfig;
	}

	/**
	 * Traverses a folder for subfolders. The combinedList will contain only a single entry for each subfolder.
	 * @param {obj} combinedList 
	 * @param {string} folder 
	 */
	processFolder(combinedList, folder) {
		var srcPath = path.join(this.__homename, folder); // path to components
		// Now put all the component folders into our combined list. If there's a dup, then it will override the built in
		var srcItems = fs.readdirSync(srcPath);
		for (let i = 0; i < srcItems.length; i++) {
			let folder = srcItems[i];
			combinedList[folder] = path.join(srcPath, folder);
		}
	}

	/**
	 * This function iterates through src-built-in, src and included repos, building a list of all the directories but eliminating duplicates.
	 * In other words, this allows src/components folders to *override* (replace) folders in src-built-in.
	 */
	collapseSrc(params) {
		var combinedList = {}; // contains the final compressed list

		// First put all the built in items into our combined list
		this.processFolder(combinedList, "src-built-in/components");
		// Then add overrides from current directory
		this.processFolder(combinedList, "src/components");
		// Then add overrides from any include folders
		params.includes.forEach(folder => {
			this.processFolder(combinedList, folder + "/src/components");
		});

		return combinedList;
	}
	

	/**
	 * Creates the copy-webpack-plugin config.
	 * We use this to copy all assets from component folders over to dist.
	 * Critically, src-built-in folders are overriden by any src folders with the same name.
	 * 
	 * TODO, define a way for a component's webpack entry to specify whether it does or doesn't need to have assets copied
	 */
	createCopyWebpackConfig(params) {
		// Copy configs, clients and finsemble library
		var config = [
			{
				from: './src/clients/',
				to: './clients/'
			},
			{
				from: './assets/',
				to: './assets/'
			},
/*			This causes an annoying image to show up in openfin localhost:9090
			{
				from: './assets/img/favicon.ico',
				to: './favicon.ico'
			},*/
			{
				from: './node_modules/@chartiq/finsemble/dist',
				to: path.join(__dirname, "../../finsemble/")
			}
		];

		// Copy relevant folders from includes. Since these are later in the copyplugin array, they will copy over the folders from the src directory.
		// Any duplicated files will come from the include directory, thus overriding the defaults. Any non-duplicated file will just be added in.
		params.includes.forEach(folder => {
			config.push({
				from: path.join(folder, "configs"),
				to: "./configs/",
			});
			config.push({
				from: path.join(folder, "assets"),
				to: "./assets/",
			});
			config.push({
				from: path.join(folder, "src/adapters"),
				to: "./adapters/",
			});
			config.push({
				from: path.join(folder, "src/clients"),
				to: "./clients/",
			});
			config.push({
				from: path.join(folder, "src/services"),
				to: "./services/",
			});
		});
		
		// Create a copy entry for all src files. This also checks src-built-in
		let srcCopy = this.collapseSrc(params);
		for (let name in srcCopy) {
			config.push({
				from: srcCopy[name],
				to: "./components/" + name,
				ignore: ["node_modules/**/*", "**/*/node_modules/**/*"]
			});
		}
		return config;
	}
}

let configMaker = new ConfigMaker();

module.exports = configMaker;


