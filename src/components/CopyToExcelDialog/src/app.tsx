import React from "react";
import ReactDOM from "react-dom";
import { Provider } from 'react-redux'
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "../../../../assets/css/theme.css";
import CopyToExcelDialog from "./components/CopyToExcelDialog";
import store from "./redux/store";
import "./app.css";

ReactDOM.render(
	<FinsembleProvider>
		<Provider store={store}>
			<CopyToExcelDialog />
		</Provider>
	</FinsembleProvider>,
	document.getElementById("CopyToExcelDialog-tsx")
);
