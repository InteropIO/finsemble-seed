/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";

import { AppCatalog } from "@chartiq/finsemble-ui/react/components";

import "@chartiq/finsemble-ui/src/assets/css/finsemble.css"
import "../../../assets/css/_themeWhiteLabel.css";

ReactDOM.render(
	<AppCatalog />,
	document.getElementById("bodyHere"));
