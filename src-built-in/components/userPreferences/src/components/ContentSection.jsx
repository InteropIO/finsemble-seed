import React from "react";
import General from "./content/General";
import Workspaces from "./content/Workspaces";

let content = {
	general: General,
	workspaces: Workspaces,
};
export default class ContentSection extends React.Component {
	constructor(props) {
		super(props);
	}

	hideWindow() {
		FSBL.Clients.DialogManager.hideModal();
		FSBL.Clients.WindowClient.finsembleWindow.hide();
	}

	render() {
		let Component = content[this.props.activeSection];
		return (
			<div className="complex-menu-content-row">
				<div className="complex-menu-header">
					<div className="content-section-header">
						{this.props.activeSection.charAt(0).toUpperCase() +
							this.props.activeSection.slice(
								1,
								this.props.activeSection.length
							)}
					</div>
					<div
						onClick={this.hideWindow}
						className="ff-close complex-menu-close"
					></div>
				</div>
				<Component />
			</div>
		);
	}
}
