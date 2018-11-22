const { statSync } = require("fs");
const logToTerminal = require('./logToTerminal');

const checkLink = link => {
    const { path, name, version } = link;
    const exists = statSync(path);
    if (exists) {
        return logToTerminal(`Using: ${name} @Version ${version}`, "magenta");
    }
    throw new Error(`Missing link ${name} from ${path}.`);
};

module.exports = (links, done) => {
    links.forEach(checkLink)
    done();
}
