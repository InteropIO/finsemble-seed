For everything you need to know about the seed project, including a step-by-step process, check out the documentation on our [website](https://documentation.chartiq.com/finsemble/tutorial-gettingStarted.html).

TODO: Update tutorials to point to _tutorials_ folder at the top level
TODO: Move creating of components to tutorials and have URL to point to CSS

# Finsemble Seed Project

TODO: Article overview goes here

- (Project structure)[#project-structure]
- (Extending _gulpfile.js_)[#extending-gulpfile-js]
- (Extending server functionality)[#extending-server-functionality]
- (Upgrade instructions)[#upgrade-instructions]

## Project structure

TODO: project structure description goes here
```
TODO: Folder structure tree
```

## Extending _gulpfile.js_

It is often necessary to modify and extend the functionality provided by the gulpfile in the seed project. This can be done by editing the gulpfile directly but, doing this, complicates the upgrade path because modifications would need to be merged into the updated gulpfile. If you need to modify or extend the functionality provided by the gulpfile, please create a _gulpfile-extensions.js_ file at the same level as the _gulpfile.js_. This file should define a function that takes in the object containing all of the methods called by the gulpfile, including `pre` and `post` methods that can be used to redefine variables and add additional tasks.

These are the methods defined in the `taskMethods` object:
- `buildSass` - Builds the SASS for the application.
- `buildWebpack` - Performs the webpack build for the application.
- `clean` - Cleans the project folder (deletes _dist_).
- `copyStaticFiles` - Copies static files to the _dist_ folder.
- `launchApplication` - Launches the Finsemble application.
- `post` - Called after all of the tasks have been defined.
- `pre` - Called before all of the tasks have been defeined.
- `startServer` - Starts the server based on `NODE_ENV` environment variable ("dev" or "prod").
- `watchFiles` - Watches files for changes to kick off `buildSASS` or `buildWebpack`.

These are the tasks defined in _gulpfile.js_:
- `clean` - Cleans the project directory (calls the `clean` method).
- `build` - Builds the application in the distribution directory (calls "clean" task and, `copyStaticFiles`, `buildWebpack` and `buildSASS` functions).
- `prod` - Builds the application and starts the server to host it (calls the "build" task then the `startServer` function).
- `prod:run` - Builds the application, starts the server and launches the Finsemble application (calls the "prod" task then `launchApplication`).
- `dev:run` - Builds the application, starts the server, launches the Finsemble application and watches for file changes (calls "prod:run" task then the `watchFiles` function).
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

Sometimes during development, it is necessary to create new API your application requires. The Finsemble seed project already includes a server to host files locally for development, so it makes sense to use this server to design the API required by your application. To allow for extension of the server provided in the Finsemble seed project, without breaking the upgrade path, the server attempts to import the _server-extensions.js_ file from the _server_ directory of the project. If _server-extensions.js_ exists, it's methods are called by the server to provide additional functionality. The _server-extensions.js_ file should return an object that contains the following functions:
- `pre` - called before _server.js_ starts defining the default server functionality
- `post` - called after the server is up and running
- `updateServer` - called after the default server functionality has been defined, but before the server is started

The `pre` and `post` functions do not take any arguments. The `updateServer` function takes two arguments, the first is an instance of the [Express server](https://www.npmjs.com/package/express) that can be used to add functionality, and the second is a callback, that takes not arguments, that must be called when the server is ready to be started. Please see the sample _server-extensions.js_ below:
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
         * @param {function} cb The function to call once finished adding functionality to the server. Can optionally 
         * pass an error message if one occurs.
         */
        updateServer: (app, cb) => { console.log("modifying server"); cb(); }
    }
})(module);
```

## Upgrade instructions

TODO: Write section on upgrading from previous seed project