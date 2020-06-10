import { _BaseClient as BaseClient } from "./baseClient";
import { StandardCallback, WindowIdentifier, WindowBounds } from "../globals";
declare type InjectHeaderParams = {
	/**  Component to inject. Default is "windowTitleBar"  */
	component?: string;
	bumpElements?: {
		/** Either false, "all" or "0Positioned". If all, all fixed elements are moved. 0Positioned only moves elements that have top 0. Default is all. */
		fixed?: boolean | "all" | "0Positioned";
		/** Either false, "all" or "0Positioned". If all, all fixed elements are moved. 0Positioned only moves elements that have top 0. Only applies to children of the document.body. Default is all. */
		absolute?: boolean | "all" | "0Positioned";
		/** Sets the amount to bump elements by (e.g. "25px"). Default is "auto" which will measure the height of the injected component when rendered. */
		bumpBy?: string;
	};
	/**  Sets the body margin (e.g. "25px"). Default is "auto" which will measure the height of the injected component when rendered. */
	bodyMarginTop?: string;
	/** Sets a height on the main FSBLHeader div. Either false or a specified height (e.g. "25px"). */
	forceHeaderHeight: boolean;
};
declare type GroupData = {
	windowNames: string[];
	isMovable: boolean;
	isAlwaysOnTop: boolean;
	topRightWindow: string;
	isARectangle: boolean;
};
/**
 *
 *@introduction
  <h2>Window Client</h2>
  ----------
 * The Window Client is primarily responsible for managing the `windowState` (the window's bounds) and `componentState` (data inside of your component).
 * The reference below is provided in case you'd like to manually trigger events.
 *
 * The Window Client also injects the window title bar control, which contains controls for minimizing, maximizing, closing, and restoring your window. For information about the window title bar, please see the [UI Component tutorial](tutorial-UIComponents.html#window-title-bar).
 *
 * @hideconstructor
 * @param {object} params
 * @constructor
 * @returns {WindowClient}
 */
export declare class WindowClient extends BaseClient {
	setIgnoreMouseEvents(ignore: boolean, options?: { forward: boolean }) {
		throw new Error("Method not implemented.");
	}
	options: {
		customData?: any;
		defaultTop?: any;
		defaultLeft?: any;
		width?: any;
	};
	windowHash: string;
	title: any;
	windowGroups: GroupData[];
	toolbarBottom: number;
	containers: any[];
	componentState: {
		[x: string]: any;
	};
	windowState: string;
	hasHeader: boolean;
	enableWindowsAeroSnap: boolean;
	minimizeWithDockedWindows: (cb: any) => void;
	isInAService: boolean;
	startedRegistrationWithDocking: boolean;
	deregisterPlease: boolean;
	commandChannel: (arg0: any, arg1: any) => void;
	constructor(params: any);
	/**
	 * @private
	 */
	bindFunctions(): void;
	/**
	 * This function is fired every time the window's bounds change. It saves the window's position.
	 * @param {object} bounds
	 * @private
	 */
	onWindowRestored(): void;
	/**
	 * @private
	 */
	onWindowMaximized(): void;
	/**
	 * @private
	 */
	onWindowBlurred(): void;
	/**
	 * @private
	 */
	onWindowFocused(): void;
	/**
	 * @private
	 */
	onMinimizedRestored(): void;
	/**
	 * @private
	 */
	onWindowMinimized(): void;
	/**
	 * Handles the event that fires when the finsemble window's parent is set.
	 * @private
	 * @param evt the event itself, which is ignored.  Any time a parent is set, force a group data update.
	 */
	private onParentSet;
	/**
	 * Returns a list of the groups this window is in, if any.
	 */
	getWindowGroups(): GroupData[];
	/**
	 * Handler for group updates from the window service.  Stores the groups that this window is in,
	 * if any.
	 * @private
	 * @param err the error, if any
	 * @param res the received updated group data
	 */
	private groupUpdateHandler;
	/**
	 * Requests an updated group data message.
	 * @private
	 */
	private requestGroupDataPublish;
	/**
	 * Closes window. Defaults are to remove the window from the workspace if the user presses the X button, but not if the window is closed via an app-level request (e.g., switching workspaces, so all windows need to close).
	 * @param {object} params
	 * @param {boolean} params.removeFromWorkspace Whether to remove the window from the workspace.
	 * @param {boolean} params.closeWindow Whether to close the window. On shutdown this method is called, but the Window Service actually closes the window.
	 * @param {boolean} params.userInitiated Whether the user clicked the X, or if the system asked the window to close.
	 * @param {function} cb The callback to be invoked after the method completes successfully.
	 * @example
	 * //Close window and remove from workspace (e.g., user closes the window).
	 * FSBL.Clients.WindowClient.close({ removeFromWorkspace: true, closeWindow: true });
	 * //Close window and keep in workspace (e.g., application requests that all windows close themselves).
	 * FSBL.Clients.WindowClient.close({ removeFromWorkspace: false, closeWindow: false });
	 */
	close(
		params: {
			removeFromWorkspace: boolean;
			closeWindow: boolean;
			ignoreParent?: boolean;
			userInitiated?: boolean;
		},
		cb?: StandardCallback
	): any;
	/**
	 * @private
	 * @returns {windowHash}
	 */
	getWindowHash(): string;
	/**
	 * Retrieves the window's title.
	 * @returns {String} title
	 * @example
	 * var windowTitle = FSBL.Clients.WindowClient.getWindowTitle();
	 */
	getWindowTitle(): any;
	/**
	 * This function retrieves the dimensions of the monitor that the window is on. It's currently used in the {@link launcherClient}.
	 * @param {function} callback
	 * @private
	 * @todo  this is bad. The monitor can change if the window is moved. Use util monitor functions instead. Instead, use the util style getMyMonitor, and keep monitor dimensions up to date statically at FSBL level with a listener on launcher (unclaimedRect).
	 */
	retrieveMonitorDimensions(callback?: Function): void;
	/**
	 * Listens for changes in the hash and persists the change to the url property, and then saves it.
	 * @private
	 */
	listenForHashChanges(): void;
	/**
	 * Gets the options from the window on startup and caches them on the object.
	 * @private
	 * @param {function} callback
	 */
	getInitialOptions(callback: any): void;
	/**
	 * Gets the bounds for the window on startup and saves them to the workspace.
	 * @private
	 * @param {function} callback
	 */
	cacheInitialBounds(callback: any): void;
	/**
	 * Sets initial state for the window. This data is modified on subsequent saves.
	 * @param {function} callback
	 * @private
	 */
	setInitialWindowBounds(callback: any): void;
	/**
	 * Returns windowBounds as of the last save.
	 * @returns {object}
	 * @private
	 */
	getWindowBounds(): {
		top: any;
		left: any;
		width: any;
		height: any;
	};
	/**
	 *
	 * Saves the window's state. Rarely called manually, as it's called every time your window moves.
	 * @param {Object} bounds optional param.
	 * @example <caption>The code below is the bulk of our listener for the <code>bounds-changed</code> event from the window. Every time the <code>bounds-changed</code> event is fired (when the window is resized or moved), we save the window's state. The first few lines just prevent the window from being dropped behind the toolbar.</caption>
	 *finWindow.addEventListener('disabled-frame-bounds-changed', function (bounds) {
	 * 	if (bounds.top < 45) {
	 *		finWindow.moveTo(bounds.left, 45);
	 *		return;
	 *	}
	 *	self.saveWindowBounds(bounds);
	 * @private
	 *});
	 */
	saveWindowBounds(bounds: WindowBounds, setActiveWorkspaceDirty: boolean): void;
	/**
	 * Minimizes window.
	 * @param {function} cb Optional callback to be invoked after the method completes successfully.
	 * @example
	 * FSBL.Clients.WindowClient.minimize();
	 */
	minimize(cb: StandardCallback): void;
	/**
	 * Sets whether window is always on top. By default, this is false.
	 * @param {function} cb Optional callback to be invoked after the method completes successfully.
	 * @example
	 * FSBL.Clients.WindowClient.setAlwaysOnTop(true);
	 */
	setAlwaysOnTop(alwaysOnTop: boolean, cb?: Function): void;
	/**
	 * Restores window from a maximized or minimized state.
	 * @param {function} cb Optional callback to be invoked after the method completes successfully.
	 * @example
	 * FSBL.Clients.WindowClient.restore();
	 */
	restore(cb?: StandardCallback): void;
	/**
	 * @private
	 */
	cacheBounds(cb: Function): void;
	/**
	 * Maximizes the window taking into account any claimed space on the monitor.
	 * @param {function} cb Optional callback to be invoked after the method completes successfully.
	 * @example
	 * FSBL.Clients.WindowClient.maximize();
	 */
	maximize(cb: Function): void;
	/**
	 * FinWindow destructor (more or less). Removes all of the listeners that we added when the window was created.
	 * @private
	 */
	removeFinWindowEventListeners(): void;
	/**
	 * This function injects the header bar into all frameless windows that request it. This should only be used if you've decided not to use the provided <code>WindowClient.start()</code> method.
	 *
	 * **NOTE:** If you are using the Finsemble winndow title bar component, you do not need to call this function.
	 * @private
	 */
	injectDOM(headerHeight: any): void;
	/**
	 * Injects the windowTitleBar into the window.
	 * @param {function} cb Callback function
	 * @return {object} Reference to a RouterClient.query
	 * @private
	 */
	injectFSBL(params: InjectHeaderParams, cb: StandardCallback): void;
	/**
	 * Given a field, this function retrieves app state. If no params are given, the full state is returned.
	 * @param {string} params.field Field to retrieve.
	 * @param {Array.<string>} params.fields Fields to retrieve.
	 * @param {string} params.windowName Window whose component state you are retreiving. If null, the default is to the calling window.
	 * @param {function} cb The callback to be invoked after the method completes successfully.
	 * @example <caption>The example below shows how we retrieve data to restore the layout in our charts.</caption>
	 * FSBL.Clients.WindowClient.getComponentState({
	 *	 field: 'myChartLayout',
	 * }, function (err, state) {
	 * 	importLayout(state);
	 * });
	 *
	 * FSBL.Clients.WindowClient.getComponentState({
	 * 		fields: ['myChartLayout', 'chartType'],
	 * }, function (err, state) {
	 * 	var chartType = state['chartType'];
	 * 	var myChartLayout = state['myChartLayout'];
	 * });
	 **/
	getComponentState(
		params: {
			field?: string;
			fields?: string[];
			windowName?: string;
		},
		cb: StandardCallback
	): any;
	/**
	 * Given a field, this function sets and persists app state.
	 * @param {object} params
	 * @param {string} params.field field
	 * @param {Array.<string>} params.fields fields
	 * @param {string} params.windowName Name of the component whose state you are setting. Defaults to the calling window.
	 * @param {any} params.value Value of the data being saved
	 * @param {function} cb The callback to be invoked after the method completes successfully.
	 * @example <caption>The example below shows how we save our chart layout when it changes.</caption>
	 * var s = stx.exportLayout(true);
	 * //saving layout'
	 * FSBL.Clients.WindowClient.setComponentState({ field: 'myChartLayout', value: s });
	 * FSBL.Clients.WindowClient.setComponentState({ fields: [{field:'myChartLayout', value: s }, {field:'chartType', value: 'mountain'}]);
	 **/
	setComponentState(
		params: {
			field?: string;
			fields?: {
				field: string;
				value: any;
			}[];
			value?: any;
			windowName?: string;
		},
		cb?: StandardCallback
	): any;
	/**
	 * Given a field, this function removes it from app state.
	 * @param {object} params
	 * @param {string} params.field field
	 * @param {Array.<string>} params.fields fields
	 * @param {string} params.windowName The name of the window to remove component state from
	 * @param {function} cb The callback to be invoked after the method completes successfully.
	 * @example <caption>The example below shows how we would remove our chart layout when it no longer needed.</caption>
	 * // remove unused state value
	 * FSBL.Clients.WindowClient.removeComponentState({ field: 'myChartLayout'});
	 * FSBL.Clients.WindowClient.removeComponentState({ fields: [{field:'myChartLayout'}, {field:'chartType'}]);
	 **/
	removeComponentState(
		params: {
			field?: string;
			fields?: {
				field: string;
			}[];
			windowName?: string;
		},
		cb?: StandardCallback
	): Promise<any>;
	/**
	 * Gets the window name of current window or the parent, if tabbed. The code that manages window movement will not see a child window if it's part of a stacked window. This function will return the window name that the Window Service cares about for window movement.
	 */
	getWindowNameForDocking(): any;
	/**
	 * Gets containerHash given a containerId.
	 * @param {string} windowName The name of the window
	 * @returns {string} Hash for the window
	 * @private
	 */
	getContainerHash(windowName: string): string;
	/**
	 * Forms a group with any window that is touching the border of this window.
	 * @private
	 */
	formGroup(): void;
	/**
	 * This function is critical if you want docking and snapping to work. It transmits a message to the LauncherService, which registers it as a dockable window.
	 *
	 * **NOTE:** If you are using the finsemble windowTitleBar component, you do not need to call this function.
	 * @param {object} params Parameters
	 * @param {function} cb callback
	 *
	 * @example
	 * FSBL.Clients.WindowClient.registerWithDockingManager();
	 * @private
	 */
	registerWithDockingManager(params: any, cb: any): void;
	/**
	 * This function is critical if you don't want to keep references of windows in the LauncherService after they close. It simply notifies the LauncherService that the window is no longer dockable. It's invoked when the window is closed.
	 * **NOTE:** If you are using the finsemble windowTitleBar component, you do not need to call this function.
	 * @param {boolean} removeFromWorkspace true to remove from workspace
	 * @example
	 * FSBL.Clients.WindowClient.deregisterWithDockingManager();
	 * @private
	 */
	deregisterWithDockingManager(removeFromWorkspace?: boolean): void;
	/**
	 * @private
	 */
	enableHotkeys(): void;
	/**
	 * Helper function to display dev-tools if you disable context-menus on your chromium windows. You must call this function if you want the hotkey to work.
	 * @private
	 */
	enableReloadHotkey(): void;
	/**
	 * Helper function to display dev-tools if you disable context-menus on your chromium windows. You must call this function if you want the hotkey to work.
	 * @private
	 */
	enableDevToolsHotkey(): void;
	/**
	 * Bumps top-level containers down below the windowTitleBar.
	 * @private
	 */
	bumpFixedElements(params: any): NodeJS.Timeout;
	/**
	 * Brings the window to the top of all other windows.
	 * @example
	 * FSBL.Clients.WindowClient.bringWindowToFront();
	 */
	bringWindowToFront(): void;
	/**
	 * The Finsemble window title bar is injected if either FSBLHeader: true or FSBLHeader is an object with the same items as the properties of params below are in the component's config. If you want to inject the window title bar later, you can do so by calling this function.
	 * @depcrate the union boolean type and only accept types of InjectHeaderParams.
	 */
	injectHeader(params?: InjectHeaderParams | boolean, cb?: StandardCallback): void;
	/**
	 * @private
	 */
	injectStylesheetOverride(): void;
	/**
	 * If we spawned this openfin app from our parent application, we listen on that application for certain events that might fire _if_ our parent goes down. If the parent goes down, we want to kill its children as well.
	 * @private
	 */
	checkIfChildApp(): void;
	/**
	 * Prevents the browser's default behavior of loading files/images if they're dropped anywhere in the window.
	 * If a component has a drop area that _doesn't_ preventDefault, the image/file will still be loaded.
	 * This only prevents bad behavior from happening when the user drops an image/file on part of the window that _isn't_ listening for drag/drop events (usually by accident).
	 * @private
	 */
	preventUnintendedDropEvents(): void;
	/**
	 * If the user presses windows key + left or right it causes all kinds of abhorrent behavior. This function captures the hotkeys and essentially prevents the behavior.
	 * @private
	 */
	rejectWindowsKeyResizes(): void;
	/**
	 * Adds listeners to handle hash changes and finWindow listeners.
	 * @private
	 * @param {function} cb
	 */
	addListeners(cb?: Function): void;
	/**
	 * Sends a command to the header. Commands affect the header state,
	 * so that the UI reflects what is going on in the component window.
	 * @param {string} command The state object to set
	 * @param {object} state The new state (merged with existing)
	 * @private
	 */
	updateHeaderState(command: string, state: any): void;
	/**
	 * Establishes a command channel with the <a href="tutorial-UIComponents.html#window-title-bar-aka-the-fsblheader">Finsemble window title bar component</a>. The Window Client can
	 * update the title bar's state via this channel.
	 * @param {function} commandChannel A function callback that receives commands.
	 */
	headerCommandChannel(commandChannel: (arg0: any, arg1: any) => void): void;
	/**
	 * Ejects the window from the docking group
	 * @private
	 */
	ejectFromGroup(): void;
	/**
	 * This function sets the window's title in the windowTitleBar component, and in the DOM's title element.
	 * This is useful if you like to keep the window's title in sync with a piece of data (e.g., a Symbol).
	 * @param {String} title Window title.
	 * @todo Allow HTML or classes to be injected into the title.
	 * @example <caption>The code shows how you would change your window title.</caption>
	 *  FSBL.Clients.WindowClient.setWindowTitle("My Component's New Title");
	 */
	setWindowTitle(title: any): void;
	/**
	 * Retrieves data that was set with <a href="LauncherClient.html#spawn">LauncherClient.spawn</a>.
	 * @return {object} The data or empty object if no data was set. *Note, this will never return null or undefined.*
	 */
	getSpawnData(): any;
	/**
	 * Returns a reference to the current window for the component.
	 * @returns {finWindow}
	 */
	getCurrentWindow(): any;
	/**
	 * For the DOM element that has been passed in, this function returns a bounding box that is relative
	 * to the OpenFin virtual monitor space. That is, it returns the position of the DOM element on the desktop.
	 * @param {HTMLElement|string} element A selector or HTMLElement
	 * @private
	 * @todo convert to use monitor util function and make sure current bounds are correct. For some windows (e.g., toolbars/menus that don't track their own bounds because they don't have drag regions), options.default will represent the data _on spawn_, not the bounds when the function is called.
	 */
	getDesktopBoundingBox(
		element: string | Element
	): {
		top: number;
		left: any;
		width: number;
		height: number;
		right: number;
		bottom: number;
	};
	/**
	 * @private
	 */
	isPointInBox(
		point: {
			x: number;
			y: number;
		},
		box: {
			top: number;
			left: number;
			bottom?: number;
			right?: number;
			width: number;
			height: number;
		}
	): boolean;
	/**
	 * Returns (via callback) true if the mouse is currently located (hovering) over the requested element.
	 * @param {HTMLElement|string} element The element, or a selector, to check
	 * @param {function} cb A function that returns a boolean
	 * @private
	 */
	isMouseOverDOMElement(element: Element, cb: Function): void;
	/**
	 * Returns the window identifier for the current component.
	 * @returns {windowIdentifier}
	 */
	getWindowIdentifier(): {
		windowName: any;
		uuid: any;
		componentType: any;
	};
	/**
	 * Highlights the window as active by creating a border around the window.
	 *
	 * @param {boolean} active  Set to false to turn off activity
	 * @private
	 */
	setActive(active: boolean): void;
	/**
	 * Returns the bounds for the current window.
	 * @param {StandardCallback} cb The callback to be invoked after the method completes successfully.
	 */
	getBounds(cb: StandardCallback): void;
	/**
	 * This is used by the Finsemble window title bar when a tab is dragged for tiling or tabbing.
	 * @param {*} params - <code>params.windowIdentifier</code> is required.
	 * @param {*} cb The callback to be invoked after the method completes successfully.
	 */
	startTilingOrTabbing(
		params: {
			windowIdentifier: WindowIdentifier;
		},
		cb?: Function
	): void;
	/**
	 * This is used to cancel a tabbing or tiling operation.
	 * @param {*} params - Put <code>windowIdentifier</code> in <code>params.windowIdentifier</code>. If not provided, must set <code>params.waitForIdentifier</code> true.
	 * @param {*} cb - The callback to be invoked after the method completes successfully.
	 */
	cancelTilingOrTabbing(
		params: {
			windowIdentifier: WindowIdentifier;
		},
		cb?: Function
	): void;
	/**
	 * This is used to let Finsemble know which window is being dragged. <code>params.windowIdentifier</code> must be the identifier of the tab being dragged. This is only used if the identifier is unknown when <code>startTilingOrTabbing</code> is called.
	 * @param {*} params - The <code>windowIdentifier</code> is required.
	 * @param {*} cb - The callback to be invoked after the method completes successfully.
	 */
	sendIdentifierForTilingOrTabbing(
		params: {
			windowIdentifier: WindowIdentifier;
		},
		cb?: Function
	): void;
	/**
	 * This function is used by the Finsemble window title bar to end tiling or tabbing.
	 * @param {*} params
	 * @param {object} params.mousePosition Where the pointer is on the screen
	 * @param {number} params.mousePosition.x X position of the pointer
	 * @param {number} params.mousePosition.y Y position of the pointer
	 * @param {boolean} params.allowDropOnSelf Determines whether a tab can be dropped on the window where the drag originated.
	 * @param {*} cb - The callback to be invoked after the method completes successfully.
	 */
	stopTilingOrTabbing(
		params: {
			mousePosition?: {
				x: number;
				y: number;
			};
			allowDropOnSelf?: boolean;
		},
		cb?: Function
	): any;
	/**
	 * Gets the stackedWindow (if this window is a child of a stacked window).
	 *
	 * If the calling window is not part of a stacked window, the stacked window identifier will be returend null -- unless params.create is true. In this case, a stacked window will be created and the calling window will be set as the first child
	 *
	 * (Typically used by Tabbing Presentation component to manage tabs.)
	 *
	 * @param {object=} params
	 * @param {array=} params.create if true and StackedWindow isn't defined, then it will be created
	 * @param {array=} params.windowIdentifiers if creating, then can optionally specify an array of other windowIdentifiers to add to stack on creation (in addition to this window).
	 * @param {function} cb cb(err, stackedWindowIdentifier)
	 *
	 * Typically used by Tabbing Presentation component.
	 */
	private getStackedWindow;
	/**
	 * Private copy of getMonitorInfo from LauncherClient. We have to include it here to avoid a circular reference between LauncherClient and WindowClient.
	 * @private
	 */
	getMonitorInfo(params: any, cb: any): void;
	/**
	 * Moves the window so that it's centered above the user's mouse.
	 */
	showAtMousePosition: () => void;
	/**
	 * Automatically resizes the height of the window to fit the full DOM of the current window.
	 * @param {object} params.padding
	 * @param {number} params.padding.height How much padding around the DOM to add to the height of the window.
	 * @param {number} params.padding.width How much padding around the DOM to add to the width of the window.
	 * @param {number} params.maxHeight Maximum height to make the window.
	 * @param {number} params.maxWidth Maximum width to make the window.
	 * @param {function} cb Optional callback to be invoked after the method completes successfully.
	 */
	fitToDOM(
		params?: {
			padding?: {
				height: number;
				width: number;
			};
			maxHeight?: number;
			maxWidth?: number;
		},
		cb?: Function
	): void;
	/**
	 * Kicks off all of the necessary methods for the app. It
	 * 1. Injects the header bar into the window.
	 * 2. Sets up listeners to handle close and move requests from the application.
	 * 3. Adds a listener that saves the window's state every time it's moved or resized.
	 * @param {function} callback
	 * See the [windowTitleBar tutorial](tutorial-UIComponents.html#window-title-bar) for more information.
	 * @private
	 */
	start(callback?: Function): Promise<void>;
}
declare let windowClient: WindowClient;
export default windowClient;
