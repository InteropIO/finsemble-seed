export interface RootState {
    linker: Linker
}

export interface Linker {
    channels: Channels,
    nameToId: NameToId,
    isAccessibleLinker: boolean,
    windowIdentifier: object,
    processingRequest: boolean
}

export interface NameToId {
    [name: string]: number
}

export interface Channels {
    [id: number]: Channel
}

export interface Channel {
    id: number,
    name: string,
    color: string,
    active: boolean
}

export interface LinkerAction {
    type: string,
    payload?: {
        value?: any,
        channelID?: number,
        updatedActiveChannels?: any,
        updatedWindowIdentifier?: any
    }
}