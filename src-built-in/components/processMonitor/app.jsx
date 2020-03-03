/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";

import { ProcessMonitor } from "@chartiq/finsemble-ui/src/components/processMonitor/processMonitor";

if (window.FSBL && FSBL.addEventListener) { FSBL.addEventListener("onReady", FSBLReady); } else { window.addEventListener("FSBLReady", FSBLReady) }
function FSBLReady() {
	ReactDOM.render(<ProcessMonitor />, document.getElementById("ProcessMonitor-component-wrapper"));
}