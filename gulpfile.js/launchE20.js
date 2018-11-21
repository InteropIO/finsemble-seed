const logToTerminal = require('./logToTerminal');
const ON_DEATH = require("death")({ debug: false });
const path = require('path');
const { exec } = require("child_process");

module.exports = async manifest => {
    let electronProcess = null;
    process.env.ELECTRON_DEV = true;

    ON_DEATH((signal, err) => {
        if (electronProcess) electronProcess.kill();
    
        exec("taskkill /F /IM electron.* /T", (err, stdout, stderr) => {
            // Only write the error to console if there is one and it is something other than process not found.
            if (err && err !== 'The process "electron.*" not found.') {
                console.error(errorOutColor(err));
            }
    
            if (watchClose) watchClose();
            process.exit();
        });
    });

    let e2oLocation = "node_modules/@chartiq/e2o";
    let electronPath = path.join(".", "/node_modules/electron/dist/electron.exe");
    let command = "set ELECTRON_DEV=true && " + electronPath + " index.js --remote-debugging-port=9090 --manifest " + manifest;
    logToTerminal(command);
    electronProcess = exec(command,
        {
            cwd: e2oLocation
        }, function (err) {
            logToTerminal(err);
            logToTerminal("e2o not installed? Try `npm install`", "red");
        }
    );
    
    electronProcess.stdout.on("data", function (data) {
        console.log(data.toString());
    });

    electronProcess.stderr.on("data", function (data) {
        console.error("stderr:", data.toString());
    });

    electronProcess.on("close", function (code) {
        console.log("child process exited with code " + code);
        process.exit();
    });

    process.on('exit', function () {
        electronProcess.kill();
    });	
};
