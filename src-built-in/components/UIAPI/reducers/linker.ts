import { loop, Cmd } from 'redux-loop';

import { toggleSuccess, toggleFailure, initSuccess } from '../actions/linkerActions';
import { Linker, LinkerAction, ActionTypes } from '../fsblUI';
import { linkChannel, initializeLinker, cleanUp } from '../effects/linker';
import { updateToggleChannelSuccessState, updateActiveChannelsState } from '../stateManager/linker';

declare const FSBL: any;

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
            FSBL.Clients.Logger.system.debug(`LINKER_INIT. Linker state: ${state}`);
            return loop(state, Cmd.run(initializeLinker, {
                successActionCreator: initSuccess,
                args: [state]
            }));

        case ActionTypes.LINKER_INIT_SUCCESS:
            const initSuccessState = payload.value;
            FSBL.Clients.Logger.system.debug(`LINKER_INIT_SUCCESS. Linker state: ${initSuccessState}`);
            return loop(initSuccessState, Cmd.run(() => FSBL.Clients.WindowClient.fitToDOM()));

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
            FSBL.Clients.Logger.system.debug(`TOGGLE_CHANNEL_REQUEST. Linker state: ${toggleRequestState}`);
            return loop(toggleRequestState, cmd);

        case ActionTypes.TOGGLE_CHANNEL_SUCCESS:
            const toggleSuccessState = updateToggleChannelSuccessState(state, payload);
            FSBL.Clients.Logger.system.debug(`TOGGLE_CHANNEL_SUCCESS. Linker state: ${toggleSuccessState}`);
            return toggleSuccessState;

        case ActionTypes.TOGGLE_CHANNEL_FAILURE:
            const toggleFailureState = {
                ...state,
                processingRequest: false
            };
            FSBL.Clients.Logger.system.debug(`TOGGLE_CHANNEL_FAILURE. Linker state: ${toggleFailureState}`);
            return toggleFailureState;

        case ActionTypes.UPDATE_ACTIVE_CHANNELS:
            const updateChannelsState = updateActiveChannelsState(state, payload);
            FSBL.Clients.Logger.system.debug(`UPDATE_ACTIVE_CHANNELS. Linker state: ${updateChannelsState}`);
            return updateChannelsState;

        case ActionTypes.LINKER_CLEANUP:
            FSBL.Clients.Logger.system.debug(`LINKER_CLEANUP. Linker state: ${state}`);
            return loop(state, Cmd.run(cleanUp));

        default:
            FSBL.Clients.Logger.system.debug(`linker reducer default case. Returning the original state: ${state}`);
            return state;
    }
}

export default linker;