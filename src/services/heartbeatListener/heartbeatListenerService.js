const Finsemble = require("@chartiq/finsemble");
const RouterClient = Finsemble.Clients.RouterClient;
const BaseService = Finsemble.baseService;
const Logger = Finsemble.Clients.Logger;
window.Logger = Logger;
window.Finsemble = Finsemble;
debugger;
Logger.start();

class heartbeatListenerService extends BaseService {

	constructor() {
		super();
		
		this.handleHeartbeat = this.handleHeartbeat.bind(this);
	}

	handleHeartbeat(err, response) {
		console.log("HANDLEHEARTBEAT", response);
		if (response.data.type === "notResponding") {
			//break out of stack
			
			
			Finsemble.FinsembleWindow.getInstance({name: response.data.window}, (err, wrap) => {
				console.log("inside getInstance, wrap", wrap);
				wrap.getParent((err, parentWindow) => {
					if(parentWindow) {
						console.log("heartbeatListenerService: Removing window from stack", response.data.window);
						Logger.info("heartbeatListenerService: Removing window from stack", response.data.window);
						 parentWindow.removeWindow({ 
						 	stackedWindowIdentifier: parentWindow.identifier,
						 	windowIdentifier: wrap.identifier });
					}
				});				
			});
		} else if (response.data.type === "possiblyCrashed") {
			//kill the window
			console.log("heartbeatListenerService: Will kill crashed window if not dead yet", response.data.window);
			Logger.info("heartbeatListenerService: Will kill crashed window if not dead yet", response.data.window);
			Finsemble.FinsembleWindow.getInstance({name: response.data.window}, (err, wrap) => {
				if (wrap) {
					console.log("heartbeatListenerService: Killing crashed window", wrap);
					Logger.info("heartbeatListenerService: Killing crashed window", wrap);
					wrap.close();
				}
			});
		}

	}

	addListeners() {
		RouterClient.addListener("Finsemble.WindowService.HeartbeatTimeout", this.handleHeartbeat);
	}

}

console.log("BEFORE CREATING HEARTBEAT LISTENER SERVICE");
const heartbeatInstance = new heartbeatListenerService();
console.log("AFTER CREATING HEARTBEAT LISTENER SERVICE");
heartbeatInstance.onBaseServiceReady(async (callback) => {
	console.log("onBaseServiceReady called, cb", callback);
	heartbeatInstance.addListeners();
	console.log("after adding listner call");
	callback();
	console.log("after callback");
});
console.log("after baseready");
heartbeatInstance.start();
Logger.info("heartbeatListenerService: Starting up");
console.log("after start");
let finWin = Finsemble.FinsembleWindow;
console.log("finwindow", finWin)