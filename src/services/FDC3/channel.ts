interface Params {
	id: string;
	type: string;
	displayMetadata: {};
	FSBL: any;
}

declare global {
	interface Window {
		FSBL: any
	}
}

const win = window as Window;

export default class C implements Channel {
	id: string;
	type: string;
	displayMetadata?: DisplayMetadata;
	private contexts: { [contextType: string]: Context } = {};
	private currentContext: Context;
	#FSBL: any;

	constructor(params: Params) {
		this.id = params.id;
		this.type = params.type;
		this.displayMetadata = params.displayMetadata;
		this.#FSBL = win.FSBL || params.FSBL;
	}

	broadcast(context: Context): void {
		this.currentContext = context;
		this.contexts[(context as any).type] = context;

		if (this.id === "global") {
			// Broadcast to listeners that are listening on specific contexts
			this.#FSBL.Clients.RouterClient.transmit(`FDC3.broadcast.${(context as any).type}`, context);

			// Broadcast to listeners listening to everything on a channel
			this.#FSBL.Clients.RouterClient.transmit(`FDC3.broadcast`, context);
		} else {
			// Broadcast to listeners that are listening on specific contexts
			this.#FSBL.Clients.LinkerClient.publish({
				dataType: `FDC3.broadcast.${(context as any).type}`,
				data: context,
				channels: [this.id],
			}, () => { });

			// Broadcast to listeners listening to everything on a channel
			this.#FSBL.Clients.LinkerClient.publish({
				dataType: `FDC3.broadcast`,
				data: context,
				channels: [this.id],
			}, () => { });
		}
	}

	async getCurrentContext(contextType?: string): Promise<Context | null> {
		return contextType ? this.contexts[contextType] : this.currentContext;
	}

	addContextListener(handler: ContextHandler): Listener;
	addContextListener(contextType: string, handler: ContextHandler): Listener;
	addContextListener(contextTypeOrHandler: string | ContextHandler, handler?: ContextHandler): Listener {
		throw new Error(
			"Method not implemented in service. You must use the client for this."
		);
	}
}
