import { loop, Cmd } from 'redux-loop';
import { 
    TOGGLE_CHANNEL_REQUEST, 
    TOGGLE_CHANNEL_SUCCESS, 
    TOGGLE_CHANNEL_FAILURE,
    LINKER_INIT,
    LINKER_INIT_SUCCESS,
    LINKER_CLEANUP
} from "../actionTypes";
import { Store } from "../../linker/src/stores/linkerStore";
import { toggleSuccess, toggleFailure, initSuccess } from '../actions/linkerActions';
import store from '../store';

const initialState = {
    channels: {
        0: {
            id: 0,
            color: '#8781BD',
            name: 'group1',
            active: false,
        },
        1: {
            id: 1,
            color: '#FFE035',
            name: 'group2',
            active: false,
        },
        2: {
            id: 2,
            name: "group3",
            color: "#89D803",
            active: false,
        },
        3: {
            id: 3,
            name: "group4",
            color: "#FE6262",
            active: false,
        },
        4: {
            id: 4,
            name: "group5",
            color: "#2DACFF",
            active: false,
        },
        5: {
            id: 5,
            name: "group6",
            color: "#FFA200",
            active: false,
          }
    },
    nameToId: {
        group1: 0,
        group2: 1,
        group3: 2,
        group4: 3,
        group5: 4,
        group6: 5
    },
    isAccessibleLinker: true,
    windowIdentifier: {},
    processingRequest: false
};

// Effectful code to link/unlink the channel which will run outside the reducer function
function linkChannel(channelName, isActive) {
    return new Promise((res, rej) => {
        const callback = (err, data) => {
            if (err) return rej(err);
            res(data);
        };
        let attachedWindowIdentifier = Store.getAttachedWindowIdentifier();
        if (!isActive) {
            FSBL.Clients.LinkerClient.linkToChannel(channelName, attachedWindowIdentifier, callback);
        } else {
            FSBL.Clients.LinkerClient.unlinkFromChannel(channelName, attachedWindowIdentifier, callback);
        }
    });
}

function initializeLinker() {
    console.log("*********  initializing linker  *********");
    finsembleWindow.addEventListener("blurred", () => {
        console.log("finsemble window -> hide");
        finsembleWindow.hide();
    });
    finsembleWindow.addEventListener("shown", () => {
		finsembleWindow.focus();
	});
    FSBL.Clients.WindowClient.fitToDOM();

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
            Store.setState(msg.data);
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
                Store.accessibleLinker = value;
                res(linkerInfo);
            });
        });
    });
}

function cleanUpAfterComponentUnmount() {
    console.log("********  cleanup  *********");
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
            return loop(state, Cmd.run(initializeLinker, {
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
            console.log("linker init success! activeChannelIds value: ", activeChannelIds);
            console.log("linker new state: ", JSON.stringify(newLinkerState_success, null, 4))
            return newLinkerState_success;
        case TOGGLE_CHANNEL_REQUEST:
            const newState_request = {
                ...state,
                processingRequest: true
            };

            const cmd = Cmd.run(linkChannel, {
                successActionCreator: (value) => toggleSuccess(payload.id, value),
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