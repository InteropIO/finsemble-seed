import { TOGGLE_CHANNEL } from "../actionTypes";

const toggleChannel = (id) => {
    return {
        type: TOGGLE_CHANNEL,
        payload: {
            id
        }
    };
};

export default {
    toggleChannel
};