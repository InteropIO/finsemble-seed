
var Finsemble = require("@chartiq/finsemble/libs/Server");

// can optionally write and invoke server-side functions to modify config
// Examples:
//      Finsemble.setDefaultStorage("localStorage");
//      Finsemble.setDevMode(false);
//      Finsemble.setLogLevel(1);//Set the debug level

module.exports = function () {
    // currently only the static openfin manifest with finsembe config is returned here
    return Finsemble.getConfig();
};