import React from "react";
import { FinsembleButton } from "@chartiq/finsemble-react-controls";

import { ReactComponent as AutoArrangeIcon } from '../../../../assets/img/toolbar/auto-arrange.svg'

// Store
import ToolbarStore from "../stores/toolbarStore";

export default class AutoArrange extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isAutoArranged: false,
			autoArrangeData: {}
		};
		this.autoArrange = this.autoArrange.bind(this);
	}

	componentDidMount() {
		FSBL.Clients.LauncherClient.getMonitorInfo({
			windowIdentifier: FSBL.Clients.LauncherClient.windowIdentifier
		}, (err, monitorInfo) => {
			if (err) {
				return FSBL.Clients.Logger.error(err)
			}
			FSBL.Clients.RouterClient.subscribe('DockingService.AutoarrangeStatus', (err, response) => {
				if (err) {
					return FSBL.Clients.Logger.error(err)
				}
				this.setState({
					isAutoArranged: response.data.isAutoArranged && response.data.isAutoArranged[monitorInfo.name]
				});
			});
		});

		/*
			11/6/19 JC: If the auto arrange status changes this could be due to the toolbar changing monitors.
			The old way only pulled monitor info once and compared against the updating auto arrange status.
			This way, every time the auto arrange status changes get the updated monitor info
			from docking and compare against updated monitor info
		*/
		FSBL.Clients.RouterClient.subscribe('DockingService.AutoarrangeStatus', (err, response) => {
			FSBL.Clients.WindowClient.getMonitorInfo({}, (err, monitorInfo) => {
				this.setState({
					autoArrangeData: response.data.isAutoArranged,
					isAutoArranged: response.data.isAutoArranged && response.data.isAutoArranged[monitorInfo.name]
				});
			});
		});

		//If the toolbar is moved, recalculate the auto arrange status since the monitor might have changed
		finsembleWindow.addEventListener('bounds-change-end', () => {
			FSBL.Clients.WindowClient.getMonitorInfo({}, (err, monitorInfo) => {
				this.setState({
					isAutoArranged: this.state.autoArrangeData && this.state.autoArrangeData[monitorInfo.name]
				});
			});
		});
	}


	autoArrange() {
		FSBL.Clients.WorkspaceClient.autoArrange({}, () => {
			ToolbarStore.bringToolbarToFront();
		});
	}

	render() {
		// To re-enable auto-arrange set AutoArrangeEnabled=true -- this should only be done for in-house testing
		const AutoArrangeEnabled = false;

		if (AutoArrangeEnabled) {
			const autoArrangedCss = this.state.isAutoArranged ? "auto-arranged" : "";

			// the below enables AutoArrange by returning the AutoArrange icon to be rendered
			return (
				<FinsembleButton
					className={`icon-only window-mgmt-right ${autoArrangedCss}`}
					buttonType={["Toolbar"]}
					title={this.state.isAutoArranged ? "Restore" : "Auto Arrange"}
					onClick={this.autoArrange}>
					<span>
						<AutoArrangeIcon />
					</span>
				</FinsembleButton>
			);
		} else {
			// the below effectively disables AutoArrange by returning an empty div to be rendered for the auto-arrange icon
			return (<div></div>);
		}

	}
}
