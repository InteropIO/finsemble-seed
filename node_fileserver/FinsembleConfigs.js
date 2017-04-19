
var Finsemble = require("@chartiq/finsemble/libs/Server");
var path = require('path');
Finsemble.addServices(require("../configs/services.json"));
Finsemble.addComponents(require("../configs/components.json"));
Finsemble.setDefaultWorkspaces(require("../configs/defaultWorkspaces.json"));
//new
var StartupConfig = require("../configs/startup");
console.log(StartupConfig);
//new
Finsemble.setDefaultStorage("localStorage");
module.exports = function () {
    //new
    var env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
    Finsemble.setUUID("ChartIQ" + "-" + env);
    var hostname = StartupConfig[env].clientRoute;
    Finsemble.updateBaseUrl(hostname);
    return Finsemble.getConfig();
};