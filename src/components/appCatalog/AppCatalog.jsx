/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */
import React from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@chartiq/finsemble-ui/react/components";
import { AppCatalog } from "@chartiq/finsemble-ui/react/components";
import "../../../assets/css/theme.css";

ReactDOM.render(
	<FinsembleProvider>
		<AppCatalog />
	</FinsembleProvider>,
	document.getElementById("AppCatalog-component-wrapper")
);
