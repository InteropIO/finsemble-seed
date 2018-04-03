const async = require('async');
const glob_entries = require('webpack-glob-entries');
const shelljs = require('shelljs');
const path = require('path');
const fs = require('fs');
const { OLD_PROJECT_ROOT, THIS_PROJECT_ROOT } = require("./config");

const log = function log(msg) {
    console.log(`[${new Date().toLocaleTimeString()}]`, msg);
};

const copy = function copy(params, cb) {
    const { oldPath, newPath, messageOnComplete, deleteAfterCopy } = params;
    const COPYING_NODE_MODULES = oldPath.includes("node_modules");


    log(`Copying "${oldPath}" to "${newPath}"`);

    if (COPYING_NODE_MODULES) {
        log("Copying node modules. The operation is blocking, so we cannot periodically let you know that the script is still working. This will likely take more than 5 minutes.");
    }
    //Copy the folder so we have a backup.
    shelljs.cp('-R', oldPath, newPath);

    log(messageOnComplete);

    if (deleteAfterCopy) {
        log(`Removing old file/folder: ${oldPath}`);
        //Delete the old folder. This is done when we're goign to copy something from the migration folder into the seed.
        shelljs.rm('-rf', oldPath);
        log(`Old file/folder removed: ${oldPath}`);
    }

    cb();
}

log("Migrating your existing project to finsemble-seed v2.3");

function copyFoldersAndFiles(cb) {
    async.eachSeries([
        {
            oldPath: path.join(OLD_PROJECT_ROOT, "src"),
            newPath: path.join(THIS_PROJECT_ROOT),
            messageOnComplete: "Copied existing src directory.",
        },
        {
            oldPath: path.join(OLD_PROJECT_ROOT, "configs"),
            newPath: path.join(THIS_PROJECT_ROOT),
            messageOnComplete: "Copied existing configs directory.",
        },
        {
            oldPath: path.join(OLD_PROJECT_ROOT, "build/webpack/webpack.files.entries.json"),
            newPath: path.join(THIS_PROJECT_ROOT, "build/webpack/webpack.components.entries.json"),
            messageOnComplete: "Copied old webpack entries file into the new build directory.",
        }
    ],
        copy,
        cb);
}

function moveAdapters(done) {
    const componentsEntry = path.join(THIS_PROJECT_ROOT, "build/webpack/webpack.components.entries.json");
    const adapterEntry = path.join(THIS_PROJECT_ROOT, "build/webpack/webpack.adapters.entries.json");
    let componentsConfig = require(componentsEntry);
    let components = Object.keys(componentsConfig);
    let adaptersConfig = require(adapterEntry);

    components.forEach(cmp => {
        if (cmp.toLowerCase().includes("adapter")) {
            log(`Removing adapter ${cmp} from webpack.components.entries.json`)
            let clone = JSON.parse(JSON.stringify(componentsConfig[cmp]));
            delete componentsConfig[cmp];
            log(`Adding adapter ${cmp} to webpack.adapters.entries.json`)
            adaptersConfig[cmp] = clone;
        }
    });

    const newComponentsConfig = JSON.stringify(componentsConfig, null, '\t');
    fs.writeFileSync(componentsEntry, newComponentsConfig, 'utf8');

    const newAdapterConfig = JSON.stringify(adaptersConfig, null, '\t');
    fs.writeFileSync(adapterEntry, newAdapterConfig, 'utf8');
    done();
}

function updatePackageFile(done) {
    const oldPackagePath = path.join(OLD_PROJECT_ROOT, "package.json")
    const newPackagePath = path.join(THIS_PROJECT_ROOT, "package.json");
    let oldPackage = require(oldPackagePath);
    let newPackage = require(newPackagePath);

    const oldScripts = Object.keys(oldPackage.scripts);
    const oldDependencies = Object.keys(oldPackage.dependencies);
    const oldDevDependencies = Object.keys(oldPackage.devDependencies);
    const newDependencies = Object.keys(newPackage.dependencies);
    const newDevDependencies = Object.keys(newPackage.devDependencies);

    let newScripts = Object.keys(newPackage.scripts);

    oldScripts.forEach((script) => {
        if (!newScripts.includes(script)) {
            newScripts.scripts[script] = oldScripts.scripts[script];
            log(`Adding script "${script}" to package.json.`);
        }
    });

    oldDependencies.forEach(dep => {
        if (!newDependencies.includes(dep)) {
            newPackage.dependencies[dep] = oldPackage.dependencies[dep];
            log(`Adding package ${dep} to package.json's dependencies`);
        }
    });

    oldDevDependencies.forEach(dep => {
        if (!newDevDependencies.includes(dep)) {
            newPackage.devDependencies[dep] = oldPackage.devDependencies[dep];
            log(`Adding package ${dep} to package.json's devDependencies`);
        }
    });

    const content = JSON.stringify(newPackage, null, '\t');
    fs.writeFileSync(newPackagePath, content, 'utf8');
    done();
}

function updateApplicationConfigs(cb) {
    log("Updating your local manifest");
    const MANIFEST_PATH = path.join(THIS_PROJECT_ROOT, "configs/openfin/manifest-local.json");
    const manifest = require(MANIFEST_PATH);
    let runtimeArgs = manifest.runtime.arguments.split("--").map(arg=>arg.trim());
    let addFrameStrategy = true;
    runtimeArgs = runtimeArgs.map((arg) => {
        if (arg.includes("v=")) {
            arg = "v=4"
        }
        if (arg === "framestrategy=frames") addFrameStrategy = false;
        return arg;
    }).join(" --");
    if (addFrameStrategy) {
        runtimeArgs+= " --framestrategy=frames"
    }
    manifest.runtime.arguments = runtimeArgs;
    const content = JSON.stringify(manifest, null, '\t');
    fs.writeFileSync(MANIFEST_PATH, content, 'utf8');
    cb();
}

function addVendorBundle(cb) {
    const COMPONENTS_DIRECTORY = path.join(THIS_PROJECT_ROOT, 'src/components/');
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
    addVendorBundle,
    moveAdapters,
    updateApplicationConfigs
], () => {
    log("Migration complete. Inspect /build/webpack/webpack.components.entries.json, and remove any presentation components that you have not modified. You will also want to delete the corresponding folders from your src directory.");
});
