import { TOGGLE_CHANNEL } from "../actionTypes";

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

// Individual channel's reducer
const channel = (state, action) => {
    switch (action.type) {
        case TOGGLE_CHANNEL:
            if (state.id !== action.payload.id) {
                return state;
            }
            return {
                ...state,
                active: !state.active
            };
        default:
            return state;
    }
};

// The linker's reducer
export default function(state = initialState, action) {
    switch (action.type) {
        case TOGGLE_CHANNEL:
            return {
                ...state,
                channels: state.channels.map(c => channel(c, action))
            };
        default:
            return state;
    }
}