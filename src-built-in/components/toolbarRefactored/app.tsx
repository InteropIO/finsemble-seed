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
import DragHandle from './DragHandle';

const ToolbarRefactored = () => {
	return (<div className="finsemble-toolbar">
		<DragHandle />
		{/* Workspace Management Menu */}
		{/* App Menu */}
		{/* Favorites Section */}
		{/* Minimize All */}
		{/* Reveal All */}
		{/* Auto Arrange */}
	</div>)
}

const Toolbar = () => {
	return (
		<Provider store={store}>
			<ToolbarRefactored />
		</Provider>
	);
}

export default Toolbar;
