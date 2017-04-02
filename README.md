# Finsemble

Finsemble is a framework for building seamless HTML5 desktop applications. A Finsemble application is composed of HTML5 and Javascript web pages running inside of OpenFin windows.

For more information visit: http://finsemble.com

Getting started
----

**Before you begin, be sure that you have sent your npm account information to npm@chartiq.com. In order to participate in the Finsemble Beta, you must have access to our private npm module.**

*Note: Configure your Finsemble dev environment on a Windows machine. For Mac developers we recommend running Windows under Bootcamp (https://support.apple.com/en-us/HT201468)*

node.js is required to build Finsemble applications and must be installed before you begin: https://nodejs.org/en/. We recommend version 6.10.1 LTS. *Finsemble has not been tested in node 7.0+.*

From the command line in your finsemble directory:

- Install Finsemble dependencies: 

`> npm install`
- Install Finsemble Command Line Interface (CLI): 

`> npm link`

- Run the sample app: 

`> npm run dev`


*Note: The first time you run the sample app, Finsemble will download required assets such as the OpenFin desktop container. This may take a few minutes if you are on a slow Internet connection.*

Using the CLI
----
After installing the CLI, run the command without any arguments to see a list of available commands and examples.

`> finsemble-cli`