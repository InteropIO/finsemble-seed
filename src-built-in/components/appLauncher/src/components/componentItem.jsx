/*!
* Copyright 2020 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";
import { Actions as appLauncherActions } from "../stores/appLauncherStore";
import { FinsembleMenuItem, FinsembleMenuItemLabel, FinsembleMenuItemAction } from "@chartiq/finsemble-react-controls";

export default class componentItem extends React.Component {
	constructor() {
		super();
		this.bindCorrectContext();
		this.guidIdentifierMap = {};
		this.dragImage = document.createElement("img");
		this.dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='; // '../assets/img/drag-image.png';
		this.configCache = {};
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
		event.dataTransfer.setDragImage(this.dragImage, 0, 0);
		event.dataTransfer.setData('text/plain', JSON.stringify({ waitForIdentifier: true, guid: guid }));

	//console.log("starting drag. called start tiling");
		FSBL.Clients.WindowClient.startTilingOrTabbing({ waitForIdentifier: true, componentType: component.component.type });

		this.props.itemAction(component, { options: { autoShow: false } }, (identifier) => {
		//console.log("starting drag. called send identifier");
			FSBL.Clients.WindowClient.sendIdentifierForTilingOrTabbing({ windowIdentifier: identifier });
			FSBL.Clients.RouterClient.publish('Finsemble.' + guid, identifier);
			this.guidIdentifierMap[guid] = identifier;
		});
		this.dragging = true;
	}

	stopDrag(event) {
		this.dragging = false;
	//console.log("stopping drag. called stop tiling.");
	//console.log(this.guidBeingDragged, this.guidIdentifierMap[this.guidBeingDragged]);
		delete this.guidIdentifierMap[this.guidBeingDragged];
		delete this.guidBeingDragged;
		FSBL.Clients.WindowClient.stopTilingOrTabbing({
			allowDropOnSelf: true, mousePosition: {
				x: event.nativeEvent.screenX,
				y: event.nativeEvent.screenY
			}
		});
	}

	render() {
		var self = this;
		var component = this.props.component,
			itemAction = this.props.itemAction,
			togglePin = this.props.togglePin;

		/* Terry, 10/15/18 - orphaned code
		var name = this.props.name;
		var delItemClassList = "empty-delete";
		var actionItemClasses = "ff-pin";
		var pinClassList = this.props.isPinned ? actionItemClasses + " app-launcher-pinned" : actionItemClasses + " app-launcher-component-pinner";

		if (this.props.custom) {
			pinClassList += " deleteItem";
			delItemClassList = "app-launcher-delete ff-delete";
		}

		var delItem = (<div onClick={this.deleteItem} className={delItemClassList}></div>);
		*/

		return (<FinsembleMenuItem
			label={this.props.name}
			title={this.props.name}
			onLabelClick={function () {
				itemAction(component, {});
			}}
			isDeletable={this.props.isUserDefined}
			deleteAction={this.deleteItem}
			draggable={true}
			onDragStart={(e) => {
               //console.log("Menu Item drag - TAB");
                this.startDrag(e, component);
			}}
			onDragEnd={
				(e) => {
				//console.log("Menu Item drag - TAB");
					this.stopDrag(e, component);
				}
			}
			isPinnable={true}
			pinIcon={'ff-favorite'}
			activePinModifier={'finsemble-item-pinned'}
			isPinned={this.props.isPinned}
			pinAction={function () {
				togglePin(component);
			}}/>);
	}
}