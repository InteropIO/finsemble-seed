/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import { StackedWindowManagement } from "./Interface.StackedWindowManager";
declare class StackedWindowManager implements StackedWindowManagement {
    params: any;
    childWindow: any;
    storeCache: any;
    stackedWindowListeners: any;
    stackedWindowWrappers: any;
    eventHandlerFunction: any;
    childNameToSID: any;
    childEventsToHandle: any;
    globalStore: any;
    addReadyTimeout: any;
    constructor(params: any);
    initialize(finsembleConfig: any, callback?: Function): void;
    bindAllFunctions(): void;
    listenForWorkspaceChanges(): void;
    /**
     * Saves in the global store the data from the storeCache for the specified stacked window
     *
     * @param {any} stackedWindowIdentifier
     * @param {any} closing
     * @memberof StackedWindowManager
     * @private
     */
    saveStore(stackedWindowIdentifier: any, params?: any, cb?: Function): Promise<{}>;
    /**
     * Return true if the specified window in specified stack is showing
     *
     * @param {any} params
     * @returns
     * @memberof StackedWindowManager
     * @private
     */
    isShowing(params: any): boolean;
    /**
     * Return true if the specified window name is in the specified stack
     *
     * @param {any} params
     * @returns
     * @memberof StackedWindowManager
     * @private
     */
    ifWindowInStack(params: any): boolean;
    /**
     * Return true if the params indication the wrap operation was invoked directly on the window, as opposed to directly on the childWindow
     *
     * @param {any} params
     * @returns
     * @memberof StackedWindowManager
     * @private
     */
    operatingDirectlyOnStackedWindow(params: any): any;
    eventChannelName(stackedWindowName: any, channelTopic: any): string;
    setupInterfaceListener(methodName: any, methodFunction: any): void;
    setupStackedWindowServiceListeners(): void;
    visibleChildEventHandler(stackedWindowName: any, stackWrap: any, eventObject: any): Promise<void>;
    addChildEventListener(stackedWindowName: any, childName: any, childWrapper: any): void;
    removeChildEventListener(stackedWindowName: any, childName: any, childWrapper: any): void;
    groupWindowsContainedInStacked(groupWindows: any, childWindows: any): boolean;
    joinGroups(groups: any, stackedWindowIdentifier: any): void;
    getGroups(windowIdentifier: any): Promise<{}>;
    /**
     * Creates a new StackedWindow, returning its stackWindowIdentifier in the callback. Optionally initializes stack with a set of child windows.
     *
     * Invoked by Launcher Service when spawning a stacked window (e.g. LauncherClient.spawn()). TODO: this all changed. Update
     *
     * @param {object} params Parameters
     * @param {array=} params.windowIdentifiers array of windowIdentifiers to add to stack on creation.
     * @param {boolean=} params.new if true then stacked window being defined for first time with no persistent state
     * @param {function=} callback function(err, stackedWindowIdentifier)
     * @memberof StackedWindowManager
     * @private
     */
    createStackedWindow(params: any, callback: any): Promise<void>;
    /**
     * Adds window as a child to a stacked window.  Adds to the top of the stack, or if specified to a specific location in the stack;
     *
     * @param {object=} params Parameters
     * @param {object} params.stackedWindowIdentifier stacked window to operate on stacked window to operate on
     * @param {object} params.windowIdentifier window to add
     * @param {number=} params.position the location in the stack to push the window.  Location 0 is the bottom of the stack. Defaults to the top of stack.
     * @param {boolean=} params.noSave if true then don't save the store after updating it (will be saved by caller)
     * @param {boolean=} params.ignorePreviousState if true then ignore the previous state of the window being added (with in another stack and registered with docking handled elsewhere)
     * @param {boolean=} params.noVisibility if true don't automatically set visibility when first window added to the stack (needed for ordered startup)
     * @param {function=} callback function(err)
     * @memberof StackedWindowManager
     * @private
     */
    addWindow(params: any, callback?: Function): any;
    triggerEvent(params: any, cb: any): void;
    /**
     * Closes and deletes a stacked window. If specified (see params) then children will be closed; otherwise children will be signals they are removed from the stacked window.
     *
     * @param {object} params Parameters
     * @param {object} params.stackedWindowIdentifier stacked window to operate on
     * @param {object=} params.closeChildren if true then also close all children
     * @param {object=} params.removeFromWorkspace if then remove stacked window and child windows from the workspace
     * @param {boolean=} params.waitChildClose if true then wait for child wrapper to close before returned (needed for cleanly switching workspaces)
     * @param {boolean=} params.noDocking if true then do not register removed window with docking (the workspace is unaffected)
     * @param {any} callback
     * @memberof StackedWindowManager
     */
    closeStackedWindow(params: any, callback?: Function): Promise<{}>;
    /**
     * Removes a child window from a stacked window.  If removed window was visible, then the bottom child window (position 0) in stack will be made visible.
     *
     * @param {object} params Parameters
     * @param {object} params.stackedWindowIdentifier stacked window to operate on
     * @param {object} params.windowIdentifier window to remove
     * @param {boolean=} params.noDocking if true then do not register removed window with docking (the workspace is unaffected)
     * @param {boolean=} params.noVisible if true then do not make window visible when removing it
     * @param {boolean=} params.waitChildClose if true then wait for child wrapper to close before returned (needed for cleanly switching workspaces)
     * @param {boolean=false} params.closeWindow
     * @param {boolean=false} params.noCloseStack  if true don't close the stack window when only one child
     * @param {function=} callback function(err)
     * @memberof StackedWindowManager
     * @returns promise
     * @private
     */
    removeWindow(params: any, callback?: Function): Promise<{}>;
    /**
     * Removes a window from the stack then closes it.  If removed window was visible, then the bottom child window (position 0) in stack will be made visible.
     *
     * @param {object} params Parameters
    .* @param {object} params.stackedWindowIdentifier stacked window to operate on
     * @param {object} params.windowIdentifier window to delete
     * @param {function=} callback function(err)
     * @memberof StackedWindowManager
     * @private
     */
    deleteWindow(params: any, callback?: Function): Promise<{}>;
    /**
     * Sets the visible window within the stack.  The previously visible window in stack will be automatically hidden.
     *
     * @param {object} params Parameters
     * @param {object} params.stackedWindowIdentifier stacked window to operate on
     * @param {object} params.windowIdentifier
     * @param {object} params.force if force is true then reset visible even if it is already marked as visible in store (this is for startup)
     * @todo the force param needs to handle the code below around previouslyVisibleWindow. In that case, the previouslyVisible window may exist, but the listeners may not have been added yet.
     * @param {function=} callback function(err)
     * @memberof StackedWindowManager
     * @private
     */
    setVisibleWindow(params: any, callback?: Function): void;
    hideInactiveChildren(thisStackRecord: any): void;
    /**
     * Reorders the stack, but odes not affect visibility
     *
     * @param {object} params Parameters
     * @param {object} params.stackedWindowIdentifier stacked window to operate on
     * @param {array} params.windowIdentifiers array of windowIdentifiers which provides the new order
     * @param {function=} callback function(err)
     * @memberof StackedWindowManager
     * @private
     */
    reorder(params: any, callback?: Function): void;
    minimize(params: any, callback?: Function): any;
    maximize(params: any, callback?: Function): any;
    restore(params: any, callback?: Function): void;
    focus(params: any, callback?: Function): any;
    bringToFront(params: any, callback?: Function): any;
    saveWindowStateToStore(params: any, callback?: Function): void;
    mergeBounds(stackRecord: any, bounds: any): void;
    setBounds(params: any, callback?: Function): void;
    getBoundsFromSystem(params: any, callback?: Function): any;
    getBounds(params: any, callback?: Function): any;
    updateOptions(params: any, callback?: Function): void;
    hide(params: any, callback?: Function): any;
    show(params: any, callback?: Function): any;
    close(params: any, callback?: Function): void;
    alwaysOnTop(params: any, callback: any): any;
    setOpacity(params: any, callback?: Function): void;
    saveWindowOptions(params: any, stackedWindow: any, maincallback?: Function): any;
    /**
     * Register a window with docking. It transmits a message to the LauncherService, which registers it as a dockable window.
     *
     * @param {object} params Parameters
     * @param {string} params.windowIdentifier the window to register (may be stacked window or child window)
     * @private
     */
    registerWithDockingManager(params: any, cb?: Function): Promise<{}>;
    /**
     * Unregister a window with docking.
     *
     * @param {object} params Parameters
     * @param {boolean} params.removeFromWorkspace true to remove from workspace
     * @param {string} params.windowIdentifier window to unregister
     * @private
     */
    deregisterWithDockingManager(params: any): void;
    startMove(params: any, callback?: Function): void;
    stopMove(params: any, callback?: Function): void;
}
declare var serviceInstance: StackedWindowManager;
export default serviceInstance;
