
var Finsemble = require("@chartiq/finsemble/libs/Server");
Finsemble.addServices(require("../configs/services.json"));
Finsemble.addComponents(require("../configs/components.json"));

module.exports = function () {
    return Finsemble.FinsembleConfigs
}