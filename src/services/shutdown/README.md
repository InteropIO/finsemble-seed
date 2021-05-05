

## Scheduled Shutdown Example ##
Some organizations shutdown or restart their machines at specified times of the day or week to ensure updates etc. are deployed. It can be advantageous to have Finsemble shutdown prior to that, particularly for native components that need to save state (and don't use Finsemble's proactive approach to state saving). This recipe provides a service that reads config for when to shutdown and implements the shutdown with a 60 second countdown dialog and workspace save.

### Installation ###

 1. Add the shutdown service files to your */src/services* directory
 2. In your *configs/application/services.json* file add the shutdownService object to services.
```
{
    "comment": "Houses config for any custom services that you'd like to import into Finsemble.",
    "services": {
        "shutdownService": {
            "bootParams": {
                "stage": "preuser",
                "dependencies": []
            },
            "name": "shutdownService",
            "visible": false,
            "html": "$applicationRoot/services/shutdown/shutdown.html"
        }
    }
}
```
OR
Import the included config.json file by adding it to `importConfig` array in *configs/application/config.json*:
```
	...
	"importConfig": [
		...
		"$applicationRoot/services/shutdown/config.json"
	]
}
```


### Usage ###
**Important:**

***dayOfWeek:***  0-6 (Sunday - Saturday), omit this config entirely if you wish to shutdown every day at the configured time

***hour:***  24hour format **e.g** 5pm = 17 but 9am = 9 **not** 09

***minute:***  0-60 - again single digits must be 1 not 01

There are two options available set the shutdown service:

 1. Configuration 
 2. Programatically via the Config Client

**Option 1:** 

Inside the `finsemble.custom` element of your configuration (which can be defined in your manifest file, *configs/application/config.json* file or the included *services/shutdown/config.json* file), add the **scheduledShutdown** object. E.g.:
In the manifest:
```
"finsemble": {
	...
	"scheduledShutdown": {
		"dayOfWeek": 2,
		"hour": 17,
		"minute": 5
	}
}
```

**Option 2:**

Via the config client you can set the value for the schedule shutdown shown here: 

``FSBL.Clients.ConfigClient.setValue({field: "finsemble.scheduledShutdown", value:{hour:9, minute:15, day:2}
})``

***Note:** this will return a promise*
