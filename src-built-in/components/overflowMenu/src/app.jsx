/*!
* Copyright 2020 by ChartIQ, Inc.
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

if (window.FSBL && FSBL.addEventListener) { FSBL.addEventListener("onReady", FSBLReady); } else { window.addEventListener("FSBLReady", FSBLReady) }
function FSBLReady() {
	ReactDOM.render(
		<OverflowMenu overflowMenuStore="OverflowMenuStore"/>
		, document.getElementById("bodyHere"));

}