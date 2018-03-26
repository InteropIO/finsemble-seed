const async = require('async');
const glob_entries = require('webpack-glob-entries');
const shelljs = require('shelljs');
const path = require('path');
const fs = require('fs');
const { copy, log, PROJECT_ROOT } = require("./common");
log("Migrating your project to finsemble-seed v2.3");

//

function copyFoldersAndFiles(cb) {
    async.eachSeries([
        {
            oldPath: path.join(PROJECT_ROOT, "build"),
            newPath: path.join(PROJECT_ROOT, "build-original"),
            messageOnComplete: "Copied old build directory to build-original.",
            deleteAfterCopy: true
        },
        {
            oldPath: path.join(__dirname, "../build"),
            newPath: path.join(PROJECT_ROOT, "build"),
            messageOnComplete: "Copied new build directory into the project."
        },
        {
            oldPath: path.join(PROJECT_ROOT, "server"),
            newPath: path.join(PROJECT_ROOT, "server-original"),
            messageOnComplete: "Copied old server directory to server-original.",
            deleteAfterCopy: true
        },
        {
            oldPath: path.join(__dirname, "../server"),
            newPath: path.join(PROJECT_ROOT, "server"),
            messageOnComplete: "Copied new server directory into the project."
        },
        {
            oldPath: path.join(__dirname, "../src-built-in"),
            newPath: path.join(PROJECT_ROOT, "src-built-in"),
            messageOnComplete: "Copied new presentation components into src-built-in."
        },
        {
            oldPath: path.join(PROJECT_ROOT, "gulpfile.js"),
            newPath: path.join(PROJECT_ROOT, "gulpfile.js.original"),
            messageOnComplete: "Copied old gulpfile.",
            deleteAfterCopy: true
        },
        {
            oldPath: path.join(__dirname, "../gulpfile.js"),
            newPath: path.join(PROJECT_ROOT, "gulpfile.js"),
            messageOnComplete: "Copied new gulpfile.",
        },
        {
            oldPath: path.join(PROJECT_ROOT, "build-original/webpack/webpack.components.entries.json"),
            newPath: path.join(PROJECT_ROOT, "build/webpack/webpack.components.entries.json"),
            messageOnComplete: "Copied old webpack entries file into the new build directory.",
        }
    ],
        copy,
        cb);
}

function copyNodeModules(done) {
    //If we don't remove node_modules, some folders are not copied over correctly, and the project ends up with multiple versions of react, causing the toolbar to break.
    log("Removing existing node modules folder.");
    shelljs.rm('-rf', path.join(__dirname, "../node_modules/"))
    copy({
        oldPath: path.join(__dirname, "../node_modules/"),
        newPath: path.join(PROJECT_ROOT, "node_modules/"),
        messageOnComplete: "Copied new node modules in."
    }, done);
}

function updatePackageFile(done) {
    let existingPackagePath = path.join(PROJECT_ROOT, "package.json")
    let existingPackage = require(existingPackagePath);
    let newPackage = require("../package.json");

    let oldScripts = Object.keys(existingPackage.scripts);
    let newScripts = Object.keys(newPackage.scripts);

    newScripts.forEach((script) => {
        if (oldScripts.includes(script)) {
            log(`Not adding script "${script}" to package.json. Script already exists.`);
        } else {
            existingPackage.scripts[script] = newPackage.scripts[script];
            log(`Adding script "${script}" to package.json.`);
        }
    });

    const newPackages = {
        "uglifyjs-webpack-plugin": "^1.2.3",
        "webpack": "^2.7.0",
        "death": "^1.1.0",
        "cookie-parser": "1.4.3",
        "babel-minify-webpack-plugin": "^0.3.0"
    }
    existingPackage.devDependencies = Object.assign(existingPackage.devDependencies, newPackages);
    const content = JSON.stringify(existingPackage, null, '\t');
    fs.writeFileSync(existingPackagePath, content, 'utf8');
    done();
}


function addVendorBundle(cb) {
    const COMPONENTS_DIRECTORY = path.join(PROJECT_ROOT, 'src/components/');
    //There's probably a better globber out there, this is the one I know.
    const HTMLFiles = glob_entries(path.join(COMPONENTS_DIRECTORY, '**/*.html'));
    let files = [];
    if (Object.keys(HTMLFiles).length === 0) {
        console.error("Found no HTML files in '" + COMPONENTS_DIRECTORY + "'. Ensure that you are running this command from the root of the seed.")
        return cb();
    }

    //Go through each and create an array.
    for (let key in HTMLFiles) {
        files.push(HTMLFiles[key]);
    }

    files.forEach((filename) => {
        log(`Adding vendor bundle to ${filename}`);
        let head = shelljs.cat(filename)
            .grep("<head>");
        if (head.stdout.includes("head")) {
            shelljs.cat(filename)
                .sed('-i', "<head>", `<head>
    <script src="/vendor.bundle.js"></script>`)
                .to(filename);
        } else {
            console.error("ERROR: Could not find <HEAD> tag in ", filename);
        }
    });
    cb();
}


async.series([
    copyFoldersAndFiles,
    updatePackageFile,
    addVendorBundle,
    copyNodeModules
], () => {
    log("Migration complete. Inspect webpack.components.entries.json, and remove any presentation components that you have not modified. You will also want to delete that folder from your src directory.");
});