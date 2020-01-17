import { 
    TOGGLE_CHANNEL_REQUEST, 
    TOGGLE_CHANNEL_SUCCESS, 
    TOGGLE_CHANNEL_FAILURE,
    LINKER_INIT,
    LINKER_INIT_SUCCESS,
    LINKER_CLEANUP,
    UPDATE_ACTIVE_CHANNELS
} from "../actionTypes";

// Functions signature to expose to the client
const toggleChannel = (channelID: number) => {
    return {
        type: TOGGLE_CHANNEL_REQUEST,
        payload: {
            channelID
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
const toggleSuccess = (channelID: number) => {
    return {
        type: TOGGLE_CHANNEL_SUCCESS,
        payload: {
            channelID
        }
    };
};
const toggleFailure = () => {
    return {
        type: TOGGLE_CHANNEL_FAILURE
    };
};
const initSuccess = (value: object) => {
    return {
        type: LINKER_INIT_SUCCESS,
        payload: {
            value
        }
    };
};

interface channelUpdateReturnObject {
    channels: object;
    windowIdentifier: object
}

const updateActiveChannels = (value: channelUpdateReturnObject) => {
    return {
        type: UPDATE_ACTIVE_CHANNELS,
        payload: {
            updatedActiveChannels: value.channels,
            updatedWindowIdentifier: value.windowIdentifier
        }
    };
};



export {
    toggleChannel,
    toggleSuccess,
    toggleFailure,
    updateActiveChannels,
    init,
    initSuccess,
    cleanUp
};