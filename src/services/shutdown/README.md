

## Scheduled Shutdown Example ##
Some organizations shutdown or restart their machines at specified times of the week to ensure updates etc. are deployed. It can be advantageous to have Finsemble shutdown prior to that, particularly for native components that need to save state (and don't use Finsemble's proactive approach to state saving). This recipe provides a service that reads config for when to shutdown and implements the shutdown with a 60 second countdown dialog and workspace save.

### Installation ###

 1. Add the shutdown service files to your */src/services* directory (the folder includes one HTML and one JS file)
 2. In your *configs/application/services.json* file add the shutdownService object to services.
```
{
    "comment": "Houses config for any custom services that you'd like to import into Finsemble.",
    "services": {
        "shutdownService": {
            "useWindow": true,
            "active": true,
            "name": "shutdownService",
            "visible": false,
            "html": "$applicationRoot/services/shutdown/shutdown.html"
        }
    }
}
```



### Usage ###
**Important:**

***day:***  0-6 (Sunday - Saturday)

***hour:***  24hour format **e.g** 5pm = 17 but 9am = 9 **not** 09

***minute:***  0-60 - again single digits must be 1 not 01

There are two options available set the shutdown service:

 1. Configuration 
 2. Programatically via the Config Client

**Option 1:** 

Inside *configs/openfin/manifest-local.json* inside the finsemble object add the **scheduledShutdown** object.
```
"finsemble": {
	"applicationRoot": "http://localhost:3375",
	"moduleRoot": "$applicationRoot/finsemble",
	"servicesRoot": "$applicationRoot/finsemble/services",
	"notificationURL": "$applicationRoot/components/notification/notification.html",
	"importConfig": ["$applicationRoot/configs/application/config.json"],
	"IAC": {
		"serverAddress": "ws://127.0.0.1:3376"
	},
	"scheduledShutdown": {
		"day": 2,
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
