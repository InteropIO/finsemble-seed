const shell = require("shelljs");
module.exports = commandObjects => {
    commandObjects.forEach(commandObject => {
        // save off starting dir
        const startDir = shell.pwd();
        shell.cd(commandObject.dir);
        logToTerminal(`Executing: ${command}\nin directory: ${commandObject.dir}`);
        const output = shell.exec(command);
        // if an afterExec hook was provided, call it with the output
        commandObject.afterExec ? commandObject.afterExec(output) : undefined;
        // restore starting dir
        shell.cd(startDir);
    });
}