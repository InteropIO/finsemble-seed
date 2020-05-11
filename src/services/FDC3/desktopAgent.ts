import desktopAgentUtilities from "./desktopAgentUtilities";
//import LinkerClient from "../../../finsemble/types/clients/linkerClient";
//import LauncherClient from "../../../finsemble/types/clients/launcherClient";
import Channel from "./channel";

export default class D implements DesktopAgent {
	fdc3Configuration: any;
	FSBL: any;
	LauncherClient: any; //typeof LauncherClient;
	LinkerClient: any; //typeof LinkerClient;
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

	async getSystemChannels(): Promise<Array<Channel>> {
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
		return channels;
	}

	joinChannel(channelId: string): Promise<void> {
		const joinChannelPromiseResolver = (
			resolve: () => void,
			reject: (err: string) => void
		) => {
			this.LinkerClient.linkToChannel(
				channelId,
				{ name: this.windowName },
				(err: any) => {
					if (err) {
						reject(`Could not link to channel ${err}`);
					} else {
						resolve();
					}
				}
			);
		};

		return new Promise(joinChannelPromiseResolver);
	}

	async getOrCreateChannel(channelId: string): Promise<Channel> {
		const getOrCreateChannelPromiseResolver = async (
			resolve: any,
			reject: any
		) => {
			try {
				const systemChannels: Array<Channel> = await this.getSystemChannels();
				const channelExists: Channel = systemChannels.find(
					(channel) => channel.id === channelId
				);

				if (channelExists) {
					resolve(getOrCreateChannelPromiseResolver);
				} else {
					resolve(
						new Channel({
							id: channelId,
							type: "app",
							displayMetadata: {},
							FSBL: this.FSBL,
						})
					);
				}
			} catch (error) {
				reject(`Error during getting or Creating Channel: ${error}`);
			}
		};

		return new Promise(getOrCreateChannelPromiseResolver);
	}
}
