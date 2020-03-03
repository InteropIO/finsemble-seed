/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";
import * as storeExports from "../stores/searchStore";
let menuStore;
export default class AppList extends React.Component {
	constructor() {
		super();
		this.bindCorrectContext();
		this.state = {

		};
	}
	bindCorrectContext() {
		this.itemClick = this.itemClick.bind(this);
	}

	itemClick() {
	//console.log("this.props click", this.props)
		FSBL.Clients.SearchClient.invokeItemAction(this.props.app, this.props.app.actions[0]);//make this only use spawn for now

		setTimeout(() => {//we do this because the originating window doesn't exist in the launcher if we dont wait.
			FSBL.Clients.WindowClient.finsembleWindow.close();
			FSBL.Clients.DialogManager.hideModal();
		}, 100);

	}

	componentWillMount() {

	}
	createIcon() {
		if (!this.props.app.icon) {
			return <div style={{ backgroundImage: "url(src/assets/logo-placeholder-52.png)" }} className="logo"></div>
		}
		if (this.props.app.icon.type === "fonticon") {
			return <div className="iconContainer"><div className={"icon " + this.props.app.icon.path}></div></div>
		}
		if (this.props.app.icon.type === "url") {
		//console.log(" this.props.app.icon.path", this.props.app.icon.path)
			return <div style={{
				backgroundImage: "url(" + this.props.app.icon.path + ")"
			}} className="logo"></div>
		}
	}

	render() {
		const { app, openDetails } = this.props;
		return <div className="appItem">
			<div onClick={() => openDetails(app)} className="appHeader">
				{this.createIcon.call(this)}
				<div className="titleContainer">
					<div className="title">{app.displayName || app.name}</div>
					<div className="vendor">{app.vendor}</div>
				</div>
			</div>
			<div className="containerFooter">
				<div className="footerLeft"></div>
				<div className="footerRight">
					<div className="openButton" onClick={this.itemClick}>Open</div>
				</div>
			</div>
		</div>
	}
}