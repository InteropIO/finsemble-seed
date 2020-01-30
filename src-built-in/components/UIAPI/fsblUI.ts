// Type definitions for Finsemble UI API 1.0.0

/** Define the global object */
declare global {
    const FSBL: any;
    const finsembleWindow: any;
    interface Window {
        FSBL: any,
    }
}

 /** All available action types */
 export enum ActionTypes {
    TOGGLE_CHANNEL_REQUEST = "TOGGLE_CHANNEL_REQUEST",
    TOGGLE_CHANNEL_SUCCESS = "TOGGLE_CHANNEL_SUCCESS",
    TOGGLE_CHANNEL_FAILURE = "TOGGLE_CHANNEL_FAILURE",
    LINKER_INIT = "LINKER_INIT",
    LINKER_INIT_SUCCESS = "LINKER_INIT_SUCCESS",
    LINKER_CLEANUP = "LINKER_CLEANUP",
    UPDATE_ACTIVE_CHANNELS = "UPDATE_ACTIVE_CHANNELS"
}

/**
 * The root state of the finsemble UI API. It is composed of different states from
 * different components.
 */
export interface RootState {
    linker: Linker
}

/**
 * Linker component type definition
 */
export interface Linker {
    /* The linker channels */
    channels: Channels,
    /* The map of linker name -> linker channel ID */
    nameToId: NameToId,
    /* Default to true. If the linker is an accessible linker, its channel labels will be shown along with the color indicators */
    isAccessibleLinker: boolean,
    /* The window identifier for the window that the linker component is on. They have one to one matching relationship */
    windowIdentifier: object,
    /* When the UI component is waiting for the response from the service, this will be set to 'true' */
    processingRequest: boolean
}
/**
 * The map of linker name -> linker channel ID
 */
export interface NameToId {
    [name: string]: number
}
/**
 * The map of linker channel ID -> linker channel
 */
export interface Channels {
    [id: number]: Channel
}
/**
 * The linker channel
 */
export interface Channel {
    /* The ID of the channel */
    id: number,
    /* The name of the channel */
    name: string,
    /* The color of the channel */
    color: string,
    /* Whether the channel is selected for a certain component or not. If selected, this field will be set to 'true' */
    active: boolean
}

/**
 * The Linker action object should always include the action type. If you wish to pass in
 * additional values to the reducer through the action, include it in the payload object.
 */
export interface LinkerAction {
    /* Action type */
    type: string,
    /* Action payload */
    payload?: {
        /* Any value you wish to pass to the reducer */
        value?: any,
        /* Linker's channel ID */
        channelID?: number,
        /* All the active channels for a certain component */
        updatedActiveChannels?: Array<object>,
        /* The window identifier for a certain component */
        updatedWindowIdentifier?: object
    }
}

/**
 * The active channels and the window identifier those channels belong to.
 * This value is used to update the linker component.
 */
export interface channelUpdateReturnObject {
    channels: Array<object>;
    windowIdentifier: object
}