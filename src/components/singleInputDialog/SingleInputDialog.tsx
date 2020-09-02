/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */
import React from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@cosaic/finsemble-ui/react/components/FinsembleProvider";
import { SingleInputDialog } from "@cosaic/finsemble-ui/react/components/Dialog";
import "@cosaic/finsemble-ui/react/assets/css/finsemble.css";
import "../../../assets/css/theme.css";

ReactDOM.render(
	<FinsembleProvider>
		<SingleInputDialog />
	</FinsembleProvider>,
	document.getElementById("SingleInputDialog-tsx")
);
