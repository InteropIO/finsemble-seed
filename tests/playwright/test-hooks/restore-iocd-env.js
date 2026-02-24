/**
 * To restore the environment after tests, the script copies the original system.json back to binary's folder.
 * It should be paired with override-iocd-env.js, which overrides the system.json before tests.
 *
 * Environment variables:
 *  - BINARY_PATH: path to the desktop.exe, the variable name follows iocd test convention.
 *  - IOCD_LOCAL_DATA_PATH: optional, it defaults to "%localappdata%\interop.io\io.Connect Desktop".
 */
const fs = require("fs");
const path = require("path");

const binaryDir = path.dirname(process.env.BINARY_PATH);
const localDataDir =
	process.env.IOCD_LOCAL_DATA_PATH || path.join(process.env.LOCALAPPDATA, "interop.io", "io.Connect Desktop");
const originalSystemJsonPath = path.join(__dirname, "system.json.orig");

if (!fs.existsSync(binaryDir)) {
	throw new Error(`Binary directory does not exist: ${binaryDir}, make sure BINARY_PATH is set correctly.`);
} else if (!fs.existsSync(localDataDir)) {
	throw new Error(`IOCD directory does not exist: ${localDataDir}, make sure IOCD_LOCAL_DATA_PATH is set correctly.`);
} else if (!fs.existsSync(originalSystemJsonPath)) {
	console.log(`Original system.json does not exist: ${originalSystemJsonPath}, skip restoring.`);
	return;
}

fs.copyFileSync(originalSystemJsonPath, path.join(binaryDir, "config", "system.json"));
fs.rmSync(originalSystemJsonPath);
console.log("Completed restoring the original iocd environment.");
