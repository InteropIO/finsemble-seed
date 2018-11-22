const webpack = require("webpack");
const prettyHrtime = require("pretty-hrtime");
const logToTerminal = require('./gulpfile.js/logToTerminal');
const chalk = require("chalk");
chalk.enabled = true;
//setting the level to 1 will force color output.
chalk.level = 1;
const errorOutColor = chalk.hex("#FF667E");
const configObjects = [
    {
        config: require("./build/webpack/webpack.adapters"),
        name: 'adapters bundle',
    },
    {
        config: require("./build/webpack/webpack.vendor.js"),
        name: 'vendor bundle',
    },
    {
        config: require("./build/webpack/webpack.preloads.js"),
        name: 'preloads bundle',
    },
    {
        config: require("./build/webpack/webpack.titleBar.js"),
        name: 'titleBar bundle',
    },
    {
        config: require("./build/webpack/webpack.services.js"),
        name: 'services bundle',
    },
    {
        config: require("./build/webpack/webpack.components.js"),
        name: 'components bundle',
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

    // Webpack will call this function every time the bundle is built.
    // Webpack is run in "watch" mode which means this function will be called over and over and over.
    // We only want to invoke the async callback back to the gulp file once - the initial webpack build.
    // if (callback) {
    //     callback();
    //     callback = undefined;
    // }
    resolve();
}
/**
 * Builds files using webpack.
 */
module.exports = async () => {
    logToTerminal(`Starting webpack. Environment:"${process.env.NODE_ENV}"`)
    //Helper function that builds webpack, logs errors, and notifies user of start/finish of the webpack task.
    const configReducer = (promise, configObject) => promise.then(() => packFiles(configObject.config, configObject.name));
    await configObjects.reduce(configReducer, Promise.resolve());
};