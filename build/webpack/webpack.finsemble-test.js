const path = require('path');
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");


const entries = {};

var listOfWebpackEntryFiles = [
  path.join(__dirname, './webpack.finsemble-test.json')
];

let componentsToBuild = {};
listOfWebpackEntryFiles.forEach(function (filename) {
  let entries = fs.existsSync(filename) ? require(filename) : {};
  let additionalComponents = {};
  if (Array.isArray(entries)) {
    // Process arrays (finsemble.webpack.json files) by automatically building the output & entry fields that webpack needs
    entries.forEach(function (assetName) {

      let assetNoSuffix = assetName.replace(/(?=\.).*/, ""); // Remove the .js or .jsx extension
      assetNoSuffix = assetNoSuffix.replace("src/","")
      additionalComponents[assetName] = {
        output: assetNoSuffix,
        entry: "./" + assetName
      };
    });
  } else {
    // Otherwise assume it's already in object format (webpack.components.entries.json)
    additionalComponents = entries;
  }

  componentsToBuild = Object.assign(componentsToBuild, additionalComponents);
});

for (let key in componentsToBuild) {
  let component = componentsToBuild[key];
  entries[component.output] = component.entry;
}

module.exports = {
  devtool: 'source-map',
  entry: entries,
  mode: "development",

  module: {
    rules: [{
        test: /\.m?js$/,
        exclude: [/node_modules/],
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.ts?$/,
        loader: 'babel-loader',
      }
    ]
  },
  output: {
    filename: "[name].js",
    sourceMapFilename: "[name].map.js",
    path: path.resolve(__dirname, '../../dist/assets')
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{
          context: 'src/fpe-router-test',
          from: "**/*.html",
          to: "./fpe-router-test",
        }
      ]
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      './node_modules'
    ],
  }
};