export declare const WRAPPERS: {
    EVENTS: string[];
};
export declare const APPLICATION_STATE_CHANNEL = "Finsemble.Application.State";
export declare const SERVICE_INITIALIZING_CHANNEL = "Finsemble.ServiceManager.serviceInitializing";
export declare const SERVICE_READY_CHANNEL = "Finsemble.ServiceManager.serviceReady";
export declare const SERVICE_CLOSING_CHANNEL = "Finsemble.ServiceManager.serviceClosing";
export declare const SERVICE_CLOSED_CHANNEL = "Finsemble.ServiceManager.serviceClosed";
export declare const SERVICES_STATE_CHANNEL = "Finsemble.State.Services";
export declare const WINDOWSTATE: {
    NORMAL: number;
    MINIMIZED: number;
    MAXIMIZED: number;
    HIDDEN: number;
};
export declare const SERVICE_START_CHANNEL = "Finsemble.Service.Start";
export declare const SERVICE_STOP_CHANNEL = "Finsemble.Service.Stop";
export declare const DOCKING: {
    GROUP_UPDATE: string;
    WORKSPACE_GROUP_UPDATE: string;
};
export declare const EVENT_INTERRUPT_CHANNEL = "Finsemble.Event.Interrupt";
export declare const INTERRUPTIBLE_EVENTS: string[];
export declare const REMOTE_FOCUS = "WindowService.remoteFocus";
export declare const WORKSPACE: {
    CLEAN_SHUTDOWN: string;
    UPDATE_PUBSUB: string;
    STORAGE_TOPIC: string;
    CACHE_STORAGE_TOPIC: string;
    ALL_WORKSPACES: string;
    ACTIVE_WORKSPACE: string;
    LAST_USED_WORKSPACE_TOPIC: string;
    LAST_USED_WORKSPACE: string;
    INITIAL_WORKSPACE_PREFERENCE: string;
    PUBLISH_REASONS: {
        INIT: string;
        LOAD_DATA_RETRIEVED: string;
        LOAD_FINISHED: string;
        WINDOW_REMOVED: string;
        WINDOW_ADDED: string;
        LOAD_STARTED: string;
        WORKSPACE_REMOVED: string;
        WORKSPACE_RENAMED: string;
        SWITCHTO_TERMINATED: string;
        NEW_WORKSPACE: string;
        SAVE_AS: string;
    };
    API_CHANNELS: {
        NEW_WORKSPACE: string;
        SAVE: string;
        RENAME: string;
        SAVE_AS: string;
        SWITCH_TO: string;
        IMPORT: string;
        EXPORT: string;
        REMOVE: string;
        SAVE_GLOBAL_DATA: string;
        SAVE_VIEW_DATA: string;
        GET_GLOBAL_DATA: string;
        GET_VIEW_DATA: string;
        GET_WORKSPACES: string;
        GET_WORKSPACE_NAMES: string;
        SET_WORKSPACE_ORDER: string;
        GET_ACTIVE_WORKSPACE: string;
        SET_ACTIVEWORKSPACE_DIRTY: string;
        GET_TEMPLATES: string;
        IMPORT_TEMPLATE: string;
        EXPORT_TEMPLATE: string;
        REMOVE_TEMPLATE: string;
        SET_WINDOW_STATE: string;
        GET_WINDOW_STATE: string;
        ADD_WINDOW: string;
        REMOVE_WINDOW: string;
    };
};
export declare const COMPONENT_STATE_STORAGE_TOPIC = "finsemble.componentStateStorage";
export declare const HEARTBEAT_TIMEOUT_CHANNEL = "Finsemble.WindowService.HeartbeatTimeout";
export declare const LAUNCHER_SERVICE: {
    WINDOW_CLOSED: string;
};
export declare const DELIVERY_MECHANISM: {
    PRELOAD: string;
    INJECTION: string;
};
export declare const MOVE_REASON: {
    AERO_KEY: string;
    SYSTEM_RESTORED: string;
};
