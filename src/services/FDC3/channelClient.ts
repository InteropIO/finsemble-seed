export default class C implements Channel {
    id: string;
    type: string;
    displayMetadata?: DisplayMetadata;
    constructor(params: any) {
        this.id = params.id;
        this.type = params.type;
        this.displayMetadata = params.displayMetadata;
    }
    
    broadcast(context: object): void {
        FSBL.Clients.RouterClient.query("FDC3.Channel.broadcast", {
            channel: this.id,
            context
        }, () => {});
    }

    async getCurrentContext(contextType?: string): Promise<object> {
        const {err, response} = await FSBL.Clients.RouterClient.query("FDC3.Channel.broadcast", {
            channel: this.id,
            contextType
        }, () => {});
        if (err) {
            throw(err);
        } else {
            return response.data;
        }
    }

    addContextListener(contextType: string, handler: ContextHandler): Listener {
        FSBL.Clients.LinkerClient.subscribe(`FDC3.broadcast.${this.id}.${contextType}`, handler);        
        return {
            unsubscribe: () => {
                FSBL.Clients.LinkerClient.unsubscribe(`FDC3.${contextType}`, handler);
            }
        }
    }

}