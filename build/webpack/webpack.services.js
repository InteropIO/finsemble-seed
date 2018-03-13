var path = require('path');
var fs = require("fs");
var glob = require("glob");
var glob_entries = require('webpack-glob-entries');

//not used?
function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function (file) {
		return fs.statSync(path.join(srcpath, file)).isFile();
	});
}

var services = glob_entries(path.join(__dirname, '../../', "/src/services/**/*.js"));
var clients = glob_entries(path.join(__dirname, '../../', "/src/clients/**/*.js"));
console.log('services', services);
console.log('clients', clients);
var entry = {};

//process service files found
for (var key in services) {
	var currentPath = services[key];
	let splitPath = currentPath.split('/services/');
	var folder = key.replace("Service", "");
	var newKey = key.replace("Service", "");
	//This object builds up an object where every key is the output directory of the file, and the value is the entry file. Typically we want to preserve the path. For services, we default to putting them in their named folder (below).
	var entryKey = 'services/' + splitPath[1];

	if (key.includes('Service')) {
		//for service files, we default to service/SERVICENAME/SERVICENAME
		entryKey = 'services/' + folder + "/" + key;
	}
	entry[entryKey] = [currentPath];
}

//repeat for clients
for (var key in clients) {
	var currentPath = clients[key];
	let splitPath = currentPath.split('/clients/');
	var folder = key.replace("Client", "");
	var newKey = key.replace("Client", "");
	//This object builds up an object where every key is the output directory of the file, and the value is the entry file. Typically we want to preserve the path. For services, we default to putting them in their named folder (below).
	var entryKey = 'clients/' + splitPath[1];

	if (key.includes('Client')) {
		//for client files, we default to client/CLIENTNAME/CLIENTNAME
		entryKey = 'clients/' + folder + "/" + key;
	}
	entry[entryKey] = [currentPath];
}


if (Object.keys(entry).length === 0) {
	return module.exports = null;//If we don't have services there is no need to create an entry json
};
//console.log("entry", entry);
let defaults = require('./defaultWebpackConfig');
let config = new defaults();
config.watch = false;
config.entry = entry;
module.exports = config;