# Switching Environments 
In Finsemble, switching between multiple environments&mdash;for example between the production and staging environments&mdash;is most simply achieved by swapping out configuration files, or configs. As a quick proof of concept, we threw together a tool that allows you to switch between environments at the click of a button.

## Files of interest
The following files found in the seed project are important for this tool. 

`../configs/openfin/manifest-local.json` - The config for the dev environment [(link)](https://github.com/ChartIQ/finsemble-seed/blob/switchEnvironmentsPOC/configs/openfin/manifest-local.json "manifest-local.json")

`../configs/openfin/manifest-prod.json` - The config for the production environment [(link)](https://github.com/ChartIQ/finsemble-seed/blob/switchEnvironmentsPOC/configs/openfin/manifest-prod.json "manifest-prod.json")

`../src/components/fileMenu/src/app.jsx` - The JSX file for the UI elements of the file menu [(link)](https://github.com/ChartIQ/finsemble-seed/blob/switchEnvironmentsPOC/src/components/fileMenu/src/app.jsx "app.jsx")

`../src/components/fileMenu/src/stores/fileMenuStore` - The file containing the onClick functions of the file menu, among other things [(link)](https://github.com/ChartIQ/finsemble-seed/blob/switchEnvironmentsPOC/src/components/fileMenu/src/stores/fileMenuStore.js "app.jsx")

`../server/server.js` - The server [(link)](https://github.com/ChartIQ/finsemble-seed/blob/switchEnvironmentsPOC/server/server.js "server.js")

Every other file in this branch is just a normal part of our seed project.

## How it works
The two configs, `manifest-local.json` and `manifest-prod.json`, represent configurations to differentiate between a development environment and a production environment, respectively. In a real-world scenario, there might be many differences between these two files, but in this simple example there's just one: the `"env"` field at the very bottom.

### manifest-local.json
```javascript
        ],
        "env": "dev"
    }
```
If you run the seed project (using the steps outlined in [Getting Started](https://documentation.chartiq.com/finsemble/tutorial-gettingStarted.html)) you'll see the Finsemble toolbar at the top with the Finsemble icon on the left. Click the Finsemble icon to open the file menu. 

(picture)

The third button down reads "dev." This is because we read the `"env"` field in app.jsx using our Config Client and set a variable `environment` equal to its value.

### app.jsx
```javascript
var environment = "";
FSBL.Clients.ConfigClient.getValue({ field: "finsemble" }, function (err, finsembleConfig) {
	environment = finsembleConfig.env;
});
```

The `environment` variable is then simply plugged into the JSX that creates the file menu. This is a simple way to display the current environment.

### app.jsx
```javascript
<FinsembleMenuItem label={environment} onClick={FileMenuActions.switchEnv} />
```
In order to change the environment, you simply have to press the "dev" button. This will call the `switchEnv()`function in `fileMenuStore.js`, which sends a request to our server in `server.js`, as well as initiating a restart of Finsemble (not including the server).

### fileMenuStore.js
```javascript
	switchEnv() {
		fetch("/switchEnvironment", {//Sends our logout message
			method: "POST",
			credentials: "include"
		});
		FSBL.restartApplication();
	},
```

The server, in turn, executes this block of code:
### server.js
```javascript
	app.post("/switchEnvironment", function (req, res, next) {
		var cookie = req.cookies; //getter
		if (!cookie.env) {
			res.cookie('env', "dev", { maxAge: 900000, httpOnly: true });
		}
		if (cookie.env === "dev") {
			res.cookie('env', "prod", { maxAge: 900000, httpOnly: true });
		} else {
			res.cookie('env', "dev", { maxAge: 900000, httpOnly: true });
		}
		console.log("switchEnvironment", cookie, "cookie.env: ", cookie.env)
		next()
	});
```
This code toggles the `"env"` field on a `cookie` object between `"prod"` and `"dev"`.  As Finsemble is restarting, it will check this field to decide which config to load when it goes to retrieve the config.

### server.js
```javascript
	app.get("/config", function (req, res) {
		var cookie = req.cookies;
		var config;
		if (!cookie.env) {
			res.cookie('env', "dev", { maxAge: 900000, httpOnly: true });
		}
		if (cookie.env === "prod") {
			config = require("../configs/openfin/manifest-prod.json");
		} else {
			config = require("../configs/openfin/manifest-local.json");
		}
		console.log("doing config stuff",cookie)
		res.send(config) //sends the config
	});
```

After restarting Finsemble, you'll notice that when you open up the file menu, it will now say "prod" instead of "dev", meaning you have successfully changed environments and displayed that change.

## Further reading 
For more on our Config Client, see the tutorial [here](https://documentation.chartiq.com/finsemble/ConfigClient.html "Config Client Documentation"). 

For more on how configuration works in Finsemble, check out the documentation[here](https://documentation.chartiq.com/finsemble/tutorial-understandingConfiguration.html "Understanding Configuration").
