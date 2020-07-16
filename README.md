[![Finsemble Logo](https://documentation.chartiq.com/finsemble/styles/img/Finsemble_Logo_Dark.svg)](https://documentation.chartiq.com/finsemble/)

# Finsemble Seed Project

To get started with Finsemble, check out the [seed project tutorial](https://www.chartiq.com/tutorials/?slug=finsemble). This tutorial walks you through setting up the seed project and introduces you to the basic concepts of developing a Finsemble smart desktop.

For everything you need to know about Finsemble, including our API documentation, check out the [developer documentation](https://documentation.chartiq.com/finsemble).

## Project structure

The Finsemble seed project provides a basic structure to help developers get up and running as quickly as possible. The seed project provides the skeleton of a Finsemble application that can be extended to suit your organization's needs. It also includes some functionality to make development faster and easier, like a basic build process.

- _gulpfile.js_ - The main gulpfile for the project includes the basic tasks used to build and run a Finsemble application for development.
- _gulpfile-extensions-example.js_ (optional) - File that can be used to add/modify the functionality of the gulpfile. This file is included to prevent conflicts when upgrading your base project.
- _build/webpack_ - Includes all of the files used by the seed project to build the application.
    - _webpack.finsemble-built-in.entries.json_ - This specifies the entry and output files for the files built for a default Finsemble smart desktop.
    - _webpack.components.entries.json_ - This file is where developer-added files should be listed. This file is empty in the base Finsemble seed project to prevent merge conflicts when updating the seed project.
    - _webpack.adapters.entries.json_ - This file is for any storage adapters that need to be built. They are no longer housed in the same webpack configuration as components, as they cannot use the same plugins as components use.
- _assets_ - Contains the CSS and images used to create Finsemble's look and feel.
- _configs/application_ - This folder contains all of the base configurations for the Finsemble application. The files in this folder are merged together to build the application configuration. This configuration can be changed at run time using dynamic configuration. Contains the application manifest used to start up the Finsemble application. The default manifest for development is included, and additional configurations can be placed in this folder.
- _configs/other/server-environment-startup.json_ - Used to define the development and production server configurations used by the Finsemble application.
- _server_ - Contains the server that hosts the built _dist_ folder for development purposes.
    - _server/server-extensions.md_ - Optional file that can be used to add functionality to the development server.
- _src_ - The folder where your Finsemble components should be placed for the Finsemble build process.
- _src-built-in_ - Includes the source for the default UI components included with the Finsemble seed project. These files can be extended as desired, but, if you do extend these components, we recommend you copy the folder to the _src_ directory to prevent merge conflicts when upgrading the seed project.
    - _src-built-in/adapters_ - Contains an example Storage Adapter that saves data to local storage.
- _tutorials_ - Contains the source for the components used by our seed project tutorial.

## Upgrading
If you are moving from a version of the Finsemble seed project older than 2.3, please see the [instructions here](https://github.com/ChartIQ/finsemble-seed/tree/master/migration/2.3).
