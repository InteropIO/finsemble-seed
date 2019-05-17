[![Finsemble Logo](https://documentation.chartiq.com/finsemble/styles/img/Finsemble_Logo_Dark.svg)](https://documentation.chartiq.com/finsemble/)

To get started with Finsemble, check out the [seed project tutorial](https://www.chartiq.com/tutorials/finsemble-seed-project). This tutorial walks you through setting up the seed project and introduces you to the basic concepts of developing a Finsemble smart desktop. 

For everything you need to know about Finsemble, including our API documentation, check out the [developer documentation](https://documentation.chartiq.com/finsemble).

# Finsemble Seed Project

This article lists the **contents** of the Finsemble seed project, how the seed project can be **extended**, and information about **upgrading** from the previous seed project structure.

- [Project structure](#project-structure)
- [Extending gulpfile](#extending-gulpfile)
- [Extending server functionality](#extending-server-functionality)

## Project structure

The Finsemble seed project provides a basic structure to help developers get up and running as quickly as possible. The seed project provides the skeleton of a Finsemble application that can be extended to suit your organization's needs. It also includes some functionality to make development faster and easier, like a basic build process.

- _gulpfile.js_ - The main gulpfile for the project includes the basic tasks used to build and run a Finsemble application for development.
- _gulpfile-extension.js_ (optional) - File that can be used to add/modify the functionality of the gulpfile. This file is included to prevent conflicts when upgrading your base project. See [Extending Gulpfile](#extending-gulpfile) for more information.
- _build/webpack_ - Includes all of the files used by the seed project to build the application.
    - _webpack.finsemble-built-in.entries.json_ - This specifies the entry and output files for the files built for a default Finsemble smart desktop.
    - _webpack.components.entries.json_ - This file is where developer-added files should be listed. This file is empty in the base Finsemble seed project to prevent merge conflicts when updating the seed project.
    - _webpack.adapters.entries.json_ - This file is for any storage adapters that need to be built. They are no longer housed in the same webpack configuration as components, as they cannot use the same plugins as components use.
- _configs/application_ - This folder contains all of the base configurations for the Finsemble application. _component.json_, _config.json_ and _services.json_ are empty and developer-added configuration should go here. The files in this folder are merged together to build the application configuration. This configuration can be changed at run time using dynamic configuration.
- _configs/openfin_ - Contains the application manifest used to start up the Finsemble application. The default manifest for development is included, and additional configurations can be placed in this folder.
- _configs/other/server-environment-startup.json_ - Used to define the development and production server configurations used by the Finsemble application.
- _server_ - Contains the server that hosts the built _dist_ folder for development purposes.
    - _server/server-extensions.md_ - Optional file that can be used to add functionality to the development server. See (Extending Server Functionality)[#extending-server-functionality].
- _src_ - The folder where your Finsemble components should be placed for the Finsemble build process.
- _src-built-in_ - Includes the source for the default UI components included with the Finsemble seed project. These files can be extended as desired, but, if you do extend these components, we recommend you copy the folder to the _src_ directory to prevent merge conflicts when upgrading the seed project.
    - _src-built-in/adapters_ - Contains an example Storage Adapter that saves data to local storage.
    - _src-built-in/components/assets_ - Contains the SASS, CSS and images used to create Finsemble's look and feel.
- _tutorials_ - Contains the source for the components used by our [seed project tutorial](https://www.chartiq.com/tutorials/?slug=finsemble-seed-project).

Project structure:
```
FINSEMBLE-SEED
│   .gitignore
│   gulpfile-extensions-example.js
│   gulpfile.js
│   package.json
│   README.md
│
├───build/webpack
│   └───webpack
│           defaultWebpackConfig.js
│           webpack.finsemble-built-in.entries.json
│           webpack.components.entries.json
│           webpack.components.js
│           webpack.services.js
│
├───configs
│   ├───application
│   │   │   components.json
│   │   │   config.json
│   │   │   presentationComponents.json
│   │   │   securityPolicies.json
│   │   │   services.json
│   │   │   workspaceTemplates.json
│   │   │   workspaces.json
│   │   │
│   │
│   ├───openfin
│   │       manifest-local.json
│   │
│   └───other
│           installer.json
│           server-environment-startup.json
│
├───server
│   │   server-extensions.md
│   │   server.js
│
├───src
│   ├───adapters
│   │       .gitignore
│   │
│   ├───clients
│   │       .gitignore
│   │
│   ├───components
│   │       .gitignore
│   │
│   ├───services
│   │       .gitignore
│   │
│   └───thirdParty
│           .gitignore
│
├───src-built-in
│   ├───adapters
│   │       indexedDBAdapter.js
│   │       localStorageAdapter.js
│   │
│   └───components
│       │
│       ├───assets
│
└───tutorials
```

## Extending gulpfile

You can modify and extend the gulpfile's functionality by creating a _gulpfile-extensions.js_ file at the same level as the _gulpfile.js_. This method avoids complications introduced from modifying the gulpfile directly and needing to merge upgrades into the updated gulpfile. The _gulpfile-extensions.js_ file should define a function that takes in the object containing all of the methods called by the gulpfile, including `pre` and `post` methods that can be used to redefine variables and add additional tasks.

These are the methods defined in the `taskMethods` object:
- `buildSass` - Builds the SASS for the application.
- `buildWebpack` - Performs the webpack build for the application.
- `clean` - Cleans the project folder (deletes _dist_).
- `copyStaticFiles` - Copies static files to the _dist_ folder.
- `launchApplication` - Launches the Finsemble application.
- `post` - Called after all of the tasks have been defined.
- `pre` - Called before all of the tasks have been defined.
- `startServer` - Starts the server based on `NODE_ENV` environment variable ("dev" or "prod").
- `watchFiles` - Watches files for changes to kick off `buildSASS` or `buildWebpack`.

These are the tasks defined in _gulpfile.js_:

- `npm run dev` - This is what you should use the most when developing. Fast build, runs a local node-server, launches Finsemble.
- `npm run dev:fresh` - Same as above except that it cleans out any cached files. This is like a rebuild all.
- `npm run build:dev` - Just fast build. No server, no launch.
- `npm run dev:nolaunch` - Fast build, run the server. Don't launch.
- `npm run server:dev` - Just run the server. No build. No launch.
- `npm run prod` - Build for production. This is a full rebuild with minification. It will take a while. Then run server and launch Finsemble. This is the prod equivalent of npm run dev. Use this to test production mode on your local machine.
- `npm run build:prod` - Build for production but don't run anything. Use this to create a production build for depoyment.
- `npm run prod:nolaunch` - Build for production and run the node-server.
- `npm run server:prod` - Just run the server in production mode. No build or launch.


If you wish to extend the build process (gulp) you can do so by adding a file _gulpfile-extensions.js_ to the root of your seed (alongside gulpfile.js). An example is available in _gulpfile-extensions-sample.js_ . Inside you will find complete instructions on how to modify gulp. See [gulp task function](https://github.com/gulpjs/gulp/blob/master/docs/API.md#gulptaskname-fn) for more information about gulp tasks.

## Extending server functionality

Sometimes during development, it is necessary to create new Web API (e.g., REST API) for your application to use. The Finsemble seed project already includes a server to host files locally for development, so it makes sense to use this server to design the new Web API. To allow for the extension of the server provided in the Finsemble seed project without breaking the upgrade path, the server attempts to import the _server-extensions.js_ file from the _server_ directory of the project. If _server-extensions.js_ exists, it's methods are called by the server to provide additional functionality. The _server-extensions.js_ file should return an object that contains the following functions:
- `pre` - Called before _server.js_ starts defining the default server functionality
- `post` - Called after the server is up and running
- `updateServer` - Called after the default server functionality has been defined, but before the server is started

The `pre` and `post` functions do not take any arguments. The `updateServer` function takes two arguments: the first is an instance of the [Express server](https://www.npmjs.com/package/express) that can be used to add functionality, and the second is a callback that takes no arguments, but must be called when the server is ready to be started. Please see the sample _server-extensions.js_ below:
```javascript
(module => {
    "use strict";

    module.exports = {
        /**
         * Method called before starting the server.
         *
         * @param done Function used to signal when pre function has finished. Can optionally pass an error message if
         * one occurs.
         */
        pre(done) {
            console.log("pre server startup");
            done();
        },

        /**
         * Method called after the server has started.
         *
         * @param done Function used to signal when pre function has finished. Can optionally pass an error message if
         * one occurs.
         */
        post(done) {
            console.log("post server startup");
            done();
        },

        /**
         * Method called to update the server.
         *
         * @param {express} app The express server.
         * @param {function} cb The function to call once you're finished adding functionality to the server. Can optionally
         * pass an error message if one occurs.
         */
        updateServer(app, cb) {
                // Hosts the dist directory at the root of the server.
				app.use("/", express.static(path.join(__dirname, "dist"), options));

				cb();
			}
    }
})(module);
```

## Upgrading
If you are moving from a version of the Finsemble seed project older than 2.3, please see the [instructions here](https://github.com/ChartIQ/finsemble-seed/tree/master/migration/2.3).

