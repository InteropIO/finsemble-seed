## Multi-window WebApp Adaption Recipe 
This recipe provides an example of how to adapt a multi-window webapp, that uses 
the same-origin policy and window objects returned by `window.open()`, to Finsemble.

The recipe is based on supplying preloads, that override functionality within the
adapted application, in order to replicate functionality that was implemented via
the window Object as this is not supported in Finsemble (due to the security model).
Such functionality includes the setting of variables or event handlers within the 
child window scope to send and receive data. These are replaced with the Finsemble 
Launcher API's ability to send spawnData to window and routerClient calls to 
transmit data back.

### Files
* *config.json:* Component configurations (which are imported in /configs/applicaiton/config.json)
* *index.html:* Example parent window
* *child.html:* Example popup window
* *parent-preload.js:* Preload applied to the parent window to replace window.open calls and functions to receive returned data.
* *child-preload.js*
* */build/webpack/webpack.preloads.entries.json:* Modified build entries file to ensure preloads are built

### Testing
Build and run this branch of the seed project:
`>npm install`
`>npm run dev`

Then test the example in your web browser by visiting:
http://localhost:3375/components/multiWindowAppExample/index.html

Then spawn the component from the launcher menu in Finsemble and repeat the test
