# Migration Instructions For Version 2.3
Follow these steps to migrate to version 2.3 of the Finsemble seed project. After following these steps, you will have a new project directory that is side-by-side with your original project's root directory (i.e. finsemble-seed). Nothing here will touch your existing application:
1. Clone the finsemble seed from master (put this into the same *parent* folder as your existing project).
2. In your new directory, run `npm install`. (Skip this step if you received a zip directly from ChartIQ. That zip will already contain node_modules.)
3. Modify `migration/2.3/migrationScripts/config.js` so that the value of `OLD_PROJECT_ROOT` points to your existing project's folder.
4. Run `npm run migrate`.
5. Finsemble's built in components (the ones that came with the seed) are now located in src-built-in. Delete all of these components from the src directory except for any that you created **or any built-in components that you have modified such as the toolbar**.
6. Open up `build/webpack/webpack.components.entries.json` in an editor and remove the entries for all components that you have not created or modified. **Be careful not to delete components/assets if you have modified any built-in components, such as the toolbar**
7. Run `npm run dev` in your new directory Make sure everything works as expected! Note that we haven't touched


* If you have made changes to _gulpfile.js_ or to _server/server.js_, you will need to manually move your changes to the appropriate extensions file. ([see here for more](../../README.md)).

* If you've created new openfin manifests for other environments you should manually modify them to match the updated config/openfin/manifest.local.json (notably, `--framestrategy=frames` was added to the runtime arguments)

You now should have a fully functional application that includes any components and customizations from your old projet. **Once you've confirmed that everything is working as expected** you can copy this new directory over your original project's root directory and continue developing as normal.
