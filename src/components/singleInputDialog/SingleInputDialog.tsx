/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */
import React from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@chartiq/finsemble-ui/react/components/FinsembleProvider";
import { SingleInputDialog } from "@chartiq/finsemble-ui/react/components/Dialog";
import "@chartiq/finsemble-ui/react/assets/css/finsemble.css";
import "../../../assets/css/theme.css";

ReactDOM.render(
	<FinsembleProvider>
		<SingleInputDialog />
	</FinsembleProvider>,
	document.getElementById("SingleInputDialog-tsx")
);
