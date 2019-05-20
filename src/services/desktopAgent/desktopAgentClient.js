const Finsemble = require("@chartiq/finsemble");
const RouterClient = Finsemble.Clients.RouterClient;
const Logger = Finsemble.Clients.Logger;

// open
// open(name: string, context?: Context): Promise<void>;

// broadcast
// broadcast(context: Context): void;

// raiseIntent
// raiseIntent(intent: string, context: Context, target?: string): Promise<IntentResolution>;

// addIntentListener
// addIntentListener(intent: string, handler: (context: Context) => void): Listener;

// addContextListener
// addContextListener(handler: (context: Context) => void): Listener;


export function open(context, cb) {
	Logger.log("Desktop Agent open called");
	RouterClient.query("desktopAgentOpen", context , function (err, response) {
		Logger.log("DesktopAgent.open response: ", response.data);
		if (cb) {
			cb(err, response.data);
		}
	});
};

export function broadcast(context, cb) {
	Logger.log("Desktop Agent broadcast called");
	RouterClient.query("desktopAgentBroadcast", context , function (err, response) {
		Logger.log("DesktopAgent.broadcast response: ", response.data);
		if (cb) {
			cb(err, response.data);
		}
	});
};

export function raiseIntent(context, cb) {
	Logger.log("Desktop Agent raiseIntent called");
	RouterClient.query("desktopAgentRaiseIntent", context , function (err, response) {
		Logger.log("DesktopAgent.raiseIntent response: ", response.data);
		if (cb) {
			cb(err, response.data);
		}
	});
};

export function addIntentListener(context, cb) {
	Logger.log("Desktop Agent addIntentListener called");
	RouterClient.query("desktopAgentAddIntentListener", context , function (err, response) {
		Logger.log("DesktopAgent.addIntentListener response: ", response.data);
		if (cb) {
			cb(err, response.data);
		}
	});
};

export function addContextListener(context, cb) {
	Logger.log("Desktop Agent addContextListener called");
	RouterClient.query("desktopAgentAddContextListener", context , function (err, response) {
		Logger.log("DesktopAgent.addContextListener response: ", response.data);
		if (cb) {
			cb(err, response.data);
		}
	});
};


