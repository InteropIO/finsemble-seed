var gulp = require('gulp-4.0.build');
var path = require("path");
var webpack_stream = require('webpack-stream');
var ON_DEATH = require('death')({ debug: false });

var watch = require("gulp-watch");
var del = require('del');
var sass = require('gulp-sass');
var shell = require('shelljs');
var eachRow = require('gulp-each-row');
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

function buildAngularComponentIgnore() {//Dont copy files built by angular
	var componentIgnores = [];
	try {
		var angularComponents = require('./build/angular-components.json');
		var arrayLength = angularComponents.length;
		for (var i=0; i < arrayLength; i++) {
			componentIgnores.push(path.join('!' + __dirname, angularComponents[i].source, '**'));
		}
	} catch (ex) {
		console.log("Error constructing angular component ignores: " + ex.message + "\n" + ex.stack);
	}
	return componentIgnores;
}

function buildComponentIgnore() {//Dont copy files that we build
	var componentIgnores = [];
	var components = componentsToBuild;
	for (var key in components) {
		var filename = components[key].entry.split("/").pop();
		componentIgnores.push(path.join('!' + __dirname, components[key].entry));
	}
	componentIgnores = componentIgnores.concat(buildAngularComponentIgnore());
	return componentIgnores;
}

function copyStaticComponentsFiles() {
	var source = [path.join(__dirname, '/src/components/**/*'), path.join('!' + __dirname, '/src/components/**/*.jsx')]
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
	].concat(buildAngularComponentIgnore()))
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

function angularBuild(done) {
	try {
		var baseCmd = 'ng build --base-href "/components/'

		var process = function (row) {
			var compName = row.source.split("/").pop();
			var cwd = path.join(__dirname, row.source);
			var command = baseCmd + compName + '/" --outputPath "' + path.join(__dirname, row.source, row["output-directory"]) + '"';
			console.log('Executing: ' + command + "\nin directory: " + cwd);

			// switch to components folder
			var dir = shell.pwd();
			shell.cd(cwd);
			var outputNpm = shell.exec("npm install"); // CLI doesn't install NPM modules, mmake sure this happens
			var output = shell.exec(command);
			//console.log('Angular output:', output.stdout);
			//console.log('Angular stderr:', output.stderr);
			console.log('Built Angular Component, exit code = ' + output.code);
			shell.cd(dir);
		};
		
		return gulp
			.src('./build/angular-components.json')
			.pipe(eachRow(process));
	} catch(ex) {
		console.log("Error constructing angular component ignores: " + ex.message + "\n" + ex.stack);
		done();
	}
}

function launchOpenfin(env) {
	const { exec } = require('child_process');
	var OFF_DEATH = ON_DEATH(function (signal, err) {
		exec('taskkill /F /IM openfin.* /T', (err, stdout, stderr) => {
			if (err) {
				console.error(err)
				this.process.exit();
				// node couldn't execute the command
				return;
			}
			this.process.exit();
		});
	})
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
	buildSass,
	angularBuild
));

gulp.task('devServer', gulp.series(
	'wipeDist',
	'copy',
	buildSass,
	angularBuild,
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
			[serverPath, { stdio: "inherit" }],
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
			console.error(errorOutColor('ERROR:' + data));
		});
	})
);

gulp.task('default', gulp.series('devServer'));

//This command should be tailored to your production environment. You are responsible for moving the built files to your production server, and creating an openfin installer that points to your config.
gulp.task('prod', gulp.series('build'));
