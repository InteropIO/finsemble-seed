const path = require("path");

module.exports =  () => {
    const FINSEMBLE_PATH = path.join(__dirname, "../node_modules", "@chartiq", "finsemble");
    const FINSEMBLE_VERSION = require(path.join(FINSEMBLE_PATH, "package.json")).version;
    const CLI_PATH = path.join(__dirname, "../node_modules", "@chartiq", "finsemble-cli");
    const CLI_VERSION = require(path.join(CLI_PATH, "package.json")).version;
    const CONTROLS_PATH = path.join(__dirname, "../node_modules", "@chartiq", "finsemble-react-controls");
    const CONTROLS_VERSION = require(path.join(CONTROLS_PATH, "package.json")).version;

    return [
        {
            path: FINSEMBLE_PATH,
            name: "@chartiq/finsemble",
            version: FINSEMBLE_VERSION
        },
        {
            path: CLI_PATH,
            name: "@chartiq/finsemble-cli",
            version: CLI_VERSION
        },
        {
            path: CONTROLS_PATH,
            name: "@chartiq/finsemble-react-controls",
            version: CONTROLS_VERSION
        }
    ];
}

