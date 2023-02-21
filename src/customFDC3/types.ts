import { AppIdentifier, AppIntent, AppMetadata, Channel, Context, ContextHandler, DesktopAgent, ImplementationMetadata, IntentHandler, IntentResolution, Listener, PrivateChannel } from "@finsemble/finsemble-core";

//Types used in the custom FDC3 APIs - note the overlap on Channel, currently assuming it matches FDC3 2.0, but it may not. If so alias' will need to be used to differentiate the types and some adaption added.

export type LinkState = {
	channels: Array<Channel>;
	allChannels: Array<Channel>;
	channelDirections: Record<string, string>;
};

export type ChannelSource = {
	channels: string[];
	allChannels: Channel[];
};

export enum Direction {
	"Both" = "Both",
	"Listen" = "Listen",
	"Broadcast" = "Broadcast"
}
;

export type ChannelListenerHandler = (context: Context, source: ChannelSource) => void;

/** Typing used by utility for displaying link dialog*/
export type LinkParams = {channelName: string, direction?: Direction, doNotApplyAgain: true};

export interface ICustomFdc3 extends DesktopAgent{
    initialize(): Promise<void>;
    linkToChannel(channelName: string, direction: Direction, windowName: string | null | undefined, doNotApplyAgain: boolean): LinkState;
    joinUserChannel(channelId: string): Promise<void>;
    joinChannel(channelId: string): Promise<void>;
    unlinkFromChannel(channelName: string, windowName: string | null | undefined, doNotApplyAgain: boolean): void;
    leaveCurrentChannel(): Promise<void>;
    leaveChannel(channelId: string): Promise<void>;
    getLinkedChannels(): Array<string>;
    getCurrentChannel(): Promise<Channel | null>;
    getCurrentChannels(): Promise<Channel[] | null>;
    onStateChange(cb: (err: any, state: LinkState) => void): void;
    getChannelDirections(): Record<string, string>;
	addContextListener(contextType: string | null, handler: ContextHandler): Promise<Listener>;
	addChannelListener (contextType: string | null, handler: ChannelListenerHandler): Listener;
    broadcast(context: Context): Promise<void>;
    publishToChannel(context: Context): void;
    open(app: AppIdentifier | string, context: Context): Promise<AppIdentifier>;
    findInstances(app: AppIdentifier): Promise<Array<AppIdentifier>>;
    getAppMetadata(app: AppIdentifier): Promise<AppMetadata>;
    findIntent(intent: string, context: Context, resultType: string): Promise<AppIntent>;
    findIntentsByContext(context: Context, resultType: string): Promise<Array<AppIntent>>;
    raiseIntent(intent: string, context: Context, app?: AppIdentifier): Promise<IntentResolution>;
    raiseIntentForContext(context: Context, app?: AppIdentifier): Promise<IntentResolution>;
    addIntentListener(intent: string, handler: IntentHandler): Promise<Listener>;
    getOrCreateChannel(channelId: string): Promise<Channel>;
    createPrivateChannel(): Promise<PrivateChannel>;
    getUserChannels(): Promise<Array<Channel>>;
    getInfo(): Promise<ImplementationMetadata>;
    getSystemChannels(): Promise<Array<Channel>>;

	// addContextListener(contextTypeOrHandler: string | null | ContextHandler, handler: ContextHandler): Listener;

	//Deprecated functions
	addContextListener(handler: ContextHandler): Promise<Listener>;
	getSystemChannels(): Promise<Array<Channel>>;
	joinChannel(channelId: string) : Promise<void>;
	open(name: String, context?: Context): Promise<AppIdentifier>;
	raiseIntent(intent: string, context: Context, name?: String): Promise<IntentResolution>;
	raiseIntentForContext(context: Context, name?: String): Promise<IntentResolution>;
}
