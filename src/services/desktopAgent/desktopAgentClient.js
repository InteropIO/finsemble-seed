const Finsemble = require("@chartiq/finsemble");
const RouterClient = Finsemble.Clients.RouterClient;
const Logger = Finsemble.Clients.Logger;

//FDC3 Desktop Agent V1.0 Functions 6/5/2019

// open
// open(name: string, context?: Context): Promise<void>;
export function open(name, context) {

	return new Promise(function (resolve, reject) {
		Logger.log("Desktop Agent open called");
		RouterClient.query("desktopAgentOpen", { "name": name, "context": context }, function (err, response) {
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
		RouterClient.query("desktopAgentFindIntent", { "intent": intent, "context": context }, function (err, response) {
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
		RouterClient.query("desktopAgentFindIntentsByContext", { "context": context }, function (err, response) {
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
	RouterClient.query("desktopAgentBroadcast", context, function (err, response) {
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
		RouterClient.query("desktopAgentRaiseIntent", { "intent": intent, "context": context, "target": target }, function (err, response) {
			Logger.log("DesktopAgent.raiseIntent response: ", response.data);
			if (err) {
				reject(err);
			}
			resolve();
		});
	})
};

// addIntentListener
// addIntentListener(intent: string, handler: (context: Context) => void): Listener;
export function addIntentListener(intent, handler) {
	return new Promise(function (resolve, reject) {
		console.log("Handler Type", ({}).toString.call(handler));
		//check handler is function
		if (({}).toString.call(handler) === '[object AsyncFunction]' || ({}).toString.call(handler) === '[object Function]') {
			//This is a valid handler
			RouterClient.query("desktopAgentAddIntentListener", context, function (err, response) {
				Logger.log("DesktopAgent.addIntentListener response: ", response.data);
				if (error) {
					reject(error);
				}
			})
		} else {
			//This is not a valid handler
			Logger.log("addIntentListener: Handler arguement must be [object Function] or [object AsyncFunction]");
			reject(handler);
		}
		//check that function takes context
		// return new Promise(function (resolve, reject) {
		// Logger.log("Desktop Agent addIntentListener called");
		// resolve();
		// RouterClient.query("desktopAgentAddIntentListener", context, function (err, response) {
		// 	Logger.log("DesktopAgent.addIntentListener response: ", response.data);
		// 	if (error) {
		// 		reject(error);
		// 	}
		// 	resolve();
		// });
	})
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


