/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import * as React from "react";
import { Provider, useSelector } from 'react-redux';

import "./css/linkerWindow.css";
import "../../../assets/css/font-finance.css";
import "../../../assets/css/finsemble.css";
import { RootState } from '../UIAPI/fsblUI';
import store from '../UIAPI/store';
import { useLinker } from "../UIAPI/hooks/linker";

const LinkerRefactored = () => {
	const linker = useSelector((state: RootState) => state.linker);
    const [toggleChannel] = useLinker();

	const allChannels = Object.values(linker.channels);
    const channelElements = allChannels.map(({color, name, active, id}) => {
        const groupClass = `linkerGroup ${color}`;
        const style = {
            backgroundColor: color,
            border: `1px solid ${color}`
		}
        return (
            <div key={id} className="channel-wrapper" onClick={() => toggleChannel(id)}>
                {linker.isAccessibleLinker ? <div className="channel-label">{name}</div> : null}
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
