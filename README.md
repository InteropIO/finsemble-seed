
# Finsemble Seed for io.Connect Desktop 🌱

This version of the Finsemble Seed project is compatible with IO.Connect Desktop (iocd). It also continues to support the legacy Finsemble container (FEA). With this seed version you can run your Finsemble project against either container.

> _This is a Beta. Not all features are working yet. See below for details._

## Installing

1) In order to run the Beta you must first install io.Connect Desktop. You should have already been provided with a link to an installer and a license key which will install an "empty" version of iocd which will serve as the base for development. The desktop installer that you will eventually deliver to your end users will be iocd + your finsemble project + any new iocd customizations that you implement.

> _To evaluate additional iocd features please request a full demo version._

2) Update your package.json:
    a) Change `@finsemble/finsemble-core` entry to match the version in this branch.
    b) Copy the `iocd` and `dev-iocd` scripts from this branch.
    c) Run `yarn install`.

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

### What will you need to change?

- The WindowTitleBar component will no longer be supported under iocd, which uses a different windowing paradigm than Finsemble. If you've customized the WindowTitleBar then you will need to re-implement those changes using the new DecoratorWindow template (`yarn template DecoratorWindow`). This uses iocd's ["extensible web groups"](https://docs.interop.io/desktop/capabilities/windows/window-management/overview/index.html#extending_web_groups).
- The advanced app launcher is functional but if you've customized any of the underlying code then it may need to be re-implemented. Please check and let us know if you find anything not functioning.

### What is not working?

- Notifications are based on the iocd notification system which uses a new notification panel which is still under development. Some Finsemble functionality such as history, muting and snoozing is not yet available.
- User preferences panel is not yet functional. If you've created a custom panel it will not yet be operational.
- There is no data conversion being performed yet. Changes to workspaces when launched under iocd will not persist (except for Favorites).
- User edited tab names are not yet interchangeable between iocd and FEA
- The .NET adapter is not yet available. Your native apps should launch but finsemble.dll will throw exceptions and the apps will not be able to interact with the desktop.
- The Bloomberg adapter is not yet available.
- Window tiling is not yet available. You can tile into iocd "Workspaces" which are a [powerful new feature](https://docs.interop.io/desktop/capabilities/windows/workspaces/overview/index.html).
- Launch groups are not yet working.
- The central logger is available and functional. The central logger will no longer contain system logs. System logs are available in application.log on the filesystem.
- Customizing DecoratorWindow per app is not yet supported.

### What is different?

- Windowing behavior is different in iocd than on legacy Finsemble. When windows are snapped together they now form a group which can be maximized and which responds to Microsoft Window snapping and aero commands. These groups contain an extra titlebar (which can optionally be disabled but which provides more intuitive maximization.)
- iocd is located in `AppData/local/interop.io/io.Connect Desktop`. The `UserData` subdirectory contains log files and other information. The `Cache` directory contains Chromium cache. The `Desktop\config` and `Desktop\assets` folders contain system information.
- After running `yarn iocd` a new "io-connect" subdirectory will appear in your project. This contains iocd config files `system.json` and `stickywindows.json`. You can add any iocd config to these files. See [these schemas](https://docs.interop.io/desktop/developers/configuration/overview/index.html) for more information on available switches.
- An `iop` global will be available on the window object to test the new API.
- Some additional CSS examples are added to theme.css to customized new window elements. These all begin with --t42 or --g42.

### Coming soon

- Data migration - We are working on a detailed plan for migrating end user data such as workspaces, favorites, and preferences. This data resides in Finsemble's storage adapters. This seed project is able to read Finsemble's storage adapters but our plan is to migrate your end user data to iocd's "remote store" concept which we believe to be an easier and more reliable long-term approach to persistence. Future versions of the seed project will contain switches that will allow you to automatically trigger data migration from legacy storage adapters to remote stores (you will also have the option of performing a full one-time conversion if you prefer that route.) See [this link](https://docs.interop.io/desktop/developers/configuration/system/index.html) for more information on iocd configuration and remote stores.

- Installers - We have not yet implemented installer generation. We plan to remain compatible with the makeInstaller CLI command but there are many more installer capabilities available in iocd. See [rebranding](https://docs.interop.io/desktop/getting-started/how-to/rebrand-io-connect/installer/index.html) for more information.

- Mac Support - iocd is currently compatible only with MS Windows, taking advantage of native APIs for an improved user experience. A Mac compatible version will be available in an upcoming release.


