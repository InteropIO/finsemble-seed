var gulp = require('gulp-4.0.build');
var path = require("path");
var gulpWebpack = require('gulp-webpack');
var webpack = require("webpack");
var del = require('del');
var openfinLauncher = require('openfin-launcher');
var configPath = path.join(__dirname, '/configs/finConfig.json');

function copyStaticFiles() {
	return gulp.src([
		path.join(__dirname, '/src/components/**/*'),
		path.join('!' + __dirname, '/src/components/**/*.jsx')
	])
		.pipe(gulp.dest(path.join(__dirname, '/built/components/')));
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

/**
 *  Watcher for components. Builds everything whenever a source file changes.
 *  @todo, make it smarter - only rebuild the folder that changed.
 */
function watchReactComponents(done) {
	watch('./src/components/**/*', { ignoreInitial: true }, gulp.series(
		wipeComponents,
		copyComponentsTobuilt,
		buildComponents,
		buildSass,
		function (done) {
			buildsInTheQueue.components--;
			buildsInTheQueue.sass--;
			done();
		},
		buildComplete
	));
	done();
}

/**
 *  Watcher for Clients. Builds everything whenever a source file changes.
 */
function watchClients(done) {
	watch('./src/clients/*', { ignoreInitial: true }, gulp.series(
		wipeClients,
		webpackClients,
		webpackServices,
		function (done) {
			buildsInTheQueue.Clients--;
			done();
		},
		buildComplete));
	done();
}

/**
 *  Watcher for Clients. Builds everything whenever a source file changes.
 */
function watchServices(done) {
	watch('./src/services/**/*.js', { ignoreInitial: true }, gulp.series(
		wipeServices,
		copyServicesTobuilt,
		buildServices,
		function (done) {
			buildsInTheQueue.services--;
			done();
		},
		buildComplete));
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
	return gulpWebpack(require('./configs/webpack.clients.config.js'), webpack)
		.pipe(gulp.dest(path.join(__dirname, '/built/clients')));
}
function webpackReactComponents() {
	return gulpWebpack(require('./configs/webpack.react.components.config.js'), webpack)
		.pipe(gulp.dest(path.join(__dirname, '/built/')));
}
function webpackServices() {
	return gulpWebpack(require('./configs/webpack.services.config.js'), webpack)
		.pipe(gulp.dest(path.join(__dirname, '/built/services')));
}

function webpackComponents() {
	return gulpWebpack(require('./configs/webpack.components.config.js'), webpack)
		.pipe(gulp.dest(path.join(__dirname, '/built/components')));
}
function launchOpenfin() {
	return openfinLauncher.launchOpenFin({
		configPath: 'http://localhost:80/config'
	});
};
gulp.task('wipeBuilt', gulp.series(wipeBuilt));


gulp.task('copy', gulp.series(
	copyStaticFiles
));
gulp.task('wp', gulp.series(webpackComponents))
gulp.task('build', gulp.series(
	'wipeBuilt',
	'copy',
	webpackClients,
	webpackServices,
	webpackComponents,
	webpackReactComponents
));

gulp.task('devServer', gulp.series(
	'wipeBuilt',
	'copy',
	webpackClients,
	webpackServices,
	webpackComponents,
	webpackReactComponents,
	function (done) {
		var exec = require('child_process').exec;
		//This runs essentially runs 'PORT=80 node server/server.js'
		var serverExec = exec('node ' + path.join(__dirname, '/node_fileserver/server.js'), { env: { 'PORT': 80, NODE_ENV: "dev" } });
		serverExec.stdout.on("data", function (data) {
			//Prints server output to your terminal.
			console.log("SERVER STDOUT:", data);
			if (data.indexOf("listening on port") > -1) {
				//Once the server is up and running, we launch openfin.
				launchOpenfin();
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
