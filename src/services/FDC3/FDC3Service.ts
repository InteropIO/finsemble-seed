/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

const Finsemble = require("@chartiq/finsemble");
const BaseService = Finsemble.baseService;
const { RouterClient, LinkerClient, DialogManager, WindowClient, LauncherClient, DistributedStoreClient, Logger } = Finsemble.Clients;

LinkerClient.start();
DialogManager.initialize();
LauncherClient.initialize();
Logger.start();
WindowClient.initialize();
DistributedStoreClient.initialize();
DialogManager.createStore();


import DesktopAgent from './desktopAgent'
// const queryJSON = require('./objectQuery/queryJSON.js');


Logger.log("Desktop Agent starting up");

/**
 * The Desktop Agent is defined by the FDC3
 * @constructor
 */

class FDC3Service extends BaseService {
	desktopAgent: DesktopAgent;
	channels: { [key: string]: Channel } = {};

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
		this.desktopAgent = new DesktopAgent({
			FSBL: Finsemble,
		})
		const channels = await this.desktopAgent.getSystemChannels();
		for (const channel of channels) {
			this.channels[channel.id] = channel;
		}
		cb();
	}

	/**
	 * Creates router endpoints for all of our client APIs. Add servers or listeners for requests coming from your clients.
	 * @private
	 */
	createRouterEndpoints() {
		const DesktopAgentApiList = [
			"addContextListener",
			"addIntentListener",
			"broadcast",
			"findIntent",
			"findIntentsByContext",
			"getCurrentChannel",
			"getOrCreateChannel",
			"getSystemChannels",
			"joinChannel",
			"leaveCurrentChannel",
			"open",
			"raiseIntent"
		];

		for (const ApiCall of DesktopAgentApiList) {
			RouterClient.addResponder(`FDC3.DesktopAgent.${ApiCall}`, async (err: Error, queryMessage: any) => {
				// TODO: Discuss this hack vs alternates:
				// 1. One DesktopAgent per window (this is problematic because need to wrap windows, keep track of closing etc. otherwise will run into workspace issues)
				// 2. Dynamically create a new DesktopAgent each use
				// 3. Do some things completely in the client
				this.desktopAgent.windowName = (queryMessage.header.origin as string).replace("RouterClient.", "");

				try {
					let response;
					switch (ApiCall) {
						case "addContextListener":
							response = await this.desktopAgent.addContextListener(queryMessage.data.contextType, () => {
								// TODO
							})
							break;
						case "addIntentListener":
							response = await this.desktopAgent.addIntentListener(queryMessage.data.intent, () => {
								// TODO
							})
							break;
						case "broadcast":
							response = await this.desktopAgent.broadcast(queryMessage.data.context);
							break;
						case "findIntent":
							response = await this.desktopAgent.findIntent(queryMessage.data.intent, queryMessage.data.context);
							break;
						case "findIntentsByContext":
							response = await this.desktopAgent.findIntentsByContext(queryMessage.data.context);
							break;
						case "getCurrentChannel":
							response = await this.desktopAgent.getOrCreateChannel(queryMessage.data.channelId);
							break;
						case "getOrCreateChannel":
							response = await this.desktopAgent.getOrCreateChannel(queryMessage.data.channelId);
							this.channels[queryMessage.data.channelId] = response;
							break;
						case "getSystemChannels":
							response = await this.desktopAgent.getSystemChannels();
							break;
						case "joinChannel":
							response = await this.desktopAgent.joinChannel(queryMessage.data.channelId);
							break;
						case "leaveCurrentChannel":
							// This wasn't in the interface but is present in the documentation.
							throw new Error("leaveCurrentChannel is not implemented.");
							break;
						case "open":
							response = await this.desktopAgent.open(queryMessage.data.name, queryMessage.data.context);
							break;
						case "raiseIntent":
							response = await this.desktopAgent.raiseIntent(queryMessage.data.intent, queryMessage.data.context);
							break;
					}
					queryMessage.sendQueryResponse(null, JSON.parse(JSON.stringify(response)));
				} catch (err) {
					queryMessage.sendQueryResponse(err, null);
				}
			})
		}

		const ChannelApiList = [
			"addContextListener",
			"broadcast",
			"getCurrentContext"
		];

		for (const ApiCall of ChannelApiList) {
			RouterClient.addResponder(`FDC3.Channel.${ApiCall}`, async (err: Error, queryMessage: any) => {
				try {
					const channel = this.channels[queryMessage.data.channel]
					if (!channel) throw Error('Channel not found')
					let response;
					switch (ApiCall) {
						case "addContextListener":
							response = await channel.addContextListener(queryMessage.data.contextType, () => {
								// TODO
							})
							break;
						case "broadcast":
							response = await channel.broadcast(queryMessage.data.context);
							break;
						case "getCurrentContext":
							response = await channel.getCurrentContext(queryMessage.data.contextType);
							break;
					}
					queryMessage.sendQueryResponse(null, JSON.parse(JSON.stringify(response)));
				} catch (err) {
					queryMessage.sendQueryResponse(err, null);
				}
			})
		}
	}

}


const serviceInstance = new
	FDC3Service({
		name: "FDC3",
		startupDependencies: {
			// add any services or clients that should be started before your service
			services: ["authenticationService"],
			clients: []
		}
	});

serviceInstance.start();
module.exports = serviceInstance;