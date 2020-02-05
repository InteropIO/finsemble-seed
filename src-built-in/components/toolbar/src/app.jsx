/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

// Static vs Dynamic Toolbar
// import Toolbar from "./staticToolbar";
import Toolbar from "./dynamicToolbar";
import ToolbarRefactored from "../../toolbarRefactored/app.tsx";
import onReady from "../../UIAPI/effects/index";
import ReactDOM from "react-dom";
import React from "react";

onReady(() => ReactDOM.render(<ToolbarRefactored />, document.getElementById("toolbar_refactored")));