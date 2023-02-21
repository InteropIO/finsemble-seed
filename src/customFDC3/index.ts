import { AppIdentifier, AppIntent, AppMetadata, Channel, Context, ContextHandler, DesktopAgent, ImplementationMetadata, IntentHandler, IntentResolution, joinUserChannel, Listener, PrivateChannel, StoreModel, System } from "@finsemble/finsemble-core";
import { STATE_DISTRIBUTED_STORE_NAME, STATE_DISTRIBUTED_STORE_CHECKTIME_FIELD, STATE_DISTRIBUTED_STORE_STATE_FIELD, WORKSPACE_STATE_FIELD_NAME, GLOBAL_CHANNEL_NAME, STATE_CLEAN_CHECK_FREQUENCY, STATE_CLEAN_CHECK_VARIANCE, CONTEXT_MESSAGE_DEBOUNCE_MS } from "./constants";
import { errorLog, debug, log, objectHash, getRouterTopicName, warn } from "./utils";
import { Direction, ChannelListenerHandler, LinkState, ChannelSource, LinkParams, ICustomFdc3 } from "./types";

/** Custom GSP FDC3 API implementation, intended to allow GSP apps to migrate to a later Finsemble
 *  version and to communicate/interoperate with applications working with the default FDC3 
 *  implementation.
 */
class CustomFdc3 implements ICustomFdc3 {
	private initialized: boolean = false;
	/** The original FDC3 implementation that we are patching */
	private defaultFdc3: DesktopAgent;
	/** This window's name. */
	private myWindowName: string;
	/** This window's componentType - used to link components of the same type - fine to retrieve async */
	private myComponentType: string; 
	/** Local cache of user channels used for sync responses. */
	private allChannels: Channel[];
	/** Local map of user channels used for sync responses. */
	private channelIdToChannel: Record<string, Channel>;
	/** Channel used when not joined to any channels */
	private globalChannel: Channel | null;
	/** Local state for channel membership, which is manually persisted in workspace. */
	private currentChannelDirections: Record<string, Direction>;
	/** Local store of unfiltered context Listeners that have been set up on each channel (used to remove them when not needed). */
	private currentChannelDefaultFDC3Listeners: Record<string, Listener>;
	/** Unfiltered context Listeners for the global channel (used to remove it when not needed). */
	private globalChannelDefaultFDC3Listener: Listener | null;
	/** Local state for context listeners registered, which are manually hooked to channels to enable gathering of source information etc. */
	private currentContextHandlers: Record<string, ContextHandler[]>;
	/** Local state for channel listeners registered, which are manually hooked to channels to enable gathering of source information etc. */
	private currentChannelHandlers: Record<string, ChannelListenerHandler[]>;
	/** Hashes for recent context messages used to debounce them.  Maps hash to message, first arrival time and sources its been received from. */
	private recentContextMessages: Record<number,[Context, number, string[]]>;
	/** Status flag used to avoid trying to re-save workspace state while its being restored. Do not interact with it directly. */
	private restoringStateFromWorkspace: boolean;
	/** Single handler for state change events - could be changed to an array if necessary */
	private stateChangeHandler: ((err: any, state: LinkState) => void) | null;
	/** DistributedStore containing state for all windows, used to provide synchronus responses
	 *  to linkToChannel calls and provide state updates for menus.
	 */
	private distributedStateStore: StoreModel | null;
	/** Local cache of the remote state, maintained to permit synchronous responses to linkToChannel. */
	private remoteStateCache: Record<string,Record<string,Direction>>;
	/** Time at which the state of the store was last checked for dead windows */
	private remoteStateCheckTime: number;

	/**
	 * Constructor for custom FDC3 DesktopAgent
	 * @param fdc3 Reference to the default FDC3 implementation that we will be patching.
	 */
	constructor(fdc3: DesktopAgent) {
		//---------------------------------------------------------------------
		//State variables
		this.defaultFdc3 = fdc3;
		this.myWindowName = System.Window.getCurrent().name;
		this.myComponentType = "";
		this.allChannels = [];
		this.globalChannel = null;
		this.channelIdToChannel = {};
		this.currentChannelDirections = { };
		this.currentChannelDefaultFDC3Listeners = { };
		this.globalChannelDefaultFDC3Listener = null;
		this.currentContextHandlers = { };
		this.currentChannelHandlers = { };
		this.recentContextMessages = { };
		this.restoringStateFromWorkspace = false;
		this.stateChangeHandler = null;
		this.distributedStateStore = null;
		this.remoteStateCache = {};
		this.remoteStateCheckTime = Date.now();

	}

	/** Async initializer function */
	async initialize(): Promise<void> {
		if (!this.initialized) {
			this.initialized = true;
			System.Window.getCurrent().getOptions(async (options) => {
				this.myComponentType = options?.customData.component.type;
				log(`Got componentType ${this.myComponentType} for window name ${this.myWindowName}`);
			});
			
			
			this.allChannels = await this.defaultFdc3.getUserChannels();
			this.allChannels.map((channel) => this.channelIdToChannel[channel.id] = channel);

			this.globalChannel = await this.defaultFdc3.getOrCreateChannel(GLOBAL_CHANNEL_NAME);
			
			//Retrieve and connect distributed store, which is created by customFDC3Service
			const {err,data: storeObject} = await FSBL.Clients.DistributedStoreClient.getStore({
				store: STATE_DISTRIBUTED_STORE_NAME,
				global: true
			});
			if (err || !storeObject) {
				errorLog(`DistributedStore ${STATE_DISTRIBUTED_STORE_NAME} could not be retrieved`, err);
			} else {
				this.distributedStateStore = storeObject;

				const stateUpdateHandler = (err: any, data: {field: string, value: Record<string,any>}): void => {
					//handle the get and addListener store functions returning data at slightly different places
					const values = data?.value ?? data;
					if (err) {
						errorLog(`Received error from remote state store (store: ${STATE_DISTRIBUTED_STORE_NAME} field: ${STATE_DISTRIBUTED_STORE_STATE_FIELD}})`,err);
					} else {
						this.remoteStateCache = values as Record<string, Record<string,Direction>>;
						debug("Received update to remote state channel directions:", this.remoteStateCache);
					}
				};
				this.distributedStateStore.addListener([STATE_DISTRIBUTED_STORE_STATE_FIELD], stateUpdateHandler);

				const checkTimeUpdatehandler = (err: any, data: {field: string, value: number}): void => {
					if (err) {
						errorLog(`Received error from remote state store (store: ${STATE_DISTRIBUTED_STORE_NAME} field: ${STATE_DISTRIBUTED_STORE_CHECKTIME_FIELD})`,err);
					} else {
						this.remoteStateCheckTime = data?.value as number;
						debug("Received update to remote state checkTime:", this.remoteStateCheckTime);
					}
				};
				this.distributedStateStore.addListener([STATE_DISTRIBUTED_STORE_CHECKTIME_FIELD], checkTimeUpdatehandler);

				//retrieve initial state values as well
				this.distributedStateStore.get([STATE_DISTRIBUTED_STORE_STATE_FIELD], stateUpdateHandler);
				
				debug(`DistributedStore ${STATE_DISTRIBUTED_STORE_NAME} connected`);
			}
			

			//-------------------------------------------------------------------------
			//Setup Router listeners for remote API calls
			//Note we don't use responders as we might go away and come back again with a workspace reload 
			//  and we don't want to handle removing them on workspace switches
			FSBL.Clients.RouterClient.addListener(getRouterTopicName("linkToChannel"), (error, response) => {
				if (error) {
					errorLog('addResponder from linkToChannel failed: ' + JSON.stringify(error));
				} else if (response?.data) {
					const { channelName, direction, doNotApplyAgain } = response.data;
					this.linkToChannel(channelName, direction, undefined, doNotApplyAgain);
				}
			});

			FSBL.Clients.RouterClient.addListener(getRouterTopicName("unlinkFromChannel"), (error, response) => {
				if (error) {
					errorLog('addResponder for unlinkFromChannel failed: ' + JSON.stringify(error));
				} else if (response?.data) {
					const { channelName, doNotApplyAgain } = response.data;
					this.unlinkFromChannel(channelName, undefined, doNotApplyAgain);
				}
			});

			//-------------------------------------------------------------------------
			//Check for workspace state for adapter (we take over saving channel membership as it has directions)
			
			//Use workspace state to set up inital channels with calls to linkToChannel(name,direction)
			await this.loadStateFromWorkspace()
			//If not on any channel to start with, join global channel
			if (Object.keys(this.currentChannelDirections).length == 0) {
				this.joinGlobalChannel();
			}
		} else {
			errorLog("CustomFDC3 is already initialized!");
		}
		
	}
	
	//-------------------------------------------------------------------------
	// Util functions
	/** Util fn to make and log out calls to the default FDC3 implementation for testing purposes. */
	private logAndCall<ReturnType>(fn: Function, args: any[]): ReturnType { 
		log(`Calling default FDC3 implementation for '${fn.name}' with args ${JSON.stringify(args)}`); 
		return fn.apply(this.defaultFdc3, args);
	}

	private joinGlobalChannel() {
		//if we're not on any channel now, subscribe to global channel
		if (!this.globalChannel) { errorLog("Used before initialization!"); return; }
		this.globalChannel.addContextListener(null, (context) => this.defaultContextHandler(GLOBAL_CHANNEL_NAME, context))
		.then((listener) => {
			this.globalChannelDefaultFDC3Listener = listener;
		});
	}

	private leaveGlobalChannel() {
		if (this.globalChannelDefaultFDC3Listener) {
			this.globalChannelDefaultFDC3Listener.unsubscribe();
			this.globalChannelDefaultFDC3Listener = null;
		}
	}

	private isOnGlobalChannel() {
		return !!this.globalChannelDefaultFDC3Listener;
	}

	/** 
	 * Reads and restores state of channel memberships from a workspace.
	 * This function should only be called on start-up to restore state from a workspace load (if present). 
	 */
	private async loadStateFromWorkspace() {
		debug("Loading channel state from workspace...");

		const state = await FSBL.Clients.WindowClient.getComponentState({
			field: WORKSPACE_STATE_FIELD_NAME
		});
		if (state.err || !state.data) {
			log("No customFDC3 state in workspace");

			//publish empty state
			this.publishState();
		} else if (state?.data ) {
			//disable state processing until complete
			this.restoringStateFromWorkspace = true;

			const subscriptionsToRetore = state.data;
			for (let channel in subscriptionsToRetore) {
				this.linkToChannel(channel,subscriptionsToRetore[channel], null, true);
			}

			log("Restored channel state from workspace", this.currentChannelDirections);
			this.restoringStateFromWorkspace = false;
			
			//now publish the loaded state
			this.publishState();
			if(this.stateChangeHandler) { this.stateChangeHandler(null,this.getLinkState()); }
		}
	};

	/**
	 * Saves state (channel subscriptions and directions) to the workspace.
	 */
	private async saveStateToWorkspace() {
		debug("Saving channel state to workspace...", this.currentChannelDirections);
		await FSBL.Clients.WindowClient.setComponentState({ field: WORKSPACE_STATE_FIELD_NAME, value: this.currentChannelDirections});
	}

	/**
	 * Sends the current state to distributedStore, which can be used to update the state of a linker menu when changes occur
	 * and to provide synchronus responses to linkToChannel calls.
	 */
	private publishState() {
		if (!this.distributedStateStore) { errorLog("Used before initialization!"); return; }
		this.distributedStateStore.set([STATE_DISTRIBUTED_STORE_STATE_FIELD, this.myWindowName],this.currentChannelDirections, (err) => {
			if (err) {
				errorLog(`Failed to publish customFDC3 state for ${this.myWindowName}!`, err);
			} else {
				log(`Published customFDC3 state for ${this.myWindowName}` , this.currentChannelDirections);
			}
		});
		//store listener will update our local state cache, but we might not want to wait if updating it in checkAndCleanState
		this.remoteStateCache[this.myWindowName] = this.currentChannelDirections; 
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
	private checkAndCleanState() {
		//use some randomness to stop all windows trying to do this at once after a workspace load (when all are publishing updates)
		if ((Date.now() - this.remoteStateCheckTime) - Math.floor(Math.random() * (STATE_CLEAN_CHECK_FREQUENCY * STATE_CLEAN_CHECK_VARIANCE)) > STATE_CLEAN_CHECK_FREQUENCY) {
			FSBL.Clients.AppsClient.getActiveDescriptors().then(({err, data}) => {
				if (err || !data) {errorLog(`Received error from AppsClient.getActiveDescriptors`, err);}
				else {
					let madeChanges = false;
					for (let windowName in this.remoteStateCache) {
						if (!data[windowName]) {
							debug(`Removing cached state for inactive windowName: ${windowName}`);
							delete this.remoteStateCache[windowName];
							madeChanges = true;
						}
					}
					if (madeChanges) {
						if (!this.distributedStateStore) { errorLog("Used before initialization!"); return; }
						this.distributedStateStore.setMultiple([
							{field: [STATE_DISTRIBUTED_STORE_STATE_FIELD], value: this.remoteStateCache},
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
	private processStateChange() {
		if (!this.restoringStateFromWorkspace) {
			this.publishState();
			this.saveStateToWorkspace();
			if(this.stateChangeHandler) { this.stateChangeHandler(null,this.getLinkState()); }
			this.checkAndCleanState();
		}
	}
	
	/** Handler used to receive context messages and then route them based on channel direction, subscribed listeners etc. 
	 *  
	 *  Handles multiple channel membership; Finsemble will normally ensure that, if send and receiver are on more than one 
	 *  of the same user channels, messages are only received once, through `fdc3.addContextListener`. However, we are 
	 *  retrieving the Channels and connecting to them individually and hence will receive a separate copy through each.
	*/
	private defaultContextHandler(channelId: string, context: Context) {
		if (context.type) { //ignored malformed context with no type field!
			//debounce messages that might arrive from multiple channels in a short space of time (usually sub 1ms, but might grow under load)
			let messageHash = objectHash(context);
			
			if (this.recentContextMessages[messageHash]){ //we've seen this before, additional channel
				this.recentContextMessages[messageHash][2].push(channelId);
			} else { //new message
				this.recentContextMessages[messageHash] = [context, Date.now(), [channelId]];
				//setup handling after debounce period
				setTimeout(() => {
					this.defaultContextRouter(context,this.recentContextMessages[messageHash][2]);
					console.debug(`message ${messageHash} routed, channels `,this.recentContextMessages[messageHash][2]);
					delete this.recentContextMessages[messageHash];
				}, CONTEXT_MESSAGE_DEBOUNCE_MS);
			}
			debug(`received message ${messageHash} on channel ${channelId} `,this.recentContextMessages[messageHash]);
		} 
	}

	/** Routes context messages to their handlers, after checking the direction of channel membership.  */
	private defaultContextRouter(context: Context, channels: string[]) {
		//Route onwards to all normal channel listeners, ignoring direction
		if (this.currentContextHandlers["null"]) { this.currentContextHandlers["null"].map((handler) => {handler.apply(this.defaultFdc3, [context]);}) }
		if (this.currentContextHandlers[context.type]) { this.currentContextHandlers[context.type].map((handler) => {handler.apply(this.defaultFdc3, [context]);}) }

		//Global channel only applies to default addContextListener and broadcast functions
		if (!this.isOnGlobalChannel()){
			//Route onwards to ChannelListeners, after filtering by direction
			//debounce should have collected up multiple channels if it arrived on multiple here
			const filteredChannels: string[] = [];
			channels.map((channelId) => { 
				if (this.currentChannelDirections[channelId] == Direction.Both ||
						this.currentChannelDirections[channelId] == Direction.Listen){
					filteredChannels.push(channelId);
				}
			});

			if (filteredChannels.length > 0){	
				const source: ChannelSource = { channels: filteredChannels, allChannels: this.allChannels };
				if (this.currentChannelHandlers["null"]) { this.currentChannelHandlers["null"].map((handler) => {handler.apply(this.defaultFdc3, [context, source]);}) }
				if (this.currentChannelHandlers[context.type]) { this.currentChannelHandlers[context.type].map((handler) => {handler.apply(this.defaultFdc3, [context, source]);}) }
			}
		}
	}

	/** Util for returning a LinkState (used as a return from linkToChannel. */
	private getLinkState(channelDirections?: Record<string,string>): LinkState {
		const _directions: Record<string,string> = channelDirections ?? this.currentChannelDirections;
		const _channelIds: string[] = Object.keys(_directions);
		return {
			channels: _channelIds.map((channelId: string) => this.channelIdToChannel[channelId]),
			allChannels: this.allChannels,
			channelDirections: _directions
		};
	}

	/** Utility function for displaying dialog to apply channel link changes to other apps of the same type.
	 */
	private maybeDisplayLinkOtherAppsDialog(applyChange: (windowName:string) => void): void {
		//first check if there are any other instances of this app!
		let otherInstances = false;
		FSBL.Clients.AppsClient.getActiveDescriptors().then(({err, data}) => {
			if (err || !data) {errorLog(`Received error from AppsClient.getActiveDescriptors`, err);}
			else {
				for (let windowName in data) {
					if (data[windowName].componentType == this.myComponentType) {
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
						log('Apply Channel dialog response', response);

						if (response.choice == "affirmative") {
							FSBL.Clients.AppsClient.getActiveDescriptors().then(({err, data}) => {
								if (err || !data) {errorLog(`Received error from AppsClient.getActiveDescriptors`, err);}
								else {
									for (let windowName in data) {
										if (data[windowName].componentType == this.myComponentType) {
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
				log(`Skipping dialog to ask user if they wish to link other channels as this is the only instance of ${this.myComponentType}`);
			}
		});
	};

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
	linkToChannel(channelName: string, direction: Direction = Direction.Both, windowName: string | null | undefined, doNotApplyAgain: boolean) : LinkState {
		//check args
		if (!Object.values<string>(Direction).includes(direction)) {
			const errMsg = `Unrecognized direction '${direction}', valid directions: ${Object.values(Direction)}`;
			errorLog(errMsg);
			return this.getLinkState();
		} else {
			if (windowName && this.myWindowName !== windowName) {
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
				if(this.remoteStateCache[windowName]){
					this.remoteStateCache[windowName][channelName] = direction;
					return this.getLinkState(this.remoteStateCache[windowName]);
				} else {
					warn(`Cached channel state was not available for ${windowName}, returning local LinkState instead`);
					return this.getLinkState();
				} 
			} else {

				//drop off the global channel if on it
				this.leaveGlobalChannel();

				//set membership direction
				this.currentChannelDirections[channelName] = direction;

				//setup default FDC3 subscription for context
				if (!this.currentChannelDefaultFDC3Listeners[channelName]) {
					this.channelIdToChannel[channelName].addContextListener(null, (context) => this.defaultContextHandler(channelName,context))
					.then((listener) => { this.currentChannelDefaultFDC3Listeners[channelName] = listener });
				}

				this.processStateChange();

				if (!doNotApplyAgain) {
					//Apply change to other components of teh same type
					const linkParams: LinkParams = {channelName, direction, doNotApplyAgain: true /* don't prompt user on each  one */};
					const applyChange = (windowName: string | undefined) => {
						log(`Linking ${windowName} to channel '${channelName}', direction '${direction}'`);
						FSBL.Clients.RouterClient.transmit(
							getRouterTopicName("linkToChannel",windowName),
							linkParams//{channelName, direction, true /* don't prompt user on each  one */}
						);
					};
					this.maybeDisplayLinkOtherAppsDialog(applyChange);
				}

				return this.getLinkState();
			}
		}
	}

	/** Standard FDC3 function, adapted to work with preload. */
	joinUserChannel(channelId: string) : Promise<void> {
		this.linkToChannel(channelId, Direction.Both, null, true);
		return Promise.resolve();
	}

	/** Standard FDC3 function, adapted to work with preload. */
	joinChannel (channelId: string) : Promise<void> { return joinUserChannel(channelId); }
	
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
	unlinkFromChannel (channelName: string, windowName: string | null | undefined, doNotApplyAgain: boolean): void {
		if (windowName && this.myWindowName !== windowName) {
			//Use a router transmit to tell the named window to make this call then return
			FSBL.Clients.RouterClient.transmit(
				getRouterTopicName("unlinkFromChannel",windowName),
				{channelName, doNotApplyAgain}
			);
			
		} else {
			//clear membership direction
			if(this.currentChannelDirections[channelName]) {
				delete this.currentChannelDirections[channelName];
			}

			//unsubscribe default FDC3 subscription for context
			if (this.currentChannelDefaultFDC3Listeners[channelName]) {
				this.currentChannelDefaultFDC3Listeners[channelName].unsubscribe();
				delete this.currentChannelDefaultFDC3Listeners[channelName];
			}

			if (Object.keys(this.currentChannelDirections).length == 0) {
				this.joinGlobalChannel();
			}

			this.processStateChange();

			if (!doNotApplyAgain) {
				//Apply change to other components of teh same type
				const linkParams: LinkParams = {channelName, doNotApplyAgain: true /* don't prompt user on each  one */};
				const applyChange = (windowName: string | undefined) => {
					log(`Unlinking ${windowName} from channel '${channelName}''`);
					FSBL.Clients.RouterClient.transmit(
						getRouterTopicName("unlinkFromChannel",windowName),
						linkParams 
					);
				};
				this.maybeDisplayLinkOtherAppsDialog(applyChange);
			}
		}
	}

	/** Standard FDC3 function, adapted to work with preload. Leaves all channels. */
	leaveCurrentChannel() : Promise<void> {
		for (let channel in this.currentChannelDirections) {
			this.unlinkFromChannel(channel, null, true);
		}
		return Promise.resolve();
	}

	/** Finsemble specific FDC3 function, adapted to work with preload. Leave a specific channel. */
	leaveChannel(channelId: string) : Promise<void> {
		this.unlinkFromChannel(channelId, null, true);
		return Promise.resolve();
	}
	
	/**
	 * Non standard name/return type version of getCurrentChannels(), which is itself non-standard.
	 */
	getLinkedChannels(): Array<string> {
		return Object.keys(this.currentChannelDirections);
	}
	
	/** Standard FDC3 function, adapted to work with preload. Returns the first channel it sees. */
	getCurrentChannel() : Promise<Channel | null>  {
		const linkedChannels = this.getLinkedChannels();
		if (linkedChannels.length > 0){
			return Promise.resolve(null);
		} else {
			return this.defaultFdc3.getOrCreateChannel(linkedChannels[0]);
		}
	}

	/** Finsemble specific FDC3 function, adapted to work with preload. Returns all channels. */
	getCurrentChannels() : Promise<Channel[] | null> {
		const linkedChannels = this.getLinkedChannels();
		if (linkedChannels.length > 0){
			return Promise.resolve(null);
		} else {
			return Promise.all(linkedChannels.map((channelId)=>this.defaultFdc3.getOrCreateChannel(channelId)));
		}
	}
	
	/**
	 * Register a callback for when the channels change. Works using internal state tracking rather than a link to Finsemble's state.
	 * 
	 * When an application is started, a listener is created on the window name. When the listener is invoked (by joining, leaving 
	 * channels, channel direction change, LinkerClient.onStateChange is called), the callback supplied to the method is called with 
	 * the current LinkerClient state and channel directions.
	 * @param cb 
	 */
	onStateChange (cb: (err: any, state: LinkState) => void): void {
		this.stateChangeHandler = cb;
	}
	
	/**
	 * Returns the window's linked channels and their directions.
	 */
	getChannelDirections (): Record<string, string> {
		return this.currentChannelDirections;
	}

	addContextListener(handler: ContextHandler): Promise<Listener>;
	addContextListener(contextType: string | null, handler: ContextHandler): Promise<Listener>;
	
	/**
	 * If not channel is joined, the context listener is added to a global default channel
	 * When a channel is joined, the context listener is switched to the joined channel/channels
	 * @param contextTypeOrHandler
	 * @param handler 
	 */
	addContextListener (...args: any[]): Promise<Listener> {
		//We're internally subscribing to all the channel's context and routing internally to context listeners
		// so we just need to set up handler by type here.

		//handle deprecated addContextListener signature
		let _contextType:string;
		let _handler:ContextHandler;
		if (typeof args[0] == "function"){
			_contextType = "null";
			_handler = args[0];
		} else if (args[0] == null){
			_contextType = "null";
			_handler = args[1];
		} else {
			_contextType = args[0];
			_handler = args[1];
		}

		if (!this.currentContextHandlers[_contextType]) {
			this.currentContextHandlers[_contextType] = [];
		}
		this.currentContextHandlers[_contextType].push(_handler);
		
		//Create a Listener (unsubscribe function) to remove this again
		return Promise.resolve({ unsubscribe: () => {
			this.currentContextHandlers[_contextType].splice(this.currentContextHandlers[_contextType].indexOf(_handler),1);
		}}); 
	}
	
	/**
	 * Creates a subscriber for messages matching the sent context type. The consumed message is passed 
	 * to the handler only if the current window has channels that have either "Both" or "Listen" direction.
	 * The handler takes a context and a source object containing
	 *  - a list of linked channels and that have a direction of either ‘Both’ or ‘Listen’.
	 *  - a list of all channels
	 * @param contextType 
	 * @param handler 
	 */
	addChannelListener (contextType: string | null, handler: ChannelListenerHandler): Listener {
		//We're internally subscribing to all the channel's context and routing internally to context listeners
		// so we just need to set up handler by type here.
		let _contextType = contextType ?? "null";
		if (!this.currentChannelHandlers[_contextType]) {
			this.currentChannelHandlers[_contextType] = [];
		}
		this.currentChannelHandlers[_contextType].push(handler);

		//Create a Listener (unsubscribe function) to remove this again
		return { unsubscribe: () => {
			this.currentChannelHandlers[_contextType].splice(this.currentChannelHandlers[_contextType].indexOf(handler),1);
		}}; 
	}
	
	/**
	 * Context broadcast function. Sends to the currently joined channels or the global channel
	 * if none have been joined. Ignores directionality of listening.
	 * @param context 
	 * @returns 
	 */
	broadcast (context: Context): Promise<void> {
		if (!this.globalChannel) { return Promise.reject("Used before initialization!"); }
		//broadcast to global or other channels we're currently linked to
		if (this.isOnGlobalChannel()) {
			this.globalChannel.broadcast(context);
		} else {
			for (let channelId in this.currentChannelDirections) {
				this.channelIdToChannel[channelId].broadcast(context);
			}
		}

		return Promise.resolve();
	}
	
	/**
	 * The message is broadcasted only if the current window has channels that have either "Both" or "Broadcast" direction.

	* @param context 
	*/
	publishToChannel (context?: Context): void {
		if (context) {
			if (this.isOnGlobalChannel()) {
				debug(`Ignoring publishToChannel as we're only on the ${GLOBAL_CHANNEL_NAME} channel`);
			} else {
				for (let channelId in this.currentChannelDirections) {
					if (this.currentChannelDirections[channelId] == Direction.Both ||
						this.currentChannelDirections[channelId] == Direction.Broadcast) {
							this.channelIdToChannel[channelId].broadcast(context);
					} else {
						debug(`ignoring publishToChannel for channel ${channelId} as its set to Listen only`);
					}
				}
			}
		} else {
			warn("No context was passed to publishToChannel, ignoring...");
		}
	}

	//-----------------------------------------------------------------------
	//provide standard FDC3 functions, whereever they don't conflict with custom, to aid migration
	// apps
	open(name: string, context?: Context): Promise<AppIdentifier>;
	open(app: AppIdentifier, context?: Context): Promise<AppIdentifier>;
	open(appOrName: AppIdentifier | string, context?: Context): Promise<AppIdentifier> { return this.logAndCall<Promise<AppIdentifier>>(this.defaultFdc3.open, [appOrName, context]) }
	findInstances (app: AppIdentifier): Promise<Array<AppIdentifier>> { return this.logAndCall<Promise<Array<AppIdentifier>>>(this.defaultFdc3.findInstances, [app]) }
	getAppMetadata (app: AppIdentifier): Promise<AppMetadata> { return this.logAndCall<Promise<AppMetadata>>(this.defaultFdc3.getAppMetadata,[app]) }

	// context listening must use custom implementation above

	// intents
	findIntent (intent: string, context?: Context, resultType?: string): Promise<AppIntent> { return this.logAndCall<Promise<AppIntent>>(this.defaultFdc3.findIntent,[intent, context, resultType]) }
	findIntentsByContext (context: Context, resultType?: string): Promise<Array<AppIntent>> { return this.logAndCall<Promise<Array<AppIntent>>>(this.defaultFdc3.findIntentsByContext,[context, resultType]) }
	
	raiseIntent(intent: string, context: Context, name?: String): Promise<IntentResolution>;
	raiseIntent(intent: string, context: Context, app?: AppIdentifier): Promise<IntentResolution>;
	raiseIntent (intent: string, context: Context, app?: unknown): Promise<IntentResolution> { return this.logAndCall<Promise<IntentResolution>>(this.defaultFdc3.raiseIntent,[intent, context, app]) }
	
	raiseIntentForContext(context: Context, name?: String): Promise<IntentResolution>;
	raiseIntentForContext(context: Context, app?: AppIdentifier): Promise<IntentResolution>;
	raiseIntentForContext (context: Context, app?: unknown): Promise<IntentResolution> { return this.logAndCall<Promise<IntentResolution>>(this.defaultFdc3.raiseIntentForContext,[context, app]) }
	
	addIntentListener (intent: string, handler: IntentHandler): Promise<Listener> { return this.logAndCall<Promise<Listener>>(this.defaultFdc3.addIntentListener,[intent, handler]) }

	// channels
	getOrCreateChannel (channelId: string): Promise<Channel> { return this.logAndCall<Promise<Channel>>(this.defaultFdc3.getOrCreateChannel,[channelId]) }
	createPrivateChannel (): Promise<PrivateChannel> { return this.logAndCall<Promise<PrivateChannel>>(this.defaultFdc3.createPrivateChannel,[]) }
	getUserChannels (): Promise<Array<Channel>> { return this.logAndCall<Promise<Array<Channel>>>(this.defaultFdc3.getUserChannels,[]) }

	// User channel management functions must use custom implementations above

	//implementation info
	getInfo (): Promise<ImplementationMetadata> { return this.logAndCall<Promise<ImplementationMetadata>>(this.defaultFdc3.getInfo,[]) }

	//Deprecated functions
	getSystemChannels (): Promise<Array<Channel>> { return this.logAndCall<Promise<Array<Channel>>>(this.defaultFdc3.getSystemChannels,[]) }
};

const main = async () => {
	console.log("custom FDC3 preload starting up");

	const isBrowserView = window.fin.isBrowserView();
	const isTitlebarWindow = window.fin.isTitlebarWindow();
	const isTitleBar = !isBrowserView && isTitlebarWindow;
	
	//Don't run in the titlebar of BrowserView windows
	//  whilst this is possible, it will require some small additional finesse, for example to ensure
	//  that only one copy of the preload sets up the router listeners to hand linkToChannel and
	//  unlinkFromChannel API calls.
	//  Hence, if customFDC3 functionality needs to be provided for titlebars, that should be addressed 
	//  directly in a customisation to the titlebar. 
	if (isTitleBar) {
		log("NOT running customFdc3 preload in titlebar window.");
	} else {
		// Wait for the fdc3 global to appear up, then monkey patch it ASAP
		const monkeyPatch = async () => {
			// Ignore type mismatch caused by imported types for globals that our customFDC3 doesn't match
			// @ts-ignore
			window.fdc3 = new CustomFdc3(window.fdc3);
			await (window.fdc3 as ICustomFdc3).initialize();
		};

		//We need to wait for FSBL and fdc3 to be created before we can use and/or patch them
		if (window.FSBL && FSBL.addEventListener) {
			FSBL.addEventListener("onReady", monkeyPatch);
		} else {
			window.addEventListener("FSBLReady", monkeyPatch);
		}
	}
};

//execute immediately, we wait for Finsemble Client init inside main
main();

