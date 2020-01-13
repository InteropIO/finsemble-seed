import { TOGGLE_CHANNEL_REQUEST, TOGGLE_CHANNEL_SUCCESS, TOGGLE_CHANNEL_FAILURE } from "../actionTypes";

// Function signature to expose to the client
const toggleChannel = (id) => {
    return {
        type: TOGGLE_CHANNEL_REQUEST,
        payload: {
            id
        }
    };
};

// Function signatures to use internally
const toggleSuccess = (id) => {
    return {
        type: TOGGLE_CHANNEL_SUCCESS,
        payload: {
            id
        }
    };
};
const toggleFailure = () => {
    return {
        type: TOGGLE_CHANNEL_FAILURE
    };
};

export {
    toggleChannel,
    toggleSuccess,
    toggleFailure
};