/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import { _BaseClient } from "./baseClient";
import { Workspace } from "../common/workspace";
import { ActiveWorkspace } from "../common/workspace";
import { FinsembleWindowData } from "../common/FinsembleWindowData";
import { RouterResponse } from "./IRouterClient";
import { StateType, CompleteWindowState } from "../common/windowStorageManager";
import { StandardCallback } from "../globals";
/**
 * @introduction
 * <h2>Workspace Client</h2>
 * ----------
 * The Workspace Client manages all calls to load, save, rename, and delete workspaces.
 *
 *
 * The Workspace Client uses the <code>windowIdentifier</code> parameter. <a href="tutorial-ComponentTypesAndWindowNames.html">Learn more about them here</a>.
 *
 *
 * See the <a href=tutorial-Workspaces.html>Workspace tutorial</a> for an overview of using the Workspace Client.
 *
 * @hideConstructor true
 * @constructor
 * @summary You don't need to ever invoke the constructor. This is done for you when WindowClient is added to the FSBL object.
 */
export declare class WorkspaceClient extends _BaseClient {
    /**
        * List of all workspaces within the application.
        * @type {Array.<Object>}
        */
    workspaces: Workspace[];
    /**
        * Reference to the activeWorkspace object
        * @type {object}
        */
    activeWorkspace: ActiveWorkspace;
    workspaceIsDirty: boolean;
    constructor(params: any);
    private _serviceResponseHandler;
    /**
     * Saves Data Globally to the Active Workspace (e.g. ComponentState, WindowList etc.)
     * @param {object} params
     * @param {string} params.field
     * @param {object} params.value
     * @param {FinsembleCallbackFunction} cb
     */
    private saveGlobalData;
    /**
     * Saves View Specific Data (e.g. ComponentState, WindowList etc.) to the Currently Active Workspace View or all Views
     * When a window state changes, on
     * @param {object} params
     * @param {string} params.field
     * @param {object} params.value
     * @param {boolean} params.saveToAllViews
     * @param {FinsembleCallbackFunction} cb
     */
    private saveViewData;
    /**
     * Adds window to active workspace.
     * @private
     * @param {object} params
     * @param {string} params.name Window name
     * @param {function} cb The callback to be invoked after the method completes successfully.
     */
    addWindow(params: FinsembleWindowData, cb?: Function): void;
    /**
     * Removes window from active workspace.
     * @private
     * @param {object} params
     * @param {string} params.name Window name
     * @param {function} cb The callback to be invoked after the method completes successfully.
     * @example <caption>This method removes a window from a workspace. It is rarely called by the developer. It is called when a window that is using the window manager is closed. That way, the next time the app is loaded, that window is not spawned.</caption>
     * FSBL.Clients.WorkspaceClient.removeWindow({ name:windowName }, function(err, response) {
     * 	//do something after removing the window.
     * });
     */
    removeWindow(params: {
        name: string;
    }, cb?: Function): void;
    /**
     * Auto arranges all windows on the user's screen.
     * @param {object} params Parameters
     * });
     * @param {string} params.monitor Same options as <a href="LauncherClient.html#showWindow">LauncherClient.showWindow</a>. Default is monitor of calling window.
     * @param {function} cb The callback to be invoked after the method completes successfully.
     * @example
     * FSBL.Clients.WorkspaceClient.autoArrange(function(err, response) {
     * 		//do something after the auto-arrange, maybe make all of the windows flash or notify the user that their monitor is now tidy.
     * });
     */
    autoArrange(params: {
        monitor?: string;
        monitorDimensions?: any;
    }, cb?: Function): void;
    /**
     * Minimizes all windows.
     * @param {object} params
     * @param {string} 	[params.monitor="all"] Same options as <a href="LauncherClient.html#showWindow">LauncherClient.showWindow</a> except that "all" will work for all monitors. Defaults to all.
     * @param {function} cb The callback to be invoked after the method completes successfully.
     * @example
     * FSBL.Clients.WorkspaceClient.bringWindowsToFront();
     */
    minimizeAll(params?: {
        monitor: string;
        windowIdentifier?: any;
    }, cb?: Function): void;
    /**
     * Brings all windows to the front.
     * @param {object} params
     * @param {string} 	params.monitor Same options as <a href="LauncherClient.html#showWindow">LauncherClient.showWindow</a> except that "all" will work for all monitors. Defaults to the monitor for the current window.
     * @param {function} cb The callback to be invoked after the method completes successfully.
     * @example
     * FSBL.Clients.WorkspaceClient.bringWindowsToFront();
     */
    bringWindowsToFront(params?: {
        monitor: string;
        windowIdentifier?: any;
    }, cb?: Function): void;
    /**
     * Gets the currently active workspace.
     * @param {function} cb The callback to be invoked after the method completes successfully.
     * @example <caption>This function is useful for setting the initial state of a menu or dialog. It is used in the toolbar component to set the initial state.</caption>
     *
     * FSBL.Clients.WorkspaceClient.getActiveWorkspace((err, response) => {
     * 	// do something with the response.
     * });
     */
    getActiveWorkspace(cb?: StandardCallback): Promise<{
        data: Workspace;
    }>;
    /**
     * Returns the list of saved workspaces.
     * @param {function} cb The callback to be invoked after the method completes successfully.
     * @example <caption>This function is useful for setting the initial state of a menu or dialog.</caption>
     *
     * FSBL.Clients.WorkspaceClient.getActiveWorkspace((err, response) => {
     * 	//setState is a React component method.
     * 	self.setState({
     * 		workspaces: response
     * 	});
     * });
     */
    getWorkspaces(cb?: any): Promise<{}>;
    /**
     * @private
     *
     * @param {*} params
     * @param {*} cb
     * @returns
     * @memberof WorkspaceClient
     */
    setWorkspaceOrder(params: any, cb: any): Promise<{}>;
    setWorkspaces: (params: any, cb: any) => Promise<{}>;
    /**
     * Removes a workspace. Either the workspace object or its name must be provided.
     * @param {object} params
     * @param {Object} 	params.workspace Workspace
     * @param {string} 	params.workspace.name Workspace Name
     * @param {string} 	params.name Workspace Name
     * @param {function} cb Callback to fire after 'Finsemble.WorkspaceService.update' is transmitted.
     * @example <caption>This function removes 'My Workspace' from the main menu and the default storage tied to the application.</caption>
     * FSBL.Clients.WorkspaceClient.remove({
     * 	name: 'My Workspace'
     * }, function(err, response) {
     * 	//You typically won't do anything here. If you'd like to do something when a workspace change happens, we suggest listening on the `Finsemble.WorkspaceService.update` channel.
     * });
     */
    remove(params: {
        workspace?: {
            name: string;
        };
        name?: string;
    }, cb?: Function): Promise<{}>;
    /**
     * Renames the workspace with the provided name. Also removes all references in storage to the old workspace's name.
     * @param {object} params
     * @param {string} params.oldName Name of workspace to rename.
     * @param {string} params.newName What to rename the workspace to.
     * @param {boolean} params.removeOldWorkspace Whether to remove references to old workspace after renaming.
     * @param {boolean} params.overwriteExisting Whether to overwrite an existing workspace.
     * @param {function} cb The callback to be invoked after the method completes successfully.
     * @example <caption>This method is used to rename workspaces. It is used in the main Menu component.</caption>
     * FSBL.Clients.WorkspaceClient.rename({
     * 	oldName: 'My Workspace',
     * 	newName: 'The best workspace',
     * 	removeOldWorkspace: true,
     * }, function(err, response) {
     * 	//Do something.
     * });
     */
    rename(params: {
        oldName: string;
        newName: string;
        removeOldWorkspace?: boolean;
        overwriteExisting?: boolean;
    }, cb?: Function): Promise<{}>;
    /**
     * Makes a clone (i.e. copy) of the workspace.  The active workspace is not affected.
     * @private
     * @param {object} params
     * @param {string} params.name Name of workspace to clone.
     * @param {string} params.newName Name of workspace to clone.
     * @param {function} cb cb(err,response) with response set to the name of the cloned workspace if no error
     * @example <caption>This method is used to clone workspaces. </caption>
     * FSBL.Clients.WorkspaceClient.clone({
     * 	name: 'The best workspace'
     * }, function(err, response) {
     * 	//Do something.
     * });
     */
    clone(params: {
        name: string;
        newName: string;
        removeOldWorkspace?: boolean;
    }, cb?: Function): Promise<{}>;
    /**
     * Saves the currently saved workspace. Changes to the <code>activeWorkspace</code> are made on every change automatically.
     * @param {function} cb The callback to be invoked after the method completes successfully.
     * @example <caption>This function persists the currently active workspace.</caption>
     * FSBL.Clients.WorkspaceClient.save(function(err, response) {
     * 	//Do something.
     * });
     */
    save(cb?: Function): Promise<{}>;
    /**
     * Helper that tells us whether a workspace with this name exists.
     * @private
     */
    workspaceExists(workspaceName: any): boolean;
    /**
     *
     * Saves the currently active workspace with the provided name.
     * @param {object} params
     * @param {string} params.name The new name you want to save the workspace under.
     * @param {string} params.force Whether to overwrite a workspace already saved with the provided name.
     * @param {function} cb The callback to be invoked after the method completes successfully.
     * @example <caption>This function persists the currently active workspace with the provided name.</caption>
     * FSBL.Clients.WorkspaceClient.saveAs({
     * 	name: 'My Workspace',
     * }, function(err, response) {
     * 	//Do something.
     * });
     */
    saveAs(params: {
        name?: string;
        force: boolean;
    }, cb?: Function): Promise<{}>;
    /**
     * Switches to a workspace.
     * @param {object} params
     * @param {string} 	params.name The name of the workspace you want to switch to.
     * @param {function} cb The callback to be invoked after the method completes successfully.
     * @example <caption>This function loads the workspace 'My Workspace' from the storage tied to the application.</caption>
     * FSBL.Clients.WorkspaceClient.switchTo({
     * 	name: 'My Workspace',
     * }, function(err, response) {
     * 	//Do something.
     * });
     */
    switchTo(params: {
        name: string;
    }, cb?: Function): Promise<{
        data: Workspace;
    }>;
    /**
     * @private
     * ALPHA - Subject to breaking change in coming minor releases.
     * Sets the stored state of a given window in the active workspace. `state` may include
     * keys for `windowData`, `componentState`, or both; the state of each key will be completely
     * overwritten by the provided state. If the update results in dirtying change, the active
     * workspace will be marked dirty (or, if autosave is on, persisted directly to storage).
     */
    _setWindowState(params: {
        windowName: string;
        state: Partial<CompleteWindowState>;
    }): Promise<RouterResponse<boolean>>;
    /**
     * @private
     * ALPHA - Subject to breaking change in coming minor releases.
     * Retrieves the given window from storage, retrieving the requested state variables
     * (`"componentState"` and/or `"windowData"`).
     */
    _getWindowState(params: {
        windowName: string;
        stateVars: StateType[];
    }): Promise<RouterResponse<Partial<CompleteWindowState>>>;
    /**
     * Checks to see if the workspace is dirty, i.e., if its state has been changed since the last save. If it's already dirty, the window doesn't need to compare its state to the saved state.
     *
     * @param {Function} cb <code>cb(err,response)</code> with response set to true if dirty and false otherwise (when no error).
     *
     * @example <caption>This function will let you know if the <code>activeWorkspace</code> is dirty.</caption>
     * FSBL.Clients.WorkspaceClient.isWorkspaceDirty(function(err, response) {
     * 		//Do something like prompt the user if they'd like to save the currently loaded workspace before switching.
     * });
     */
    isWorkspaceDirty(cb: any): Promise<{}>;
    /**
     * Creates a new workspace, returning a promise for the final name of
     * the new workspace as a string. After creation, if "switchAfterCreation" is true,
     * the new workspace becomes the active workspace.
     *
     * If the requested name already exists, a new workspace will be created
     * with the form "[name] (1)" (or "[name] (2)", etc.)
     *
     * @param {String} workspaceName Name for new workspace.
     * @param {Object} params Optional params
     * @param {boolean} params.switchAfterCreation Whether to switch to the new workspace after creating it.
     * @param {Function} cb <code>cb(err,response)</code> With response, set to new workspace object if no error.
     * @example <caption>This function creates the workspace 'My Workspace'.</caption>
     * FSBL.Clients.WorkspaceClient.createWorkspace(function(err, response) {
     *		if (!err) {}
     *			//Do something like notify the user that the workspace has been created.
     *		}
     * });
     */
    createWorkspace(workspaceName: any, params: {
        switchAfterCreation?: boolean;
    }, cb?: (err: any, result: {
        workspaceName: string;
    }) => void): Promise<{
        workspaceName: string;
    }>;
    /**
     * @private
     */
    createNewWorkspace: (workspaceName: any, params: {
        switchAfterCreation?: boolean;
    }, cb?: (err: any, result: {
        workspaceName: string;
    }) => void) => Promise<{
        workspaceName: string;
    }>;
    /**
     * Gets a workspace definition in JSON form.
     *
     * @param {object} params
     * @param {string} params.workspaceName The name of the workspace you want to export.
     * @param {function} cb <code>callback(error, workspaceDefinition)</code>
     * @example <caption>FSBL.Clients.WorkspaceClient.export({'workspaceName:': 'linker'}, function(err, worskpaceDefinition) {
     *
     * //do something with the workspace definition
     * })'; </caption>
     */
    export(params: {
        workspaceName: string;
    }, cb: any): Promise<{}>;
    getWorkspaceDefinition: (params: {
        workspaceName: string;
    }, cb: any) => Promise<{}>;
    /**
     * Adds a workspace definition to the list of available workspaces.
     *
     * @param {object} params
     * @param {object} params.workspaceJSONDefinition JSON for workspace definition
     * @param {boolean} params.force Whether to overwrite any workspace of the same name that already exists
     * @param {function=} cb <code>cb(err)</code> where the operation was successful if !err; otherwise, err carries diagnostics
     *
     */
    import(params: {
        workspaceJSONDefinition: Record<string, Workspace | string>;
        force: boolean;
    }, cb?: any): Promise<Record<string, string>>;
    addWorkspaceDefinition: (params: {
        workspaceJSONDefinition: Record<string, string | Workspace>;
        force: boolean;
    }, cb?: any) => Promise<Record<string, string>>;
    /**
     * Saves one mor more template defintions in a selected file. Note the
     * end user is prompted to identify file location during this save
     * operation. The file can optionally be imported during config
     * initialization (see importConfig) although this requires administration
     * support on the configuration/server side. The file can also be read
     * using readWorkspaceTemplateFromConfigFile();
     *
     * @param {object} params
     * @param {object} params.workspaceTemplateDefinition legal template definition returned by either
     * getWorkspaceTemplateDefinition() or convertWorkspaceDefinitionToTemplate()
     * @private
     */
    exportToFile(params: {
        workspaceTemplateDefinition: any;
    }): void;
    saveWorkspaceTemplateToConfigFile: (params: {
        workspaceTemplateDefinition: any;
    }) => void;
    /**
     * Initializes listeners and sets default data on the WorkspaceClient object.
     * @private
     */
    start(cb: any): Promise<void>;
}
declare var workspaceClient: WorkspaceClient;
export default workspaceClient;
