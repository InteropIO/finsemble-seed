const { runWebpackAndCallback } = require("./buildHelpers");
module.exports = function worker(args, callback) {
    runWebpackAndCallback(args.configPath, args.watch, args.prettyName, callback);
}