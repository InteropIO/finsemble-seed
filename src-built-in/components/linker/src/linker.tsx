/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import * as React from "react";
import { useEffect } from "react";
import { Provider, useSelector, useDispatch } from 'react-redux';
import * as ReactDOM from "react-dom";

import "./css/linkerWindow.css";
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";
import { RootState } from '../../UIAPI/types';
import store from '../../UIAPI/store';
import * as linkerActions from "../../UIAPI/actions/linkerActions";

declare var FSBL: any;
declare global {
    interface Window {
        FSBL: any
    }
};

const LinkerRefactored = () => {
	const linker = useSelector((state: RootState) => state.linker);
	const dispatch = useDispatch();
	
	const toggleChannel = (linkerIndex: number) => {
		dispatch(linkerActions.toggleChannel(linkerIndex));
	};

    useEffect(() => {
		dispatch(linkerActions.init());
        return () => {
            dispatch(linkerActions.cleanUp());
        }
	}, []);

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
