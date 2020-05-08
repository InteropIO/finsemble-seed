import desktopAgentUtilities from "./desktopAgentUtilities";
//import LinkerClient from "../../../finsemble/types/clients/linkerClient";
//import LauncherClient from "../../../finsemble/types/clients/launcherClient";
import Channel from "./channel"

export default class D implements DesktopAgent {
	fdc3Configuration: any;
	FSBL: any;
	LauncherClient: any; //typeof LauncherClient;
	LinkerClient: any; //typeof LinkerClient;
	systemChannels: Array<Channel>;
	customChannels: Array<Channel>;
	windowName: string;

	constructor(params: any) {
		this.fdc3Configuration = params.fdc3Configuration;
		this.FSBL = params.FSBL;
		this.LinkerClient = this.FSBL.Clients.LinkerClient;
		this.LauncherClient = this.FSBL.Clients.LauncherClient;
	}

	addContextListener(contextType: string, handler: ContextHandler): Listener {
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
		// TODO: Replace this for the linker
		FSBL.Clients.RouterClient.transmit("broadcast", context);
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

	private setSystemChannels() {
		const finsembleLinkerChannels = this.LinkerClient.getAllChannels();

		this.systemChannels = finsembleLinkerChannels.map((linkerChannel: any) => {
			// TODO: this is just a shell and need to be padded out with the logic
			const { id, type } = linkerChannel;
			const channel = new Channel(id, type, null);
			return channel;
		});
	}

	async getSystemChannels(): Promise<Array<Channel>> {
		const finsembleLinkerChannels = this.LinkerClient.getAllChannels();
		const channels: Array<Channel> = [];

		for (const finsembleLinkerChannel of finsembleLinkerChannels) {
			const channel = new Channel(finsembleLinkerChannel.name, "system", {
				name: finsembleLinkerChannel.name,
				color: finsembleLinkerChannel.color,
				glyph: finsembleLinkerChannel.glyph
			});
			channels.push(channel);
		}
		return channels;
	}

	joinChannel(channelId: string): Promise<void> {
		const joinChannelPromiseResolver = (resolve: () => void, reject: (err: string) => void) => {
			this.LinkerClient.linkToChannel(channelId, {name: this.windowName}, (err: any) => {
				if (err) {
					reject(`Could not link to channel ${err}`);
				} else {
					resolve();
				}	
			});
		};

		return new Promise(joinChannelPromiseResolver);
	}

	private createCustomChannel(channelId: string): Channel {
		return;
	}

	getOrCreateChannel(channelId: string): Promise<Channel> {
		const channel = (resolve: any, reject: any) => {
			try {
				const systemChannels = this.systemChannels.find(
					(channel) => channel.id === channelId
				);

				resolve(
					systemChannels ? systemChannels : this.createCustomChannel(channelId)
				);
			} catch (error) {
				reject(`Error during getting or Creating Channel: ${error}`);
			}
		};

		return new Promise(channel);
	}
}
