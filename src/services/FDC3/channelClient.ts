export default class C implements Channel {
    id: string;
    type: string;
    displayMetadata?: DisplayMetadata;
    FSBL: any;
    constructor(params: any) {
        this.id = params.id;
        this.type = params.type;
        this.displayMetadata = params.displayMetadata;
        this.FSBL = params.FSBL
    }

    broadcast(context: object): void {
        this.FSBL.Clients.RouterClient.query("FDC3.Channel.broadcast", {
            channel: this.id,
            context
        }, () => { });
    }

    async getCurrentContext(contextType?: string): Promise<object> {
        const { err, response } = await this.FSBL.Clients.RouterClient.query("FDC3.Channel.getCurrentContext", {
            channel: this.id,
            contextType
        }, () => { });
        if (err) {
            throw (err);
        } else {
            return response.data;
        }
    }

    addContextListener(handler: ContextHandler): Listener;
    addContextListener(contextType: string, handler: ContextHandler): Listener;
    addContextListener(contextTypeOrHandler: string | ContextHandler, handler?: ContextHandler): Listener {
        if (this.id == "global") {
            if (typeof contextTypeOrHandler === "string") { // context type specified
                const routerHandler: StandardCallback = (err, response) => { handler(response.data) };
                this.FSBL.Clients.RouterClient.addListener(`FDC3.broadcast.${contextTypeOrHandler}`, routerHandler);
                return {
                    unsubscribe: () => {
                        this.FSBL.Clients.RouterClient.removeListener(`FDC3.broadcast.${contextTypeOrHandler}`, routerHandler);
                    }
                }
            } else { // context type not specified
                const routerHandler: StandardCallback = (err, response) => { contextTypeOrHandler(response.data) };
                this.FSBL.Clients.RouterClient.addListener(`FDC3.broadcast`, routerHandler);
                return {
                    unsubscribe: () => {
                        this.FSBL.Clients.RouterClient.removeListener(`FDC3.broadcast`, routerHandler);
                    }
                }
            }
        }
        this.FSBL.Clients.LinkerClient.linkToChannel(this.id, finsembleWindow.identifier);
        if (typeof contextTypeOrHandler === "string") { // context type specified
            this.FSBL.Clients.LinkerClient.subscribe(`FDC3.broadcast.${contextTypeOrHandler}`, handler);
            return {
                unsubscribe: () => {
                    this.FSBL.Clients.LinkerClient.unsubscribe(`FDC3.broadcast.${contextTypeOrHandler}`, handler);
                }
            }
        } else { // context type not specified
            this.FSBL.Clients.LinkerClient.subscribe(`FDC3.broadcast`, contextTypeOrHandler);
            return {
                unsubscribe: () => {
                    this.FSBL.Clients.LinkerClient.unsubscribe(`FDC3.broadcast`, contextTypeOrHandler);
                }
            }
        }
    }

}