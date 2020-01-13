import { loop, Cmd } from 'redux-loop';
import { 
    TOGGLE_CHANNEL_REQUEST, 
    TOGGLE_CHANNEL_SUCCESS, 
    TOGGLE_CHANNEL_FAILURE,
    LINKER_INIT,
    LINKER_CLEANUP
} from "../actionTypes";
import { Store } from "../../linker/src/stores/linkerStore";
import { toggleSuccess, toggleFailure } from '../actions/linkerActions';

const initialState = {
    channels: {
        0: {
            id: 0,
            color: '#8781BD',
            name: 'group1',
            active: true,
        },
        1: {
            id: 1,
            color: '#FFE035',
            name: 'group2',
            active: false,
        }
    },
    allChannelIds: [0, 1],
    processingRequest: false
};

// Effectful code to link/unlink the channel which will run outside the reducer function
function linkChannel(channelName, isActive) {
    let attachedWindowIdentifier = Store.getAttachedWindowIdentifier();
    if (!isActive) return FSBL.Clients.LinkerClient.linkToChannel(channelName, attachedWindowIdentifier);
    else return FSBL.Clients.LinkerClient.unlinkFromChannel(channelName, attachedWindowIdentifier);
}

function initializeLinker() {
    finsembleWindow.addEventListener("blurred", () => {
        finsembleWindow.hide();
    });
    FSBL.Clients.WindowClient.fitToDOM();
}

function cleanUpAfterComponentUnmount() {
    finsembleWindow.removeEventListener("blurred", () => {
        finsembleWindow.hide();
    });
}

// The linker's reducer
const linker = (state = initialState, { type, payload }) => {
    switch (type) {
        case LINKER_INIT:
            return loop(state, Cmd.run(initializeLinker));
        case TOGGLE_CHANNEL_REQUEST:
            const newState_request = {
                ...state,
                processingRequest: true
            };

            const cmd = Cmd.run(linkChannel, {
                successActionCreator: () => toggleSuccess(payload.id),
                failActionCreator: toggleFailure,
                args: [newState_request.channels[payload.id].name, newState_request.channels[payload.id].active]
            });

            return loop(newState_request, cmd);
        case TOGGLE_CHANNEL_SUCCESS:
            const newState_success = {
                ...state,
                processingRequest: false,
                channels: {
                    ...state.channels,
                    [payload.id]: {
                        ...state.channels[payload.id],
                        active: !state.channels[payload.id].active
                    }
                }
            };
            return newState_success;
        case TOGGLE_CHANNEL_FAILURE:
            const newState_failure = {
                ...state,
                processingRequest: false
            };
            return newState_failure;
        case LINKER_CLEANUP:
            return loop(state, Cmd.run(cleanUpAfterComponentUnmount));
        default:
            return state;
    }
}

export default linker;