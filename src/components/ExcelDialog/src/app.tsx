import React from "react";
import ReactDOM from "react-dom";
import { Provider } from 'react-redux'
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "../../../../assets/css/theme.css";
import ExcelDialog from "./components/ExcelDialog";
import store from "./redux/store";
import "./app.css";

ReactDOM.render(
	<FinsembleProvider>
		<Provider store={store}>
			<ExcelDialog />
		</Provider>
	</FinsembleProvider>,
	document.getElementById("ExcelDialog-tsx")
);
