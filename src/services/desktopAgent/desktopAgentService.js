/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

const Finsemble = require("@chartiq/finsemble");
// // import Finsemble from "@chartiq/finsemble";
const BaseService = Finsemble.baseService;
const ConfigClient = Finsemble.Clients.ConfigClient;
const LauncherClient = Finsemble.Clients.LauncherClient;
const RouterClient = Finsemble.Clients.RouterClient;
const LinkerClient = Finsemble.Clients.LinkerClient;
const Logger = Finsemble.Clients.Logger;

const desktopAgentUtilities = require('./desktopAgentUtilities.js');

Logger.start();
Logger.log("Desktop Agent starting up");

/**
 * The Desktop Agent is defined by the FDC3 
 * @constructor
 */

function desktopAgentService() {

	const self = this;
	this.fdc3Configuration;

	var getFDC3Congifuration = async function getFDC3Congifuration() {
		this.fdc3Configuration = await desktopAgentUtilities.getAllComponentAppSpec();
		console.log("Find all Intents:", this.fdc3Configuration);
		return this.fdc3Configuration;
	}

	/**
	 * Initializes service variables
	 * @private
	 */
	this.initialize = function () {
		getFDC3Congifuration().then((value) => {
			this.fdc3Configuration = value;
		});
	}

	/**
	 * Creates router endpoints for all of our client APIs. Add servers or listeners for requests coming from your clients.
	 * @private
	 */
	this.createRouterEndpoints = function () {

		RouterClient.addResponder("desktopAgentOpen", function (error, queryMessage) {
			if (!error) {
				console.log("Check Open Data Message:", queryMessage.data);
				if (!queryMessage.data.name) {
					Logger.error("Desktop Agent - Open without valid component name: ", queryMessage);
					queryMessage.sendQueryResponse("Error, Open requires name: " + queryMessage, null);
				} else {
					console.log("Check Open data:", queryMessage.data);
					serviceInstance.open(queryMessage.data.name, queryMessage.data.context, (err, response) => {
						console.log("CallBack for Open Occured to send response");
						queryMessage.sendQueryResponse(err, response);
					});

				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});

		RouterClient.addResponder("desktopAgentFindIntent", function (error, queryMessage) {
			if (!error) {
				console.log("Validate findIntent Data Message:", queryMessage.data);
				if (!queryMessage.data.intent) {
					Logger.error("Desktop Agent - Find Intent without valid intent: ", queryMessage);
					queryMessage.sendQueryResponse("Error, FindIntent requires intent parameter[1]: " + queryMessage, null);
				} else {
					let responseData = serviceInstance.findIntent(queryMessage.data.intent, queryMessage.data.context);
					console.log("CallBack for FindIntent Occured, Informing Client");
					queryMessage.sendQueryResponse(null, responseData);
				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});

		RouterClient.addResponder("desktopAgentFindIntentsByContext", function (error, queryMessage) {
			if (!error) {
				console.log("Validate findIntentsByContext Data Message:", queryMessage.data);
				if (!queryMessage.data.context) {
					queryMessage.sendQueryResponse("Error, findIntentsByContext requires context parameter: " + queryMessage, null);
					Logger.error("Desktop Agent - findIntentsByContext without valid context: ", queryMessage);
				} else {
					let responseData = serviceInstance.findIntentsByContext(queryMessage.data.context);
					console.log("CallBack for findIntentsByContext Occured, Informing Client");
					queryMessage.sendQueryResponse(null, responseData);
				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});

		RouterClient.addResponder("desktopAgentBroadcast", function (error, queryMessage) {
			if (!error) {
				console.log("This function executes without error");
				if (!queryMessage.data) {
					console.log("not data provided")
					// 		queryMessage.sendQueryResponse("Error, Broadcast requires context: " + queryMessage, null);
					// 		Logger.error("Desktop Agent - Broadcast without context: ", queryMessage);
				} else {
					Logger.log("Desktop Agent - Broadcast context: ", queryMessage);
					console.log("Desktop Agent - Broadcast context: ", queryMessage);
					serviceInstance.broadcast(queryMessage.data);
					queryMessage.sendQueryResponse(null, queryMessage.data);
				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});

		RouterClient.addResponder("desktopAgentRaiseIntent", function (error, queryMessage) {
			if (!error) {
				console.log("Check Intent Data Message:", queryMessage.data);
				if (!queryMessage.data.intent) {
					queryMessage.sendQueryResponse("Error, RaiseIntent requires Intent parameter: " + queryMessage, null);
					Logger.error("Desktop Agent - Raise Intent without valid Intent: ", queryMessage);
				} else if (queryMessage.data.context) {
					queryMessage.sendQueryResponse("Error, RaiseIntent requires Context data: " + queryMessage, null);
					Logger.error("Desktop Agent - Raise Intent without valid Context: ", queryMessage);
				}
				else {
					console.log("Check RaiseIntent Data intent:", queryMessage.data.intent);
					console.log("Check RaiseIntent Data context:", queryMessage.data.context);
					console.log("Check RaiseIntent Data target:", queryMessage.data.target);
					serviceInstance.raiseIntent(queryMessage.data.intent, queryMessage.data.context, queryMessage.data.target, () => {
						console.log("CallBack for RaiseIntent Occured, Informing Client");
						queryMessage.sendQueryResponse(null, queryMessage.data);
					});

				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});

		RouterClient.addResponder("desktopAgentAddIntentListener", function (error, queryMessage) {
			if (!error) {
				console.log("Check Intent Data Message:", queryMessage.data);
				if (!queryMessage.data.intent) {
					queryMessage.sendQueryResponse("Error, RaiseIntent requires Intent parameter: " + queryMessage, null);
					Logger.error("Desktop Agent - Raise Intent without valid Intent: ", queryMessage);
				} else if (queryMessage.data.context) {
					queryMessage.sendQueryResponse("Error, RaiseIntent requires Context data: " + queryMessage, null);
					Logger.error("Desktop Agent - Raise Intent without valid Context: ", queryMessage);
				}
				else {
					console.log("Check RaiseIntent Data intent:", queryMessage.data.intent);
					console.log("Check RaiseIntent Data context:", queryMessage.data.context);
					console.log("Check RaiseIntent Data target:", queryMessage.data.target);
					serviceInstance.raiseIntent(queryMessage.data.intent, queryMessage.data.context, queryMessage.data.target, () => {
						console.log("CallBack for RaiseIntent Occured, Informing Client");
						queryMessage.sendQueryResponse(null, queryMessage.data);
					});

				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});

		RouterClient.addResponder("desktopAgentAddContextListener", function (error, queryMessage) {
			if (!error) {
				console.log("Check Intent Data Message:", queryMessage.data);
				if (!queryMessage.data.intent) {
					queryMessage.sendQueryResponse("Error, FindIntent requires Intent parameter: " + queryMessage, null);
					Logger.error("Desktop Agent - Find Intent without valid Intent: ", queryMessage);
				} else {
					console.log("Check FindIntent Data intent:", queryMessage.data.intent);
					console.log("Check FindIntent Data context:", queryMessage.data.context);
					serviceInstance.findIntent(queryMessage.data.intent, queryMessage.data.context, () => {
						console.log("CallBack for FindIntent Occured, Informing Client");
						queryMessage.sendQueryResponse(null, queryMessage.data);
					});

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
	this.open = function (name, context, callback) {
		LauncherClient.spawn(name, { data: { context } }, (err, response) => {
			console.log("FDC3.desktopAgent triggered LauncherClient.spawn");
			callback(err, response);
		});
		return this;
	}

	// findIntent
	// findIntent(intent: string, context?: Context): Promise<AppIntent>;
	this.findIntent = function (intent, context) {
		var appIntentMatches = desktopAgentUtilities.findAllIntentMatchesandFormatResponse(this.fdc3Configuration, intent, context);
		console.log("All Formatted Matches: ", appIntentMatches);
		return appIntentMatches;
	}

	// findIntentsByContext
	// findIntentsByContext(context: Context): Promise<Array<AppIntent>>;
	this.findIntentsByContext = function (context) {
		var appIntentMatches = desktopAgentUtilities.findAllContextMatchesandFormatResponse(this.fdc3Configuration, context);
		console.log("All Formatted Matches: ", appIntentMatches);
		return appIntentMatches;
	}

	// broadcast
	// broadcast(context: Context): void;
	this.broadcast = function (context) {
		RouterClient.transmit("broadcast", context);
		// Logger.log("Desktop Agent - Broadcast:", context);
		return this;
	}

	// raiseIntent
	// raiseIntent(intent: string, context: Context, target?: string): Promise<IntentResolution>;
	this.raiseIntent = function (intent, context, target) {
		var appList = this.findIntent(intent, context).then(
			console.log("Theoretically Found Intent")
		)

		//pass context on intent channel to an intentlistener
		// Should be able to take component name and only trigger intent to that component type
		//transmit, topic = intent
		// LauncherClient.spawn(name, { data: { context } }, (err, response) => {
		// 	console.log("Mark Spawn Occured");
		// 	callback();
		// }
		// );
		return this;
	}

	// addIntentListener
	// addIntentListener(intent: string, handler: (context: Context) => void): Listener;
	this.addIntentListener = function (intent) {
		//does this need handler as an arguement??
	}

	// addContextListener
	// addContextListener(handler: (context: Context) => void): Listener;
	this.addContextLstener = function (context) {

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
	serviceInstance.initialize();
	Logger.log("Desktop Agent Online");
	callback();
});

serviceInstance.start();
module.exports = serviceInstance;