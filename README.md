# Example of Switching Environments
In Finsemble, switching between multiple environments (production, staging, etc) is most simply achieved by swapping out configuration files, or configs.  In order to prove this, we threw together this quick proof of concept, which switches between environments at the click of a button. 

## Files of Interest
`../configs/openfin/manifest-local.json` - config for the dev environment [(link)](https://github.com/ChartIQ/finsemble-seed/blob/switchEnvironmentsPOC/configs/openfin/manifest-local.json "manifest-local.json")
`../configs/openfin/manifest-prod.json` - config for the production environment [(link)](https://github.com/ChartIQ/finsemble-seed/blob/switchEnvironmentsPOC/configs/openfin/manifest-prod.json "manifest-prod.json")
`../src/components/fileMenu/src/app.jsx` - JSX file for the UI elements of the file menu [(link)](https://github.com/ChartIQ/finsemble-seed/blob/switchEnvironmentsPOC/src/components/fileMenu/src/app.jsx "app.jsx")
`../src/components/fileMenu/src/stores/fileMenuStore` - file containing the onClick functions of the file menu, among other things [(link)](https://github.com/ChartIQ/finsemble-seed/blob/switchEnvironmentsPOC/src/components/fileMenu/src/stores/fileMenuStore.js "app.jsx")
`../server/server.js` - the server [(link)](https://github.com/ChartIQ/finsemble-seed/blob/switchEnvironmentsPOC/server/server.js "server.js")

Every other file in this branch is just a normal part of our seed project. 

## How it works
The two configs, `manifest-local.json` and `manifest-prod.json`, represent configurations to differentiate between a development environment and a production environment, respectively. In a real-world scenario, there might be many differences between these two files, but in this simple example there's just one: the `"env"` field at the very bottom. 
```javascript
        ],
        "env": "dev"
    }
```
If you run the seed project (just clone the directory, navigate to it in a command line, and run `npm run dev`), you'll see a toolbar at the top, including the Finsemble icon at the top left.  Click that icon, and you get the file menu. 
(picture)
The third button down reads "dev" - that's because, in app.jsx, we read the `"env"` field using our Config Client, and set a variable `environment` equal to its value. 
```javascript
var environment = "";
FSBL.Clients.ConfigClient.getValue({ field: "finsemble" }, function (err, finsembleConfig) {
	environment = finsembleConfig.env;
});
```

For more on our Config Client, see [here](https://documentation.chartiq.com/finsemble/ConfigClient.html "Config Client Documentation").  
For more on how configuration works in Finsemble, [click here](https://documentation.chartiq.com/finsemble/tutorial-understandingConfiguration.html "Understanding Configuration").


The `environment` variable is then simply plugged into the JSX that creates the file menu. This is a simple way to display the current environment. 
```javascript
<FinsembleMenuItem label={environment} onClick={FileMenuActions.switchEnv} />
```
In order to change the environment, you simply have to press the "dev" button. This will call the `switchEnv()`function in `fileMenuStore.js`, which sends a request to our server in `server.js`, as well as initiating a restart of Finsemble (not including the server). 
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
...which toggles the `"env"` field on a `cookie` object between `"prod"` and `"dev"`.  As Finsemble is restarting, when it goes to get the config, it will check this field to decide which config to load. 
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

After restart, if you open up the file menu, it will now say "prod" instead of "dev", meaning you have successfully changed environment, as well as displayed that change. 