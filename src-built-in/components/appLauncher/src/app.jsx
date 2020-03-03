/*!
* Copyright 2020 by ChartIQ, Inc.
* All rights reserved.
*/

import React from "react";
import ReactDOM from "react-dom";
//Finsemble font-icons, general styling, and specific styling.
import "../appLauncher.css";
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";
import ComponentList from "./components/componentList";
import * as storeExports from "./stores/appLauncherStore";
import { Actions as appLauncherActions } from "./stores/appLauncherStore";
let appLauncherStore;

import {
	FinsembleMenu,
	FinsembleMenuItem,
	FinsembleMenuItemLabel,
	FinsembleMenuLabel,
	FinsembleMenuSection,
	FinsembleMenuSectionLabel
} from "@chartiq/finsemble-react-controls";




/**
 * This is our application launcher. It is opened from a button in our sample toolbar, and it handles the launching of finsemble components.
 *
 * @class AppLauncher
 * @extends {React.Component}
 */
class AppLauncher extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			dimensions: {},
			componentList: {}
		};
	}

	componentWillMount() {
		var self = this;
		//Focus on the window when it is shown so that a click elsewhere will trigger a blur.
		finsembleWindow.addEventListener("shown", function () {
			finsembleWindow.focus();
		});
	}

	openQuickComponent() {
		//FSBL.Clients.LauncherClient.spawn("QuickComponentForm", { monitor: "mine" });
		FSBL.Clients.DialogManager.open("QuickComponentForm", {}, () => { });
	}

	openAppCatalog() {
		FSBL.Clients.LauncherClient.showWindow(
			{
				componentType: "App Catalog"
			},
			{
				monitor: "mine",
				staggerPixels: 0,
				spawnIfNotFound: true,
				left: "center",
				top: "center"
			});
	}

	render() {
		var self = this;
		return (<FinsembleMenu>
			<FinsembleMenuSection className="menu-secondary">
				{<FinsembleMenuItem>
					<FinsembleMenuItemLabel onClick={this.openQuickComponent}>
						New App
					</FinsembleMenuItemLabel>
				</FinsembleMenuItem> }
				<FinsembleMenuItem>
					<FinsembleMenuItemLabel onClick={this.openAppCatalog}>
						App Catalog
					</FinsembleMenuItemLabel>
				</FinsembleMenuItem>
			</FinsembleMenuSection>
			<ComponentList />
		</FinsembleMenu>);
	}
}


if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}

function FSBLReady() {
	// var Test = require('./test');
	//console.log("appLauncher app onReady");
	storeExports.initialize(function (store) {
		appLauncherStore = store;
		ReactDOM.render(
			<AppLauncher />
			, document.getElementById("bodyHere"));
	});
}
