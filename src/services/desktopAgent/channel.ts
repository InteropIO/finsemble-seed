
export default class C implements Channel {
    id: string;
    type: string;
    displayMetadata?: DisplayMetadata;
    broadcast(context: object): void {
        throw new Error("Method not implemented.");
    }
    getCurrentContext(contextType?: string): Promise<object> {
        throw new Error("Method not implemented.");
    }
    //addContextListener(handler: ContextHandler): Listener;
    //addContextListener(contextType: string, handler: ContextHandler): Listener;
    addContextListener(contextType: any, handler?: any): Listener {
        throw new Error("Method not implemented.");
    }

}