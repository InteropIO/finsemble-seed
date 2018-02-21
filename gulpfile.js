// #region Imports
// NPM
const chalk = require("chalk");
const { exec, spawn } = require("child_process");
const ON_DEATH = require("death")({ debug: false });
const del = require("del");
const gulp = require("gulp-4.0.build");
const sass = require("gulp-sass");
const watch = require("gulp-watch");
const merge = require("merge-stream");
const launcher = require("openfin-launcher");
const path = require("path");
const webpack = require("webpack-stream");

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
/**
 * Cleans the project folder of generated files.
 */
const clean = () => {
	return del(distPath, { force: true });
}

/** 
 * Copies static files to the output directory.
 */
const copyStaticFiles = () => {
	const source = [
		path.join(srcPath, "components", "**", "*"),
		"!" + path.join(srcPath, "components", "**", "*.jsx")];

	// Don't copy files that we build
	for (const key in componentsToBuild) {
		source.push("!" + path.join(__dirname, componentsToBuild[key].entry));
	}
	
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
}

/** 
 * Builds the SASS files for the project. 
 */
const buildSass = () => {
	return gulp
		.src([path.join(srcPath, "components", "**", "*.scss")])
		.pipe(sass().on("error", sass.logError))
		.pipe(gulp.dest(path.join(distPath, "components")));
}

/** 
 * Builds files using webpack.
 */
const buildWebpack = () => {
	return webpack(webpackFilesConfig);
}

/**
 * Launches the application.
 * 
 * @param {string} env The build environment. 
 */
const launchApplication = env => {
	ON_DEATH((signal, err) => {
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

/** 
 * Watches files for changes to fire off copies and builds.
 */
const watchFiles = () => {
	return merge(
		watch(path.join(srcPath, "components", "assets", "**", "*"), {}, buildSass),
		watch(path.join(srcPath, "**", "*.css"), { ignoreInitial: true })
			.pipe(gulp.dest(distPath)),
		watch(path.join(srcPath, "**", "*.html"), { ignoreInitial: true })
			.pipe(gulp.dest(distPath)));
}
// #endregion

// #region Tasks
gulp.task("clean", clean);

gulp.task("copy", copyStaticFiles);

gulp.task("wp", buildWebpack);

gulp.task("build", gulp.series(
	"clean",
	"copy",
	buildWebpack,
	buildSass
));

gulp.task("devServer", gulp.series(
	"clean",
	"copy",
	buildSass,
	watchFiles,
	done => {
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
				launchApplication("dev");
				done();
			}
		});
		serverExec.on("exit", code => console.log("final exit code is", code));
		// Prints server errors to your terminal.
		serverExec.stderr.on("data", data => {
			console.error(errorOutColor("ERROR:" + data));
		});
	})
);

gulp.task("default", gulp.series("devServer"));

//This command should be tailored to your production environment. You are responsible for moving the built files to your production server, and creating an openfin installer that points to your config.
gulp.task("prod", gulp.series("build"));
// #endregion