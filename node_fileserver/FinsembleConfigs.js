
var Finsemble = require("@chartiq/finsemble/libs/Server");
var path = require('path');

//Adding your local services/components into the project so that the Finsemble core is aware of them.
Finsemble.addServices(require("../configs/services.json"));
Finsemble.addComponents(require("../configs/components.json"));

//Modify this file to adjust what users see when loading the app for the first time.
Finsemble.setDefaultWorkspaces(require("../configs/defaultWorkspaces.json"));

//Soon you will be able to change your default storage
Finsemble.setDefaultStorage("localStorage");


//Gets your hostname/port/etc for your application.
var StartupConfig = require("../configs/startup");


module.exports = function () {
    var env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
    Finsemble.setUUID("Finsemble" + "-" + env);
    var hostname = StartupConfig[env].clientRoute;
    Finsemble.updateBaseUrl(hostname);
    return Finsemble.getConfig();
};