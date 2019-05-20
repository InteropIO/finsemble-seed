/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

const Finsemble = require("@chartiq/finsemble");
// import Finsemble from "@chartiq/finsemble";
const BaseService = Finsemble.baseService;
const ConfigClient = Finsemble.Clients.ConfigClient;
const LauncherClient = Finsemble.Clients.LauncherClient;
const RouterClient = Finsemble.Clients.RouterClient;
const Logger = Finsemble.Clients.Logger;
Logger.start();
Logger.log("Desktop Agent starting up");

//findIntent
// findIntent(intent: string, context?: Context): Promise<AppIntent>;

//findIntentsByContext
// findIntentsByContext(context: Context): Promise<Array<AppIntent>>;




// broadcast
// broadcast(context: Context): void;

// raiseIntent
// raiseIntent(intent: string, context: Context, target?: string): Promise<IntentResolution>;

// addIntentListener
// addIntentListener(intent: string, handler: (context: Context) => void): Listener;

// addContextListener
// addContextListener(handler: (context: Context) => void): Listener;


/**
 * The Desktop Agent is defined by the FDC3 
 * @constructor
 */

function desktopAgentService() {
	const self = this;

	/**
	 * Creates router endpoints for all of our client APIs. Add servers or listeners for requests coming from your clients.
	 * @private
	 */
	this.createRouterEndpoints = function () {
		RouterClient.addResponder("desktopAgentBroadcast", function(error, queryMessage) {
			if (!error) {
				if (!queryMessage.data) {
					queryMessage.sendQueryResponse("Error, Broadcast requires context: " + queryMessage, null);
					Logger.error("Desktop Agent - Broadcast without context: ", queryMessage);
				} else {
					queryMessage.sendQueryResponse(null, serviceInstance.broadcast(queryMessage.data));
				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});
	
		// RouterClient.addListener(
		return this;
	}

	// open
	// open(name: string, context?: Context): Promise<void>;
	this.open = function (name, context) {
		return this;
	}
	
	// broadcast
	// broadcast(context: Context): void;
	this.broadcast = function (context) {
		RouterClient.transmit("broadcast", context);
		Logger.log("Desktop Agent - Broadcast:", context);
		return this;
	}
}


desktopAgentService.prototype = new Finsemble.baseService({
	startupDependencies: {
		// add any services or clients that should be started before your service
		services: ["authenticationService"],
		clients: [/* "storageClient" */]
	}
});

const serviceInstance = new desktopAgentService('desktopAgentService');

serviceInstance.onBaseServiceReady(function (callback) {
	serviceInstance.createRouterEndpoints();
	Logger.log("Desktop Agent Online");
	callback();
});

serviceInstance.start();
module.exports = serviceInstance;





























// class desktopAgentService extends BaseService {
// 	/**
// 	 * @constructor
// 	 * @param {string} params.name name of the service
// 	 * @param {object} params.startupDependencies
// 	 * @param {array} params.startupDependencies.clients Clients to wait on before initializing the service
// 	 * @param {array} params.startupDependencies.services Services to wait on before initializing the service
// 	 * @param {object} params.shutdownDependencies
// 	 * @param {array} params.shutdownDependencies.services Services to wait on before shutting down the service
// 	 **/
// 	constructor(params) {
// 		if (!params || params === undefined) params = {};
// 		params.name = "desktopAgentService";

// 		super(params);
// 		this.bindCorrectContext();
// 		this.onBaseServiceReady(this.initialize);
// 		this.start();
// 	}

// 	bindCorrectContext() {
// 		this.initialize = this.initialize.bind(this);
// 	}

// 	/**
// 	 * Initializes the service
// 	 *
// 	 * @param {function} cb Callback
// 	 */
// 	async initialize(cb) {
// 		Logger.system.log("Desktop Agent Initialize");

// 		distributedStoreClient.createStore({
// 			store: "Desktop_Agent",
// 			global: true,
// 			values: {
// 				clients: {}
// 			}
// 		}, function (err, desktopAgentServiceStore) {
// 			cb();
// 		});
// 	}
// }

// export default new desktopAgentService(
// 	{
// 		startupDependencies: {
// 			services: ["preferencesService", "storageService", "windowService", "configService", "routerService"],
// 			clients: ["distributedStoreClient", "storageClient", "routerClient", "launcherClient"]
// 		},
// 		shutdownDependencies: {
// 			services: ["startupLauncherService"]
// 		}
// 	}
// );