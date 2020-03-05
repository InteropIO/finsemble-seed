/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

import React from "react";
import ReactDOM from "react-dom";
//Finsemble font-icons, general styling, and specific styling.
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";
import "../appCatalog.css";
import "../../complexMenu/menu.css";
import { AppCatalog } from "@chartiq/finsemble-ui/lib/components/appCatalog/appCatalog";

ReactDOM.render(
		<AppCatalog />
		, document.getElementById("bodyHere"));