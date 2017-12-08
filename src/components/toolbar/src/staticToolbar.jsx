/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";

// Toolbar Components
import { FinsembleToolbar, FinsembleButton, FinsembleToolbarSection, FinsembleToolbarSeparator } from "@chartiq/finsemble-react-controls";

// External Components to show on Toolbar
import AutoArrange from "../components/AutoArrange";
import BringToFront from "../components/BringToFront";
import WorkspaceLauncherButton from "../components/WorkspaceLauncherButton";

// Styles
import "../../assets/css/finsemble.scss";
import "../../assets/css/finfont.css";
import "../toolbar.scss";

var pinnableItems = {
	"componentLauncher": FinsembleButton,
	"workspaceSwitcher": WorkspaceLauncherButton
};

export default class Toolbar extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		fin.desktop.Window.getCurrent().bringToFront();
	}

	render() {
		return (<FinsembleToolbar>
			<FinsembleToolbarSection name="left" className="left">
				<FinsembleButton preSpawn={true} buttonType={["MenuLauncher", "Toolbar"]} iconClasses="finsemble-toolbar-brand-logo" icon="http://localhost:3375/components/assets/img/Finsemble_Taskbar_Icon.png" menuType="File Menu" />
				<FinsembleButton preSpawn={true} buttonType={["MenuLauncher", "Toolbar"]} label="Workspaces" menuType="Workspace Management Menu" />
				<FinsembleButton preSpawn={true} buttonType={["MenuLauncher", "Toolbar"]} label="Apps" menuType="App Launcher" />
				<FinsembleToolbarSeparator />
			</FinsembleToolbarSection>
			<FinsembleToolbarSection name="center" handlePins={true} className="center" handleOverflow={true} pinnableItems={pinnableItems}></FinsembleToolbarSection>
			<FinsembleToolbarSection name="right" className="right">
				<FinsembleToolbarSeparator />
				<AutoArrange />
				<BringToFront />
			</FinsembleToolbarSection>
		</FinsembleToolbar>);
	}
}

FSBL.addEventListener("onReady", function () {
	ReactDOM.render(
		<Toolbar />
		, document.getElementById("toolbar_parent"));
});