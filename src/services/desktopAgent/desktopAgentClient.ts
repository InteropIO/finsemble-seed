const setupFDC3Client = () => {
	const { RouterClient, WindowClient, Logger } = FSBL.Clients;

	class DesktopAgentClient implements DesktopAgent {
		async open(name: string, context?: Context) {
			Logger.log("Desktop Agent open called typescript");
			const { err, response } = await RouterClient.query("FDC3.desktopAgent.open", { "name": name, "context": context }, ()=> {});
			if (err) {
				throw (err);
			}
			Logger.log("DesktopAgent.open response: ", response.data);
			return response.data;
		}

		async findIntent(intent: string, context?: Context) {
			Logger.log("Desktop Agent findIntent called", intent, context);
			const { err, response } = await RouterClient.query("FDC3.desktopAgent.findIntent", { "intent": intent, "context": context }, ()=> {});
			if (err) {
				throw (err);
			}
			Logger.log("DesktopAgent.FindIntent response: ", response.data);
			return response.data;
		}

		async findIntentsByContext(context: Context) {
			Logger.log("Desktop Agent open called");
			const { err, response } = await RouterClient.query("FDC3.desktopAgent.findIntentsByContext", { "context": context }, ()=> {});
			if (err) {
				throw (err);
			}
			Logger.log("DesktopAgent.findIntentsByContext response: ", response.data);
			return response.data;
		}

		async broadcast(context: Context) {
			Logger.log("Desktop Agent broadcast called");
			const { err, response } = await RouterClient.query("FDC3.desktopAgent.broadcast", context, ()=> {});
			if (err) {
				Logger.log("DesktopAgent.broadcast ERROR:", err);
				throw (err);
			} else {
				Logger.log("DesktopAgent.broadcast response: ", response.data);
				return;
			}
		}

		async raiseIntent(intent: string, context: Context, target?: string) {
			Logger.log("Desktop Agent raiseIntent called");
			const {err, response} = await RouterClient.query("FDC3.desktopAgent.raiseIntent", { "intent": intent, "context": context, "target": target }, ()=>{});
				// debugger;
				// Implementation Removed
				// Router Publish
			if (err) {
				throw (err);
			}
			console.log("DesktopAgent.raiseIntent response: ", response.data);
			return response.data;
		}


		addIntentListener(intent: string, handler: ContextHandler): Listener {
			console.log("Handler Type", ({}).toString.call(handler));
			const appName = WindowClient.getWindowIdentifier().componentType;
			console.log("WindowIdentifier: ", appName);
			//check handler is function
			if (({}).toString.call(handler) === '[object AsyncFunction]' || ({}).toString.call(handler) === '[object Function]') {
				//This is a valid handler
				let channel = appName + intent;
				const subscribeHandler = (err: Error, response: any) => {
					if (err) {
						console.log("Error adding IntentListener: ", err);
					}
					handler(response.data.context);
				}
				const subscribeId = RouterClient.subscribe(channel, subscribeHandler);
				return {
					unsubscribe: ()=>{
						RouterClient.unsubscribe(subscribeId);
					}
				}
			} else {
				//This is not a valid handler
				Logger.log("addIntentListener: Handler arguement must be [object Function] or [object AsyncFunction]");
				throw("invalid handler");
				//return handler;
			}
		}


		addContextListener (contextType: string, handler: ContextHandler): Listener {
			Logger.log("Desktop Agent addContextListener called");
			//const { err, response } = RouterClient.query("desktopAgentAddContextListener", null, ()=> {});
			// if (err) {
			// 	throw (err);
			// }
			//Logger.log("DesktopAgent.addContextListener response: ", response.data);
			return {
				unsubscribe: () => {

				}
			}
		}

		async getSystemChannels(): Promise<Array<Channel>> { return null; }

		async joinChannel(channelId: string) { }

		async getOrCreateChannel(channelId: string): Promise<Channel> { return null; }

	}
	(FSBL as any).Clients.DesktopAgentClient = new DesktopAgentClient();
}

// Startup pattern for preload. Preloads can come in any order, so we need to wait on either the window event or the
// FSBL event
if ((window as any).FSBL && (FSBL as any).addEventListener) {
	(FSBL as any).addEventListener("onReady", setupFDC3Client);
} else {
	window.addEventListener("FSBLReady", setupFDC3Client);
}


