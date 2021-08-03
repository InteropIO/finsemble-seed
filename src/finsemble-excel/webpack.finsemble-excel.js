const {
  CleanWebpackPlugin
} = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');
const path = require('path');

module.exports = {
  devtool: "source-map",
  entry: {
    vendor: [
      'react',
      'react-dom',
      'core-js',
      'office-ui-fabric-react'
    ],
    taskpane: [
      './src/finsemble-excel/taskpane/index.tsx',
    ],
    commands: './src/finsemble-excel/commands/commands.ts'
  },
  output: {
    path: path.resolve(__dirname, '../../public/build/finsemble-excel')
  },
  mode: "development",
  resolve: {
    extensions: [".ts", ".tsx", ".html", ".js"],
    modules: [
      './node_modules'
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
            'ts-loader'
        ],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        loader: "file-loader",
        options: {
          name: '[path][name].[ext]',          
        }
      }
    ]
  },    
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
      {
        context: 'src/finsemble-excel',
        from: "taskpane/taskpane.css",
        to: "",
      },
      {
        context: 'src/finsemble-excel',
        from: "manifest.xml",
        to: "",
      },
      {
        context: 'src/finsemble-excel',
        from: "**/*.png",
        to: "",
      },
      {
        context: 'src/finsemble-excel',
        from: "**/*.svg",
        to: "",
      }
    ]}),
    new ExtractTextPlugin('[name].[hash].css'),
    new HtmlWebpackPlugin({
      filename: "taskpane.html",
        template: './src/finsemble-excel/taskpane/taskpane.html',
        chunks: ['taskpane', 'vendor', 'polyfills', 'commands']
    }),
    new HtmlWebpackPlugin({
      filename: "commands.html",
        template: './src/finsemble-excel/commands/commands.html',
        chunks: ['taskpane', 'vendor', 'polyfills', 'commands']
    }),
    new webpack.ProvidePlugin({
      Promise: ["es6-promise", "Promise"]
    })
  ]
}