import { _BaseClient } from "./baseClient";
import { WindowIdentifier, StandardCallback } from "../globals";
declare type linkerGroup = {
    /**
     * name of the channel
     */
    name: string;
    /**
     * color. Required to use Finsemble's built-in Linker component.
     */
    color?: string;
    /**
 * border color. Required to use Finsemble's built-in Linker component.
 */
    border?: string;
};
/**
 *
 * @introduction
 * <h2>Linker Client</h2>
 * <p>
 * The Linker API allows components to synchronize on a piece of data. For instance, an end user can use the Linker to link multiple components by stock symbol.
 * Use the Linker API to enable your components to participate in this synchronization.
 * </p>
 * <p>
 * In order for components to be linked, the components must understand the data format that will be passed between them (the "context"), and agree on a label that identifies that format (the <code>dataType</code>).
 * For instance, components might choose to publish and subscribe to a <code>dataType</code> called "symbol".
 * They would then also need to agree what a "symbol" looks like, for instance, <code>{symbol:"IBM"}</code>.
 * The Linker API doesn't proscribe any specific format for context or set of labels.
 * </p>
 *
 * <p>
 * Behind the scenes, the Linker Service coordinates Linker activity between components. It keeps track of the available channels and channel assignments.
 * It uses a dedicated store (<a href="DistributedStoreClient.html">the Distributed Store</a>) to maintain this information and also persists the information to workspaces (<a href="WorkspaceClient.html">Workspace Client</a>).
 * </p>
 *
 * <p>
 * The Linker Client frequently uses the parameters <code>windowIdentifier</code> and <code>componentType</code>. <a href="tutorial-ComponentTypesAndWindowNames.html">Learn more about them here</a>.
 * </p>
 *
 * <p>
 * For more information, see the <a href="tutorial-Linking.html">Linking tutorial</a>.
 * </p>
 * @hideconstructor
 *
 * @constructor
 */
export declare class LinkerClient extends _BaseClient {
    constructInstance: () => LinkerClient;
    linkerStore: any;
    launcherClient: any;
    windowClient: any;
    distributedStoreClient: any;
    dontPersistYet: boolean;
    constructor(params: any);
    stateChangeListeners: any[];
    allChannels: any[];
    channels: {};
    clients: {};
    channelListenerList: any[];
    dataListenerList: {};
    /**
     * 1/24/19 this is Brad guessing. This function has never existed. This is the first commit where 'getChannel' is referenced...but not defined.
     *
     * https://github.com/ChartIQ/finsemble/blob/ad25aa219c5fac60c277bccf35dea43568da2a07/src/clients/linkerClient.js
     *
     * No idea how it ever worked.
     * @private
     *
     */
    getChannel(name: string): boolean;
    /**
     * Create a new Linker channel. This channel will be available *globally*.
     * @param {object} params
     * @param cb - Optional. Callback to retrieve returned results asynchronously.
     * @return {Array.<string>} Returns an array of all available channels
     * @private
     * @since TBD deprecated createGroup
     * @example
     * LinkerClient.createChannel({name: "red", color: "#ff0000", border: "#ffffff"}, callback)
     */
    createChannel(params: linkerGroup, cb: Function): any;
    /**
     * Remove a Linker channel. It will be removed globally. Any component that is currently assigned to this channel will be unassigned.
     *
     * @param {string} name - The name of the channel to remove
     * @param cb - Optional. Callback to retrieve returned results asynchronously
     * @returns {Array.<string>} Returns an array of available channels
     * @since TBD deprecated deleteGroup
     * @private
     *
     * @example
     * FSBL.Clients.LinkerClient.removeChannel("group1")
     *
     */
    removeChannel(name: string, cb: Function): any;
    /**
     * Convenience function to update the client information in the store.
     * @private
     */
    updateClientInStore(key: any): void;
    /**
     * Add a component to a Linker channel programmatically. Components will begin receiving any new contexts published to this channel but will <b>not</b> receive the currently established context.
     *
     * @param {string} channel - The name of the channel to link our component to, or an array of names.
     * @param windowIdentifier -  Optional. windowIdentifier for the component. If null, it defaults to the current window.
     * @param cb - Optional. Callback to retrieve returned results asynchronously.
     * @return {LinkerState} The new state: linked channels, all channels
     * @since 2.3 deprecated addToGroup
     * @example
     *
     * FSBL.Clients.LinkerClient.linkToChannel("group3", null); // Link current window to channel.
     * FSBL.Clients.LinkerClient.linkToChannel("group3", windowIdentifier); // Link the requested window to channel.
     *
     */
    linkToChannel(channel: string | string[], windowIdentifier: WindowIdentifier, cb?: Function): any;
    /**
     * Unlinks a component from a Linker channel.
     *
     * @param {string} channel - Channel to remove, or an array of channels. If null, then all channels will be removed.
     * @param windowIdentifier -  windowIdentifier for the window. Defaults to current window if left null.
     * @param cb - Optional. Callback to retrieve returned results asynchronously.
     * @return {LinkerState} Returns the new state: linked channels, all channels
     * @since 2.3 deprecated removeFromGroup
     * @example
     *
     * FSBL.Clients.LinkerClient.unlinkFromChannel("group1", null); // Unlink the current window from channel "group1"
     * FSBL.Clients.LinkerClient.unlinkFromChannel("group1", windowIdentifier) // Unlink the requested window from channel "group1"
     *
     */
    unlinkFromChannel(channel: string | string[], windowIdentifier: WindowIdentifier, cb?: Function): any;
    /**
     * Returns all available Linker channels.
     * @param cb Optional. Callback to retrieve returned results asynchronously.
     * @return {array} An array of all channels. Each array item is {name:channelName} plus any other optional fields such as color.
     * @since 2.3 deprecated getAllGroups
     * @example
     * FSBL.Clients.LinkerClient.getAllChannels()
     */
    getAllChannels(cb?: Function): any;
    /**
     * Retrieve all channels linked to the requested component. Also returns all available channels.
     * @param windowIdentifier Retrieve all channels for identified window. If null, will retrieve for the current window.
     * @param cb Optional. Callback to retrieve returned results asynchronously
     * @return {LinkerState} The current state: linked channels, all channels
     * @since 2.3 deprecated getGroups, no longer supports a callback
     * @example
     * var state=LinkerClient.getState(windowIdentifier)
     */
    getState(windowIdentifier?: WindowIdentifier, cb?: StandardCallback): any;
    /**
    * Remove all listeners for the specified dataType.
    * @param {String}  dataType - The data type to which the component is subscribed.
    * @param {function} cb - Optional. Callback to retrieve returned results asynchronously (empty object)
    *
    * @example
    * FSBL.Clients.LinkerClient.unsubscribe("symbol");
    */
    unsubscribe(dataType: string, cb?: StandardCallback): any;
    /**
    * Publish a piece of data. The data will be published to <b>all channels</b> that the component is linked to. Foreign components that are linked to those channels will receive the data if they have subscribed to this dataType. They can then use that data to synchronize their internal state. See {@link LinkerClient#subscribe}.
    * @param {String}  params.dataType - A string representing the data type being sent.
    * @param {any}  params.data - The data ("context") being transmitted.
  * @param {array<string>} params.channels - Optional. Specifies which channels publish this piece of data. This overrides the default which is to publish to all linked channels.
    * @param cb - Optional. Callback to retrieve returned results asynchronously.
    * @example
    * FSBL.Clients.LinkerClient.publish({ dataType:"symbol", data:"AAPL" })
    */
    publish(params: {
        dataType: string;
        data: any;
        channels?: string[];
    }, cb: StandardCallback): any;
    /**
    * Registers a client for a specific data type that is sent to a channel. Calling `subscribe` multiple times adds additional handlers.
    * @param {String} dataType A string representing the data type to subscribe to.
    * @param {StandardCallback} cb A function to be called once the Linker receives the specific data.
    * @example
    * FSBL.Clients.LinkerClient.subscribe("symbol", function(data) {
    * 	console.log("New symbol received from a remote component " + data);
    * });
    */
    subscribe(dataType: string, cb: StandardCallback): any;
    /**
     * Retrieves an array of all components with links that match the given parameters. If no parameters are specified, all windows with established links will be returned.
     *
     * @param {object} params Optional
     * @param {Array.<string>} params.channels Restrict to these channels.
     * @param {Array.<string>} params.componentTypes Restrict to these componentTypes. The componentType is a key in the finsemble.components configuration object.
     * @param {windowIdentifier} params.windowIdentifier Restrict to this component.
     * @param cb Optional. Callback to retrieve returned results asynchronously.
     * @returns {array} An array of linked components, their windows, and their linked channels.
     *
     * @since 1.5
     * @since 2.3 deprecated getLinkedWindows
     * @example <caption>Get all components linked to a given component</caption>
     * FSBL.Clients.LinkerClient.getLinkedComponents({ windowIdentifier: wi });
     *
     * @example <caption>Get all components linked to channel "group 1"</caption>
     * FSBL.Clients.LinkerClient.getLinkedComponents({ channels: ['group1'] });
     * // Response format: [{windowName: 'Window Name', componentType: 'Component Type', uuid: 'uuid', channels: ['group1'] }]
     */
    getLinkedComponents(params: {
        channels?: string[];
        componentTypes?: string[];
        windowIdentifier?: WindowIdentifier;
    }, cb?: StandardCallback): any;
    /**
     * Handles listeners (looks to see if there is a listener for a specific data type)
     * @private
     */
    handleListeners: (err: any, data: any) => void;
    /**
     * Adds new listeners for channels when channels are updated
     * @private
     */
    updateListeners(): void;
    /**
     * Use this method to register a callback which will be called whenever the state of the Linker changes. This will be called whenever a user links or unlinks your component to a channel.
     * @param {function} cb  returns { null, LinkerClient~state }
     * @example
     * FSBL.Clients.LinkerClient.onStateChange(function(err, response){
     *    if(response.channels){
     * 		console.log("Printout of channel status ", response.channels);
     * 	}
     * });
     */
    onStateChange(cb: StandardCallback): void;
    /**
     * Persists the current linker state. When the window is restored, that state will be available and restored (in initialize).
     * @private
     * @param {object} state The state enabled for this Linker instance
     */
    persistState(state: any): void;
    /**
     * Callback function for linkerStore.addListener({ field: "clients." + key }). Updates channels and persistState.
     *
     * @param {object} response contains changed listener data
     * @private
     */
    private clientsKeyValueChangeStoreListener;
    /**
     * Callback function forlinkerStore.addListener({}).  Updates allChannels, allGroups, and clients.
     *
     * @param {object} response contains changed listener data
     * @private
     */
    private anyFieldChangeStoreListener;
    /**
     * @private
     */
    start(cb: any): void;
    /**
     * @private
     */
    onClose: (cb: any) => void;
    /**
     * Minimize all windows except those on specified channel
     * @param {string} channel
     * @private
     */
    hyperFocus(channel: any): void;
    /**
     * Bring all windows in specified channel to the front
     * @param {params} object
     * @param {params.channel} channel to btf.
     * @param {params.restoreWindows} whether to restore windows that are minimized prior to calling bring to front.
     * @private
     */
    bringAllToFront(params: any): void;
    groups: {};
    allGroups: any[];
    /**
     * Creates a linker channel
     * @param {linkerGroup} group The linker channel to create
     * @param {Function} cb The callback
     * @private
     */
    createGroup(group: linkerGroup, cb: any): any;
    /**
     * Removes a linker channel from the list of available channels
     * @param {string} groupName The name of the channel to delete
     * @param {Function} cb The callback
     * @private
     */
    deleteGroup(groupName: string, cb: any): any;
    /**
     * Adds a given window to given channel
     * @param {string} groupName The channel name
     * @param {WindowIdentifier} client The window to add to the given channel
     * @param {Function} cb The callback (optional)
     * @private
     */
    addToGroup(groupName: string, client: WindowIdentifier, cb?: StandardCallback): any;
    /**
     * Remove a given window from a linker channel
     * @param {string} groupName The name of the linker channel to disconnect from
     * @param {WindowIdentifier} client The window to remove from the given channel
     * @param {Function} cb The callback (optional)
     * @returns The response from removing the window from the given channel
     * @private
     */
    removeFromGroup(groupName: string, client: WindowIdentifier, cb?: StandardCallback): any;
    /**
     * Gets a list of all linker channels
     * @param {Function} cb The callback
     * @returns An array of linker channel names
     * @private
     */
    getAllGroups(cb: Function): any;
    /**
     * Asynchronously returns the list of all linked channels of a given window
     * @param {WindowIdentifier} [client] The window to find linked groups of
     * @param {Function} cb The callback (optional)
     * @returns Asynchronously returns list of channels
     * @private
     */
    getGroups(client?: WindowIdentifier, cb?: Function): any;
    /**
    * Remove all listeners for the specified dataType.
    * @param {String}  dataType - The data type to which the component is subscribed.
    * @example
    * FSBL.Clients.LinkerClient.unsubscribe("symbol");
    * @deprecated To be removed in 4.0.0. Please use LinkerClient.unsubscribe().
    */
    unSubscribe(dataType: string): void;
    /**
     * Retrieves an array of all components with links that match the given parameters. If no parameters are specified, all windows with established links will be returned.
     *
     * @param {object} params Optional
     * @param {Array.<string>} params.channels Restrict to these channels.
     * @param {Array.<string>} params.componentTypes Restrict to these componentTypes. The componentType is a key in the finsemble.components configuration object.
     * @param {windowIdentifier} params.windowIdentifier Restrict to this component.
     * @param {windowIdentifier} params.client Alias for windowIdentifier.
     * @param {Array.<string>} params.groups Alias for channels.
     * @param cb - Optional. Callback to retrieve returned results asynchronously.
     * @returns {array} An array of linked components, their windows, and their linked channels.
     *
     * @example <caption>Get all components linked to a given component</caption>
     * FSBL.Clients.LinkerClient.getLinkedWindows({windowIdentifier: wi});
     *
     * @example <caption>Get all Windows linked to channel "group1"</caption>
     * FSBL.Clients.LinkerClient.getLinkedComponents({ channels: ['group1'] });
     * // Response format: [{ windowName: 'Window Name', componentType: 'Component Type', uuid: 'uuid', channels: ['group1'] }]
     *
     */
    getLinkedWindows(params?: {
        channels?: string[];
        componentTypes?: string[];
        windowIdentifier?: WindowIdentifier;
        groups?: string[];
        client?: any;
    }, cb?: StandardCallback): any;
    /**
     * Asynchronously retrieves a window's windowIdentifier
     * @param {any} [params] Parameters
     * @param {Function} cb The callback
     * @private
     */
    windowIdentifier(params: any, cb: any): any;
    onLinksUpdate: {
        push: (cb: any) => void;
    };
    linkerWindow: any;
    loading: boolean;
    /**
     * Opens the Linker window.
     * @param {Function} cb The callback to be invoked after the method completes successfully.
     */
    openLinkerWindow(cb: any): void;
}
declare const linkerClient: LinkerClient;
export default linkerClient;
/**
 * Callback that returns a list of channels in the responseMessage
* @callback LinkerChannelsCB
* @param {Object} err Error message, or null if no error
* @param {Array.<string>} channels List of channels
*/
/**
 * Callback that returns a new {@link LinkerState}
* @callback LinkerStateCB
* @param {Object} err Error message, or null if no error
* @param {Array.<string>} channels List of all channels linked to the requested component
* @param {Array.<string>} allChannels List of all available channels
*/
/**
 * A list of enabled channels and a list of all channels
* @callback LinkerState
* @param {Array.<string>} channels List of all channels linked to the requested component
* @param {Array.<string>} allChannels List of all available channels
*/
