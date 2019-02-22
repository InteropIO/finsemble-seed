// Electron does not yet support "import"
const { app } = require('electron');
const {e2oApplication} = require("@chartiq/e2o")
//This handles our auto update process
const E2OUpdater = require('./src/startup/E2OUpdater');
const log = require('electron-log');
const superagent = require('superagent');
const MANIFEST_URL = require('../../configs/other/server-environment-startup.json')[env.NODE_ENV || "development"].serverConfig
const FEED_URL = 'http://localhost:3375/installers';
// https://docs.microsoft.com/en-us/windows/desktop/shell/appids
// Causes the multiple electron apps/windows to be grouped together under a single windows taskbar icon.
app.setAppUserModelId('e2o');

let updater = null;
process.on('uncaughtException', (error) => {
	log.warn(error);
	log.error('error', error);
});
// The installer will do some things here. If it needs to, it will return true and quit the app.(updates...)
if (require('./src/startup/setupEvents')(app)) { 
} else {
	//When electron is ready get the manifest and start e2o
	app.on('ready', () => {
		log.warn('app ready');
		// This flag is set when we start from npm. Look at the package.json
		if (!process.env.ELECTRON_DEV) { 
			// Only do this if in the installer.  Feed is the server path to check for new files. Look at electron autoupdater for more info.
			//updater =  new E2OUpdater(FEED_URL);
		}
		getManifest((err, manifest) => {
			if (err) {
				log.warn(err);
				return app.exit();
			}
			e2oApplication(app, manifest);
		});
	});
}

/**
 * This will either get a manifest from command line arguments or use the default url from above
 * @param {Function} cb 
 */
function getManifest(cb) {
	log.warn('Retrieving Manifest');
	const options = {};
	for (let j = 0; j < process.argv.length; j++) {
		if (process.argv[j] === '--manifest') options.manifest = process.argv[j + 1];
		log.warn(`${j} -> ${process.argv[j]}`);
	}
	let manifestUrl = options.manifest;
	if (!manifestUrl)manifestUrl =MANIFEST_URL;
	log.warn('Manifest URL:', manifestUrl);
	getManifestFromUrl(manifestUrl, cb);
}
/**
 * download the manifest from a url
 * @param {*} manifestUrl 
 * @param {*} cb 
 */
function getManifestFromUrl(manifestUrl, cb) {
	superagent
		.get(manifestUrl)
		.send()
		.set('accept', 'json')
		.end((err, res) => {
			if (err) {
				log.warn('Error fetching manifest ', err);
				return;
			}
			try {
				return cb(null, JSON.parse(res.text));
			} catch (err) {
				log.warn('Error starting app ', err.message);
				return cb(err);
			}
		});
}

