(() => {
	"use strict";
	// #region Imports
	// NPM
	const prettyHrtime = require('pretty-hrtime');
	const mergeStream = require("merge-stream");
	const chalk = require("chalk");
	chalk.enabled = true;
	//setting the level to 1 will force color output.
	chalk.level = 1;
	const { exec, spawn } = require("child_process");
	const ON_DEATH = require("death")({ debug: false });
	const del = require("del");
	const fs = require("fs");
	const gulp = require("gulp");
	const sass = require("gulp-sass");
	const watch = require("gulp-watch");
	const newer = require("gulp-newer");
	const shell = require("shelljs");
	const launcher = require("openfin-launcher");
	const path = require("path");
	const webpack = require("webpack");
	// local
	const extensions = fs.existsSync("./gulpfile-extensions.js") ? require("./gulpfile-extensions.js") : undefined;
	const async = require("async");
	// #endregion

	const logToTerminal = (msg, color = "white", bgcolor = "bgBlack") => {
		if (!chalk[color]) color = "white";
		if (!chalk[color][bgcolor]) bg = "black";
		console.log(`[${new Date().toLocaleTimeString()}] ${chalk[color][bgcolor](msg)}.`);
	};

	const staticDirectories = [
		{
			src: ['src/**/*', '!src/**/*.js*', '!src/**/*.scss*'],
			dest: 'components/',
		},
		{
			src: ['src-built-in/components/**/*', '!src-built-in/components/**/*.js*', '!src-built-in/components/**/*.scss*'],
			dest: 'components/'
		},
		{
			src: ['configs/**/*'],
			dest: 'configs/',
		},
		{
			src: ['node_modules/@chartiq/finsemble/dist/**/*'],
			dest: path.join(__dirname, "Finsemble/")
		}
	];
	// #region Constants
	const startupConfig = require("./configs/other/server-environment-startup");
	//Force colors on terminals.
	let angularComponents;
	try {
		angularComponents = require("./build/angular-components.json");
	} catch (ex) {
		logToTerminal("No Angular component configuration found", "yellow");
		angularComponents = null;
	}

	const errorOutColor = chalk.red;
	// #endregion

	// #region Script variables
	let distPath = path.join(__dirname, "dist");
	let srcPath = path.join(__dirname, "src");
	let srcBuiltInPath = path.join(__dirname, "src-built-in");
	let watchClose;
	// If you specify environment variables to child_process, it overwrites all environment variables, including
	// PATH. So, copy based on our existing env variables.
	const env = process.env;

	if (!env.NODE_ENV) {
		env.NODE_ENV = "development";
	}

	if (!env.PORT) {
		env.PORT = startupConfig[env.NODE_ENV].serverPort;
	}

	// #endregion

	// #region Task Methods
	/**
	 * Object containing all of the methods used by the gulp tasks.
	 */
	const taskMethods = {
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

		/**
		 * Builds the SASS files for the project.
		 */
		buildSass: () => {
			const source = [
				path.join(srcPath, "components", "**", "*.scss"),
				path.join(__dirname, "src-built-in", "components", "**", "*.scss"),
			];

			// // Don't build files built by angular
			// if (angularComponents) {
			// 	angularComponents.forEach(comp => {
			// 		source.push(path.join('!' + __dirname, comp.source, '**'));
			// 	});
			// }

			return gulp
				.src(source)
				.pipe(sass().on("error", sass.logError))
				.pipe(gulp.dest(path.join(distPath, "components")));
		},
		/**
		 * Builds files using webpack.
		 */
		buildWebpack: finished => {
			logToTerminal(`Starting webpack. Environment:"${process.env.NODE_ENV}"`)
			//Helper function that builds webpack, logs errors, and notifies user of start/finish of the webpack task.
			function packFiles(config, bundleName, callback) {
				logToTerminal(`Starting to build ${bundleName}`);
				let startTime = process.hrtime();
				webpack(config, (err, stats) => {
					if (!err) {
						let msg = `Finished building ${bundleName}`
						//first run, add nice timer.
						if (callback) {
							let end = process.hrtime(startTime);
							msg += ` after ${chalk.magenta(prettyHrtime(end))}`
						}
						logToTerminal(msg, "cyan");
					} else {
						console.error(errorOutColor("Webpack Error.", err));
					}
					if (stats.hasErrors()) {
						console.error(errorOutColor(stats.toJson().errors));
					}
					//Webpack invokes this function (basically, an onComplete) each time the bundle is built. We only want to invoke the async callback the first time.
					if (callback) {
						callback();
						callback = undefined;
					}
				});
			}
			//Requires are done in the function because webpack.components.js will error out if there's no vendor-manifest. The first webpack function generates the vendor manifest.
			return async.series([
				(done) => {
					const webpackVendorConfig = require("./build/webpack/webpack.vendor.js")
					packFiles(webpackVendorConfig, "vendor bundle", done);
				},
				(done) => {
					async.parallel([
						(cb) => {
							const webpackAdaptersConfig = require("./build/webpack/webpack.adapters");
							packFiles(webpackAdaptersConfig, "Adapters", cb);
						},

						(cb) => {
							const webpackComponentsConfig = require("./build/webpack/webpack.components.js")
							packFiles(webpackComponentsConfig, "components", cb);
						},
						(cb) => {
							const webpackHeaderConfig = require("./build/webpack/webpack.titleBar.js")
							packFiles(webpackHeaderConfig, "window title bar", cb);
						},
						(cb) => {
							const webpackServicesConfig = require("./build/webpack/webpack.services.js")
							if (webpackServicesConfig) {
								packFiles(webpackServicesConfig, "services", cb);
							} else {
								cb();
							}
						}
					], done);
				}
			], finished);
		},
		/**
		 * Cleans the project folder of generated files.
		 */
		clean: (finished) => {
			async.parallel([
				(done) => {
					del(distPath, { force: true }).then(() => done())
				},
				(done) => {
					del("./.babel_cache", { force: true }).then(() => done())
				},
				(done) => {
					del(path.join(__dirname, "build/webpack/vendor-manifest.json"), { force: true }).then(() => done())
				},
				(done) => {
					del("./.webpack-file-cache", { force: true }).then(() => done())
				},
				(done) => {
					del("./Finsemble", { force: true }).then(() => done())
				},
			], () => {
				finished();
			});
		},
		checkSymbolicLinks: done => {
			const FINSEMBLE_PATH = path.join(__dirname, "node_modules", "@chartiq", "finsemble");
			const CLI_PATH = path.join(__dirname, "node_modules", "@chartiq", "finsemble-cli");
			const CONTROLS_PATH = path.join(__dirname, "node_modules", "@chartiq", "finsemble-react-controls");

			function checkLink(params, cb) {
				let { path, name } = params;
				if (fs.existsSync(path)) {
					fs.readlink(path,
						(err, str) => {
							if (str) {
								logToTerminal(`LINK DETECTED: ${name}. Path: ${str}`, "yellow")
							} else {
								logToTerminal(`Using: @chartiq/${name}`, "magenta")
							}
							cb();
					});
				} else {
					logToTerminal(`MISSING FINSEMBLE DEPENDENCY!: ${name}.\nPath: ${path}`, "red")
					process.exit(1);
				}
			};

			async.parallel([
				(cb) => {
					checkLink({
						path: FINSEMBLE_PATH,
						name: "finsemble"
					}, cb)
				},
				(cb) => {
					checkLink({
						path: CLI_PATH,
						name: "finsemble-cli"
					}, cb)
				},
				(cb) => {
					checkLink({
						path: CONTROLS_PATH,
						name: "finsemble-react-controls"
					}, cb)
				},
			], done);
		},
		copyStatic: () => {
			const srcDir = path.join(__dirname)
			let directories = staticDirectories;
			let stream = mergeStream();
			let streams = directories.forEach((config) => {
				let src = config.src.map(src => {
					let pth = path.join(srcDir, src);
					if (pth.includes("!")) {
						pth = "!" + pth.replace(/\!/g, "");
					}
					return pth;
				});

				let dest = config.dest.includes("Finsemble") ? config.dest : path.join(__dirname, "dist", config.dest);
				let thisStream = gulp.src(src)
					.pipe(newer(dest))
					.pipe(gulp.dest(dest));

				stream.add(thisStream);
			});
			return stream;
		},
		/**
		 * Launches the application.
		 *
		 * @param {function} done Function called when method is completed.
		 */
		launchApplication: done => {
			ON_DEATH((signal, err) => {
				exec("taskkill /F /IM openfin.* /T", (err, stdout, stderr) => {
					// Only write the error to console if there is one and it is something other than process not found.
					if (err && err !== 'The process "openfin.*" not found.') {
						console.error(errorOutColor(err));
					}

					if (watchClose) watchClose();
					process.exit();
				});
			});
			logToTerminal("Launching Finsemble", "black", "bgCyan");
			//Wipe old stats.
			fs.writeFileSync(path.join(__dirname, "server", "stats.json"), JSON.stringify({}), "utf-8");

			let startTime = Date.now();
			fs.writeFileSync(path.join(__dirname, "server", "stats.json"), JSON.stringify({ startTime }), "utf-8");
			launcher
				.launchOpenFin({
					configPath: startupConfig[env.NODE_ENV].serverConfig
				})
				.then(() => {
					// OpenFin has closed so exit gulpfile
					logToTerminal("Openfin has closed.", "yellow");
					if (watchClose) watchClose();
					process.exit();
				})
				.catch(e => {
					logToTerminal(`Openfin error:${JSON.stringify(e)}`, "red");
				});

			done();
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
		 * Starts the server.
		 *
		 * @param {function} done Function called when execution has completed.
		 */
		startServer: done => {
			const serverPath = path.join(__dirname, "server", "server.js");

			const serverExec = spawn(
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

			serverExec.on(
				"message",
				data => {
					if (data === "serverStarted") {
						done();
					} else if (data === "serverFailed") {
						process.exit(1);
					}
				});

			serverExec.on("exit", code => logToTerminal(`Server closed: exit code ${code}`, "red"));

			// Prints server errors to your terminal.
			serverExec.stderr.on("data", data => { console.error(errorOutColor(`ERROR: ${data}`)); });
		},
		setDevEnvironment: done => {
			process.env.NODE_ENV = "development";
			done();
		},
		setProdEnvironment: done => {
			process.env.NODE_ENV = "production";
			done();
		},
		/**
		 * Watches files for changes to fire off copies and builds.
		 */
		watchStatic: (done) => {
			const srcDir = path.join(__dirname)
			let directories = staticDirectories;
			directories.forEach((config) => {
				let src = config.src.map(src => {
					let pth = path.join(srcDir, src);
					if (pth.includes("!")) {
						pth = "!" + pth.replace(/\!/g, "");
					}
					return pth;
				});

				let dest = config.dest.includes("Finsemble") ? config.dest : path.join(__dirname, "dist", config.dest);
				logToTerminal(`Watching "${chalk.yellow(src)}" for changes`)
				watch(src, { ignoreInitial: true }, (events, done) => {
					let str = `"${chalk.yellow(events.path)}" changed. Copying to dist`;
					logToTerminal(str);
				})
					.pipe(gulp.dest(dest))
			});
			done();
		},
		/**
		 * Watches sass files and rebuilds/copies to dist.
		 */
		watchSass: (done) => {
			const source = [
				path.join(srcPath, "components", "**", "*.scss"),
				path.join(__dirname, "src-built-in", "components", "**", "*.scss"),
			];
			logToTerminal("Watching sass files for changes");
			watch(source, { ignoreInitial: true }, (events, done) => {
				let str = `"${chalk.yellow(events.path)}" changed. Bulding sass`;
				logToTerminal(str);
				taskMethods.buildSass();
			});
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

		/**
		 * Cleans the project directory.
		 */
		gulp.task("clean", taskMethods.clean);

		/**
		 * Builds the application in the distribution directory. Internal only, don't use because no environment is set!!!!
		 */
		gulp.task(
			"build",
			gulp.series(
				taskMethods.copyStatic,
				taskMethods.buildWebpack,
				taskMethods.buildSass,
				taskMethods.buildAngular
			)
		);

		/**
		 * Wipes the babel cache and webpack cache, clears dist, rebuilds the application.
		 */
		gulp.task("rebuild", gulp.series("clean", "build"));

		/**
		 * Builds the application, starts the server, launches the Finsemble application and watches for file changes.
		 */
		gulp.task("build:dev", gulp.series(taskMethods.setDevEnvironment, "build", taskMethods.watchSass, taskMethods.watchStatic));

		/**
		 * Builds the application, starts the server, launches the Finsemble application and watches for file changes.
		 */
		gulp.task("dev", gulp.series(gulp.parallel("build:dev", taskMethods.startServer), taskMethods.launchApplication));

		/**
		 * Wipes the babel cache and webpack cache, clears dist, rebuilds the application, and starts the server.
		 */
		gulp.task("dev:fresh", gulp.series(gulp.parallel(taskMethods.setDevEnvironment, "rebuild", taskMethods.startServer), taskMethods.watchSass, taskMethods.watchStatic, taskMethods.launchApplication));

		/**
		 * Builds the application and runs the server *without* launching openfin.
		 */
		gulp.task("dev:nolaunch", gulp.series("build:dev", taskMethods.startServer));

		/**
		 * Builds the application in production mode (minimized). It does not start the server or openfin.
		 */
		gulp.task("build:prod", gulp.series(taskMethods.setProdEnvironment, "rebuild"));

		/**
		 * Builds the application, starts the server and launches openfin. Use this to test production mode on your local machine.
		 */
		gulp.task("prod", gulp.series("build:prod", taskMethods.startServer, taskMethods.launchApplication));

		/**
		 * Builds the application in production mode and starts the server without launching openfin.
		 */
		gulp.task("prod:nolaunch", gulp.series("build:prod", taskMethods.startServer));

		/**
		 * Launches the server in dev environment. No build, no openfin launch.
		 */
		gulp.task("server", gulp.series(taskMethods.setDevEnvironment, taskMethods.startServer));

		/**
		 * Launches the server in prod environment. No build, no openfin launch.
		 */
		gulp.task("server:prod", gulp.series(taskMethods.setProdEnvironment, taskMethods.startServer));


		/**
		 * Specifies the default task to run if no task is passed in.
		 */
		gulp.task("default", gulp.series("dev"));

		taskMethods.post(err => {
			if (err) {
				console.error(errorOutColor(err));
				process.exit(1);
			}
		});
	}
	// #endregion

	taskMethods.pre(defineTasks);
})();
