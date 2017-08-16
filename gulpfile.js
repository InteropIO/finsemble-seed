var gulp = require('gulp-4.0.build');
var path = require("path");
var gulpWebpack = require('webpack-stream-fixed');
var webpack = require("webpack");
var watch = require("gulp-watch");
var del = require('del');
var sass = require('gulp-sass');
var openfinLauncher = require('openfin-launcher');
var configPath = path.join(__dirname, '/configs/finConfig.json');
//new
var StartupConfig = require("./configs/other/server-environment-startup");
var chalk = require('chalk');
chalk.enabled = true;
var serverOutColor = chalk.yellow;
var errorOutColor = chalk.red;
var webpackOutColor = chalk.cyan;
var initialBuildFinished = false;
var shell = require('shelljs');

function copyStaticComponentsFiles() {
	return gulp.src([
		path.join(__dirname, '/src/components/**/*'),
		path.join('!' + __dirname, '/src/components/**/*.jsx')
	])
		.pipe(gulp.dest(path.join(__dirname, '/dist/components/')));
}

function copyStaticFiles() {
	gulp.src([path.join(__dirname, '/configs/**/*')])
		.pipe(gulp.dest(path.join(__dirname, '/dist/configs/')));
	return gulp.src([path.join(__dirname, '/src/services/**/*.html'),
	//ignores the js files in service, but copies over the html files.
	path.join('!' + __dirname, '/src/services/**/*.js')])
		.pipe(gulp.dest(path.join(__dirname, '/dist/services')));
}

function wipeDist(done) {
	var dir = path.join(__dirname, '/dist/');
	console.log('dir', dir);
	wipe(dir, done);
}


function wipe(dir, cb) {
	del(dir, { force: true }).then(function () {
		if (cb) {
			cb();
		}
	}).catch(function (err) {
		console.error(err);
	});
}

function buildSass(done) {
	done();
	return gulp.src([
		path.join(__dirname, '/src/components/**/**/*.scss'),
		//compiles sass down to finsemble.css
		path.join(__dirname, '/src/components/assets/*.scss')
	])
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(path.join(__dirname, '/dist/components/')));
}
/**
 *  Watcher for components. Builds everything whenever a source file changes.
 *  @todo, make it smarter - only rebuild the folder that changed.
 */
function watchReactComponents(done) {
	watch(path.join(__dirname, './src/components/**/*'), { ignoreInitial: true }, gulp.series(
		wipeComponents,
		copyStaticComponentsFiles,
		webpackReactComponents,
		webpackComponents,
		buildSass
	));
	done();
}

/**
 *  Watcher for Clients. Builds everything whenever a source file changes.
 */
function watchClients(done) {
	watch(path.join(__dirname, './src/clients/*'), { ignoreInitial: true }, gulp.series(
		wipeClients,
		webpackClients
	));
	done();
}
function watchSass(done) {
	watch(path.join(__dirname, './src/components/assets/**/*'), {}, gulp.series(buildSass));
	done();
}
/**
 *  Watcher for Clients. Builds everything whenever a source file changes.
 */
function watchServices(done) {
	watch(path.join(__dirname, './src/services/**/*.js'), { ignoreInitial: true }, gulp.series(
		wipeServices,
		copyStaticFiles,
		webpackServices));
	done();
}

/**
 *  Helper function to delete directories.
 */
function wipe(dir, cb) {
	del(dir, { force: true }).then(function () {
		if (cb) {
			cb();
		}
	});
}

/**
 *  Wipes the service dir.
 */
function wipeServices(done) {
	wipe(path.join(__dirname, '/dist/services/'), done);
}

/**
 *  Wipes the clients dir.
 */
function wipeClients(done) {
	wipe(path.join(__dirname, '/dist/clients/'), done);
}
/**
 * Removes everything in dist.
 */
function wipedist(done) {
	if (directoryExists(path.join(__dirname, "/dist/"))) {
		wipe(path.join(__dirname, '/dist/'), done);
	} else {
		done();
	}

}

/**
 *  Wipes the component directory.
 */
function wipeComponents(done) {
	wipe(path.join(__dirname, '/dist/components'), done);
}

function handleWebpackStdOut(data, done) {
	let notAnError = !data.includes('build failed');
	if (notAnError) {
		console.log(webpackOutColor(data));
	}

	if (data.includes('webpack is watching')) {

		if (initialBuildFinished && notAnError) {
			// buildComplete();
		} else if (!initialBuildFinished) {
			done();
		}
	}
}

function webpackComponents(done) {
	const exec = require('child_process').exec;
	const instance = exec('node ./build/child_processes/componentBuildProcess.js');
	instance.stdout.on('data', function (data) {
		handleWebpackStdOut(data, done);
		var filesToBuild = require('./build/webpack/webpack.files.entries.json');
		if (Object.keys(filesToBuild).length === 0) {
			done();
		}
	});
}

function launchOpenfin(env) {
	return openfinLauncher.launchOpenFin({
		//new
		configPath: StartupConfig[env].serverConfig
	});
};

gulp.task('wipeDist', gulp.series(wipeDist));

gulp.task('copy', gulp.series(
	copyStaticFiles,
	copyStaticComponentsFiles
));

function copyNodeModules() {
	return gulp.src([
		path.join(__dirname, '/node_modules/@chartiq/finsemble/dist/**/*')
	])
		.pipe(gulp.dest(path.join(__dirname, '/dist/finsemble/')));
}
gulp.task('wp', gulp.series(webpackComponents))
gulp.task('build', gulp.series(
	'wipeDist',
	'copy',
	// webpackClients,
	// webpackServices,
	webpackComponents,
	// webpackReactComponents,
	buildSass
));

gulp.task('devServer', gulp.series(
	'wipeDist',
	'copy',
	// webpackClients,
	// webpackServices,
	webpackComponents,
	// webpackReactComponents,
	// watchReactComponents,
	// watchClients,
	// watchServices,
	buildSass,
	watchSass,
	copyNodeModules,
	function (done) {
		initialBuildFinished = true;
		var exec = require('child_process').exec;
		//This runs essentially runs 'PORT=80 node server/server.js'
		var serverPath = path.join(__dirname, '/server/server.js');
		//allows for spaces in paths.
		serverPath = '"' + serverPath + '"';
		var serverExec = exec('node ' + serverPath, { env: { 'PORT': StartupConfig["dev"].serverPort, NODE_ENV: "dev" } });
		serverExec.stdout.on("data", function (data) {
			//Prints server output to your terminal.
			console.log("SERVER STDOUT:", data);
			if (data.indexOf("listening on port") > -1) {
				//Once the server is up and running, we launch openfin.
				setTimeout(function () {
					launchOpenfin('dev');
					done();
				}, 2000);
			}
		});
		//Prints server errors to your terminal.
		serverExec.stderr.on("data", function (data) {
			console.log('ERROR:' + data);
		});
	})
);
gulp.task('default', gulp.series('devServer'));
