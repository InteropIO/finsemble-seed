For everything you need to know about the seed project, including a step-by-step process, check out the documentation on our [website](https://documentation.chartiq.com/finsemble/tutorial-gettingStarted.html).

<!-- TODO: Update tutorials to point to _tutorials_ folder at the top level -->
<!-- TODO: Move creating of components to tutorials and have URL to point to CSS -->

# Finsemble Seed Project

This article lists the contents of the Finsemble seed project, how the seed project can be extended, and some information about upgrading from the previous seed project structure.

- [Project structure](#project-structure)
- [Extending gulpfile](#extending-gulpfile)
- [Extending server functionality](#extending-server-functionality)
- [Upgrade instructions](#upgrade-instructions)

## Project structure

The Finsemble seed project provides a basic structure to help developers get up and running as quickly as possible. The seed project provides the basic skeleton for a Finsemble application that can be extended to suit your organization's needs. It also includes some functionality to make development faster and easier, like a basic build process and hot reload.

- _gulpfile.js_ - The main gulpfile for the project that includes the basic tasks used to build and run a Finsemble application for development.
- _gulpfile-extension.js_ (optional) - File that can be used to add/modify the functionality of the gulpfile. This file isn't included in the base seed project to prevent conflicts when upgrading the base project. See [Extending Gulpfile](#extending-gulpfile) for more information.
- _build/webpack_ - Includes all of the files used by the seed project to build the application.
    - _webpack.default.files.entries.json_ - This specifies the entry and output files for the files built for a default Finsemble application.
    - _webpack.files.entries.json_ - This file is where developer-added files should be listed. This file is empty in the base Finsemble seed project to prevent merge conflicts when updating the seed project.
- _configs/application_ - This folder contains all of the base configuration for the Finsemble application. _component.json_, _config.json_ and _services.json_ are empty and developer-added configuration should go here. The files in this folder are merged together to build the application configuration. This configuration can be changed at run time using [Dynamic Configuration](https://documentation.chartiq.com/finsemble/tutorial-dynamicConfiguration.html).
- _configs/openfin_ - Contains the [OpenFin application config](https://openfin.co/documentation/application-config/) used to start up the Finsemble application. The default manifest for development is included, and additional configurations can be placed in this folder.
- _configs/other/server-environment-startup.json_ - Used to define the development and production server configurations used by the Finsemble application.
- _server_ - Contains the server that hosts the build _dist_ folder for development purposes and includes hot reload in the development environment. 
    - _server/server-extensions.js_ - Optional file that can be used to add functionality to the development server. See (Extending server functionality)[#extending-server-functionality].
- _src_ - The folder where your Finsemble components should be placed for the Finsemble build process.
- _srcDefault_ - Includes the source for the default presentation components included with the Finsemble seed project. These files can be extended as desired, but, if you do extend these components, we recommend you copy the folder to the _src_ directory to prevent merge conflicts when upgrading the seed project.
    - _srcDefault/adapters_ - Contains an example Storage Adapter that saves data to local storage.
    - _srcDefault/components/assets_ - Contains the SASS, CSS and images used to create Finsemble's look and feel.
- _tutorials_ - Contains the source for the components used by our [Getting started](https://documentation.chartiq.com/finsemble/tutorial-gettingStarted.html) tutorial.

Project structure:
```
FINSEMBLE-SEED
|   .gitignore
|   gulpfile-extensions.md
|   gulpfile.js
|   package.json
|   README.md
|   
+---build
|   \---webpack
|           defaultWebpackConfig.js
|           webpack.default.files.entries.json
|           webpack.files.entries.json
|           webpack.files.js
|           webpack.services.js
|           
+---configs
|   +---application
|   |   |   components.json
|   |   |   config.json
|   |   |   services.json
|   |   |   
|   |   \---default
|   |           components.json
|   |           config.json
|   |           presentationComponents.json
|   |           workspaces.json
|   |           workspaceTemplates.json
|   |           
|   +---openfin
|   |       manifest-local.json
|   |       
|   \---other
|           server-environment-startup.json
|           
+---server
|   |   server.js
|   |   
|   +---dev
|   |       hotreload.js
|   |       
|   \---hotreloadmiddleware
|           client-overlay.js
|           client.js
|           helpers.js
|           middleware.js
|           package.json
|           process-update.js
|           README.md
|           
+---src
|   +---adapters
|   |       .gitignore
|   |       
|   +---clients
|   |       .gitignore
|   |       
|   +---components
|   |       .gitignore
|   |       
|   +---services
|   |       .gitignore
|   |       
|   \---thirdParty
|           .gitignore
|           
+---srcDefault
|   +---adapters
|   |       localStorageAdapter.js
|   |       
|   \---components
|       |               
|       +---assets
|                   
\---tutorials
```

## Extending gulpfile

It is often necessary to modify and extend the functionality provided by the gulpfile in the seed project. This can be done by editing the gulpfile directly but, doing this, complicates the upgrade path because modifications would need to be merged into the updated gulpfile. If you need to modify or extend the functionality provided by the gulpfile, please create a _gulpfile-extensions.js_ file at the same level as the _gulpfile.js_. This file should define a function that takes in the object containing all of the methods called by the gulpfile, including `pre` and `post` methods that can be used to redefine variables and add additional tasks.

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
- `clean` - Cleans the project directory (calls the `clean` method).
- `build` - Builds the application in the distribution directory (calls "clean" task and, `copyStaticFiles`, `buildWebpack`, and `buildSASS` functions).
- `prod` - Builds the application and starts the server to host it (calls the "build" task then the `startServer` function).
- `prod:run` - Builds the application, starts the server, and launches the Finsemble application (calls the "prod" task then `launchApplication`).
- `dev:run` - Builds the application, starts the server, launches the Finsemble application, and watches for file changes (calls "prod:run" task then the `watchFiles` function).
- `default` - Specifies the default task to run if no task is passed in (calls the "dev:run" task).

If you wish to add additional task or function calls to the existing tasks, they can be redefined in the `post` method call.

Below is code that can be used as a template for _gulpfile-extensions.js_:

```js
module.exports = taskMethods => {
    // Place your code here
}
```

If the _gulpfile-extensions.js_ file exists, it's contents are called as a method passing an object with the default task functions in. These methods can be overwritten or extended as needed. 

Example _gulpfile-extensions.js_:
```js
module.exports = taskMethods => {
    "use strict";

    const gulp = require("gulp");

    // Extension of pre method;
    let pre = taskMethods.pre 
    taskMethods.pre = done => {
        console.log("PRE: pre");
        const result = pre(() => {
            console.log("POST: pre");
            done();
        });
    };

    // Extension of copyStaticFiles
    let copyStaticFiles = taskMethods.copyStaticFiles 
    taskMethods.copyStaticFiles = () => {
        console.log("PRE: copyStaticFiles");
        const result = copyStaticFiles();
        console.log("POST: copyStaticFiles");
        
        return result;
    };

    const post = taskMethods.post;
    taskMethods.post = done => {
        console.log("Adding tasks");

        gulp.task("newTask", gulp.series("build"), () => { console.log("Do some other stuff here");});

        /**
         * Redefinition of a task defined in the gulpfile.
         */
        gulp.task(
            "build",
            gulp.series(
                done => { console.log("pre-build task"); done(); },
                "clean",
                taskMethods.copyStaticFiles,
                taskMethods.buildWebpack,
                taskMethods.buildSass),
                done => { console.log("post-build task"); done(); }
            );

        done();
    }
};
```

## Extending server functionality

Sometimes during development, it is necessary to create new API for your application. The Finsemble seed project already includes a server to host files locally for development, so it makes sense to use this server to design the new API. To allow for the extension of the server provided in the Finsemble seed project without breaking the upgrade path, the server attempts to import the _server-extensions.js_ file from the _server_ directory of the project. If _server-extensions.js_ exists, it's methods are called by the server to provide additional functionality. The _server-extensions.js_ file should return an object that contains the following functions:
- `pre` - called before _server.js_ starts defining the default server functionality
- `post` - called after the server is up and running
- `updateServer` - called after the default server functionality has been defined, but before the server is started

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
        pre: done => { console.log("pre server startup"); done(); },

        /**
         * Method called after the server has started.
         * 
         * @param done Function used to signal when pre function has finished. Can optionally pass an error message if 
         * one occurs.
         */
        post: done => { console.log("post server startup"); done(); },

        /**
         * Method called to update the server.
         * 
         * @param {express} app The express server.
         * @param {function} cb The function to call once you're finished adding functionality to the server. Can optionally 
         * pass an error message if one occurs.
         */
        updateServer: (app, cb) => { console.log("modifying server"); cb(); }
    }
})(module);
```

## Upgrade instructions

Upgrading the seed project should be straightforward. If you have made changes to _gulpfile.js_ or to _server/server.js_, you will need to move your changes to the appropriate extensions file. Aside from that, you can copy your _src_ folder, _webpack.files.entries.json_, and the contents of _configs/application_ to the new seed structure. It is recommended to remove the folders from _src/components_ you did not create or extend in order to use the latest presentation components. You should also remove the components provided with Finsemble from _build/webpack/webpack.files.entries.json_ and _configs/application/components.json_. 
