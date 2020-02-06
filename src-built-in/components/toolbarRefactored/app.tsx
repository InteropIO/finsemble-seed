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

const Toolbar: React.FunctionComponent = (props) => {
	useEffect(() => {
		registerHideToolbarHotkey();
		registerMinimizeAllHotkey();
		registerRevealAllHotkey();
		registerShowSearchHotkey();
		registerShowToolbarHotkey();
	});

	return (
		<Provider store={store}>
			<div className="finsemble-toolbar">
				{props.children}
			</div>
		</Provider>
	);
}

export default Toolbar;
