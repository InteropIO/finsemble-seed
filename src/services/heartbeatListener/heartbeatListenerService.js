/**
 * Heartbeat Listener Service
 * This is an example service that listens for heartbeat events that indicate that windows
 * are in a bad state. It performs the following actions:
 * - Removes a window from a stack if that window enters the state "notResponding"
 * - Kills a window if it enters the state "crashed"
 * 
 * Available heartbeat events (times to reach state are configurable):
 * "notResponding"
 * "possiblyCrashed"
 * "crashed"
 * "nowResponding" (only when returning to a good state after being in one of the above states)
 */

const Finsemble = require("@chartiq/finsemble");
const RouterClient = Finsemble.Clients.RouterClient;
const BaseService = Finsemble.baseService;
const Logger = Finsemble.Clients.Logger;

class heartbeatListenerService extends BaseService {

	constructor() {
		super();
		
		this.handleHeartbeat = this.handleHeartbeat.bind(this);
	}
	/**
	 * Responds to a HeartbeatTimeout Event
	 * - Kicks windows out of a stack if they are not responding
	 * - Kills crashed windows
	 * @param {*} err 
	 * @param {*} response 
	 */
	handleHeartbeat(err, response) {
		switch(response.data.type) {		
			case "notResponding":
				//check if the window is in a stack, if so remove it, otherwise do nothing
				Finsemble.FinsembleWindow.getInstance({name: response.data.window}, (err, wrap) => {				
					wrap.getParent((err, parentWindow) => {
						if(parentWindow) {
							Logger.info("heartbeatListenerService: Removing window from stack", response.data.window);
							console.debug("heartbeatListenerService: Removing window from stack", response.data.window);
							parentWindow.removeWindow({ 
								stackedWindowIdentifier: parentWindow.identifier,
								windowIdentifier: wrap.identifier });
						}
					});				
				});
				break;			
			case "crashed":
				Finsemble.FinsembleWindow.getInstance({name: response.data.window}, (err, wrap) => {
					if (wrap) {
						Logger.info("heartbeatListenerService: Killing crashed window", response.data.window);
						console.debug("heartbeatListenerService: Killing crashed window", response.data.window);
						wrap.close();
					}
				});
				break;
			case "possiblyCrashed":
			case "nowResponding":
			default:
				break;
		}
	}
	addListeners() {
		RouterClient.addListener("Finsemble.WindowService.HeartbeatTimeout", this.handleHeartbeat);
	}

}

Logger.start();
const heartbeatInstance = new heartbeatListenerService();
heartbeatInstance.onBaseServiceReady(async (callback) => {
	heartbeatInstance.addListeners();	
	callback();
});
heartbeatInstance.start();
Logger.info("heartbeatListenerService: Starting up");