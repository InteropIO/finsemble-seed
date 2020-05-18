import DesktopAgent from "./desktopAgentClient";
import Channel from "./channelClient";

declare global {
	interface Window {
		fdc3: DesktopAgent
	}
}

const win = window as Window;

class FDC3Client {
	desktopAgents: Array<DesktopAgent> = [];
	#desktopAgentsByChannel: { [key: string]: DesktopAgent } = {};
	#updateDesktopAgents: (initialRun?: boolean) => Promise<void>;
	#wait: (time: number) => Promise<unknown>;

	constructor() {
		const createGlobalAgent = async () => {
			debugger;
			win.fdc3 = await this.getOrCreateDesktopAgent("global");
		}
		createGlobalAgent();
		

		this.#wait = (time: number) => {
			return new Promise((resolve) => setTimeout(resolve, time));
		}

		// create desktopAgents for all current Linker Channels
		this.#updateDesktopAgents = async (initialRun: boolean = false) => {
			const desktopAgentChannels = Object.keys(this.#desktopAgentsByChannel);
			const linkerState = FSBL.Clients.LinkerClient.getState();
			const validLinkerChannels = linkerState.channels.map((channel: any) => channel.name);

			// work around workspace linker bug 
			if (initialRun) {
				const linkerChannels = Object.keys(FSBL.Clients.LinkerClient.channels);	
				const channelsToRemove = linkerChannels.filter(channel => !validLinkerChannels.includes(channel));
				for(const channel of channelsToRemove) {
					FSBL.Clients.LinkerClient.unlinkFromChannel(channel, finsembleWindow.identifier);
				}
				this.#wait(100);
				for (const channel of linkerChannels) {
					await this.getOrCreateDesktopAgent(channel);
				}
			} else {
				const desktopAgentsToRemove = desktopAgentChannels.filter(channel => !validLinkerChannels.includes(channel));

				for (const channel of desktopAgentsToRemove) {
					if (channel === "global") continue;
					await this.#desktopAgentsByChannel[channel].leaveCurrentChannel();
					delete this.#desktopAgentsByChannel[channel];
				}
				for (const channel of validLinkerChannels) {
					await this.getOrCreateDesktopAgent(channel);
				}
			}
			
			this.desktopAgents = Object.values(this.#desktopAgentsByChannel);
		};
		
		this.#updateDesktopAgents(true);

		FSBL.Clients.LinkerClient.linkerStore.addListener({}, async () => { await this.#updateDesktopAgents() });
	}

	/**
	 * Gets or Creates a Desktop Agent for a the channel. If the channel does not exist, it will be created.
	 * @param channel 
	 */
	async getOrCreateDesktopAgent(channel: string): Promise<DesktopAgent> {
		if (this.#desktopAgentsByChannel[channel]) {
			return this.#desktopAgentsByChannel[channel];
		}
		// If a desktop agent does not exist, create one
		const desktopAgent = new DesktopAgent();
		await desktopAgent.joinChannel(channel);
		this.#desktopAgentsByChannel[channel] = desktopAgent;
		this.desktopAgents.push(desktopAgent);

		// What if someone directly calls leaveCurrentChannel on the desktopAgent
		const leaveChannelListener = (leftChannel: string) => {
			desktopAgent.removeListener("leftChannel", leaveChannelListener);
			desktopAgent.removeAllListeners();
			if (this.#desktopAgentsByChannel[leftChannel]) {
				delete this.#desktopAgentsByChannel[leftChannel];
				this.desktopAgents = Object.values(this.#desktopAgentsByChannel);
			}
		}
		desktopAgent.addListener("leftChannel", leaveChannelListener);

		// What if someone changes the channel by calling joinChannel
		desktopAgent.addListener("channelChanged", (oldChannel, newChannel) => {
			delete this.#desktopAgentsByChannel[oldChannel];
			if (this.#desktopAgentsByChannel[newChannel]) {
				this.#desktopAgentsByChannel[newChannel].leaveCurrentChannel();
			}
			this.#desktopAgentsByChannel[newChannel] = desktopAgent;
			this.desktopAgents = Object.values(this.#desktopAgentsByChannel);
		})
		return desktopAgent;
	}

	/**
	 * Calls broadcast on all Desktop Agents
	 * @param context 
	 */
	broadcast(context: Context) {
		for (const desktopAgent of this.desktopAgents) {
			try {
				desktopAgent.broadcast(context);
			} catch { }
		}
	}

	/**
	 * Ability to get system channels without having to create a desktop agent.
	 */
	async getSystemChannels() {
		const { err, response } = await FSBL.Clients.RouterClient.query("FDC3.DesktopAgent.getSystemChannels", null, () => { });
		if (err) {
			throw err;
		}
		const channels: Array<Channel> = [];
		for (const channelObject of response.data) {
			const channel = new Channel(channelObject);
			channels.push(channel);
		}
		return channels;
	}
}


console.log("FDC3Client");
const setupFDC3Client = () => {
	console.log("FSBL Ready");
	(FSBL as any).Clients.FDC3Client = new FDC3Client();
};

// Startup pattern for preload. Preloads can come in any order, so we need to wait on either the window event or the
// FSBL event
if ((window as any).FSBL && (FSBL as any).addEventListener) {
	(FSBL as any).addEventListener("onReady", setupFDC3Client);
} else {
	window.addEventListener("FSBLReady", setupFDC3Client);
}
