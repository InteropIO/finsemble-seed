/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";

import LinkerMenu from "@chartiq/finsemble-ui/lib/components/linkerMenu/linkerMenu";
import onReady from '@chartiq/finsemble-ui/lib/effects/onready';
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";
import "../css/linkerWindow.css"

onReady(() => ReactDOM.render(<LinkerMenu />, document.getElementById("main")));
