# Instructions

## ChartIQ
1. First, we need to build the migration folder that will be sent to the client. Make sure you're on the 2.3 tag in the seed. Then, run the following command from the root of the finsemble-seed. This will take 5+ minutes (copying node_modules is slow).

```javascript
rm -rf node_modules && npm install && node migration/2.3/migrationScripts/buildFolder.js
```

2. Next, zip the entire migration folder, and send to the client.

After that command, reset your branch to the origin (github).

## Client
1. Unzip the migration folder provided by ChartIQ into the root of your finsemble project.
2. From the root of that project, run the following command:
```javascript
node migration/2.3/migrationScripts/migrate.js
```
3. This may take several minutes, mostly because we will have to copy the node_modules into your project. While it's running, feel free to read the notes below.

## Notes on the new seed organization
* `src-built-in`. This is the folder that ChartIQ presentation components will live. Now, as we add features to our presentation components, you won't have to worry about manually merging _every_ component that we provide as a sample. Instead, you will only need to manually merge the components that you have modified.

## Post-script Steps
1. Comb through your `src/components` directory, and remove any presentation component that you have not modified. Also remove this from `build/webpack/webpack.files.entries.json`.
2. Enjoy the powahhhhh and speeeeeed.

# ChartIQ Testing
1. Pull down the `reorg2` branch from github (finsemble-seed).
2. `rm -rf node_modules && npm install`.
3. Run through the "ChartIQ steps, above.
4. Check out `master` from github (finsemble-seed).
5. `rm -rf node_modules && npm install`. This will clear your node modules and install them fresh, as though master was what you've been running forever.
6. Run through the client steps.

Helpful script, after running the migration in master
```bash
rm -rf *-original && rm -rf src-built-in/ && rm -rf build/webpack/*vendor* && rm -rf build/webpack/webpack.finsemble-built-in.entries.json  && rm -rf .*cache && rm gulpfile.js.original rm -rf migration/
```