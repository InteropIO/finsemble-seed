const { promisify } = require('util');
const { stat, readlink } = require("fs");
const readlinkAsync = promisify(readlink);
const statAsync = promisify(stat);
const logToTerminal = require('./logToTerminal');

const checkLink = async link => {
    const { path, name, version } = link;
    const exists = await statAsync(path);
    if (exists) {
        return logToTerminal(`Using: ${name} @Version ${version}`, "magenta");
    }
    throw new Error(`Missing link ${name} from ${path}.`);
};

module.exports = async links => {
    const promises = links.map(checkLink)
    return Promise.all(promises);
}
