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

const Toolbar: React.FunctionComponent = (props) => {
	return (
		<Provider store={store}>
			<div className="finsemble-toolbar">
				{props.children}
			</div>
		</Provider>
	);
}

export default Toolbar;
