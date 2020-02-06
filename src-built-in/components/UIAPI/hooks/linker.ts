import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from "react";
import { RootState, LinkerState, ActionTypes, Channel, Channels } from '../types';

// Encapsulate the linker initialization and Redux dispatch functions inside the hook
export const useLinker = () => {

    const dispatch = useDispatch();
    const state: LinkerState = useSelector((state: RootState) => state.linker);

    useEffect(() => {
        
        FSBL.Clients.Logger.system.log("Linker component is mounted. Initializing.");
        finsembleWindow.addEventListener("blurred", hideWindow);
        finsembleWindow.addEventListener("shown", showWindow);
		setInitialChannels();
        initAccessibleLinkerMode();
        FSBL.Clients.RouterClient.addResponder("Finsemble.LinkerWindow.SetActiveChannels", onActiveChannelsChanged);
        
        return () => {
            FSBL.Clients.Logger.system.log("Linker component is unmounted. Cleaning up the event listeners.");
            finsembleWindow.removeEventListener("blurred", hideWindow);
            finsembleWindow.removeEventListener("shown", showWindow);
            FSBL.Clients.RouterClient.removeEventListener("Finsemble.LinkerWindow.SetActiveChannels", onActiveChannelsChanged);
        }
    }, []);

    useEffect(() => {
        FSBL.Clients.WindowClient.fitToDOM();
    }, [state])

    const hideWindow = () => {
        finsembleWindow.hide();
    };
    const showWindow = () => {
        finsembleWindow.focus();
    };

    const setInitialChannels = () => {
        const allChannels : any = FSBL.Clients.LinkerClient.getAllChannels();
        dispatch({
            type: ActionTypes.UPDATE_CHANNELS,
            payload: {
                channels: allChannels
            }
        })
    }

    /** If user switches the linker channel for different components, this function would be invoked. It will dispatch another
     *  action to update the linker's state according to the linker setup on the switched component.
     * 
     * @param err  error from FSBL
     * @param msg  msg from FSBL
     */
    const onActiveChannelsChanged = (err: any, msg: any) => {
        if (err) FSBL.Clients.Logger.system.error(`Failed to update the linker state.`);
        dispatch({
            type: ActionTypes.UPDATE_ACTIVE_CHANNELS,
            payload: {
                channelNames: msg.data.channels,
                windowIdentifier: msg.data.windowIdentifier
            }
        })
    }

    const initAccessibleLinkerMode = () => {
        const accessibilityCallback = (err: any, value: boolean) => {
            if (err) FSBL.Clients.Logger.system.error(`Failed to get accessibleLinker value: ${err}`);
            dispatch({
                type: ActionTypes.SET_ACCESSIBILITY,
                payload: {
                    isAccessibleLinker: true
                }
            })
        };
        FSBL.Clients.ConfigClient.getValue("finsemble.accessibleLinker", accessibilityCallback);
    }

    const toggleChannel = (channelId: number) => {
        const channelName = state.channels[channelId].name;
        const channelActive = state.channels[channelId].active;
        const windowIdentifier = state.windowIdentifier;

        const linkCallback = (isActive : Boolean) => {
            return () => dispatch({
                type: ActionTypes.UPDATE_CHANNEL_STATUS,
                payload: {
                    channelId,
                    active: isActive
                }
            })
        }

        if (!channelActive) {
            FSBL.Clients.LinkerClient.linkToChannel(channelName, windowIdentifier, linkCallback(true));
        } else {
            FSBL.Clients.LinkerClient.unlinkFromChannel(channelName, windowIdentifier, linkCallback(false));
        }
    }

    return { state, toggleChannel };
};