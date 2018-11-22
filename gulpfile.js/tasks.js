const verifyLinks = require("./verifyLinks");
const requiredFinsembleLinks = require("./getFinsembleLinks")();
const del = require("del");
const buildWebpack = require("../buildWebpack");
const buildAngular = require("../buildAngular");
const buildSass = require("./buildSass");
const envOrArg = require('./envOrArg');
const launchApplication = require('./launchApplication');
const startServer = require("./startServer");
const startupConfig = require("../configs/other/server-environment-startup");

const pre = done => {
    verifyLinks(requiredFinsembleLinks, done);
};
const post = err => {
    if (err) {
        console.error(errorOutColor(err));
        process.exit(1);
    }
}
const clean = cleanPath => {
    del(cleanPath, { force: true });
    del(".babel_cache", { force: true });
    del(path.join(__dirname, "build/webpack/vendor-manifest.json"), { force: true });
    del(".webpack-file-cache", { force: true });
};
const build = async environment => {
    process.env.NODE_ENV = environment || 'development';
    await buildWebpack();
    await buildSass();
    await buildAngular();
};
const serve = async environment => {
    if (!process.env.PORT) {
        process.env.PORT = startupConfig[process.env.NODE_ENV].serverPort;
    }
    process.env.NODE_ENV = environment || 'development';
    return startServer()
        .catch(err => {
            console.error(err.toString());
            process.exit(1);
        });
};
const launch = async (channelAdapter, manifest) => {
    return launchApplication(channelAdapter, manifest);
};

const applicationConfig = () => {
    let channelAdapter = envOrArg("channel_adapter", "openfin");
    channelAdapter = channelAdapter.toLowerCase();
    if (channelAdapter === "electron") {
        channelAdapter = "e2o";
    }
    const launchTimestamp = Date.now();
    const manifest = startupConfig[process.env.NODE_ENV].serverConfig;
    return {
        launchTimestamp,
        manifest,
        channelAdapter,
    }
};
const buildServe = async environment => {
    await build(environment);
    await serve(environment);
};
const buildServeLaunch = async environment => {
    await buildServe(environment);
    const { manifest, channelAdapter } = applicationConfig();
    await launch(channelAdapter, manifest);
    
};
const rebuildServeLaunch = environment => {
    clean();
    return buildServeLaunch(environment);
};
const rebuild = async environment => {
    clean();
    await build(environment);
}
const serveLaunch = async environment => {
    await serve(environment);
    const { manifest, channelAdapter } = applicationConfig();
    await launch(channelAdapter, manifest);
}

module.exports = {
    pre,
    post,
    clean,
    build,
    serve,
    launch,
    applicationConfig,
    buildServe,
    buildServeLaunch,
    rebuildServeLaunch,
    rebuild,
    serveLaunch,
    buildWebpack,
    buildSass,
    buildAngular,
}