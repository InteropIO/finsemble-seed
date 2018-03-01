/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";

export default class componentItem extends React.Component {
	constructor() {
		super();
		this.bindCorrectContext();
		this.state = {
			bestMatch: false
		};
	}
	bindCorrectContext() {
		this.deleteItem = this.deleteItem.bind(this);
	}
	deleteItem() {
		//appLauncherActions.handleRemoveCustomComponent(this.props.name);
	}
	render() {
		var self = this;
		if (this.props.item.actions.length <= 1) {
			return <div className={"resultItem action " + (this.props.isActive ? "bestmatch active" : "")}>
				<div className={"resultName "} onClick={function () {
					if (!self.props.item.actions[0]) return;
					self.props.onClick(self.props.item, self.props.item.actions[0]);
				}}>{this.props.item.name}</div>
			</div>
		}
		return <div className={"resultItem " + (this.props.isActive ? "bestmatch active" : "")}><div className={"resultName "}>{this.props.item.name}</div>
			<div className="actions">{(this.props.item.actions.map(function (action, index) {
				return <div key={"actionbtn" + index} className="action actionButton" onClick={function () {
					self.props.onClick(self.props.item, action);
				}}>{action.name}</div>
			}))}
			</div>
		</div>
	}
}