# Logging Export Service Example #

Simple log export service example which captures messages of specified categories and levels and transmits them to a remote API in batch, once a certain batch size or timeout is reached.

This implementation uses the "AppService" paradigm.

The service will come up during finsemble startup - but will inevitably not be able to capture some of the earliest log messages.

## Setup and Customization ##
In the enclosed _LoggingExportAppService.js_ file, look for `//TODO:` comments which indicate where to customize the service to your needs - inline documentation is provided. In particular, you will need to set your `LOGGING_ENDPOINT` and customize the request format and payload to suit your remote log collection endpoint.

## Installation ##
The AppService is preconfigured in this seed, however installation steps are included which illustrate a manual installation.

1. Copy the enclosing directory to your seed project at: _/src/components/LoggingExportAppService_
so that you have files:
- _/src/components/LoggingExportAppService/LoggingExportAppService.css_
- _/src/components/LoggingExportAppService/LoggingExportAppService.html_
- _/src/components/LoggingExportAppService/LoggingExportAppService.js_

2. Add the below app definition to the _/public/configs/application/appd.json_ config file:
```
    "LoggingExportAppService": {
        "appId": "LoggingExportAppService",
        "name": "LoggingExportAppService",
        "manifest": {
            "window": {
                "options": {
                    "autoShow": false
                },
                "url": "$applicationRoot/components/LoggingExportAppService/LoggingExportAppService.html"
            },
            "component": {
                "spawnOnStartup": true,
                "singleton": true
            },
            "foreign": {
                "components": {
                    "App Launcher": {
                        "launchableByUser": false
                    },
                    "Window Manager": {
                        "FSBLHeader": false
                    },
                    "windowService": {
                        "manageWindowMovement": false
                    }
                }
            }
        }
    }
```
3. Add the below configuration to _/webpack/webpack.components.entries.json_ file:
```
    "LoggingExportAppService": {
        "output": "components/LoggingExportAppService/LoggingExportAppService",
        "entry": "./src/components/LoggingExportAppService/LoggingExportAppService.js"
    }
```

4. Run `yarn dev` or `npm run dev` to build and run Finsemble.
