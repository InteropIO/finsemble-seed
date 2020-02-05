/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";

import App from "../../linkerRefactored/linker";
import onReady from "../../UIAPI/effects/index";

onReady(() => ReactDOM.render(<App />, document.getElementById("main")));