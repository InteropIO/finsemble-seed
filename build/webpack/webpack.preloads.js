const path = require("path");
const preloadFilesToBuild = require("./webpack.preloads.entries.json");
const { EnvironmentPlugin, ProgressPlugin } = require("webpack");

let entries = {};
for (let key in preloadFilesToBuild) {
    let component = preloadFilesToBuild[key];
    entries[component.output] = component.entry;
}

const defaultWebpackConfig = require('./defaultWebpackConfig');
let config = new defaultWebpackConfig();
config.entry = entries;

module.exports = config