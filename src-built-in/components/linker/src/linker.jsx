/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";

import Linker from "../../linkerRefactored/linker";
import onReady from "../../UIAPI/effects/index";

import { LinkerMenu } from "@chartiq/finsemble-ui/lib/components/linker/linkerMenu";
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";
import "../css/linkerWindow.css"

ReactDOM.render(<LinkerMenu />, document.getElementById("main"));
