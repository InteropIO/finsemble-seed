import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from "react";
import { RootState, LinkerState, actions, Channel, Channels } from '../types';
// number of allowed active channels to be rendered on the titlebar. Current max is 6.
const MAXIMUM_ALLOWED_ACTIVE_CHANNELS = 6;

// Encapsulate the linker initialization and Redux dispatch functions inside the hook
export const useLinker = () => {

    const dispatch = useDispatch();
    const state: LinkerState = useSelector((state: RootState) => state.linker);

    useEffect(() => {
        FSBL.Clients.Logger.system.log("Linker component is mounted. Initializing.");
        finsembleWindow.addEventListener("blurred", hideWindow);
        finsembleWindow.addEventListener("shown", focusWindow);
        setInitialChannels();
        initAccessibleLinkerMode();
        FSBL.Clients.RouterClient.addResponder("Finsemble.LinkerWindow.SetActiveChannels", onActiveChannelsChanged);

        return () => {
            FSBL.Clients.Logger.system.log("Linker component is unmounted. Cleaning up the event listeners.");
            finsembleWindow.removeEventListener("blurred", hideWindow);
            finsembleWindow.removeEventListener("shown", focusWindow);
            FSBL.Clients.RouterClient.removeEventListener("Finsemble.LinkerWindow.SetActiveChannels", onActiveChannelsChanged);
        }
    }, []);

    useEffect(() => {
        FSBL.Clients.WindowClient.fitToDOM();
    }, [state])

    const hideWindow = () => {
        finsembleWindow.hide();
    };

    const focusWindow = () => {
        finsembleWindow.focus();
    };

    const setInitialChannels = () => {
        const allChannels: any = FSBL.Clients.LinkerClient.getAllChannels();
        dispatch(actions.SET_CHANNELS({
            channels: allChannels,
        }));
    };

    /** If user switches the linker channel for different components, this function would be invoked. It will dispatch another
     *  action to update the linker's state according to the linker setup on the switched component.
     *
     * @param err  error from FSBL
     * @param msg  msg from FSBL
     */
    const onActiveChannelsChanged = (err: any, msg: any) => {
        if (err) FSBL.Clients.Logger.system.error(`Failed to update the linker state.`);
        dispatch(actions.UPDATE_ACTIVE_CHANNELS({
            channelNames: msg.data.channels,
            windowIdentifier: msg.data.windowIdentifier,
        }));
        msg.sendQueryResponse(null, null);
    }

    const initAccessibleLinkerMode = () => {
        const accessibilityCallback = (err: any, value: boolean) => {
            if (err) FSBL.Clients.Logger.system.error(`Failed to get accessibleLinker value: ${err}`);
            dispatch(actions.SET_ACCESSIBILITY({
                isAccessibleLinker: true,
            }));
            FSBL.Clients.ConfigClient.getValue("finsemble.accessibleLinker", accessibilityCallback);
        }
    }

    const toggleChannel = (channelId: number) => {
        const channelName = state.channels[channelId].name;
        const channelActive = state.channels[channelId].active;
        const windowIdentifier = state.windowIdentifier;

        const linkCallback = (isActive: boolean) => {
            return () => dispatch(actions.UPDATE_CHANNEL_STATUS({
                channelId,
                active: isActive
            }));
        };

        const numberOfActiveChannels = Object.values(state.channels)
            .map(c => c.active)
            .reduce((a, c) => {
                return a + c;
            });

        // We're activating if the channel is currently inactive
        const activating = !channelActive;
        const deactivating = channelActive;
        const allowedToActivateAnotherChannel = numberOfActiveChannels < MAXIMUM_ALLOWED_ACTIVE_CHANNELS;
        // if we're toggling a channel to be inactive OR
        // we're trying to toggle one to be active AND we have not hit our maximum,
        // let the call go through. Otherwise log an error.
        if (deactivating) {
            FSBL.Clients.LinkerClient.unlinkFromChannel(channelName, windowIdentifier, linkCallback(!channelActive));
        } else if (activating && allowedToActivateAnotherChannel) {
            FSBL.Clients.LinkerClient.linkToChannel(channelName, windowIdentifier, linkCallback(!channelActive));
        } else {
            FSBL.Clients.Logger.error(`Attempted to toggle more than ${MAXIMUM_ALLOWED_ACTIVE_CHANNELS} channels. This could result in an unacceptable UX. Please contact finsemble support if you would like to render more than ${MAXIMUM_ALLOWED_ACTIVE_CHANNELS} linker channels in the window title bar.`)
        }
        hideWindow();
    }

    return { state, toggleChannel };

};
