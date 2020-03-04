/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
import "../../../../assets/css/finsemble.css";

import { SingleInputDialog } from "@chartiq/finsemble-ui/lib/components/singleInputDialog/singleInputDialog";

//render component when FSBL is ready.

function FSBLReady() {
	ReactDOM.render(
		<SingleInputDialog />
		, document.getElementById("singleInputDialog-component-wrapper"));
}

if (window.FSBL && FSBL.addEventListener) { FSBL.addEventListener("onReady", FSBLReady); } else { window.addEventListener("FSBLReady", FSBLReady) }

