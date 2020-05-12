import desktopAgentUtilities from "./desktopAgentUtilities";
//import LinkerClient from "../../../finsemble/types/clients/linkerClient";
//import LauncherClient from "../../../finsemble/types/clients/launcherClient";
import Channel from "./channel";
// import * as standardIntents from './intents/standard intents.json'

interface AppIntentContexts {
	app: AppMetadata,
	intent: IntentMetadata,
	contexts: Array<string>
}
export default class D implements DesktopAgent {
	FSBL: any;
	LauncherClient: any; //typeof LauncherClient;
	LinkerClient: any; //typeof LinkerClient;
	RouterClient: any;
	systemChannels: Array<Channel> = [];
	customChannels: Array<Channel> = [];
	appIntents: { [key: string]: AppIntent } = {};
	appIntentsContext: { [key: string]: { [key: string]: AppIntent } } = {};
	apps: { [key: string]: AppMetadata } = {};
	windowName: string;

	constructor(params: any) {
		this.FSBL = params.FSBL;
		this.LinkerClient = this.FSBL.Clients.LinkerClient;
		this.LauncherClient = this.FSBL.Clients.LauncherClient;
		this.RouterClient = this.FSBL.Clients.RouterClient;
		// Make sure all existing Linker Channels get added to systemChannels. Any new channels created later will not.
		this.getSystemChannels();
		this.setupApps();
	}

	private setupApps() {
		this.RouterClient.subscribe("Launcher.update", (err: any, response: any) => {
			const components = response.data.componentList;
			this.appIntents = {};
			this.apps = {};
			for (const c of Object.values(components)) {
				const component: any = c; // putting component:any in the loop itself results in it being unknown instead of any.
				try {
					const appMetadata: AppMetadata = {
						name: component.component.type,
						title: component.component.displayName,
						tooltip: component.component.tooltip,
						icons: [component.foreign.components.Toolbar.iconURL]
					}
					this.apps[appMetadata.name] = appMetadata;
					const intents = component.foreign.services.fdc3.intents;
					if (intents.length) {
						for (const intentConfig of intents) {
							const intent: IntentMetadata = {
								name: intentConfig.name,
								displayName: intentConfig.displayName
							};
							if (!this.appIntents[intent.name]) {
								this.appIntents[intent.name] = {
									intent,
									apps: []
								}
							}
							this.appIntents[intent.name].apps.push(appMetadata);
							const contexts = intentConfig.contexts;
							if (contexts && contexts.length) {
								for (const context of contexts) {
									if (!this.appIntentsContext[context]) this.appIntentsContext[context] = {};
									if (!this.appIntentsContext[context][intent.name]) this.appIntentsContext[context][intent.name] = {
										intent,
										apps: []
									};
									this.appIntentsContext[context][intent.name].apps.push(appMetadata);
								}
							}							
						}
					}
				} catch { }
			}
			console.log(this.apps);
			console.log(this.appIntents);
			console.log(this.appIntentsContext);
		});
	}

	/** ___________Context ___________ */
	getCurrentChannel(): Promise<Channel> {
		throw new Error("Method not implemented in Service. Use Client.");
	}

	/** ___________Apps ___________ */
	async open(name: string, context?: object) {
		console.log("FDC3.desktopAgent triggered LauncherClient.spawn");
		await FSBL.Clients.LauncherClient.spawn(name, { data: { context } });
	}

	/** ___________Context ___________ */
	broadcast(context: any): void {
		throw new Error("Method not implemented in Service. Use Client.");
	}

	addContextListener(handler: ContextHandler): Listener;
	addContextListener(contextType: string, handler: ContextHandler): Listener;
	addContextListener(
		contextType: string | ContextHandler,
		handler?: ContextHandler
	): Listener {
		throw new Error("Method not implemented in Service. Use Client.");
	}

	/** ___________Intents ___________ */

	async findIntent(intent: string, context?: Context): Promise<AppIntent> {
		let appIntent: AppIntent;
		if (context) {
			const contextType = (context as any).type;
			if (this.appIntentsContext[contextType]) {
				appIntent = this.appIntentsContext[contextType][intent];
			}
		} else {
			appIntent = this.appIntents[intent];
		}
		if (appIntent) return appIntent;
		throw new Error(ResolveError.NoAppsFound);
	}

	async findIntentsByContext(context: Context): Promise<Array<AppIntent>> {
		const intents = this.appIntentsContext[(context as any).type];
		if (intents) {
			return Object.values(intents);
		}
		throw new Error(ResolveError.NoAppsFound);
	}

	async raiseIntent(
		intent: string,
		context: Context,
		target?: string
	): Promise<IntentResolution> {
		if (!this.appIntents[intent]) {
			throw new Error(ResolveError.NoAppsFound);
		}

		const availableResolvers = this.appIntents[intent];
		if (availableResolvers.apps.length === 1) {
			// if component is open, resolve with open component
			// else open component
		} else {
			// open intent resolver component
			return null;
		}


		// let resolvedIntent;
		// const {
		// 	data: componentList,
		// }: any = await FSBL.Clients.LauncherClient.getActiveDescriptors();
		// console.log("componentList", componentList);
		// const intentComponentList = desktopAgentUtilities.findAllIntentMatchesandFormatResponse(
		// 	this.fdc3Configuration,
		// 	intent,
		// 	context
		// );
		// console.log("intents:", intentComponentList);
		// desktopAgentUtilities.resolveIntent(
		// 	intent,
		// 	intentComponentList,
		// 	componentList,
		// 	context
		// );
		// console.log("return value", resolvedIntent);
		// const dataType = target + intent;
		// return null; //new { source: "source", data: context, resolution: "resolved" };
	}

	addIntentListener(intent: string, handler: ContextHandler): Listener {
		throw new Error("Method not implemented.");
	}

	/** ___________Channels ___________ */

	async getOrCreateChannel(channelId: string): Promise<Channel> {
		const channel = this.findChannel(channelId);
		if (channel) {
			return channel;
		} else {
			return await this.createCustomChannel(channelId);
		}
	}

	async getSystemChannels(): Promise<Array<Channel>> {
		if (this.systemChannels.length) return this.systemChannels;
		const finsembleLinkerChannels = this.LinkerClient.getAllChannels();
		const channels: Array<Channel> = [];

		for (const finsembleLinkerChannel of finsembleLinkerChannels) {
			const channel = new Channel({
				id: finsembleLinkerChannel.name,
				type: "system",
				displayMetadata: {
					name: finsembleLinkerChannel.name,
					color: finsembleLinkerChannel.color,
					glyph: finsembleLinkerChannel.glyph,
				},
				FSBL: this.FSBL,
			});
			channels.push(channel);
		}
		this.systemChannels = channels;
		return channels;
	}

	private findChannel(channelId: string): Channel {
		const systemChannel = this.systemChannels.find((channel) => channel.id === channelId);
		if (systemChannel) {
			return systemChannel;
		}

		const customChannel = this.systemChannels.find((channel) => channel.id === channelId);
		if (customChannel) {
			return customChannel;
		}

		return null;
	}

	async joinChannel(channelId: string): Promise<void> {
		throw new Error("Only Implemented in the Client");
	}

	private wait(time: number) {
		return new Promise((resolve) => setTimeout(resolve, time));
	}

	private async createCustomChannel(channelId: string): Promise<Channel> {
		const existingChannel = this.findChannel(channelId);
		if (existingChannel) {
			throw new Error(`Channel ${channelId} already exists`);
		}

		const channelColor = '#' + Math.floor(Math.random() * 16777215).toString(16); // generate a random color
		this.LinkerClient.createChannel({
			name: channelId,
			color: channelColor,
		}, () => { });

		const channel = new Channel({
			id: channelId,
			type: "app",
			displayMetadata: {
				name: channelId,
				color: channelColor,
				glyph: null,
			},
			FSBL: this.FSBL,
		});

		// There is a bug in the LinkerClient.createChannel that causes it to callback before the channel is created. Just wait so we don't have timing problems
		await this.wait(100);

		return channel;
	}

	leaveCurrentChannel(): Promise<void> {
		throw new Error("Method not implemented in Service. Use Client.");
	}
}
