// #region Imports
// NPM
const chalk = require("chalk");
const { exec, spawn } = require("child_process");
const ON_DEATH = require("death")({ debug: false });
const del = require("del");
const gulp = require("gulp-4.0.build");
const sass = require("gulp-sass");
const watch = require("gulp-watch");
const openfinLauncher = require("openfin-launcher");
const path = require("path");
const webpack = require("webpack");
const webpack_stream = require("webpack-stream");

// local
const webpackFilesConfig = require("./build/webpack/webpack.files.js")
const webpackServicesConfig = require("./build/webpack/webpack.services.js")
// #endregion

// #region Constants
const componentsToBuild = require("./build/webpack/webpack.files.entries.json");
const StartupConfig = require("./configs/other/server-environment-startup");

chalk.enabled = true;
const serverOutColor = chalk.yellow;
const errorOutColor = chalk.red;
const webpackOutColor = chalk.cyan;
// #endregion

// #region Script variables
let initialBuildFinished = false;
// #endregion

const buildComponentIgnore = () => {
	// Don't copy files that we build
	const componentIgnores = [];
	for (const key in componentsToBuild) {
		componentIgnores.push("!" + path.join( __dirname, componentsToBuild[key].entry));
	}

	return componentIgnores;
}

const copyStaticComponentsFiles = () => {
	let source = [
		path.join(__dirname, "/src/components/**/*"),
		path.join("!" + __dirname, "/src/components/**/*.jsx")];
	
	source = source.concat(buildComponentIgnore());
	return gulp
		.src(source)
		.pipe(gulp.dest(path.join(__dirname, "/dist/components/")));
}

const copyStaticFiles = () => {
	gulp
		.src([path.join(__dirname, "/configs/**/*")])
		.pipe(gulp.dest(path.join(__dirname, "/dist/configs/")));
	// Ignores the js files in service, but copies over the html files.
	return gulp
		.src([
			path.join(__dirname, "/src/services/**/*.html"),
			"!" + path.join(__dirname, "/src/services/**/*.js")])
		.pipe(gulp.dest(path.join(__dirname, "/dist/services")));
}

const copyFinsembleDist = () => {
	// Copies the the required Finsemble files into the local directory.
	return gulp
		.src([path.join(__dirname, "/node_modules/@chartiq/finsemble/dist/**/*")])
		.pipe(gulp.dest(path.join(__dirname, "/finsemble")));
}

const wipeDist = done => {
	const dir = path.join(__dirname, "/dist/");
	console.log("dir", dir);
	wipe(dir, done);
}


const wipe = (dir, cb) => {
	del(dir, { force: true }).then(() => {
		if (cb) {
			cb();
		}
	}).catch(err => {
		console.error(err);
	});
}

const buildSass = () => {
	return gulp.src([
		path.join(__dirname, "/src/components/**/**/*.scss"),
		//compiles sass down to finsemble.css
		path.join(__dirname, "/src/components/assets/*.scss")
	])
		.pipe(sass().on("error", sass.logError))
		.pipe(gulp.dest(path.join(__dirname, "/dist/components/")));
}

const watchSass = done => {
	watch(path.join(__dirname, "/src/components/assets/**/*"), {}, buildSass);
	done();
}

const watchStatic = () => {
	watch(path.join(__dirname, "/src/**/*.css"), { ignoreInitial: true })
		.pipe(gulp.dest(path.join(__dirname, "/dist/")));
	return watch(path.join(__dirname, "/src/**/*.html"), { ignoreInitial: true })
		.pipe(gulp.dest(path.join(__dirname, "/dist/")));
}

const wipedist = done => {
	if (directoryExists(path.join(__dirname, "/dist/"))) {
		wipe(path.join(__dirname, "/dist/"), done);
	} else {
		done();
	}
}

const handleWebpackStdOut = (data, done) => {
	let notAnError = !data.includes("build failed");
	if (notAnError) {
		console.log(webpackOutColor(data));
	}

	if (data.includes("webpack is watching")) {

		if (initialBuildFinished && notAnError) {
			// buildComplete();
		} else if (!initialBuildFinished) {
			done();
		}
	}
}

const webpackComponents = done => {
	webpack(webpackFilesConfig, (err, stats) => {
		done();
	})
}
const webpackServices = done => {
	webpack(webpackServicesConfig, (err, stats) => {
		done();
	})
}

const launchOpenfin = env => {
	const OFF_DEATH = ON_DEATH((signal, err) => {
		exec("taskkill /F /IM openfin.* /T", (err, stdout, stderr) => {
			// Only write the error to console if there is one and it is something other than process not found.
			if (err && err !== 'The process "openfin.*" not found.') {
				console.error(err)
			}

			process.exit();
		});
	});

	return openfinLauncher
		.launchOpenFin({
			configPath: StartupConfig[env].serverConfig
		})
		.then(() => {
			// OpenFin has closed so exit gulpfile
			process.exit();
		});
};

gulp.task("wipeDist", gulp.series(wipeDist));

gulp.task("copy", gulp.series(
	copyStaticFiles,
	copyStaticComponentsFiles,
	copyFinsembleDist
));

gulp.task("wp", gulp.series(webpackComponents))
gulp.task("build", gulp.series(
	"wipeDist",
	"copy",
	// webpackClients,
	// webpackServices,
	webpackComponents,
	// webpackReactComponents,
	buildSass
));

gulp.task("devServer", gulp.series(
	"wipeDist",
	"copy",
	buildSass,
	watchSass,
	done => {
		watchStatic();
		initialBuildFinished = true;

		//This runs essentially runs 'PORT=80 node server/server.js'
		const serverPath = path.join(__dirname, "/server/server.js");

		// If you specify environment variables to child_process, it overwrites all environment variables, including
		// PATH. So, copy based on our existing env variables.
		const envCopy = process.env;
		envCopy.PORT = StartupConfig.dev.serverPort;
		envCopy.NODE_ENV = "dev";

		// allows for spaces in paths.
		const serverExec = spawn(
			"node",
			[serverPath, { stdio: "inherit" }],
			{ env: envCopy, stdio: [process.stdin, process.stdout, "pipe", "ipc"] }
		);

		serverExec.on("message", data => {

			if (data === "serverStarted") {
				launchOpenfin("dev");
				done();
			}
		});
		serverExec.on("exit", code => console.log("final exit code is", code));
		//Prints server errors to your terminal.
		serverExec.stderr.on("data", data => {
			console.error(errorOutColor("ERROR:" + data));
		});
	})
);

gulp.task("default", gulp.series("devServer"));

//This command should be tailored to your production environment. You are responsible for moving the built files to your production server, and creating an openfin installer that points to your config.
gulp.task("prod", gulp.series("build"));
