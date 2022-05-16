# Logging Export Service Example #

Simple log export service example which captures messages of specified categories and levels and transmits them to a remote API in batch, once a certain batch size or timeout is reached.

This implementation uses the "AppService" paradigm.

The service will come up during Finsemble startup - but will inevitably not be able to capture some of the earliest log messages.

## Setup and Customization ##
In the enclosed _LoggingExportAppService.js_ file, look for `//TODO:` comments which indicate where to customize the service to your needs - inline documentation is provided. In particular, you will need to set your `LOGGING_ENDPOINT` and customize the request format and payload to suit your remote log collection endpoint.

## Installation ##
The AppService is preconfigured in this seed, however installation steps are included which illustrate a manual installation.

1. Copy the enclosing directory to your seed project at: _/src/components/loggingExportAppService_ so that you have files:
- _/src/components/loggingExportAppService/LoggingExportAppService.html_
- _/src/components/loggingExportAppService/LoggingExportAppService.js_
- _/src/components/loggingExportAppService/config.json_
- _/src/components/loggingExportAppService/finsemble.webpack.json_

2. Edit `public/configs/application/config.json` to include `"$applicationRoot/components/loggingExportAppService/config.json"` in the `importConfig[]` declaration.

3. Run `yarn dev` or `npm run dev` to build and run Finsemble.

## Running in Finsemble 6 ##
Finsemble 6 does not support the `appService` attribute defined in `config.json` so the following settings will need to be manually added in order to run within a Finsemble 6 environment, the following must be set within the appd configuration:

```
appDConfig.manifest.window.frame = true;
appDConfig.manifest.window.options.autoShow = false;
appDConfig.manifest.foreign.components["Window Manager"].FSBLHeader = false;
appDConfig.manifest.foreign.components["windowService"].manageWindowMovement = false;
appDConfig.manifest.foreign.components["App Launcher"].launchableByUser = false;
appDConfig.manifest.component.singleton = true;
appDConfig.manifest.component.spawnOnStartup = true;
```

The entire entry would look like:
```
    "appd": {
        "LoggingExportAppService": {
            "appId": "LoggingExportAppService",
            "name": "LoggingExportAppService",
            "manifest": {
                "//appService": true,
                "bootParams": {
                    "autoStart": true,
                    "stage": "preuser"
                },
                "window": {
                    "url": "$applicationRoot/components/loggingExportAppService/LoggingExportAppService.html",
                    "options": {
                        "autoShow": false
                    },
                    "frame": true
                },
                "component": {
                    "singleton": true,
                    "spawnOnStartup": true
                },
                "foreign": {
                    "components": {
                        "App Launcher": {
                            "launchableByUser": false
                        },
                        "Window Manager": {
                            "FSBLHeader": false
                        },
                        "WindowService": {
                            "manageWindowMovement": false
                        }
                    }
                }
            }
        }
    }
```
