import React from "react";
import { FinsembleButton } from "@chartiq/finsemble-react-controls";

export default class AutoArrange extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isAutoArranged: false
		};
		this.bindCorrectContext();
		let self = this;
		FSBL.Clients.RouterClient.subscribe('DockingService.AutoarrangeStatus', function (err, response) {
			self.setState({
				isAutoArranged: response.data.isAutoArranged
			});
		});
	}

	bindCorrectContext(){
		this.autoArrange = this.autoArrange.bind(this);
	}

	autoArrange() {
		this.setState({
			isAutoArranged: !this.state.isAutoArranged
		});
		FSBL.Clients.WorkspaceClient.autoArrange();
	}

	render() {
		let tooltip = this.state.isAutoArranged ? "Restore" : "Auto Arrange";
		let buttonClass = this.state.isAutoArranged ? "finsemble-toolbar-button-icon ff-ungrid" : "finsemble-toolbar-button-icon ff-grid";
		return (<FinsembleButton className={this.props.classes + " icon-only"} buttonType={["Toolbar"]} title={tooltip} onClick={this.autoArrange}>
			<i className={buttonClass}></i>
		</FinsembleButton>);
	}
}