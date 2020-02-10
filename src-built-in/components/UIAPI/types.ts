import { unionize, ofType, UnionOf } from 'unionize';

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
 export const actions = unionize({
    UPDATE_CHANNEL_STATUS: ofType<{channelId: number, active: boolean}>(),
    SET_CHANNELS: ofType<{channels: Channel[]}>(),
    UPDATE_ACTIVE_CHANNELS: ofType<{ channelNames: { name:string, color?: string, border?: string }[], windowIdentifier: any}>(),
    SET_ACCESSIBILITY: ofType<{ isAccessibleLinker: boolean }>(),
    SET_ACTIVE_WORKSPACE: ofType<{ name?: string }>()

}, {
    tag:'type',
    value:'payload'
});
export type ACTION_TYPES = UnionOf<typeof actions>;
export enum ActionTypes {
}

/**
 * The root state of the finsemble UI API. It is composed of different states from
 * different components.
 */
export interface RootState {
    linker: LinkerState,
    workspaces: WorkspaceState
}

/**
 * Workspace state definition.
 */
export interface WorkspaceState {
    /* Obj representing the active workspace */
    activeWorkspace: {
        /* Name of the active workspace */
        name: string
    }
}
/**
 * Linker component type definition
 */
export interface LinkerState {
    /* The linker channels */
    channels: Channels,
    /* Default to true. If the linker is an accessible linker, its channel labels will be shown along with the color indicators */
    isAccessibleLinker: boolean,
    /* The window identifier for the window that the linker component is on. They have one to one matching relationship */
    windowIdentifier: object
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
    active: boolean,
    /* The color of the channel's border */
    border: string
}



/**
 * The active channels and the window identifier those channels belong to.
 * This value is used to update the linker component.
 */
export interface channelUpdateReturnObject {
    channels: Array<object>;
    windowIdentifier: object
}

/**
 * The return object by calling LinkerClient.linkToChannel or LinkerClient.unlinkFromChannel.
 * "channels" contains an array of the current active channels after the linking, and "allChannels"
 * contains all the current channels given a linker window.
 */
export interface linkChannelReturnObject {
    channels: Array<object>;
    allChannels: Array<object>;
}