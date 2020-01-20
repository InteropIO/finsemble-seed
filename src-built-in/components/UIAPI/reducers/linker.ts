import { loop, Cmd } from 'redux-loop';
import {
    TOGGLE_CHANNEL_REQUEST, 
    TOGGLE_CHANNEL_SUCCESS, 
    TOGGLE_CHANNEL_FAILURE,
    LINKER_INIT,
    LINKER_INIT_SUCCESS,
    LINKER_CLEANUP,
    UPDATE_ACTIVE_CHANNELS
} from "../actionTypes";
import store from '../store';
import { toggleSuccess, toggleFailure, initSuccess, updateActiveChannels } from '../actions/linkerActions';
import { Channel, Channels, NameToId, Linker, LinkerAction } from '../types';

declare var FSBL: any;
declare var finsembleWindow: any;

// The linker state before we initialize the linker. The initialize linker function will make calls to the LinkerClient and 
// fill in the state with the relevant linker information.
export const initialState: Linker = {
    channels: {},
    nameToId: {},
    isAccessibleLinker: true,
    windowIdentifier: {},
    processingRequest: false
};

const hideWindow = () => {
    finsembleWindow.hide();
};
const showWindow = () => {
    finsembleWindow.focus();
};

// Effectful code to link/unlink the channel
function linkChannel(channelName: string, isActive: boolean, windowIdentifier: object) {
    return new Promise((res, rej) => {
        const callback = (err: any, data: object) => {
            if (err) return rej(err);
            res(data);
        };
        if (!isActive) {
            console.log("linking the window: ", windowIdentifier);
            FSBL.Clients.LinkerClient.linkToChannel(channelName, windowIdentifier, callback);
        } else {
            FSBL.Clients.LinkerClient.unlinkFromChannel(channelName, windowIdentifier, callback);
        }
    });
}

// Effectful code to initialize the linker with the relevant channel information. It also sets up a listener to update the linker state when 
// users open the linker for different components.
function initializeLinker() {
    finsembleWindow.addEventListener("blurred", hideWindow);
    finsembleWindow.addEventListener("shown", showWindow);
    
    let nextChannelId: number = 0;
    const InitialLinkerState: Linker = Object.assign({}, initialState);
    const initialChannels: Channels = {};
    const initialNametoId: NameToId = {};

    return new Promise((res, rej) => {
        FSBL.Clients.LinkerClient.getAllChannels().forEach((channel: Channel) => {
            initialChannels[nextChannelId] = {
                id: nextChannelId,
                name: channel.name,
                color: channel.color,
                active: false
            };
            initialNametoId[channel.name] = nextChannelId;
            nextChannelId += 1;
        });
        InitialLinkerState.channels = initialChannels;
        InitialLinkerState.nameToId = initialNametoId;

        // If user switches the linker channel for different components, this function would be invoked. It will dispatch another
        // action to update the linker's state according to the linker setup on the switched component.
        FSBL.Clients.RouterClient.addResponder("Finsemble.LinkerWindow.SetActiveChannels", function (err: any, msg: any) {
            if (err) {
                return rej(`Failed to add Finsemble.LinkerWindow.SetActiveChannels Responder: ${err}`);
            }
            const activeChannels = msg.data.channels;

            const activeChannelIds: any[number] = [];

            // get all the active channels' names on the switched component
            activeChannels.forEach((channel: Channel) => {
                activeChannelIds.push(InitialLinkerState.nameToId[channel.name]);
            });

            const updatedChannels: Channels = Object.assign({}, InitialLinkerState.channels);
            activeChannelIds.forEach((channelId: number) => {
                updatedChannels[channelId].active = true;
            });

            InitialLinkerState.windowIdentifier = msg.data.windowIdentifier;
            FSBL.Clients.Logger.system.log("toggle Linker window");
            msg.sendQueryResponse(null, {});
            store.dispatch(updateActiveChannels(msg.data));
            
            // Check whether the linker is configured to be an accessible linker or not; update the state accordingly.  
            // The default value for isAccessibleLinker is `true`.
            FSBL.Clients.ConfigClient.getValue("finsemble.accessibleLinker", (err: any, value: boolean) => {
                if (err) {
                    rej(`Error getting accessibleLinker value: ${err}`);
                }
                const newLinkerState = {
                    ...InitialLinkerState,
                    channels: updatedChannels,
                    isAccessibleLinker: value,
                };
                res(newLinkerState);
            });
        });
    });
}

function cleanUpAfterComponentUnmount() {
    finsembleWindow.removeEventListener("blurred", hideWindow);
    finsembleWindow.removeEventListener("shown", showWindow);
}

// The linker's reducer
const linker = (state = initialState, action: LinkerAction) => {
    const { type, payload } = action;
    switch (type) {
        case LINKER_INIT:            
            return loop(state, Cmd.run(initializeLinker, {
                successActionCreator: initSuccess,
            }));
        case LINKER_INIT_SUCCESS:
            const newState = payload.value;
            return loop(newState, Cmd.run(() => FSBL.Clients.WindowClient.fitToDOM()));
        case TOGGLE_CHANNEL_REQUEST:
            const newState_request: Linker = {
                ...state,
                processingRequest: true
            };

            const cmd = Cmd.run(linkChannel, {
                successActionCreator: () => toggleSuccess(payload.channelID),
                failActionCreator: () => toggleFailure(),
                args: [newState_request.channels[payload.channelID].name, newState_request.channels[payload.channelID].active, newState_request.windowIdentifier]
            });

            return loop(newState_request, cmd);
        case TOGGLE_CHANNEL_SUCCESS:
            // Updates the channel's 'active' field
            const newState_success = {
                ...state,
                processingRequest: false,
                channels: {
                    ...state.channels,
                    [payload.channelID]: {
                        ...state.channels[payload.channelID],
                        active: !state.channels[payload.channelID].active
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
        case UPDATE_ACTIVE_CHANNELS:
            // Update the channels' 'active' field and the windowIdentifier state information
            // This is triggered by user switching linker window for different components.
            const { updatedActiveChannels, updatedWindowIdentifier } = payload;
            const activeChannelNames: any[string] = [];
            updatedActiveChannels.forEach((channel: Channel) => {
                activeChannelNames.push(channel.name);
            });
            const updatedChannel = Object.assign({}, state.channels);
            const channelIds: any[number] = Object.keys(updatedChannel);
            channelIds.forEach((channelId: number) => {
                if (activeChannelNames.includes(updatedChannel[channelId].name)) {
                    updatedChannel[channelId].active = true;
                } else {
                    updatedChannel[channelId].active = false;
                }
            });
            const newUpdateChannelState = {
                ...state,
                channels: updatedChannel,
                windowIdentifier: updatedWindowIdentifier
            };
            return newUpdateChannelState;
        case LINKER_CLEANUP:
            return loop(state, Cmd.run(cleanUpAfterComponentUnmount));
        default:
            return state;
    }
}

export default linker;