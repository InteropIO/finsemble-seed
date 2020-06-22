import Channel from "./channelClient";
import { EventEmitter } from "events";

interface ContextTypeAndHandler {
	contextTypeOrHandler: string | ContextHandler,
	handler?: ContextHandler,
	listener: Listener
}
export default class DesktopAgentClient extends EventEmitter implements DesktopAgent {
	#currentChannel: Channel;
	#contextHandlers: { [key: string]: ContextTypeAndHandler } = {};
	#channelChanging: Boolean;
	#wait: (time: number) => Promise<void> = (time: number) => {
		return new Promise((resolve) => setTimeout(resolve, time));
	};
	#strict: Boolean;
	#FDC3Client: any;
	#FSBL: typeof FSBL;
	#log: any = console.log; //this.#FSBL.Clients.Logger.log;

	constructor(strict: Boolean, FDC3Client: any, Finsemble?: typeof FSBL) {
		super();
		this.#strict = strict;
		this.#FDC3Client = FDC3Client;
		this.#FSBL = Finsemble;

	}

	get isChannelChanging() {
		return this.#channelChanging;
	}

	/** ___________Apps ___________ */

	async open(name: string, context?: Context) {
		this.#log("DesktopAgentClient: open", name, context);

		// open the component and make it join the current channel
		const { err, response } = await this.#FSBL.Clients.LauncherClient.spawn(name, {
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
		this.#log("DesktopAgentClient: broadcast", context);
		if (this.#currentChannel) {
			this.#currentChannel.broadcast(context);
		}
	}

	addContextListener(handler: ContextHandler): Listener;
	addContextListener(contextType: string, handler: ContextHandler): Listener;
	addContextListener(contextTypeOrHandler: string | ContextHandler, handler?: ContextHandler): Listener {
		this.#log("DesktopAgentClient: addContextListener", contextTypeOrHandler, handler);

		if (!this.#currentChannel) {
			console.warn("No channels have been joined");
		}

		// data sent at open
		const spawnData = this.#FSBL.Clients.WindowClient.getSpawnData();
		let context = spawnData?.fdc3?.context;

		let contextListener = null;
		if (this.#currentChannel) {
			if (typeof contextTypeOrHandler === "string") {
				contextListener = this.#currentChannel.addContextListener(contextTypeOrHandler, handler);
				if (context) handler(context);
			} else {
				contextListener = this.#currentChannel.addContextListener(contextTypeOrHandler);
				if (context) contextTypeOrHandler(context);
			}
		}

		const contextHandlerId = Date.now() + "_" + Math.random();
		this.#contextHandlers[contextHandlerId] = {
			contextTypeOrHandler, handler,
			listener: contextListener
		}

		return {
			unsubscribe: () => {
				this.#contextHandlers[contextHandlerId].listener?.unsubscribe();
				delete this.#contextHandlers[contextHandlerId];
			}
		}
	}

	/** ___________Intents ___________ */
	async findIntent(intent: string, context?: Context) {
		this.#log("DesktopAgentClient: findIntent", intent, context);
		const { err, response } = await this.#FSBL.Clients.RouterClient.query("FDC3.DesktopAgent.findIntent", { intent, context }, () => { });
		if (err) {
			this.#FSBL.Clients.Logger.error(err)
			throw err;
		}
		this.#log("DesktopAgent.FindIntent response: ", response.data);
		return response.data;
	}

	async findIntentsByContext(context: Context) {
		this.#log("DesktopAgentClient: findIntentsByContext", context);
		const { err, response } = await this.#FSBL.Clients.RouterClient.query("FDC3.DesktopAgent.findIntentsByContext", { context }, () => { });
		if (err) {
			throw err;
		}
		this.#log("DesktopAgent.findIntentsByContext response: ", response.data);
		return response.data;
	}

	async raiseIntent(intent: string, context: Context, target?: string) {
		this.#log("DesktopAgentClient: raiseIntent", intent, context, target);
		const { err, response } = await this.#FSBL.Clients.RouterClient.query("FDC3.DesktopAgent.raiseIntent", { intent, context, target }, () => { });
		if (err) {
			this.#FSBL.Clients.Logger.error(err)
			throw err;
		}
		this.#FSBL.Clients.Logger.log("DesktopAgent.raiseIntent response: ", response.data);
		return response.data;
	}

	addIntentListener(intent: string, handler: ContextHandler): Listener {
		this.#log("DesktopAgentClient: addIntentListener", intent, handler);
		const routerHandler: StandardCallback = (err, response) => {
			handler(response.data);
		}

		// deals with data sent at open
		const spawnData = this.#FSBL.Clients.WindowClient.getSpawnData();
		if (intent === spawnData?.fdc3?.intent?.name) {
			handler(spawnData?.fdc3?.context);
		}

		this.#FSBL.Clients.RouterClient.addListener(`FDC3.intent.${intent}`, routerHandler);
		return {
			unsubscribe: () => {
				this.#FSBL.Clients.RouterClient.removeListener(`FDC3.intent.${intent}`, routerHandler);
			}
		}
	}

	/** ___________Channels ___________ */
	async getOrCreateChannel(channelId: string): Promise<Channel> {
		this.#log("DesktopAgentClient: getOrCreateChannel", channelId);
		const { err, response } = await this.#FSBL.Clients.RouterClient.query("FDC3.DesktopAgent.getOrCreateChannel", { channelId }, () => { });
		if (err) {
			throw err;
		}
		this.#log("DesktopAgent.getOrCreateChannel response: ", response.data);
		return new Channel(response.data);
	}

	async getSystemChannels(): Promise<Array<Channel>> {
		this.#log("DesktopAgentClient: getSystemChannels");
		const { err, response } = await this.#FSBL.Clients.RouterClient.query("FDC3.DesktopAgent.getSystemChannels", null, () => { });
		if (err) {
			throw err;
		}
		this.#log("DesktopAgent.getSystemChannels response: ", response.data);
		const channels: Array<Channel> = [];
		for (let channelObject of response.data) {
			channelObject = { ...channelObject, FSBL: this.#FSBL }
			const channel = new Channel(channelObject);
			channels.push(channel);
		}
		return channels;
	}

	async joinChannel(channelId: string) {
		this.#log("DesktopAgentClient: joinChanel", channelId);

		// don't do anything if you are trying to join the same channel
		if (this.#currentChannel && this.#currentChannel.id === channelId) return;

		if (!this.#strict) {
			// Are we already on this channel?
			const linkerChannels = Object.keys(this.#FSBL.Clients.LinkerClient.channels);
			if (linkerChannels.includes(channelId)) {
				throw new Error("A Desktop Agent Already exists on this Channel");
			}
		}

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

		const contextHandlerIds = Object.keys(this.#contextHandlers);
		for (const contextHandlerId of contextHandlerIds) {
			const contextHandler = this.#contextHandlers[contextHandlerId]
			let contextListener;
			if (typeof contextHandler.contextTypeOrHandler === "string") {
				contextListener = this.#currentChannel.addContextListener(contextHandler.contextTypeOrHandler, contextHandler.handler);
			} else {
				contextListener = this.#currentChannel.addContextListener(contextHandler.contextTypeOrHandler);
			}
			contextHandler.listener = contextListener;
		}

		if (oldChannel) this.emit("channelChanged", oldChannel, channelId);

		if (channelId !== "global") {
			this.#FSBL.Clients.LinkerClient.linkToChannel(channel.id, this.#FSBL.Clients.WindowClient.getWindowIdentifier());
			await this.#wait(50);
		}

		if (this.#channelChanging) {
			console.log("done Changing channel to ", channelId);
			this.#channelChanging = false;
		}

	}

	async getCurrentChannel() {
		this.#log("DesktopAgentClient: getCurrentChannel", this.#currentChannel);
		if (this.#currentChannel) {
			return this.#currentChannel;
		} else {
			return null;
		}
	}

	async leaveCurrentChannel() {
		this.#log("DesktopAgentClient: leaveCurrentChannel", this.#currentChannel);
		if (!this.#currentChannel) return;
		const channelId = this.#currentChannel.id;
		this.#currentChannel = null;

		const contextHandlerIds = Object.keys(this.#contextHandlers);
		for (const contextHandlerId of contextHandlerIds) {
			const contextHandler = this.#contextHandlers[contextHandlerId]
			contextHandler.listener.unsubscribe();
			contextHandler.listener = null;
		}

		if (channelId !== "global") {
			this.#FSBL.Clients.LinkerClient.unlinkFromChannel(channelId, this.#FSBL.Clients.WindowClient.getWindowIdentifier());
			await this.#wait(50);
		}

		if (!this.#channelChanging) this.emit("leftChannel", channelId);
	}
}
