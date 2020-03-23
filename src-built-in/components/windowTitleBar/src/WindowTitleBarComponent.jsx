
/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
// const Test from './test';

import { WindowTitleBar, initializeTitlebar, windowTitleBarStore } from "@chartiq/finsemble-ui/react/components"

import "../../../../assets/css/finsemble.css";
import "../../../../assets/css/_windowTitleBar.css";

/**
 * This is the main window manager component. It's the custom window frame that we add to each window that has useFSBLHeader set to true in its windowDescriptor.
 */


function init () {
	// The following line fixes the CSS issues, weird..
	const css = require("../../../../assets/css/finsemble.css");
	// Create the header element
	const template = document.createElement("div");
	const FSBLHeader = document.createElement('div')
	FSBLHeader.setAttribute('id', 'FSBLHeader')
	template.appendChild(FSBLHeader)
	document.body.insertBefore(template.firstChild, document.body.firstChild);
	initializeTitlebar(function (store, actions) {
		console.log("============= ", windowTitleBarStore);
		ReactDOM.render(<WindowTitleBar store={store} actions={actions}/>, FSBLHeader);
	});
}

// we do not need to wait for FSBL ready because this file gets required after FSBL is ready.
init();
