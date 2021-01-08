import React from "react";
import ReactDOM from "react-dom";
import { Provider } from 'react-redux'
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "../../../../assets/css/theme.css";
import ExcelTester from "./components/ExcelTester";
import store from "./redux/store";
import { OFFICE_ADDIN_REGISTER } from './redux/actions/actionTypes';
import { officeAddinRegister } from "./redux/actions/actions";

ReactDOM.render(
	<FinsembleProvider>
		<Provider store={store}>
			<ExcelTester />
		</Provider>
	</FinsembleProvider>,
	document.getElementById("ExcelTester-tsx")
);



// FSBL.Clients.RouterClient.query('OFFICE_ADDIN_REGISTER', { actions: ['GET_EXCEL_FILE_LIST'] }, (err, res) => {
  
// 	//FSBL.Clients.RouterClient.query(res.data.data[0].id, {}, (err, res) => { console.log(res) })
//   })