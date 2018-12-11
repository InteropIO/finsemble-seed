
const verifyLinks = require("./verifyLinks");
const requiredFinsembleLinks = require("./getFinsembleLinks")();
const del = require("del");
const buildWebpack = require("../build/buildWebpack");
const buildAngular = require("../build/buildAngular");
const buildSass = require("./buildSass");
const envOrArg = require('./envOrArg');
const launchApplication = require('./launchApplication');
const startServer = require("./startServer");
const startupConfig = require("../configs/other/server-environment-startup");
const path = require('path');
const distPath = path.join(__dirname, "dist");
const logToTerminal = require('./logToTerminal');
const gulp = require('gulp');

const Tasks = class Tasks {
    constructor(taskMethods) {
        this.taskMethods = taskMethods;
        this.buildWebpack = buildWebpack;
        this.buildAngular = buildAngular;
        this.buildSass = buildSass;
        this.launchApplication = launchApplication;
        this.startServer = startServer;
    }

    getTaskMethods() {
        return {
            'default':       () => this.buildServeLaunch('development'),
            'build':         () => this.build('development'),
            'build:dev':     () => this.build('development'),
            'build:prod':    () => this.build('production'),
            'dev':           () => this.buildServeLaunch('development'),
            'dev:fresh':     () => this.rebuildServeLaunch('development'),
            'dev:noLaunch':  () => this.buildServe('development'),
            'prod':          () => this.buildServeLaunch('production'),
            'prod:noLaunch': () => this.buildServe('production'),
            'rebuild':       () => this.rebuild('development'),
            'server':        () => this.serve('development'),
            'server:prod':   () => this.serve('production'),
            'nobuild:dev':   () => this.serveLaunch('development'),
            'clean':         () => this.clean(distPath),
            launchApplication: this.launch,
            buildSass: this.buildSass,
            buildWebpack: this.buildWebpack,
            buildAngular: this.buildAngular,
            pre: this.pre,
            post: this.post,
            applicationConfig: this.post,
            logToTerminal,
        };
    }

    buildGulpTasks(tasks) {
        const keys = Object.keys(tasks);
        const tasks = keys.map(key => {
            const value = tasks[key];
            if (typeof value === "function") {
                return gulp.task(key, this[key]);
            }
        });
        this.post(() => {});
        return tasks;
    }

    pre(done) {
        verifyLinks(requiredFinsembleLinks, done);
    }

    post(err) {
        if (err) {
            console.error(errorOutColor(err));
            process.exit(1);
        }
    }

    clean(cleanPath) {
        return Promise.all([
            del(cleanPath, { force: true }),
            del(".babel_cache", { force: true }),
            del(path.join(__dirname, "./build/webpack/vendor-manifest.json"), { force: true }),
        del(".webpack-file-cache", { force: true }),
        ]);
    }

    async build(environment) {
        process.env.NODE_ENV = environment || 'development';
        await this.buildWebpack();
        await this.buildSass();
        await this.buildAngular();
    }


    async serve(environment) {
        process.env.NODE_ENV = environment || 'development';
        return this.startServer()
            .catch(err => {
                console.error(err.toString());
                process.exit(1);
            });
    }

    async launch(channelAdapter, manifest) {
        return this.launchApplication(channelAdapter, manifest);
    }

    applicationConfig() {
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
    }

    async buildServe(environment) {
        await this.build(environment);
        await this.serve(environment);
    }

    async buildServeLaunch(environment) {
        await this.buildServe(environment);
        const { manifest, channelAdapter } = this.applicationConfig();
        await this.launch(channelAdapter, manifest);
        
    }

    rebuildServeLaunch(environment) {
        this.clean(distPath);
        return this.buildServeLaunch(environment);
    }

    async rebuild(environment) {
        this.clean(distPath);
        await this.build(environment);
    }
    
    async serveLaunch(environment) {
        await this.serve(environment);
        const { manifest, channelAdapter } = this.applicationConfig();
        await this.launch(channelAdapter, manifest);
    }

};

module.exports = Tasks;