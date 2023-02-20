// This line imports type declarations for Finsemble's globals such as FSBL and fdc3. You can ignore the warning that it is defined but never used.
// Important! Please use the global FSBL and fdc3 objects. Do not import functionality from finsemble
import { AppIdentifier, AppIntent, AppMetadata, Channel, Context, ContextHandler, DisplayMetadata, ImplementationMetadata, IntentHandler, IntentResolution, joinUserChannel, Listener, PrivateChannel, StoreModel, System } from "@finsemble/finsemble-core";
import { STATE_DISTRIBUTED_STORE_NAME, STATE_DISTRIBUTED_STORE_CHECKTIME_FIELD, STATE_DISTRIBUTED_STORE_STATE_FIELD, WORKSPACE_STATE_FIELD_NAME } from "./constants";
import { errorLog, debug, log, objectHash, getRouterTopicName, warn } from "./utils";
import { Direction, ChannelListenerHandler, LinkState, ChannelSource } from "./types";

//Constants used through the recipe - note that the STATE_* field must match up with the Distributed Store fields in config.json
const GLOBAL_CHANNEL_NAME = "GLOBAL";
const CONTEXT_MESSAGE_DEBOUNCE_MS = 25;
const STATE_CLEAN_CHECK_FREQUENCY = 15000;
const STATE_CLEAN_CHECK_VARIANCE = 0.3;

const main = async () => {
	console.log("custom FDC3 preload starting up");

	const isBrowserView = FSBL.System.isBrowserView();
	const isTitlebarWindow = FSBL.System.isTitlebarWindow();
	const isTitleBar = !isBrowserView && isTitlebarWindow;
	
	//Don't run in the titlebar of BrowserView windows
	//  whilst this is possible, it will require some small additional finesse, for example to ensure
	//  that only one copy of the preload sets up the router listeners to hand linkToChannel and
	//  unlink from channel API calls.
	//  Hence, if customFDC3 functionality needs to be provided for titlebars, that should be addressed 
	//  directly in a cusotmisation to the titlebar. 
	if (isTitleBar) {
		log("NOT running customFdc3 preload in titlebar window.");
	} else {
		//-------------------------------------------------------------------------
		//Setup internal state for adapter
		/** Default FDC3 implementation, which we need to retain a reference to before monkey patching */
		const defaultFdc3 = window.fdc3;
		
		// This window's name.
		const myWindowName = System.Window.getCurrent().name;

		//Grab the componentType -used to link components of the same type - fine to retrieve async
		let myComponentType:string; 
		System.Window.getCurrent().getOptions(async (options) => {
			myComponentType = options?.customData.component.type;
			log(`Got componentType ${myComponentType} for window name ${myWindowName}`);
		});

		/** Local cache of user channels used for sync responses. */
		const allChannels = await defaultFdc3.getUserChannels();
		const channelIdToChannel: Record<string, Channel> = {};
		allChannels.map((channel) => channelIdToChannel[channel.id] = channel);
		const globalChannel = await defaultFdc3.getOrCreateChannel(GLOBAL_CHANNEL_NAME);

		/** Local state for channel membership, which is manually persisted in workspace. */
		const currentChannelDirections: Record<string, Direction> = { };
		
		/** Local store of unfiltered context Listeners that have been set up on each channel (used to remove them when not needed). */
		const currentChannelDefaultFDC3Listeners: Record<string, Listener> = { };
		let globalChannelDefaultFDC3Listener: Listener | null = null;

		/** Local state for context listeners registered, which are manually hooked to channels to enable gathering of source information etc. */
		const currentContextHandlers: Record<string, ContextHandler[]> = { };

		/** Local state for channel listeners registered, which are manually hooked to channels to enable gathering of source information etc. */
		const currentChannelHandlers: Record<string, ChannelListenerHandler[]> = { };

		/** Hashes for recent context messages used to debounce them.  Maps hash to message, first arrival time and sources its been received from. */
		const recentContextMessages: Record<number,[Context, number, string[]]> = { };

		/** Status flag used to avoid trying to re-save workspace state while its being restored. Do not interact with it directly. */
		let restoringStateFromWorkspace = false;
		
		/** Single handler for state change events - could be changed to an array if necessary */
		let stateChangeHandler: ((err, state: LinkState) => void) | null = null;

		/** DistributedStore containing state for all windows, used to provide synchronus responses
		 *  to linkToChannel calls and provide state updates for menus.
		 */
		let distributedStateStore: StoreModel;
		/** Local cache of the remote state, maintained to permit synchronous responses to linkToChannel. */
		let remoteStateCache: Record<string,Record<string,Direction>> = {};
		/** Time at which the state of the store was last checked for dead windows */
		let remoteStateCheckTime: number = Date.now();
		
		
		//DistributedStore used to share state with Linker menu is created by the menu (as it spawns first)
		//The store is initialized via config during startup (see config.json)
		//Note it must have allChannels populated within it until this can beretrieved from Finsemble's Interop service
		//Store is synced to a local cache allowing linkToChannel to retrun synchronously
		const storeUpdateHandler = (err, data: {field: string, value: Record<string,any>}) => {
			//handle the get and addListener returning data at slightly different places
			const values = data?.value ?? data;
			if (err) {
				errorLog(`Received error from remote state store (store: ${STATE_DISTRIBUTED_STORE_NAME} field: ${STATE_DISTRIBUTED_STORE_STATE_FIELD}})`,err);
			} else {
				remoteStateCache = values as Record<string, Record<string,Direction>>;
				debug("Received update to remote state channel directions:", remoteStateCache);
			}
		};
		const checktimeUpdateHandler = (err, data: {field: string, value: number}) => {
			if (err) {
				errorLog(`Received error from remote state store (store: ${STATE_DISTRIBUTED_STORE_NAME} field: ${STATE_DISTRIBUTED_STORE_CHECKTIME_FIELD})`,err);
			} else {
				remoteStateCheckTime = data?.value as number;
				debug("Received update to remote state checkTime:", remoteStateCheckTime);
			}
		};

		//Store is created by linker menu, but may need populating with all channels
		const setHandlers = (storeObj: StoreModel) => {
			distributedStateStore = storeObj;
			distributedStateStore.addListener([STATE_DISTRIBUTED_STORE_STATE_FIELD], storeUpdateHandler);
			distributedStateStore.addListener([STATE_DISTRIBUTED_STORE_CHECKTIME_FIELD], checktimeUpdateHandler);

			//retrieve initial state values as well
			distributedStateStore.get([STATE_DISTRIBUTED_STORE_STATE_FIELD], storeUpdateHandler);
			

			debug(`DistributedStore ${STATE_DISTRIBUTED_STORE_NAME} connected`);
		};
		
		FSBL.Clients.DistributedStoreClient.getStore({
			store: STATE_DISTRIBUTED_STORE_NAME,
			global: true
		},
		(err, storeObject) => {
			if (err || !storeObject) {
				errorLog(`DistributedStore ${STATE_DISTRIBUTED_STORE_NAME} could not be retrieved`, err);
			} else {
				setHandlers(storeObject);
			}
		});
		
		
		//-------------------------------------------------------------------------
		// Util functions
		/** Util fn to make and log out calls to the default FDC3 implementation for testing purposes. */
		function logAndCall<ReturnType>(fn: Function, args: any[]): ReturnType { 
			log(`Calling default FDC3 implementation for '${fn.name}' with args ${JSON.stringify(args)}`); 
			return fn.apply(defaultFdc3, args);
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

		function isOnGlobalChannel() {
			return !!globalChannelDefaultFDC3Listener;
		}

		/** 
		 * Reads and restores state of channel memberships from a workspace.
		 * This function should only be called on start-up to restore state from a workspace load (if present). 
		 */
		async function loadStateFromWorkspace() {
			debug("Loading channel state from workspace...");

			const state = await FSBL.Clients.WindowClient.getComponentState({
				field: WORKSPACE_STATE_FIELD_NAME
			});
			if (state.err || !state.data) {
				log("No customFDC3 state in workspace");

				//publish empty state
				publishState();
			} else if (state?.data ) {
				//disable state processing until complete
				restoringStateFromWorkspace = true;

				const subscriptionsToRetore = state.data;
				for (let channel in subscriptionsToRetore) {
					customFdc3.linkToChannel(channel,subscriptionsToRetore[channel], null, true);
				}

				log("Restored channel state from workspace", currentChannelDirections);
				restoringStateFromWorkspace = false;
				
				//now publish the loaded state
				publishState();
				if(stateChangeHandler) { stateChangeHandler(null,getLinkState()); }
			}
		};

		/**
		 * Saves state (channel subscriptions and directions) to the workspace.
		 */
		async function saveStateToWorkspace() {
			debug("Saving channel state to workspace...", currentChannelDirections);
			await FSBL.Clients.WindowClient.setComponentState({ field: WORKSPACE_STATE_FIELD_NAME, value: currentChannelDirections});
		}

		/**
		 * Sends the current state to distributedStore, which can be used to update the state of a linker menu when changes occur
		 * and to provide synchronus responses to linkToChannel calls.
		 */
		function publishState() {
			distributedStateStore.set([STATE_DISTRIBUTED_STORE_STATE_FIELD, myWindowName],currentChannelDirections, (err) => {
				if (err) {
					errorLog(`Failed to publish customFDC3 state for ${myWindowName}!`, err);
				} else {
					log(`Published customFDC3 state for ${myWindowName}` , currentChannelDirections);
				}
			});
			//store listener will update our local state cache, but we might not want to wait if updating it in checkAndCleanState
			remoteStateCache[myWindowName] = currentChannelDirections; 
		}

		/**
		 * Periodically check for dead state in the DistributedStore and clear it out (so that we don't have to have either 
		 * a separate service that does so or ensure that every window close is caught and cleaned up in the store.
		 * 
		 * The store is only used for shared state tracking in linkToChannel and a menu UI, hence, this is just clean-up as 
		 * dead state won't cause any harm until it hits thousands of dead records in a session.
		 * 
		 * Store creation was moved to a service, clean-up could also be moved there if preferred, however it is possible to do 
		 * without as shown.
		 */
		function checkAndCleanState() {
			//use some randomness to stop all windows trying to do this at once after a workspace load (when all are publishing updates)
			if ((Date.now() - remoteStateCheckTime) - Math.floor(Math.random() * (STATE_CLEAN_CHECK_FREQUENCY * STATE_CLEAN_CHECK_VARIANCE)) > STATE_CLEAN_CHECK_FREQUENCY) {
				FSBL.Clients.AppsClient.getActiveDescriptors().then(({err, data}) => {
					if (err || !data) {errorLog(`Received error from AppsClient.getActiveDescriptors`, err);}
					else {
						let madeChanges = false;
						for (let windowName in remoteStateCache) {
							if (!data[windowName]) {
								debug(`Removing cached state for inactive windowName: ${windowName}`);
								delete remoteStateCache[windowName];
								madeChanges = true;
							}
						}
						if (madeChanges) {
							distributedStateStore.setMultiple([
								{field: [STATE_DISTRIBUTED_STORE_STATE_FIELD], value: remoteStateCache},
								{field: [STATE_DISTRIBUTED_STORE_CHECKTIME_FIELD], value: Date.now()}
							]);
						}
					}
				});
			}
		}

		/**
		 * Performs each of the actions that is required each time the channel link state is changed.
		 */
		function processStateChange() {
			if (!restoringStateFromWorkspace) {
				publishState();
				saveStateToWorkspace();
				if(stateChangeHandler) { stateChangeHandler(null,getLinkState()); }
				checkAndCleanState();
			}
		}
		
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
						console.debug(`message ${messageHash} routed, channels `,recentContextMessages[messageHash][2]);
						delete recentContextMessages[messageHash];
					}, CONTEXT_MESSAGE_DEBOUNCE_MS);
				}
				debug(`received message ${messageHash} on channel ${channelId} `,recentContextMessages[messageHash]);
			} 
		}

		/** Routes context messages to their handlers, after checking the direction of channel membership.  */
		function defaultContextRouter(context: Context, channels: string[]) {
			//Route onwards to all normal channel listeners, ignoring direction
			if (currentContextHandlers["null"]) { currentContextHandlers["null"].map((handler) => {handler.apply(defaultFdc3, [context]);}) }
			if (currentContextHandlers[context.type]) { currentContextHandlers[context.type].map((handler) => {handler.apply(defaultFdc3, [context]);}) }

			//Global channel only applies to default addContextListener and broadcast functions
			if (!isOnGlobalChannel()){
				//Route onwards to ChannelListeners, after filtering by direction
				//debounce should have collected up multiple channels if it arrived on multiple here
				const filteredChannels: string[] = [];
				channels.map((channelId) => { 
					if (currentChannelDirections[channelId] == Direction.Both ||
							currentChannelDirections[channelId] == Direction.Listen){
						filteredChannels.push(channelId);
					}
				});

				if (filteredChannels.length > 0){	
					const source: ChannelSource = { channels: filteredChannels, allChannels: allChannels };
					if (currentChannelHandlers["null"]) { currentChannelHandlers["null"].map((handler) => {handler.apply(defaultFdc3, [context, source]);}) }
					if (currentChannelHandlers[context.type]) { currentChannelHandlers[context.type].map((handler) => {handler.apply(defaultFdc3, [context, source]);}) }
				}
			}
		}

		/** Util for returning a LinkState (used as a return from linkToChannel. */
		function getLinkState(channelDirections?: Record<string,string>): LinkState {
			const _directions: Record<string,string> = channelDirections ?? currentChannelDirections;
			const _channelIds: string[] = Object.keys(_directions);
			return {
				channels: _channelIds.map((channelId: string) => channelIdToChannel[channelId]),
				allChannels: allChannels,
				channelDirections: _directions
			};
		}

		/** Typing used by utility for displaying link dialog*/
		type LinkParams = {channelName: string, direction?: Direction, doNotApplyAgain: true};

		/** Utility function for displaying dialog to apply channel link changes to other apps of the same type.
		 */
		function maybeDisplayLinkOtherAppsDialog(applyChange: (windowName:string) => void): void {
			//first check if there are any other instances of this app!
			let otherInstances = false;
			FSBL.Clients.AppsClient.getActiveDescriptors().then(({err, data}) => {
				if (err || !data) {errorLog(`Received error from AppsClient.getActiveDescriptors`, err);}
				else {
					for (let windowName in data) {
						if (data[windowName].componentType == myComponentType) {
							otherInstances = true;
							break;
						}
					}
				}

				if (otherInstances) {
					log("Showing dialog to ask user if they wish to link other chaannels...");
					
					//show dialog and handle requests to link other instances of the same app
					//dialog will persist after this function returns!
					FSBL.Clients.DialogManager.open(
						"YesNoDialog",
						{
							title: "Apply Channel Confirmation",
							question: "Do you want to apply the same channel change on all open windows of this app?",
							negativeResponseLabel: "No",
							cancelResponseLabel: "Unsure",
							affirmativeResponseLabel: "Yes",
							showNegativeButton: true,
							showAffirmativeButton: true,
							showCancelButton: false
						},
						(err, response) => {
							console.log('response', response);
							// TODO: Switch on response.choice
							if (response.choice == "affirmative") {
								FSBL.Clients.AppsClient.getActiveDescriptors().then(({err, data}) => {
									if (err || !data) {errorLog(`Received error from AppsClient.getActiveDescriptors`, err);}
									else {
										for (let windowName in data) {
											if (data[windowName].componentType == myComponentType) {
												applyChange(windowName);
											}
										}
										
									}
								});
							} else {
								debug("User rejected adding other apps to same channel.");
							}
						}
					);	
				} else {
					log(`Skipping dialog to ask user if they wish to link other channels as this is the only instance of ${myComponentType}`);
				}
			});

			
		};


		//-------------------------------------------------------------------------
		//Custom FDC3 API implementation
		const customFdc3 = {
			//---------------------------------------------------------------------------------------------
			//provide custom FDC3 functions

			/**
			 * Link an app to a specified channel, with a specified direction. Can be used on a local or remote component.
			 * 
			 * //original docs:
			 * The default direction is "Both"
			 * The method is executed either on the supplied windowName or on the current Finsemble window name.
			 * If more than one instance of the same application is launched, displays a prompt asking the user 
			 * if they would like to link all instances of the application to the target channel.
			 * 
			 * @param channelName The channel name to link to.
			 * @param direction The direction to link in, valid values include "Both", "Listen", "Broadcast" and control whether messages are sent or received by `publishToChannel` and `addChannelListener`.
			 * @param windowName The windowName to apply the change to, will target local window if falsey.
			 * @param doNotApplyAgain If false, prompt the user to add other apps of teh same type to the channel
			 * @returns LinkState for the current window.
			 */
			linkToChannel: (channelName: string, direction: Direction = Direction.Both, windowName: string | null | undefined, doNotApplyAgain: boolean): LinkState => {
				//check args
				if (!Object.values<string>(Direction).includes(direction)) {
					const errMsg = `Unrecognized direction '${direction}', valid directions: ${Object.values(Direction)}`;
					errorLog(errMsg);
					return getLinkState();
				} else {
					if (windowName && myWindowName !== windowName) {
						log(`linkToChannel setting channel state for remote window '${windowName}', channel '${channelName}', direction '${direction}', doNotApplyAgain '${doNotApplyAgain}'`);
						
						//Use a router transmit to tell the named window to make this call then return
						FSBL.Clients.RouterClient.transmit(
							getRouterTopicName("linkToChannel",windowName),
							{channelName, direction, doNotApplyAgain}
						);
						
						//to return remote link state synchronously is difficult
						//  to do so, a pubsub or distributed store is needed that syncs all known window's state
						//  to a local variable, take the current state for the remote window apply this change to 
						//  it and return
						if(remoteStateCache[windowName]){
							remoteStateCache[windowName][channelName] = direction;
							return getLinkState(remoteStateCache[windowName]);
						} else {
							warn(`Cached channel state was not available for ${windowName}, returning local LinkState instead`);
							return getLinkState();
						} 
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

						processStateChange();

						if (!doNotApplyAgain) {
							//Apply change to other components of teh same type
							const linkParams: LinkParams = {channelName, direction, doNotApplyAgain: true /* don't prompt user on each  one */};
							const applyChange = (windowName) => {
								log(`Linking ${windowName} to channel '${channelName}', direction '${direction}'`);
								FSBL.Clients.RouterClient.transmit(
									getRouterTopicName("linkToChannel",windowName),
									linkParams//{channelName, direction, true /* don't prompt user on each  one */}
								);
							};
							maybeDisplayLinkOtherAppsDialog(applyChange);
						}

						return getLinkState();
					}
				}
			},

			/** Standard FDC3 function, adapted to work with preload. */
			joinUserChannel: (channelId: string) : Promise<void> => {
				customFdc3.linkToChannel(channelId, Direction.Both, null, true);
				return Promise.resolve();
			},
			/** Standard FDC3 function, adapted to work with preload. */
			joinChannel: (channelId: string) : Promise<void> => joinUserChannel(channelId),

			
			/**
			 * Unlink an app from a specified channel. Can be used on a local or remote component.
			 * Changed signature to match behavior (so code compiles in TS, will make no difference to use in JS)
			 * 
			 * //original docs:
			 * contrary to its signature, this method always returns undefined.
			 * The method is executed either on the supplied windowName or on the current Finsemble window name.
			 * If more than one instance of the same application is launched, displays a prompt asking the user if they would like to unlink all instances of the application from the target channel.
			 * 
			 * @param channelName The channel name to unlink from.
			 * @param windowName The windowName to apply the change to, will target local window if falsey.
			 * @param doNotApplyAgain If false, prompt the user to add other apps of teh same type to the channel
			 */
			unlinkFromChannel: (channelName: string, windowName: string | null | undefined, doNotApplyAgain: boolean): void => {
				if (windowName && myWindowName !== windowName) {
					//Use a router transmit to tell the named window to make this call then return
					FSBL.Clients.RouterClient.transmit(
						getRouterTopicName("unlinkFromChannel",windowName),
						{channelName, doNotApplyAgain}
					);
					
				} else {
					//clear membership direction
					if(currentChannelDirections[channelName]) {
						delete currentChannelDirections[channelName];
					}

					//unsubscribe default FDC3 subscription for context
					if (currentChannelDefaultFDC3Listeners[channelName]) {
						currentChannelDefaultFDC3Listeners[channelName].unsubscribe();
						delete currentChannelDefaultFDC3Listeners[channelName];
					}

					if (Object.keys(currentChannelDirections).length == 0) {
						joinGlobalChannel();
					}

					processStateChange();

					if (!doNotApplyAgain) {
						//Apply change to other components of teh same type
						const linkParams: LinkParams = {channelName, doNotApplyAgain: true /* don't prompt user on each  one */};
						const applyChange = (windowName) => {
							log(`Unlinking ${windowName} from channel '${channelName}''`);
							FSBL.Clients.RouterClient.transmit(
								getRouterTopicName("unlinkFromChannel",windowName),
								linkParams 
							);
						};
						maybeDisplayLinkOtherAppsDialog(applyChange);
					}
				}
			},

			/** Standard FDC3 function, adapted to work with preload. Leaves all channels. */
			leaveCurrentChannel: () : Promise<void> => {
				for (let channel in currentChannelDirections) {
					customFdc3.unlinkFromChannel(channel, null, true);
				}
				return Promise.resolve();
			},
			/** Finsemble specific FDC3 function, adapted to work with preload. Returns all channels. */
			leaveChannel: (channelId: string) : Promise<void> => {
				customFdc3.unlinkFromChannel(channelId, null, true);
				return Promise.resolve();
			},
			
			
			/**
			 * Non standard name/return type version of getCurrentChannels(), which is itself non-standard.
			 */
			getLinkedChannels: (): Array<string> => {
				return Object.keys(currentChannelDirections);
			},
			/** Standard FDC3 function, adapted to work with preload. Returns the first channel it sees. */
			getCurrentChannel: () : Promise<Channel | null> => {
				const linkedChannels = customFdc3.getLinkedChannels();
				if (linkedChannels.length > 0){
					return Promise.resolve(null);
				} else {
					return defaultFdc3.getOrCreateChannel(linkedChannels[0]);
				}
			},
			/** Finsemble specific FDC3 function, adapted to work with preload. Returns all channels. */
			getCurrentChannels: () : Promise<Channel[] | null> => {
				const linkedChannels = customFdc3.getLinkedChannels();
				if (linkedChannels.length > 0){
					return Promise.resolve(null);
				} else {
					return Promise.all(linkedChannels.map((channelId)=>defaultFdc3.getOrCreateChannel(channelId)));
				}
			},
			
			/**
			 * Register a callback for when the channels change. Works using internal state tracking rather than a link to Finsemble's state.
			 * 
			 * When an application is started, a listener is created on the window name. When the listener is invoked (by joining, leaving 
			 * channels, channel direction change, LinkerClient.onStateChange is called), the callback supplied to the method is called with 
			 * the current LinkerClient state and channel directions.
			 * @param cb 
			 */
			onStateChange: (cb: (err, state: LinkState) => void): void => {
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
				if (isOnGlobalChannel()) {
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
				if (context) {
					if (isOnGlobalChannel()) {
						debug(`Ignoring publishToChannel as we're only on the ${GLOBAL_CHANNEL_NAME} channel`);
					} else {
						for (let channelId in currentChannelDirections) {
							if (currentChannelDirections[channelId] == Direction.Both ||
								currentChannelDirections[channelId] == Direction.Broadcast) {
									channelIdToChannel[channelId].broadcast(context);
							} else {
								debug(`ignoring publishToChannel for channel ${channelId} as its set to Listen only`);
							}
						}
					}
				} else {
					warn("No context was passed to publishToChannel, ignoring...");
				}
			},

			//-----------------------------------------------------------------------
			//provide standard FDC3 functions, whereever they don't conflict with custom, to aid migration
			// apps
			open: (app: AppIdentifier | string, context?: Context): Promise<AppIdentifier> => logAndCall<Promise<AppIdentifier>>(defaultFdc3.open, [app, context]),
			findInstances: (app: AppIdentifier): Promise<Array<AppIdentifier>> => logAndCall<Promise<Array<AppIdentifier>>>(defaultFdc3.findInstances, [app]),
			getAppMetadata: (app: AppIdentifier): Promise<AppMetadata> => logAndCall<Promise<AppMetadata>>(defaultFdc3.getAppMetadata,[app]),
		
			// context listening must use custom implementation above
		
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

			// User channel management functions must use custom implementations above

			//implementation info
			getInfo: (): Promise<ImplementationMetadata> => logAndCall<Promise<ImplementationMetadata>>(defaultFdc3.getInfo,[]),
		
			//Deprecated functions
			getSystemChannels: (): Promise<Array<Channel>> => logAndCall<Promise<Array<Channel>>>(defaultFdc3.getSystemChannels,[]),

		};

		//-------------------------------------------------------------------------
		//Setup Router listeners for remote API calls
		//Note we don't use responders as we might go away and come back again with a workspace reload 
		//  and we don't want to handle removing them on workspace switches
		FSBL.Clients.RouterClient.addListener(getRouterTopicName("linkToChannel"), (error, response) => {
			if (error) {
				errorLog('addResponder from linkToChannel failed: ' + JSON.stringify(error));
			} else if (response?.data) {
				const { channelName, direction, doNotApplyAgain } = response.data;
				const linkState = customFdc3.linkToChannel(channelName, direction, undefined, doNotApplyAgain);
			}
		});

		FSBL.Clients.RouterClient.addListener(getRouterTopicName("unlinkFromChannel"), (error, response) => {
			if (error) {
				errorLog('addResponder for unlinkFromChannel failed: ' + JSON.stringify(error));
			} else if (response?.data) {
				const { channelName, doNotApplyAgain } = response.data;
				customFdc3.unlinkFromChannel(channelName, undefined, doNotApplyAgain);
			}
		});


		//-------------------------------------------------------------------------
		//Check for workspace state for adapter (we take over saving channel membership as it has directions)
		
		//Use workspace state to set up inital channels with calls to linkToChannel(name,direction)
		await loadStateFromWorkspace();

		//If not on any channel to start with, join global channel
		if (Object.keys(currentChannelDirections).length == 0) {
			joinGlobalChannel();
		}

		//-------------------------------------------------------------------------
		// Monkey patch the fdc3 global
		// Ignore type mismatch caused by imported types for globals that our customFDC3 doesn't match
		// @ts-ignore
		window.fdc3 = customFdc3;
	}
};

/**
 * This initialization pattern is required in preloads. Do not call FSBL or fdc3 without waiting for this pattern.
 */
if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", main);
} else {
	window.addEventListener("FSBLReady", main);
}
