import Channel from "./channelClient";
import { EventEmitter } from "events";
export default class DesktopAgentClient extends EventEmitter implements DesktopAgent {
	#currentChannel: Channel;
	#currentChannelContextListeners: Array<Listener> = [];

	#channelChanging: Boolean;
	#wait: (time: number) => Promise<void> = (time: number) => {
		return new Promise((resolve) => setTimeout(resolve, time));
	};
	#strict: Boolean;
	#FDC3Client: any;
	FSBL: typeof FSBL;

	constructor(strict: Boolean, FDC3Client: any, Finsemble?: typeof FSBL) {
		super();
		this.#strict = strict;
		this.#FDC3Client = FDC3Client;
		this.FSBL = Finsemble
	}

	/** ___________Apps ___________ */

	async open(name: string, context?: Context) {
		this.FSBL.Clients.Logger.log("Desktop Agent open called typescript");

		// open the component and make it join the current channel
		const { err, response } = await this.FSBL.Clients.LauncherClient.spawn(name, {
			data: {
				fdc3: { context },
				linker: (this.#currentChannel.id !== "global") ? { channels: [this.#currentChannel.id] } : undefined
			},

		}) as any;

		if (err) {
			throw err;
		}

		//FSBL.Clients.Logger.log("DesktopAgent.open response: ", response.data);
		return response.finWindow;
	}

	/** ___________Context ___________ */

	async broadcast(context: Context) {
		this.FSBL.Clients.Logger.log("Desktop Agent broadcast called");
		if (this.#currentChannel) {
			this.#currentChannel.broadcast(context);
		}
	}

	addContextListener(handler: ContextHandler): Listener;
	addContextListener(contextType: string, handler: ContextHandler): Listener;
	addContextListener(contextTypeOrHandler: string | ContextHandler, handler?: ContextHandler): Listener {
		if (!this.#currentChannel) {
			throw Error("Please join a channel prior to adding listeners");
		}
		// data sent at open
		const spawnData = this.FSBL.Clients.WindowClient.getSpawnData();
		let context = spawnData?.fdc3?.context;

		let contextListener;
		if (typeof contextTypeOrHandler === "string") {
			contextListener = this.#currentChannel.addContextListener(contextTypeOrHandler, handler);
			if (context && context.type === contextTypeOrHandler) handler(context);
		} else {
			contextListener = this.#currentChannel.addContextListener(contextTypeOrHandler);
			if (context) contextTypeOrHandler(context);
		}

		this.#currentChannelContextListeners.push(contextListener);
		return contextListener;
	}

	/** ___________Intents ___________ */
	async findIntent(intent: string, context?: Context) {
		this.FSBL.Clients.Logger.log("Desktop Agent findIntent called", intent, context);
		const { err, response } = await this.FSBL.Clients.RouterClient.query("FDC3.DesktopAgent.findIntent", { intent, context }, () => { });
		if (err) {
			throw err;
		}
		this.FSBL.Clients.Logger.log("DesktopAgent.FindIntent response: ", response.data);
		return response.data;
	}

	async findIntentsByContext(context: Context) {
		this.FSBL.Clients.Logger.log("Desktop Agent open called");
		const { err, response } = await this.FSBL.Clients.RouterClient.query("FDC3.DesktopAgent.findIntentsByContext", { context }, () => { });
		if (err) {
			throw err;
		}
		this.FSBL.Clients.Logger.log("DesktopAgent.findIntentsByContext response: ", response.data);
		return response.data;
	}

	async raiseIntent(intent: string, context: Context, target?: string) {
		this.FSBL.Clients.Logger.log("Desktop Agent raiseIntent called");
		const { err, response } = await this.FSBL.Clients.RouterClient.query("FDC3.DesktopAgent.raiseIntent", { intent, context, target },
			() => { }
		);
		if (err) {
			throw err;
		}
		console.log("DesktopAgent.raiseIntent response: ", response.data);
		return response.data;
	}

	addIntentListener(intent: string, handler: ContextHandler): Listener {
		const routerHandler: StandardCallback = (err, response) => {
			handler(response.data);
		}

		// deals with data sent at open
		const spawnData = this.FSBL.Clients.WindowClient.getSpawnData();
		if (intent === spawnData?.fdc3?.intent) {
			handler(spawnData?.fdc3?.context);
		}

		this.FSBL.Clients.RouterClient.addListener(`FDC3.intent.${intent}`, routerHandler);
		return {
			unsubscribe: () => {
				this.FSBL.Clients.RouterClient.removeListener(`FDC3.intent.${intent}`, routerHandler);
			}
		}
	}

	/** ___________Channels ___________ */
	async getOrCreateChannel(channelId: string): Promise<Channel> {
		this.FSBL.Clients.Logger.log("Desktop Agent getOrCreateChannel called typescript");
		const { err, response } = await this.FSBL.Clients.RouterClient.query("FDC3.DesktopAgent.getOrCreateChannel", { channelId }, () => { });
		if (err) {
			throw err;
		}
		this.FSBL.Clients.Logger.log("DesktopAgent.getOrCreateChannel response: ", response.data);
		return new Channel(response.data);
	}

	async getSystemChannels(): Promise<Array<Channel>> {
		this.FSBL.Clients.Logger.log("Desktop Agent getSystemChannels called typescript");
		const { err, response } = await this.FSBL.Clients.RouterClient.query("FDC3.DesktopAgent.getSystemChannels", null, () => { });
		if (err) {
			throw err;
		}
		this.FSBL.Clients.Logger.log("DesktopAgent.getSystemChannels response: ", response.data);
		const channels: Array<Channel> = [];
		for (let channelObject of response.data) {
			channelObject = { ...channelObject, FSBL: this.FSBL }
			const channel = new Channel(channelObject);
			channels.push(channel);
		}
		return channels;
	}

	async joinChannel(channelId: string) {
		if (!this.#strict) {
			// Are we already on this channel?
			const linkerChannels = Object.keys(this.FSBL.Clients.LinkerClient.channels);
			if (linkerChannels.includes(channelId)) {
				throw new Error("A Desktop Agent Already exists on this Channel");
			}
		}

		// don't do anything if you are trying to join the same channel
		if (this.#currentChannel && this.#currentChannel.id === channelId) return;


		if (this.#channelChanging) {
			throw new Error("Currently in process of changing channels. Rejecting this request. " + channelId);
		}

		// unsubscribe to everything that was already subscribed
		let oldChannel;
		if (this.#currentChannel) {
			oldChannel = this.#currentChannel.id;
			this.#channelChanging = true
			await this.leaveCurrentChannel();
		}

		// Join new channel
		const channel = await this.getOrCreateChannel(channelId);
		this.#currentChannel = channel;

		if (oldChannel) this.emit("channelChanged", oldChannel, channelId);

		if (channelId !== "global") {
			this.FSBL.Clients.LinkerClient.linkToChannel(channel.id, this.FSBL.Clients.WindowClient.getWindowIdentifier());
			this.#wait(100);
		}

		if (this.#channelChanging) {
			console.log("done Changing channel to ", channelId);
			this.#channelChanging = false;
		}

	}

	async getCurrentChannel() {
		if (this.#currentChannel) {
			return this.#currentChannel;
		} else {
			return null;
		}
	}

	async leaveCurrentChannel() {
		if (!this.#currentChannel) return;
		const channelId = this.#currentChannel.id;
		this.#currentChannel = null;
		for (let i = this.#currentChannelContextListeners.length - 1; i >= 0; i++) {
			this.#currentChannelContextListeners[i].unsubscribe();
			this.#currentChannelContextListeners.splice(i, 1);
		}

		if (channelId !== "global") {
			this.FSBL.Clients.LinkerClient.unlinkFromChannel(channelId, this.FSBL.Clients.WindowClient.getWindowIdentifier());
			this.#wait(100);
		}

		if (!this.#channelChanging) this.emit("leftChannel", channelId);
	}
}
