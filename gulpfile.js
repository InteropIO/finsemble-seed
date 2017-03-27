var gulp = require('gulp-4.0.build');
var path = require("path");
var gulpWebpack = require('gulp-webpack');
var webpack = require("webpack");
var del = require('del');
var openfinLauncher = require('openfin-launcher');
var configPath = path.join(__dirname, '/configs/finConfig.json');

function copyStaticFiles() {
	return gulp.src([
				path.join(__dirname, '/src/**/*'),
				path.join('!' + __dirname, '/src/**/*.js')
			])	
			.pipe(gulp.dest(path.join(__dirname, '/built/')));
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
function webpackClients() {
	return gulpWebpack(require('./configs/webpack.clients.config.js'), webpack)
		.pipe(gulp.dest(path.join(__dirname, '/built/clients')));
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
		configPath: configPath
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
	webpackComponents
));

gulp.task('devServer', gulp.series(
	'wipeBuilt',
	'copy',
	webpackClients,
	webpackServices,
	webpackComponents,
	function (done) {				
		var exec = require('child_process').exec;
		//This runs essentially runs 'PORT=80 node server/server.js'
		var serverExec = exec('node ' + path.join(__dirname, '/server/server.js'), { env: { 'PORT': 80, NODE_ENV: "dev" } });
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
