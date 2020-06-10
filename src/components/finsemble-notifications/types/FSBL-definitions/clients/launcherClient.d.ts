/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */
import { _BaseClient as BaseClient } from "./baseClient";
import { SpawnParams } from "../services/window/Launcher/launcher";
import { WindowIdentifier } from "../globals";
interface ShowWindowParams extends SpawnParams {
  spawnIfNotFound?: boolean;
  autoFocus?: boolean;
  windowIdentifier?: WindowIdentifier;
  relativeWindow?: WindowIdentifier;
}
/**
 *
 * @introduction
 * <h2>Launcher Client</h2>
 *
 * The Launcher Client handles spawning windows of all kinds.
 * Finsemble provides the architecture to launch, resize, and reposition any component, whether native, modern, or third-party.
 *
 *
 * The Launcher API has capabilities to customize your end user's experience.
 * This includes CSS-like positioning and a fully display-aware positioning that deals with idiosyncrasies such as monitors with different scaling resolutions.
 *
 *
 * CSS provides higher level abstractions that aid in laying out an application that is composed of constituent parts.
 * Finsemble has borrowed CSS’s positioning paradigm and applied it to the task of laying out windows on the desktop.
 * This CSS-style positioning allows windows to be positioned on the `left`, `right`, `top`, or `bottom` of the end user’s screen for instance; we also developed new positions, such as `adjacent`, which allows a child window to spawn adjacent to their parent.
 * Components can be positioned and sized by percentage, relative to the monitor or to each other (nested windows).
 *
 *
 * The Launcher Client frequently uses the parameters <code>windowName</code> and <code>componentType</code>. [Learn more about them here](tutorial-ComponentTypesAndWindowNames.html).
 *
 *
 *
 * @hideconstructor
 * @constructor
 */
export declare class LauncherClient extends BaseClient {
  windowClient: any;
  constructInstance: any;
  myWindowIdentifier: any;
  constructor(params: any);
  /** @alias LauncherClient# */
  /**
   * Get a list of registered components (those that were entered into <i>components.json</i>).
   *
   * @param {Function} cb Callback returns an object map of components. Each component object
   * contains the default config for that component.
   */
  getComponentList(cb?: Function): Promise<{}>;
  /**
   * Get the component config (from <i>components.json</i>) for a specific component.
   *
   * @param {String} componentType The type of the component.
   * @param {Function} cb Callback returns the default config (windowDescriptor) for the requested componentType.
   *
   */
  getComponentDefaultConfig(componentType: string, cb?: Function): Promise<{}>;
  /**
   * Gets monitor information for a given windowIdentifier or for a specific monitor.
   * If neither the identifier or monitor are provided then the monitorInfo for the current window is returned.
   *
   *
   * The information returned contains:
   *
   * **monitorRect** - The full dimensions for the monitor. <br>
   * **availableRect** - The dimensions for the available space on the monitor (less the Windows task bar). <br>
   * **unclaimedRect** - The dimensions for available monitor space less any space claimed by components (such as the Toolbar). <br>
   *
   * Each of these is supplemented with the following additional members:
   *
   * **width** - The width as calculated (right - left). <br>
   * **height** - The height as calculated (bottom - top). <br>
   * **position** - The position of the monitor, numerically from zero to X. Primary monitor is zero. <br>
   * **whichMonitor** - Contains the string "primary" if it is the primary monitor.
   *
   * @param  {WindowIdentifier} params.windowIdentifier The windowIdentifier to get the monitorInfo. If undefined, then the current window.
   * @param  {number|string} params.monitor If passed then a specific monitor is identified. Valid values include:
   *
   * <b>"mine"</b> - Place the window on the same monitor as the calling window.
   *
   * Integer value from 0-n (0 being the primary monitor).
   *
   * <b>"primary"</b> indicates the user's primary monitor.
   *
   * <b>"all"</b> - Put a copy of the component on all monitors.
   * @param  {Function} cb Returns a monitorInfo object containing the monitorRect, availableRect and unclaimedRect.
   */
  getMonitorInfo(
    params: {
      windowIdentifier?: WindowIdentifier;
      monitor?: string;
    },
    cb?: Function
  ): Promise<{}>;
  /**
   * Gets monitorInfo (dimensions and position) for all monitors. Returns an array of monitorInfo objects. See <a href="LauncherClient.html#getMonitorInfo">LauncherClient#getMonitorInfo</a> for the format of a monitorInfo object.
   *
   *
   *
   * @param  {Function} cb Returns an array of monitorInfo objects.
   */
  getMonitorInfoAll(cb?: Function): Promise<{}>;
  /**
   * Registers a component with the Launcher Service. This method registers a given component in a component manifest, making it available to an app launcher component.
   *
   * @param {String} params.componentType The key of the component in the component's config.
   * @param {object} params.manifest This should be a component manifest, i.e., a component configuration file like <i>components.json</i>.
   * @param {Function} cb The callback to be invoked after the method completes successfully.
   */
  registerComponent(
    params: {
      componentType: string;
      manifest: any;
    },
    cb?: Function
  ): Promise<{}>;
  /**
   * Unregisters a component with the Launcher Service.
   *
   * @param {String} params.componentType The key of the component in the component's config.
   * @param  {Function} cb
   */
  unRegisterComponent(
    params: {
      componentType: string;
    },
    cb?: Function
  ): any;
  /**
   * A convenience method for dealing with a common use-case, which is toggling the appearance and disappearance of a child window when a button is pressed, aka drop down menus. Simply call this method from the click handler for your element. Your child window will need to close itself on blur events.
   * @param {HTMLElement|selector} element The DOM element, or selector, clicked by the end user.
   * @param {windowIdentifier} windowIdentifier Identifies the child window
   * @param {object} params Parameters to be passed to {@link LauncherClient#showWindow} if the child window is allowed to open
   */
  toggleWindowOnClick(
    element: HTMLElement | NodeSelector,
    windowIdentifier: WindowIdentifier,
    params: SpawnParams
  ): void;
  /**
   * Displays a window and relocates/resizes it according to the values contained in params.
   *
   * @param {WindowIdentifier} windowIdentifier A windowIdentifier. This is an object containing windowName and componentType. If windowName is not given, Finsemble will try to find it by componentType.
   * @param {object} params Parameters. These are the same as {@link LauncherClient#spawn} with the following exceptions:
   * @param {any} [params.monitor] Same as spawn() except that null or undefined means the window should not be moved to a different monitor.
   * @param {number | string} [params.left] Same as spawn() except that null or undefined means the window should not be moved from current horizontal location.
   * @param {number | string} [params.top] Same as spawn() except that null or undefined means the window should not be moved from current vertical location.
   * @param {boolean} [params.spawnIfNotFound=false] If true, then spawns a new window if the requested one cannot be found.
   * *Note, only works if the windowIdentifier contains a componentType.*
   * @param {boolean} [params.autoFocus] If true, window will focus when first shown.
   * @param {boolean} [params.slave] Cannot be set for an existing window. Will only go into effect if the window is spawned.
   * (In other words, only use this in conjunction with spawnIfNotFound).
   * @param {Function} cb Callback to be invoked after function is completed. Callback contains an object with the following information:
   * <b>windowIdentifier</b> - The {@link WindowIdentifier} for the new window.
   * <b>windowDescriptor</b> - The {@link WindowDescriptor} of the new window.
   * <b>finWindow</b> - An `OpenFin` window referencing the new window.
   * @example
   * FSBL.Clients.LauncherClient.showWindow({windowName: "Welcome Component-86-3416-Finsemble", componentType: "Welcome Component"}, {spawnIfNotFound: true});
   */
  showWindow(
    windowIdentifier: WindowIdentifier,
    params: ShowWindowParams,
    cb?: Function
  ): Promise<{ err; data }>;
  /**
   * Asks the Launcher service to spawn a new component. Any parameter below can also be specified in <i>../config/components.json</i>, which will
   * then operate as the default for that value.
   *
   * The launcher parameters mimic CSS window positioning.
   * For instance, to set a full size window use `left=0`,`top=0`,`right=0`,`bottom=0`.
   * This is functionally equivalent to: left=0,top=0,width="100%",height="100%"
   *
   * @since 2.4.1 Added params.windowType (deprecated params.native), params.path, params.alias, params.argumentsAsQueryString - These are all for launching native apps.
   * @since 3.7.0 Added "affinity" parameter
   * @param {function} cb Function invoked after the window is created
   */
  spawn(component: string, params: SpawnParams, cb?: Function): Promise<{}>;
  /**
   * Returns an object that provides raw access to a remote window.
   * It returns an object that contains references to the Finsemble windowDescriptor, to
   * the `OpenFin` window, and to the native JavaScript (browser) window.
   *
   * *This will only work for windows that are launched using the Finsemble Launcher API.*
   *
   * As in any browser, you will not be able to manipulate a window that has been launched
   * cross domain or in a separate physical application (separate process). Caution
   * should be taken to prevent a window from being closed by the user if you plan on
   * referencing it directly. Due to these inherent limitations we strongly advise against a
   * paradigm of directly manipulating remote windows through JavaScript. Instead leverage the
   * RouterClient to communicate between windows and to use an event based paradigm!
   *
   * @param  {object} params Parameters
   * @param {string} params.windowName The name of the window to access.
   * @return {RawWindowResult} An object containing windowDescriptor, finWindow, and browserWindow. Or null if window isn't found.
   * @deprecated Finsemble now uses a splintering agent which disconnects windows from the main launcher.
   * It becomes impossible to access raw windows. See LauncherClient.getActiveDescriptors() and Util.getFinWindow()
   * @private
   */
  getRawWindow(params: { windowName: string }): any;
  /**
   * @private
   */
  callSpawn(params: SpawnParams, cb?: Function): Promise<{}>;
  /**
   * Convenience function to get a monitor descriptor for a given windowIdentifier, or for the
   * current window.
   *
   * @param {WindowIdentifier} [windowIdentifier] The window to find the monitor for. Current window if undefined.
   * @param  {Function} cb Returns a monitor descriptor (optional or use returned Promise)
   * @returns {Promise} A promise that resolves to a monitor descriptor
   * @TODO this probably is unnecessary since a client can include util and a developer should be using this.getMonitorInfo which has full support for searching by component. Did Ryan need this?
   * @private
   */
  getMonitor(windowIdentifier: WindowIdentifier, cb?: Function): Promise<{}>;
  /**
   * Returns a windowIdentifier for the current window.
   *
   * @param {WindowIdentifier} cb Callback function returns windowIdentifier for this window (optional or use the returned Promise)
   * @returns {Promise} A promise that resolves to a windowIdentifier
   */
  getMyWindowIdentifier(cb?: Function): Promise<WindowIdentifier>;
  /**
   * Gets the windowDescriptor for all open windows.
   *
   * <b>Note:</b> This returns descriptors even if the window is not part of the workspace.
   *
   * @param {StandardCallback} cb Callback returns an array of windowDescriptors.
   *
   */
  getActiveDescriptors(cb?: Function): Promise<{ error: Error; data: any }>;
  /**
   * Adds a custom component. Private for now.
   * @private
   */
  addUserDefinedComponent(params: any, cb?: Function): Promise<{}>;
  /**
   * Adds a custom component. Private for now.
   * @private
   */
  removeUserDefinedComponent(params: any, cb?: Function): Promise<{}>;
  /**
   * Gets components that can receive specific data types. Returns an object containing componentTypes mapped to a list of dataTypes they can receive. This is based on the "advertiseReceivers" property in a component's config.
   * @param {Array.<string>} params.dataTypes An array of data types. Looks for components that can receive those data types.
   * @param {Function} cb The callback to be invoked after the method completes successfully.
   *
   * @since 2.0
   *
   * @example
   * FSBL.Client.LauncherClient.getComponentsThatCanReceiveDataTypes({ dataTypes: ['chartiq.chart', 'salesforce.contact']}, function(err, response) {
   * 	//Response contains: {'chartiq.chart': ['Advanced Chart'], 'salesforce.contact': ['Salesforce Contact']}
   * })
   *
   */
  getComponentsThatCanReceiveDataTypes(
    params: {
      dataTypes: string[];
    },
    cb?: Function
  ): Promise<{}>;
  /**
   * Brings a windows to front. If no windowList, groupName or componentType is specified, brings all windows to front.
   * @param params
   * @param {Array.<string | Object>} [params.windowList] Optional. An array An array of window names or window identifiers. Not to be used with componentType.
   * @param {string} [params.groupName] Optional. The name of a window group to bring to front.
   * @param {string} [params.componentType] Optional. The componentType to bring to front. Not to be used with windowList.
   *
   * @since TBD
   *
   * @example
   * LauncherClient.bringWindowsToFront({ windowList: ['AdvancedChart-123-123', 'Symphony-Chat-234-234']}, function(err, response) {
   *
   * })
   *
   * @private
   */
  bringWindowsToFront(
    params?: {
      windowList?: string[] | WindowIdentifier[];
      groupName?: string;
      componentType?: string;
    },
    cb?: Function
  ): Promise<void>;
  /**
   * Minimizes all but a specific list or group of windows. Either groupName or windowList must be specified.
   * @param params
   * @param {Array.<string | Object>} [params.windowList] Optional. An array of window names or window identifiers. Not to be used with componentType.
   * @param {string} [params.groupName] Optional. The name of a window group to hyperFocus.
   * @param {string} [params.componentType] Optional. The Component Type to hyperFocus. Not to be used with windowList.
   *
   * @since TBD
   * @example
   * LauncherClient.hyperFocus({ windowList: ['AdvancedChart-123-123', 'Symphony-Chat-234-234']}, function(err, response) {
   *
   * })
   *
   * @private
   */
  hyperFocus(
    params: {
      windowList?: string[] | WindowIdentifier[];
      groupName?: string;
      componentType?: string;
    },
    cb?: Function
  ): Promise<void>;
  /**
   * Minimize windows. If no windowList or groupName is specified, all windows will be minimized.
   * @param {*} params
   * @param {Array.<string | Object>} [params.windowList] Optional. An array of window names or window identifiers. Not to be used with componentType.
   * @param {string} [params.groupName] Optional. The name of a window group to minimize.
   * @param {string} [params.componentType] Optional. The component type of windows to Minimize. Not to be used with windowList.
   *
   * @since TBD
   * @private
   */
  minimizeWindows(
    params: {
      windowList?: string[] | WindowIdentifier[];
      groupName?: string;
      componentType?: string;
    },
    cb?: Function
  ): Promise<void>;
  /**
   * Create Window group
   * @param {*} params
   * @param {string} [params.groupName] The name of the window group to create
   * @param {Array.<string | Object>} [params.windowList] An array of window names or window identifiers to add to the group. Optional.
   * @param {function} cb callback to be called upon group creation
   *
   * @since TBD
   * @private
   */
  createWindowGroup(
    params: {
      windowList?: string[] | WindowIdentifier[];
      groupName?: string;
    },
    cb?: Function
  ): Promise<{}>;
  /**
   * Add Windows to group
   * @param {*} params
   * @param {string} [params.groupName] The name of the window group
   * @param {Array.<string | Object>} [params.windowList] An array of window names or window identifiers to add to the group.
   * @param {function} cb callback to be called upon group creation
   *
   * @since TBD
   * @private
   */
  addWindowsToGroup(
    params: {
      windowList?: string[] | WindowIdentifier[];
      groupName?: string;
    },
    cb?: Function
  ): Promise<{}>;
  /**
   * Remove Windows from group
   * @param {*} params
   * @param {string} [params.groupName] The name of the window group
   * @param {Array.<string | Object>} [params.windowList] An array of window names or window identifiers to remove from the group.
   * @param {function} cb callback to be called upon group creation
   *
   * @since TBD
   * @private
   */
  removeWindowsFromGroup(
    params: {
      windowList?: string[] | WindowIdentifier[];
      groupName?: string;
    },
    cb?: Function
  ): Promise<{}>;
  /**
   * Get Window Groups that a window belongs to. If no windowIdentifier is specified, gets  the groups of the current window.
   * @param {*} params
   * @param {WindowIdentifier} [params.windowIdentifier] Optional. If not specified uses current window
   * @param {*} cb callback with a list of groups
   *
   * @since TBD
   * @private
   */
  getGroupsForWindow(
    params: {
      windowIdentifier: WindowIdentifier;
    },
    cb?: Function
  ): Promise<{}>;
  /**
   * @private
   * @param {*} params
   * @param {WindowIdentifier} [params.windowIdentifier] Optional. Current window is assumed if not specified.
   * @param {Array.<string>} [params.groupNames] List of group names to add window to. Groups will be created if they do not exist.
   * @param {*} cb
   */
  addToGroups(
    params: {
      windowIdentifier?: WindowIdentifier;
      groupNames?: string[];
    },
    cb?: Function
  ): Promise<{}>;
  /**
   * _createWrap allows us to create a wrap without spawning a window
   *
   * @param {Object} params
   * @param {String} params.name
   * @param {Function} cb
   * @memberof LauncherClient
   * @private
   */
  _createWrap(
    params: {
      name: string;
    },
    cb: Function
  ): void;
  /**
   * @private
   *
   * @param {*} cb
   * @memberof LauncherClient
   */
  start(cb: any): void;
}
declare var launcherClient: LauncherClient;
export default launcherClient;
