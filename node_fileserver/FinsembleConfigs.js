
var Finsemble = require("finsemble/libs/Server");
console.log(Finsemble.FinsembleConfigs);
Finsemble.addServices(require("../configs/services.json"))
Finsemble.addComponents(require("../configs/components.json"))
module.exports = function () {
    return Finsemble.FinsembleConfigs
}