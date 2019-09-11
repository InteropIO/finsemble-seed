const bodyParser = require("body-parser");
const chalk = require('chalk');
const express = require("express");
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const https = require('https');
const compression = require("compression");
const rootDir = path.join(__dirname, "..", "dist");
const moduleDirectory = path.join(__dirname, "..", "finsemble");
const installersDirectory = path.resolve(__dirname, "..", "installers");

const PORT = process.env.PORT || 3375;

const ONE_HOUR = 3600 * 1000;
let cacheAge = ONE_HOUR;
if (["dev", "development"].includes(process.env.NODE_ENV)) cacheAge = 0;

chalk.enabled = true;

const logToTerminal = (msg, color = "white", bgcolor = "bgBlack") => {
    if (!chalk[color]) color = "white";
    if (!chalk[color][bgcolor]) bgcolor = "bgBlack";
    console.log(`[${new Date().toLocaleTimeString()}] ${chalk[color][bgcolor](msg)}.`);
}

const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certs/localhost.chartiq.com.key')),
    cert: fs.readFileSync(path.join(__dirname, 'certs/localhost.chartiq.com.crt')),
    ca: fs.readFileSync(path.join(__dirname, 'certs/intermediate.crt')),
    requestCert: false,
    rejectUnauthorized: false
};


let options = { maxAge: cacheAge };
//This will prevent config files from being cached by the server, allowing an application restart instead of a rebuild when in development.
if (cacheAge === 0) {
    options.setHeaders = function (res, path, stat) {
        res.set("cache-control", "no-cache")
    }
}

module.exports.updateServer = (app, cb) => {
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    const shouldCompress = (req, res) => {
        if (req.originalUrl.toLowerCase().includes("installers")) {
            // don't compress responses from the installers folder
            return false
        }

        // fallback to standard filter function
        return compression.filter(req, res)
    }

    app.use(compression({ filter: shouldCompress }));

    // Sample server root set to "/" -- must align with paths throughout
    app.use("/", express.static(rootDir, options));
    
    // Route for finsemble core library
    app.use("/finsemble", express.static(moduleDirectory, options));
    
    // Route for configs and manifests
    app.use("/configs", express.static("./configs", options));

    app.use("/installers", express.static(installersDirectory, options));

    // Log all requests coming in, for debugging purposes
    app.use("*", (req, res, next) => {
        console.log(req.originalUrl);
        next();
    });


    app.get("/config", function (req, res) {
        // The manifest to serve is determined by the host name of the request. This can be overridden
        // by supplying the manifest name in the query string for the launch shortcut

        // var hostname = req.headers.host;
        // // If behind a proxy, then the hostname will be in the forwarded headers
        // if (req.headers["x-forwarded-host"]) hostname = req.headers["x-forwarded-host"];

        // let manifestName;
        // if (hostname.includes("dev")) {
        //     manifestName = "manifest-dev.json";
        // } else if (hostname.includes("staging")) {
        //     manifestName = "manifest-staging.json";
        // } else if (hostname.includes("finsemble")) {
        //     manifestName = "manifest-production.json";
        // } else {
            manifestName = "manifest-local.json";
        // }
        // if (req.query.manifest) {
        //     manifestName = req.query.manifest;
        // }

        let manifest = require("../configs/openfin/" + manifestName);
        return res.send(manifest);
    });

    /**
     * Handle login requests. We don't do any actual authentication here. Whatever the user's credentials, we pass back the
     * equivalent config. See getUserConfig().
     */
	let upload = multer();//This allows us to pull from a multi part form
    app.post('/login', upload.fields([]), function (req, res, next) {/// This handles the login
        console.log(req.headers.host);
        let credentialsString = "", credentials = {};
        if (typeof req.body === "string") {
            credentialsString = req.body;
        }else if(req.body.credentials) {
            credentialsString = req.body.credentials;
        } else {
            logToTerminal("/login : No credentials received. Invalid body format.");
            return res.status(401).send("No credentials received. Invalid body format.")            
        }
        try {
            credentials = JSON.parse(credentialsString);
        } catch (e) {
            logToTerminal("/login : Invalid credentials received.");
            return res.status(401).send("Invalid credentials received.")            
        }    

        getUserConfig(credentials.username, function (err, config) {
            return res.send({ user: credentials.username, config });
        })
    });
    
    /**
     * Doesn't really do anything.
     */
	app.post('/logout', function (req, res, next) {
		req.logout();
		res.send("success");
	});
    
    /**
     * Get a config for a requested user. For the sake of the sales demo we're not doing any real authentication here.
     * We're assuming the users are all fine. The config is simply take from the /auth/ directory by using the username + ".json".
     * So user "test" will get "test.json". User "frank" would get "frank.json".
     */
    function getUserConfig(user, cb) {
        if (fs.existsSync(path.join(__dirname, "auth", `${user}.json`))) {
            logToTerminal(`Credentials received: ${user}`);
        } else {
            logToTerminal(`User "${user}" not found, defaulting to demo user`);
            user = "demo";
        }

        const config = require(`./auth/${user}.json`);
        
		return cb(null, config);
	}

    var server = https.createServer(sslOptions, app);
    server.listen(PORT, function () {

        // // Symphony server plugin
        // let symphonyServer = require("./symphony/server");
        // symphonyServer({ app });

        // // Salesforce server plugin
        // let salesforceServerSetup = require("./salesforce/server");
        // salesforceServerSetup({ app });

        global.host = server.address().address;
        global.port = server.address().port;
        logToTerminal(`Server serving from ${rootDir} with caching maxAge = ${cacheAge} ms.`);
        cb();
    });
}

module.exports.pre = done => { done(); };
module.exports.post = done => { done(); };
