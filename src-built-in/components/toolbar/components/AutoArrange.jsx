import React from "react";
import { FinsembleButton } from "@chartiq/finsemble-react-controls";

// Store
import ToolbarStore from "../stores/toolbarStore";

export default class AutoArrange extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isAutoArranged: false,
			autoArrangeData: {}
		};
		this.bindCorrectContext();
		let self = this;
		/*
			11/6/19 JC: If the auto arrange status changes this could be due to the toolbar changing monitors.
			The old way only pulled monitor info once and compared against the updating auto arrange status.
			This way, every time the auto arrange status changes get the updated monitor info 
			from docking and compare against updated monitor info
		*/
		FSBL.Clients.RouterClient.subscribe('DockingService.AutoarrangeStatus', function(err, response) {
			FSBL.Clients.WindowClient.getMonitorInfo({}, (err, monitorInfo) => {
				self.setState({
					autoArrangeData: response.data.isAutoArranged,
					isAutoArranged: response.data.isAutoArranged && response.data.isAutoArranged[monitorInfo.name]
				});
			});
		});

		//If the toolbar is moved, recalculate the auto arrange status since the monitor might have changed
		finsembleWindow.addEventListener('bounds-change-end', () => {
			FSBL.Clients.WindowClient.getMonitorInfo({}, (err, monitorInfo) => {
				self.setState({
					isAutoArranged: this.state.autoArrangeData && this.state.autoArrangeData[monitorInfo.name]
				});
			});
		});
	}

	bindCorrectContext(){
		this.autoArrange = this.autoArrange.bind(this);
	}

	autoArrange() {
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
