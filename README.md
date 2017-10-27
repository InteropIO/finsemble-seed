# Finsemble

Finsemble is a framework for building seamless HTML5 desktop applications. A Finsemble application is composed of HTML5 and Javascript web pages running inside of OpenFin windows.

For information on getting started, visit https://documentation.chartiq.com/finsemble/tutorial-gettingFinsemble.html

*Note: The first time you run the sample app, Finsemble will download required assets including the OpenFin Runtime. This may take a few minutes if you are on a slow Internet connection.*

## Hot Reload

We've added the ability to hot reload your Finsemble components! Through webpack, we've added middlewware to the component/client build process that allows your changes to appear instantly. Files that are built by webpack (e.g., Javascript files, SASS files, or any required files), will be hot reloaded immediately after a file changes. HTML and CSS files, which aren't built by webpack, will immediately have their modified files copied to the `dist` directory, but will not show up in the component until reloaded (e.g. right-click reload or ctrl-r).

We use `webpack-dev-middleware` to handle the webpack build process.

Our hot reload middleware, located at `server/hotreloadmiddleware` listens for updates to your webpacked files and emits those changes to our client side middleware; from there, we reload your components. Hotreload has two options for emitting the updates, `http` and `websockets`. Since web browsers have a maximum number of http client connections for a single domain, we default to using websockets.(Finsemble is a mutli-window framework and treats every window as a seperate browser tab, each having their own connections to your server).

In your dev environment, we handle the full build process and attach the required middleware inside of `server/dev/hoteload.js`. This file grabs all of your webpack files located at `build/webpack/`, builds them, and then <b>stores them in memory</b>.

We've made adding your components/applications easy with `webpack.files.entries.json` for your entries. `build/webpack/webpack.files.js` constructs the webpack file.

The format for your entry in the `webpack.files.entries.json` should look like:

```
{
"name": {
        "output": "path/to/output",
        "entry": "./src/components/location/of/component(.js/.jsx/...)"
    }
}
```


If you wanted to add our middleware to your own webpack file you need to add two things:

* `path.resolve(__dirname, '../../server/hotreloadmiddleware/client')' + '?reload=true&sockets=true` to the entry.
* `new webpack.NoEmitOnErrorsPlugin()` and `new webpack.HotModuleReplacementPlugin()` to the webpack plugins.


 There are three configs inside of `build/webpack/webpack.files.js` that control how we use hotreload:

* `enableHMR` -  This enables hotreload for you components.
* `HMRBlacklist` - An array of entries that will be skip hotreload.
* `HMRWhitelist` -  An array of entries to hotreload.

*This currently does not work on services or configs.*
