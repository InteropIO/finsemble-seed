# Finsemble

Finsemble is a framework for building seamless HTML5 desktop applications. A Finsemble application is composed of HTML5 and Javascript web pages running inside of OpenFin windows.

For information on getting started, visit https://documentation.chartiq.com/finsemble/tutorial-gettingFinsemble.html

*Note: The first time you run the sample app, Finsemble will download required assets including the OpenFin Runtime. This may take a few minutes if you are on a slow Internet connection.*

## Hotreload

We've added the ability to hotreload your Finsemble components! Through webpack, we've added middlewware to the component/client build process that allows your changes to appear instantly.

Our hotereload middleware, located at `server/hotreloadmiddleware` listens for updates to your webpacked files and emits those changes to our client side middleware which handles the reloading of your components. Hotreload has two options for emitting the updates, `http` and `websockets`. Since web browsers have a maximum number of http client connections for a single domain, we default to using websockets.(Finsemble is a mutli-window framework and treats every window as a seperate browser tab each having their own connections to your server).

In your dev environments, we handle the full build process and attach the required middleware inside of `server/dev/hoteload.js`. This file grabs all of your webpack files located at `build/webpack/` and builds them and then <b>stores them in memory<b>.

`path.resolve(__dirname, '../../server/hotreloadmiddleware/client') + '?reload=true&sockets=true`

We've made adding your components/applications easy `webpack.files.entries.json` for your entries and `build/webpack/webpack.files.js` handles the build.

 There are three configs inside of `build/webpack/webpack.files.js` that control how we use hotreload:

* `enableHMR` -  This enable hotreload for you components.
* `HMRBlacklist` - An array of entries that will be skipped hotreload.
* `HMRWhitelist` -  An array of entries to hotreload.

*This currently does not work on services.*
