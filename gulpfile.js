(() => {
	"use strict";

	// #region Imports
	// NPM
	const chalk = require("chalk");
	const { exec, spawn } = require("child_process");
	const ON_DEATH = require("death")({ debug: false });
	const del = require("del");
	const fs = require("fs");
	const gulp = require("gulp");
	const sass = require("gulp-sass");
	const watch = require("gulp-watch");
	const shell = require("shelljs");
	const merge = require("merge-stream");
	const launcher = require("openfin-launcher");
	const path = require("path");
	const webpack = require("webpack");

	// local
	const extensions = fs.existsSync("./gulpfile-extensions.js") ? require("./gulpfile-extensions.js") : undefined;
	const webpackFilesConfig = require("./build/webpack/webpack.files.js")
	const webpackServicesConfig = require("./build/webpack/webpack.services.js")
	// #endregion

	// #region Constants
	const componentsToBuild = require("./build/webpack/webpack.files.entries");
	const startupConfig = require("./configs/other/server-environment-startup");
	let angularComponents;
	try {
		angularComponents = require("./build/angular-components.json");
	} catch (ex) {
		console.log("No Angular component configuration found");
		angularComponents = null;
	}

	chalk.enabled = true;
	const errorOutColor = chalk.red;
	// #endregion

	// #region Script variables
	let distPath = path.join(__dirname, "dist");
	let srcPath = path.join(__dirname, "src");
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
			let processRow = row => {
				const compName = row.source.split("/").pop();
				const cwd = path.join(__dirname, row.source);
				const outputPath = path.join(__dirname, row.source, row["output-directory"]);
				const command = `ng build --base-href "/angular-components/${compName}/" --outputPath "${outputPath}"`;

				// switch to components folder
				const dir = shell.pwd();
				shell.cd(cwd);
				console.log(`Executing: ${command}\nin directory: ${cwd}`);

				const output = shell.exec(command);
				console.log(`Built Angular Component, exit code = ${output.code}`);
				shell.cd(dir);
			};

			if (angularComponents) {
				angularComponents.forEach(comp => {
					processRow(comp);
				});
			} else {
				console.log("No Angular components found to build");
			}

			done();
		},

		/** 
		 * Builds the SASS files for the project. 
		 */
		buildSass: () => {
			const source = [path.join(srcPath, "components", "**", "*.scss")];

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
		buildWebpack: done => {
			webpack(webpackFilesConfig, () => {
				if (webpackServicesConfig) {
					// Webpack config for services exists. Build it
					webpack(webpackServicesConfig, done);
				} else {
					done();
				}
			});
		},

		/**
		 * Cleans the project folder of generated files.
		 */
		clean: () => {
			return del(distPath, { force: true });
		},

		/** 
		 * Copies static files to the output directory.
		 */
		copyStaticFiles: () => {
			const source = [
				path.join(srcPath, "components", "**", "*"),
				"!" + path.join(srcPath, "components", "**", "*.jsx")];

			// Don't copy files that we build
			for (const key in componentsToBuild) {
				source.push("!" + path.join(__dirname, componentsToBuild[key].entry));
			}

			// // Dont copy files built by angular
			// if (angularComponents) {
			// 	angularComponents.forEach(comp => {
			// 		source.push("!" + path.join(__dirname, comp.source, '**'));
			// 	});
			// }

			return merge(
				gulp
					.src(source)
					.pipe(gulp.dest(path.join(distPath, "components"))),
				gulp
					.src([path.join(__dirname, "configs", "**", "*")])
					.pipe(gulp.dest(path.join(distPath, "configs"))),
				gulp
					.src([
						path.join(srcPath, "services", "**", "*.html"),
						"!" + path.join(srcPath, "services", "**", "*.js")])
					.pipe(gulp.dest(path.join(distPath, "services"))),
				gulp
					.src([path.join(__dirname, "node_modules", "@chartiq", "finsemble", "dist", "**", "*")])
					.pipe(gulp.dest(path.join(__dirname, "finsemble")))
			);
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

			launcher
				.launchOpenFin({
					configPath: startupConfig[env.NODE_ENV].serverConfig
				})
				.then(() => {
					// OpenFin has closed so exit gulpfile
					if (watchClose) watchClose();
					process.exit();
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
		pre: done => { done(); },

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

			serverExec.on("exit", code => console.log(`Server closed: exit code ${code}`));

			// Prints server errors to your terminal.
			serverExec.stderr.on("data", data => { console.error(errorOutColor(`ERROR: ${data}`)); });
		},

		/** 
		 * Watches files for changes to fire off copies and builds.
		 */
		watchFiles: done => {
			watchClose = done;
			return merge(
				watch(path.join(srcPath, "components", "assets", "**", "*"), {}, this.buildSass),
				watch(path.join(srcPath, "**", "*.css"), { ignoreInitial: true })
					.pipe(gulp.dest(distPath)),
				watch(path.join(srcPath, "**", "*.html"), { ignoreInitial: true })
					.pipe(gulp.dest(distPath))
			);
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
			console.error(err);
			process.exit(1);
		}

		/**
		 * Cleans the project directory.
		 */
		gulp.task("clean", taskMethods.clean);

		/**
		 * Builds the application in the distribution directory.
		 */
		gulp.task(
			"build",
			gulp.series(
				"clean",
				taskMethods.copyStaticFiles,
				taskMethods.buildWebpack,
				taskMethods.buildSass,
				taskMethods.buildAngular));

		/**
		 * Builds the application and starts the server to host it.
		 */
		gulp.task("prod", gulp.series("build", taskMethods.startServer));

		/**
		 * Builds the application, starts the server and launches the Finsemble application.
		 */
		gulp.task("prod:run", gulp.series("prod", taskMethods.launchApplication));

		/**
		 * Builds the application, starts the server, launches the Finsemble application and watches for file changes.
		 */
		gulp.task("dev:run", gulp.series("prod:run", taskMethods.watchFiles));

		/**
		 * Specifies the default task to run if no task is passed in.
		 */
		gulp.task("default", gulp.series("dev:run"));

		taskMethods.post(err => {
			if (err) {
				console.error(err);
				process.exit(1);
			}
		});
	}
	// #endregion

	taskMethods.pre(defineTasks);
})();
