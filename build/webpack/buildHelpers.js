const webpack = require("webpack");
const chalk = require("chalk");
const prettyHrtime = require("pretty-hrtime");
chalk.enabled = true;
//setting the level to 1 will force color output.
chalk.level = 1;
const errorOutColor = chalk.hex("#FF667E");
const workerFarm = require('worker-farm');

const logToTerminal = (msg, color = "white", bgcolor = "bgBlack") => {
    if (!chalk[color]) color = "white";
    if (!chalk[color][bgcolor]) bgcolor = "bgBlack";
    console.log(`[${new Date().toLocaleTimeString()}] ${chalk[color][bgcolor](msg)}.`);
}

/**
* Splits a string version with semantic versioning into an object with major, minor and patch versions
* Valid inputs are 'X.X.X' or 'vX.X.X'
*/
const createSemverObject = (version) => {
    let tempVersionArray;
    let semverObject;
    if (typeof version !== 'string') {
        console.log(`Version must be type string but is ${typeof version}`);
        return;
    }
    // Split the version into a temp array.
    if (version.startsWith('v')) {
        tempVersionArray = version.split('v');
        tempVersionArray = tempVersionArray[1].split('.');
    } else {
        tempVersionArray = version.split('.')
    }
    if (tempVersionArray.length === 3) {

        // Convert each array element to a number and store in the object.
        semverObject = {
            majorVersion: Number(tempVersionArray[0]) || null,
            minorVersion: Number(tempVersionArray[1]) || null,
            patchVersion: Number(tempVersionArray[2]) || null,
        }
        // If major, minor or patch versions are missing or not a number return nothing
        if (!semverObject.majorVersion || !semverObject.minorVersion || !semverObject.patchVersion) {
            return;
        }
        return semverObject
    }
}

/**
* Compares two node version objects
* Each object is expected to contain majorVersion, minorVersion, patchVersion
*/
const compareNodeVersions = (a, b) => {
    if (a.majorVersion !== b.majorVersion) {
        return a.majorVersion > b.majorVersion ? 1 : -1
    }
    if (a.minorVersion !== b.minorVersion) {
        return a.minorVersion > b.minorVersion ? 1 : -1
    }
    if (a.patchVersion !== b.patchVersion) {
        return a.patchVersion > b.patchVersion ? 1 : -1
    }
    return 0;
}

/**
* Validates the current node version against supported node versions specified in this file
* Returns boolean indicating whether current node version is valid
* Currently only validates against a max node version which must be in the format 'X.X.X' or 'vX.X.X'
*
* Note: This method is being used instead of npm engines because of an npm bug where warnings don't print
* This bug was resolved in npm 6.12.0 but as that is a very new version of npm and is not linked to node 10.15.3
* in nvm we can't assume our users have access to this version.
*/
const isNodeVersionValid = (MaxNodeVersion) => {
    // Split the current node version into an object with major, minor and patch numbers for easier comparison.
    // If any of these values are missing, nothing will be returned
    let currentVersionObject = createSemverObject(process.version);
    let maxVersionObject = createSemverObject(MaxNodeVersion);

    // Only allow the check both objects exist and contain major, minor and patch versions.
    if (!currentVersionObject || !maxVersionObject) {
        logToTerminal("Format of node version must be: 'X.X.X', unable to validate node version", "yellow");
        return true;
    }

    // Check if the node version is higher than the maximum allowed node version.
    if (compareNodeVersions(currentVersionObject, maxVersionObject) == 1) return false;
    return true;
}

const runWebpackAndCallback = (configPath, watch, bundleName, callback) => {
    const config = require(configPath);
    if (!config) return callback();
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

/**
 * Returns the value for the given name, looking in (1) environment variables, (2) command line args
 * and (3) startupConfig. For instance, `set BLAH_BLAH=electron` or `npx gulp dev --blah_blah:electron`
 * This will search for both all caps, all lowercase and camelcase.
 * @param {string} name The name to look for in env variables and args
 * @param {string} defaultValue The default value to return if the name isn't found as an env variable or arg
 */
const envOrArg = (name, defaultValue) => {
    let lc = name.toLowerCase();
    let uc = name.toUpperCase();
    let cc = name.replace(/(-|_)([a-z])/g, function (g) { return g[1].toUpperCase(); });

    // Check environment variables
    if (env[lc]) return env[lc];
    if (env[uc]) return env[uc];

    // Check command line arguments
    lc = "--" + lc + ":";
    uc = "--" + uc + ":";
    let rc = null;
    process.argv.forEach(arg => {
        if (arg.startsWith(lc)) rc = arg.split(lc)[1];
        if (arg.startsWith(uc)) rc = arg.split(uc)[1];
    });

    // Look in startupConfig
    if (!rc) {
        rc = startupConfig[env.NODE_ENV][cc] || startupConfig[env.NODE_ENV][lc] || startupConfig[env.NODE_ENV][uc];
    }
    rc = rc || defaultValue;
    return rc;
}

const runWebpackInParrallel = (webpackConfigs, done) => {
    let ret = 0;
    const parallelWorkers = workerFarm(require.resolve('./worker.js'))

    webpackConfigs.forEach(config => {
        parallelWorkers(config, (e, output) => {
            if (++ret === webpackConfigs.length) {
                done();
            }
        });
    })
}
module.exports = {
    runWebpackAndCallback,
    logToTerminal,
    isNodeVersionValid,
    compareNodeVersions,
    createSemverObject,
    envOrArg,
    runWebpackInParrallel
}