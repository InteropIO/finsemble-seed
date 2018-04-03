const path = require("path");
//Goes to the root of this folder, back 3 folders.
module.exports.THIS_PROJECT_ROOT = path.join(__dirname, "../../../");
//Assumes that the project that you'd liked to migrate is in the same root folder as 2.3, and the folder name of that project is finsemble-seed.
module.exports.OLD_PROJECT_ROOT = path.join(__dirname, "../../../../finsemble-seed");

