# Instructions
To migrate to the latest version of the Finsemble seed project, follow these steps:
1. Clone the finsemble seed from master; put this into the same parent folder as your existing project.
2. run `npm install`. Please skip this step if you received a zip directly from ChartIQ. That zip will already contain node_modules.
3. Modify migration/2.3/migrationScripts/config.js so that the value of `OLD_PROJECT_ROOT` points to your existing project's folder.
4. Run `npm run migrate`.

When everything works well, you can copy everything from the 2.3 seed back into your existing project's root directory.
Upgrading the seed project should be straightforward. If you have made changes to _gulpfile.js_ or to _server/server.js_, you will need to move your changes to the appropriate extensions file [see here for more](../../README.md). It is recommended that you remove the folders from _src/components_ you did not create or extend in order to use the latest presentation components. If you have not modified the components provided from finsemble, you should remove them from _build/webpack/webpack.components.entries.json_ and _configs/application/components.json_.

