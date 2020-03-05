/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

import React from "react";
import ReactDOM from "react-dom";
//Finsemble font-icons, general styling, and specific styling.
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";
import "../appCatalog.css";
import "../../complexMenu/menu.css";
import { AppCatalog } from "@chartiq/finsemble-ui/src/components/appCatalog/appCatalog";

if (window.FSBL && FSBL.addEventListener) { FSBL.addEventListener("onReady", FSBLReady); } else { window.addEventListener("FSBLReady", FSBLReady) }
function FSBLReady() {
	//console.log("App Catalog app onReady");
	FSBL.Clients.WindowClient.finsembleWindow.updateOptions({ alwaysOnTop: true });
	FSBL.Clients.DialogManager.showModal();
	//FSBL.Clients.WindowClient.finsembleWindow.addEventListener("shown", FSBL.Clients.DialogManager.showModal);

	ReactDOM.render(
		<AppCatalog />
		, document.getElementById("bodyHere"));
}