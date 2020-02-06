import { LinkerState, LinkerAction, ActionTypes, Channel } from '../types';
import withLogging from '../hoReducers/logging';
import produce from "immer";

// The linker state before we initialize the linker. The initialize linker function will make calls to the LinkerClient and 
// fill in the state with the relevant linker information.
export const initialState: LinkerState = {
    channels: {},
    isAccessibleLinker: true,
    windowIdentifier: {}
};

// The linker's reducer
const reducer = (state = initialState, action: LinkerAction) =>
    produce(state, (draft: LinkerState) => {
        const { type, payload } = action;
        switch (type) {
            case ActionTypes.UPDATE_CHANNEL_STATUS:
                const { channelId, active }: any = payload;
                draft.channels[channelId].active = active;
                break;

            case ActionTypes.SET_CHANNELS:
                let { channels }: any = payload;
                draft.channels = channels.map((channel: Channel, index: number) => {
                    return {
                        id: index,
                        name: channel.name,
                        color: channel.color,
                        border: channel.border,
                        active: false
                    }
                });
                break;

            case ActionTypes.UPDATE_ACTIVE_CHANNELS:
                const { channelNames, windowIdentifier }: any = payload;
                draft.windowIdentifier = windowIdentifier;
                for (const channel of Object.values(draft.channels)) {
                    channel.active = channelNames.includes(channel.name)
                }
                break;

            case ActionTypes.SET_ACCESSIBILITY:
                const { isAccessibleLinker }: any = payload;
                draft.isAccessibleLinker = isAccessibleLinker;
                break;
        }
    })

export const linker = withLogging("Linker", reducer);