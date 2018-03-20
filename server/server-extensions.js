
const Adapter = require("./storage/storageAdapter");
//These are noop functions that exist because the server will error out without them.
module.exports.pre = (done) => done();
module.exports.post = (done) => done();
module.exports.updateServer = function (app, done) {
    //just creates the routes to save and get data from node-persist.
    let storageAdapter = new Adapter(app);
    done();
};