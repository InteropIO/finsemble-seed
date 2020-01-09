import { TOGGLE_CHANNEL } from "../actionTypes";

const toggleLinker = (id) => {
    return {
        type: TOGGLE_CHANNEL,
        payload: {
            id
        }
    };
};

export default {
    toggleLinker
};