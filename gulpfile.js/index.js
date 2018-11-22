const chalk = require("chalk");
chalk.enabled = true;
chalk.level = 1; //setting the level to 1 will force color output.

const logToTerminal = require('./logToTerminal');
const fs = require("fs");
const gulp = require("gulp");
const path = require("path");
const extensions = fs.existsSync("./gulpfile-extensions.js") ? require("./gulpfile-extensions.js") : undefined;
const startupConfig = require("../configs/other/server-environment-startup");

const distPath = path.join(__dirname, "dist");
const srcPath = path.join(__dirname, "src");
const {
    pre,
    post,
    clean,
    build,
    serve,
    launch,
    applicationConfig,
    buildServe,
    buildServeLaunch,
    rebuildServeLaunch,
    rebuild,
    serveLaunch,
    buildWebpack,
    buildSass,
    buildAngular,
} = require('./tasks');

const taskMethods = {
	'default':       () => buildServeLaunch('development'),
	'build':         () => build('development'),
	'build:dev':     () => build('development'),
	'build:prod':    () => build('production'),
	'dev':           () => buildServeLaunch('development'),
	'dev:fresh':     () => rebuildServeLaunch('development'),
	'dev:noLaunch':  () => buildServe('development'),
	'prod':          () => buildServeLaunch('production'),
	'prod:noLaunch': () => buildServe('production'),
	'rebuild':       () => rebuild('development'),
	'server':        () => serve('development'),
	'server:prod':   () => serve('production'),
	'nobuild:dev':   () => serveLaunch('development'),
	'clean':         () => clean(distPath),
	launchApplication: launch,
	buildSass,
	buildWebpack,
	buildAngular,
	pre,
	post,
	applicationConfig,
	logToTerminal,
};

const createTasks = async extensionsObject => {
	const keys = Object.keys(extensionsObject);
	keys.forEach(key => {
		const value = extensionsObject[key];
		if (typeof value === "function") {
			gulp.task(key, extensionsObject[key]);
		}
	});
	extensionsObject.post();
}
(async () => {
	const extensionsObject = {
		...taskMethods,
		distPath,
		srcPath,
		startupConfig,
	};

	if (extensions) {
		// This really ought to be returning a new object rather than modifying an existing one.
		extensions(extensionsObject);
	}
	extensionsObject.pre(() => createTasks(extensionsObject));
	
})();