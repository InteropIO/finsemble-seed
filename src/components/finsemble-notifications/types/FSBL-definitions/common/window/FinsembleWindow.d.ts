import { WindowEventManager } from "./WindowEventManager";
import { FinsembleEvent } from "./FinsembleEvent";
import { WindowIdentifier, StandardCallback, WrapState, WindowEventName } from "../../globals";
declare global {
    interface Window {
        _FSBLCache: any;
    }
}
export declare class FinsembleWindow {
    addListener: Function;
    Group: any;
    componentState: any;
    wrapState: WrapState;
    name: string;
    windowOptions: any;
    bounds: object;
    wrapStateChangeSubscription: any;
    WINDOWSTATE: any;
    parentWindow: any;
    windowKey: string;
    componentKey: string;
    TITLE_CHANGED_CHANNEL: string;
    TITLE_CHANGED_SUBSCRIPTION: any;
    windowState: number;
    identifier: WindowIdentifier;
    windowName: string;
    type: string;
    windowType: string;
    setWindowType: string;
    types: any;
    removeListener: Function;
    removeListeners?: Function;
    parentSubscribeID: any;
    eventManager: WindowEventManager;
    eventlistenerHandlerMap: Partial<{
        [key in WindowEventName]: {
            handler: (...args: any[]) => void;
            internalHandler: (...args: any[]) => void;
            interceptor: FinsembleEvent;
            guid: string;
        }[];
    }>;
    guid: string;
    private settingParent;
    constructor(params: any);
    standardizeEventName(event: any): any;
    _eventHandled(interceptor: any, guid: any, canceled?: boolean): void;
    addEventListener(eventName: WindowEventName, handler: any): void;
    removeEventListener(eventName: WindowEventName, handler: any): Promise<{}>;
    listenForEvents(): void;
    static WINDOWSTATE: any;
    windowServiceChannelName(channelTopic: any): string;
    eventChannelName(channelTopic: any): string;
    listenForBoundsSet(): void;
    animate(params?: {}, callback?: Function): void;
    getWindowStore(cb: any): any;
    doConstruction(params: any): any;
    static registerType(name: any, type: any): void;
    /**
     * This is used to bind all functions only in FinsembleWindow and not in the child wrappers to the wrappers. Without this binding, the value of "this" in the functions is wrong.
     * @param {} obj
     */
    static bindFunctions(obj: any): void;
    setupListeners(name: any): void;
    onTitleChanged(err: any, response: any): void;
    /**
     * Async wrap. Given a name/windowName, it will query the launcher for information required to wrap the window. Then it will return an object that can be operated on. Also this creates a cache of all wrapped windows for performance. Our clients wrap the same window often and this was causing excessive messaging to the store and degrading performance.
     * @param {*} params Need only name in most cases. For service and other cases where the window is not part of what the launcher considers active windows, name and uuid are required
     * @param {boolean} params.waitForReady If true, will async await for Finsemble to return ready before continuing to build the instance to return
     * @param {*} cb
     */
    static wrap: typeof FinsembleWindow.getInstance;
    static getInstance(params: any, cb?: Function): Promise<{
        wrap: FinsembleWindow;
    }>;
    /**
     * Method for determining whether the window being wrapped is the startup app's main window (the service manager).
     *
     * @static
     * @memberof FinsembleWindow
     */
    static isStartupApplication: (windowName: any) => Promise<boolean>;
    static _windowReady: (windowName: any) => Promise<{}>;
    /**
     * Creates a Finsemble WindowWrap
     * @param {*} params
     * @param {string} params.name The name of the window
     * @param {*} [params.retrievedIdentifier] Retrieved window identifier
     * @param {*} [params.windowIdentifier] The window identifier
     * @param {boolean} [param.setWindowType] If true, will set the window type
     */
    static _createWrap(params: any): any;
    static _getRemoveWrapChannel(name: any): string;
    handleWrapRemoveRequest(event: any): Promise<void>;
    cleanupRouter(): void;
    handleWrapStateChange: (err: any, response: any) => void;
    onReady(callback: any): any;
    /**
     * @param {string} methodName method name (e.g. "minimize", "maximize")
     * @param {object} params
     * @param {function=} callback
     * @memberof FinsembleWindow
     * @private
     */
    queryWindowService(methodName: any, params: any, callback?: Function): Promise<{}>;
    minimize(params: any, callback: any): void;
    maximize(params: any, callback: any): void;
    restore(params: any, callback: any): void;
    blur(params?: {}, callback?: Function): void;
    focus(params?: {}, callback?: Function): void;
    bringToFront(params?: any, callback?: any): void;
    isShowing(params: any, callback: any): void;
    setBounds(params: any, callback: any): void;
    getBounds(params: any, callback?: Function): Promise<{}>;
    updateOptions(params: any, callback: any): void;
    hide(params?: any, callback?: any): void;
    show(params: any, callback?: any): void;
    showAt(params: any, callback: any): void;
    close(params?: {}, callback?: Function): void;
    /**
     *Register a window with docking. Use this if you don't want to use the full initialization function
     *
     * @param {Object} params - can be anything that is passed to docking for window registration. @todo This should be removed soon
     * @param {Function} cb
     * @memberof FSBLWindow
     */
    registerWithDocking(params: any, cb: any): void;
    /**
     *Unregister a window with docking
     *
     * @memberof FSBLWindow
     */
    unRegisterWithDocking(): void;
    /**
     *This is if we want to handle the full register/ready state inside of the window
     register with docking
     send the message to launcher saying that component is ready
     *
     * @memberof FSBLWindow
     */
    initializeWindow(params: any, cb: any): void;
    wrapReady(): void;
    setOpacity(params: any, callback: any): void;
    /**
     * Invoked to indicate an operation (e.g. dragging out of tab region) has started. This signals the Docking service to start tracking the mouse location and invoking tiling behavior as needed. Typically inherited (base function only).
     * @param {object} params for future use
     *
     * @example
     *	// dragging tab example using tracking and group
     * 	FinsembleWindow.startTabTileMonitoring();
     *	// if dragging tab is in a group, then remove it given tracking results will decide what to do with the window
     * 	FinsembleWindow.Group.getGroupID(this.identifier, function (err, tileGroupId) {
     * 		if (!err) { // if no error then must be in a tile group
     *			self.Group.removeWindow(this.identifier);
     *		}
     *	});
     */
    startTabTileMonitoring(params: any): void;
    /**
     * Invoked by client originating a dragStart that it has has ended. Typically inherited (base function only).
     * @param {object} params for future use
         * @param {function=} callback option callback that support overriding default behavior
     *
     * 	FinsembleWindow.stopTabTileMonitoring(params, function(err, results, defaultTabTileAction) {
     * 		// . . . custom code goes here . . .
     *		defaultTabTileAction(results); // now take default action or call your own function instead
     * 	});
     *
     */
    stopTabTileMonitoring(params: any, callback: any): void;
    /**
     * Defines default TabTile action for stopTabTileMonitoring.  May be overridden by client -- see example in stopTabTileMonitoring. Typically inherited (base function only).
     *
     * @param {any} stopTabTileResults
     * @memberof FinsembleWindow
     *
     * @private
     */
    defaultTabTileAction(stopTabTileResults: any): void;
    mergeBounds(bounds: any): void;
    startMove(params: any): void;
    stopMove(params: any): void;
    /**
     * Get Monitor for this window
     *
     * @param {function} cb Callback
     */
    getMonitor(cb: any): void;
    /**
     * Given params, will return the component state. Either the params to search for, or the entire state.
     *
     * @param {object} params
     * @param {string} params.field field
     *  @param {array} params.fields fields
     * @param {function} cb Callback
     */
    getComponentState(params: any, cb: any): void;
    /**
     * Given params, will return the window state. Either the params to search for, or the entire state.
     *
     * @param {object} params
     * @param {string} params.field field
     *  @param {array} params.fields fields
     * @param {function} cb Callback
     */
    getWindowState(params: any, cb: any): void;
    /**
     * Given params, will set the component state. Any fields included will be added to the state
     *
     * @param {object} params
     * @param {string} params.field field
     *  @param {array} params.fields fields
     * @param {function} cb Callback
     */
    setComponentState(params: any, cb: any): void;
    /**
     * Removes one or more specified attributes from either component or window state in storage
     * for this window.
     *
     * In addition to the name of the window, params should include either a `field`
     * property as a string or a `fields` property as an array of strings.
     *
     * @param {object} params
     * @param {string} [params.field] field
     * @param {array} [params.fields] fields
     * @param {function} cb Callback
     */
    removeComponentState(params: {
        field?: string;
        fields?: {
            field: string;
        }[];
        windowName?: string;
    }, cb?: StandardCallback): void;
    /**
     * Given params, will set the window state. Any fields included will be added to the state
     *
     * @param {object} params
     * @param {string} params.field field
     *  @param {array} params.fields fields
     * @param {function} cb Callback
     */
    setWindowState(params: any, cb: any): void;
    saveCompleteWindowState(params: any, cb: any): void;
    /**
     *Cancels startTabTileMonitoring. Example use is a user "escapes" out of a drag operation.
     *
     * @param {object} params for future use
     * @memberof FinsembleWindow
     */
    cancelTabTileMonitoring(params: any): void;
    /**
     * Return the parent window's wrapper (e.g. StackedWindow).
     *
     */
    getParent(cb: any): void;
    /**
     * Sets the parent window (e.g. stackedWindow) and emits "setParent" event to window listeners.
     *
     * @param {object} stackedWindowIdentifier identifer of window to set as parent (e.g. stackedWindowIdentifier).
     *
     */
    setParent(stackedWindowIdentifier: any, cb?: Function): void;
    /**
     * Sets the parent window (e.g. stackedWindow) on a window wrap.
     * This is for the case where a window already has a parent but it's wrap doesn't know about it.
     *
     * @param {object} stackedWindowIdentifier identifer of window to set as parent (e.g. stackedWindowIdentifier).
     *
     */
    setParentOnWrap(stackedWindowIdentifier: any, cb?: Function): void;
    /**
     * Clears the parent reference and emits "clearParent" event to window listeners. Used only internally.
     *
     * @private
     *
     */
    clearParent(): void;
    setTitle(title: any): void;
    getOptions(cb?: Function): void;
    listenForClose(cb: any): void;
    /**
     * Handles common housekeeping checks and modifications on params at the beginning of each private window-management function
     *
     * @param {string} methodName method name (e.g. "minimize", "maximize")
     * @param {object} params
     * @memberof StackedWindow
     * @private
     */
    _privateManagementPreface(methodName: any, params: any, callback?: Function): any;
    /**
     * Returns store for stacked window.  Example usage below.
     *
     * @memberof StackedWindow
     *
     * @example
     * 		// get the state for one stacked window from the store
     * 		getStore().getValue({ field: stackedWindowIdentifier.name, function (err, stackedWindowState) {}
     *			where stackedWindowState is an object with the following properties
     *				{
     *					stackedWindowIdentifier: the stacked window identifier
     *					childWindowIdentifiers: the window identifiers for all children in the stacked window
     *					visibleWindowIdentifier: the window identifier for the currently visible window
     *					bounds: the current window bounds/coordinates for the stacked window (i.e. the current bounds of the visible window)
     *				}
     */
    getStore(callback?: Function): any;
    /**
     * Adds window as a child to a stacked window.  Adds to the top of the stack, or if specified to a specific location in the stack;
     *
     * @param {object=} params
         * @param {object} params.stackedWindowIdentifier stacked window to operate on stacked window to operate on
         * @param {object} params.windowIdentifier window to add
         * @param {number=} params.position the location in the stack to push the window.  Location 0 is the bottom of the stack. Defaults to the top of stack.
         * @param {boolean=} params.noSave if true then don't save the store after updating it (will be saved by caller)
     * @param {function=} callback function(err)
     * @memberof StackedWindow
     */
    addWindow(params: any, callback?: Function): Promise<{}>;
    /**
     * Removes a child window from a stacked window.  If removed window was visible, then the bottom child window (position 0) in stack will be made visible.
     *
         * @param {object} params
    .	 * @param {object} params.stackedWindowIdentifier stacked window to operate on
     * @param {object} params.windowIdentifier window to remove
     * @param {boolean=} params.noDocking if true then do not register removed window with docking (the workspace is unaffected)
     * @param {function=} callback function(err)
     * @memberof StackedWindow
     */
    removeWindow(params: any, callback?: Function): Promise<{}>;
    /**
     * Removes a window from the stack then closes it.  If removed window was visible, then the bottom child window (position 0) in stack will be made visible.
     *
         * @param {object} params
    .	 * @param {object} params.stackedWindowIdentifier stacked window to operate on
     * @param {object} params.windowIdentifier window to delete
     * @param {function=} callback function(err)
     * @memberof StackedWindow
     */
    deleteWindow(params: any, callback?: Function): Promise<{}>;
    /**
     * Sets the visible window within the stack.  The previously visible window in stack will be automatically hidden.
     *
         * @param {object} params
    .	 * @param {object} params.stackedWindowIdentifier stacked window to operate on
     * @param {object} params.windowIdentifier
     * @param {function=} callback function(err)
     * @memberof StackedWindow
     */
    setVisibleWindow(params: any, callback?: Function): Promise<{}>;
    /**
     * Reorders the stack, but odes not affect visibility
     *
         * @param {object} params
    .	 * @param {object} params.stackedWindowIdentifier stacked window to operate on
     * @param {array} params.windowIdentifiers array of windowIdentifiers which provides the new order
     * @param {function=} callback function(err)
     * @memberof StackedWindow
     */
    reorder(params: any, callback?: Function): Promise<{}>;
}
