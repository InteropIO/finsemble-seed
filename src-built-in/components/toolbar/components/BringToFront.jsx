import React from "react";
import { FinsembleButton } from "@chartiq/finsemble-react-controls";

// Store
import ToolbarStore from "../stores/toolbarStore";

export default class BringToFront extends React.Component {
	constructor(props) {
		super(props);
	}
	bringToFront() {
		FSBL.Clients.LauncherClient.bringWindowsToFront({}, () => {
			ToolbarStore.bringToolbarToFront();
		});
	}
	render() {
		let tooltip = "Bring all Windows to the Front";
		let buttonClass = "ff-bring-to-front finsemble-toolbar-button-icon";
		return (<FinsembleButton className={this.props.classes + " icon-only"} buttonType={["Toolbar"]} title={tooltip} onClick={this.bringToFront}>
			<i className={buttonClass}></i>
		</FinsembleButton>);
	}
}
