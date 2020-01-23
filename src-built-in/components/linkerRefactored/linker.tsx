/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import * as React from "react";
import { useEffect } from "react";
import { Provider, useSelector, useDispatch } from 'react-redux';

import "./css/linkerWindow.css";
import "../../../assets/css/font-finance.css";
import "../../../assets/css/finsemble.css";
import { RootState } from '../UIAPI/fsblUI';
import store from '../UIAPI/store';
import * as linkerActions from "../UIAPI/actions/linkerActions";

const LinkerRefactored = () => {
	const linker = useSelector((state: RootState) => state.linker);
	const dispatch = useDispatch();
	
	const toggleChannel = (linkerIndex: number) => {
        console.log(`Toggling the linker channel. Channel id: ${linkerIndex}`);
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

const Linker = () => {
    return (
        <Provider store={store}>
    		<LinkerRefactored />
  		</Provider>
    );
}

export default Linker;
