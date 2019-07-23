import React from "react";
import { FinsembleButton } from "@chartiq/finsemble-react-controls";

export default class MinimizeAll extends React.Component {
	constructor(props) {
		super(props);
	}
	MinimizeAll() {
		FSBL.Clients.WorkspaceClient.minimizeAll();
	}
	render() {
		let tooltip = "Minimize Workspace";
		let buttonClass = "ff-minimize-all finsemble-toolbar-button-icon";
		return (<FinsembleButton className={this.props.classes + " icon-only"} buttonType={["Toolbar"]} title={tooltip} onClick={this.MinimizeAll}>
			<i className={buttonClass}></i>
		</FinsembleButton>);
	}
}