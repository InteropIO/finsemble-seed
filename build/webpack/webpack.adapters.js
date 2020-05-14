const path = require("path");
const adaptersToBuild = require("./webpack.adapters.entries.json");
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";

let entries = {};
for (let key in adaptersToBuild) {
	let component = adaptersToBuild[key];
	entries[component.output] = component.entry;
}

module.exports = {
    devtool: env === 'production' ? 'source-map' : 'eval-source-map',
    entry: entries,
    stats: "minimal",
    plugins: [
        new HardSourceWebpackPlugin(
            {
                info: {
                    level: 'warn'
                },
                cacheDirectory: '../.webpack-file-cache/[confighash]',
            }
        ),
    ],
    module: {
        rules: [
            {
                test: /\.js(x)?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            ["@babel/preset-env", {
                                targets: {
                                    browsers: "Chrome 70"
                                },
                                modules: "commonjs"
                            }],
                            "@babel/preset-react"],
                        plugins: [
                            "babel-plugin-add-module-exports",
                            "@babel/plugin-proposal-export-default-from",
                            "@babel/plugin-transform-modules-commonjs",
                            "@babel/plugin-proposal-class-properties",
                            ["@babel/plugin-proposal-decorators", { decoratorsBeforeExport: false }],
                            ["@babel/plugin-transform-runtime", { regenerator: true }]
                        ]
                    }
                }
            },
        ]
    },
    output: {
        filename: "[name].js",
        sourceMapFilename: "[name].map.js",
        path: path.resolve(__dirname, '../../dist/')
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json', 'html']
    },
};