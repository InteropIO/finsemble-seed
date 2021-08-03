import React from "react";
import ReactDOM from "react-dom";
import { Provider } from 'react-redux'
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "../../../../public/assets/css/theme.css";
import ExcelTester from "./components/ExcelTester";
import store from "./redux/store";
import "./app.css";

ReactDOM.render(
	<FinsembleProvider>
		<Provider store={store}>
			<ExcelTester />
		</Provider>
	</FinsembleProvider>,
	document.getElementById("ExcelTester-tsx")
);
