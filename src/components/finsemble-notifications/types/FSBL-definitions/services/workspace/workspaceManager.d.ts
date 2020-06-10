import { Workspace, ActiveWorkspace, WorkspaceImport, GroupData } from '../../common/workspace';
import { WindowStorageManager, CompleteWindowState, StateType } from "../../common/windowStorageManager";
import { FinsembleWindowData } from "../../common/FinsembleWindowData";
/** If, for whatever reason, there are no configured workspaces
 * use this instead. Also used when workspace times out.
 */
export declare const emptyWS: WorkspaceImport;
/**
 * A trace object passed through the call chain
 * to better debug events as they proceed through
 * the layers of the service.
 *
 * See notes in WorkspaceService as to why this is necessary.
 *
 * NOTE: DO NOT JUST MAKE UP A TRACE. The WorkspaceService
 *
 * This should probably be moved to ./src/common at some point.
 */
declare type Trace = {
    /** A unique counter incremented on each API request. */
    counter: number;
    /** The reason for the API (typically the name API channel). */
    reason: string;
};
/**
 * Given either a workspace name or a workspace object,
 * returns the storage key for that workspace.
 * @param worksapce A workspace object or the name of a workspace.
 */
export declare const getWorkspaceStorageKey: (worksapce: string | Workspace) => string;
/**
 * Given a requested workspace name and the list of existing workspace
 * names, returns the name with "(n)" appended to it, where n is the
 * number of prior names with the same pattern.
 *
 * NOTE - this function assumes the requested name already exists in the
 * list of workspace names.
 *
 * See tests for more examples.
 *
 * @example
 * getNextWorkspaceName("foo", ["foo"]) // => "foo (1)"
 * getNextWorkspaceName("bar", ["bar", "bar (1)"]) // => "bar (2)"
 */
export declare function getNextWorkspaceName(name: string, workspaceNames: string[]): string;
export declare const NOT_INITIALIZED = "You must wait for the Workspace Manager to initialize before taking this action.";
export declare const REMOVE_ACTIVE_WORKSPACE = "You cannot remove the active workspace";
export declare const SET_ORDER_ERROR: (oldOrder: any) => string;
export declare const WORKSPACE_NOT_FOUND: (ws: any) => string;
export declare const NOT_VALID_WIN_NAME: (win: any) => string;
export declare const NO_ACTIVE_WORKSPACE = "Attempt to interact with the active workspace before an active workspace was set.";
/**
 * Static class for interacting with workspace storage.
 *
 * WorkspaceManager is an ORM-like interface into the storage
 * service as it pertains to workspaces. It enforces consistency
 * and our business logic around workspaces; as such, all
 * interactions with storage pertaining to workspace should
 * be run through this class.
 *
 * WorkspaceManager provides three kinds of functions:
 * a) functions for dealing with individual workspaces (such as adding windows,
 * setting the group data, etc.)
 * b) functions for working on the set of workspaces (adding workspaces,
 * removing, renaming, etc.)
 * c) functions for dealing with a special workspace called the active workspace,
 * which gets its own location and storage, and has a special isDirty property
 * that is handled by the WorkspaceManager.
 *
 * All three of these are similar and coupled enough to warrant handling in
 * the same class; but the WorkspaceManager should never grow beyond this scope.
 *
 * DH 3/11/2019
 * Because the class is static, it could technically be safely
 * imported and used from anywhere; however, at present, only
 * the workspace service uses the manager, and it will likely
 * stay this way until Workspaces are stored in a reactive store
 * like the upcoming Persistent Store.
 *
 * A Note on Performance:
 * WorkspaceManager doesn't cache anything, which necessitates many
 * round trips to the StorageService despite no changes in data. In
 * my own testing, I haven't seen this to be an issue; however, if
 * client's storage implementation is very slow, it could feasably
 * create some drag (though I doubt it would  be the bottleneck). At
 * the cost of added complexity, a caching mechanism could be added
 * overtop the functions without changing their API. However, I think
 * a reactive store like the Persistent store is a better answer to
 * this problem - it's simpler (no extra caching logic specific to
 * workspaces), more flexible (provides new ways for clients to
 * interact with the data), and more performant (entirely push based,
 * instead of pull).
 */
export declare class WorkspaceManager {
    /**
     * If true, the active workspace is saved to
     * the store on every update.
     */
    static autosave: boolean;
    /**
     * Daniel H. - 2/26/2019
     * There is some bizarre effect whereby the fake store
     * doesn't get reset correctly unless you manually set the
     * reference before each test. For this reason alone, I had
     * to make StorageClient and WindowStorageManager public
     * members; I would much rather just reference them directly
     * since they're singletons.
     *
     * Note, the WindowStorageManger suffers this same problem
     * under test.
     */
    static _SC: import("../../../../../../../../Users/CWatson/CIQDev/_FINSEMBLE/finsemble/src/clients/storageClient").StorageClient;
    static _WS: typeof WindowStorageManager;
    private static fsblUuid;
    /**
     * Given window data, gets a new name for a window.
     *
     * Windows coming from workspace configuration may not have a name; we
     * must therefore add one with the same naming scheme used by Launcher.
     */
    private static getNewWindowName;
    /**
     * Adds a workspace to the system, persisting it to storage. If the requested
     * name is already in use and "force" is set to be false, a workspace with a different
     * name will be generated.
     *
     * Returns the final name of the workspace in storage as a string.
     */
    static addWorkspace(trace: Trace, ws: Workspace, force?: boolean): Promise<string>;
    /**
     * NOTE! This bypasses the set-dirty logic. For most operations, just use
     * the public updateWorkspace method (you can even omit the workspace name
     * to automatically target the active workspace).
     */
    private static updateActiveWorkspace;
    static setActiveWorkspaceDirty(trace: Trace): Promise<void>;
    static setActiveWorkspaceClean(trace: Trace): Promise<void>;
    /**
     * Converts window data from the previous versions of Finsemble
     * to the current version. Should only be used by importWorkspace.
     *
     * @param windowData An object that will be formatted to a `FinsembleWindowDatas` object
     * NOTE! This this object should be compatible!
     */
    private static formatWindow;
    /**
     * Imports workspace data into storage.
     *
     * This data can be in any of the supported data format versions, and the necessary
     * transformations will be applied automatically (see the `formatWindow`).
     *
     * @param workspace A workspace import object, a string representing a workspace import
     * object as JSON.
     */
    static importWorkspace(trace: Trace, workspace: string | WorkspaceImport, force?: boolean): Promise<string>;
    /**
     * Retrieves the given workspace from storage.
     * @param workspaceName The name of the workspace to retrieve.
     */
    static getWorkspace(trace: Trace, workspaceName: string): Promise<Workspace>;
    /**
     * Exports a workspace from storage in `WorkspaceImport` foramt.
     * @param workspaceName The name of the workspace to retrieve from storage.
     */
    static exportWorkspace(trace: Trace, workspaceName: string): Promise<WorkspaceImport>;
    /**
     * Retrieves all workspaces from storage.
     */
    static getWorkspaces(trace: Trace): Promise<Workspace[]>;
    /**
     * Retrieves the names of all workspaces in storage.
     */
    static getWorkspaceNames(trace: Trace): Promise<string[]>;
    /**
     * Retrieves the state of active workspace from storage.
     */
    static getActiveWorkspace(trace: Trace): Promise<ActiveWorkspace>;
    /**
     * Returns a boolean indicating whether an active workspace has been set.
     */
    static doesActiveWorkspaceExist(trace: Trace): Promise<boolean>;
    /**
     * Returns a boolean indicating whether the active workspace is
     * currently dirty.
     */
    static isActiveWorkspaceDirty(trace: Trace): Promise<boolean>;
    /**
     * Sets the active workspace to the workspace with the given name.
     * Returns the value of that workspace as a promise.
     *
     * @param workspaceName The name of the workspace in storage to
     * make the active workspace.
     */
    static setActiveWorkspace(trace: Trace, workspaceName: string): Promise<ActiveWorkspace>;
    /**
     * Saves the state of active workspace into storage, overwriting
     * what state was there under the workspace with the same as the
     * active workspace.
     *
     * No-ops if the active workspace isn't dirty.
     */
    static saveActiveWorkspace(trace: Trace): Promise<void>;
    /**
     * Saves the current state of the active workspace as a new workspace
     * with the given name.
     *
     * @param name The new name of the workspace. If the same as the
     * active workspace, the active workspace will merely be saved
     * If force is false, a new name will be generated from the given
     * name and used instead.
     *
     * @param force Forces an overwrite of a workspace with the same name.
     */
    static saveActiveWorkspaceAs(trace: Trace, name: string, force: boolean): Promise<string>;
    /**
     * Adds a new, empty workspace to storage with the given name
     * and returns the final name used (if the name already exists,
     * a new name will generated using the standard nameing scheme
     * (see `getNextWorkspaceName`).
     */
    static newWorkspace(trace: Trace, workspaceName: string): Promise<string>;
    /**
     * Changes the name of the workspace with `oldName` to `newName`.
     * If `newName` already exists, a new name will be generated using
     * the standard naming scheme (see `getNextWorkspaceName`).
     *
     * If the names are the same, the method is a no-op.
     */
    static renameWorkspace(trace: Trace, newName: string, oldName: string): Promise<string>;
    /**
     * Removes the workspace from storage.
     *
     * NOTE: you cannot remove the active workspace.
     * @param workspaceName The name of the workspace to remove.
     */
    static removeWorkspace(trace: Trace, workspaceName: string): Promise<void>;
    /**
     * Searches for a workspce that fuzzy-matches the given string.
     * Returns results according to
     * https://documentation.chartiq.com/finsemble/tutorial-Search.html
     *
     * @param s The string to fuzzy match against the workspace names.
     */
    static searchWorkspaces(trace: Trace, s: string): Promise<{
        item: number;
        matches: {
            indices: any;
            value: string;
        }[];
        score: number;
    }[] | {
        score: number;
        matches: {
            indices: any;
            value: string;
        }[];
        name: string;
        type: string;
        description: string;
        actions: {
            name: string;
        }[];
        tags: any[];
    }[]>;
    /**
     * Gets the "finsemble.workspaceSearch" configuration, merges it with the default and returns the combined object.
     *
     * @param {Trace} trace Unused for now - Debug trace
     * @returns {Promise<any>} Returns a workspace config object
     */
    static getWorkspaceSearchConfig(trace: Trace): Promise<any>;
    /**
     * Updates the state of a workspace in storage by retrieving the current state,
     * applying the given transformation function, and setting the state to the result.
     * Omit `workspaceName` to target the active workspace.
     *
     * If autosave is on and you are targeting the active workspace, the new state of the
     * active workspace will automatically be persisted to permanent storage.
     *
     * @param updateFn A function that accepts a workspace and returns a transformed workspace.
     * @param workspaceName The name of the workspace to update.
     *
     * DH 3/11/2019
     * It would be nice if this function no-oped if there were no difference between the
     * current state and the resulting state. This would eliminate some of the code in methods
     * that use this function.
     */
    private static updateWorkspace;
    /**
     * Updates the state of a window in storage by retrieving the current state,
     * applying the given transformation function, and setting the state to the result.
     *
     * If this results in a change, the active workspace will be dirtied (or the change
     * will be persisted to permanant storage if autosave is on).
     *
     * DH 5/21/2019 @TODO This is a complex function, with an exception type
     * (if called before an active workspace is set), and 3 possible
     * exits: if the states are totally equal, if the states are equal after
     * removing cruft keys, and if the states are genuinely different. This
     * is a code smell for sure, but will require larger refactorings in
     * stacks/assimilated windows (or some other architectural change) before
     * we can safely remove these checks.
     */
    static updateWindowState(trace: Trace, stateVar: StateType, updateFn: any, windowName: string): Promise<void>;
    /**
     * Given a window state, persists that window state to the active workspace storage.
     * NOTE: This completely clobbers any existing state for that window.
     *
     * If this results in a change, the active workspace will be dirtied (or the change
     * will be persisted to permanant storage if autosave is on).
     */
    static setWindowState(trace: any, windowName: any, state: Partial<CompleteWindowState>): Promise<void>;
    /**
     * Adds a window to a given workspace.
     * Omit `workspaceName` to target the active workspace.
     */
    static addWindowToWorkspace(trace: Trace, win: FinsembleWindowData | string, workspaceName?: string): Promise<void>;
    /**
        * Removes a window from a given workspace.
        * Omit `workspaceName` to target the active workspace.
        */
    static removeWindowFromWorkspace(trace: Trace, windowName: string, workspaceName?: string): Promise<void>;
    /**
     * Sets the group data of a given workspace.
     * Omit the `workpaceName` to target the active worksapce.
     *
     * DH 3/11/2019
     * Note the lack of fine-grained control here compared to
     * the other workspace functions (i.e Windows, which you can
     * add and remove individually). I think this is an indication
     * this method doesn't belong here.
     *
     * @param groups An object where the keys are the group guids and the
     * values are the group data objects.
     */
    static setGroupData(trace: Trace, guid: string, groups: Record<string, GroupData>, workspaceName?: any): Promise<void>;
    /**
     * Sets the order of workspaces in storage to the given order.
     * Used to control the order of the names as they appear in Finsemble's UI.
     */
    static setWorkspaceOrder(trace: Trace, newOrder: string[]): Promise<void>;
    /**
     * Transitions pre-3.9 workspace storage schemes to the new scheme,
     * by pulling in workspaces from the old storage key, "fsblWorkspaces",
     * and also adding a guid to the active workspace.
     */
    static importLegacyWorkspaces(trace: any): Promise<void>;
}
export {};
