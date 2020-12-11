import React from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "../../../../assets/css/theme.css";

const ExcelTester = () => {
	console.log("My code is running");
	/* Your functional react component code here */

	return <>{/*Your render code here*/}</>;
};

ReactDOM.render(
	<FinsembleProvider>
		<ExcelTester />
	</FinsembleProvider>,
	document.getElementById("ExcelTester-tsx")
);
