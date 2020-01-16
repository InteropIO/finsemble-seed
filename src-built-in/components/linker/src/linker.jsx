/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React, { useEffect } from "react";
import { Provider, useSelector, useDispatch } from 'react-redux';
import ReactDOM from "react-dom";
import "./css/linkerWindow.css";
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";

import store from '../../UIAPI/store';
import * as linkerActions from "../../UIAPI/actions/linkerActions";

const LinkerRefactored = () => {
	const linker = useSelector(state => state.linker);
	const dispatch = useDispatch();
	
	const toggleChannel = (linkerIndex) => {
		dispatch(linkerActions.toggleChannel(linkerIndex));
	};

    useEffect(() => {
		dispatch(linkerActions.init());
        return () => {
            dispatch(linkerActions.cleanUp());
        }
	}, []);

	const allChannels = Object.values(linker.channels);
    const channelsElements = allChannels.map(({color, name, active, id}) => {
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
            {channelsElements}
        </div>
    );
}


if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}
function FSBLReady() {
	ReactDOM.render(
		<Provider store={store}>
    		<LinkerRefactored />
  		</Provider>,
   		document.getElementById("main")
   	);
}
