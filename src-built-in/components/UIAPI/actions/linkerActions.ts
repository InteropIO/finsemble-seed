import { ActionTypes, LinkerState, channelUpdateReturnObject } from "../types";

// /**
//  * Generates the action to pass to the reducer to toggle a certain channel. This will trigger the call to
//  * the LinkerClient to link/unlink the component to a certain channel. If it succeeds, the TOGGLE_CHANNEL_SUCCESS
//  * action would be triggered.
//  * @param {number} channelID A unique identifier for the channel to toggle
//  */
// const toggleChannel = (channelID: number) => {
//     return {
//         type: ActionTypes.TOGGLE_CHANNEL_REQUEST,
//         payload: {
//             channelID
//         }
//     };
// };

// /**
//  * Generates the action to pass to the reducer to initialize the linker. This will trigger the call to the 
//  * LinkerClient to get the initial channels for the component and also setup the event listener to update
//  * the channel if channel activities change.
//  */
// const init = () => {
//     return {
//         type: ActionTypes.LINKER_INIT
//     };
// };

// /**
//  * Generates the action to pass to the reducer to clean up after the linker component unmounts.
//  * This will clean up any attached event listeners on the linker window.
//  */
// const cleanUp = () => {
//     return {
//         type: ActionTypes.LINKER_CLEANUP
//     };
// };

// /**
//  * This action creator will be triggered by the "toggleChannel" action creator. The TOGGLE_CHANNEL_SUCCESS
//  * action will call the reducer to update the linker's state for the channel with `channelID` so that the
//  * 'active' field for that channel is flipped.
//  * @param {number} channelID A unique identifier for the channel to toggle
//  */
// const toggleSuccess = (channelID: number) => {
//     return {
//         type: ActionTypes.TOGGLE_CHANNEL_SUCCESS,
//         payload: {
//             channelID
//         }
//     };
// };

// /**
//  * This action creator will be triggered by the "toggleChannel" action creator if the LinkerClient errors during
//  * linking/unlinking a channel.
//  */
// const toggleFailure = () => {
//     return {
//         type: ActionTypes.TOGGLE_CHANNEL_FAILURE
//     };
// };

// /**
//  * This action creator will be triggered by the "init" action creator if the action succeeds. 
//  * It takes in the updated linker state generated from the 'init' action and pass it in to the reducer for it to
//  * update the state.
//  * @param {Linker} value The updated linker state after the initialization
//  */
// const initSuccess = (value: Linker) => {
//     return {
//         type: ActionTypes.LINKER_INIT_SUCCESS,
//         payload: {
//             value
//         }
//     };
// };

// /**
//  * When user switches the linker channel for different finsemble components, this action will be called to update the
//  * active linker channels.
//  * @param value The value returned by the linker client on the action channels for a given linker window
//  */
// const updateActiveChannels = (value: channelUpdateReturnObject) => {
//     return {
//         type: ActionTypes.UPDATE_ACTIVE_CHANNELS,
//         payload: {
//             updatedActiveChannels: value.channels,
//             updatedWindowIdentifier: value.windowIdentifier
//         }
//     };
// };

// /**
//  * Update the number of active channels.
//  * @param value The number of current active channels
//  */
// const updateActives = (value: number) => {
//     return {
//         type: ActionTypes.UPDATE_ACTIVES,
//         payload: {
//             value
//         }
//     }
// }


// export {
//     toggleChannel,
//     toggleSuccess,
//     toggleFailure,
//     updateActiveChannels,
//     updateActives,
//     init,
//     initSuccess,
//     cleanUp
// };