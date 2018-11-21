const safeRequire = require('./gulpfile.js/safeRequire');
const listableExecute = require('./gulpfile.js/listableExecute');
const logToTerminal = require('./gulpfile.js/logToTerminal');

const processComponent = (component) => {
    const name = component.source.split("/").pop();
    
    const outputPath = path.join(__dirname, component.source, component["output-directory"]);
    return {
        command: `ng build --base-href "/angular-components/${name}/" --outputPath "${outputPath}"`,
        dir: path.join(__dirname, component.source),
        afterExec: (output) => logToTerminal(`Built Angular Component, exit code = ${output.code}`, "green"),
    }
}
module.exports = async () => {
    const angularComponents = await safeRequire("./build/angular-components.json");
    if (!angularComponents) {
        logToTerminal("No Angular component configuration found", "yellow");
        return;
    }

    if (angularComponents) {
        const commandObjects = angularComponents.map(processComponent);
        listableExecute(commandObjects);
    }
};
