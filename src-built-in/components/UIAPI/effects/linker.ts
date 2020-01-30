import store from '../store';
import { Channel, Channels, NameToId, Linker } from '../fsblUI';
import { updateActiveChannels } from '../actions/linkerActions';

/**
 * Link/unlink a channel for the current component.
 * @param channelName The channel name to toggle
 * @param isActive Whether the channel is active or not before the toggle
 * @param windowIdentifier The window identifier for the current component the linker window is attached to
 */
export const linkChannel = (channelName: string, isActive: boolean, windowIdentifier: object) => {
    return new Promise((res, rej) => {
        const callback = (err: any, data: object) => {
            if (err) {
                FSBL.Clients.Logger.system.error(`Failed to togger channel ${channelName}: ${err}`);
                return rej(err);
            }
            FSBL.Clients.Logger.system.log(`Toggle channel success. Channel name: ${channelName}`);
            res(data);
        };
        if (!isActive) {
            FSBL.Clients.LinkerClient.linkToChannel(channelName, windowIdentifier, callback);
        } else {
            FSBL.Clients.LinkerClient.unlinkFromChannel(channelName, windowIdentifier, callback);
        }
        hideWindow();
    });
}

// Window event listeners
const hideWindow = () => {
    finsembleWindow.hide();
};
const showWindow = () => {
    finsembleWindow.focus();
};

/**
 * Initialize the linker, which includes populating the linker state with the linker information (i.e. the number of channels, channel names,
 * channel colors), setting up the responder when the linker state changes, and configuring the linker state according to finsemble config.
 * @param initialState The initial state of the linker
 */
export const initializeLinker = (initialState: Linker) => {
    FSBL.Clients.Logger.system.log(`Initializing the linker state. Current linker state: ${initialState}`);
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
        const allConfiguredChannels = FSBL.Clients.LinkerClient.getAllChannels();
        if (allConfiguredChannels.length > 20) {
            FSBL.Clients.Logger.system.error(`More than 20 linker channels are configured. Finsemble is showing the maximum of 20 linker channels.`);
            allConfiguredChannels.splice(20);
        }
        allConfiguredChannels.forEach(addChanneltoInitialState);
        initialLinkerState.channels = initialChannels;
        initialLinkerState.nameToId = initialNametoId;

        const setActiveChannelsCallback = (err: any, msg: any) => {
            if (err) {
                /* @early-exit */
                FSBL.Clients.Logger.system.error(`Failed to update the linker state. Current linker state: ${store.getState()}`);
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

            FSBL.Clients.Logger.system.log(`Finished updating the linker state. Current linker state: ${newLinkerState}`);

            // Need to invoke the callback function in order for us to be able to toggle the linker window again - see LinkerButton.jsx
            msg.sendQueryResponse(null, {});
            res(newLinkerState);
        }

        // Check whether the linker is configured to be an accessible linker or not; update the state accordingly.  
        // The default value for isAccessibleLinker is `true`.
        FSBL.Clients.ConfigClient.getValue("finsemble.accessibleLinker", (err: any, value: boolean) => {
            if (err) {
                FSBL.Clients.Logger.system.error(`Failed to get accessibleLinker value: ${err}`);
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

/**
 * Clean up after the linker component unmounts.
 * Remove the event listeners on the window.
 */
export const cleanUp = () => {
    FSBL.Clients.Logger.system.log("Linker component is unmount. Cleaning up the event listeners.");
    finsembleWindow.removeEventListener("blurred", hideWindow);
    finsembleWindow.removeEventListener("shown", showWindow);
}


/**
 * This function is run after the component is initialized.
 * We will fit the component window with the presence of the finsemble titlebar so that all the component elements would be visible
 */
export const fitDOM = () => {
    FSBL.Clients.WindowClient.fitToDOM();
}