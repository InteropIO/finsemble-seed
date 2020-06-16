/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */
import React from "react";
import ReactDOM from "react-dom";
import ToolbarStore from "../stores/toolbarStore";

// Toolbar Components
import {
	FinsembleToolbar,
	FinsembleButton,
	FinsembleToolbarSection,
	FinsembleToolbarSeparator,
} from "@chartiq/finsemble-react-controls";

// External Components to show on Toolbar
import AutoArrange from "../components/AutoArrange";
import MinimizeAll from "../components/MinimizeAll";

import BringToFront from "../components/BringToFront";
import WorkspaceLauncherButton from "../components/WorkspaceLauncherButton";
import WorkspaceMenuOpener from "../components/WorkspaceMenuOpener";
// Styles
import "../toolbar.css";
import "../../../assets/css/font-finance.css";
import "../../../assets/css/finsemble.css";

var pinnableItems = {
	componentLauncher: FinsembleButton,
	workspaceSwitcher: WorkspaceLauncherButton,
};

export default class Toolbar extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		finsembleWindow.bringToFront();
	}

	render() {
		return (
			<FinsembleToolbar>
				<FinsembleToolbarSection name="left" className="left">
					<FinsembleButton
						preSpawn={true}
						buttonType={["MenuLauncher", "Toolbar"]}
						iconClasses="finsemble-toolbar-brand-logo"
						icon="../../../assets/img/Finsemble_Taskbar_Icon.png"
						menuType="File Menu"
					/>
					<WorkspaceMenuOpener />
					<FinsembleButton
						preSpawn={true}
						buttonType={["MenuLauncher", "Toolbar"]}
						label="Apps"
						menuType="App Launcher"
					/>
					<FinsembleToolbarSeparator />
				</FinsembleToolbarSection>
				<FinsembleToolbarSection
					name="center"
					handlePins={true}
					className="center"
					handleOverflow={true}
					pinnableItems={pinnableItems}
				></FinsembleToolbarSection>
				<FinsembleToolbarSection name="right" className="right">
					<FinsembleToolbarSeparator />
					<AutoArrange />
					<MinimizeAll />
					<BringToFront />
				</FinsembleToolbarSection>
			</FinsembleToolbar>
		);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}
function FSBLReady() {
	ToolbarStore.initialize(function() {
		ReactDOM.render(<Toolbar />, document.getElementById("toolbar_parent"));
	});
}
