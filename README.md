# Finsemble Sample Seed Project

[Finsemble](https://www.chartiq.com/finsemble/) is a framework for building multi-window, multi-monitor HTML5 desktop applications. This seed project is a starting point for building a Finsemble Application. It contains a sample toolbar, menus and other UI components to help you quickly build your own applications.

Visit the [Finsemble Documentation](https://documentation.chartiq.com/finsemble/) for more information.

*Note: The first time you run the sample app, Finsemble will download required assets including the OpenFin Runtime. This may take a few minutes if you are on a slow Internet connection.*

## Getting Started

### Get Access to Finsemble

Finsemble is an [NPM](https://www.npmjs.com/) module kept in a private NPM repository. In order to install the Finsemble framework, you will need access to our private NPM repository. If you would like access to our private NPM repository, please [schedule a demonstration](https://tracking.cirrusinsight.com/5e7c2f35-3079-4fa5-b30d-5f959880cffe/chartiq-com-products-finsemble). We'll help you get started down the right path.

### Installation

** Note :** We recommend using "bash" for Windows instead of the standard windows command line. Bash is a little better than the Windows command line (particularly on Windows 7). [Git for Windows]((https://git-scm.com/downloads)) includes Bash. Here is a [standalone version of Bash](https://sourceforge.net/projects/win-bash/files/shell-complete/latest/).

Open a command prompt or Bash and change to the directory in which you have cloned this repository. Then run:

`> npm login`

You will be prompted for the username and password.

`> npm install`

The Finsemble Framework and other dependencies will now install. Note that this installs the framework into the "node-modules/@chartiq" directory of your seed project (your current directory).

`> npm install -g @chartiq/finsemble-cli`

This installs the command line interface (CLI). The CLI provides convenience tools for common tasks such as adding and removing components, clients, and microservices.

### Building The Seed Project

To build and run the sample application:

`> npm run dev`

This starts up the "dev runner" which is responsible for building, watching, and launching your application. The first time you run this command, assets will be downloaded. These assets include the OpenFin runtime environment. It may take some time for this to download. For a more in-depth discussion of what's happening in the build process, see the [The Finsemble Build Process](https://documentation.chartiq.com/finsemble/tutorial-theFinsembleBuildProcess.html) overview.

Once the assets are downloaded, the sample application will start. By default the sample application launches with one window showing a documentation page. There are two components that are required by Finsemble, which are in the `src\components\src` folder, the "Docking Move Mask" (dockingGroupMask) and our Window Title Bar (windowTitleBar).

### Quitting Finsemble

Press Ctrl-C in your command prompt to quit Finsemble. Once you have the sample components, you can look at the File Menu component for an example or quitting via the UI. During development, if you have hung node or OpenFin processes, those can be killed using:

`finsemble-cli kill`

### Sample System Components

To get the sample system components to work:
1. Copy the contents of the `src\samples` folder into the `src\components` folder.
2. The samples include a configuration file. To make sure sure this config gets imported into finsemble, add it to the `configs\application\config.json` to the importConfig Section:
	```
	{
		...
		"importConfig": [
			"$applicationRoot/configs/application/components.json",
			"$applicationRoot/components/sampleComponents.json"
		]
	}
	```
3. Copy `src\components\samples\build\webpack.files.entries.json` to `build\webpack` to add all the components to the build process.

Once you have done this, quit and rebuild and run Finsemble again. You will see a toolbar appear at the top of the screen. From the toolbar you can launch other sample components including our Workspace Management Menu, File Menu and App Launcher.

### Your First Component

See our [Step by Step Tutorial](https://documentation.chartiq.com/finsemble/tutorial-buildAnAppStepByStep.html) to get started on building your own Finsemble application.

### Configuring Hot-Reload

We've added the ability to hotreload your Finsemble components! Through webpack, we've added middlewware to the component/client build process that allows your changes to appear instantly.

Our hotereload middleware, located at `server/hotreloadmiddleware` listens for updates to your webpacked files and emits those changes to our client side middleware which handles the reloading of your components. Hotreload has two options for emitting the updates, `http` and `websockets`. Since web browsers have a maximum number of http client connections for a single domain, we default to using websockets.(Finsemble is a mutli-window framework and treats every window as a seperate browser tab each having their own connections to your server).

In your dev environments, we handle the full build process and attach the required middleware inside of `server/dev/hoteload.js`. This file grabs all of your webpack files located at `build/webpack/` and builds them and then <b>stores them in memory<b>.

`path.resolve(__dirname, '../../server/hotreloadmiddleware/client') + '?reload=true&sockets=true`

We've made adding your components/applications easy `webpack.files.entries.json` for your entries and `build/webpack/webpack.files.js` handles the build.

 There are three configs inside of `build/webpack/webpack.files.js` that control how we use hotreload:

* `enableHMR` -  This enable hotreload for you components.
* `HMRBlacklist` - An array of entries that will be skipped hotreload.
* `HMRWhitelist` -  An array of entries to hotreload.

*This does not work on services.*
