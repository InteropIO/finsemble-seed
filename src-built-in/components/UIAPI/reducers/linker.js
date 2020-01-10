import { loop, Cmd } from 'redux-loop';
import { TOGGLE_CHANNEL } from "../actionTypes";
import { Store, Actions } from "../../linker/src/stores/linkerStore";

const initialState = {
    channels: [
        {
            id: 0,
            color: 'yellow',
            name: 'channel 1',
            active: true,
        },
        {
            id: 1,
            color: 'purple',
            name: 'channel 2',
            active: false,
        }
    ],
    allChannelIds: [0, 1]
};

function linkChannel(channelName) {
    // let attachedWindowIdentifier = Store.getAttachedWindowIdentifier();
    // FSBL.Clients.LinkerClient.linkToChannel(channelName, attachedWindowIdentifier);
    console.log("linkChannel function ran with ", channelName);
}

// Individual channel's reducer
const channel = (state, action) => {
    switch (action.type) {
        case TOGGLE_CHANNEL:
            if (state.id === action.payload.id) {
                const newState = {
                    ...state,
                    active: !state.active
                }
               return newState
            }
            return state;
        default:
            return state;
    }
};

// The linker's reducer
export default function(state = initialState, action) {
    switch (action.type) {
        case TOGGLE_CHANNEL:
            const newState = {
                ...state,
                channels: state.channels.map(c => channel(c, action))
            };
             // Side effect to link/unlink the channel
            const cmd = Cmd.run(linkChannel, {
                args: ["test"]
            });

            console.log("after cmd.run");
            return loop(newState, cmd);
        default:
            return state;
    }
}