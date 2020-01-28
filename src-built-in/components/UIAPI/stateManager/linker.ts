import produce from 'immer';

import { Linker, LinkerAction, Channel } from '../fsblUI';

// Updates the channel's 'active' field
export const updateToggleChannelSuccessState = (originalState: Linker, payload: LinkerAction["payload"]) => {
    const toggleSuccessState = produce(originalState, draftState => {
        const channel = draftState.channels[payload.channelID];
        channel.active = !channel.active;
        draftState.processingRequest = false;
    });
    return toggleSuccessState;
}

// Update the channels' 'active' field and the windowIdentifier state information
// This is triggered by user switching linker window for different components.
export const updateActiveChannelsState = (originalState: Linker, payload: LinkerAction["payload"]) => {
    const { updatedActiveChannels, updatedWindowIdentifier } = payload;
    const activeChannelNames: any[string] = [];
    updatedActiveChannels.forEach((channel: Channel) => {
        activeChannelNames.push(channel.name);
    });
    const updatedChannel = Object.assign({}, originalState.channels);
    const channelIds: any[number] = Object.keys(updatedChannel);
    channelIds.forEach((channelId: number) => {
        if (activeChannelNames.includes(updatedChannel[channelId].name)) {
            updatedChannel[channelId].active = true;
        } else {
            updatedChannel[channelId].active = false;
        }
    });
    const updateChannelsState = {
        ...originalState,
        channels: updatedChannel,
        windowIdentifier: updatedWindowIdentifier
    };

    return updateChannelsState;
}