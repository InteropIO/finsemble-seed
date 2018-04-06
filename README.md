## If you are moving from an older version of the finsemble-seed project to the latest (2.3), please see the [instructions here](https://github.com/ChartIQ/finsemble-seed/tree/master/migration/2.3).


For everything you need to know about Finsemble, including a step-by-step process for setting up the seed project, check out the documentation on our [website](https://documentation.chartiq.com/finsemble/tutorial-IntroductionToFinsemble.html).

<!-- TODO: Update tutorials to point to _tutorials_ folder at the top level -->
<!-- TODO: Move creating of components to tutorials and have URL to point to CSS -->

# Finsemble Seed Project

This article lists the **contents** of the Finsemble seed project, how the seed project can be **extended**, and information about **upgrading** from the previous seed project structure.

- [Project structure](#project-structure)
- [Extending gulpfile](#extending-gulpfile)
- [Extending server functionality](#extending-server-functionality)

## Project structure

The Finsemble seed project provides a basic structure to help developers get up and running as quickly as possible. The seed project provides the skeleton of a Finsemble application that can be extended to suit your organization's needs. It also includes some functionality to make development faster and easier, like a basic build process.

- _gulpfile.js_ - The main gulpfile for the project which includes the basic tasks used to build and run a Finsemble application for development.
- _gulpfile-extension.js_ (optional) - File that can be used to add/modify the functionality of the gulpfile. This file is included to prevent conflicts when upgrading your base project. See [Extending Gulpfile](#extending-gulpfile) for more information.
- _build/webpack_ - Includes all of the files used by the seed project to build the application.
    - _webpack.finsemble-built-in.entries.json_ - This specifies the entry and output files for the files built for a default Finsemble application.
    - _webpack.components.entries.json_ - This file is where developer-added files should be listed. This file is empty in the base Finsemble seed project to prevent merge conflicts when updating the seed project.
    - _webpack.adapters.entries.json_ - This file is for any storage adapters that need to be built. They are no longer housed in the same webpack configuration as components, as they cannot use the same plugins as components use.
- _configs/application_ - This folder contains all of the base configuration for the Finsemble application. _component.json_, _config.json_ and _services.json_ are empty and developer-added configuration should go here. The files in this folder are merged together to build the application configuration. This configuration can be changed at run time using [Dynamic Configuration](https://documentation.chartiq.com/finsemble/tutorial-dynamicConfiguration.html).
- _configs/openfin_ - Contains the [OpenFin application config](https://openfin.co/documentation/application-config/) (also known as the application manifest) used to start up the Finsemble application. The default manifest for development is included, and additional configurations can be placed in this folder.
- _configs/other/server-environment-startup.json_ - Used to define the development and production server configurations used by the Finsemble application.
- _server_ - Contains the server that hosts the built _dist_ folder for development purposes.
    - _server/server-extensions.js_ - Optional file that can be used to add functionality to the development server. See (Extending Server Functionality)[#extending-server-functionality].
- _src_ - The folder where your Finsemble components should be placed for the Finsemble build process.
- _src-built-in_ - Includes the source for the default presentation components included with the Finsemble seed project. These files can be extended as desired, but, if you do extend these components, we recommend you copy the folder to the _src_ directory to prevent merge conflicts when upgrading the seed project.
    - _src-built-in/adapters_ - Contains an example Storage Adapter that saves data to local storage.
    - _src-built-in/components/assets_ - Contains the SASS, CSS and images used to create Finsemble's look and feel.
- _tutorials_ - Contains the source for the components used by our [seed project tutorial](https://www.chartiq.com/tutorials/?slug=finsemble-seed-project).

Project structure:
```
FINSEMBLE-SEED
│   .gitignore
│   gulpfile-extensions.md
│   gulpfile.js
│   package.json
│   README.md
│
├───build
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
│   │   │   services.json
│   │   │
│   │   └───default
│   │           components.json
│   │           config.json
│   │           presentationComponents.json
│   │           workspaces.json
│   │           workspaceTemplates.json
│   │
│   ├───openfin
│   │       manifest-local.json
│   │
│   └───other
│           server-environment-startup.json
│
├───server
│   │   server.js
│   │
│   ├───dev
│   │       hotreload.js
│   │
│   └───hotreloadmiddleware
│           client-overlay.js
│           client.js
│           helpers.js
│           middleware.js
│           package.json
│           process-update.js
│           README.md
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


If you wish to add additional task or function calls to the existing tasks, they can be redefined in the `post` method call. If the _gulpfile-extensions.js_ file exists, it's contents are called as a method passing an object with the default task functions in. These methods can be overwritten or extended as needed. The `pre` and `post` methods pass in a callback function that must be called to signal that the gulpfile can continue executing. The other functions defined in `taskMethods` should be specified like a [gulp task function](https://github.com/gulpjs/gulp/blob/master/docs/API.md#gulptaskname-fn).

Example _gulpfile-extensions.js_:
```js
module.exports = taskMethods => {
    "use strict";

    const gulp = require("gulp");

    // Extension of pre method. Get a reference to the original function to be called later.
    let preOriginal = taskMethods.pre
    taskMethods.pre = (cb) => {
        // Add extension code.
        console.log("PRE: pre");

        // Call original function
        preOriginal(() => {
            // Call code that should be called after the original function has completed.
            console.log("POST: pre");

            // Execute callback to signal that execution in gulpfile can continue.
            cb();
        });
    };

    // Extension of copyStaticFiles
    let copyStaticFilesOriginal = taskMethods.copyStaticFiles
    taskMethods.copyStaticFiles = (cb) => {
        // Execute code that should be called before the original function.
        console.log("PRE: copyStaticFiles");

        // Execute the original function, which, in this case, returns a stream.
        copyStaticFilesOriginal()
            .on(
                "end",
                () => {
                    // Wait for stream completion before executing additional cod.
                    console.log("POST: copyStaticFiles");

                    // Execute callback to signal completion.
                    cb();
                });
    };

    taskMethods.post = (cb) => {
        console.log("Adding tasks");

        /**
         * Function used as part of newTask.
         */
        const newFunction = () => {
            console.log("Do some other stuff here");
        };

        gulp.task("newTask", gulp.series("build"), newFunction);

        /**
         * Definition of function called at the beginning of the build task.
         */
        const preBuildFunction = (cb) => {
             console.log("pre-build task");
             cb();
        };

        /**
         * Definition of function called at the end of the build task.
         */
        const postBuildFunction = (cb) => {
            console.log("post-build task");
            cb();
        };

        /**
         * Redefinition of a task defined in the gulpfile.
         */
        gulp.task(
            "build",
            gulp.series(
                preBuildFunction,
                "clean",
                taskMethods.copyStaticFiles,
                taskMethods.buildWebpack,
                taskMethods.buildSass),
                postBuildFunction
            );

        done();
    }
};
```

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
