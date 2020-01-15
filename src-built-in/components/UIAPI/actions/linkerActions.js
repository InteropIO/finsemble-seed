import { 
    TOGGLE_CHANNEL_REQUEST, 
    TOGGLE_CHANNEL_SUCCESS, 
    TOGGLE_CHANNEL_FAILURE,
    LINKER_INIT,
    LINKER_INIT_SUCCESS,
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
const toggleSuccess = (id, value) => {
    return {
        type: TOGGLE_CHANNEL_SUCCESS,
        payload: {
            id,
            value
        }
    };
};
const toggleFailure = () => {
    return {
        type: TOGGLE_CHANNEL_FAILURE
    };
};
const initSuccess = (value) => {
    return {
        type: LINKER_INIT_SUCCESS,
        payload: {
            value
        }
    };
};

export {
    toggleChannel,
    toggleSuccess,
    toggleFailure,
    init,
    initSuccess,
    cleanUp
};