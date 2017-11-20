var gulp = require('gulp-4.0.build');
var path = require("path");
var webpack_stream = require('webpack-stream');

var watch = require("gulp-watch");
var del = require('del');
var sass = require('gulp-sass');
var openfinLauncher = require('openfin-launcher');
var configPath = path.join(__dirname, '/configs/finConfig.json');
//new
var StartupConfig = require("./configs/other/server-environment-startup");
const webpack = require('webpack');
var chalk = require('chalk');
chalk.enabled = true;
var serverOutColor = chalk.yellow;
var errorOutColor = chalk.red;
var webpackOutColor = chalk.cyan;
var initialBuildFinished = false;

var componentsToBuild = require('./build/webpack/webpack.files.entries.json');

function buildComponentIgnore() {//Dont copy files that we build
	var componentIgnores = [];
	var components = componentsToBuild;
	for (var key in components) {
		var filename = components[key].entry.split("/").pop();
		componentIgnores.push(path.join('!' + __dirname,  components[key].entry));
	}
	return componentIgnores;
}

function copyStaticComponentsFiles() {
	var source = [path.join(__dirname, '/src/components/**/*'),path.join('!' + __dirname, '/src/components/**/*.jsx')]
	source = source.concat(buildComponentIgnore());
	return gulp.src(source)
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

function copyFinsembleDist() {//Copies the the required Finsemble files into the local directory.
	return gulp.src([path.join(__dirname, '/node_modules/@chartiq/finsemble/dist/**/*')])
		.pipe(gulp.dest(path.join(__dirname, '/finsemble')));

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

function watchSass(done) {
	watch(path.join(__dirname, '/src/components/assets/**/*'), {}, gulp.series(buildSass));
	done();
}

function watchStatic() {
	watch(path.join(__dirname, '/src/**/*.css'), { ignoreInitial: true }).pipe(gulp.dest(path.join(__dirname, '/dist/')));
	return watch(path.join(__dirname, '/src/**/*.html'), { ignoreInitial: true }).pipe(gulp.dest(path.join(__dirname, '/dist/')));
}

function wipedist(done) {
	if (directoryExists(path.join(__dirname, "/dist/"))) {
		wipe(path.join(__dirname, '/dist/'), done);
	} else {
		done();
	}
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
	var webpack_config = require('./build/webpack/webpack.files.js')
	webpack(webpack_config, function (err, stats) {
		done();
	})
}
function webpackServices(done) {
	var webpack_config = require('./build/webpack/webpack.services.js')
	webpack(webpack_config, function (err, stats) {
		done();
	})
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
	copyStaticComponentsFiles,
	copyFinsembleDist
));

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
	buildSass,
	watchSass,
	function (done) {
		watchStatic();
		initialBuildFinished = true;
		var exec = require('child_process').spawn;
		//This runs essentially runs 'PORT=80 node server/server.js'
		var serverPath = path.join(__dirname, '/server/server.js');
		
		// If you specify environment variables to child_process, it overwrites all environment variables, including
		// PATH. So, copy based on our existing env variables.
		var envCopy = process.env;
		envCopy.PORT = StartupConfig.dev.serverPort;
		envCopy.NODE_ENV = 'dev';

		// allows for spaces in paths.
		var serverExec = exec(
			"node",
			["--debug", serverPath, { stdio: "inherit" }],
			{ env: envCopy, stdio: [process.stdin, process.stdout, "pipe", "ipc"] }
		);
		
		serverExec.on("message", function (data) {
			if (data === "serverStarted") {
				launchOpenfin("dev");
				done();
			}
		});
		serverExec.on('exit', code => console.log('final exit code is', code));
		//Prints server errors to your terminal.
		serverExec.stderr.on("data", function (data) {
			console.log(errorOutColor('ERROR:' + data));
		});
	})
);

gulp.task('production', gulp.series(
	'wipeDist',
	'copy',
	webpackComponents,
	webpackServices,
	buildSass,
	function (done) {
		initialBuildFinished = true;
		var exec = require('child_process').spawn;
		//This runs essentially runs 'PORT=80 node server/server.js'
		var serverPath = path.join(__dirname, '/server/server.js');
		//allows for spaces in paths.
		var serverExec = exec('node', ['--debug', serverPath, { stdio: 'inherit' }], { env: { 'PORT': StartupConfig["prod"].serverPort, NODE_ENV: "prod" }, stdio: [process.stdin, process.stdout, 'pipe', "ipc"] });

		serverExec.on("message", function (data) {
			if (data === "serverStarted") {
				launchOpenfin("prod");
				done();
			}
		});
		serverExec.on('exit', code => console.log('final exit code is', code));
		//Prints server errors to your terminal.
		serverExec.stderr.on("data", function (data) {
			console.log(errorOutColor('ERROR:' + data));
		});
	})
);


gulp.task('default', gulp.series('devServer'));
gulp.task('prod', gulp.series('production'));