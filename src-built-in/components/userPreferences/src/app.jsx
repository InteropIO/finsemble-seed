/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import { initialize as UserPreferencesStoreInitialize, Store as UserPreferencesStore, Actions as UserPreferencesActions } from "./stores/UserPreferencesStore";
import "../../assets/css/finfont.css";
import "../../assets/css/finsemble.css";
import "../UserPreferences.css";

import ReactDOM from "react-dom"
import LeftNav from './components/LeftNav';
import ContentSection from './components/ContentSection'
import * as storeExports from "../../workspaceManagementMenu/src/stores/workspaceManagementMenuStore";
var WorkspaceManagementMenuGlobalStore;
class UserPreferences extends React.Component {
	constructor() {
		super();
		this.bindCorrectContext();
		this.addListeners();
		this.state = {
			activeSection: 'workspaces'
		}
	}
	bindCorrectContext() {
		this.addListeners = this.addListeners.bind(this);
		this.setActiveSection = this.setActiveSection.bind(this);
	}
	addListeners() {
		UserPreferencesStore.addListener({ field: "activeSection" }, this.setActiveSection);
	}
	setActiveSection(err, data) {
		this.setState({
			activeSection: data.value
		});
	}

	render() {
		let navConfig = require('./navSections.json');
		return (<div className="user-preferences" >
			<div className="complex-menu-wrapper">
				<LeftNav entries={navConfig.Entries} />
				<ContentSection activeSection={this.state.activeSection} />
			</div>
		</div>);
	}
}


fin.desktop.main(function () {
	FSBL.addEventListener("onReady", function () {
		FSBL.Clients.WindowClient.finsembleWindow.updateOptions({ alwaysOnTop: true });
		FSBL.Clients.WindowClient.finsembleWindow.addEventListener("shown", FSBL.Clients.DialogManager.showModal);

		storeExports.initialize(() => {
			WorkspaceManagementMenuGlobalStore = storeExports.GlobalStore;
			UserPreferencesStoreInitialize(WorkspaceManagementMenuGlobalStore, (store) => {
				ReactDOM.render(
					<UserPreferences />
					, document.getElementById("UserPreferences-component-wrapper"));

			})
		});
	});
});