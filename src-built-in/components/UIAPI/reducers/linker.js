import { loop, Cmd, reduceReducers } from 'redux-loop';
import { TOGGLE_CHANNEL } from "../actionTypes";
import { Store } from "../../linker/src/stores/linkerStore";

const initialState = {
    channels: {
        0: {
            id: 0,
            color: '#8781BD',
            name: 'group1',
            active: true,
        },
        1: {
            id: 1,
            color: '#FFE035',
            name: 'group2',
            active: false,
        }
    },
    allChannelIds: [0, 1]
};

function linkChannel(channelName, isActive) {
    let attachedWindowIdentifier = Store.getAttachedWindowIdentifier();
    if (!isActive) return FSBL.Clients.LinkerClient.linkToChannel(channelName, attachedWindowIdentifier);
    FSBL.Clients.LinkerClient.unlinkFromChannel(channelName, attachedWindowIdentifier);
}

// The linker's reducer
const linker = (state = initialState, { type, payload }) => {
    switch (type) {
        case TOGGLE_CHANNEL:
            const newState = {
                ...state,
                channels: {
                    ...state.channels,
                    [payload.id]: {
                        ...state.channels[payload.id],
                        active: !state.channels[payload.id].active
                    }
                }
            };
            // Side effect to link/unlink the channel
            const cmd = Cmd.run(linkChannel, {
                args: [newState.channels[payload.id].name, newState.channels[payload.id].active]
            });

            return loop(newState, cmd);
        default:
            return state;
    }
}

export default linker;