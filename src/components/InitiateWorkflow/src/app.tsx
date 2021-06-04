import React from "react";
import ReactDOM from "react-dom";
import { Provider } from 'react-redux'
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import InitiateWorkflow from "./components/InitiateWorkflow";

import "./app.css";

ReactDOM.render(
	<FinsembleProvider>
		<InitiateWorkflow />
	</FinsembleProvider>,
	document.getElementById("InitiateWorkflow-tsx")
);
