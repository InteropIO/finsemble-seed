
# Finsemble Seed for io.Connect Desktop 🌱

This version of the Finsemble Seed project is compatible with IO.Connect Desktop (iocd) version [**9.6.0.2**](https://interop.io/download/?path=/install/enterprise/finsemble-9.6/stable-offline/9.6.0.2/ioConnectDesktopInstaller&type=b) (or [download zip bundle](https://install.interop.io/install/enterprise/citi-9.6/stable/9.6.0.1/ioConnectDesktopBundle.zip)). It also continues to support the legacy Finsemble container (FEA). With this seed version you can run your Finsemble project against either container.

> _This is a Beta. Not all features are working yet. See below for details._

> _Customers wishing to work directly with iocd instead of finsemble-seed should read [IOCD quickstart](./docs/iocd-quickstart.md)_

## Installing

1) In order to run the Beta you must first install io.Connect Desktop from the above link. The desktop installer that you will eventually deliver to your end users will be iocd + your finsemble project + any new iocd customizations that you implement.

2) Update your package.json:
    a) Change `@finsemble/finsemble-core` entry to match the version in this branch.
    b) Copy the `iocd` and `dev-iocd` scripts from this branch.
    c) Copy the "io-connect" subdirectory from this branch into your project.
    d) Run `yarn install`.

## Upgrading from a previous beta version

1) Delete your yarn.lock or package-lock.json file (important!)
2) Update the `@finsemble/finsemble-core` version in package.json
3) Merge the "io-connect" subdirectory (Likely there will be minimal or no changes)
4) Run `yarn install`

## Running

`yarn iocd` - Launch your project using the io.Connect Desktop (iocd) container.

`yarn start` - Launch your project using the legacy FEA container.

Or, `yarn dev-iocd` vs `yarn dev`, which will build your project and launch the container in a single command.

## Documentation

[io.Connect Desktop Documentation](https://docs.interop.io/)

[Finsemble Documentation](https://documentation.finsemble.com/)

## Beta Details

The purpose of this beta is so that you can get a sense for how your project will perform when running under iocd. Please provide us with notes on anything that doesn't function correctly or any other general feedback by sending an email to support@finsemble.com.

> Note: You can launch io.Connect Desktop from the start menu, but _it will only run your seed project when you launch using `yarn iocd` or `yarn dev-iocd`._

### Terminology changes

"Workspaces" -> "Layouts" - In iocd, a "global layout" refers to the arrangement of windows and their data context which may be saved/restored and saved by name. The term "workspace" now refers to aggregated groups of windows, a [new feature](https://docs.interop.io/desktop/capabilities/windows/workspaces/overview/index.html).

"Toolbar" ~= "Launcher" - In iocd, toolbars are sometimes referred to as launchers. The Finsemble Toolbar is compatible with iocd but a new, more powerful launcher will be available in an upcoming release.

### What is working?

- FSBL API should be fully functional.
- The io.Connect Desktop API is fully functional. You can `import * from "@interopio/desktop"` in your apps, or you can use `window.iop` to test the API (please do not build code that relies on iop because this will not be a permanent feature).
- FDC3 is fully functional (`window.fdc3` object).
- Toolbar, dialogs, and system tray are fully functional. If you've customized these components then your customizations should be functional.
- Window operations such as tabbing and grouping
- Apps specified in apps.json or loaded using any FSBL API will work as expected
- Authentication (SSO) should be fully functional, including "dynamic config" (loading apps based on user login)
- Your theming/CSS customization should be fully functional.
- Generating installers
- .NET is now available with the beta. Use the latest finsemble.dll with "iocd" tag. With this new beta DLL, your .NET apps will automatically be compatible with both the new platform and with legacy Finsemble. They will attempt to connect to iocd first, and if they cannot connect within 5 seconds then they will instead connect to any running Finsemble instance.
- Data migration of workspaces is working from Finsemble storage adapters to the polyfill. It is not yet saving back to the storage adapters. Preferences is not yet implemented.

### What will you need to change?

- Finsemble's NotificationsCenter and NotificationsToasts components will no longer be supported under iocd. To customize notifications, enable the single component "Notifications" (`yarn template Notifications`) which will enable a single app that renders both toasts and panel. You can then re-implement any customizations using iocd's ["extending notifications"](https://docs.interop.io/desktop/capabilities/notifications/overview/index.html#extending_notifications) capabilities.
- The WindowTitleBar component will no longer be supported under iocd (which uses a different windowing paradigm than Finsemble). If you've customized the WindowTitleBar then you will need to re-implement those changes using the new DecoratorWindow template (`yarn template DecoratorWindow`). This uses iocd's ["extensible web groups"](https://docs.interop.io/desktop/capabilities/windows/window-management/overview/index.html#extending_web_groups).
- The advanced app launcher is functional but if you've customized any of the underlying code then it may need to be re-implemented. Please check and let us know if you find anything not functioning.
- Your splash screen image may be smaller on io.CD than it was on Finsemble. This is due to how the two systems interpret screen resolution. You'll need to create a larger image if this is a concern. Please note that io.CD now supports [_interactive_](https://docs.interop.io/desktop/getting-started/how-to/rebrand-io-connect/user-interface/index.html#splash_screen) splash screens. You can see an example of this behavior when you run the copy of io.CD that we provided. [see installer section below](#creating-installers-for-your-end-users)
- Your installed icon may be rendered smaller than expected. To solve this problem you can create a 128x128 icon and save it as io-connect/installer/assets/icon.ico. [see installer section below](#creating-installers-for-your-end-users)
- io.CD does not support moving images on the installer dialog. You may need to create a static image and you may need to resize that image in order to have the best appearance. You can save such an image to io-connect/installer/assets/banner.gif which will override the default installer image.
- launchExternalProcess() has been removed. If you are using this feature then you can now achieve the same thing by adding an app config for your external app and simply launching it with spawn() or with the io.CD appManager API.
- Storage adapters will continue to work as expected with some caveats. Importing clients from @finsemble/finsemble-core will no longer work! For instance, this was a common approach that is now defunct:

    ```
    const { Logger, ConfigClient } = require("@finsemble/finsemble-core").Clients;
    ConfigClient.initialize();
    ```
    Instead, _storage adapters must now use FSBL.Clients on the global window object just like other applications_.

    The `baseName` is still available on the `this` object of a storage adapter. This is set to the value of `start_app.uuid` in the manifest, defaulting to "Finsemble" if it doesn't exist. If you've used this pattern:

    ```
    this.getCombinedKey = function(e, t) {
          return `${e.baseName}:${e.userName}:${t.topic}:${t.key}`
    }
    ```

    Then change to using `this.baseName`.

    - See this [module pattern storage adapter](#storage-adapter-example) if you would like to simplify your implementation.

- formGroup() and ejectFromGroup() are no longer supported. Please use the io.CD snap(), createGroup(), and ungroup() functions if you need programmatic control over groups.

- isAlwaysOnTop() is no longer available.

- If you have a visible authentication component (login) then you should remove the close button because io.CD now automatically provides a close button as an overlay icon.

- .NET apps are now tabbable & groupable, but this means that their titlebars are replaced with iocd's titlebar. If you do not want this behavior (for instance, if you are running apps with custom titlebars), then register you finsemble.dll with null as the second argument: `new Finsemble(args, null)`. The window will no longer be tabbable or groupable, but it will be able to use the iocd API.

#### <a name="dot_net_breaking_changes">.NET Breaking changes</a>

- DragAndDrop, LinkerClient, TitlebarService, WPFWindowTitleBar (titlebar control), and SystemManagerClient have been removed.
- The WPFWindowTitleBar is no longer necessary because io.CD provides a titlebar for .NET windows. You should remove this control from your code because it no longer functions (to customize titlebars use `yarn template DecoratorWindow` and see instructions in the template that is created.)
    - When you remove the control, also undo the related changes in your WPF xaml file:
        - remove the link to `headerControl`
        - remove `WindowStyle` setting
        - remove `AllowsTransparency` setting
- The ChartIQ.Finsemble.* namespace has been deprecated. Use InteropIO.* instead. (Classes from ChartIQ.Finsemble have been deprecated too, but not removed.)
- Some previously deprecated functions have been removed. They are:
    - WindowClient: GetSpawnData, GetComponentState, IsAlwaysOnTop, currentWindowState
    - ConfigClient: GetValue, SetValue
    - SearchClient: InvokeItemAction
- MultiWindow apps require additional argument for child windows. Before create a Finsemble instance for child window please update arguments like in example below. Important, the code should be called in the child app process.
```c#
var rco = InteropIO.Util.Util.GetRemoteConfigurationOptions();
if (rco != null)
{
	var newArgs = args.ToList();
	newArgs.Add(rco);
	args = newArgs.ToArray();
}
```

.NET applications should only use iocd API to position windows after they have connected. Using the native API to position windows worked in Finsemble, but will not work in iocd. This is because iocd wraps native windows, and any positioning of native window after they have been wrapped will result in the window moving _within_ the wrap instead of on the screen. If, for some reason, you are not able to change the native app to use iocd API for window positioning, you can opt out of iocd control, by passing `disableIOCDWindowRegistration=true` in the app's arguments. When run in Finsemble, the window will be controlled by Finsemble as it was before, but iocd will not control the window position. When running in iocd with this flag, you will be responsible for saving the window's position. You can use the `IsIOCDConnected` property on the Finsemble object to determine whether the app is connected to iocd and needs to save the its position.

### What is not working?

- Worksheets and security lookup are not yet functional in the Bloomberg Adapter.
- Window tiling is not yet available. You can tile into iocd "Workspaces" which are a [powerful new feature](https://docs.interop.io/desktop/capabilities/windows/workspaces/overview/index.html).
- Linker channels cannot be linked to multiple channels

### What is different?

- Mac is not currently supported (in production or development.)

- Windowing behavior is different in iocd than on legacy Finsemble. When windows are snapped together they now form a group which can be maximized and which responds to Microsoft Window snapping and aero commands. These groups contain an extra titlebar (which can optionally be disabled but which provides more intuitive maximization.)

- iocd is located in `AppData/local/interop.io/io.Connect Desktop`. The `UserData` subdirectory contains log files and other information. The `Cache` directory contains Chromium cache. The `Desktop\config` and `Desktop\assets` folders contain system information.

- An "io-connect" subdirectory in your project will contain configurations specific to io.Connect Desktop. After running `yarn iocd` several subdirectories will be created under io-connect. This contains iocd config files `system.json` and `stickywindows.json`. You can add any iocd config to these files. See [these schemas](https://docs.interop.io/desktop/developers/configuration/overview/index.html) for more information on available switches.

    Please note that these files are generated only once. Changes to Finsemble's config.json that are made after generating these files will not be picked up. If you delete system.json, then it will be regenerated with the new changes (but remember to reapply any customizations that you previously made).

    You may also request that any configuration be made _permanent_ for your company. We provide a service to maintain these config files for you, so that you don't have to worry about merging locally. The version of io.CD that we provide to you will then come pre-configured with this config.

    To prevent Finsemble from merging a file from the io-connect folder, simply modify it to contain an empty `{}`.

- An `iop` global will be available on the window object to test the new API.

- Some additional CSS styles have been added to theme.css to customized new window elements. These all begin with --t42 or --g42.

- The central logger is available and functional. The central logger will no longer contain system logs. System logs are available in application.log on the filesystem.

- Your FDC3/Finsemble app configs will be automatically converted to [io.CD's format](https://docs.interop.io/desktop/assets/configuration/application.json). You can now optionally add a `hostManifests.[io.Connect]` entry in addition to your `hostManifests.Finsemble` entry. The values from this entry will override any converted values. You may also use this additional host manifest to configure any io.CD feature. Finally, if you want to bypass all conversion, create this new entry and remove the `hostManifests.Finsemble` entry. (Please note that this will also bypass all of the FDC3 conversion as well - so you would need a complete and correct io.CD app config entry.)

- Taskbar icon behavior is different in io.CD than Finsemble. In io.CD, multiple instances of the same app appear as sub-icons to a single taskbar icon. This mimics MS Windows behavior. Grouped and tabbed collections of windows have unique icons that are indicative of groups and tabs, and the thumbnail image associated with the taskbar displays the entire group.

- io.CD does not support window blur(). blur() calls will have no effect. We recommend focusing the toolbar as an alternative to blurring specific windows.

- Right clicking on the system tray will pull up the io.CD utilities menu by default. If you've created a custom Finsemble system tray then right clicking will bring up your system tray while holding the shift key while right clicking will bring up the io.CD utilities menu.

- fin.getSnapshot() is implemented but with slightly different behavior. The original implementation was a passthrough to Electron's capturePage() function. That passthrough accepted parameters that allowed you to capture only a region of the window. This is no longer supported in io.CD which can only capture the entire window. The parameters are therefore ignored. (Note that all windows loaded from a Finsemble config have allowCapture set to true. This can be overridden in the app config. Normally in io.CD, allowCapture defaults to false.)

- addSelectClientCertificateListener() and addCertificateErrorListener() functions are no longer active. io.CD will now automatically present users with a UI for picking security certificates.

- io.CD uses actual monitor pixels for calculations. Finsemble used browser pixels. This can vary slightly from computer to computer because of the devicePixelRatio that Chrome computes. When using AppsClient.spawn(), the polyfill adjusts for this devicePixelRatio so that apps continue to launch in the same location on io.CD as they did on Finsemble. However, using io.cd's application.start() method will use the actual monitor pixels. Calls to getBounds() and setBounds() use the absolute monitor pixels on all of finsembleWindow, WindowClient.getBounds() and io.cd's window bounds calls. The net result of this is that a call to finsembleWindow.getBounds() may not return the same values as were set by AppClient.spawn().

- Listeners on config will no longer trigger if a ConfigClient call is made but has no impact on config. Previously, Finsemble would trigger listeners even if no changes were made, but io.CD filters out such events.

- Launch groups no longer support the `spawnOnStartup` config.

- groupOnSpawn is no longer supported.

- opacity and transparency are now only supported on `{ mode: "frameless"}` windows. Frameless windows are transparent by default, so opacity can be achieved by simply setting the background color on the app's <html> element.

- The NonConfiguredComponent has been eliminated. Apps without a config simply no longer launch.

- If a modified workspace is passed back to the "load-requested" event then the modified layout will overwrite the saved layout. This is different from Finsemble where the layout would not be saved until the user explicitly saved it. Also, the "close-completed" event will now be received after "load-requested". Not before, as was the case in Finsemble.

- Finsemble's previous functions for manipulating browser views are no longer available. setShape() is no longer available.

- Finsemble's notification center has been replaced with iocd's notification panel which has essentially the same functionality but a different look and feel.

- Finsemble's download manager has been replaced with iocd's download manager which has essentially the same functionality but a different look and feel. Download settings have been removed from user preferences since they can now be set directly from the download manager.

- waitForBootStage is implemented but Finsemble's boot stages have been compressed down into iocd boot sequence stages. Following is a mapping:
    "microkernel": ["core", 2000],
    "kernel": ["core", 1000],
    "pre-authentication": ["pre-sso", 1000],
    "authentication": ["post-sso", 3000],
    "appd-retrieval": ["post-sso", 2000],
    "system-preuser": ["post-sso", 1000],
    "preuser": ["post-sso", 5000],
    "preuser2": ["post-sso", 4000],
    "preuser3": ["post-sso", 3000],
    "preuser4": ["post-sso", 2000],
    "earlyuser": ["post-sso", 1000],
    "user": ["user", 1000]

    When using waitForBootStage, all of these post-sso stages will be triggered at one time (when post-sso is complete within iocd). (Note, the numeric value indicates a "priority". This is a sequencing of launches within the given stage. This sequencing will still be honored but will not trigger any events until all of the related stages have completed.)

- Muting of notifications is now only possible on sources (originating apps). You can no longer mute based on notification type. Sources are now always the appId. You cannot associate an arbitrary source with a notification.

- The notifications preferences panel has been eliminated. Notification settings can now be controlled directly from the notifications panel itself. Note that some default behaviors are now different, such as dismissing notifications. These behaviors can be controlled by the end user through the notifications panel settings.

### Coming soon

- Mac Support - iocd is currently compatible only with MS Windows, taking advantage of native APIs for an improved user experience. A Mac compatible version will be available in an upcoming release.

- Auto Update - iocd does not yet support auto update functionality (such as is available through Finsemble via the Squirrel packager.)

## Creating installers or folder packages for your end users

As with Finsemble, you can choose to deliver your SmartDesktop to end users as either (a) an installer executable that they run on their desktop, or (b) a folder package that you can copy to your end users' desktops.

### Choice #1: Executable installers

The io-connect/installers folder contains a copy of the IO Connect Desktop's "extensible installer" configuration. This provides very [extensive customization capabilities](https://docs.interop.io/desktop/getting-started/how-to/rebrand-io-connect/installer/index.html). Installers for your end users are _modified versions of the installer that we provided to you._.

If you have io.Connect Desktop installed on your machine then this process will be automatic.

    Run `yarn makeInstaller-iocd.

If you are building in a CI environment then you will need to provide the location of your original iocd installer that we provided to you. You may provide either a file path or a url. makeInstaller-iocd will generate an actual installer than your end users can run. Set the location of your installer in the `iocdInstaller` field in project.json _or_ set an environment variable called IOCDINSTALLER _or_ set IOCDINSTALLER in a .env file at your project's root.

> Please see [io-connect/installer/README.md](./io-connect/installer/README.md) for more details on generating installers

Running `yarn makeInstaller-iocd` will read your project.json installer settings, processing those values into the various templates in io-connect/installer/templates. It will also copy image files, modifying config files and all other steps required to generate an installer. The installer will be generated in the `pkg` folder of your project's root.

Please note that io.CD's default install directory is %LocalAppData%/"your product name". This is different from Finsemble's default install location. When generating an installer executable, the installation folder can be changed in io-connect/installer/templates/extensibility.json. _Please note that io.CD is a large install and we do not recommend installing it in AppData/Roaming._

If you've configured certificate files and passwords in your project.json then your installer will be signed. You can also use the new `windowsSign` field which accepts all parameters supported by `@electron/windows-sign`. This gives you access to modern signing technology supported by Microsoft.

Installer configs that are no longer available:
`download` - The electron binary is no longer involved in installer generation
`electronPackagerOptions` - Electron packager is no longer used to generate installers.
`electronWinstallerOptions` - Electron Winstaller is no longer used to generate installers.
`buildTimeout` - The installer generation process is now very quick.
`deleteUserDataOnUninstall` - UserData is now automatically deleted when io.CD is uninstalled.
`logging` - Logging is automatically to the console.

> If you install your generated installer on your development machine, please note that your installer will replace your installed io.cd in the Windows program registry. You can continue to use both, so long as you don't remove the app from add/remove programs or by uninstalling. If you do remove, then you will need to reinstall io.cd. (Your custom installer version will be in `AppData/Local/yourProductName` while your developer version of io.cd will be in `AppData/Local/interop.io`).

#### Delivering to your end users

You can provide the generated installer directly to your end users. It will install your customized and branded version of iocd. If they are upgrading, then their AppData/.../UserData folder will remain untouched and their Chromium cache (AppData/.../Cache) will be migrated forward so they do not lose any data.

Alternatively, you can deliver the `AppData/local/io.connect/io.Connect Desktop` folder yourself. This contains the executable and all required support files. (iocd does not require any registry entries.) The easiest way to do this is to generate an installer per the above instructions, then install that installer on a local development box, and finally zip up the resulting AppData/.../io.Connect Desktop folder, being careful to exclude the UserData and Cache folders. You can then copy that folder to your end user's desktops (e.g. using group policy.) and create a shortcut to AppData/.../Desktop/io-connect-desktop.exe.

> Note that the `io-connect-desktop.exe` and `io-connect-desktop-inner.exe` executables are signed via authenticode as interop.io.

### Choice #2: Folder packages

You must provide the location of your original zip bundle that we provided to you. You may provide either a file path or a url. Set the location of your zip bundle in the `iocdInstaller` field in project.json _or_ set an environment variable called IOCDINSTALLER _or_ set IOCDINSTALLER in a .env file at your project's root.

    Run `yarn makeInstaller-iocd.


Running `yarn makeInstaller-iocd` will download and extract your zip bundle into your seed project's `pkg/distributable` folder. it will then read your project.json installer settings, processing those values, and make changes to the zip bundle. For instance, it will change the name of the folder, executable name, set the icon, properties etc.

If you've configured certificate files and passwords in your project.json then your executable will be signed. You can also use the new `windowsSign` field which accepts all parameters supported by `@electron/windows-sign`. This gives you access to modern signing technology supported by Microsoft. If you do not sign the executable then Microsoft may prevent it from being launched by your end users.

You may then copy the generated directory to your end users' desktops. You do not need to make any registry changes. _Please note that io.CD is a large install and we do not recommend installing it in AppData/Roaming._ When copying, you should follow iocd's conventions for upgrades:

* The AppData/.../UserData folder should not be overwritten (this allows user data to be retained after the upgrade)
* The AppData/.../Cache folder should not be overwritten (this allows Chrome cache to be retained after the upgrade)

> Note that the `io-connect-desktop-inner.exe` executable will still be used by the system. This is signed via authenticode as interop.io.

## Additional Configurations

Finsemble's manifest now accepts a new `iocd` root level config. This contains the following options:

`enableLegacyLoggerRecipe` - When set to true, logger.service.logMessages will be enabled. This is necessary if you're using Finsemble's logger recipe.

`iocdDialogs` - By default, the existing Finsemble dialogs are used wherever possible. If you have not overridden YesNoDialog or SingleInputDialog then you can set this to false so that io.CD's default dialogs will be used.

`timeout` - Finsemble service will make itself visible if it has not completed its boot process within 40 seconds. You can then hit F12 to get devtools and diagnose the issue. If 40 seconds it not enough for your environment then set `timeout` to the number of milliseconds to wait. (e.g. `60000`)

apps.json supports a `hostManifests.["io.Connect]` entry. You can put any valid iocd app config in this section and it will read by iocd, and will override any relevant conversions.

## Troubleshooting

Chrome Devtools for apps is enabled by clicking F12. (You can click shift-F12 to get devtools for the window frame but this is rarely necessary.)

`yarn iocd` opens a debugging port 9222. You can open http://localhost:9222 in your browser similar to how Finsemble supports http://localhost:9090, or open chrome://inspect/#devices and add localhost:9222 to your configuration for node debugging. This can be useful for debugging startup problems.

If you encounter any problems please provide a copy of `application.log`. This can be found in AppData/io.Connect/io.Connect Desktop/User Data/ENV-REGION/logs. You can search this log for `[Error]` or `[warn]` and sometimes find the issue, or send to us for debugging.

Please also send us `fsbl-service.log` which can be found in the "logs/applications" subdirectory. The entry `Apps added by config service` reveals the converted io.CD app configs which can reveal config conversion issues.

If you're having a problem with a specific app, please also provide us with the application config.

More difficult problems may require a console capture from the `fsbl-service` app. To accomplish this, right click the iocd system tray icon and choose "Applications". Find "fsbl-service" and open the devconsole (the "script" icon). This displays the Chromium dev tools for this service. From the "Default levels" pulldown, add "verbose". You can then look for JS errors or copy & paste the console output. (You can also find `fsbl-service` in the central logger which is accessible from the Finsemble toolbar.)

If your toolbar isn't rendering properly then check F12 on the toolbar for any console errors.

io.CD will boot slowly if it cannot access Finsemble resources such as fsbl-service or the polyfill preload. You may see the error "Failed to refresh preload scripts" in your application.log when this happens. Be sure that you've deployed the seed's `public` folder and that it is being served. To test an installer against local seed files, you can set the manifest url to "http://localhost:3375/configs/application/manifest-local.json" and then run `yarn iocd --serve`.

If io.CD doesn't launch, first check system.json to make sure it isn't blank or missing. Next, check %LOCALAPPDATA%/interop.io/io.Connect Desktop/UserData/ENV-REGION/logs/gilding.log check for any errors. Next check application.log for `[ERROR]` and `[WARN]` - you may see unhandled exceptions here that will point to the problem. Next check logs/applications/fsbl-service.log for errors. Finally, open http://localhost:9222 and look for console errors in any of the apps that are running. If none of this reveals an issue then please send all these logs and your finsemble config to our support.

To diagnose app slowness we recommend adding additional levels of logging and then sending us a console log for that app (hit F12 when the app is in focus). This is done by adding the following to the app's app config (in apps.json):

```json
			"hostManifests": {
				"io.Connect": {
					"details": {
						"consoleLogLevel": "debug"
					}
				},
```

The debug level is recommended for this purpose.

### The "io-connect" folder

Your seed project auto-generates files in the io-connect folder. For instance, the Finsemble manifest and config.json are converted into a very small system.json file that includes all of the override configurations that are necessary to make iocd run Finsemble. stickywindows.json is another small file that is generated. (The main versions of these files are at `AppData/local/interop.io/io.Connect Desktop/Desktop/config`.) See [IOCD quickstart](./docs/iocd-quickstart.md) for more information.

`gilding.json` tells iocd how to find these override configs. For Finsemble seed, it points to a REST endpoint that is started by Finsemble's CLI. In production, you probably will not use the gilding feature.

`systemAppStore` contains app configs for a few system apps that are required by Finsemble, such as the fsbl-service app. This file is modified by the CLI. You should avoid making changes to this file because they could be overwritten. Let us know if you find it necessary to modify these app configs.

`configOverrides` contains _another_ override of system.json. This is used only to set the ENV and REGION variables (because these variables are not supported in remote configs). You don't have to worry about these files because they are only necessary to support launching in multiple environments while developing.

`installer` contains all the files necessary for generating installers. See [Creating Installers For Your End Users](#creating-installers-for-your-end-users) for more information.

#### Overriding system.json

You can override any value in system.json by creating a section in your project.json file called "io-connect". You can create separate sections for your installer or launch configs in order to apply different overrides.

Example, set iocd's download location (overriding Finsemble's manifest)
```json
{
    "installer" : {
        "io-connect" : {
            "remoteConfigs": {
                "system.json": {
                    "downloadSettings": {
                        "path": "C:/temp"
                    }
                }
            }
        }
    }
}
```

## Data Migration (Work in Progress: this information may change)

> Note: See [this link](https://docs.interop.io/desktop/developers/configuration/system/index.html) for more information on iocd configuration and remote stores.

End user data can be migrated from existing Finsemble implementations to the new implementation running on io.CD. Following are the goals for data migration:

1) Finsemble data will be converted at runtime to formats compatible with the new platform
2) Finsemble's Chromium cache (indexdb, cookies, localstorage) will be migrated to the new platform. This will be non-destructive to the legacy Finsemble cache, allowing fallback and remigration.
4) StorageAdapters will continue to function without modification (with some caveats)
5) A config switch will dynamically migrate data from StorageAdapters to iocd's "remote stores".

> Note: Data migration from _indexDB_ is one-way. Changes made while on the iocd platform do not propagate back to legacy Finsemble. For instance, if a user adds a window to a previously migrated workspace while running on io.CD, that window will not be part of the same workspace if they return to their legacy Finsemble installation. But if you are using your own storage adapter then data should remain in sync between both systems as you set the "saveToStorageAdapter" flag.

Categories of end user data:
- Chromium cache (cookies, localStorage, indexDB, etc)
- Workspaces (now called "Layouts")
- User Preferences
- Favorites
- Adhoc StorageClient calls
- Advanced App Launcher (if enabled)
- Persisted distributed stores (if used)

### Chromium cache

Finsemble's chromium cache contains user data such as cookies, local storage, and potentially storage adapter data. It is possible to migrate this data to iocd so that your end users are not inconvenienced. This can be done by adding an entry to your manifest. The `path` should point to the location of your installed Finsemble `userdata` folder. (Note: in development, the path is "%AppData/Electron/userdata". In production, it will depend upon your project.json settings.)

This entry will cause the cache to be copied _one time_. After the cache is copied, the chromium cache will only be updated from changes made while running iocd. (Only if your end user's iocd "Cache" folder is deleted will the cache will be copied again.)

```json
	"iocd": {
		"io-connect": {
			"remoteConfigs": {
				"system.json": {
					"folders": {
						"cache": {
							"copy": {
								"path": "%AppData%/Finsemble/userdata"
							}
						}
					}
				}
			}
		}
	}
```

### Preferences and Workspaces

For `preferences` and `workspaces`, the polyfill will initially load the data from the storage adapter, convert it to iocd format, and then overwriting the corresponding iocd "store". Any changes are written back to both the storage adapter and the iocd "store".

For instance, upon boot and once the user is authenticated, preferences are retrieved from the storage adapter using the key "Finsemble:defaultUser:finsemble:userPreferences". These are then immediately saved be calling the function `iop.prefs.setFor("IO.Global.FinsemblePreferences", ...)`. At this point, the iocd store and the storage adapter are synchronized. Whenever a user adds, removes or updates a preference it is saved back to the storage adapter as well as updating the iocd store via the call `iop.prefs.updateFor("IO.Global.FinsemblePreferences", ...)`. Assuming iocd is running its default configuration, the "store" location is in `%LOCALAPPDATA%/interop.io/io.Connect Desktop/UserData/%ENV%-%REGION%/prefs`. With a system.json change, the store can be changed to a remote REST endpoint that you control.

`iocd.data` configs can be set in your Finsemble manifest to enable or disable storage adapter loading or saving. End user data for preferences or workspaces can be loaded from either the Finsemble storageAdapter or the iocd store, or it can be loaded once from storageAdapter and thereafter from the iocd store (effectively migrating the data at runtime.) Data is always saved to the relevant iocd store, but you can also opt to save the data back to the storage adapter.

> The [iocd schema entry](./node_modules/@finsemble/finsemble-core/configs/schemas/finsemble.schema.json#/definitions/iocd) can be used for reference.

#### Example 1: Migrating a custom remote storage adapter

Let's say that you've built a storage adapter that loads and saves workspaces from your own remote database. In this case, you would set `iocd.data.workspaces.load: "storageAdapter"` and `iocd.data.workspaces.saveToStorageAdapter: true`. Now, when your end users run Finsemble on the iocd platform it will continue to use your storage adapter just as it always has. You can go live with this solution.

Next, let's say that you now wish to discontinue using the storage adapter in favor of using iocd's remote stores. You would build a [REST endpoint](https://docs.interop.io/desktop/capabilities/windows/layouts/overview/index.html#layout_stores-rest) that connects to your database. Now, your back end is capable of serving data to either Finsemble storage adapters or IOCD layout stores.

Finally, you can now switch your implementation to use the layout store by setting `iocd.data.workspaces.load: "iocd"`, `iocd.data.workspaces.saveToStorageAdapter: false`, and configuring your layout store in your seed's `io-connect/remoteConfigs/.../system.json`.

#### Example 2: Migrating from Finsemble's standard indexdb storage adapter

When using the indexdb storage adapter, end user data is stored locally on the end user's machine. You won't have the option of doing a one-time switch for all of your end users unless you decide to run a script on all of their machines to extract their data.

In this case, you would set `iocd.data.workspaces.load: "storageAdapter"` and `iocd.data.workspaces.saveToStorageAdapter: true`. The index storage adapter will continue to work as expected. You can go live with this solution.

Next, let's say that you now wish to discontinue using the storage adapter in favor of using iocd stores. If you're using iocd's standard file store then there's no action required. Data will be saved their automatically. If you wish to implement a remote store then now would be the time to build it.

Once your settled on your store strategy, you can now switch your implementation to use the layout store by setting `iocd.data.workspaces.load: "oneTimeConversion"` (and configuring your layout store in your seed's `io-connect/remoteConfigs/.../system.json` if you're using a remote store.) The Finsemble polyfill will now convert the storage adapter data to iocd format and save it in the iocd store. It will do this when the end user launches the desktop, and afterwards it will draw data from the iocd store and no longer use the storage adapter.

You may continue saving changes to the storage adapter by setting `iocd.data.workspaces.saveToStorageAdapter: true`. This will give you the ability to fall back if there are any problems so long as you maintain the storage adapter code. If you ever wish to convert the data _again_ (such as if something went wrong), you can TODO.

#### Example 3: Using Finsemble's "workspace events"

If you've been using Finsemble's workspace events (`WorkspaceClient.addEventListener()`) then you have probably used them to integrate remote storage in a ways that is very similar to iocd's remote store. You may continue using your code without any changes and it should continue to operate as expected but we recommend migrating to iocd's remote store concept because it will result in cleaner code that will be easier to support (for both you and us.)

First, implement a [REST endpoint](https://docs.interop.io/desktop/capabilities/windows/layouts/overview/index.html#layout_stores-rest) that will act as an adapter interface to your data. (We recommend implementing and testing remote stores by using iocd without the polyfill.)

Once your REST endpoint is ready, take the following steps:
1) Remove your workspace event handlers from the code.
2) Set `iocd.data.workspaces.load: "iocd"` and set `iocd.data.workspaces.saveToStorageAdapter: false`.
3) Configure your remote store in `io-connect/remoteConfigs/.../system.json`

Your Finsemble polyfill will now be exclusively using iocd's layouts as its back end.

### FDC3

Like Finsemble, the polyfill automatically persists FDC3 contexts in layouts. Whenever an app broadcasts or receives a context, or receives an intent with a context, then that context is saved with the layout. When the app instance is later restored (by switching layouts or restarting the desktop), it will receive that context when it adds a context listener. This mechanism allows app state to automatically persist, simply by using FDC3.

You may optionally disable this behavior by setting `persistFDC3Context` to false. This can be set in the manifest's "iocd" section (to disable the behavior globally), or it can be set in the "customProperties" section of the app's "io.Connect" hostManifest (e.g. in your app's apps.json entry `hostManifests.["io.Connect"].customProperties.persistFDC3Context: false`)

### Favorites

Your end users may have "favorited" apps and workspaces. These favorites appear on the toolbar (or are highlighted with a star in advanced app launcher). These favorites will continue to be accessible without requiring any changes.

If you eventually migrate from Finsemble's toolbar to io.CD's launchpad 3.0 (available Q4) then your end users will have to reestablish their favorites in that interface.

### Adhoc StorageClient calls

If your code base is making direct StorageClient calls then those calls will continue to work with Finsemble on io.CD so long as you maintain your storage adapter. If you wish to decommission your storage adapter then you should convert these calls to use the [iop.prefs API](https://docs.interop.io/desktop/reference/javascript/app%20preferences/index.html#API). Migrating previously saved data from an indexDB adapter will not be possible. If you have implemented a custom storage adapter then you can make this data available via a remote io.CD preferences store so that it is accessible via the prefs API.

### Advanced App Launcher (AAL)

The AAL now uses the iop prefs API as its back end. When Finsemble launches, it reads the existing persisted distributed store that contains your end users' AAL configuration and then saves it to the iop prefs API. One converted and saved, the persisted distributed store is no longer used. There is no action necessary though you may want to consider implementing a remote preferences store so that end user data is stored in your infrastructure.

### Persistent Distributed Stores

Persistent distributed stores are no longer supported. Similar functionality can be achieved using the iop prefs API but we do not have an automatic conversion mechanism. Please let us know if you are using persistent distributed stores and we will consult with you about possible solutions.

# Fixes

------ Beta 36

Fixed a bug where assimilated apps had additional cmd parameter in IOCD.

FIN-2046 - Fixed a bug where native FSBL.Disconnected event wasn't raised in IOCD.

FIN-2061 - Fixed a bug where FDC3 context in .net client didn't have custom properties.

FIN-2034 - getZoomFactor and setZoomFactor now use values between 0 and 1

FIN-2007 - Restored "development" as the default environment for CLI.

FIN-2007 - yarn start now passes --manifest argument to iocd executable

FIN-2063 - Load Toolbar before other UI components in order to improve loading performance and reduce FOUC.

FIN-2081 - finsembleWindow.windowOptions and FSBL.Clients.System.getCurrentWindow().getOptions() now contain data.

FIN-2036 - fdc3.open and fdc3.raiseIntent now support "name" for backward compatibility (JS only - .NET still in development)

FIN-2036 - addContextListener now has backward compatibility with old signature that took a single argument

------ Beta 35

FIN-2046 - Added legacy Application.shutdown and Application.restart router messages. iocd shutdown will be delayed by 3 seconds to provide apps some time to react to these messages.

FIN-2017 - Fixed bug that was preventing iocd from booting after makeInstaller generation.

FIN-2061 - Added the ability to skip iocd window registration with the .NET library.

------ Beta 34

FIN-2017 - Fixed DecoratorWindow path to include index.html

FIN-2063 - Substituted 127.0.0.1 for localhost to reduce websocket connectivity slowness.

FIN-2063 - Fixed bug that erased "id" when switching workspaces

------ Beta 33

FIN-2017 - makeInstaller preload now supports subdirectories

FIN-2063 - Empty string values for width and height are now treated as default width & height

FIN-2063 - getActiveWorkspace() can now be called before the user stage

------ Beta 32

SystemTrayComponent now starts in earlyUser stage (later than previously)

FIN-2017 - subdirectories are now correctly applied to all generated urls in system.json and finsembleService.json

FIN-2017 - documentRoot is now automatically derived from the manifestURL. This ensures that it matches the "manifest" command line argument.

FIN-2017 - system.json is now rewritten with every pass. overrides were also removed from the manifest. To override values, please set `["io-connect"].remoteConfigs["system.json"]` in your project.json's installer or launch configs. This will ensure that they are applied correctly when running makeInstaller.

------ Beta 31

FIN-2063 - Added stack trace to thrown errors (e.g. in decorator window)

FIN-2034 - Support FSBL.System.Window.getCurrent().setZoomFactor() and FSBL.System.Window.getCurrent().getZoomFactor()

------ Beta 30

FIN-2061 - Moved call of EnsureHandle to inside Connect in .NET.

FIN-2061 - More optimization for memory and speed in .NET.

------ Beta 29

FIN-2061 - Refactor GetDefaultComponentConfig in .NET.

FIN-2061 - More startup logging for .NET.

FIN-2061 - Made ConfigClient.Get more efficient in .NET.

FIN-2063 - Efficiency tweaks and additional logging

------ Beta 28

FIN-2063 - Capture unhandled errors in DecoratorWindow

FIN-2063 - Refactored config handling to prevent very large configs from causing system bottlenecks

FIN-2039 - Fix AlwaysOnTop Toolbar button and WindowClient.setAlwaysOnTop

FIN-2061 - Refactor .NET ConfigClient.Get for iocd.

------ Beta 27

FIN-2046 - Changed how Finsemble.dll and Finsemble.Core.dll version is read to work with PublishSingleFile.

FIN-2046 - Fixed issue where apps/services launched with spawn were accidentally included in the layout

------ Beta 26

FIN-2061 - Fixed issue that prevented Glue .NET logs from getting to the Central Logger.

FIN-2046 - Added ability to log Glue .NET logs to file for debugging purposes.

------ Beta 25

FIN-2063 - getApps() is now returning correct "path" for native apps

FIN-2046 - Disambiguated the SemaphoreSync errors in .NET.

FIN-2046 - Updated Finsemble.dll and Finsemble.Core.dll version to include "beta" and output that version.

------ Beta 24

FIN-2063 - Fix regression that caused preloads to not load

G4E-8256 - System tray component now always displays in the correct location

FIN-2054 - formGroup() is now implemented (for 2 windows only)

Router transmit calls are now compatible between .NET and JS apps

User preferences are now automatically loaded and saved from storage adapter. Workspace and automated shutdown/refresh preferences are automatically applied to iocd.

------ Beta 23

FIN-2046 - Various issues with .NET API have been fixed

FIN-2017 - getCommandLineArguments now returns minimist format like legacy Finsemble

FIN-2039 - Fixed camel casing when saving workspaces to storage adapters

FIN-2017 - Fixed bug where data migration threw an exception if workspaceNames was null

FIN-2017 - makeInstaller-iocd zip bundles are now downloaded into pkg/distributable

Stack traces for unhandled exceptions in fsbl-service and storage adapters are now logged

Fixed a bug where arrow keys did not work in text fields of the Advanced App Launcher

Hide New App form in Advanced App Launcher when the menu blurs

------ Beta 22

FIN-2039 - Legacy AuthorizationState router message is now published by polyfill

FIN-2039 - Added support for legacy "launcher.preloads" config, and fixed logic for "finsemble.extensions" config

Imported Logger's (using require or import) now redirect their output to FSBL.Clients.Logger when running under the polyfill

Enabled "New App" functionality in AdvancedAppLauncher (when enableQuickComponents is set as a prop)

------ Beta 21

FIN-2046 - Various reported issues with .NET apps fixed

FIN-2009 - bootConfig.onErrorMakeSystemManagerVisible value now stops the system manager from displaying on startup errors

FIN-1996 - App loading time for a single app is improved. This was accomplished by switching to iocd's production gateway (useBeta: false)

FIN-2017 - Zip packaging is now supported as an alternative to installer executables. See [Choice #2: Folder packages](#choice-2-folder-packages)

Fixed bug that caused unhandled exceptions not to be logged to the console

A new "iocd" field is available in SpawnParams which accepts iocd's [ApplicationStartOptions](https://docs.interop.io/desktop/reference/javascript/app%20management/index.html#ApplicationStartOptions)

    For instance:
    ```javascript
    FSBL.Clients.AppsClient.spawn("Tour", { iocd: { awaitInterop: false })
    ```

manifest-local.json is no longer required for running makeInstaller-iocd, but the manifest referenced in project.json's installer entry _must_ be in the project's filesystem. This is because some of the manifest's config is converted into system.json.


------ Beta 20

Notifications API has been polyfilled (except for fetchHistory). Note that the notifications preferences are now in the notifications panel's settings (cog icon).

"Notifications" template has been added. This replaces Finsemble's previous NotificationsToast and NotificationsCenter templates with a single template that is compatible with iocd. Use `yarn template Notifications` to add the template. This command will create two apps.json entries (one for the notifications panel, another for the notifications toast). Example .tsx files will be created that demonstrate how to apply changes to the template.

SystemTrayComponent ("custom-tray") now picks up and converts config (i.e. from its entry in config.json).

Added information in this document on migrating chromium cache from Finsemble to iocd.

FIN-2035 - Fixed bug that caused feedback form to accidentally open.

FIN-2023 - Apps that have the same icon will now share a taskbar slot.

------ Beta 19

Polyfilled FinsembleWindow.getComponentState, setComponentState, and removeComponentState

Polyfilled fin.desktop.System.openURLWithBrowser, isTitlebarWindow

FIN-2016 - Fixed bug that prevented inbound data migration to be enabled by default

FIN-2016 - workspace.id is now persisted to layout.metadata.id. get and save will process this during data migration.

FIN-1986 - Manifest now supports values in `iocd.io-connect.remoteConfigs.["system.json]` which will override system.json

FIN-2017 - applicationRoot is now read from manifests that are passed on command line. This means that DecoratorWindow and SystemTrayComponent will now match the manifest that is passed in.

------ Beta 18

FIN-1987 - FSBL.System.getProcessList() has been polyfilled (requires update of system.json)

FIN-1995 - systemManager.boot.stage router messages now match more perfectly with the original Finsemble timing

FIN-2028 - Added windowType "assimilation" so that `AppsClient.spawn` will not pass Finsemble command line parameters.

------ Beta 17

FIN-2025 - Sped up `AppsClient.getActiveDescriptors` so it doesn't take 30s to complete.

The io-connect/installer folder is now auto-generated. If this folder already exists then it will not be overwritten. You can therefore make changes to the templates or add an assets folder. Delete the folder to force regeneration. The "utilities" folder has been removed. The required utilities are now in the @interopio/fsbl-integration dependency.

FIN-2010 Bloomberg is now enabled. This supports both V2 and V3. There is no configuration required. The BloombergClient is automatically available in the polyfill and the adapter will automatically connect to either version of terminal connect if it is running on the desktop. A new process called "Glue42.MDFBridge.exe" will be spawned when you launch the desktop. You may need your IT department to whitelist this application.

FIN-2027 - spawn() returns null for `finWindow` when opening hidden windows.

FIN-2024 - autoStart (spawnOnStartup) are no longer spawned during the wrong boot stage. They will now be spawned during the "user" stage.

FIN-2017 - `--manifest` command line argument can now be used to override the manifest url location.

FIN-2017 - Installers generated by makeInstaller-iocd are now "unattended" by default. To revert to an installer with UI, remove the "unattended" entry in io-connect/installer/templates/extensibility.json

FIN-2005 - The Authentication component no longer auto-closes. This matches existing Finsemble behavior. To reverse this behavior, authentication components can close themselves, or the "keepAlive" parameter can be set to `false` in io-connect/.../system.json. (Please delete your existing io-connect/.../system.json in order to get this feature.)

FIN-2016 - Storage service now awaits for storage adapter setUser() to complete before it performs data migration.

FIN-1995 - Workspaces are now converted to and from storage adapters _by default_. To bypass this feature, set the manifest's `iocd.data.workspaces.load` to either "iocd" or "oneTimeConversion" and/or `iocd.data.save.storageAdapter` to false.

FIN-2014 - `FSBL.Clients.ConfigClient.get` no longer returns an error when called in pre-user stage.

------ Beta 16

FIN-2012 - Preloads with macros weren't running when apps added using AppsClient.addApps().

FIN-1996 - addApps() performance has been improved (24 second loads now take 3 seconds).

FIN-2010 - App configs that target BloombergBridge.exe (via appAssets alias) are now automatically filtered out. Previously, such an app was required by Finsemble. iocd no longer requires this, but it would still be loaded, causing iocd boot to fail. Now this is filtered out, so it can safely be left in place for backward compatibility but will no longer prevent booting.

The location of config is now read directly from `imports` field of the manifest. This will therefore properly read config for customers who have renamed "config.json". Please note that this assumes that the first entry in the array is the equivalent of config.json.

------ Beta 15

FIN-2006 - Ability to override url and path when spawning apps

------ Beta 14

FIN-1996 - addApps() speed has been improved by 50% (further improvements targeted for next beta)
FIN-1995 - systemManager.boot.stage message is now being published. waitForBootStage bugs fixed.
WindowClient.getSpawnData() is now synchronous (matching legacy Finsemble). It also now works with Finsemble config's `window.data` field.
User preferences can now be migrated from Finsemble to iocd
Fixed an exception in workspace data migration
Revisions to boot sequence so that layouts aren't restored until after preuser stages

------ Beta 13

FIN-1986 - Boot sequence wasn't ordering correctly

------ Beta 12

FIN-1986 App configs for centered left and top not working

FIN-1987 FSBL.System.getHostSpecs() now returns `env` and `hostName` fields

FIN-1987 FSBL.System.Window.getCurrent().name now works as expected

FIN-1987 Apps in $documentRoot ($applicationRoot) are now "trusted" and can clear cache and access env variables

FIN-1970 - result format for getCurrentCredentials() doesn't match Finsemble format

FIN-1978 - `FSBLHeader: false` now renders a window as frameless

Added gw.configuration.default_context_lifetime: "retained" to system.json. This is temporarily required for forward compatibility and will likely be removed before iocd version 9.5 is released.

------ Beta 11

FIN-1975 - waitForBootStage() is implemented. Please see notes above.

FIN-1970 - sso-application didn't recognize `apps` (only `components`) in apps.json (only config.json)

FIN-1970 - publishCredentials not actually publishing except from sso-application itself

FIN-1970 - Added FSBL.System.hideSplashScreen()

FIN-1970 - Enabled allowNTLMCredentialsForDomains: "*" by default. This can be overridden in system.json.

FIN-1973 - Added fin.desktop.system.getCommandLineArguments()

FIN-1972 - io-connect/gilding/gilding.json file can now be customized (it will not be overwritten if it already exists)

FIN-1972 - Initial remoteConfig fetch now supports system proxy. Please delete io-connect/gilding/gilding.json and re-run `yarn iocd` to enable this feature.

Finsemble's system hotkeys are now enabled by default (central logger, toolbar, spawnOnHotkey app configs)

# Storage Adapter Example

Following is a storage adapter example format that works with both legacy Finsemble and with the polyfill. Older storage adapter formats that imported `BaseStorage` can be converted to this format to avoid imports.

```typescript
export declare type StorageKeyTopic = {
    key: string;
    topic: string;
    keyPrefix?: string;
    value?: Record<string, any>;
};

export interface IBaseStorage {
    baseName: string;
    userName: string;
    clearCache: (params: StorageKeyTopic, callback: Function) => void;
    get: (params: StorageKeyTopic, callback: Function) => void;
    save: (params: StorageKeyTopic, callback: Function) => void;
    delete: (params: StorageKeyTopic, callback: Function) => void;
    keys: (params: StorageKeyTopic, callback: Function) => void;
    setUser: (userName: string) => void;
    setBaseName: (baseName: string) => void;
    empty: (callback: Function) => void;
    getMultiple: () => void;
    getCombinedKey: (self: IBaseStorage, params: StorageKeyTopic) => string;
    getKeyPreface: (self: IBaseStorage, params: StorageKeyTopic) => string;
}

const StorageAdapter = function (this: IBaseStorage, name: string) {
    (window as any).adapterReceiver.loaded(name, this);

    // This function is called to set the base name, which is "Finsemble" or the Manifest's startup_app.uuid if set
    this.setBaseName = function (baseName: string): void {
        this.baseName = baseName;
    };

    // This function will be called when sso completes
    this.setUser = function (user: string): void {
        this.userName = user;
    };

    this.getCombinedKey = function (self: IBaseStorage, params: StorageKeyTopic): string {
        return `${self.baseName}:${self.userName}:${params.topic}:${params.key}`;
    };

    this.getKeyPreface = function (self: IBaseStorage, params: StorageKeyTopic): string {
        let preface = `${self.baseName}:${self.userName}:${params.topic}:`;
        if ("keyPrefix" in params) {
            preface = preface + params.keyPrefix;
        }
        return preface;
    };

    this.delete = (params: StorageKeyTopic, cb: Function) => {
		    const combinedKey = this.getCombinedKey(this, params);
        // your code to delete data[combinedKey]
        cb(null, { status: "success" });
    };

    this.get = (params: StorageKeyTopic, cb: Function) => {
		    const combinedKey = this.getCombinedKey(this, params);
        // your code to get data[combinedKey]
        cb(null, data[combinedKey]);
	  };

    this.save = (params: StorageKeyTopic, cb: Function) => {
		    const combinedKey = this.getCombinedKey(this, params);
        // your code to set data[combinedKey]
        cb(null, { status: "success" });
    };

    // You may also implement keys() and clearCache() with this same pattern if required by your adapter
};

new (StorageAdapter as any)("testAdapter1");
export const adapter = StorageAdapter; // Allows Finsemble to get access to the uninitialized object

```
