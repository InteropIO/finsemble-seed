import React from "react";
import { FinsembleButton } from "@chartiq/finsemble-react-controls";

export default class AlwaysOnTop extends React.Component {
	constructor(props) {
		super(props);
		this.changeAlwaysOnTop = this.changeAlwaysOnTop.bind(this);
	}

	componentWillMount() {
		this.setState({
			alwaysOnTop: false
		})
		FSBL.Clients.WindowClient.finsembleWindow.getOptions((err, descriptor) => {
			this.setState({
				alwaysOnTop: descriptor.alwaysOnTop
			})
		});
	}

	changeAlwaysOnTop() {
		let newState = !this.state.alwaysOnTop;
		FSBL.Clients.WindowClient.finsembleWindow.updateOptions({ alwaysOnTop: newState }, () => {
			this.setState({
				alwaysOnTop: newState
			})
		});
	}

	render() {
		let tooltip = "Always on Top";
		let buttonClass = "ff-always-on-top finsemble-toolbar-button-icon";
		return (<FinsembleButton className={this.props.classes + " icon-only" + (this.state.alwaysOnTop ? " fsbl-icon-highlighted" : "")} buttonType={["Toolbar"]} title={tooltip} onClick={this.changeAlwaysOnTop}>
			<i className={buttonClass}></i>
		</FinsembleButton>);
	}
}