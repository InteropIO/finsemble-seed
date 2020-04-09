const { launch, connect } = require('hadouken-js-adapter');

(() => {
	"use strict";

	// #region Imports
	// NPM
	const chalk = require("chalk");
	chalk.enabled = true;
	//setting the level to 1 will force color output.
	chalk.level = 1;
	const async = require("async");
	const { exec, spawn } = require("child_process");
	const ON_DEATH = require("death")({ debug: false });
	const del = require("del");
	const fs = require("fs");
	const gulp = require("gulp");
	const prettyHrtime = require("pretty-hrtime");
	const shell = require("shelljs");
	const path = require("path");
	const webpack = require("webpack");
	const FEA = require("@chartiq/finsemble/fea/exports");
	const FEA_PATH = path.resolve('./node_modules/@chartiq/finsemble/fea');
	const FEAPackager = FEA ? FEA.packager : undefined;
	const MAX_NODE_VERSION = '12.13.1';

	// local
	const extensions = fs.existsSync("./gulpfile-extensions.js") ? require("./gulpfile-extensions.js") : undefined;
	const isMacOrNix = process.platform !== "win32";
	// #endregion

	const logToTerminal = (msg, color = "white", bgcolor = "bgBlack") => {
		if (!chalk[color]) color = "white";
		if (!chalk[color][bgcolor]) bgcolor = "bgBlack";
		console.log(`[${new Date().toLocaleTimeString()}] ${chalk[color][bgcolor](msg)}.`);
	}

	/**
	* Splits a string version with semantic versioning into an object with major, minor and patch versions
	* Valid inputs are 'X.X.X' or 'vX.X.X'
	*/
	const createSemverObject = (version) => {
		let tempVersionArray;
		let semverObject;
		if (typeof version !== 'string') {
			console.log(`Version must be type string but is ${typeof version}`);
			return;
		}
		// Split the version into a temp array.
		if (version.startsWith('v')) {
			tempVersionArray = version.split('v');
			tempVersionArray = tempVersionArray[1].split('.');
		} else {
			tempVersionArray = version.split('.')
		}
		if (tempVersionArray.length === 3) {

			// Convert each array element to a number and store in the object.
			semverObject = {
				majorVersion: Number(tempVersionArray[0]) || null,
				minorVersion: Number(tempVersionArray[1]) || null,
				patchVersion: Number(tempVersionArray[2]) || null,
			}
			// If major, minor or patch versions are missing or not a number return nothing
			if (!semverObject.majorVersion || !semverObject.minorVersion || !semverObject.patchVersion) {
				return;
			}
			return semverObject
		}
	}

	/**
	* Compares two node version objects
	* Each object is expected to contain majorVersion, minorVersion, patchVersion
	*/
	const compareNodeVersions = (a, b) => {
		if (a.majorVersion !== b.majorVersion) {
			return a.majorVersion > b.majorVersion ? 1: -1
		}
		if (a.minorVersion !== b.minorVersion) {
			return a.minorVersion > b.minorVersion ? 1: -1
		}
		if (a.patchVersion !== b.patchVersion) {
			return a.patchVersion > b.patchVersion ? 1: -1
		}
		return 0;
	}

	/**
	* Validates the current node version against supported node versions specified in this file
	* Returns boolean indicating whether current node version is valid
	* Currently only validates against a max node version which must be in the format 'X.X.X' or 'vX.X.X'
	*
	* Note: This method is being used instead of npm engines because of an npm bug where warnings don't print
	* This bug was resolved in npm 6.12.0 but as that is a very new version of npm and is not linked to node 10.15.3
	* in nvm we can't assume our users have access to this version.
	*/
	const isNodeVersionValid = () => {
		// Split the current node version into an object with major, minor and patch numbers for easier comparison.
		// If any of these values are missing, nothing will be returned
		let currentVersionObject = createSemverObject(process.version);
		let maxVersionObject = createSemverObject(MAX_NODE_VERSION);

		// Only allow the check both objects exist and contain major, minor and patch versions.
		if (!currentVersionObject || !maxVersionObject) {
			logToTerminal("Format of node version must be: 'X.X.X', unable to validate node version", "yellow");
			return true;
		}

		// Check if the node version is higher than the maximum allowed node version.
		if (compareNodeVersions(currentVersionObject, maxVersionObject) == 1) return false;
		return true;
	}

	let angularComponents;
	try {
		angularComponents = require("./build/angular-components.json");
	} catch (ex) {
		angularComponents = null;
	}
	// #region Constants
	const startupConfig = require("./configs/other/server-environment-startup");

	//Force colors on terminals.
	const errorOutColor = chalk.hex("#FF667E");

	// #endregion

	// If you specify environment variables to child_process, it overwrites all environment variables, including
	// PATH. So, copy based on our existing env variables.
	const env = process.env;

	if (!env.NODE_ENV) {
		env.NODE_ENV = "development";
	}

	if (!env.PORT) {
		env.PORT = startupConfig[env.NODE_ENV].serverPort;
	}

	// This variable controls whether the build should watch files for changes. This `startsWith` catches all of the
	// tasks that are dev * (dev, dev: fresh, dev: nolaunch), but excludes build:dev because it is intended to only
	// build for a development environment and not watch for changes.
	const isRunningDevTask = process.argv[2].startsWith("dev");

	/**
	 * Returns the value for the given name, looking in (1) environment variables, (2) command line args
	 * and (3) startupConfig. For instance, `set BLAH_BLAH=electron` or `npx gulp dev --blah_blah:electron`
	 * This will search for both all caps, all lowercase and camelcase.
	 * @param {string} name The name to look for in env variables and args
	 * @param {string} defaultValue The default value to return if the name isn't found as an env variable or arg
	 */
	function envOrArg(name, defaultValue) {
		let lc = name.toLowerCase();
		let uc = name.toUpperCase();
		let cc = name.replace(/(-|_)([a-z])/g, function (g) { return g[1].toUpperCase(); });

		// Check environment variables
		if (env[lc]) return env[lc];
		if (env[uc]) return env[uc];

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
			rc = startupConfig[env.NODE_ENV][cc] || startupConfig[env.NODE_ENV][lc] || startupConfig[env.NODE_ENV][uc];
		}
		rc = rc || defaultValue;
		return rc;
	}

	// This is a reference to the server process that is spawned. The server process is located in server/server.js
	// and is an Express server that runs in its own node process (via spawn() command).
	let serverProcess = null;

	let launchTimestamp = 0;

	/**
	 * Mody 10/04/2019
	 * Reads installed Electron's version from FEA repo.
	 * Another option is to export electron's version in
	 * deploymentHelpers in FEA. However I'm just avoiding 2 PRs
	 */
	const getElectronVersion = () => {
		// You may run `npm run dev` before running `npm i` inside
		// finsemble-electron-adapter in that case, the electron
		// module does not exists.
		try {
			const packageFile = require(
				path.join(
					FEA_PATH,
					'node_modules',
					'electron',
					'package.json')
			);
			return packageFile.version;
		} catch (error) {
			logToTerminal(`Failed to get electron's verion from FEA: ${error.message}`, "red");
			return 'unknown';
		}
	};
	/**
	* Returns an object containing the absolute paths of the socket certificate files used to secure Finsemble Transport
	* If both a key and certificate path are not configured nothing is returned.
	*/
	const deriveSocketCertificatePaths = () => {
		const cfg = taskMethods.startupConfig[env.NODE_ENV];
			let socketCertificatePath;
			if (cfg.socketCertificateKey && cfg.socketCertificateCert) {
				socketCertificatePath = {
					key: path.resolve(path.join(__dirname, cfg.socketCertificateKey)),
					cert: path.resolve(path.join(__dirname, cfg.socketCertificateCert))
				}
			}
			return socketCertificatePath;
	}
	// #endregion

	// #region Task Methods
	/**
	 * Object containing all of the methods used by the gulp tasks.
	 */
	const taskMethods = {
		/**
		 * Attach some variables to the taskMethods so that they are available to gulp-extensions.
		 */
		distPath: path.join(__dirname, "dist"),
		srcPath: path.join(__dirname, "src"),
		startupConfig: startupConfig,

		/**
		 * Builds the application in the distribution directory. Internal only, don't use because no environment is set!!!!
		 */
		build: done => {
			async.series([
				taskMethods.buildWebpack,
				taskMethods.buildAngular
			], done);
		},
		buildAngular: done => {
			if (!angularComponents) return done();
			let processRow = row => {
				const compName = row.source.split("/").pop();
				const cwd = path.join(__dirname, row.source);
				const outputPath = path.join(__dirname, row.source, row["output-directory"]);
				const command = `ng build --base-href "/angular-components/${compName}/" --outputPath "${outputPath}"`;

				// switch to components folder
				const dir = shell.pwd();
				shell.cd(cwd);
				logToTerminal(`Executing: ${command}\nin directory: ${cwd}`);

				const output = shell.exec(command);
				logToTerminal(`Built Angular Component, exit code = ${output.code}`, "green");
				shell.cd(dir);
			};

			if (angularComponents) {
				angularComponents.forEach(comp => {
					processRow(comp);
				});
			} else {
				logToTerminal("No Angular components found to build", "yellow");
			}

			done();
		},
		"build:dev": done => {
			async.series([
				taskMethods.setDevEnvironment,
				taskMethods.build
			], done);
		},
		"build:prod": done => {
			async.series([
				taskMethods.setProdEnvironment,
				taskMethods.build
			], done);
		},
		/**
		 * Builds files using webpack.
		 */
		buildWebpack: done => {
			logToTerminal(`Starting webpack. Environment:"${process.env.NODE_ENV}"`)
			//Helper function that builds webpack, logs errors, and notifies user of start/finish of the webpack task.
			function packFiles(config, bundleName, callback) {
				logToTerminal(`Starting to build ${bundleName}`);
				config.watch = isRunningDevTask;
				config.bail = true; // Causes webpack to break upon first encountered error. Pretty annoying when build errors scroll off the screen.
				let startTime = process.hrtime();
				webpack(config, (err, stats) => {
					if (!err) {
						let msg = `Finished building ${bundleName}`;
						//first run, add nice timer.
						if (callback) {
							let end = process.hrtime(startTime);
							msg += ` after ${chalk.magenta(prettyHrtime(end))}`;
						}
						logToTerminal(msg, "cyan");
					} else {
						console.error(errorOutColor("Webpack Error.", err));
					}
					if (stats.hasErrors()) {
						console.error(errorOutColor(stats.toJson().errors));
					}
					// Webpack will call this function every time the bundle is built.
					// Webpack is run in "watch" mode which means this function will be called over and over and over.
					// We only want to invoke the async callback back to the gulp file once - the initial webpack build.
					if (callback) {
						callback();
						callback = undefined;
					}
				});
			}

			//Requires are done in the function because webpack.components.js will error out if there's no vendor-manifest. The first webpack function generates the vendor manifest.
			async.series([
				(cb) => {
					const webpackAdaptersConfig = require("./build/webpack/webpack.adapters");
					packFiles(webpackAdaptersConfig, "adapters bundle", cb);
				},
				(cb) => {
					const webpackVendorConfig = require("./build/webpack/webpack.vendor.js")
					packFiles(webpackVendorConfig, "vendor bundle", cb);
				},
				(cb) => {
					const webpackPreloadsConfig = require("./build/webpack/webpack.preloads.js")
					packFiles(webpackPreloadsConfig, "preload bundle", cb);
				},
				(cb) => {
					const webpackTitleBarConfig = require("./build/webpack/webpack.titleBar.js")
					packFiles(webpackTitleBarConfig, "titlebar bundle", cb);
				},
				(cb) => {
					const webpackServicesConfig = require("./build/webpack/webpack.services.js")
					if (webpackServicesConfig) {
						packFiles(webpackServicesConfig, "services bundle", cb);
					} else {
						cb();
					}
				},
				(cb) => {
					const webpackComponentsConfig = require("./build/webpack/webpack.components.js")
					packFiles(webpackComponentsConfig, "component bundle", cb);
				}
			],
				done
			);
		},

		/**
		 * Cleans the project folder of generated files.
		 */
		clean: done => {
			del(taskMethods.distPath, { force: true });
			del(".babel_cache", { force: true });
			del(path.join(__dirname, "build/webpack/vendor-manifest.json"), { force: true });
			del(".webpack-file-cache", { force: true });
			done();
		},
		checkSymbolicLinks: done => {
			const FINSEMBLE_PATH = path.join(__dirname, "node_modules", "@chartiq", "finsemble");
			const FINSEMBLE_VERSION = require(path.join(FINSEMBLE_PATH, "package.json")).version;
			const CLI_PATH = path.join(__dirname, "node_modules", "@chartiq", "finsemble-cli");
			const CLI_VERSION = require(path.join(CLI_PATH, "package.json")).version;
			const CONTROLS_PATH = path.join(__dirname, "node_modules", "@chartiq", "finsemble-react-controls");
			const CONTROLS_VERSION = require(path.join(CONTROLS_PATH, "package.json")).version;

			// Check version before require so optionalDependency can stay optional
			const FEA_VERSION = require(path.join(FEA_PATH, "package.json")).version;

			function checkLink(params, cb) {
				let { path, name, version } = params;
				if (fs.existsSync(path)) {
					fs.readlink(path, (err, str) => {
						if (str) {
							logToTerminal(`LINK DETECTED: ${name}. @Version ${version} Path: ${str}.`, "yellow");
						} else {
							logToTerminal(`Using: @chartiq/${name} @Version ${version}`, "magenta");
						}
						cb();
					});
				} else {
					logToTerminal(`MISSING FINSEMBLE DEPENDENCY!: ${name}.\nPath: ${path}`, "red");
					process.exit(1);
				}
			};
			async.parallel([
				(cb) => {
					checkLink({
						path: FINSEMBLE_PATH,
						name: "finsemble",
						version: FINSEMBLE_VERSION
					}, cb)
				},
				(cb) => {
					checkLink({
						path: CLI_PATH,
						name: "finsemble-cli",
						version: CLI_VERSION
					}, cb)
				},
				(cb) => {
					checkLink({
						path: CONTROLS_PATH,
						name: "finsemble-react-controls",
						version: CONTROLS_VERSION
					}, cb)
				}
			], done)
		},

		/**
		 * Builds the application, starts the server, launches the Finsemble application and watches for file changes.
		 */
		"dev": done => {
			async.series([
				taskMethods["build:dev"],
				taskMethods.startServer,
				taskMethods.launchApplication
			], done);
		},
		/**
		 * Wipes the babel cache and webpack cache, clears dist, rebuilds the application, and starts the server.
		 */
		"dev:fresh": done => {
			async.series([
				taskMethods.setDevEnvironment,
				taskMethods.rebuild,
				taskMethods.startServer,
				taskMethods.launchApplication
			], done);
		},
		/**
		 * Builds the application and runs the server *without* launching.
		 */
		"dev:noLaunch": done => {
			async.series([
				taskMethods["build:dev"],
				taskMethods.startServer
			], done);
		},
		launchElectron: done => {
			logToTerminal(`Using Electron@${getElectronVersion()}`, "green");

			const cfg = taskMethods.startupConfig[env.NODE_ENV];

			const socketCertificatePath = deriveSocketCertificatePaths();
			let config = {
				manifest: cfg.serverConfig,
				onElectronClose: process.exit,
				chromiumFlags: JSON.stringify(cfg.chromiumFlags),
				path: FEA_PATH,
				socketCertificatePath
			}

			// set breakpointOnStart variable so FEA knows whether to pause initial code execution
			process.env.breakpointOnStart = cfg.breakpointOnStart;

			if (!FEA) {
				console.error("Could not launch ");
				process.exit(1);
			}

			return FEA.e2oLauncher(config, done);
		},
		makeInstaller: async (done) => {
			if (!env.NODE_ENV) throw new Error("NODE_ENV must be set to generate an installer.");
			function resolveRelativePaths(obj, properties, rootPath) {
				properties.forEach(prop => {
					obj[prop] = path.resolve(rootPath, obj[prop]);
				});
				return obj;
			}

			// Inline require because this file is so large, it reduces the amount of scrolling the user has to do.
			let installerConfig = require("./configs/other/installer.json");

			// need absolute paths for certain installer configs
			installerConfig = resolveRelativePaths(installerConfig, ['icon'], './');

			const manifestUrl = taskMethods.startupConfig[env.NODE_ENV].serverConfig;
			let updateUrl = taskMethods.startupConfig[env.NODE_ENV].updateUrl;
			const chromiumFlags = taskMethods.startupConfig[env.NODE_ENV].chromiumFlags;

			// Installer won't work without a proper manifest. Throw a helpful error.
			if (!manifestUrl) {
				throw new Error(`Installer misconfigured. No property in 'serverConfig' in configs/other/server-environment-startup.json under ${env.NODE_ENV}. This is required in order to generate the proper config.`)
			}

			// If an installer is pointing to localhost, it's likely an error. Let the dev know with a helpful error.
			if (manifestUrl.includes("localhost")) {
				logToTerminal(`>>>> WARNING: Installer is pointing to a manifest hosted at ${manifestUrl}. Was this accidental?
				NODE_ENV: ${env.NODE_ENV}`, "yellow");
			}

			// UpdateURL isn't required, but we let them know in case they're expecting it to work.
			if (!updateUrl) {
				logToTerminal(`[Info] Did not find 'updateUrl' in configs/other/server-environment-startup.json under ${env.NODE_ENV}. The application will still work, but it will not update itself with new versions of the finsemble-electron-adapter.`, "white");
				updateUrl = null;
			}

			if (!FEAPackager) {
				console.error("Cannot create installer because Finsemble Electron Adapter is not installed");
				process.exit(1);
			}
			const socketCertificatePath = deriveSocketCertificatePaths();

			FEAPackager.setFeaPath(FEA_PATH);
			await FEAPackager.setApplicationFolderName(installerConfig.name);
			await FEAPackager.setManifestURL(manifestUrl);
			await FEAPackager.setUpdateURL(updateUrl);
			await FEAPackager.setChromiumFlags(chromiumFlags || {});
			await FEAPackager.copySocketCertificates(socketCertificatePath);
			await FEAPackager.createFullInstaller(installerConfig);
			done();
		},
		launchApplication: done => {
			if (!isNodeVersionValid()) {
				logToTerminal(`Node version: ${process.version} is not supported. Max supported version: ${MAX_NODE_VERSION}`, "red");
			}
			logToTerminal("Launching Finsemble", "black", "bgCyan");

			launchTimestamp = Date.now();
			taskMethods.launchElectron(done);
		},
		logToTerminal: (...args) => logToTerminal.apply(this, args),
		envOrArg: (...args) => envOrArg.apply(this, args),
		/**
		 * Starts the server, launches the Finsemble application. Use this for a quick launch, for instance when working on finsemble-electron-adapter.
		 */
		"nobuild:dev": done => {
			async.series([
				taskMethods.setDevEnvironment,
				taskMethods.startServer,
				taskMethods.launchApplication
			], done);
		},

		/**
		 * Method called after tasks are defined.
		 * @param done Callback function used to signal function completion to support asynchronous execution. Can
		 * optionally return an error, if one occurs.
		 */
		post: done => { done(); },

		/**
		 * Method called before tasks are defined.
		 * @param done Callback function used to signal function completion to support asynchronous execution. Can
		 * optionally return an error, if one occurs.
		 */
		pre: done => {
			taskMethods.checkSymbolicLinks();
			done();
		},

		/**
		 * Builds the application, starts the server and launches the application. Use this to test production mode on your local machine.
		 */
		prod: done => {
			async.series([
				taskMethods["build:prod"],
				taskMethods.startServer,
				taskMethods.launchApplication
			], done);
		},
		/**
		 * Builds the application in production mode and starts the server without launching the application.
		 */
		"prod:nolaunch": done => {
			async.series([
				taskMethods["build:prod"],
				taskMethods.startServer
			], done);
		},
		rebuild: done => {
			async.series([
				taskMethods.clean,
				taskMethods.build
			], done);
		},
		/**
		 * Launches the server in dev environment. No build, no application launch.
		 */
		server: done => {
			async.series([
				taskMethods.setDevEnvironment,
				taskMethods.startServer
			], done);
		},
		/**
		 * Launches the server in prod environment. No build, no application launch.
		 */
		"server:prod": done => {
			async.series([
				taskMethods.setProdEnvironment,
				taskMethods.startServer
			], done);
		},
		/**
		 * Starts the server.
		 *
		 * @param {function} done Function called when execution has completed.
		 */
		startServer: done => {
			const serverPath = path.join(__dirname, "server", "server.js");

			serverProcess = spawn(
				"node",
				[
					serverPath,
					{
						stdio: "inherit"
					}
				],
				{
					env: env,
					stdio: [
						process.stdin,
						process.stdout,
						"pipe",
						"ipc"
					]
				}
			);

			serverProcess.on("message", data => {
				if (!data || !data.action) {
					console.log("Unproperly formatted message from server:", data);
					return;
				}
				if (data.action === "serverStarted") {
					done();
				} else if (data.action === "serverFailed") {
					process.exit(1);
				} else if (data.action === "timestamp") {
					// The server process can send timestamps back to us. We will output the results here.
					let duration = (data.timestamp - launchTimestamp) / 1000;
					logToTerminal(`${data.milestone} ${duration}s after launch`);
				} else {
					console.log("Unhandled message from server: ", data);
				}
			});

			serverProcess.on("exit", code => logToTerminal(`Server closed: exit code ${code}`, "magenta"));

			// Prints server errors to your terminal.
			serverProcess.stderr.on("data", data => { console.error(errorOutColor(`ERROR: ${data}`)); });
		},

		setDevEnvironment: done => {
			process.env.NODE_ENV = "development";
			done();
		},

		setProdEnvironment: done => {
			process.env.NODE_ENV = "production";
			done();
		}
	};
	// #endregion

	// Update task methods with extensions
	if (extensions) {
		extensions(taskMethods);
	}

	// #region Task definitions
	const defineTasks = err => {
		if (err) {
			console.error(errorOutColor(err));
			process.exit(1);
		}

		// Convert every taskMethod into a gulp task that can be run
		for (var taskName in taskMethods) {
			var task = taskMethods[taskName];
			if (typeof task === "function") gulp.task(taskName, taskMethods[taskName]);
		}

		// By default run dev
		gulp.task("default", taskMethods["dev"]);

		taskMethods.post(err => {
			if (err) {
				console.error(errorOutColor(err));
				process.exit(1);
			}
		});
	}
	// #endregion

	// Run anything that we need to do before the gulp task is run
	taskMethods.pre(defineTasks);
})();
