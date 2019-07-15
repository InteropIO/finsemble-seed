import React from "react";
import { FinsembleButton } from "@chartiq/finsemble-react-controls";

import { ReactComponent as AutoArrangeIcon } from '../../../../assets/img/toolbar/auto-arrange.svg'

// Store
import ToolbarStore from "../stores/toolbarStore";

export default class AutoArrange extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isAutoArranged: false
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
		})
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
		const autoArrangedCss = this.state.isAutoArranged ? "auto-arranged" : "";


		return (
			<FinsembleButton
				className={`icon-only window-mgmt-right ${autoArrangedCss}`}
				buttonType={["Toolbar"]}
				title={this.state.isAutoArranged ? "Restore" : "Auto Arrange"}
				onClick={this.autoArrange}>
				<AutoArrangeIcon />
			</FinsembleButton>
		);
	}
}
