const path = require("path");
const preloadFilesToBuild = require("./webpack.preloads.entries.json");
const { EnvironmentPlugin, ProgressPlugin } = require("webpack");

let entries = {};
for (let key in preloadFilesToBuild) {
    let component = preloadFilesToBuild[key];
    entries[component.output] = component.entry;
}

module.exports = {
    plugins: [
        //new ProgressPlugin({ profile: false })
    ],
    devtool: 'source-map',
    entry: entries,
    stats: "minimal",
    module: {
        rules: [
            {
                test: /\.js(x)?$/,
                exclude: [/node_modules/, "/chartiq/"],
                loader: 'babel-loader',
                options: {
                    cacheDirectory: './.babel_cache/',
                    presets: ['react', 'stage-1']
                }
            },
            {
                test: /\.ts(x)?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    output: {
        filename: "[name].js",
        sourceMapFilename: "[name].map.js",
        path: path.resolve(__dirname, '../../dist/')
    },
    resolve: {
        extensions: ['.ts', '.js', '.jsx', '.json', 'scss', 'html']
    },
};