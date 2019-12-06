const Finsemble = require("@chartiq/finsemble");
const RouterClient = Finsemble.Clients.RouterClient;
const Logger = Finsemble.Clients.Logger;
const WindowClient = Finsemble.Clients.WindowClient;

//FDC3 Desktop Agent V1.0 Functions 8/14/2019

// open
// open(name: string, context?: Context): Promise<void>;
export function open(name, context) {

	return new Promise(function (resolve, reject) {
		Logger.log("Desktop Agent open called");
		RouterClient.query("FDC3.desktopAgent.open", { "name": name, "context": context }, function (err, response) {
			Logger.log("DesktopAgent.open response: ", response.data);
			if (err) {
				reject(err);
			}
			resolve();
		});
	})
};

// findIntent
// findIntent(intent: string, context?: Context): Promise<AppIntent>;
// returns a single AppIntent:
// {
//     intent: { name: "StartChat", displayName: "Chat" },
//     apps: [{ name: "Skype" }, { name: "Symphony" }, { name: "Slack" }]
// }
export function findIntent(intent, context) {
	return new Promise(function (resolve, reject) {
		Logger.log("Desktop Agent findIntent called", intent, context);
		RouterClient.query("FDC3.desktopAgent.findIntent", { "intent": intent, "context": context }, function (err, response) {
			Logger.log("DesktopAgent.FindIntent response: ", response.data);
			if (err) {
				reject(err);
			}
			resolve(response.data);
		});
	})
};

// findIntentsByContext
// findIntentsByContext(context: Context): Promise<Array<AppIntent>>;
export function findIntentsByContext(context) {
	return new Promise(function (resolve, reject) {
		Logger.log("Desktop Agent open called");
		RouterClient.query("FDC3.desktopAgent.findIntentsByContext", { "context": context }, function (err, response) {
			Logger.log("DesktopAgent.findIntentsByContext response: ", response.data);
			if (err) {
				reject(err);
			}
			resolve(response.data);
		});
	})
};

// broadcast
// broadcast(context: Context): void;
export function broadcast(context) {
	Logger.log("Desktop Agent broadcast called");
	RouterClient.query("FDC3.desktopAgent.broadcast", context, function (err, response) {
		if (err) {
			Logger.log("DesktopAgent.broadcast ERROR:", err);
			return;
		} else {
			Logger.log("DesktopAgent.broadcast response: ", response.data);
			return;
		}
	});
};

// raiseIntent
// raiseIntent(intent: string, context: Context, target?: string): Promise<IntentResolution>;
export function raiseIntent(intent, context, target) {
	return new Promise(function (resolve, reject) {
		Logger.log("Desktop Agent raiseIntent called");
		RouterClient.query("FDC3.desktopAgent.raiseIntent", { "intent": intent, "context": context, "target": target }, function (err, response) {
			// debugger;
			console.log("DesktopAgent.raiseIntent response: ", response.data);
			// debugger;
			// Implementation Removed
			// Router Publish
			
			if (err) {
				reject(err);
			}
			resolve(response.data);
		});
	})
};

// addIntentListener
// addIntentListener(intent: string, handler: (context: Context) => void): Listener;
export function addIntentListener(intent, handler) {
		console.log("Handler Type", ({}).toString.call(handler));
		var appName = WindowClient.getWindowIdentifier().componentType;
		console.log("WindowIdentifier: ", appName);
		//check handler is function
		if (({}).toString.call(handler) === '[object AsyncFunction]' || ({}).toString.call(handler) === '[object Function]') {
			//This is a valid handler
			let channel = appName + intent;
			RouterClient.subscribe(channel, function(err, response){
				if(err){
					console.log("Error adding IntentListener: ", err);
				}
				// debugger;
				handler(response.data.context);
			});
		} else {
			//This is not a valid handler
			Logger.log("addIntentListener: Handler arguement must be [object Function] or [object AsyncFunction]");
			return handler;
		}
};

// addContextListener
// addContextListener(handler: (context: Context) => void): Listener;
export function addContextListener(context) {
	return new Promise(function (resolve, reject) {
		Logger.log("Desktop Agent addContextListener called");
		RouterClient.query("desktopAgentAddContextListener", context, function (err, response) {
			Logger.log("DesktopAgent.addContextListener response: ", response.data);
			if (err) {
				reject(err);
			}
			resolve();
		});
	})
};


