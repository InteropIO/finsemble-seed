const startupConfig = require("../configs/other/server-environment-startup");

/**
 * Returns the value for the given name, looking in (1) environment variables, (2) command line args
 * and (3) startupConfig. For instance, `set BLAH_BLAH=electron` or `npx gulp dev --blah_blah:electron`
 * This will search for both all caps, all lowercase and camelcase.
 * @param {string} name The name to look for in env variables and args
 * @param {string} defaultValue The default value to return if the name isn't found as an env variable or arg
 */
module.exports = (name, defaultValue) => {
		let lc = name.toLowerCase();
		let uc = name.toUpperCase();
		let cc = name.replace(/(-|_)([a-z])/g, function (g) { return g[1].toUpperCase(); });
 		// Check environment variables
		if (process.env.NODE_ENV[lc]) return process.env.NODE_ENV[lc];
		if (process.env.NODE_ENV[uc]) return process.env.NODE_ENV[uc];
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
			rc = startupConfig[process.env.NODE_ENV][cc] || 
			     startupConfig[process.env.NODE_ENV][lc] || 
			     startupConfig[process.env.NODE_ENV][uc];
		}
		rc = rc || defaultValue;
		return rc;
	}