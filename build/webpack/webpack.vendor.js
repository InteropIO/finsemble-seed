var webpack = require('webpack');
const path = require('path');
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { DefinePlugin, DllPlugin } = require("webpack");

console.log("ENVIRONMENT", env);
let plugins = [
    new DllPlugin({
        name: 'vendor_lib',
        path: path.join(__dirname, 'vendor-manifest.json')
    }),
    new DefinePlugin({
        "process.env": {
            "NODE_ENV": JSON.stringify(env)
        }
    }),
]

if (env === "production") {
    // When building the production environment, minify the code.
    plugins.push(new UglifyJsPlugin());
}

module.exports = {
    entry: {
        vendor: [path.join(__dirname, './vendor')],
    },
    output: {
        filename: 'vendor.bundle.js',
        path: path.join(__dirname, "../../dist"),
        library: 'vendor_lib',
    },
    plugins: plugins
};