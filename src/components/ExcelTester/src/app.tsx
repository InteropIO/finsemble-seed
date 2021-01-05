import React from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "../../../../assets/css/theme.css";

const ExcelTester = () => {
	/* Your functional react component code here */
	FSBL.Clients.RouterClient.query('OFFICE_ADDIN_REGISTER', {actions:['GET_EXCEL_FILE_LIST']}, (err, res)=>{
		console.log(res)
		FSBL.Clients.RouterClient.query(res.data.data[0].id, {}, (err,res)=>{console.log(res)})
	})
	return <>{/*Your render code here*/}</>;
};

ReactDOM.render(
	<FinsembleProvider>
		<ExcelTester />
	</FinsembleProvider>,
	document.getElementById("ExcelTester-tsx")
);
