console.log("file preloaded");
const setupFDC3Client = () => {
	console.log("setup called");
	const RouterClient = FSBL.Clients.RouterClient;
	const Logger = FSBL.Clients.Logger;
	//FDC3 Desktop Agent V1.0 Functions 8/14/2019
	FSBL.Clients.DesktopAgentClient = {
		/**
		 * open(name: string, context?: Context): Promise<void>;
		 */
		open: async (name, context) => {
			Logger.log("Desktop Agent open called");
			const { err, response } = await RouterClient.query("FDC3.desktopAgent.open", { "name": name, "context": context });
			if (err) {
				throw (err);
			}
			Logger.log("DesktopAgent.open response: ", response.data);
			return response.data;
		},

		/** findIntent
		* findIntent(intent: string, context?: Context): Promise<AppIntent>;
		* returns a single AppIntent:
		* {
		*     intent: { name: "StartChat", displayName: "Chat" },
		*     apps: [{ name: "Skype" }, { name: "Symphony" }, { name: "Slack" }]
		* }
		*/
		findIntent: async (intent, context) => {
			Logger.log("Desktop Agent findIntent called", intent, context);
			const { err, response } = await RouterClient.query("FDC3.desktopAgent.findIntent", { "intent": intent, "context": context });
			if (err) {
				throw (err);
			}
			Logger.log("DesktopAgent.FindIntent response: ", response.data);
			return response.data;
		},

		/**
		 * findIntentsByContext(context: Context): Promise<Array<AppIntent>>; 
		*/
		findIntentsByContext: async (context) => {
			Logger.log("Desktop Agent open called");
			const { err, response } = await RouterClient.query("FDC3.desktopAgent.findIntentsByContext", { "context": context });
			if (err) {
				throw (err);
			}
			Logger.log("DesktopAgent.findIntentsByContext response: ", response.data);
			return response.data;
		},

		// broadcast
		// broadcast(context: Context): void;
		broadcast: async (context) => {
			Logger.log("Desktop Agent broadcast called");
			const { err, response } = await RouterClient.query("FDC3.desktopAgent.broadcast", context);
			if (err) {
				Logger.log("DesktopAgent.broadcast ERROR:", err);
				throw (err);
			} else {
				Logger.log("DesktopAgent.broadcast response: ", response.data);
				return;
			}
		},

		// raiseIntent
		// raiseIntent(intent: string, context: Context, target?: string): Promise<IntentResolution>;
		raiseIntent: async (intent, context, target) => {
			Logger.log("Desktop Agent raiseIntent called");
			RouterClient.query("FDC3.desktopAgent.raiseIntent", { "intent": intent, "context": context, "target": target }, function (err, response) {
				// debugger;
				// Implementation Removed
				// Router Publish			
				if (err) {
					throw (err);
				}
				console.log("DesktopAgent.raiseIntent response: ", response.data);
				return response.data;
			});

		},

		// addIntentListener
		// addIntentListener(intent: string, handler: (context: Context) => void): Listener;
		addIntentListener: (intent, handler) => {
			console.log("Handler Type", ({}).toString.call(handler));
			var appName = finsembleWindow.windowOptions.componentType;
			console.log("WindowIdentifier: ", appName);
			//check handler is function
			if (({}).toString.call(handler) === '[object AsyncFunction]' || ({}).toString.call(handler) === '[object Function]') {
				//This is a valid handler
				let channel = appName + intent;
				RouterClient.subscribe(channel, function (err, response) {
					if (err) {
						console.log("Error adding IntentListener: ", err);
					}
					handler(response.data.context);
				});
			} else {
				//This is not a valid handler
				Logger.log("addIntentListener: Handler arguement must be [object Function] or [object AsyncFunction]");
				return handler;
			}
		},

		// addContextListener
		// addContextListener(handler: (context: Context) => void): Listener;
		addContextListener: async (context) => {
			Logger.log("Desktop Agent addContextListener called");
			const { err, response } = await RouterClient.query("desktopAgentAddContextListener", context);
			if (err) {
				throw (err);
			}
			Logger.log("DesktopAgent.addContextListener response: ", response.data);
			return response.data;
		}

	}
}

// Startup pattern for preload. Preloads can come in any order, so we need to wait on either the window event or the
// FSBL event
if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", setupFDC3Client);
} else {
	window.addEventListener("FSBLReady", setupFDC3Client);
}


