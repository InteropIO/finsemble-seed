# Instructions
To migrate to the latest version of the Finsemble seed project, follow these steps:
1. Unzip the migration folder provided by ChartIQ into the root of your finsemble project.
2. From the root of that project, run the following command:
```javascript
node migration/2.3/migrationScripts/migrate.js
```
3. This may take several minutes, mostly because we will have to copy the node_modules into your project. While it's running, feel free to read the notes below.

## Post-script Steps
1. Comb through your `src/components` directory, and remove any presentation component that you have not modified. Also remove this from `build/webpack/webpack.files.entries.json`.
2. Enjoy the powahhhhh and speeeeeed.

