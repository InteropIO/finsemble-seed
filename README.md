# Finsemble

Finsemble is a framework for building seamless HTML5 desktop applications. A Finsemble application is composed of HTML5 and Javascript web pages running inside of OpenFin windows.

For more information visit: http://finsemble.com

Getting started
----

**Before you begin, be sure that you have sent your npm account information to npm@chartiq.com. In order to participate in the Finsemble Beta, you must have access to our private npm module.**

*Note: Configure your Finsemble dev environment on a Windows machine. For Mac developers we recommend running Windows under Bootcamp (https://support.apple.com/en-us/HT201468)*

node.js is required to build Finsemble applications and must be installed before you begin: https://nodejs.org/en/

From the command line in your finsemble directory:

- Install Finsemble dependencies: `npm install`
- Install Finsemble CLI: `npm install -g @chartiq/finsemble-cli`
- Run the sample app: `npm run dev`


*Note: The first time you run the sample app, Finsemble will download required assets such as the OpenFin desktop container. This may take a few minutes if you are on a slow Internet connection.*

Using the CLI
----

These commands can be run from your command line in your finsemble directory:

- `finsemble-cli add component <yourComponentName>` - Creates a new Finsemble component. This command creates stub css/html/js files inside of src/components.
- `finsemble-cli add component <yourComponentName> --react-component=true` - Same as above but also adds React build dependencies to webpack. 


- `finsemble-cli add service <yourServiceName> --create-client=true` - Creates a new microservice.
