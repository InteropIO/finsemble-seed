const logToTerminal = require('./logToTerminal');
const chalk = require("chalk");
const errorOutColor = chalk.hex("#FF667E");
const path = require("path");
const { spawn } = require("child_process");
const handleMessage = (data, resolve, launchTimestamp) => {
    // data = "serverFailed";
    if (!data || !data.action) {
        console.log("Unproperly formatted message from server:", data);
        return;
    }
    if (data.action === "serverStarted") {
        resolve();
    } else if (data.action === "serverFailed") {
        throw new Error('Failed to start server.');
    } else if (data.action === "timestamp") {
        // The server process can send timestamps back to us. We will output the results here.
        let duration = (data.timestamp - launchTimestamp) / 1000;
        logToTerminal(`${data.milestone} ${duration}s after launch`);
    } else {
        console.log("Unhandled message from server: ", data);
    }
};

const handleStderr = data => {
    const error = errorOutColor(`ERROR: ${data}`);
    console.error(error);
};

module.exports = port => {

    return new Promise((resolve, reject) => {
        const serverPath = path.join(__dirname, "../server", "server.js");
        const launchTimestamp = Date.now();
        const serverProcess = spawn(
            "node",
            [
                serverPath,
                {
                    stdio: "inherit"
                }
            ],
            {
                env: process.env,
                stdio: [
                    process.stdin,
                    process.stdout,
                    "pipe",
                    "ipc"
                ]
            }
        );
        serverProcess.on("message", data => handleMessage(data, resolve, launchTimestamp));
        serverProcess.on("exit", code => {
            logToTerminal(`Server closed: exit code ${code}`, "magenta");
            resolve();
        });
        serverProcess.stderr.on("data", handleStderr);
    });
};
