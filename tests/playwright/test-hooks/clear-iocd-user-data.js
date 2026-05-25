/**
 * For a clean test environment, the script clears cache and user data of the specified env and region.
 *
 * Environment variables:
 *  - IOCD_LOCAL_DATA_PATH: optional, it defaults to "%localappdata%\interop.io\io.Connect Desktop".
 *  - IOCD_TEST_ENV: optional, it defaults to "development".
 *  - IOCD_TEST_REGION: optional, it defaults to "REGION".
 */
const fs = require("fs");
const path = require("path");

const env = process.env.IOCD_TEST_ENV ?? "development";
const region = process.env.IOCD_TEST_REGION ?? "REGION";
const localDataDir =
	process.env.IOCD_LOCAL_DATA_PATH || path.join(process.env.LOCALAPPDATA, "interop.io", "io.Connect Desktop");

if (!fs.existsSync(localDataDir)) {
	throw new Error(`IOCD directory does not exist: ${localDataDir}, make sure IOCD_LOCAL_DATA_PATH is set correctly.`);
}

const cacheDir = path.join(localDataDir, "Cache", `${env}-${region}`);
console.log(`Clearing cache in ${cacheDir}`);
fs.rmSync(cacheDir, { recursive: true, force: true });

const userDataDir = path.join(localDataDir, "UserData", `${env}-${region}`);
console.log(`Clearing user data in ${userDataDir}`);
fs.rmSync(userDataDir, { recursive: true, force: true });
