import { actionTypes } from "../fsblUI";

/**
 * Generates the action to pass to the reducer to toggle a certain channel. This will trigger the call to
 * the LinkerClient to link/unlink the component to a certain channel. If it succeeds, the TOGGLE_CHANNEL_SUCCESS
 * action would be triggered.
 * @param {number} channelID A unique identifier for the channel to toggle
 */
const toggleChannel = (channelID: number) => {
    return {
        type: actionTypes.TOGGLE_CHANNEL_REQUEST,
        payload: {
            channelID
        }
    };
};

/**
 * Generates the action to pass to the reducer to initialize the linker. This will trigger the call to the 
 * LinkerClient to get the initial channels for the component and also setup the event listener to update
 * the channel if channel activities change.
 */
const init = () => {
    return {
        type: actionTypes.LINKER_INIT
    };
};

/**
 * Generates the action to pass to the reducer to clean up after the linker component unmounts.
 * This will clean up any attached event listeners on the linker window.
 */
const cleanUp = () => {
    return {
        type: actionTypes.LINKER_CLEANUP
    };
};

/**
 * This action creator will be triggered by the "toggleChannel" action creator. The TOGGLE_CHANNEL_SUCCESS
 * action will call the reducer to update the linker's state for the channel with `channelID` so that the
 * 'active' field for that channel is flipped.
 * @param {number} channelID A unique identifier for the channel to toggle
 */
const toggleSuccess = (channelID: number) => {
    return {
        type: actionTypes.TOGGLE_CHANNEL_SUCCESS,
        payload: {
            channelID
        }
    };
};

/**
 * This action creator will be triggered by the "toggleChannel" action creator if the LinkerClient errors during
 * linking/unlinking a channel.
 */
const toggleFailure = () => {
    return {
        type: actionTypes.TOGGLE_CHANNEL_FAILURE
    };
};

/**
 * This action creator will be triggered by the "init" action creator if the action succeeds. 
 * It takes in the updated linker state generated from the 'init' action and pass it in to the reducer for it to
 * update the state.
 * @param {object} value The updated linker state after the initialization
 */
const initSuccess = (value: object) => {
    return {
        type: actionTypes.LINKER_INIT_SUCCESS,
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
        type: actionTypes.UPDATE_ACTIVE_CHANNELS,
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