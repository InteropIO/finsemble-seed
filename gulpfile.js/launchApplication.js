const ON_DEATH = require("death")({ debug: false });
const logToTerminal = require('./logToTerminal');
const chalk = require('chalk');
const errorOutColor = chalk.hex("#FF667E");
const launchE20 = require('./launchE20');
const { exec } = require("child_process");
const openfinLauncher = require("openfin-launcher");

const launchOpenFin = manifest => {
    ON_DEATH((signal, err) => {
        exec("taskkill /F /IM openfin.* /T", (err, stdout, stderr) => {
            // Only write the error to console if there is one and it is something other than process not found.
            if (err && err !== 'The process "openfin.*" not found.') {
                console.error(errorOutColor(err));
            }
            process.exit();
        });
    });
    
    openfinLauncher.launchOpenFin({
        configPath: manifest,
    })
    .then(() => {
        process.exit();
    });
};

/**
 * handle launching with different channelAdapters
 */
module.exports = async (channelAdapter, manifest) => {
    logToTerminal("Launching Finsemble", "black", "bgCyan");
    if (channelAdapter === "openfin") {
        launchOpenFin(manifest);
    } else {
        launchE20(manifest);
    }
};