import DesktopAgent from "./desktopAgentClient";
import Channel from "./channelClient";

declare global {
	interface Window {
		fdc3: DesktopAgent
	}
}

const win = window as Window;

class FDC3Client {
	// if strict is true -> one linker channel only and one FDC3 Desktop agent only that is available at window.fdc3
	#strict: Boolean = true;
	desktopAgents: Array<DesktopAgent> = [];
	desktopAgentsByChannel: { [key: string]: DesktopAgent } = {};
	#wait: (time: number) => Promise<unknown> = (time: number) => {
		return new Promise((resolve) => setTimeout(resolve, time));
	}
	FSBL: any;

	constructor(Finsemble?: typeof FSBL) {
		this.FSBL = window.FSBL || Finsemble
		const setupAgents = async () => {
			const linkerState = this.FSBL.Clients.LinkerClient.getState();
			// all valid channels that this component is a member of
			const validLinkerChannels = linkerState.channels.map((channel: any) => channel.name);

			// all channels that this component is a member of. Different from valid because this could have joined channels created later
			let linkerChannels = Object.keys(this.FSBL.Clients.LinkerClient.channels);

			// in strict mode you can only join one channel
			if (this.#strict && linkerChannels.length) {
				linkerChannels = [linkerChannels[0]]
			}

			const channelsToRemove = linkerChannels.filter(channel => !validLinkerChannels.includes(channel));

			// Unlink from everything the component should not be a member of
			for (const channel of channelsToRemove) {
				this.FSBL.Clients.LinkerClient.unlinkFromChannel(channel, this.FSBL.Clients.WindowClient.getWindowIdentifier());
			}

			// Since the linkerClient doesn't really wait properly
			this.#wait(100);

			if (this.#strict) {
				if (linkerChannels.length) {
					win.fdc3 = await this.getOrCreateDesktopAgent(linkerChannels[0]);
				} else {
					win.fdc3 = await this.getOrCreateDesktopAgent("global");
				}
			} else {
				win.fdc3 = await this.getOrCreateDesktopAgent("global");
				for (const channel of linkerChannels) {
					await this.getOrCreateDesktopAgent(channel);
				}
			}

			const updateAgents = async (err: any, response: any) => {
				// We get here if the user linked to or unlinked from a channel
				if (this.#strict) {

					const currentChannel = await win.fdc3.getCurrentChannel();
					let linkerChannels = Object.keys(this.FSBL.Clients.LinkerClient.channels);

					// Don't do anything if nothing changed (sometimes this event happens twice and causes all channels to be removed)
					if (linkerChannels.length === 1 && currentChannel && linkerChannels[0] === currentChannel.id) return;

					// remove current channel
					if (currentChannel) {
						linkerChannels = linkerChannels.filter(channel => channel !== currentChannel.id);
					}

					// are we joining a channel or completely leaving channels?
					if (linkerChannels.length) {
						await win.fdc3.joinChannel(linkerChannels[0]);
					}
				} else {
					const linkerChannels = Object.keys(this.FSBL.Clients.LinkerClient.channels);
					const desktopAgentChannels = Object.keys(this.desktopAgentsByChannel);
					const desktopAgentsToRemove = desktopAgentChannels.filter(channel => !linkerChannels.includes(channel));

					// remove any desktop agents that need to be removed
					for (const channel of desktopAgentsToRemove) {
						if (channel === "global") continue;
						await this.desktopAgentsByChannel[channel].leaveCurrentChannel();
						delete this.desktopAgentsByChannel[channel];
					}

					// get or create any desktop agents that need to be created
					for (const channel of linkerChannels) {
						await this.getOrCreateDesktopAgent(channel);
					}
					this.desktopAgents = Object.values(this.desktopAgentsByChannel);
				}
			};

			this.FSBL.Clients.LinkerClient.onStateChange(async (err: any, data: any) => { await updateAgents(err, data) });
		}
		setupAgents();

	}

	/**
	 * Gets or Creates a Desktop Agent for a the channel. If the channel does not exist, it will be created.
	 * @param channel
	 */
	async getOrCreateDesktopAgent(channel: string): Promise<DesktopAgent> {
		// Only one desktop agent in strict mode
		if (this.#strict && this.desktopAgents.length) {
			await win.fdc3.joinChannel(channel);
			return win.fdc3;
		}

		// If the agent already exists, return it
		if (this.desktopAgentsByChannel[channel]) {
			return this.desktopAgentsByChannel[channel];
		}

		// If a desktop agent does not exist, create one
		const desktopAgent = new DesktopAgent(this.#strict, this, this.FSBL);
		await desktopAgent.joinChannel(channel);
		this.desktopAgentsByChannel[channel] = desktopAgent;
		this.desktopAgents.push(desktopAgent);

		// What if someone directly calls leaveCurrentChannel on the desktopAgent
		const leaveChannelListener = (leftChannel: string) => {
			desktopAgent.removeListener("leftChannel", leaveChannelListener);
			desktopAgent.removeAllListeners();
			if (this.desktopAgentsByChannel[leftChannel]) {
				delete this.desktopAgentsByChannel[leftChannel];
				this.desktopAgents = Object.values(this.desktopAgentsByChannel);
			}
		}
		desktopAgent.addListener("leftChannel", leaveChannelListener);

		// What if someone changes the channel by calling joinChannel
		desktopAgent.addListener("channelChanged", (oldChannel, newChannel) => {
			delete this.desktopAgentsByChannel[oldChannel];
			this.desktopAgentsByChannel[newChannel] = desktopAgent;
			this.desktopAgents = Object.values(this.desktopAgentsByChannel);
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
		const { err, response } = await this.FSBL.Clients.RouterClient.query("FDC3.DesktopAgent.getSystemChannels", null, () => { });
		if (err) {
			throw err;
		}
		const channels: Array<Channel> = [];
		for (const channelObject of response.data) {
			channelObject.FSBL = this.FSBL
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

export default FDC3Client;