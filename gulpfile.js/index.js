const chalk = require("chalk");
chalk.enabled = true;
chalk.level = 1; //setting the level to 1 will force color output.

const logToTerminal = require('./logToTerminal');
const fs = require("fs");
const gulp = require("gulp");
const path = require("path");
const extensionsPath = path.join(__dirname, '..', 'gulpfile-extensions');
const extensions = fs.existsSync(`${extensionsPath}.js`) ? require(extensionsPath) : undefined;
const startupConfig = require("../configs/other/server-environment-startup");
const getFlag = require('./getFlag');

const distPath = path.join(__dirname, "dist");
const srcPath = path.join(__dirname, "src");
const Tasks = require('./newTasks');
const tasks = new Tasks();


/**
 * for each key in extensionsObject, check if the value is a function and create a corresponding
 * gulp task. Call the post method upon completion.
 */
const buildGulpTasks = async extensionsObject => {
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
		...tasks.getTaskMethods(),
		distPath,
		srcPath,
		startupConfig,
	};

	const environment = getFlag('--environment') || 'development';
	const port = getFlag('--port');

	if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = environment;
	}
	
	if (!process.env.PORT) {
        process.env.PORT = port || startupConfig[process.env.NODE_ENV].serverPort;
    }

	if (extensions) {
		// This really ought to be returning a new object rather than modifying an existing one.
		extensions(extensionsObject);
	}
	tasks.pre(() => buildGulpTasks(extensionsObject));
})();