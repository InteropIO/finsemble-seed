/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
import "../../../../assets/css/finsemble.css";

import { FinsembleOverflowMenu } from "@chartiq/finsemble-react-controls";

class OverflowMenu extends React.Component {
	constructor(props) {
		super(props);
	}

	fitDOM() {
		FSBL.Clients.WindowClient.fitToDOM();
	}

	render() {
		return <FinsembleOverflowMenu onStateChange={this.fitDOM} overflowMenuStore={this.props.overflowMenuStore} />;
	}

}

FSBL.addEventListener("onReady", function () {
	ReactDOM.render(
		<OverflowMenu overflowMenuStore="OverflowMenuStore"/>
		, document.getElementById("bodyHere"));

});