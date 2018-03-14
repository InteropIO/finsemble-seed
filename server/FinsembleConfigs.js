
var Finsemble = require("@chartiq/finsemble/libs/Server");
var path = require('path');
var urlJoin = require('url-join');
// //Gets your hostname/port/etc for your application.
var StartupConfig = require("../configs/startup");
var env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
Finsemble.setUUID("Finsemble" + "-" + env);
var hostname = StartupConfig[env].clientRoute;

//Soon you will be able to change your default storage
Finsemble.setDefaultStorage("localStorage");


Finsemble.updateBaseUrl(hostname);
//Turns everything red
//Finsemble.setCSSOverridesPath(path.join(StartupConfig[env].clientRoute,'/dist/components/assets/css/finsemble-overrides.css'));


module.exports = function (req, res) {
	var manifest = Finsemble.getConfig();
	var generalConfig = require(path.join(__dirname, '../configs/application/config.json'));
	//Append the application's baseURL to the hosted files. Once the seed has full access to the openfin manifest, this will be unnecessary.
	if (generalConfig.betaFeatures &&
		generalConfig.betaFeatures.assimilation &&
		generalConfig.betaFeatures.assimilation.appAssets) {
		let assets = generalConfig.betaFeatures.assimilation.appAssets;
		for (let i = 0; i < assets.length; i++) {
			var asset = assets[i];
			asset.src = asset.src.includes('http') ? asset.src : urlJoin(manifest.finsemble.baseUrl, asset.src);
		}
		manifest.appAssets = assets;
	}
	return manifest;// returns the manifest file (e.g. desktop-local.json) with optional server-side changes in this module before returning the manifest
};