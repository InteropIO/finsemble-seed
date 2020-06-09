import React from "react";
import { FinsembleButton, FinsembleButtonLabel, FinsembleFontIcon } from "@chartiq/finsemble-react-controls";

export default class WorkspaceLauncherButton extends React.Component {
	constructor(props) {
		super(props);
		this.bindCorrectContext();
	}

	bindCorrectContext() {
		this.onClick = this.onClick.bind(this);
	}

	onClick(e) {
		var self = this;
		FSBL.Clients.DistributedStoreClient.getStore({ store: "Finsemble-WorkspaceMenu-Global-Store", global: true }, function (err, store) {
			store.Dispatcher.dispatch({ actionType: "switchToWorkspace", data: {
				name: self.props.label
			}});
		});
	}

	render() {
		return (<FinsembleButton edge="top bottom" buttonType={["Toolbar"]} onClick={this.onClick}>
			<FinsembleFontIcon className="finsemble-toolbar-button-icon pinned-icon pinned-workspace-icon" icon="ff-adp-workspace"/>
			<FinsembleButtonLabel className="finsemble-toolbar-button-label" align="right" label={this.props.label}/>
		</FinsembleButton>);
	}
}

