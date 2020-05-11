interface Params {
	id: string;
	type: string;
	displayMetadata: {};
	FSBL: any;
}

export default class C implements Channel {
	id: string;
	type: string;
	displayMetadata?: DisplayMetadata;
	private contexts: { [contextType: string]: Context } = {};
	private currentContext: Context;
	private FSBL: any;

	constructor(params: Params) {
		this.id = params.id;
		this.type = params.type;
		this.displayMetadata = params.displayMetadata;
		this.FSBL = params.FSBL;
	}

	broadcast(context: Context): void {
		this.currentContext = context;
		this.contexts[(context as any).type] = context;
		this.FSBL.Clients.LinkerClient.publish(
			{
				dataType: `FDC3.broadcast.${(context as any).type}`,
				data: context,
				channels: [this.id],
			},
			() => {}
		);
	}

	async getCurrentContext(contextType?: string): Promise<Context | null> {
		return contextType ? this.contexts[contextType] : this.currentContext;
	}

	//addContextListener(handler: ContextHandler): Listener;
	//addContextListener(contextType: string, handler: ContextHandler): Listener;
	addContextListener(contextType: any, handler?: any): Listener {
		throw new Error(
			"Method not implemented in service. You must use the client for this."
		);
	}
}
