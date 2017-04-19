var gulp = require('gulp-4.0.build');
var path = require("path");
var gulpWebpack = require('gulp-webpack');
var webpack = require("webpack");
var watch = require("gulp-watch");
var del = require('del');
var sass = require('gulp-sass');
var openfinLauncher = require('openfin-launcher');
var configPath = path.join(__dirname, '/configs/finConfig.json');
//new
var StartupConfig = require("./configs/startup");

function copyStaticComponentsFiles() {
	return gulp.src([
		path.join(__dirname, '/src/components/**/*'),
		path.join('!' + __dirname, '/src/components/**/*.jsx')
	])
		.pipe(gulp.dest(path.join(__dirname, '/built/components/')));
}

function copyStaticFiles() {
	return gulp.src([path.join(__dirname, '/src/services/**/*.html'),
	//ignores the js files in service, but copies over the html files.
	path.join('!' + __dirname, '/src/services/**/*.js')])
		.pipe(gulp.dest(path.join(__dirname, '/built/services')));
}


function wipeBuilt(done) {
	var dir = path.join(__dirname, '/built/');
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
	//soon
	// return gulp.src([
	// 	path.join(__dirname, '/src/components/**/**/*.scss'),
	// 	//compiles sass down to finsemble.css
	// 	path.join(__dirname, '/src/components/assets/*.scss')
	// ])
	// 	.pipe(sass().on('error', sass.logError))
	// 	.pipe(gulp.dest(path.join(__dirname, '/built/components/')));
}
/**
 *  Watcher for components. Builds everything whenever a source file changes.
 *  @todo, make it smarter - only rebuild the folder that changed.
 */
function watchReactComponents(done) {
	watch(path.join(__dirname,'./src/components/**/*'), { ignoreInitial: true }, gulp.series(
		wipeComponents,
		copyStaticComponentsFiles,
		webpackReactComponents,
		webpackComponents
	));
	done();
}

/**
 *  Watcher for Clients. Builds everything whenever a source file changes.
 */
function watchClients(done) {
	watch(path.join(__dirname,'./src/clients/*'), { ignoreInitial: true }, gulp.series(
		wipeClients,
		webpackClients
		));
	done();
}

/**
 *  Watcher for Clients. Builds everything whenever a source file changes.
 */
function watchServices(done) {
	watch(path.join(__dirname,'./src/services/**/*.js'), { ignoreInitial: true }, gulp.series(
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
	wipe(path.join(__dirname, '/built/services/'), done);
}

/**
 *  Wipes the clients dir.
 */
function wipeClients(done) {
	wipe(path.join(__dirname, '/built/clients/'), done);
}
/**
 * Removes everything in built.
 */
function wipebuilt(done) {
	if (directoryExists(path.join(__dirname, "/built/"))) {
		wipe(path.join(__dirname, '/built/'), done);
	} else {
		done();
	}

}

/**
 *  Wipes the component directory.
 */
function wipeComponents(done) {
	wipe(path.join(__dirname, '/built/components'), done);
}

function webpackClients() {
	return gulpWebpack(require(path.join(__dirname, './configs/webpack.clients.config.js')), webpack)
		.pipe(gulp.dest(path.join(__dirname, '/built/')));
}
function webpackReactComponents() {
	return gulpWebpack(require(path.join(__dirname,'./configs/webpack.react.components.config.js')), webpack)
		.pipe(gulp.dest(path.join(__dirname, '/built/')));
}
function webpackServices() {
	return gulpWebpack(require(path.join(__dirname,'./configs/webpack.services.config.js')), webpack)
		.pipe(gulp.dest(path.join(__dirname, '/built/services')));
}

function webpackComponents() {
	return gulpWebpack(require(path.join(__dirname,'./configs/webpack.components.config.js')), webpack)
		.pipe(gulp.dest(path.join(__dirname, '/built/components')));
}
function launchOpenfin(env) {
	return openfinLauncher.launchOpenFin({
		//new
		configPath: StartupConfig[env].serverConfig
	});
};
gulp.task('wipeBuilt', gulp.series(wipeBuilt));


gulp.task('copy', gulp.series(
	copyStaticFiles,
	copyStaticComponentsFiles
));
gulp.task('wp', gulp.series(webpackComponents))
gulp.task('build', gulp.series(
	'wipeBuilt',
	'copy',
	webpackClients,
	webpackServices,
	webpackComponents,
	webpackReactComponents,
	buildSass
));

gulp.task('devServer', gulp.series(
	'wipeBuilt',
	'copy',
	webpackClients,
	webpackServices,
	webpackComponents,
	webpackReactComponents,
	watchReactComponents,
	watchClients,
	watchServices,
	buildSass,
	function (done) {
		var exec = require('child_process').exec;
		//This runs essentially runs 'PORT=80 node server/server.js'
		var serverPath = path.join(__dirname, '/node_fileserver/server.js');
		//allows for spaces in paths.
		serverPath = '"' + serverPath + '"';
		var serverExec = exec('node ' + serverPath, { env: { 'PORT': StartupConfig["dev"].serverPort, NODE_ENV: "dev" } });
		serverExec.stdout.on("data", function (data) {
			//Prints server output to your terminal.
			console.log("SERVER STDOUT:", data);
			if (data.indexOf("listening on port") > -1) {
				//Once the server is up and running, we launch openfin.
				launchOpenfin('dev');
				done();
			}
		});
		//Prints server errors to your terminal.
		serverExec.stderr.on("data", function (data) {
			console.log('ERROR:' + data);
		});
	})
);
gulp.task('default', gulp.series('devServer'));
