# Migration Instructions For Version 2.3
Follow these steps to migrate to version 2.3 of the Finsemble seed project. After following these steps, you will have a new project directory that is side-by-side with your original project's root directory (i.e., *finsemble-seed*). Nothing here will touch your existing application.

1. Clone the Finsemble seed project from the master branch and put the directory into the same **parent** folder as your existing project.
2. In your new directory, use a command prompt to run `>npm install`. (Skip this step if you received a zip directly from ChartIQ. That zip will already contain node_modules.)
3. Go to the folder *finsemble-seed/migration/2.3/migrationScripts* and modify *config.js* so that the value of `OLD_PROJECT_ROOT` points to your existing project's folder.
4. Use a command prompt to run `>npm run migrate`. This moves all of Finsemble's built-in components (the ones that came with the seed) to the folder *finsemble-seed/src-built-in*.
5. Delete all components from the *finsemble-seed/src* directory **except** for any component that you created **or** any built-in components that you have modified, such as the toolbar.
6. Go to the folder *finsemble-seed/build/webpack* and open *webpack.components.entries.json* in an editor. Remove the entries for all components that you have not created or modified. **Be careful not to delete presentation assets if you have modified built-in components, such as the toolbar**

* If you have made changes to _gulpfile.js_ or to _server/server.js_, you will need to manually move your changes to the appropriate extensions file. ([See here for more info](../../README.md)).

* If you've created new OpenFin manifests for other environments you should manually modify them to match the updated *config/openfin/manifest.local.json*. Notably, `--framestrategy=frames` was added to the runtime arguments.

7. Do a diff of package.json from the new seed to your old seed. Any npm packages that you added will need to be moved over to your new project.
8. Use a command prompt to run `>npm run dev` in your new directory. Make sure everything works as expected!

You now should have a fully functional application that includes any components and customizations from your old project. **Once you've confirmed that everything is working as expected** you can copy this new directory over your original project's root directory and continue developing as normal.
