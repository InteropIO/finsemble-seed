#!/usr/bin/env node

var webpack = require("webpack");
var gulpWebpack = require('webpack-stream-fixed');
var gulp = require('gulp-4.0.build');
var path = require('path');
var chalk = require('chalk');
function buildFiles() {
	return gulpWebpack(require('../webpack/webpack.files.js'), webpack)
		.on('error', function (err) {
			console.error(chalk.red(err));
			this.emit('end');
		})
		.on('compilation-error', function (err) {
			console.error(chalk.red(err));
		})
		.pipe(gulp.dest(path.join(__dirname, '../../dist/')));
}

buildFiles();