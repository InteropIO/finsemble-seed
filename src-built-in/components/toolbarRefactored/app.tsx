/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from 'react-redux';

import "../../../assets/css/font-finance.css";
import "../../../assets/css/finsemble.css";
import store from '../UIAPI/store';
const useEffect = React.useEffect;
import {
	registerHideToolbarHotkey,
	registerMinimizeAllHotkey,
	registerRevealAllHotkey,
	registerShowSearchHotkey,
	registerShowToolbarHotkey
} from './toolbarHotkeys'
import './toolbar.css';

/**
 * It's a requirement that the toolbar not be minimized.
 * the minimizable option does not work.
 * Instead, we just listen for this event and restore the window.
 * Hacky. Best I can think of right now.
 */
const preventMinimize = () => {
	finsembleWindow.addEventListener("minimized", () => {
		finsembleWindow.restore();
	});
}

/**
 * Required to let the system know that the toolbar is up and ready.
 * Other pieces of the UI key off of this.
 * @TODO Determine whether this kind of baked-in dependency
 * makes sense in finsemble.
 */
const publishSystemCheckpoint = () => {
	FSBL.SystemManagerClient.publishCheckpointState("Toolbar", "initialize", "completed");
}

const Toolbar: React.FunctionComponent = (props) => {
	useEffect(() => {
		registerHideToolbarHotkey();
		registerMinimizeAllHotkey();
		registerRevealAllHotkey();
		registerShowSearchHotkey();
		registerShowToolbarHotkey();
		preventMinimize();
		publishSystemCheckpoint();
	}, []);

	return (
		<Provider store={store}>
			<div className="finsemble-toolbar">
				{props.children}
			</div>
		</Provider>
	);
}

export default Toolbar;
