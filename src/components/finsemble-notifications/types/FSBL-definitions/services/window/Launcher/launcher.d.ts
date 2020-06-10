import { CreateSplinterAndInject } from "./createSplinterAndInject";
import { FinsembleWindow } from "../../../common/window/FinsembleWindow";
import { WindowDescriptor } from "../Common/types";
import "./_test";
import { BaseWindow } from "../WindowAbstractions/BaseWindow";
import { IRouterClient } from "../../../clients/IRouterClient";
import { WindowIdentifier, StandardCallback } from "../../../globals";
/**
 * The internal representation of a Finsemble-controlled window.
 *
 * Daniel H. - 1/16/2019
 * I've done the bare minimum required to provide tight type safety
 * for this file. We really need to figure out which of these interfaces
 * is appropriate and pick that one, rather than this disjointed union.
 *
 * @TODO - Lift into separate interface file and refactor correctly.
 */
declare type FSBLWindow = BaseWindow & FinsembleWindow & {
    windowDescriptor: WindowDescriptor;
    /**
     * The name of the component in this window. E.g "Welcome Component", "StackedWindow", etc.
     *
     * Daniel H. - 1/16/2019
     * This appears to duplicated on the windowDescriptor itself.
     * @TODO - Pick one and stick with it.
    */
    componentType: string;
    lastHeartbeat: number;
    errorSent: boolean;
    warningSent: boolean;
    notRespondingSent: boolean;
    uuid: string;
};
/** All the possible window types, including their aliases used in config. */
declare type WindowTypes = "OpenFinWindow" | "openfin" | "NativeWindow" | "assimilation" | "assimilated" | "native" | "FinsembleNativeWindow" | "application" | "OpenFinApplication" | "StackedWindow";
/** The parameters passed to Launcher.Spawn.
 *
 * For properties duplicated between the top-level
 * and `options`, `options` takes precedence.
 */
export declare type SpawnParams = {
    /**
 * Defaults to false. Whether to add the new component to the workspace.
 * Even when true, the window will still not be added to the workspace if addToWorkspace==false in components.json config for the component type.
 */
    addToWorkspace?: boolean;
    /**
     * Used when windowType is "native" or "assimilation". Specifies the alias of a bundled asset.
     */
    alias?: string;
    /**
     * Set a process affinity flag. This allows windows to grouped together under a single process (a.k.a. Application). This flag is only available when your container is Electron.
     */
    affinity?: string;
    /**
     * Used when windowType is "native" or "assimilation". Specifies the arguments to be sent to the application. This is used in conjunction with path.
     * Arguments should be separated by spaces: `--arg1 foo --arg2 bar` except when `params.argumentsAsQueryString` is true, in which case set this parameter to be single string in URI format: `arg=1&arg=2`"
     */
    arguments?: any;
    /**
     * For native applications launched by URI: 1) the string is passed as the "arguments" parameter if appended as a query string; and 2) the automatically generated arguments described in "path" are appended to the query string
     */
    argumentsAsQueryString?: boolean;
    /**
     * Whether the component can group with other windows.
     */
    canGroup?: boolean;
    /**
     *  For use with permanent toolbars.
     * The available space for other components will be reduced by the amount of space covered by the newly spawned component.
     * This will be reflected in the `unclaimedRect` member from API calls that return monitorInfo. Users will be prevented
     * from moving windows to a position that covers the claimed space. See `position: 'unclaimed'`.
     */
    claimMonitorSpace?: boolean;
    /**
     * Type of component to spawn.
     */
    component?: any;
    /**
     * If true, will automatically dock the window with the "relative" window (dock to the parent window unless specified in params.relativeWindow).
     * Note that you must also position the window in a valid position for docking, for example, by setting the "left" or "top" parameters to "adjacent".
     */
    dockOnSpawn?: boolean;
    /**
     * An array of parts of the monitor that the component can dock to. Valid values are `top` and `bottom`.
     */
    dockable?: ["top", "bottom"] | ["bottom", "top"] | ["top"] | ["bottom"];
    /**
     * Which part of the monitor that the component will dock to on spawn. Valid options are `top` and `bottom`. Only valid if combined with the `dockable` property.
     */
    docked?: "top" | "bottom";
    /**
     * Currently, components can only dock to the full width of the monitor. This parameter determines what height the component will be when docked to a monitor.
     */
    dockedHeight?: number;
    /**
     * Indicates that this window is ephemeral.
     * An ephemeral window is a dialog, menu, or other window that is temporarily displayed but usually hidden.
     * Ephemeral windows automatically have the following settings assigned: resizable: false, showTaskbarIcon: false, alwaysOnTop: true.
     * <b>Note</b>: Use `options:{autoShow: false}` to prevent an ephemeral widow from showing automatically.
     *
     */
    ephemeral?: boolean;
    /**
     * If true, will attempt to make the window have no edges outside the monitor boundary.
     */
    forceOntoMonitor?: boolean;
    /**
     * Optional group name. Adds windows to a group (unrelated to docking or linking) that is used for window management functions. If the group does not exist it will be created.
     */
    groupName?: string;
    groupOnSpawn?: boolean;
    /**
     * Which monitor to place the new window.
     *
     * <b>"mine"</b> - Place the window on the same monitor as the calling window.
     *
     * Integer value from 0-n (0 being the primary monitor).
     *
     * <b>"primary"</b> indicates the user's primary monitor.
     *
     * <b>"all"</b> - Put a copy of the component on all monitors.
     *
     */
    monitor?: number | "mine" | "primary" | "next" | "previous" | "all";
    /**
     * Name to give the component. If not provided, a random one will be generated. Name will be made unique (if not already).
     */
    name?: string;
    /**
     * @deprecated Please use windowType instead. Optional native application to launch with Assimilation service. Overrides what is passed in "component".
     */
    native?: boolean;
    /**
     * Properties to merge with the default windowDescriptor.
     * Any value set here will be sent directly to the `OpenFin` window, and will override the effect of relevant parameters to spawn(). By default, all Finsemble windows are frameless.
     */
    options?: any;
    /**
     * Used when windowType is "native" or "assimilation". Specifies the path to the application. The path can be:
     * The name of an exe that is on the system path (e.g., <i>notepad.exe</i>).
     * The full path to an executable on the user's machine (e.g., <i>C:\Program Files\app.exe</i>).
     * A system installed URI (e.g., <i>myuri://myapp</i>).
     *
     * When windowType is "native" then additional arguments will be automatically appended to the path or the URI. These arguments can be captured by the native application
     * in order to tie it to Finsemble's window tracking. When building an application with finsemble.dll, this is handled automatically. Those arguments are:
     *
     * **uuid** - A generated UUID that uniquely identifies this window.
     *
     * **left** - The x coordinate of the new window
     *
     * **top** - The y coordinate of the new window
     *
     * **width** - The width of the new window
     *
     * **height** - The height of the new window
     *
     * **openfinVersion** - The OpenFin version that Finsemble runs (necessary for native windows to connection on the OpenFin IAB)
     *
     * **openfinSocketPort** - The OpenFin socket used for the Inter-application Bus (IAB) (necessary for Java windows that wish to use the OpenFin IAB)
     *
     * **finsembleWindowName** - The name of the window in the Finsemble config
     *
     * **componentType** - The component type in the Finsemble config
     *
     * A common troublesome problem is when a native application needs to be launched from an intermediary application (such as a launcher or batch script). That intermediary
     * application can pass these parameters which will allow the final application to connect back to Finsemble.
     */
    path?: string;
    /**
     * Defines a "viewport" for the spawn, with one of the following values:
     *
     * <b>"unclaimed"</b> (the default) Positioned based on the monitor space excluding space "claimed" by other components (such as toolbars).
     * For instance, `top:0` will place the new component directly below the toolbar.
     *
     * **"available"** Positioned according to the coordinates available on the monitor itself, less space claimed by the operating system (such as the windows toolbar).
     * For instance, `bottom:0` will place the new component with its bottom flush against the windows toolbar.
     *
     * **"monitor"** Positioned according to the absolute size of the monitor.
     * For instance, `top:0` will place the component overlapping the toolbar.
     *
     * **"relative"** Positioned relative to the relativeWindow.
     * For instance, `left:0;top:0` will join the top left corner of the new component with the top left corner of the relative window.
     *
     * **"virtual"** Positioned against coordinates on the virtual screen.
     * The virtual screen is the full viewing area of all monitors combined into a single theoretical monitor.
     */
    position?: string;
    /**
     * Sets environment variables for a spawned native application. Create a map (JSON) object of names to values. This is only available when running assimilation and with the config assimilation.useOpenFinSpawn=false.
     */
    env?: any;
    /**
     * The window to use when calculating any relative launches.
     * If not set then the window from which spawn() was called.
     */
    relativeWindow?: WindowIdentifier;
    /**
     * Optional url to launch. Overrides what is passed in "component".
     */
    url?: string;
    /**
     * Optional. Describes which type of component to spawn.
     *
     * <b>openfin</b> - A normal HTML window.
     *
     * **assimilation** - A window that is managed by the Finsemble assimilation process (usually a native window without source code access). Requires "path" to be specified, which may be the name of an executable on the system path, a system file path or system installed URI.
     *
     * **native** - A native window that has implemented finsemble.dll. Requires "path" to be specified.
     *
     * **application** - A standalone application. This launch a component in its own browser process (splintered, giving it dedicated CPU and memory).
     * This can also point to a standalone web application (such as from a third party).
     */
    windowType?: WindowTypes;
    /**
     * Built and passed internally. This is not a public api parameter, and cannot be
     * supplied by a user
     * @private
     */
    windowIdentifier?: WindowIdentifier;
    /**
     * If true then the new window will act as a slave to the relativeWindow (or the launching window if relativeWindow is not specified).
     * Slave windows will automatically close when their parent windows close.
     */
    slave?: boolean;
    /***
     * @private
     */
    spawnedByWorkspaceService?: boolean;
    /**
     * Number of pixels to stagger (default when neither left, right, top or bottom are set).
     */
    staggerPixels?: number;
    /**
     * Where the spawn request is coming from.
     * @private
     */
    launchingWindow?: any;
    /**
     * Optional data to pass to the opening window.
     * If set, then the spawned window can use <a href="WindowClient.html#getSpawnData">WindowClient#getSpawnData</a> to retrieve the data.
     */
    data?: any;
    /**
     * A pixel value representing the distance from the left edge of the viewport as defined by "position".
     * A percentage value may also be used, representing the percentage distance from the left edge of the viewport relative to the viewport's width.
     *
     * <b>"adjacent"</b> will snap to the right edge of the spawning or relative window.
     *
     * <b>"center"</b> will center the window
     *
     * If neither left nor right are provided, then the default will be to stagger the window based on the last spawned window.
     *
     */
    left?: number | string;
    /**
     * A pixel value representing the distance from the right edge of the viewport as defined by "position".
     * A percentage value may also be used, representing the percentage distance from the right edge of the viewport relative to the viewport's width.
     *
  */
    right?: number | string;
    /**
     * A pixel value representing the distance from the right edge of the viewport as defined by "position".
     * A percentage value may also be used, representing the percentage distance from the bottom edge of the viewport relative to the viewport's width.
     *
     */
    top?: number | string;
    /**
     * A pixel value representing the distance from the top edge of the viewport as defined by "position".
     * A percentage value may also be used, representing the percentage distance from the top edge of the viewport relative to the viewport's height.
     *
     */
    bottom?: number | string;
    /**
     *  A pixel or percentage value.
     */
    width?: number | string;
    /**
     *  A pixel or percentage value.
     */
    height?: number | string;
    /**
     * Minimum width window can be resized to.
     */
    minWidth?: number;
    /**
     * Minimum height window can be resized to.
     */
    minHeight?: number;
    /**
     * Maximum height window can be resized to.
     */
    maxHeight?: number;
    /**
     * Maximum width window can be resized to.
     */
    maxWidth?: number;
};
/**
 * The Launcher Service receives calls from the launcherClient, and spawns windows.
 * @TODO, finish spawn (makeRoom, findEmptySpace, position=virtual, add abstraction for 0,0 by monitor, available, claimed)
 * @TODO, clean out old monitor routines from utils
 * @TODO, retrofit all code that appends customData to use "data/spawnData" instead
 * @constructor
 */
export declare class Launcher {
    /** @alias Launcher# */
    createSplinterAndInject: CreateSplinterAndInject;
    windowGroups: object;
    cssOverride: string;
    lastOpenedMap: object;
    lastAdjustedMap: object;
    persistURL: boolean;
    persistPath: boolean;
    shuttingDown: boolean;
    monitors: any;
    shutdownList: any;
    RouterClient: IRouterClient;
    groupStore: object;
    windowStore: object;
    finsembleConfig: any;
    appConfig: any;
    pendingWindows: object;
    rawManifest: object;
    constructor(manifest: any, stackedWindowManager: any);
    /**
     * Main function that starts everything up.
     * @param {*} callback
     */
    initialize(callback: any): Promise<void>;
    /**
     * This method handles the shutdownList sequence for the Launcher.
     */
    shutdown(allDone: any): Promise<{}>;
    getComponents(): {};
    addWindowsToGroups(params: any): any;
    getWindowsInGroup(groupName: any): any;
    removeWindowsFromGroup(params: any): any;
    addWindowToGroups(data: any): void;
    /**
     * "StackedWindow" is a special built-in component that the launcher uses internally. We need
     * to make sure that the StackedWindow is *always* in the component list.
     * @private
     * @param {Function} cb
     */
    addPredefinedComponents(): void;
    addUnclaimedRectToMonitor(monitor: any): void;
    /**
     * This allows us to add a component that isn't in our list. We use the default manifest config so that our configs are the same across the board.
     * We also allow these components to be included in workspaces.
     * @param {*} message
     * @param {*} cb
     */
    addUserDefinedComponent(message: any, cb?: Function): void;
    /**
     * Brings a list, group, componentType or all windows to front
     * @param {*} response.data.windowList list of window names or window identifiers.
     * @param {*} response.data.groupName group name
     * @param {*} response.data.componentType component type.
     */
    bringWindowsToFront(err: any, response: any, cb?: Function): void;
    calculateBounds(foundMonitor: any, windowDescriptor: WindowDescriptor, launcherParams: any): Promise<WindowDescriptor>;
    /**
     * Takes the window descriptor's bounds and makes sure it's on a monitor. If the window isn't on a monitor, we determine the closest monitor
     * based on the distance from the top-left corner of the window to the center of the monitor, and then pull the monitor along that line
     * until the window is on the edge of the monitor
     * @param {*} windowDescriptor Window descriptor, e.g. from a saved workspace
     * @param {*} previousWindowBounds not used, unfortunately
     * @returns windowDescriptor updated window descriptor
     */
    adjustWindowDescriptorBoundsToBeOnMonitor(windowDescriptor: WindowDescriptor): WindowDescriptor;
    clearSequentialNames(): void;
    /**
     * @private
     */
    compileWindowDescriptor(config: any, params: any, baseDescriptor: WindowDescriptor, resultFromDeriveBounds: any): WindowDescriptor;
    /**
     * Locates a window based on a componentType
     * @param {object} windowIdentifier The parameters
     * @param  {string}   windowIdentifier.componentType	 The type of component
     * @return {finWindow} Returns a finWindow for the component, or null if not found
     */
    componentFinder(windowIdentifier: any): FSBLWindow;
    /**
     * Create Window Group
     */
    createWindowGroup(err: any, message: any): any;
    deleteWindowGroup(err: any, message: any): any;
    /**
     * Sets the dimensions and placement of the window by translating the launcherParams
     * to the requires settings for an OpenFin windowDescriptor.
     *
     * @params	object	launcherParams Params from spawn()
     * @returns {Promise} A promise that resolves to a new windowDescriptor that describes the new window.
     * with defaultLeft, defaultTop, defaultWidth, defaultHeight, and claimMonitorSpace set.
     */
    deriveBounds(launcherParams: SpawnParams): Promise<WindowDescriptor>;
    /**
     * The basic algorithm for handling monitor adjustments is:
     * 1) Remove any orphaned components. These would be any spawnOnAllMonitor components that are now located
     * on a different monitor than they started. We simply compare their existing monitor with the one they were
     * spawned upon, and remove them if they aren't where they belong.
     *
     * 2) Add any motherless components. These would be any spawnOnAllMonitor components that are missing from a
     * particular monitor, presumably because the monitor just got added.
     *
     * 3) Adjust component dimensions. Since the monitor size may have changed we need to adjust any components
     * that had previously made assumptions about monitor size (such as a toolbar that is supposed to stretch across
     * the top of the screen). We cycle through any components that have made a "claim" on monitor space and then
     * simply call showWindow() with their original params in order to give them a chance to resettle.
     */
    doMonitorAdjustments(changeData: any): void;
    /**
     * Convenient way to execute stuff on a group or all windows
     */
    executeWindowGroupFunctionByListGroupOrType(response: any, cb?: Function): void;
    /**
     * Returns a list of window descriptors that includes each window that the launcher has spawned.
     */
    getActiveDescriptors(): {
        [k: string]: WindowDescriptor;
    };
    /**
         * Gets offsets to monitor dimensions based on any space permanently
         * claimed by other components such as toolbars.
         * @param  {object} myMonitor The monitor
         * @return {object}         An object containing offsets for top, bottom, left & right
         */
    getClaimsOffset(myMonitor: any): {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    /**
     * Returns an map of components that can receive specific data types based on "advertiseReceivers" in the component config
     *
     * @param {array} dataTypes A list of dataTypes (string)
     */
    getComponentsThatCanReceiveDataTypes(dataTypes: any): {};
    getGlobalURLPersistence(): any;
    getDefaultConfig(componentType: any): any;
    getComponentConfig(cb?: Function): Promise<{}>;
    onComponentListChanged(err: any, componentConfig: any): void;
    /**
     * Gets the list of components, listens for changes on the components.
     * @param {*} cb
     */
    getConfig(cb?: Function): Promise<void>;
    /**
     *
     * @param {*} params
     * @param {string} params.windowIdentifier
     *
     */
    getGroupsForWindow(params: any): any[];
    /**
     * Gets the proper monitor for a config.
     * @param {string|number} params.monitor Monitor description, eg, "0" or "primary" or "mine".
     * @param {*} cb
     */
    getMonitorInfo(params: any, cb: any): Promise<void>;
    /**
     * Gets all monitors.
     * @param {*} cb
     */
    getMonitorInfoAll(cb?: Function): void;
    /**
     * Gets the manifest that's stashed on the window's customData.
     * @param {*} cb
     */
    getRawManifest(cb?: Function): void;
    getSequentialName(name: any): string;
    /**
     * convert a list of window names or identifiers to a list of window objects
     */
    getWindowsFromNamesOrIdentifiers(windowList: any, outputAsObject?: boolean): any;
    /**
     * When each component finishes shutting down, it reports back to the Launcher via this channel.
     */
    handleShutdownCompleted(err: any, response: any): void;
    /**
     * After being notified that it needs to shutdown, the component will respond to the launcher. This message will tell the Launcher whether it should wait for the component to do some cleanup methods.
     */
    handleShutdownResponse(err: any, response: any): void;
    /**
     * Sends a heartbeat to all open windows to see if anything died.
     */
    heartbeat(): void;
    heartbeatListener(err: any, response: any): void;
    resetHeartbeats(): void;
    /**
     * Hyperfocuses a list, group, componentType or all windows
     * @param {*} response.data.windowList list of window names or window identifiers
     * @param {*} response.data.groupName group name
     * @param {*} response.data.componentType component type
     */
    hyperFocus(err: any, response: any): void;
    isWindowNameAlreadyUsed(windowName: any): boolean;
    /**
     * Retrieves a list of components from the configService.
     * @param {function} cb callback.
     * @private
     */
    loadComponents(cb?: Function): {};
    /**
     *
     * @param {*} response  - query responder response
     * @param {String} response.data.componentType - The component name
     * @param {Object} response.data.manifest - ""
     */
    registerComponent(err: any, message: any): any;
    /**
     *
     * @param {*} response
     * @param {String} response.data.componentType - The component name
     */
    unRegisterComponent(err: any, message: any): any;
    /**
     * Force-kill/close a window if it is in a pending state (i.e. spawn didn't complete); otherwise do nothing.
     * @param {*} windowIdentifier of window to force kill
     */
    forceKillWindowIfPending(windowIdentifier: any): Promise<{
        err: string;
    }>;
    /**
     *
     * @private
     */
    finishSpawn(defaultComponentConfig: any, windowDescriptor: any, params: any, objectReceivedOnSpawn: any): Promise<{
        err: any;
        data: {
            windowIdentifier: {
                windowName: any;
                uuid: any;
                componentType: any;
                monitor: any;
                windowType: any;
            };
            windowDescriptor: any;
        };
    }>;
    /**
     * Makes a slave window which will automatically close when the master closes.
     * @param  {finWindow} slave  An OpenFin window
     * @param  {LauncherClient~windowIdentifier} master The window identifier of the master
     */
    makeSlave(slave: any, master: any): void;
    /**
     * Minimizes a list, group or all windows
     * @param {*} response.data.windowList list of window names or window identifiers
     * @param {*} response.data.groupName group name
     * @param {*} response.data.componentType component type
     */
    minimizeWindows(err: any, response: any): void;
    /**
     * See doMonitorAdjustments()
     * Adds any motherless components. These would be any spawnOnAllMonitor components that are missing from a
     * particular monitor, presumably because the monitor just got added.
     */
    monitorAddMotherless(monitors: any, components: any, done: any): void;
    /**
     * See doMonitorAdjustments()
     * Adjust component dimensions. Since the monitor size may have changed we need to adjust any components
     * that had previously made assumptions about monitor size (such as a toolbar that is supposed to stretch across
     * the top of the screen). We cycle through any components that have made a "claim" on monitor space and then
     * simply call showWindow() with their original params in order to give them a chance to resettle.
     */
    monitorAdjustDimensions(done: any): void;
    /**
     * see doMonitorAdjustments()
     * Removes any orphaned components. These would be any spawnOnAllMonitor components that are now located
     * on a different monitor than they started. We simply compare their existing monitor with the one they were
     * spawned upon, and remove them if they aren't where they belong.
     */
    monitorRemoveOrphans(monitors: any, components: any, done: any): void;
    /**
     * Removes a component. This is called when a window receives a closed event.
     * If the window is still open then it is closed.
     *
     * @param  {string}   windowName Name of window that was closed
     */
    remove(event: any): void;
    removeUserDefinedComponent(message: any, cb: any): void;
    /**
     * Will reset the spawn stagger.
     * @param {object} [params]
     * @param {number} [params.monitorPosition] position of monitor to reset the stagger for
     * @callback {function} [cb] optional callback.
     */
    resetSpawnStagger(params: any, cb?: Function): void;
    /**
     * Whenever windows are added/removed from groups, send updates to existing windows with their group memberships.
     * @param {} windowList
     */
    sendUpdatesToWindows(windowList: any): void;
    /**
     * Given some bounds, returns the monitor that the window is on.
     * @param {} bounds
     */
    getMonitorByBounds(bounds: any): Promise<any>;
    /**
     * Shows and/or relocates a native window. Not implemented yet!
     * @param  {LauncherClient~windowIdentifier} windowIdentifier The window to show/move
     * @param	object params	Parameters, see spawn()
     * @param function cb Callback
     */
    showNativeWindow(windowIdentifier: any, params: any, cb: any): void;
    /**
     * Shows and/or relocates a component window
     * @param  {LauncherClient~windowIdentifier} windowIdentifier The window to show/move
     * @param	object params	Parameters, see spawn()
     * @param function cb Callback
     */
    showWindow(windowIdentifier: any, params: any, cb: any): Promise<void>;
    /**
     * Rewrite of shutdownComponents to call close on components.
     * @param {function} done
     */
    shutdownComponents(done: any): void;
    /**
     * Removes disallowed parameters before we pass data into compileWindowDescriptor.
     * @param params SpawnParams
     */
    _removeDisallowedSpawnParams(params: SpawnParams): SpawnParams;
    /**
    * Launches a component.
    * @param {object} params See LauncherClient
    * @param {function} cb Callback
    */
    spawn(params: SpawnParams, cb: StandardCallback): Promise<void>;
    /**
     * Takes a file path and converts it into preload URL, second argument makes it possible
     * to write test for this method in the future.
     * @param path The file path
     * @param applicationRoot Application root from finsemble config or specified one
     */
    _generateURL(path: string, applicationRoot?: string): string;
    getUnknownComponentName(): any;
    /**
    * Launches a copy of the requested component on each of a user's monitors.
    * @param {string} component The type of the component to launch
    * @param {object} params See spawn.
    * @param {function} cb Callback
    * @todo use asyncLib for spawning here. Get rid of the `remaining` var.
    */
    spawnOnAllMonitors(component: any, params: any, cb: any): Promise<void>;
    /**
     * Spawns an OF window, or sends a request to the native service to spawn a native window.
     * Callback returns a handle to the new window
    * @param {LauncherClient~windowDescriptor} windowDescriptor The descriptor to launch
    * @param {function} cb Callback
    */
    doSpawn(windowDescriptor: WindowDescriptor, cb?: Function): Promise<{
        err: any;
        data: any;
    }>;
    /**
     * Given an object where the keys are component names and the values are component configs, it spawns the list of components.
     * @private */
    spawnGroup(components: any, params: any, cb: any): void;
    /**
     * Splintering.
     */
    update(): void;
}
export {};
