import { createStore } from "redux";
import rootReducer from "./reducers";
import { install } from "redux-loop";

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

export default createStore(rootReducer, initialState, install());