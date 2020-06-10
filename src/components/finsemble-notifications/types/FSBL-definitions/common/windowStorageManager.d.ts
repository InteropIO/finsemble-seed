import { FinsembleWindowData } from "./FinsembleWindowData";
export declare const GET_WINDOW_STATE_ERROR: (win: string, ws?: string) => string;
export declare type StateType = "windowData" | "componentState";
/**
 * Represents both `windowData` (the window's size, position, url, etc.),
 * and `componentState` (logical data representing linking, custom
 * integerations, etc.)
 */
export declare type CompleteWindowState = {
    windowData: FinsembleWindowData;
    componentState: Record<string, any>;
};
/**
 * Static, ORM-like layer into the storage of all `windowData`
 * and `componentState` data, mediating interface with storage
 * while enforcing consistency and business rules.
 */
export declare class WindowStorageManager {
    /**
     * This static member is necessary for testing purposes
     * only. Ideally, we would just use the StorageClient
     * instance directly; however, this causes inconsistencies
     * with our mocks that failed our testing efforts.
     */
    static _SC: import("../../../../../../../Users/CWatson/CIQDev/_FINSEMBLE/finsemble/src/clients/storageClient").StorageClient;
    static getWindowID: (win: FinsembleWindowData) => string;
    /**
     * Given a type, window, and workspace name, returns the correct storage topic and key
     * for the `windowData` or `componentState`.
     * Omit the workspace name to target the active workspace.
     */
    static getTopicAndKey(type: StateType, windowName: string, workspaceName?: string): {
        topic: string;
        key: any;
    };
    /**
     * Retrieves a window or component state belonging to the given workspace from storage.
     * Omit the workspace name to target the active workspace.
     *
     * @param type Either `componentState` or `windowData`.
     */
    static getState(type: StateType, windowName: string, workspaceName?: string): Promise<FinsembleWindowData | Record<string, any>>;
    /**
     * Same as `getState` but retrieves both `componentState` and `windowData`.
     * NOTE: either or both of windowData may be null or emtpy objects (i.e, when
     * the requested data doesn't exist).
     */
    static getCompleteState(windowName: string, workspaceName?: string): Promise<CompleteWindowState>;
    /**
     * Retrieves multiple states (`componentState` or `windowData`) belonging to the given workspace from storage.
     * Omit the workspace name to target the active workspace.
     *
     * It's possible to request a window state before it's been saved to storage particularly.
     * if the window was added to a workspace by name (not by data). Therefore, unlike `getState`,
     * this method doesn't throw errors if unable to fulfill the request; rather, it logs a warning instead.
     *
     * @param type Either `componentState` or `windowData`.
     */
    static getManyStates(type: StateType, windowNames: string[], workspaceName?: string): Promise<FinsembleWindowData[]>;
    /**
     * Same as `getManyStates` but retrieves both `componentState` and `windowData`.
     */
    static getManyCompleteStates(windowNames: string[], workspaceName?: string): Promise<CompleteWindowState[]>;
    /**
     * Persists a state to storage under the given workspace name.
     * Omit the workspace name to target the active workspace.
     *
     * @param type Either `componentState` or `windowData`.
     */
    static setState(type: StateType, windowName: string, data: FinsembleWindowData | Record<string, any>, workspaceName?: string): Promise<void>;
    /**
     * Same as `setState`, but sets both `componentState` and `windowData`.
     */
    static setCompleteState(state: CompleteWindowState, workspaceName?: string): Promise<void>;
    /**
     * Given an array of states, persists their states to storage.
     * Omit the workspace name to target the active workspace.
     *
     * @param type Either `componentState` or `windowData`.
     */
    static setManyStates(type: StateType, windows: FinsembleWindowData[], workspaceName?: string): Promise<void[]>;
    /**
     * Same as `setManyStates`, but sets both `componentState` and `windowData`.
     */
    static setManyCompleteStates(windows: CompleteWindowState[], workspaceName?: string): Promise<void[]>;
    /**
     * Given a window name and an update function, retrieves the state
     * under that name from storage, applies the update function to it, then sets
     * the storage with the result.
     * Omit the workspace name to target the active workspace.
     *
     * @param type Either `componentState` or `windowData`.
     */
    static updateState(type: StateType, updateFn: (window: FinsembleWindowData) => FinsembleWindowData, windowName: string, workspaceName?: any): Promise<void>;
    /**
     * Removes a window's state (both `componentState` and `windowData`) from storage under the
     * given workspace name. Omit the workspace name to target the active workspace.
     *
     * Logs a warning if unable to fulfill the request (doesn't throw).
     */
    static removeCompleteState(windowName: string, workspaceName?: string): Promise<void>;
    /**
     * Removes multiple states (both `componentState` and `windowData`) belonging to the given workspace from storage.
     * Omit the workspace name to target the active workspace.
     */
    static removeManyCompleteStates(windowNames: string[], workspaceName?: string): Promise<void[]>;
}
