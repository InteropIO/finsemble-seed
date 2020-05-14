const webpack = require("webpack");
const chalk = require("chalk");
const prettyHrtime = require("pretty-hrtime");
chalk.enabled = true;
//setting the level to 1 will force color output.
chalk.level = 1;
const logToTerminal = (msg, color = "white", bgcolor = "bgBlack") => {
    if (!chalk[color]) color = "white";
    if (!chalk[color][bgcolor]) bgcolor = "bgBlack";
    console.log(`[${new Date().toLocaleTimeString()}] ${chalk[color][bgcolor](msg)}.`);
}

module.exports = function packFiles(config, callback) {
    function packFiles(configPath, watch, bundleName, callback) {
        const config = require(configPath);
        if(!config) return callback();
        logToTerminal(`Starting to build ${bundleName}`);
        config.watch = watch;
        config.bail = true; // Causes webpack to break upon first encountered error. Pretty annoying when build errors scroll off the screen.
        let startTime = process.hrtime();
        webpack(config, (err, stats) => {
            if (!err) {
                let msg = `Finished building ${bundleName}`;
                //first run, add nice timer.
                if (callback) {
                    let end = process.hrtime(startTime);
                    msg += ` after ${chalk.magenta(prettyHrtime(end))}`;
                }
                logToTerminal(msg, "cyan");
            } else {
                console.error(errorOutColor("Webpack Error.", err));
            }
            if (stats.hasErrors()) {
                console.error(errorOutColor(stats.toJson().errors));
            }
            // Webpack will call this function every time the bundle is built.
            // Webpack is run in "watch" mode which means this function will be called over and over and over.
            // We only want to invoke the async callback back to the gulp file once - the initial webpack build.
            if (callback) {
                callback();
                callback = undefined;
            }
        });
    }

    packFiles(config.config, config.watch, config.prettyName, callback);
}