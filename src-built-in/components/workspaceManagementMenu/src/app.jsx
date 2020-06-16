/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */
import React from "react";
import ReactDOM from "react-dom";
import * as storeExports from "./stores/workspaceManagementMenuStore";
import { Actions as WorkspaceManagementMenuActions } from "./stores/workspaceManagementMenuStore";
import WorkspaceActions from "./components/workspaceActions";
import WorkspaceList from "./components/workspaceList";

import { FinsembleMenu } from "@chartiq/finsemble-react-controls";

import "../workspaceManagementMenu.css";
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";
let WorkspaceManagementMenuStore;
// var Test = require('./test');

class WorkspaceManagementMenu extends React.Component {
	constructor() {
		super();
		this.bindCorrectContext();
		this.state = {
			WorkspaceList: WorkspaceManagementMenuActions.getWorkspaceList(),
			activeWorkspace: WorkspaceManagementMenuActions.getActiveWorkspace(),
			pinnedWorkspaces: this.convertPinnedWorkspacesToArray(),
		};
	}
	bindCorrectContext() {
		this.onStoreChange = this.onStoreChange.bind(this);
		this.onPinChange = this.onPinChange.bind(this);
	}

	convertPinnedWorkspacesToArray() {
		var pins = WorkspaceManagementMenuActions.getPins();
		var arr = [];
		pins.forEach((pin) => {
			arr.push(pin.label);
		});
		return arr;
	}

	onStoreChange() {
		this.setState(
			{
				WorkspaceList: WorkspaceManagementMenuActions.getWorkspaceList(),
				activeWorkspace: WorkspaceManagementMenuActions.getActiveWorkspace(),
			},
			function() {
				WorkspaceManagementMenuActions.setHeight();
			}
		);
	}

	onPinChange() {
		this.setState({
			pinnedWorkspaces: this.convertPinnedWorkspacesToArray(),
		});
	}

	componentWillMount() {
		WorkspaceManagementMenuStore.addListeners([
			{ field: "WorkspaceList", listener: this.onStoreChange },
			{ field: "activeWorkspace", listener: this.onStoreChange },
			{ field: "isSwitchingWorkspaces", listener: this.onStoreChange },
			{ field: "pins", listener: this.onPinChange },
		]);
	}

	componentWillUnmount() {
		WorkspaceManagementMenuStore.removeListeners([
			{ field: "WorkspaceList", listener: this.onStoreChange },
			{ field: "activeWorkspace", listener: this.onStoreChange },
			{ field: "pins", listener: this.onPinChange },
		]);
	}

	render() {
		var self = this;
		return (
			<FinsembleMenu>
				<WorkspaceActions />
				<WorkspaceList
					activeWorkspace={self.state.activeWorkspace}
					workspaces={self.state.WorkspaceList}
					pinnedWorkspaces={self.state.pinnedWorkspaces}
				/>
			</FinsembleMenu>
		);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}
function FSBLReady() {
	//console.log("WorkspaceManagementMenu onReady");
	storeExports.initialize(function(store) {
		WorkspaceManagementMenuStore = store;
		ReactDOM.render(
			<WorkspaceManagementMenu />,
			document.getElementById("workspaceManagementMenu-component-wrapper")
		);
	});
}
