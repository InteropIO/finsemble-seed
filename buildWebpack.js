const webpack = require("webpack");
const prettyHrtime = require("pretty-hrtime");
const logToTerminal = require('./gulpfile.js/logToTerminal');
const chalk = require("chalk");
chalk.enabled = true;
//setting the level to 1 will force color output.
chalk.level = 1;
const errorOutColor = chalk.hex("#FF667E");
const configFunctions = [
    () => {
        return {
            config: require("./build/webpack/webpack.adapters"),
            name: 'adapters bundle',
        }
    },
    () => {
        return {
            config: require("./build/webpack/webpack.vendor.js"),
            name: 'vendor bundle',
        }
    },
    () => {
        return {
            config: require("./build/webpack/webpack.preloads.js"),
            name: 'preloads bundle',
        }
    },
    () => {
        return {
            config: require("./build/webpack/webpack.titleBar.js"),
            name: 'titleBar bundle',
        }
    },
    () => {
        return {
            config: require("./build/webpack/webpack.services.js"),
            name: 'services bundle',
        }
    },
    () => {
        return {
            config: require("./build/webpack/webpack.components.js"),
            name: 'components bundle',
        }
    },
];

const packFiles = async (config, bundleName) => {
    const isRunningDevTask = process.argv[2].startsWith("dev");
    if (!config) {
        return;
    }
    const startTime = process.hrtime();
    config.watch = isRunningDevTask;
    config.bail = true; // Causes webpack to break upon first encountered error. Pretty annoying when build errors scroll off the screen.
    logToTerminal(`Starting to build ${bundleName}.`);
    await new Promise((resolve, reject) => {
        webpack(config, (err, stats) => checkWebpack(err, stats, resolve, reject));
    });
    const endTime = process.hrtime(startTime);
    const prettyTime = chalk.magenta(prettyHrtime(endTime));
    logToTerminal(`Finished building ${bundleName} after ${prettyTime}.`, "cyan");
}
/**
 * Helper function that builds webpack, logs errors, and notifies user of start/finish of the webpack task.
 */
const checkWebpack = (err, stats, resolve, reject) => {
    if (err) {
        const error = errorOutColor("Webpack Error.", err);
        console.error(error);
        return reject(error);
    }
    if (stats.hasErrors()) {
        const error = errorOutColor(stats.toJson().error);
        console.error(error);
        return reject(error);
    }
    resolve();
}
/**
 * Builds files using webpack.
 */
module.exports = async () => {
    logToTerminal(`Starting webpack. Environment:"${process.env.NODE_ENV}"`)
    const configReducer = (promise, configFunction) => promise.then(() => packFiles(configFunction().config, configFunction().name));
    await configFunctions.reduce(configReducer, Promise.resolve());
};