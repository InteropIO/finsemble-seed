import { EventEmitter } from "events";
import { WindowEventManager } from "../../../common/window/WindowEventManager";
declare global {
    interface Window {
        _FSBLCache: any;
    }
}
import { WindowIdentifier, StandardCallback, WrapState } from "../../../globals";
export declare type componentMutateParams = {
    /** Field to save. */
    field?: string;
    /** Fields to save. */
    fields?: {
        field: string;
    }[];
    /** Key to store the data under. */
    key?: string;
    /** Whether the data is componentState or windowState. */
    stateVar?: "componentState" | "windowState";
    /** Topic that the data is stored under. */
    topic?: string;
    /** Value to save. */
    value?: any;
};
export declare class BaseWindow extends EventEmitter {
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
    removeListeners?: Function;
    parentSubscribeID: any;
    eventManager: WindowEventManager;
    eventlistenerHandlerMap: object;
    guid: "string";
    dockedPosition: number;
    enableWindowsAeroSnap: boolean;
    finishedMove: boolean;
    isMaximizing: boolean;
    constructor(params: any);
    static WINDOWSTATE: {
        NORMAL: number;
        MINIMIZED: number;
        MAXIMIZED: number;
        HIDDEN: number;
    };
    windowServiceChannelName(channelTopic: any): string;
    eventChannelName(channelTopic: any): string;
    listenForBoundsSet(): void;
    listenForBoundsChanging(): void;
    getWindowStore(cb: any): any;
    _startMove(): void;
    _stopMove(markDirty?: boolean): void;
    doConstruction(params: any): any;
    static registerType(name: any, type: any): void;
    /**
     * This is used to bind all functions only in BaseWindow and not in the child wrappers to the wrappers. Without this binding, the value of "this" in the functions is wrong.
     * @param {} obj
     */
    static bindFunctions(obj: any): void;
    setupListeners(name: any): void;
    onTitleChanged(err: any, response: any): void;
    /**
     * Async wrap. Given a name/windowName, it will query the launcher for information required to wrap the window. Then it will return an object that can be operated on. Also this creates a cache of all wrapped windows for performance. Our clients wrap the same window often and this was causing excessive messaging to the store and degrading performance.
     * @param {*} params Need only name in most cases. For service and other cases where the window is not part of what the launcher considers active windows, name and uuid are required
     * @param {*} cb
     */
    static wrap: typeof BaseWindow.getInstance;
    static getInstance(params: any, cb?: Function): any;
    static _createWrap(params: any): any;
    static _windowReady: (windowName: any) => Promise<{}>;
    static _getRemoveWrapChannel(name: any): string;
    handleWrapRemoveRequest(): void;
    cleanupRouter(): void;
    handleWrapStateChange: (err: any, response: any) => void;
    onReady(callback: any): any;
    handleBoundsSet(err: any, response: any): void;
    handleBoundsChanging(err: any, response: any): void;
    handleWindowHidden(err: any, response: any): void;
    handleWindowShown(err: any, response: any): void;
    handleWindowBTF(err: any, response: any): void;
    handleWindowMax(err: any, response: any): void;
    handleWindowMin(err: any, response: any): void;
    handleWindowRestore(err: any, response: any): void;
    handleWindowStartMove(err: any, response: any): void;
    handleWindowStopMove(err: any, response: any): void;
    handleWindowDisabledFrameBoundsChanged(err: any, response: any): void;
    handleWindowStateChange(err: any, response: any): void;
    /**
     * @param {string} methodName method name (e.g. "minimize", "maximize")
     * @param {object} params
     * @param {function=} callback
     * @memberof FinsembleWindow
     * @private
     */
    queryWindowService(methodName: any, params: any, callback?: Function): void;
    _eventHandled(interceptor: any, guid: any, canceled?: boolean): void;
    addEventListener(eventName: any, handler: any): void;
    removeEventListener(eventName: any, handler: any): void;
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
    _minimize(params: any, cb?: Function): void;
    _maximize(params: any, cb?: Function): void;
    _restore(params: any, cb?: Function): void;
    _blur(params: any, cb?: Function): void;
    _focus(params: any, cb?: Function): void;
    _bringToFront(params: any, cb?: Function): void;
    _isShowing(params: any, cb?: Function): void;
    _setBounds(params: any, cb?: Function): void;
    _getBounds(params: any, cb: any): void;
    _getBoundsFromSystem(params: any, cb: any): void;
    _updateOptions(params: any, cb?: Function): void;
    _hide(params: any, cb?: Function): void;
    _show(params: any, cb?: Function): void;
    /**
     * Close
     * @param params
     * @param params.fromSystem Bool. If true, event bubbled up because of an alt+f4, task manager, etc. Something closed the window that wasn't Finsemble.
     * @param cb
     */
    _close(params: any, cb?: Function): void;
    _alwaysOnTop(params: any, cb?: Function): void;
    _setOpacity(params: any, cb?: Function): void;
    _saveWindowOptions(params: any, cb?: Function): void;
    _getOptions(params?: any, cb?: Function): any;
    /**
     * Invoked to indicate an operation (e.g. dragging out of tab region) has started. This signals the Docking service to start tracking the mouse location and invoking tiling behavior as needed. Typically inherited (base function only).
     * @param {object} params for future use
     *
     * @example
     *	// dragging tab example using tracking and group
     * 	BaseWindow.startTabTileMonitoring();
     *	// if dragging tab is in a group, then remove it given tracking results will decide what to do with the window
     * 	BaseWindow.Group.getGroupID(this.identifier, function (err, tileGroupId) {
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
     * 	BaseWindow.stopTabTileMonitoring(params, function(err, results, defaultTabTileAction) {
     * 		// . . . custom code goes here . . .
     *		defaultTabTileAction(results); // now take default action or call your own function instead
     * 	});
     *
     */
    stopTabTileMonitoring(params: any, callback: any): void;
    /**
     * Defines default TabTile action for stopTabTileMonitoring.  May be overwritten by client -- see example in stopTabTileMonitoring. Typically inherited (base function only).
     *
     * @param {any} stopTabTileResults
     * @memberof BaseWindow
     *
     * @private
     */
    defaultTabTileAction(stopTabTileResults: any): void;
    mergeBounds(bounds: any): void;
    startMove(params: any): void;
    stopMove(params: any): void;
    /**
     * Given a field, this function retrieves component or window state. If no params are given you get the full state
     * @param {object} params
     * @param {string} params.stateVar A string containing "componentState" or "windowState"
     * @param {string} params.field field
     * @param {array} params.fields fields
     * @param {string} params.key The storage key for the window.
     * @param {function} cb Callback
     * @private
     **/
    getFSBLState(params: {
        stateVar: "componentState" | "windowState";
        field?: string;
        fields?: string[];
        key: string;
    }, cb: StandardCallback): Promise<void>;
    /**
     * Given params, will return the component state. Either the params to search for, or the entire state.
     *
     * @param {object} params
     * @param {string} params.field field
     * @param {array} params.fields fields
     * @param {function} cb Callback
     */
    getComponentState(params: any, cb: any): Promise<void>;
    /**
     * Given params, will return the window state. Either the params to search for, or the entire state.
     *
     * @param {object} params
     * @param {string} params.field field
     *  @param {array} params.fields fields
     * @param {function} cb Callback
     */
    getWindowState(params: any, cb: any): Promise<void>;
    /**
     * Given params, will set the component state. Any fields included will be added to the state
     *
     * @param {object} params
     * @param {string} params.field field
     *  @param {array} params.fields fields
     * @param {function} cb Callback
     */
    setComponentState(params: any, cb?: Function): void;
    /**
     * Removes one or more specified attributes from a component state in storage
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
    removeComponentState(params?: componentMutateParams, cb?: StandardCallback): void;
    /**
     * Given params, will set the window state. Any fields included will be added to the state
     *
     * @param {object} params
     * @param {string} params.field field
     *  @param {array} params.fields fields
     * @param {function} cb Callback
     */
    setWindowState(params: any, cb: any): void;
    saveWindowState(state: any): void;
    saveCompleteWindowState(state: any, cb?: any): any;
    deleteCompleteWindowState(cb: any): void;
    /**
     * Given a field, this function sets and persists app state.
     * @param {object} params
     * @param {string} [params.field] field
     * @param {array} [params.fields] fields
     * @param {function=} cb Callback
     **/
    setFSBLState(params: any, cb: any): void;
    /**
     * Removes one or more specified attributes from either component or window state in storage.
     *
     * In addition to the name of the window, params should include either a `field`
     * property as a string or a `fields` property as an array of strings.
     *
     * @param {object} params
     * @param {string} [params.field] field
     * @param {array} [params.fields] fields
     * @param {function=} cb Callback
     **/
    removeFSBLState(params: componentMutateParams, cb?: StandardCallback): void;
    /**
     *Cancels startTabTileMonitoring. Example use is a user "excapes" out of a drag operation.
     *
     * @param {object} params for future use
     * @memberof BaseWindow
     */
    cancelTabTileMonitoring(params: any): void;
    /**
     * Return the parent window's wrapper (e.g. StackedWindow).
     *
     */
    getParent(): any;
    /**
     * Sets the parent window (e.g. stackedWindow) and emits "setParent" event to window listeners.
     *
     * @param {object} stackedWindowIdentifier identifer of window to set as parent (e.g. stackedWindowIdentifier).
     *
     */
    setParent(windowIdentifier: any, cb?: Function): void;
    /**
     * Clears the parent reference and emits "clearParent" event to window listeners. Used only internally.
     *
     * @private
     *
     */
    clearParent(): void;
    setTitle(title: any): void;
    close(params: {}, callback: any): void;
    _animate(params: any, cb: any): void;
}
