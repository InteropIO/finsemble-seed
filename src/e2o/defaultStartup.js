// Electron does not yet support "import"
const { app } = require('electron');
const e2o = require("@chartiq/e2o")
//const FinsembleElectronUpdater = require('./src/startup/finsembleElectronUpdater');
const log = require('electron-log');
const superagent = require('superagent');
const fs = require('fs');
const MANIFEST_URL = "http://localhost:3375/configs/openfin/manifest-local.json"
// For some reason I could not find the location of the file when a relative path was used.
// need to look into that
// log.transports.file.file = 'C:\\Users\\Sidd\\AppData\\Roaming\\e2o/log.txt';

// https://docs.microsoft.com/en-us/windows/desktop/shell/appids
// Causes the multiple electron apps/windows to be grouped together under a single windows taskbar icon.
console.log()
app.setAppUserModelId('e2o');

const updater = null;
process.on('uncaughtException', (error) => {
    console.error(error);
    log.error('error', error);
});


app.on('ready', () => {
    log.warn('app ready');
    if (!process.env.ELECTRON_DEV) { // This flag is set when we start from npm. Look at the package.json
        // Only do this if in the installer.  Feed is the server path to check for new files. Look at electron autoupdater for more info.
        // TODO, derive this url from config
        const feed = 'http://localhost:3375/installers';
        // updater =  new FinsembleElectronUpdater(feed);
    }
    getManifest((err, manifest) => {
        if (err) {
            console.error(err);
            return app.exit();
        }
        e2o.e2oApplication(app, manifest);
    });
});



function getManifest(cb) {
    console.log('Retrieving Manifest');
    const options = {};
    for (let j = 0; j < process.argv.length; j++) {
        if (process.argv[j] === '--manifest') options.manifest = process.argv[j + 1];
        console.log(`${j} -> ${process.argv[j]}`);
    }
    let manifestUrl = options.manifest;
    if (!manifestUrl) manifestUrl = MANIFEST_URL;
    console.log('Manifest URL:', manifestUrl);
    getManifestFromUrl(manifestUrl, cb);
}

function getManifestFromUrl(manifestUrl, cb) {
    superagent
        .get(manifestUrl)
        .send()
        .set('accept', 'json')
        .end((err, res) => {
            if (err) {
                console.log('Error fetching manifest ', err);
                return;
            }
            try {
                return cb(null, JSON.parse(res.text));
            } catch (err) {
                console.log('Error starting app ', err.message);
                return cb(err);
            }
        });
}

function getManifestConfig() {
    const configPath = `${process.env.APPDATA}\\e2o\\config`;
    const configFile = `${configPath}\\config.json`;
    log.warn('configFile', configFile);
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    log.warn('config', config);
    return config.manifest;
}
