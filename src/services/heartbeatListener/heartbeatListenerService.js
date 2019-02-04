setTimeout(() => {
const Finsemble = require("@chartiq/finsemble");
const RouterClient = Finsemble.Clients.RouterClient;
const BaseService = Finsemble.baseService;
const Logger = Finsemble.Clients.Logger;
window.Logger = Logger;
debugger;
Logger.start();

class heartbeatListenerService extends BaseService {

	constructor() {
		super();
		
		this.handleHeartbeat = this.handleHeartbeat.bind(this);
	}

	handleHeartbeat(err, response) {
		console.log("HANDLEHEARTBEAT", response);
		if (response.type === "notResponding") {
			//break out of stack
			Finsemble.FinsembleWindow.getInstance(response.window, (err, wrap) => {
				let parentWindow = wrap.parentWindow;
				if(parentWindow) {
					Logger.info("heartbeatListenerService: Removing window from stack", response.window);
					parentWindow.removeWindow({ 
						stackedWindowIdentifier: parentWindow.identifier,
						windowIdentifier: wrap.windowIdentifier });
				}
			});
		} else if (response.type === "crashed") {
			//kill the window
			Logger.info("heartbeatListenerService: Killing crashed window", response.window);
			Finsemble.FinsembleWindow.getInstance(response.window, (err, wrap) => {
				wrap.close();
			});
		}

	}

	addListeners() {
		RouterClient.addListener("HEARTBEAT_TIMEOUT_CHANNEL", this.handleHeartbeat);
	}

}

console.log("BEFORE CREATING HEARTBEAT LISTENER SERVICE");
const heartbeatInstance = new heartbeatListenerService();
console.log("AFTER CREATING HEARTBEAT LISTENER SERVICE");
heartbeatInstance.onBaseServiceReady(async (callback) => {
	console.log("onBaseServiceReady called, cb", callback);
	debugger;
	heartbeatInstance.addListeners();
	console.log("after adding listner call");
	callback();
	console.log("after callback");
});
console.log("after baseready");
heartbeatInstance.start();
console.log("after start");}, 5000);