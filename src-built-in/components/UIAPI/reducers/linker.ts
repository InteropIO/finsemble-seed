import { LinkerState, LinkerAction, ActionTypes, Channel } from '../types';
import withLogging from '../hoReducers/logging';
import produce from "immer";

// The linker state before we initialize the linker. The initialize linker function will make calls to the LinkerClient and 
// fill in the state with the relevant linker information.
export const initialState: LinkerState = {
    channels: {},
    isAccessibleLinker: true,
    windowIdentifier: {}
};

// The linker's reducer
export const linker = produce((state = initialState, action: LinkerAction) => {
    const { type, payload } = action;
        switch (type) {
            case ActionTypes.UPDATE_CHANNEL_STATUS:
                const {channelId, active} : any = payload;
                state.channels[channelId].active = active;
                break;

            case ActionTypes.UPDATE_CHANNELS:
               let {channels} : any = payload;
               state.channels = channels.map((channel: Channel, index :number) => {
                    return {
                        id: index,
                        name: channel.name,
                        color: channel.color,
                        border: channel.border,
                        active: false
                    }
                });
                break;

            case ActionTypes.UPDATE_ACTIVE_CHANNELS:
               const {channelNames, windowIdentifier} : any = payload;
               state.windowIdentifier = windowIdentifier;
               for(const channel of state.channels){
                    channel.active = channelNames.includes(channel.name)
                }
                break;

            case ActionTypes.SET_ACCESSIBILITY:
                const {isAccessibleLinker} : any = payload;
                state.isAccessibleLinker = isAccessibleLinker;
                break;
        }
    })

    const reducer = withLogging("Linker", linker);

export default reducer;