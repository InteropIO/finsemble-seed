const shell = require("shelljs");
/**
 * execute each commandObject provided
 * @param {CommandObject[]}
 * @param {CommandObject.String} commandObject.command
 * @param {CommandObject.String} commandObject.dir
 * @param {CommandObject.function} commandObject.afterExec 
 */
module.exports = commandObjects => {
    commandObjects.forEach(commandObject => {
        // save off starting dir
        const startDir = shell.pwd();
        shell.cd(commandObject.dir);
        logToTerminal(`Executing: ${commandObject.command}\nin directory: ${commandObject.dir}`);
        const output = shell.exec(commandObject.command);
        // if an afterExec hook was provided, call it with the output
        commandObject.afterExec ? commandObject.afterExec(output) : undefined;
        // restore starting dir
        shell.cd(startDir);
    });
}