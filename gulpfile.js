// #region Imports
// NPM
const chalk = require("chalk");
const { exec, spawn } = require("child_process");
const ON_DEATH = require("death")({ debug: false });
const del = require("del");
const gulp = require("gulp-4.0.build");
const sass = require("gulp-sass");
const watch = require("gulp-watch");
const launcher = require("openfin-launcher");
const path = require("path");
const webpack = require("webpack");
const webpack_stream = require("webpack-stream");

// local
const webpackFilesConfig = require("./build/webpack/webpack.files.js")
const webpackServicesConfig = require("./build/webpack/webpack.services.js")
// #endregion

// #region Constants
const componentsToBuild = require("./build/webpack/webpack.files.entries");
const startupConfig = require("./configs/other/server-environment-startup");

chalk.enabled = true;
const errorOutColor = chalk.red;
// #endregion

// #region Script variables
let distPath = path.join(__dirname, "dist");
let srcPath = path.join(__dirname, "src");

let initialBuildFinished = false;
// #endregion

// #region Functions
const buildComponentIgnore = () => {
	// Don't copy files that we build
	const componentIgnores = [];
	for (const key in componentsToBuild) {
		componentIgnores.push("!" + path.join(__dirname, componentsToBuild[key].entry));
	}

	return componentIgnores;
}

const copyStaticComponentsFiles = () => {
	let source = [
		path.join(srcPath, "components", "**", "*"),
		"!" + path.join(srcPath, "components", "**", "*.jsx")];

	source = source.concat(buildComponentIgnore());
	return gulp
		.src(source)
		.pipe(gulp.dest(path.join(distPath, "components")));
}

const copyStaticFiles = () => {
	gulp
		.src([path.join(__dirname, "configs", "**", "*")])
		.pipe(gulp.dest(path.join(distPath, "configs")));
	// Ignores the js files in service, but copies over the html files.
	return gulp
		.src([
			path.join(srcPath, "services", "**", "*.html"),
			"!" + path.join(srcPath, "services", "**", "*.js")])
		.pipe(gulp.dest(path.join(distPath, "services")));
}

const copyFinsembleDist = () => {
	// Copies the the required Finsemble files into the local directory.
	return gulp
		.src([path.join(__dirname, "node_modules", "@chartiq", "finsemble", "dist", "**", "*")])
		.pipe(gulp.dest(path.join(__dirname, "finsemble")));
}

const wipeDist = done => {
	wipe(distPath, done);
}

const wipe = (dir, cb) => {
	del(dir, { force: true }).then(() => {
		if (cb) {
			cb();
		}
	}).catch(err => {
		console.error(errorOutColor(err));
	});
}

const buildSass = () => {
	return gulp.src([
		path.join(srcPath, "components", "**", "*.scss")
	])
		.pipe(sass().on("error", sass.logError))
		.pipe(gulp.dest(path.join(distPath, "components")));
}

const watchSass = done => {
	watch(path.join(srcPath, "components", "assets", "**", "*"), {}, buildSass);
	done();
}

const watchStatic = () => {
	watch(path.join(srcPath, "**", "*.css"), { ignoreInitial: true })
		.pipe(gulp.dest(distPath));
	return watch(path.join(srcPath, "**", "*.html"), { ignoreInitial: true })
		.pipe(gulp.dest(distPath));
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
				console.error(errorOutColor(err));
			}

			process.exit();
		});
	});

	return launcher
		.launchOpenFin({
			configPath: startupConfig[env].serverConfig
		})
		.then(() => {
			// OpenFin has closed so exit gulpfile
			process.exit();
		});
};
// #endregion

// #region Tasks
gulp.task("wipeDist", gulp.series(wipeDist));

gulp.task("copy", gulp.series(
	copyStaticFiles,
	copyStaticComponentsFiles,
	copyFinsembleDist
));

gulp.task("wp", gulp.series(webpackComponents));

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
		envCopy.PORT = startupConfig.dev.serverPort;
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
// #endregion