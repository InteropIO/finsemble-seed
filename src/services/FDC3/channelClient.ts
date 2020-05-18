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
        debugger;
        FSBL.Clients.RouterClient.query("FDC3.Channel.broadcast", {
            channel: this.id,
            context
        }, () => { });
    }

    async getCurrentContext(contextType?: string): Promise<object> {
        const { err, response } = await FSBL.Clients.RouterClient.query("FDC3.Channel.getCurrentContext", {
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
                FSBL.Clients.RouterClient.addListener(`FDC3.broadcast.${contextTypeOrHandler}`, routerHandler);
                return {
                    unsubscribe: () => {
                        FSBL.Clients.RouterClient.removeListener(`FDC3.broadcast.${contextTypeOrHandler}`, routerHandler);
                    }
                }
            } else { // context type not specified
                const routerHandler: StandardCallback = (err, response) => { contextTypeOrHandler(response.data) };
                FSBL.Clients.RouterClient.addListener(`FDC3.broadcast`, routerHandler);
                return {
                    unsubscribe: () => {
                        FSBL.Clients.RouterClient.removeListener(`FDC3.broadcast`, routerHandler);
                    }
                }
            }
        }
        FSBL.Clients.LinkerClient.linkToChannel(this.id, finsembleWindow.identifier);
        if (typeof contextTypeOrHandler === "string") { // context type specified
            FSBL.Clients.LinkerClient.subscribe(`FDC3.broadcast.${contextTypeOrHandler}`, handler);
            return {
                unsubscribe: () => {
                    FSBL.Clients.LinkerClient.unsubscribe(`FDC3.broadcast.${contextTypeOrHandler}`, handler);
                }
            }
        } else { // context type not specified
            FSBL.Clients.LinkerClient.subscribe(`FDC3.broadcast`, contextTypeOrHandler);
            return {
                unsubscribe: () => {
                    FSBL.Clients.LinkerClient.unsubscribe(`FDC3.broadcast`, contextTypeOrHandler);
                }
            }
        }
    }

}