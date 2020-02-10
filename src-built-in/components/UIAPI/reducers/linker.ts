import { LinkerState, ACTION_TYPES, actions, Channel } from '../types';
import withLogging from '../hoReducers/logging';
import produce from "immer";

// The linker state before we initialize the linker. The initialize linker function will
// make calls to the LinkerClient and
// fill in the state with the relevant linker information.
export const initialState: LinkerState = {
    channels: {},
    isAccessibleLinker: true,
    windowIdentifier: {}
};
// The linker's reducer
const reducer = (state = initialState, action: ACTION_TYPES) => {
    return produce(state, (draft: LinkerState) => {
        actions.match(action, {
            UPDATE_CHANNEL_STATUS: ({ channelId, active }) => {
                draft.channels[channelId].active = active;
            },
            SET_CHANNELS: ({ channels }) => {
                draft.channels = channels.map((channel: Channel, index: number) => {
                    return {
                        id: index,
                        name: channel.name,
                        color: channel.color,
                        border: channel.border,
                        active: false,
                    }
                });
            },
            UPDATE_ACTIVE_CHANNELS: ({ channelNames, windowIdentifier }) => {
                const channelNameArray = Object.values(channelNames).map(obj => obj.name);
                draft.windowIdentifier = windowIdentifier;
                for (const channel of Object.values(draft.channels)) {
                    channel.active = channelNameArray.includes(channel.name);
                }
            },
            SET_ACCESSIBILITY: ({ isAccessibleLinker }) => {
                draft.isAccessibleLinker = isAccessibleLinker;
            },
            default: a => draft,
        });
    });
};

export const linker = reducer;
