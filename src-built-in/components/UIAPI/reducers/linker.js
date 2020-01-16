import { loop, Cmd } from 'redux-loop';
import { 
    TOGGLE_CHANNEL_REQUEST, 
    TOGGLE_CHANNEL_SUCCESS, 
    TOGGLE_CHANNEL_FAILURE,
    LINKER_INIT,
    LINKER_INIT_SUCCESS,
    LINKER_CLEANUP
} from "../actionTypes";
import { toggleSuccess, toggleFailure, initSuccess } from '../actions/linkerActions';

const initialState = {
    channels: {},
    nameToId: {},
    isAccessibleLinker: true,
    windowIdentifier: {},
    processingRequest: false
};

// Effectful code to link/unlink the channel which will run outside the reducer function
function linkChannel(channelName, isActive, windowIdentifier) {
    return new Promise((res, rej) => {
        const callback = (err, data) => {
            if (err) return rej(err);
            res(data);
        };
        if (!isActive) {
            FSBL.Clients.LinkerClient.linkToChannel(channelName, windowIdentifier, callback);
        } else {
            FSBL.Clients.LinkerClient.unlinkFromChannel(channelName, windowIdentifier, callback);
        }
    });
}

function initializeLinker() {
    console.log("*********  initializing linker  *********");
    finsembleWindow.addEventListener("blurred", () => {
        finsembleWindow.hide();
    });
    finsembleWindow.addEventListener("shown", () => {
		finsembleWindow.focus();
	});

    return new Promise((res, rej) => {
        let linkerInfo = {
            activeChannels: null,
            windowIdentifier: null,
            isAccessibleLinker: true
        };
        FSBL.Clients.RouterClient.addResponder("Finsemble.LinkerWindow.SetActiveChannels", function (err, msg) {
            if (err) {
                return rej("Failed to add Finsemble.LinkerWindow.SetActiveChannels Responder: ", err);
            }
            console.log("initializing ------------- ", msg.data);
            linkerInfo.activeChannels = msg.data.channels;
            linkerInfo.windowIdentifier = msg.data.windowIdentifier;
            FSBL.Clients.Logger.system.log("toggle Linker window");
            msg.sendQueryResponse(null, {});
            
            FSBL.Clients.ConfigClient.getValue("finsemble.accessibleLinker", (err, value) => {
                if (err) {
                    rej("Error getting accessibleLinker value", err);
                }
                linkerInfo.isAccessibleLinker = value;
                res(linkerInfo);
            });
        });
    });
}

function cleanUpAfterComponentUnmount() {
    finsembleWindow.removeEventListener("blurred", () => {
        finsembleWindow.hide();
    });
    finsembleWindow.removeEventListener("shown", () => {
		finsembleWindow.focus();
	});
}

// The linker's reducer
const linker = (state = initialState, { type, payload }) => {
    switch (type) {
        case LINKER_INIT:
            const linkerInitState = Object.assign({}, state);
            let nextChannelId = 0;
            const initialChannels = {};
            const initialNametoId = {};
            FSBL.Clients.LinkerClient.getAllChannels().forEach(channel => {
                initialChannels[nextChannelId] = {
                    id: nextChannelId,
                    name: channel.name,
                    color: channel.color,
                    active: false
                };
                initialNametoId[channel.name] = nextChannelId;
                nextChannelId += 1;
            });
            linkerInitState.channels = initialChannels;
            linkerInitState.nameToId = initialNametoId;
            return loop(linkerInitState, Cmd.run(initializeLinker, {
                successActionCreator: initSuccess,
            }));
        case LINKER_INIT_SUCCESS:
            const { isAccessibleLinker, activeChannels, windowIdentifier } = payload.value;
            const activeChannelIds = [];
            activeChannels.forEach(channel => {
                activeChannelIds.push(state.nameToId[channel.name]);
            });
            const updatedChannels = state.channels;
            activeChannelIds.forEach(channelId => {
                updatedChannels[channelId].active = true;
            });
            const newLinkerState_success = {
                ...state,
                channels: updatedChannels,
                isAccessibleLinker: isAccessibleLinker,
                windowIdentifier: windowIdentifier
            };
            return loop(newLinkerState_success, Cmd.run(() => FSBL.Clients.WindowClient.fitToDOM()));
        case TOGGLE_CHANNEL_REQUEST:
            const newState_request = {
                ...state,
                processingRequest: true
            };

            const cmd = Cmd.run(linkChannel, {
                successActionCreator: (value) => toggleSuccess(payload.id, value),
                failActionCreator: toggleFailure,
                args: [newState_request.channels[payload.id].name, newState_request.channels[payload.id].active, newState_request.windowIdentifier]
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
            console.log("TOGGLE_CHANNEL_SUCCESS: ", payload.value);
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