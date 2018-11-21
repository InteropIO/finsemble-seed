// #region Imports
// NPM
const chalk = require("chalk");
chalk.enabled = true;
//setting the level to 1 will force color output.
chalk.level = 1;
const del = require("del");
const fs = require("fs");
const gulp = require("gulp");
const watch = require("gulp-watch");
const path = require("path");
const buildWebpack = require("../buildWebpack");
const buildAngular = require("../buildAngular");
const buildSass = require("./buildSass");
const verifyLinks = require("./verifyLinks");
const requiredFinsembleLinks = require("./getFinsembleLinks")();
const startServer = require("./startServer");
const extensions = fs.existsSync("./gulpfile-extensions.js") ? require("./gulpfile-extensions.js") : undefined;
const startupConfig = require("../configs/other/server-environment-startup");
const envOrArg = require('./envOrArg');
const launchApplication = require('./launchApplication');

// verifying these links appears to be redundant since require would have failed if they weren't there
// await verifyLinks(requiredFinsembleLinks)
// .catch(err => {
// 	logToTerminal(`MISSING FINSEMBLE DEPENDENCY!: ${err.toString()}`, "red");
// 	process.exit(1);
// });

const clean = () => {
	const distPath = path.join(__dirname, "dist");
	del(distPath, { force: true });
	del(".babel_cache", { force: true });
	del(path.join(__dirname, "build/webpack/vendor-manifest.json"), { force: true });
	del(".webpack-file-cache", { force: true });
};
const build = async environment => {
	process.env.NODE_ENV = environment || 'development';
	await buildWebpack();
	await buildSass();
	await buildAngular();
};
const serve = async () => {
	if (!process.env.PORT) {
        process.env.PORT = startupConfig[process.env.NODE_ENV].serverPort;
    }
	return startServer()
		.catch(err => {
			console.error(err.toString());
			process.exit(1);
		});
};
const launch = async (channelAdapter, manifest) => {
	return launchApplication(channelAdapter, manifest);
};

const applicationConfig = () => {
	let channelAdapter = envOrArg("channel_adapter", "openfin");
	channelAdapter = channelAdapter.toLowerCase();
	if (channelAdapter === "electron") {
		channelAdapter = "e2o";
	}
	const launchTimestamp = Date.now();
	const manifest = startupConfig[process.env.NODE_ENV].serverConfig;
	return {
		launchTimestamp,
		manifest,
		channelAdapter,
	}
};
const buildServeLaunch = async environment => {
	await build(environment);
	await serve();
	const { manifest, channelAdapter } = applicationConfig();
	await launch(channelAdapter, manifest);
	
};
const rebuildServeLaunch = environment => {
	clean();
	return buildServeLaunch(environment);
};
gulp.task('default', () => buildServeLaunch('development'));

gulp.task('build', () => build('development'));

gulp.task('build:dev', () => build('development'));

gulp.task('build:prod', () => build('production'));

gulp.task('clean', clean);

gulp.task('dev', () => buildServeLaunch('development'));

gulp.task('dev:fresh', () => rebuildServeLaunch('development'));

gulp.task('dev:noLaunch', async () => {
	await build('development');
	await serve();
});

gulp.task('prod', async () => {
	await build('production');
	await serve();
	const { manifest, channelAdapter } = applicationConfig();
	await launch(channelAdapter, manifest);
});

gulp.task('prod:nolaunch', async () => {
	await build('production');
	await serve();
});

gulp.task('rebuild', async () => {
	clean();
	await build('development');
})

gulp.task('server', async () => {
	process.env.NODE_ENV = 'development';
	await serve();
});

gulp.task('server:prod', async () => {
	process.env.NODE_ENV = 'production';
	await serve();
});

gulp.task('nobuild:dev', async () => {
	process.env.NODE_ENV = 'development';
	await serve();
	const { manifest, channelAdapter } = applicationConfig();
	await launch(channelAdapter, manifest);
})