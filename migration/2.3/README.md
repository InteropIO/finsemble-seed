# Instructions
To migrate to the latest version of the Finsemble seed project, follow these steps:
1. Unzip the migration folder provided by ChartIQ into the root of your finsemble project.
2. From the root of that project, run the following command:
```javascript
node migration/2.3/migrationScripts/migrate.js
```
3. This may take several minutes, mostly because we will have to copy the node_modules into your project. While it's running, feel free to read the notes below.

## Notes on the new seed organization
* `src-built-in`. This is the folder that ChartIQ presentation components will live. Now, as we add features to our presentation components, you won't have to worry about manually merging _every_ component that we provide as a sample. Instead, you will only need to manually merge the components that you have modified.
* `extensions` files. In both the server, and gulpfile, we have created the ability to extend the functionality that comes out of the box with the finsemble-seed. Instead of dealing with messy merge conflicts, you will put extra functionality that you need inside of `server-extensions` and `gulpfile-extensions`.
* Build. The build folder is a little different in this release. Before, built-in components and your components were housed in the same webpack entries file. Now, built-in components have their own entry file (`build/webpack/webpack.finsemble-built-in.entries.json`). `build/webpack/webpack.files.entries.json` will now house all of the components that you create. Any component that you copy from `src-built-in` into `src` (and from `webpack.finsemble-built-in.entries.json` into `webpack.files.entries.json`) will overwrite what we provide out of the box.
* Configs. @ANDY, CAN YOU WRITE SOMETHING HERE ABOUT THE NEW DEFAULT CONFIGS FOLDER??

## Post-script Steps
1. Comb through your `src/components` directory, and remove any presentation component that you have not modified. Also remove this from `build/webpack/webpack.files.entries.json`.
2. Enjoy the powahhhhh and speeeeeed.

