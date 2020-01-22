import { loop, Cmd } from 'redux-loop';
import store from '../store';
import { toggleSuccess, toggleFailure, initSuccess, updateActiveChannels } from '../actions/linkerActions';
import { Channel, Channels, NameToId, Linker, LinkerAction, actionTypes } from '../fsblUI';

declare const FSBL: any;
declare const finsembleWindow: any;

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
    const initialLinkerState: Linker = Object.assign({}, initialState);
    const initialChannels: Channels = {};
    const initialNametoId: NameToId = {};

    // Add the channels user specifies in the config to the linker's initial state
    const addChanneltoInitialState = (channel: Channel) => {
        initialChannels[nextChannelId] = {
            id: nextChannelId,
            name: channel.name,
            color: channel.color,
            active: false
        };
        initialNametoId[channel.name] = nextChannelId;
        nextChannelId = nextChannelId + 1;
    }

    const updateChannels = (activeChannels: Array<Channel>) => {
        // get all the active channels' ids on the component that user switches to
        const activeChannelIds: any[number] = [];
        activeChannels.forEach((channel: Channel) => {
            activeChannelIds.push(initialLinkerState.nameToId[channel.name]);
        });

        // Updates the initialLinkerState with the new channel information
        const updatedChannels: Channels = Object.assign({}, initialLinkerState.channels);
        activeChannelIds.forEach((channelId: number) => {
            updatedChannels[channelId].active = true;
        });

        return updatedChannels;
    }

    return new Promise((res, rej) => {
        FSBL.Clients.LinkerClient.getAllChannels().forEach(addChanneltoInitialState);
        initialLinkerState.channels = initialChannels;
        initialLinkerState.nameToId = initialNametoId;

        const setActiveChannelsCallback = (err: any, msg: any) => {
            if (err) {
                /* @early-exit */
                return rej(`Failed to add Finsemble.LinkerWindow.SetActiveChannels Responder: ${err}`);
            }
            const updatedChannels = updateChannels(msg.data.channels);

            // Update the linker state according to the new channel information
            store.dispatch(updateActiveChannels(msg.data));
                        
            const newLinkerState = {
                ...initialLinkerState,
                windowIdentifier: msg.data.windowIdentifier,
                channels: updatedChannels
            }

            // Need to invoke the callback function in order for us to be able to toggle the linker window again - see LinkerButton.jsx
            msg.sendQueryResponse(null, {});
            res(newLinkerState);
        }

        // Check whether the linker is configured to be an accessible linker or not; update the state accordingly.  
        // The default value for isAccessibleLinker is `true`.
        FSBL.Clients.ConfigClient.getValue("finsemble.accessibleLinker", (err: any, value: boolean) => {
            if (err) {
                console.error(`Error getting accessibleLinker value: ${err}`);
                /* @early-exit */
                rej(`Error getting accessibleLinker value.`);
            }
            initialLinkerState.isAccessibleLinker = value;
        });

        // If user switches the linker channel for different components, this function would be invoked. It will dispatch another
        // action to update the linker's state according to the linker setup on the switched component.
        FSBL.Clients.RouterClient.addResponder("Finsemble.LinkerWindow.SetActiveChannels", setActiveChannelsCallback);
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
        case actionTypes.LINKER_INIT:
            return loop(state, Cmd.run(initializeLinker, {
                successActionCreator: initSuccess,
            }));
        case actionTypes.LINKER_INIT_SUCCESS:
            const newState = payload.value;
            return loop(newState, Cmd.run(() => FSBL.Clients.WindowClient.fitToDOM()));
        case actionTypes.TOGGLE_CHANNEL_REQUEST:
            const newState_request: Linker = {
                ...state,
                processingRequest: true
            };

            const targetChannelName = newState_request.channels[payload.channelID].name,
                  targetChannelActive = newState_request.channels[payload.channelID].active,
                  targetWindowIdentifier = newState_request.windowIdentifier;

            const cmd = Cmd.run(linkChannel, {
                successActionCreator: () => toggleSuccess(payload.channelID),
                failActionCreator: () => toggleFailure(),
                args: [targetChannelName, targetChannelActive, targetWindowIdentifier]
            });

            return loop(newState_request, cmd);
        case actionTypes.TOGGLE_CHANNEL_SUCCESS:
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
        case actionTypes.TOGGLE_CHANNEL_FAILURE:
            const newState_failure = {
                ...state,
                processingRequest: false
            };
            return newState_failure;
        case actionTypes.UPDATE_ACTIVE_CHANNELS:
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
        case actionTypes.LINKER_CLEANUP:
            return loop(state, Cmd.run(cleanUpAfterComponentUnmount));
        default:
            return state;
    }
}

export default linker;