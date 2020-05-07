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


import desktopAgentUtilities from './desktopAgentUtilities'
import DesktopAgent from './desktopAgent'
// const queryJSON = require('./objectQuery/queryJSON.js');

Logger.start();
Logger.log("Desktop Agent starting up");



/**
 * The Desktop Agent is defined by the FDC3
 * @constructor
 */

class desktopAgentService extends BaseService {
	desktopAgent: DesktopAgent;
	channels: { [key: string]: Channel} = {};

	constructor(params: {
		name: string; startupDependencies: {
			services: string[]; clients: string[];
		};
	}) {
		super(params);
		this.initialize = this.initialize.bind(this);
		this.onBaseServiceReady(this.initialize);
		this.start();
	}
	/**
	 * Initializes service variables
	 * @private
	 */
	async initialize(cb: () => void) {
		this.createRouterEndpoints();
		Finsemble.Clients.Logger.log("desktopAgent Service ready");
		this.fdc3Configuration = await this.getFDC3Configuration();
		this.desktopAgent = new DesktopAgent({
			FSBL: Finsemble,
			fdc3Configuration: this.getFDC3Configuration			
		})
		cb();
	}

	async getFDC3Configuration() {
		this.fdc3Configuration = await desktopAgentUtilities.getAllComponentAppSpec(ConfigClient);
		console.log("Find all Intents:", this.fdc3Configuration);
		return this.fdc3Configuration;
	}

	/**
	 * Creates router endpoints for all of our client APIs. Add servers or listeners for requests coming from your clients.
	 * @private
	 */
	createRouterEndpoints() {
		RouterClient.addResponder("FDC3.desktopAgent.open", async (error: Error, queryMessage: any) => {
			if (!error) {
				console.log("Check Open Data Message:", queryMessage.data);
				if (!queryMessage.data.name) {
					Logger.error("Desktop Agent - Open without valid component name: ", queryMessage);
					queryMessage.sendQueryResponse("Error, Open requires name: " + queryMessage, null);
				} else {
					console.log("Check Open data:", queryMessage.data);
					try {
						await this.desktopAgent.open(queryMessage.data.name, queryMessage.data.context)
						queryMessage.sendQueryResponse(null, null);
					} catch (err) {
						queryMessage.sendQueryResponse(err, null);
					}
					
					

				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});

		RouterClient.addResponder("FDC3.desktopAgent.findIntent", async (error: Error, queryMessage: any) => {
			if (!error) {
				console.log("Validate findIntent Data Message:", queryMessage.data);
				if (!queryMessage.data.intent) {
					Logger.error("Desktop Agent - Find Intent without valid intent: ", queryMessage);
					queryMessage.sendQueryResponse("Error, FindIntent requires intent parameter[1]: " + queryMessage, null);
				} else {
					let responseData = this.desktopAgent.findIntent(queryMessage.data.intent, queryMessage.data.context);
					console.log("CallBack for FindIntent Occured, Informing Client");
					queryMessage.sendQueryResponse(null, responseData);
				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});

		RouterClient.addResponder("FDC3.desktopAgent.findIntentsByContext", (error: Error, queryMessage: any) => {
			if (!error) {
				console.log("Validate findIntentsByContext Data Message:", queryMessage.data);
				if (!queryMessage.data.context) {
					queryMessage.sendQueryResponse("Error, findIntentsByContext requires context parameter: " + queryMessage, null);
					Logger.error("Desktop Agent - findIntentsByContext without valid context: ", queryMessage);
				} else {
					let responseData = this.desktopAgent.findIntentsByContext(queryMessage.data.context);
					console.log("CallBack for findIntentsByContext Occured, Informing Client");
					queryMessage.sendQueryResponse(null, responseData);
				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});

		RouterClient.addResponder("FDC3.desktopAgent.broadcast", (error: Error, queryMessage: any) => {
			if (!error) {
				console.log("This function executes without error");
				if (!queryMessage.data) {
					console.log("not data provided")
					// 		queryMessage.sendQueryResponse("Error, Broadcast requires context: " + queryMessage, null);
					// 		Logger.error("Desktop Agent - Broadcast without context: ", queryMessage);
				} else {
					Logger.log("Desktop Agent - Broadcast context: ", queryMessage);
					console.log("Desktop Agent - Broadcast context: ", queryMessage);
					this.desktopAgent.broadcast(queryMessage.data);
					queryMessage.sendQueryResponse(null, queryMessage.data);
				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});

		RouterClient.addResponder("FDC3.desktopAgent.raiseIntent", async (error: Error, queryMessage: any) => {
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
					let value = await this.desktopAgent.raiseIntent(queryMessage.data.intent, queryMessage.data.context, queryMessage.data.target);
					console.log("CallBack for RaiseIntent Occured, Informing Client");
					queryMessage.sendQueryResponse(null, value);
				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});

		return this;
	}

}


const serviceInstance = new
	desktopAgentService({
		name: "desktopAgent",
		startupDependencies: {
			// add any services or clients that should be started before your service
			services: ["authenticationService"],
			clients: []
		}
	});

serviceInstance.start();
module.exports = serviceInstance;