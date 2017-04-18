
var Finsemble = require("@chartiq/finsemble/libs/Server");
Finsemble.addServices(require("../configs/services.json"));
Finsemble.addComponents(require("../configs/components.json"));
Finsemble.setDefaultWorkspaces(require("../configs/defaultWorkspaces.json"));
//new
var StartupConfig = require("../configs/startup");
console.log(StartupConfig);
//new
Finsemble.setCSSOverridesPath('/components/assets/css/finsemble-overrides.css');
Finsemble.setDefaultStorage("localStorage");

console.log(require("../configs/defaultWorkspaces.json"));
module.exports = function () {
    //new
    var env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
    Finsemble.setUUID("ChartIQ" + "-" + env);
    console.log(process.env.NODE_ENV);
    var hostname = StartupConfig[env].clientRoute;
    Finsemble.updateBaseUrl(hostname);
    return Finsemble.getConfig();
};