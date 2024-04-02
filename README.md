
# Finsemble Seed for io.Connect Desktop 🌱

This version of the Finsemble Seed project is compatible with IO.Connect Desktop (iocd) version **9.3.0.3**. It also continues to support the legacy Finsemble container (FEA). With this seed version you can run your Finsemble project against either container.

> _This is a Beta. Not all features are working yet. See below for details._

## Installing

1) In order to run the Beta you must first install io.Connect Desktop. You should have already been provided with a link to an installer and a license key which will install an "empty" version of iocd which will serve as the base for development. The desktop installer that you will eventually deliver to your end users will be iocd + your finsemble project + any new iocd customizations that you implement.

> _To evaluate additional iocd features please request a full demo version._

2) Update your package.json:
    a) Change `@finsemble/finsemble-core` entry to match the version in this branch.
    b) Copy the `iocd` and `dev-iocd` scripts from this branch.
    c) Copy the "io-connect" subdirectory from this branch into your project.
    d) Run `yarn install`.

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

- FSBL API should be fully functional except for workspace events and preferences.
- The io.Connect Desktop API is fully functional. You can `import * from "@interopio/desktop"` in your apps, or you can use window.iop to test the API (please do not build code that relies on iop because this will not be a permanent feature).
- FDC3 is fully functional (window.fdc3 object).
- Toolbar, dialogs, and system tray should be fully functional. If you've customized these components then your customizations should be functional.
- Window operations such as tabbing and grouping
- Apps specified in apps.json or loaded using any FSBL API will work as expected
- Authentication (SSO) should be fully functional, including "dynamic config" (loading apps based on user login)
- Your theming/CSS customization should be fully functional.
- Generating installers

### What will you need to change?

- The WindowTitleBar component will no longer be supported under iocd, which uses a different windowing paradigm than Finsemble. If you've customized the WindowTitleBar then you will need to re-implement those changes using the new DecoratorWindow template (`yarn template DecoratorWindow`). This uses iocd's ["extensible web groups"](https://docs.interop.io/desktop/capabilities/windows/window-management/overview/index.html#extending_web_groups).
- The advanced app launcher is functional but if you've customized any of the underlying code then it may need to be re-implemented. Please check and let us know if you find anything not functioning.
- Your splash screen image may be smaller on io.CD than it was on Finsemble. This is due to how the two systems interpret screen resolution. You'll need to create a larger image if this is a concern. Please note that io.CD now supports [_interactive_](https://docs.interop.io/desktop/getting-started/how-to/rebrand-io-connect/user-interface/index.html#splash_screen) splash screens. You can see an example of this behavior when you run the copy of io.CD that we provided. [see installer section below](#creating-installers-for-your-end-users)
- Your installed icon may be rendered smaller than expected. To solve this problem you can create a 128x128 icon and save it as io-connect/installer/assets/icon.ico. [see installer section below](#creating-installers-for-your-end-users)
- io.CD does not support moving images on the installer dialog. You may need to create a static image and you may need to resize that image in order to have the best appearance. You can save such an image to io-connect/installer/assets/banner.gif which will override the default installer image.

### What is not working?

- Notifications are based on the iocd notification system which uses a new notification panel which is still under development. Some Finsemble functionality such as history, muting and snoozing is not yet available.
- User preferences panel is not yet functional. If you've created a custom panel it will not yet be operational.
- There is no data conversion being performed yet. Changes to workspaces when launched under iocd will not persist (except for Favorites).
- User edited tab names are not yet interchangeable between iocd and FEA
- The .NET adapter is not yet available. Your native apps should launch but finsemble.dll will throw exceptions and the apps will not be able to interact with the desktop.
- The Bloomberg adapter is not yet available.
- Window tiling is not yet available. You can tile into iocd "Workspaces" which are a [powerful new feature](https://docs.interop.io/desktop/capabilities/windows/workspaces/overview/index.html).
- Launch groups are not yet working.
- Customizing DecoratorWindow per app is not yet supported.
- Workspace events are not operational.

### What is different?

- Windowing behavior is different in iocd than on legacy Finsemble. When windows are snapped together they now form a group which can be maximized and which responds to Microsoft Window snapping and aero commands. These groups contain an extra titlebar (which can optionally be disabled but which provides more intuitive maximization.)

- iocd is located in `AppData/local/interop.io/io.Connect Desktop`. The `UserData` subdirectory contains log files and other information. The `Cache` directory contains Chromium cache. The `Desktop\config` and `Desktop\assets` folders contain system information.

- An "io-connect" subdirectory in your project will contain configurations specific to io.Connect Desktop. After running `yarn iocd` several subdirectories will be created under io-connect. This contains iocd config files `system.json` and `stickywindows.json`. You can add any iocd config to these files. See [these schemas](https://docs.interop.io/desktop/developers/configuration/overview/index.html) for more information on available switches.

    Please note that these files are generated only once. Some changes to Finsemble's config.json that are made after generating these files will not work. If you delete the files then they will be regenerated with the new changes, but remember to reapply any customizations that you've made.

    You may also request that any configuration be made _permanent_ for your company. We provide a service to maintain these config files for you, so that you don't have to worry about merging locally. The version of io.CD that we provide to you will then come pre-configured with this config.

    To prevent Finsemble from merging a file from the io-connect folder, simply modify it to contain an empty `{}`.

- An `iop` global will be available on the window object to test the new API.

- Some additional CSS examples are added to theme.css to customized new window elements. These all begin with --t42 or --g42.

- The central logger is available and functional. The central logger will no longer contain system logs. System logs are available in application.log on the filesystem.

### Coming soon

- Data migration - We are working on a detailed plan for migrating end user data such as workspaces, favorites, and preferences. This data resides in Finsemble's storage adapters. This seed project is able to read Finsemble's storage adapters but our plan is to migrate your end user data to iocd's "remote store" concept which we believe to be an easier and more reliable long-term approach to persistence. Future versions of the seed project will contain switches that will allow you to automatically trigger data migration from legacy storage adapters to remote stores (you will also have the option of performing a full one-time conversion if you prefer that route.) See [this link](https://docs.interop.io/desktop/developers/configuration/system/index.html) for more information on iocd configuration and remote stores.

- Mac Support - iocd is currently compatible only with MS Windows, taking advantage of native APIs for an improved user experience. A Mac compatible version will be available in an upcoming release.

## Creating installers for your end users

The io-connect/installers folder contains a copy of the IO Connect Desktop's "extensible installer" configuration. This provides very [extensive customization capabilities](https://docs.interop.io/desktop/getting-started/how-to/rebrand-io-connect/installer/index.html). Installers for your end users are _modified versions of the installer that we provided to you._.

In order to generate an installer you must have io.Connect Desktop installed on your machine, and you must have a copy of the original installer executable that you were provided.

(1) Add the client key we provided to your project.json file ("clientKey": "<your key>").
(2) Add an `iocdInstaller` entry to your project.json that points to the location on your filesystem where you have the _original installer that we provided to you_. (Alternatively, you can set this in an environment variable "IOCDINSTALLER" or add this variable to a `.env` file in your project's root.)
(3) Run `yarn makeInstaller-iocd.

Running `yarn makeInstaller-iocd` will read your project.json installer settings, processing those values into the various templates in io-connect/installer/templates. It will also copy image files, modifying config files and all other steps required to generate an installer. The installer will be generated in the `pkg` folder of your project's root.

The "io-connect/installer" folder contains a readme file that explains in more detail how this process works and how to further customize the installer process.

Please note that the default install directory is now %LocalAppData%/"your product name". This can be changed in io-connect/installer/templates/extensibility.json. Please note that io.CD is a large install and we do not recommend installing it in AppData/Roaming.

If you've configured certificate files and passwords in your project.json then your installer will be signed. You can also use the new `windowsSign` field which accepts all parameters supported by `@electron/windows-sign`. This gives you access to modern signing technology supported by Microsoft.

Installer configs that are no longer available:
`download` - The electron binary is no longer involved in installer generation
`electronPackagerOptions` - Electron packager is no longer used to generate installers.
`electronWinstallerOptions` - Electron Winstaller is no longer used to generate installers.
`buildTimeout` - The installer generation process is now very quick.
`deleteUserDataOnUninstall` - UserData is now automatically deleted when io.CD is uninstalled.
`logging` - Logging is automatically to the console.

> io.CD will boot slowly if it cannot access Finsemble resources such as fsbl-service or the polyfill preload. You may see the error "Failed to refresh preload scripts" in your application.log when this happens. Be sure that you've deployed the seed's `public` folder and that it is being served. To test an installer against local seed files, you can set the manifest url to "http://localhost:3375/configs/application/manifest-local.json" and then run `yarn iocd --serve`.

> If you test your generated installer on the same machine that you've been developing io.cd, please note that your installer will replace your installed io.cd in the Windows program registry. You can continue to use both, so long as you don't remove the app from add/remove programs or by uninstalling. If you do remove, then you will need to reinstall io.cd. Your custom installer version will be in `AppData/Local/yourProductName` while your developer version of io.cd will be in `AppData/Local/interop.io`.

## Additional Configurations

Finsemble's manifest now accepts a new `iocd` root level config. This contains the following options:

`enableLegacyLoggerRecipe` - When set to true, logger.service.logMessages will be enabled. This is necessary if you're using Finsemble's logger recipe.

`iocdDialogs` - By default, the existing Finsemble dialogs are used wherever possible. If you have not overridden YesNoDialog or SingleInputDialog then you can set this to false so that io.CD's default dialogs will be used.
