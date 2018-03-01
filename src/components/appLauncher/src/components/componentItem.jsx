/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";
import { Actions as appLauncherActions } from "../stores/appLauncherStore";
import { FinsembleMenuItem, FinsembleMenuItemLabel, FinsembleMenuItemAction, FinsembleMenuItemActions } from "@chartiq/finsemble-react-controls";

export default class componentItem extends React.Component {
	constructor() {
		super();
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.deleteItem = this.deleteItem.bind(this);
	}
	deleteItem() {
		appLauncherActions.handleRemoveCustomComponent(this.props.name);
	}
	render() {
		var self = this;
		var component = this.props.component,
			itemAction = this.props.itemAction,
			togglePin = this.props.togglePin;

		var name = this.props.name;
		var delItemClassList = "empty-delete";
		var actionItemClasses = "ff-pin";
		var pinClassList = this.props.isPinned ? actionItemClasses + " app-launcher-pinned" : actionItemClasses + " app-launcher-component-pinner";

		if (this.props.custom) {
			pinClassList += " deleteItem";
			delItemClassList = "app-launcher-delete ff-delete";
		}

		var delItem = (<FinsembleMenuItemAction onClick={this.deleteItem} className={delItemClassList}></FinsembleMenuItemAction>);

		return (<FinsembleMenuItem label={this.props.name}
			onLabelClick={function () {
				itemAction(component, {});
			}}
			isDeletable={this.props.isUserDefined}
			deleteAction={this.deleteItem}
			isPinnable={true}
			isPinned={this.props.isPinned}
			pinAction={function () {
				togglePin(component);
			}}/>);
	}
}