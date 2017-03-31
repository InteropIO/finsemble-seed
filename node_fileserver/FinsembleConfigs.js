
var Finsemble = require("finsemble/libs/Server");
console.log(Finsemble.FinsembleConfigs);
console.log("KEYS", Object.keys(Finsemble));
Finsemble.addServices(require("../configs/services.json"))
Finsemble.addComponents(require("../configs/components.json"))
module.exports = function () {
    return Finsemble.FinsembleConfigs
}