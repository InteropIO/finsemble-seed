const { copy, log, PROJECT_ROOT } = require("./common");
const async = require("async");
const shelljs = require("shelljs");
const path = require("path");

function getFiles(cb) {
    let files = [];
    ["build", "server", "gulpfile.js", "package.json", "package-lock.json", "src-built-in", "node_modules"].forEach((file) => {
        console.log(file)
        files.push({
            oldPath: path.join(PROJECT_ROOT, file),
            newPath: path.join(__dirname, `../${file}`),
            messageOnComplete: `Copied ${file} into migration directory.`
        })
    })
    async.eachSeries(files, copy, () => {
        //Not needed for the migration to work.
        shelljs.rm('-rf', path.join(__dirname, "../build/webpack/vendor-manifest.json"));
        cb();
    });
}


getFiles(() => {
    log("Migration folder built.");
});