import React from "react";
import { FinsembleButton } from "@chartiq/finsemble-react-controls";

// Store
import ToolbarStore from "../stores/toolbarStore";

export default class AutoArrange extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isAutoArranged: false
		};
		this.bindCorrectContext();
		let self = this;
		FSBL.Clients.LauncherClient.getMonitorInfo({
			windowIdentifier: FSBL.Clients.LauncherClient.windowIdentifier
		}, (err, monitorInfo) => {
			FSBL.Clients.RouterClient.subscribe('DockingService.AutoarrangeStatus', function (err, response) {
				self.setState({
					isAutoArranged: response.data.isAutoArranged && response.data.isAutoArranged[monitorInfo.name]
				});
			});
		})

	}

	bindCorrectContext(){
		this.autoArrange = this.autoArrange.bind(this);
	}

	autoArrange() {
		this.setState({
			isAutoArranged: !this.state.isAutoArranged
		});
		FSBL.Clients.WorkspaceClient.autoArrange({}, () => {
			ToolbarStore.bringToolbarToFront();
		});
	}

	render() {
		let tooltip = this.state.isAutoArranged ? "Restore" : "Auto Arrange";
		let wrapperClasses = this.props.classes + " icon-only";
		if (this.state.isAutoArranged) {
			wrapperClasses += " highlighted";
		}
		let buttonClass = "finsemble-toolbar-button-icon ff-grid";
		return (<FinsembleButton className={wrapperClasses} buttonType={["Toolbar"]} title={tooltip} onClick={this.autoArrange}>
			<i className={buttonClass}></i>
		</FinsembleButton>);
	}
}
