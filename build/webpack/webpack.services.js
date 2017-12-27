var path = require('path');
var fs = require("fs");
var glob = require("glob");
var glob_entries = require('webpack-glob-entries');


function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function (file) {
		return fs.statSync(path.join(srcpath, file)).isFile();
	});
}

var services = glob_entries(path.join(__dirname, '../../', "/src/services/**/*.js"));

console.log(services);
var entry = {};

for (var key in services) {
	var currentPath = services[key];
	var folder = key.replace("Service", "");
	var newKey = key.replace("Service", "");
	var entryKey = 'services/' + folder + "/" + key;
	entry[entryKey] = [currentPath];
}


if (Object.keys(entry).length === 0) {
	return module.exports = null;//If we don't have services there is no need to create an entry json
};
console.log(entry);
let defaults = require('./defaultWebpackConfig');
let config = new defaults();
config.watch = false;
config.entry = entry;
module.exports = config;