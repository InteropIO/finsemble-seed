const chalk = require("chalk");
chalk.enabled = true;
//setting the level to 1 will force color output.
chalk.level = 1;
module.exports = (msg, color = "white", bgcolor = "bgBlack") => {
    if (!chalk[color]) color = "white";
    if (!chalk[color][bgcolor]) bgcolor = "bgBlack";
    console.log(`[${new Date().toLocaleTimeString()}] ${chalk[color][bgcolor](msg)}.`);
}