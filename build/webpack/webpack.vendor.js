var webpack = require('webpack');
const path = require('path');
module.exports = {
    entry: {
        vendor: [path.join(__dirname, './vendor')],
    },
    output: {
        filename: 'vendor.bundle.js',
        path: path.join(__dirname, "../../dist"),
        library: 'vendor_lib',
    },
    plugins: [new webpack.DllPlugin({
        name: 'vendor_lib',
        path: 'build/webpack/vendor-manifest.json',
    })]
};