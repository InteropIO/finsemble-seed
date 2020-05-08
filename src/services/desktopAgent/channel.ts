export default class C implements Channel {
	id: string;
	type: string;
	displayMetadata?: DisplayMetadata;

	constructor(id: string, type: string, displayMetadata: DisplayMetadata) {
		this.id = id;
		this.type = type;
		this.displayMetadata = displayMetadata;
	}

	broadcast(context: object): void {
		//FSBL.Clients.LinkerClient.Publish(context)
		// They may not have joined this channel yet?
		throw new Error("Method not implemented.");
	}
	getCurrentContext(contextType?: string): Promise<Context | null> {
		throw new Error("Method not implemented.");
	}
	//addContextListener(handler: ContextHandler): Listener;
	//addContextListener(contextType: string, handler: ContextHandler): Listener;
	addContextListener(contextType: any, handler?: any): Listener {
		throw new Error("Method not implemented.");
	}
}
