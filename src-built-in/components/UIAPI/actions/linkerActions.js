import { 
    TOGGLE_CHANNEL_REQUEST, 
    TOGGLE_CHANNEL_SUCCESS, 
    TOGGLE_CHANNEL_FAILURE,
    LINKER_INIT,
    LINKER_CLEANUP
} from "../actionTypes";

// Functions signature to expose to the client
const toggleChannel = (id) => {
    return {
        type: TOGGLE_CHANNEL_REQUEST,
        payload: {
            id
        }
    };
};
const init = () => {
    return {
        type: LINKER_INIT
    };
};
const cleanUp = () => {
    return {
        type: LINKER_CLEANUP
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
    toggleFailure,
    init,
    cleanUp
};