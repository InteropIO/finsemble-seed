const path = require("path");
const adaptersToBuild = require("./webpack.adapters.entries.json");
let entries = {};
const hardSource = require("hard-source-webpack-plugin");
for (let key in adaptersToBuild) {
    let component = adaptersToBuild[key];
    entries[component.output] = component.entry;
}
let plugins = [new hardSource({
    //root dir here is "dist". Back out so we dump this file into the root.
    cacheDirectory: '../.webpack-file-cache/[confighash]',
    // Either an absolute path or relative to webpack's options.context.
    // Sets webpack's recordsPath if not already set.
    environmentHash: {
        root: path.join(__dirname, "..", ".."),
        directories: [],
        files: ['package.json'],
    }
})]
module.exports = {
    devtool: 'source-map',
    entry: entries,
    stats: "minimal",
    plugins: plugins,
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
            }
        ]
    },
    output: {
        filename: "[name].js",
        sourceMapFilename: "[name].map.js",
        path: path.resolve(__dirname, '../../dist/')
    },
    watch: false,
    resolve: {
        extensions: ['.js', '.jsx', '.json', 'scss', 'html'],
        modules: [
            './node_modules'
        ],
    },
};