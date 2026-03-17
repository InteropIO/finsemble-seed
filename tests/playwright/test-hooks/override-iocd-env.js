/**
 * For a clean test environment, the script overrides the system.json (`region` and `env`) located in binary's folder.
 * It should be paired with restore-iocd-env.js, which puts the original system.json back after tests.
 *
 * Environment variables required:
 *  - BINARY_PATH: path to the desktop.exe, the variable name follows iocd test convention.
 *  - IOCD_LOCAL_DATA_PATH: optional, it defaults to "%localappdata%\interop.io\io.Connect Desktop".
 */
const fs = require("fs");
const path = require("path");

const testEnv = "TEST";
const testRegion = "REGION";
const binaryDir = path.dirname(process.env.BINARY_PATH);
const localDataDir =
	process.env.IOCD_LOCAL_DATA_PATH || path.join(process.env.LOCALAPPDATA, "interop.io", "io.Connect Desktop");

if (!fs.existsSync(binaryDir)) {
	throw new Error(`Binary directory does not exist: ${binaryDir}, make sure BINARY_PATH is set correctly.`);
} else if (!fs.existsSync(localDataDir)) {
	throw new Error(`IOCD directory does not exist: ${localDataDir}, make sure IOCD_LOCAL_DATA_PATH is set correctly.`);
}

const cacheDir = path.join(localDataDir, "Cache", `${testEnv}-${testRegion}`);
console.log(`Clearing cache in ${cacheDir}`);
fs.rmSync(cacheDir, { recursive: true, force: true });

const userDataDir = path.join(localDataDir, "UserData", `${testEnv}-${testRegion}`);
console.log(`Clearing user data in ${userDataDir}`);
fs.rmSync(userDataDir, { recursive: true, force: true });

const systemJsonPath = path.join(binaryDir, "config", "system.json");
const systemJson = JSON.parse(fs.readFileSync(systemJsonPath, "utf8"));

if (systemJson.env === testEnv && systemJson.region === testRegion) {
	console.log("system.json already set for test environment, skip overriding.");
} else {
	console.log(`Overriding ${systemJsonPath}`);
	fs.copyFileSync(systemJsonPath, path.join(__dirname, "system.json.orig"));
	fs.writeFileSync(systemJsonPath, JSON.stringify({ ...systemJson, region: testRegion, env: testEnv }, null, 2));
}
console.log("Completed the iocd test environment setup.");
