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
		this.getGroupMask();
		this.getDragScrim();
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
		this.groupMaskShown = this.groupMaskShown.bind(this);
		this.groupMaskHidden = this.groupMaskHidden.bind(this);
	}

	getGroupMask() {
		FSBL.FinsembleWindow.wrap({ name: "groupMask" }, (err, wrappedWindow) => {
			if (!wrappedWindow) {
				return setTimeout(() => { this.getGroupMask() }, 100); //wait for group mask to be loaded
			}
			this.setState({ groupMask: wrappedWindow });
		});
	}

	getDragScrim() {
		FSBL.Clients.LauncherClient.spawn("Docking Move Mask", {options: {autoShow: false}}, (err, response) => {
			FSBL.FinsembleWindow.wrap(response.windowIdentifier, (err, wrappedWindow) => {
				this.setState({ dragScrim: wrappedWindow });
			});
		});
	}

	startMouseTracking(component) {
		console.log("In Mouse Tracking");
		FSBL.System.getMousePosition((err, mp) => {
			mp.height = component.window.height? component.window.height: 600;
			mp.width = component.window.width?component.window.width: 800;
			console.log("In Mouse Tracking", mp);
			if (this.dragging) {
				if (!this.dragScrimVisible && !this.groupMaskVisible) {
					console.log("show scrim");
					this.state.dragScrim.show();
					this.dragScrimVisible = true;
				} else if (this.groupMaskVisible && this.dragScrimVisible) {
					console.log("hide scrim");
					this.state.dragScrim.hide();
					this.dragScrimVisible = false;
				}
				if (this.dragScrimVisible) {
					this.state.dragScrim.setBounds(mp);
				}

				setTimeout(() => {
					this.startMouseTracking(component);
				}, 10);

			} else {
				console.log("hide scrim");
				this.state.dragScrim.hide();
				this.dragScrimVisible = false;
				if (this.state.groupMask) {
					this.state.groupMask.removeEventListener("shown", this.groupMaskShown);
					this.state.groupMask.removeEventListener("hidden", this.groupMaskHidden);
				}
			}
		});
	}

	groupMaskShown() {
		console.log('group mask shown');
		this.groupMaskVisible = true;
	}

	groupMaskHidden() {
		console.log('group mask hidden');
		this.groupMaskVisible = false;
	}


	deleteItem() {
		appLauncherActions.handleRemoveCustomComponent(this.props.name);
	}

	startDrag(event, component) {
		let guid = Date.now() + '_' + Math.random();
		this.guidBeingDragged = guid;
		event.dataTransfer.setDragImage(this.dragImage, 0, 0);

		console.log("starting drag. called starttiling");
		FSBL.Clients.WindowClient.startTilingOrTabbing({ waitForIdentifier: true });

		component.dontHideSelf = true;
		finsembleWindow.updateOptions({ opacity: 0.01 });
		this.props.itemAction(component, { options: { autoShow: false } }, (identifier) => {
			console.log("starting drag. called sendidentifier");
			FSBL.Clients.WindowClient.sendIdentifierForTilingOrTabbing({ windowIdentifier: identifier });
			this.guidIdentifierMap[guid] = identifier;
		});
		this.dragging = true;
		this.state.groupMask.addEventListener("shown", this.groupMaskShown);
		this.state.groupMask.addEventListener("hidden", this.groupMaskHidden);
		this.startMouseTracking(component);
	}

	stopDrag(event) {
		finsembleWindow.hide();
		finsembleWindow.updateOptions({ opacity: 1 });
		this.dragging = false;
		console.log("stopping drag. called stoptiling.");
		console.log(this.guidBeingDragged, this.guidIdentifierMap[this.guidBeingDragged]);
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