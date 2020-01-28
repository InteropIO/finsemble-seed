import { loop, Cmd } from 'redux-loop';

import { toggleSuccess, toggleFailure, initSuccess } from '../actions/linkerActions';
import { Linker, LinkerAction, ActionTypes } from '../fsblUI';
import { linkChannel, initializeLinker, cleanUp, fitDOM } from '../effects/linker';
import { updateToggleChannelSuccessState, updateActiveChannelsState } from '../stateManager/linker';
import withLogging from '../hoReducers/logging';

// The linker state before we initialize the linker. The initialize linker function will make calls to the LinkerClient and 
// fill in the state with the relevant linker information.
export const initialState: Linker = {
    channels: {},
    nameToId: {},
    isAccessibleLinker: true,
    windowIdentifier: {},
    processingRequest: false
};

// The linker's reducer
const linker = (state = initialState, action: LinkerAction) => {
    const { type, payload } = action;
    switch (type) {
        case ActionTypes.LINKER_INIT:
            return loop(state, Cmd.run(initializeLinker, {
                successActionCreator: initSuccess,
                args: [state]
            }));

        case ActionTypes.LINKER_INIT_SUCCESS:
            const initSuccessState = payload.value;
            return loop(initSuccessState, Cmd.run(fitDOM));

        case ActionTypes.TOGGLE_CHANNEL_REQUEST:
            const toggleRequestState: Linker = {
                ...state,
                processingRequest: true
            };

            const targetChannelName = toggleRequestState.channels[payload.channelID].name,
                  targetChannelActive = toggleRequestState.channels[payload.channelID].active,
                  targetWindowIdentifier = toggleRequestState.windowIdentifier;

            const cmd = Cmd.run(linkChannel, {
                successActionCreator: () => toggleSuccess(payload.channelID),
                failActionCreator: () => toggleFailure(),
                args: [targetChannelName, targetChannelActive, targetWindowIdentifier]
            });
            return loop(toggleRequestState, cmd);

        case ActionTypes.TOGGLE_CHANNEL_SUCCESS:
            const toggleSuccessState = updateToggleChannelSuccessState(state, payload);
            return toggleSuccessState;

        case ActionTypes.TOGGLE_CHANNEL_FAILURE:
            const toggleFailureState = {
                ...state,
                processingRequest: false
            };
            return toggleFailureState;

        case ActionTypes.UPDATE_ACTIVE_CHANNELS:
            const updateChannelsState = updateActiveChannelsState(state, payload);
            return updateChannelsState;

        case ActionTypes.LINKER_CLEANUP:
            return loop(state, Cmd.run(cleanUp));

        default:
            return state;
    }
}

export default withLogging("Linker", linker);