const shelljs = require("shelljs");
const path = require("path");


module.exports.copy = function copy(params, cb) {
    const { oldPath, newPath, messageOnComplete, deleteAfterCopy } = params;
    const COPYING_NODE_MODULES = oldPath.includes("node_modules");


    module.exports.log(`Copying "${oldPath}" to "${newPath}"`);

    if (COPYING_NODE_MODULES) {
        module.exports.log("Copying node modules. The operation is blocking, so we cannot periodically let you know that the script is still working. This will likely take more than 5 minutes.");
    }
    //Copy the folder so we have a backup.
    shelljs.cp('-R', oldPath, newPath);

    module.exports.log(messageOnComplete);

    if (deleteAfterCopy) {
        module.exports.log(`Removing old file/folder: ${oldPath}`);
        //Delete the old folder. This is done when we're goign to copy something from the migration folder into the seed.
        shelljs.rm('-rf', oldPath);
        module.exports.log(`Old file/folder removed: ${oldPath}`);
    }

    cb();
}

module.exports.log = function log(msg) {
    console.log(`[${new Date().toLocaleTimeString()}]`, msg);
};

//If the migration folder is in the root of the finsemble-seed directory
module.exports.PROJECT_ROOT = path.join(__dirname, "../../../");

//If the migration folder is in the same parent directory as the finsemble-seed directory
// module.exports.PROJECT_ROOT = path.join(__dirname, "../../../../finsemble-seed");
