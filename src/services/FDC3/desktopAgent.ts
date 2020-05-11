import desktopAgentUtilities from "./desktopAgentUtilities";
//import LinkerClient from "../../../finsemble/types/clients/linkerClient";
//import LauncherClient from "../../../finsemble/types/clients/launcherClient";
import Channel from "./channel"

export default class D implements DesktopAgent {
	fdc3Configuration: any;
	FSBL: any;
	LauncherClient: any; //typeof LauncherClient;
	LinkerClient: any; //typeof LinkerClient;
	systemChannels: Array<Channel> = [];
	customChannels: Array<Channel> = [];
	windowName: string;

	constructor(params: any) {
		this.fdc3Configuration = params.fdc3Configuration;
		this.FSBL = params.FSBL;
		this.LinkerClient = this.FSBL.Clients.LinkerClient;
		this.LauncherClient = this.FSBL.Clients.LauncherClient;
		// Make sure all existing Linker Channels get added to sytemChannels. Any new channels created later will not.
		this.getSystemChannels();
	}

	addContextListener(handler: ContextHandler): Listener;
	addContextListener(contextType: string, handler: ContextHandler): Listener;
	addContextListener(contextType: string | ContextHandler, handler?: ContextHandler): Listener {
		throw new Error("Method not implemented.");
	}

	addIntentListener(intent: string, handler: ContextHandler): Listener {
		throw new Error("Method not implemented.");
	}

	async open(name: string, context?: object) {
		console.log("FDC3.desktopAgent triggered LauncherClient.spawn");
		await FSBL.Clients.LauncherClient.spawn(name, { data: { context } });
	}

	async findIntent(intent: string, context?: Context): Promise<AppIntent> {
		var appIntentMatches = desktopAgentUtilities.findAllIntentMatchesandFormatResponse(
			this.fdc3Configuration,
			intent,
			context
		);
		console.log("All Formatted Matches: ", appIntentMatches);

		if (Array.isArray(appIntentMatches)) {
			return appIntentMatches[0];
		} else {
			return appIntentMatches;
		}
	}

	findIntentsByContext(context: Context): Promise<Array<AppIntent>> {
		var appIntentMatches = desktopAgentUtilities.findAllContextMatchesandFormatResponse(
			this.fdc3Configuration,
			context
		);
		console.log("All Formatted Matches: ", appIntentMatches);
		return appIntentMatches;
	}

	broadcast(context: any): void {
		throw new Error("Use the client.")
	}

	async raiseIntent(
		intent: string,
		context: Context,
		target?: string
	): Promise<IntentResolution> {
		let resolvedIntent;
		const {
			data: componentList,
		}: any = await FSBL.Clients.LauncherClient.getActiveDescriptors();
		console.log("componentList", componentList);
		const intentComponentList = desktopAgentUtilities.findAllIntentMatchesandFormatResponse(
			this.fdc3Configuration,
			intent,
			context
		);
		console.log("intents:", intentComponentList);
		desktopAgentUtilities.resolveIntent(
			intent,
			intentComponentList,
			componentList,
			context
		);
		console.log("return value", resolvedIntent);
		const dataType = target + intent;
		return null; //new { source: "source", data: context, resolution: "resolved" };
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
					glyph: finsembleLinkerChannel.glyph
				},
				FSBL: this.FSBL
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

	private createCustomChannel(channelId: string): Channel {
		const existingChannel = this.findChannel(channelId);
		if (existingChannel) {
			throw new Error(`Channel ${channelId} already exists`);
		}
		const channelColor = Math.floor(Math.random()*16777215).toString(16); // generate a random color
		
		// There is a bug in the LinkerClient.createChannel that causes it to callback before the channel is created. 
		// When that is fixed, recommend promisifying the function. Not doing any complex callback async here.
		// Just remember that this can return before the channel exists so creating and immediately broadcasting might not work.
		// This is unlikely to cause problems because there need to be subscribers to make that useful.
		FSBL.Clients.LinkerClient.createChannel({
			name: channelId,
			color: channelColor,
		}, () => {});

		const channel = new Channel({
			id: channelId, 
			type: "app", 
			displayMetadata: {
				name: channelId,
				color: channelColor,
				glyph: null,
			},
			FSBL: this.FSBL
		});
		return channel;
	}

	async getOrCreateChannel(channelId: string): Promise<Channel> {
		const channel = this.findChannel(channelId);
		if (channel) {
			return channel;
		} else {
			return this.createCustomChannel(channelId);
		}
	}
}
