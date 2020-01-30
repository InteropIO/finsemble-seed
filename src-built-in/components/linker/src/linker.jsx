/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";

import Linker from "../../linkerRefactored/linker";
import onReady from "../../UIAPI/effects/index";

onReady(() => ReactDOM.render(<Linker />, document.getElementById("main")));