# Extending _gulpfile.js_

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