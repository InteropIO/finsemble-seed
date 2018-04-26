/**
 * This file allows you to customize the Finsemble build behavior which runs through gulpfile.js.
 * You can do three things:
 * 1) Run code before a normal gulp task (PRE)
 * 2) Modify or add code that is called within a gulp task (CODE)
 * 3) Override or add new gulp tasks (TASKS)
 * 
 * See comments in each section to understand how to complete your desired customization.
 * 
 * Once completed, rename this file gulpfile-extensions.js. The Finsemble build process will then begin
 * processing this file during builds.
 */
module.exports = taskMethods => {
    "use strict";

    const gulp = require("gulp");

    /** -------------------------------------- PRE ----------------------------------------
	  * You can use this section to run code that should execute *before* any gulp tasks run.
	  * For instance, if you need to spin up a server or run a shell command, do it here.
	  */
	let preOriginal = taskMethods.pre
	taskMethods.pre = (done) => {
		preOriginal(() => { // Call the built-in tasks from gulpfile.js
			// <------  Put your code to run "pre" tasks here
			done();
		});
	};

	/** --------------------------------------- CODE -------------------------------------
	 * Add or override any internal methods used by gulp tasks (a gulp task for instance would be "build" or "dev", called with npm run dev)
	 * 
	 * We've included overrides for a few common tasks
	 */

	 // Extend copyStaticFiles to do more stuff, for instance if you need to copy other stuff to dist
	/*
	let copyStaticFilesOriginal = taskMethods.copyStaticFiles
	taskMethods.copyStaticFiles = (done) => {
		
		copyStaticFilesOriginal().on("end", // Execute the original function, which, in this case, returns a stream.
			() => {
				// <------- Put code here that you want to be called after the original copyStaticFiles task

				done(); // Execute callback to signal completion.
		});
	};
	*/
	
	// Add SASS compilation. You'll need to add gulp-sass and sass-loader to your package.json
	/*
	taskMethods.buildSass = () => {
		if (!sass) sass = require("gulp-sass");
		const source = [
			path.join(srcPath, "components", "**", "*.scss"),
			path.join(__dirname, "src-built-in", "components", "**", "*.scss"),
		];

		return gulp
			.src(source)
			.pipe(sass().on("error", sass.logError))
	};
	*/

	/** ---------------------------------------- TASKS ----------------------------------------------
	 * Here is where you can override the actual gulp tasks. For instance, npm run dev, npm run build, etc.
	 * You'll find these all in the "defineTasks" section in gulpfile.js.
	 * 
	 * To run new tasks from the command line you will also need to add them to your package.json. For instance
	 * the task "myTask" below would require a new line in package.json in the scripts section. Alternatively,
	 * you can install gulp globally and run directly with gulp.
	 * 
	 * For information on configuring gulp tasks:
	 * https://github.com/gulpjs/gulp/blob/master/docs/API.md#gulptaskname-fn
	 * 
	 */
   taskMethods.post = (done) => {

		// Example, add a new gulp task that first calls the built in "build" task and then does something of your choosing
		/*
		gulp.task("myTask", gulp.series("build"), function (done) {
			// do something
			done();
		});
		*/

		// Example of how to redefine the built in build task. Note that all of the built in npm run commands use "build"
		/*
		 gulp.task("build", gulp.series(
				"clean",
				taskMethods.copyStaticFiles,
				taskMethods.buildWebpack,
				taskMethods.buildSass
			)
		);
		*/

		done();
	}
};