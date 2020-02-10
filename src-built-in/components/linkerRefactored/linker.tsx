/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import * as React from "react";
import { Provider } from 'react-redux';

import "./css/linkerWindow.css";
import "../../../assets/css/font-finance.css";
import "../../../assets/css/finsemble.css";
import store from '../UIAPI/store';
import { useLinker } from "../UIAPI/hooks/linker";
declare type LinkerProps = {
    maximumChannelSelections: number
};
const MAXIMUM_CHANNEL_SELECTIONS = 20;
const HIT_MAXIMUM_CHANNEL_SELECTIONS_ERROR_MESSAGE = `Attempted to render more channels than allowed. UI may look bad displaying more than ${MAXIMUM_CHANNEL_SELECTIONS} channels`;

const LinkerRefactored = (props: LinkerProps) => {
    const { state, toggleChannel } = useLinker();

    const allChannels = Object.values(state.channels);
    const channelElements = allChannels.map(({ color, border, name, active, id }, index) => {
        if (index > (props.maximumChannelSelections - 1)) {
            return FSBL.Clients.Logger.error(HIT_MAXIMUM_CHANNEL_SELECTIONS_ERROR_MESSAGE);
        }
        const groupClass = `linkerGroup ${color}`;
        const style = {
            backgroundColor: color,
            border: `1px solid ${border ? border : color}`
        }
        return (
            <div key={id} className="channel-wrapper" onClick={() => toggleChannel(id)}>
                {state.isAccessibleLinker ? <div className="channel-label">{name}</div> : null}
                <div className={groupClass} style={style}>
                    {active ? <i className="active-linker-group ff-check-mark"></i> : null}
                </div>
            </div>
        );
    });

    return (
        <div className="linkerContainer">
            {channelElements}
        </div>
    );
}

const Linker = (props: LinkerProps) => {
    return (
        <Provider store={store}>
            <LinkerRefactored maximumChannelSelections={props.maximumChannelSelections || MAXIMUM_CHANNEL_SELECTIONS} />
        </Provider>
    );
}

export { LinkerProps };
export default Linker;
