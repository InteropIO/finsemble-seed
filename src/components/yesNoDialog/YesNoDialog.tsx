/*!
 * The yes/no dialog is a component that shows the user two options - one to act on a particular option, one to cancel it.
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */

import React from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@cosaic/finsemble-ui/react/components/FinsembleProvider";
import { YesNoDialog } from "@cosaic/finsemble-ui/react/components/Dialog";
import "@cosaic/finsemble-ui/react/assets/css/finsemble.css";
import "../../../assets/css/theme.css";

ReactDOM.render(
	<FinsembleProvider>
		<YesNoDialog />
	</FinsembleProvider>,
	document.getElementById("YesNoDialog-tsx")
);
