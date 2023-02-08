// This line imports type declarations for Finsemble's globals such as FSBL and fdc3. You can ignore the warning that it is defined but never used.
// Important! Please use the global FSBL and fdc3 objects. Do not import functionality from finsemble
import { AppIdentifier, AppIntent, AppMetadata, Channel, Context, ContextHandler, ImplementationMetadata, IntentHandler, IntentResolution, Listener, PrivateChannel, RouterClient, types } from "@finsemble/finsemble-core";
import { join } from "path";
import { isArgumentsObject } from "util/types";

//Types used in the custom FDC3 APIs - not the overlap on Channel, currently assuming it matches FDC3 2.0, but it may not. If so alias' will need to be used to differentiate the types and some adaption added.
type LinkState = {
	channels: Array<Channel>,
	allChannels: Array<Channel>
};

type ChannelSource = {
	channels: string[],
	allChannels: Channel[]
};

enum Direction {
	"Both" = "Both",
	"Listen" = "Listen",
	"Broadcast" = "Broadcast"	
};

type ChannelListenerHandler =  (context: Context, source: ChannelSource) => void;

const GLOBAL_CHANNEL_NAME = "GLOBAL";
const CONTEXT_MESSAGE_DEBOUNCE_MS = 10;
const USE_GLOBAL_CHANNEL_WHEN_NOT_LINKED = true;

const main = async () => {
	console.log("custom FDC3 preload starting up");

	//-------------------------------------------------------------------------
	//Setup internal state for adapter
	/** Default FDC3 implementation, which we need to retain a reference to before monkey patching */
	const defaultFdc3 = window.fdc3;
	
	/** Local cache of user channels used for sync responses. */
	const allChannels = await defaultFdc3.getUserChannels();
	const channelIdToChannel: Record<string, Channel> = {};
	allChannels.map((channel) => {channelIdToChannel[channel.id] = channel});
	const globalChannel = await defaultFdc3.getOrCreateChannel(GLOBAL_CHANNEL_NAME);

	/** Local cache of user channel names.  */
	const allChannelNames = allChannels.map((channel) => channel.id);

	/** Local state for channel membership, which is manually persisted in workspace. */
	const currentChannelDirections: Record<string, string> = { };
	
	/** Local store of unfiltered context Listeners that have been set up on each channel (used to remove them when not needed). */
	const currentChannelDefaultFDC3Listeners: Record<string, Listener> = { };
	let globalChannelDefaultFDC3Listener: Listener | null = null;

	/** Local state for context listeners registered, which are manually hooked to channels to enable gathering of source information etc. */
	const currentContextHandlers: Record<string, ContextHandler[]> = { };

	/** Local state for channel listeners registered, which are manually hooked to channels to enable gathering of source information etc. */
	const currentChannelHandlers: Record<string, ChannelListenerHandler[]> = { };

	/** Hashes for recent context messages used to debounce them.  Maps hash to message, first arrival time and sources its been received from. */
	const recentContextMessages: Record<number,[Context, number, string[]]> = { };
	
	/** Single handler for state change events - could be changed to an array if necessary */
	let stateChangeHandler: ((state:Record<string,string>) => void) | null = null;

	//-------------------------------------------------------------------------
	//Check for workspace state for adapter (we take over saving channel membership as it has directions)
	
	//TODO use state to set up inital channels with calls to linkToChannel(name,direction)





	
	//If not on any channel to start with, join global channel
	if (Object.keys(currentChannelDirections).length == 0) {
		joinGlobalChannel();
	}


	//-------------------------------------------------------------------------
	// Util functions
	/** Util fn to make and log out calls to the default FDC3 implementation for testing purposes. */
	function logAndCall<ReturnType>(fn: Function, args: any[]): ReturnType { 
		FSBL.Clients.Logger.log(`Calling default FDC3 implementation for '${fn.name}' with args ${JSON.stringify(args)}`); 
		return fn.apply(defaultFdc3, args);
	};

	/** Hashing function for context objects, used to detect messages received from multiple channels. */
	function objectHash(obj: any): number { 
		return JSON.stringify(obj).split('').reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0) ;
	};

	/** Util function to get query responder names for API calls. */
	function getResponderName(action: string, windowName?:string) {
		return `customFDC3-${windowName ?? finsembleWindow.windowName}-${action}`; 
	};

	function joinGlobalChannel() {
		//if we're not on any channel now, subscribe to global channel
		globalChannel.addContextListener(null, (context) => defaultContextHandler(GLOBAL_CHANNEL_NAME, context))
		.then((listener) => {
			globalChannelDefaultFDC3Listener = listener;
		});
	};

	function leaveGlobalChannel() {
		if (globalChannelDefaultFDC3Listener) {
			globalChannelDefaultFDC3Listener.unsubscribe();
			globalChannelDefaultFDC3Listener = null;
		}
	};

	/** Handler used to receive context messages and then route them based on channel direction, subscribed listeners etc. 
	 *  
	 *  Handles multiple channel membership; Finsemble will normally ensure that, if send and receiver are on more than one 
	 *  of the same user channels, messages are only received once, through `fdc3.addContextListener`. However, we are 
	 *  retrieving the Channels and connecting to them individually and hence will receive a separate copy through each.
	*/
	function defaultContextHandler(channelId, context) {
		if (context.type) { //ignored malformed context with no type field!
			//debounce messages that might arrive from multiple channels in a short space of time (usually sub 1ms, but might grow under load)
			let messageHash = objectHash(context);
			
			if (recentContextMessages[messageHash]){ //we've seen this before, additional channel
				recentContextMessages[messageHash][2].push(channelId);
			} else { //new message
				recentContextMessages[messageHash] = [context, Date.now(), [channelId]];
				//setup handling after debounce period
				setTimeout(() => {
					defaultContextRouter(context,recentContextMessages[messageHash][2]);
					delete recentContextMessages[messageHash];
				}, CONTEXT_MESSAGE_DEBOUNCE_MS);
			}		
		} 
	}

	/** Routes context messages to their handlers, after checking the direction of channel membership.  */
	function defaultContextRouter(context: Context, channels: string[]) {
		//debounce should have collected up multiple channels if it arrived on multiple here
		const source: ChannelSource = { channels: channels, allChannels: allChannels };

		//Route onwards to all normal channel listeners, ignoring direction
		if (currentContextHandlers["null"]) { currentContextHandlers["null"].map((handler) => {handler.apply(defaultFdc3, [context]);}) }
		if (currentContextHandlers[context.type]) { currentContextHandlers[context.type].map((handler) => {handler.apply(defaultFdc3, [context]);}) }


		//Route onwards to ChannelListeners, after filtering by direction (B.b. Global is always both directions)
		let isListening = false;
		source.channels.map((channelId) => { 
			if (currentChannelDirections[channelId] == Direction.Both ||
				currentChannelDirections[channelId] == Direction.Listen ||
				channelId == GLOBAL_CHANNEL_NAME){
				isListening = true;
			}
		});
		if (isListening && currentChannelHandlers["null"]) { currentChannelHandlers["null"].map((handler) => {handler.apply(defaultFdc3, [context, source]);}) }
		if (isListening && currentChannelHandlers[context.type]) { currentChannelHandlers[context.type].map((handler) => {handler.apply(defaultFdc3, [context, source]);}) }
	}

	/** Util for returning a LinkState (sued as a return from linkToChannel. */
	function getLinkState(channelIds?): LinkState {
		const _channelIds: string[] = channelIds ?? Object.keys(currentChannelDirections);
		return {
			channels: _channelIds.map((channelId: string) => channelIdToChannel[channelId]),
			allChannels: allChannels
		};
	}

	//-------------------------------------------------------------------------
	//Custom FDC3 API implementation
	const customFdc3 = {
		//---------------------------------------------------------------------------------------------
		//provide custom FDC3 functions

		/**
		 * Note that all instances popup is not implemented (yet)
		 * 
		 * //original docs:
		 * The default direction is "Both"
		 * The method is executed either on the supplied windowName or on the current Finsemble window name.
		 * If more than one instance of the same application is launched, displays a prompt asking the user 
		 * if they would like to link all instances of the application to the target channel.
		 * @param channelName 
		 * @param direction 
		 * @param windowName 
		 * @param doNotApplyAgain no idea what this parameter does...
		 * @returns LinkState for the current window.
		 */
		linkToChannel: (channelName: string, direction: string = Direction.Both, windowName: string | null | undefined, doNotApplyAgain: boolean): LinkState => {
			const myWindowName = finsembleWindow.windowName;
			if (windowName && myWindowName !== windowName) {
				FSBL.Clients.Logger.log(`linkToChannel setting channel state for remote window '${windowName}', channel '${channelName}', direction '${direction}', doNotApplyAgain '${doNotApplyAgain}'`);
				
				//Use a router query responder to tell the named window to make this call then return
				FSBL.Clients.RouterClient.query(
					getResponderName("linkToChannel",windowName),
					{channelName, direction, doNotApplyAgain}, 
					{logWhenNoResponder: true},
					(error, queryResponseMessage) => {
						if (error) {
							FSBL.Clients.Logger.error(`linkToChannel failed for remote window '${windowName}', channel '${channelName}', direction '${direction}', doNotApplyAgain '${doNotApplyAgain}'`);
						} else {
							FSBL.Clients.Logger.log(`linkToChannel remote window '${windowName}', channel state: `, queryResponseMessage.data);
						}
					}
				);

				// Note that the LinkState for a remote is NOT currently returned
				// when the windowName is specified, the loca state is. To return the remote state synchronously,
				// currentChannelDirections has to become shared state between all instances, e.g. via a PubSub topic
				// or global DistributeStore.
				return getLinkState(/* channelIds */); 
			} else {

				//drop off the global channel if on it
				leaveGlobalChannel();

				//set membership direction
				currentChannelDirections[channelName] = direction;

				//setup default FDC3 subscription for context
				if (!currentChannelDefaultFDC3Listeners[channelName]) {
					channelIdToChannel[channelName].addContextListener(null, (context) => defaultContextHandler(channelName,context))
					.then((listener) => { currentChannelDefaultFDC3Listeners[channelName] = listener });
				}

				if(stateChangeHandler) { stateChangeHandler(currentChannelDirections) }

				return getLinkState();
			}
		},
		 
		/**
		 * Changed signature to match behavior (so code compiles in TS, will make no difference to use in JS)
		 * 
		 * //original docs:
		 * contrary to its signature, this method always returns undefined.
		 * The method is executed either on the supplied windowName or on the current Finsemble window name.
		 * If more than one instance of the same application is launched, displays a prompt asking the user if they would like to unlink all instances of the application from the target channel.
		 * @param channelName 
		 * @param windowName 
		 * @param doNotApplyAgain 
		 */
		unlinkFromChannel: (channelName: string, windowName: string | null | undefined, doNotApplyAgain: boolean): void => {
			const myWindowName = finsembleWindow.windowName;
			if (windowName && myWindowName !== windowName) {
				//Use a router query responder to tell the named window to make this call then return
				FSBL.Clients.RouterClient.query(
					getResponderName("unlinkFromChannel",windowName),
					{channelName, doNotApplyAgain}, 
					{logWhenNoResponder: true},
					(error, queryResponseMessage) => {
						if (error) {
							FSBL.Clients.Logger.error(`unlinkFromChannel failed for remote window '${windowName}', channel '${channelName}', doNotApplyAgain '${doNotApplyAgain}'`);
						} else {
							FSBL.Clients.Logger.log(`unlinkFromChannel remote window '${windowName}', channel state: `, queryResponseMessage.data);
						}
					}
				);
				
			} else {
				//clear membership direction
				delete currentChannelDirections[channelName];

				//unsubscribe default FDC3 subscription for context
				if (currentChannelDefaultFDC3Listeners[channelName]) {
					currentChannelDefaultFDC3Listeners[channelName].unsubscribe();
					delete currentChannelDefaultFDC3Listeners[channelName];
				}

				if (Object.keys(currentChannelDirections).length == 0) {
					joinGlobalChannel();
				}

				if(stateChangeHandler) { stateChangeHandler(currentChannelDirections) };
			}
		},
		 
		/**
		 * Non standard name/return type version of getCurrentChannels(), which is itself non-standard.
		 */
		getLinkedChannels: (): Array<string> => {
			return Object.keys(currentChannelDirections);
		},
		
		/**
		 * Register a callback for when the channels change. Works using internal state tracking rather than a link to Finsemble's state.
		 * 
		 * When an application is started, a listener is created on the window name. When the listener is invoked (by joining, leaving 
		 * channels, channel direction change, LinkerClient.onStateChange is called), the callback supplied to the method is called with 
		 * the current LinkerClient state and channel directions.
		 * @param cb 
		 */
		onStateChange: (cb: (state: Record<string, string>) => void): void => {
			//TODO: get an example of the state from current implementation to make sure we're doing this right
			stateChangeHandler = cb;
		},
		
		/**
		 * Returns the window's linked channels and their directions.
		 */
		getChannelDirections: (): Record<string, string> => {
			//TODO: check if Global channel membership should be returned or not, currently not
			return currentChannelDirections;
		},
		
		 
		/**
		 * If not channel is joined, the context listener is added to a global default channel
		 * When a channel is joined, the context listener is switched to the joined channel/channels
		 * @param contextTypeOrHandler 
		 * @param handler 
		 */
		addContextListener: (contextTypeOrHandler: string | null | ContextHandler, handler: ContextHandler): Listener => {
			//We're internally subscribing to all the channel's context and routing internally to context listeners
			// so we just need to set up handler by type here.

			//handle deprecated addContextListener signature
			let _contextType:string;
			let _handler:ContextHandler;
			if (typeof contextTypeOrHandler == "function"){
				_contextType = "null";
				_handler = contextTypeOrHandler;
			} else if (contextTypeOrHandler == null){
				_contextType = "null";
				_handler = handler;
			} else {
				_contextType = contextTypeOrHandler;
				_handler = handler;
			}

			if (!currentContextHandlers[_contextType]) {
				currentContextHandlers[_contextType] = [];
			}
			currentContextHandlers[_contextType].push(_handler);
			
			//Create a Listener (unsubscribe function) to remove this again
			return { unsubscribe: () => {
				currentContextHandlers[_contextType].splice(currentContextHandlers[_contextType].indexOf(handler),1);
			}}; 
		},
		
		/**
		 * Creates a subscriber for messages matching the sent context type. The consumed message is passed 
		 * to the handler only if the current window has channels that have either "Both" or "Listen" direction.
		 * The handler takes a context and a source object containing
		 *  - a list of linked channels and that have a direction of either ‘Both’ or ‘Listen’.
		 *  - a list of all channels
		 * @param contextType 
		 * @param handler 
		 */
		addChannelListener: (contextType: string, handler: ChannelListenerHandler): Listener => {
			//We're internally subscribing to all the channel's context and routing internally to context listeners
			// so we just need to set up handler by type here.

			//Note we're not handling deprecated addContextListener-style signature here...
			
			if (!currentChannelHandlers[contextType]) {
				currentChannelHandlers[contextType] = [];
			}
			currentChannelHandlers[contextType].push(handler);

			//Create a Listener (unsubscribe function) to remove this again
			return { unsubscribe: () => {
				currentChannelHandlers[contextType].splice(currentChannelHandlers[contextType].indexOf(handler),1);
			}}; 
		},
		
		/**
		 * Context broadcast function. Sends to the currently joined channels or the global channel
		 * if none have been joined. Ignores directionality of listening.
		 * @param context 
		 * @returns 
		 */
		broadcast: (context: Context): Promise<void> => {
			//broadcast to global or other channels we're currently linked to
			if (Object.keys(currentChannelDirections).length == 0) {
				globalChannel.broadcast(context);
			} else {
				for (let channelId in currentChannelDirections) {
					channelIdToChannel[channelId].broadcast(context);
				}
			}

			return Promise.resolve();
		},
		 
		/**
		 * The message is broadcasted only if the current window has channels that have either "Both" or "Broadcast" direction.

		 * @param context 
		 */
		publishToChannel: (context?: Context): void => {
			//TODO: figure out why context can be optional...
			//TODO: figure out if a direction applies to the global channel - currently does not
			if (context) {
				if (Object.keys(currentChannelDirections).length == 0) {
					//always both directions on global channel
					globalChannel.broadcast(context);
				} else {
					for (let channelId in currentChannelDirections) {
						if (currentChannelDirections[channelId] == Direction.Both ||
							currentChannelDirections[channelId] == Direction.Broadcast) {
								channelIdToChannel[channelId].broadcast(context);
						} else {
							FSBL.Clients.Logger.debug(`ignoring context broadcast for channel ${channelId} as its set to Listen only`);
						}
					}
				}
			} else {
				FSBL.Clients.Logger.warn("No context was passed to publishToChannel, ignoring...");
			}
		},

		//-----------------------------------------------------------------------
		//provide standard FDC3 functions, whereever they don't conflict with custom, to aid migration
		// apps
		open: (app: AppIdentifier | string, context?: Context): Promise<AppIdentifier> => logAndCall<Promise<AppIdentifier>>(defaultFdc3.open, [app, context]),
		findInstances: (app: AppIdentifier): Promise<Array<AppIdentifier>> => logAndCall<Promise<Array<AppIdentifier>>>(defaultFdc3.findInstances, [app]),
		getAppMetadata: (app: AppIdentifier): Promise<AppMetadata> => logAndCall<Promise<AppMetadata>>(defaultFdc3.getAppMetadata,[app]),
	  
		// context
		//addContextListener: (contextType: string | null, handler: ContextHandler): Promise<Listener> => logAndCall<Promise<Listener>>(defaultFdc3.addContextListener, [contextType, handler]),
	  
		// intents
		findIntent: (intent: string, context?: Context, resultType?: string): Promise<AppIntent> => logAndCall<Promise<AppIntent>>(defaultFdc3.findIntent,[intent, context, resultType]),
		findIntentsByContext: (context: Context, resultType?: string): Promise<Array<AppIntent>> =>  logAndCall<Promise<Array<AppIntent>>>(defaultFdc3.findIntentsByContext,[context, resultType]),
		raiseIntent: (intent: string, context: Context, app?: AppIdentifier | string): Promise<IntentResolution> => logAndCall<Promise<IntentResolution>>(defaultFdc3.raiseIntent,[intent, context, app]),
		raiseIntentForContext: (context: Context, app?: AppIdentifier | string): Promise<IntentResolution> => logAndCall<Promise<IntentResolution>>(defaultFdc3.raiseIntentForContext,[context, app]),
		addIntentListener: (intent: string, handler: IntentHandler): Promise<Listener> => logAndCall<Promise<Listener>>(defaultFdc3.addIntentListener,[intent, handler]),
	  
		// channels
		getOrCreateChannel: (channelId: string): Promise<Channel> => logAndCall<Promise<Channel>>(defaultFdc3.getOrCreateChannel,[channelId]),
		createPrivateChannel: (): Promise<PrivateChannel> => logAndCall<Promise<PrivateChannel>>(defaultFdc3.createPrivateChannel,[]),
		getUserChannels: (): Promise<Array<Channel>> => logAndCall<Promise<Array<Channel>>>(defaultFdc3.getUserChannels,[]),
	  
		// OPTIONAL channel management functions
		joinUserChannel: (channelId: string) : Promise<void> => logAndCall<Promise<void>>(defaultFdc3.joinUserChannel,[channelId]),
		getCurrentChannel: () : Promise<Channel | null> => logAndCall<Promise<Channel | null>>(defaultFdc3.getCurrentChannel,[]),
		leaveCurrentChannel: () : Promise<void> => logAndCall<Promise<void>>(defaultFdc3.leaveCurrentChannel,[]),
	  
		//implementation info
		getInfo: (): Promise<ImplementationMetadata> => logAndCall<Promise<ImplementationMetadata>>(defaultFdc3.getInfo,[]),
	  
		//Deprecated functions
		getSystemChannels: (): Promise<Array<Channel>> => logAndCall<Promise<Array<Channel>>>(defaultFdc3.getSystemChannels,[]),
		joinChannel: (channelId: string) : Promise<void> => logAndCall<Promise<void>>(defaultFdc3.joinChannel,[channelId]),
	};

	//-------------------------------------------------------------------------
	//Setup Router query responders for remote API calls
	FSBL.Clients.RouterClient.addResponder(getResponderName("linkToChannel"), (error, queryMessage) => {
		if (error) {
			FSBL.Clients.Logger.system.log('addResponder from linkToChannel failed: ' + JSON.stringify(error));
		} else if (queryMessage?.data) {
			const { channelName, direction, doNotApplyAgain } = queryMessage.data;
			const linkState = customFdc3.linkToChannel(channelName, direction, undefined, doNotApplyAgain);
			queryMessage.sendQueryResponse(null, customFdc3.getLinkedChannels()); // respond with current channel names so a LinkState can be returned.
		}
	});

	FSBL.Clients.RouterClient.addResponder(getResponderName("unlinkFromChannel"), (error, queryMessage) => {
		if (error) {
			FSBL.Clients.Logger.system.log('addResponder for unlinkFromChannel failed: ' + JSON.stringify(error));
		} else if (queryMessage?.data) {
			const { channelName, doNotApplyAgain } = queryMessage.data;
			customFdc3.unlinkFromChannel(channelName, undefined, doNotApplyAgain);
			queryMessage.sendQueryResponse(null, customFdc3.getLinkedChannels()); // respond with current channel names so a LinkState can be returned.
		}
	});

	
	// Ignore type mismatch caused by imported types for globals that our customFDC3 doesn't match
	// @ts-ignore
	window.fdc3 = customFdc3;
};

/**
 * This initialization pattern is required in preloads. Do not call FSBL or fdc3 without waiting for this pattern.
 */
if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", main);
} else {
	window.addEventListener("FSBLReady", main);
}
