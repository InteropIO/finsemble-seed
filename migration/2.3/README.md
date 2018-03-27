# Instructions
To migrate to the latest version of the Finsemble seed project, follow these steps:
1. Clone the finsemble seed from master; put this into the same parent folder as your existing project.
2. run `npm install`. If you do not have npm access, contact your sales-engineer and we will provide a zip of all of the modules.
3. Modify migration/2.3/migrationScripts/config.js so that `OLD_PROJECT_ROOT` points to your existing project.
4. Run `npm run migrate`.
5. Remove any components from src/components (and webpack.components.js) that you have not modified. By removing these components, the components inside of `src-built-in` will be what's loaded in your application.
6. When everything works well, everything from the 2.3 seed that you cloned back into your existing project.

**Note** Any server or gulpfile modifications that you may have made will need to be manually merged in. See the README in the root of the 2.3 seed for an explanation of the new `extensions` files.