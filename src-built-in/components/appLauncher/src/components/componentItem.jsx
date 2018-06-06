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
		this.guidIdentifierMap = {};
	}
	bindCorrectContext() {
		this.deleteItem = this.deleteItem.bind(this);
		this.startDrag = this.startDrag.bind(this);
		this.stopDrag = this.stopDrag.bind(this);
	}
	deleteItem() {
		appLauncherActions.handleRemoveCustomComponent(this.props.name);
	}
	startDrag(event, component) {
		let guid = Date.now() + '_' + Math.random();
		this.guidBeingDragged = guid;

		this.props.itemAction(component, { options: { autoShow: false } }, (identifier) => {
			FSBL.FinsembleWindow.wrap(identifier, (err, wrappedWindow) => {
				this.guidIdentifierMap[guid] = wrappedWindow;
			});
		});
	}
	stopDrag(event) {
		let moveWindow = (top, left, guid) => {
			if (this.guidIdentifierMap[guid]) {
				let wrappedWindow = this.guidIdentifierMap[guid];
				wrappedWindow.getBounds((err, bounds) => {
					bounds.top = top;
					bounds.left = left;
					wrappedWindow.setBounds(bounds);
					wrappedWindow.show();
				});
				delete this.guidIdentifierMap[guid];
			} else { //wait for spawn to finish
				setTimeout(() => {
					moveWindow(top, left, guid);
				}, 100);
			}
		}
		let top = event.nativeEvent.screenY;
		let left = event.nativeEvent.screenX;
		moveWindow(top, left, this.guidBeingDragged);
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

		return (<FinsembleMenuItem
			label={this.props.name}
			onLabelClick={function () {
				itemAction(component, {});
			}}
			isDeletable={this.props.isUserDefined}
			deleteAction={this.deleteItem}
			draggable={true}
			onDragStart={(e) => {
                console.log("Menu Item drag - TAB");
                this.startDrag(e, component);
			}}
			onDragEnd={
				(e) => {
					console.log("Menu Item drag - TAB");
					this.stopDrag(e, component);
				}
			}
			isPinnable={true}
			pinIcon={'ff-pin'}
			activePinModifier={'finsemble-item-pinned'}
			isPinned={this.props.isPinned}
			pinAction={function () {
				togglePin(component);
			}}/>);
	}
}