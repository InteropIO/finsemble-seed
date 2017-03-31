
var Finsemble = require("@chartiq/finsemble/libs/Server");
Finsemble.addServices(require("../configs/services.json"));
Finsemble.addComponents(require("../configs/components.json"));
Finsemble.setDefaultWorkspaces(require("../configs/defaultWorkspaces.json"));
console.log(require("../configs/defaultWorkspaces.json"));
module.exports = function () {
    return Finsemble.FinsembleConfigs
}