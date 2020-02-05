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

const LinkerRefactored = () => {
    const { state, toggleChannel } = useLinker();

	const allChannels = Object.values(state.channels);
    const channelElements = allChannels.map(({color, border, name, active, id}) => {
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

const Linker = () => {
    return (
        <Provider store={store}>
    		<LinkerRefactored />
  		</Provider>
    );
}

export default Linker;
