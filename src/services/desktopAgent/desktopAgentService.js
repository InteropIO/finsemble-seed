/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

const Finsemble = require("@chartiq/finsemble");
const BaseService = Finsemble.baseService;
const ConfigClient = Finsemble.Clients.ConfigClient;
const LauncherClient = Finsemble.Clients.LauncherClient;
const RouterClient = Finsemble.Clients.RouterClient;
const Logger = Finsemble.Clients.Logger;
const Globals = window;


const desktopAgentUtilities = require('./desktopAgentUtilities.js');
const queryJSON = require('./objectQuery/queryJSON.js');

Logger.start();
Logger.log("Desktop Agent starting up");

/**
 * The Desktop Agent is defined by the FDC3 
 * @constructor
 */

class desktopAgentService extends BaseService {
	constructor(params) {
		super(params);
		this.initialize = this.initialize.bind(this);
		this.onBaseServiceReady(this.initialize);
		this.start();
	}

	async getFDC3Configuration() {
		this.fdc3Configuration = await desktopAgentUtilities.getAllComponentAppSpec();
		console.log("Find all Intents:", this.fdc3Configuration);
		return this.fdc3Configuration;
	}

	/**
	 * Initializes service variables
	 * @private
	 */
	async initialize(cb) {
		this.createRouterEndpoints();
		this.fdc3Configuration = await this.getFDC3Configuration();
		cb();
	}

	/**
	 * Creates router endpoints for all of our client APIs. Add servers or listeners for requests coming from your clients.
	 * @private
	 */
	createRouterEndpoints() {
		RouterClient.addResponder("FDC3.desktopAgent.open", function (error, queryMessage) {
			if (!error) {
				console.log("Check Open Data Message:", queryMessage.data);
				if (!queryMessage.data.name) {
					Logger.error("Desktop Agent - Open without valid component name: ", queryMessage);
					queryMessage.sendQueryResponse("Error, Open requires name: " + queryMessage, null);
				} else {
					console.log("Check Open data:", queryMessage.data);
					this.open(queryMessage.data.name, queryMessage.data.context, (err, response) => {
						console.log("CallBack for Open Occured to send response");
						queryMessage.sendQueryResponse(err, response);
					});

				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});

		RouterClient.addResponder("FDC3.desktopAgent.findIntent", function (error, queryMessage) {
			if (!error) {
				console.log("Validate findIntent Data Message:", queryMessage.data);
				if (!queryMessage.data.intent) {
					Logger.error("Desktop Agent - Find Intent without valid intent: ", queryMessage);
					queryMessage.sendQueryResponse("Error, FindIntent requires intent parameter[1]: " + queryMessage, null);
				} else {
					let responseData = this.findIntent(queryMessage.data.intent, queryMessage.data.context);
					console.log("CallBack for FindIntent Occured, Informing Client");
					queryMessage.sendQueryResponse(null, responseData);
				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});

		RouterClient.addResponder("FDC3.desktopAgent.findIntentsByContext", function (error, queryMessage) {
			if (!error) {
				console.log("Validate findIntentsByContext Data Message:", queryMessage.data);
				if (!queryMessage.data.context) {
					queryMessage.sendQueryResponse("Error, findIntentsByContext requires context parameter: " + queryMessage, null);
					Logger.error("Desktop Agent - findIntentsByContext without valid context: ", queryMessage);
				} else {
					let responseData = this.findIntentsByContext(queryMessage.data.context);
					console.log("CallBack for findIntentsByContext Occured, Informing Client");
					queryMessage.sendQueryResponse(null, responseData);
				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});

		RouterClient.addResponder("FDC3.desktopAgent.broadcast", function (error, queryMessage) {
			if (!error) {
				console.log("This function executes without error");
				if (!queryMessage.data) {
					console.log("not data provided")
					// 		queryMessage.sendQueryResponse("Error, Broadcast requires context: " + queryMessage, null);
					// 		Logger.error("Desktop Agent - Broadcast without context: ", queryMessage);
				} else {
					Logger.log("Desktop Agent - Broadcast context: ", queryMessage);
					console.log("Desktop Agent - Broadcast context: ", queryMessage);
					this.broadcast(queryMessage.data);
					queryMessage.sendQueryResponse(null, queryMessage.data);
				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});

		RouterClient.addResponder("FDC3.desktopAgent.raiseIntent", async (error, queryMessage) => {
			if (!error) {
				console.log("Check Intent Data Message:", queryMessage.data);
				if (!queryMessage.data.intent) {
					queryMessage.sendQueryResponse("Error, RaiseIntent requires Intent parameter: " + queryMessage, null);
					Logger.error("Desktop Agent - Raise Intent without valid Intent: ", queryMessage);
				} else if (!queryMessage.data.context) {
					queryMessage.sendQueryResponse("Error, RaiseIntent requires Context data: " + queryMessage, null);
					Logger.error("Desktop Agent - Raise Intent without valid Context: ", queryMessage);
				}
				else {
					console.log("Check RaiseIntent Data intent:", queryMessage.data.intent);
					console.log("Check RaiseIntent Data context:", queryMessage.data.context);
					console.log("Check RaiseIntent Data target:", queryMessage.data.target);
					let value = await this.raiseIntent(queryMessage.data.intent, queryMessage.data.context, queryMessage.data.target);
					console.log("CallBack for RaiseIntent Occured, Informing Client");
					queryMessage.sendQueryResponse(null, value);
				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});

		return this;
	}

	//Begin Implementation

	// open
	// open(name: string, context?: Context): Promise<void>;
	open(name, context, callback) {
		LauncherClient.spawn(name, { data: { context } }, (err, response) => {
			console.log("FDC3.desktopAgent triggered LauncherClient.spawn");
			callback(err, response);
		});
		return this;
	}

	// findIntent
	// findIntent(intent: string, context?: Context): Promise<AppIntent>;
	findIntent(intent, context) {
		var appIntentMatches = desktopAgentUtilities.findAllIntentMatchesandFormatResponse(this.fdc3Configuration, intent, context);
		console.log("All Formatted Matches: ", appIntentMatches);

		if (Array.isArray(appIntentMatches)) {
			return appIntentMatches[0];
		} else {
			return appIntentMatches;
		}
	}

	// findIntentsByContext
	// findIntentsByContext(context: Context): Promise<Array<AppIntent>>;
	findIntentsByContext(context) {
		var appIntentMatches = desktopAgentUtilities.findAllContextMatchesandFormatResponse(this.fdc3Configuration, context);
		console.log("All Formatted Matches: ", appIntentMatches);
		return appIntentMatches;
	}

	// broadcast
	// broadcast(context: Context): void;
	broadcast(context) {
		RouterClient.transmit("broadcast", context);
		return this;
	}

	// raiseIntent
	// raiseIntent(intent: string, context: Context, target?: string): Promise<IntentResolution>;
	async raiseIntent(intent, context, target) {
		let resolvedIntent;
		const { data: componentList }  = await LauncherClient.getActiveDescriptors();
		console.log("componentList", componentList);
		const intentComponentList = desktopAgentUtilities.findAllIntentMatchesandFormatResponse(this.fdc3Configuration, intent, context);
		console.log("intents:", intentComponentList)
		desktopAgentUtilities.resolveIntent(intent, intentComponentList, componentList, context);
		console.log("return value", resolvedIntent);
		const dataType = target + intent;
		return { dataType: dataType, data: context };
	}

}


const serviceInstance = new desktopAgentService({
	name: "desktopAgent",
	startupDependencies: {
		// add any services or clients that should be started before your service
		services: ["authenticationService"],
		clients: []
	}
});

module.exports = serviceInstance;