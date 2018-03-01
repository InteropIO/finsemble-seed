/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

import React from "react";
import ReactDOM from "react-dom";
//Finsemble font-icons, general styling, and specific styling.
import "../../assets/css/finfont.css";
import "../../assets/css/finsemble.scss";
import "../appLauncher.scss";
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
		this.finWindow = fin.desktop.Window.getCurrent();

		this.state = {
			dimensions: {},
			componentList: {}
		};
	}

	componentWillMount() {
		var self = this;
		//Focus on the window when it is shown so that a click elsewhere will trigger a blur.
		this.finWindow.addEventListener("shown", function () {
			self.finWindow.focus();
		});
	}

	openAdHoc() {
		FSBL.Clients.LauncherClient.spawn("AdhocComponentForm", { monitor: "mine" });
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
				<FinsembleMenuItem>
					<FinsembleMenuItemLabel onClick={this.openAdHoc}>
						<i className="ff-new-workspace"></i> New App
					</FinsembleMenuItemLabel>

				</FinsembleMenuItem>
				<FinsembleMenuItem>
					<FinsembleMenuItemLabel onClick={this.openAppCatalog}>
						<i className="ff-list"></i> App Catalog
					</FinsembleMenuItemLabel>
				</FinsembleMenuItem>
			</FinsembleMenuSection>
			<FinsembleMenuSectionLabel>
				Applications
			</FinsembleMenuSectionLabel>
			<ComponentList />
		</FinsembleMenu>);
	}
}

fin.desktop.main(function () {
	FSBL.addEventListener("onReady", function () {
		// var Test = require('./test');
		console.log("appLauncher app onReady");

		storeExports.initialize(function (store) {
			appLauncherStore = store;
			ReactDOM.render(
				<AppLauncher />
				, document.getElementById("bodyHere"));
		});
	});
});