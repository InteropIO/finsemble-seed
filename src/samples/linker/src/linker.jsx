/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
import { FinsembleMenu, FinsembleMenuItem, FinsembleMenuSection, FinsembleMenuSectionLabel } from "@chartiq/finsemble-react-controls";
import "../../assets/css/finfont.css";
import "../../assets/css/finsemble.scss";
import "../../assets/css/CIQ_Seed.css";
import "./css/linkerWindow.css";
import * as storeExports from "./stores/linkerStore";
let LinkerStore = storeExports.Store;
let LinkerActions = storeExports.Actions;

class Linker extends React.Component {
	constructor() {
		super();
		this.onStoreChanged = this.onStoreChanged.bind(this);
		this.finWindow = fin.desktop.Window.getCurrent();
	}
	/**
	 * When the store changes, set the react component's state, forcing a rerender.
	 *
	 * @param {any} changeEvent
	 * @memberof Linker
	 */
	onStoreChanged(changeEvent) {
		switch (changeEvent) {
		case "state":
			this.setState({
				groups: LinkerStore.getGroups(),
				attachedWindowIdentifier: LinkerStore.getAttachedWindowIdentifier()
			});
		}
	}
	/**
	 * Event handler when the user clicks on a colored rectangle, indicating that they want the attached window to join the group.
	 *
	 * @param {any} group
	 * @param {any} active
	 * @returns
	 * @memberof Linker
	 */
	groupClicked(group, active) {
		var attachedWindowIdentifier = LinkerStore.getAttachedWindowIdentifier();
		var attachedWindow = fin.desktop.Window.wrap(attachedWindowIdentifier.uuid, attachedWindowIdentifier.windowName);
		attachedWindow.focus();

		if (!active) return LinkerActions.addToGroup(group.name);
		LinkerActions.removeFromGroup(group.name);
	}
	/**
	 * Hides window on blur.
	 *
	 * @memberof Linker
	 */
	onWindowBlur() {
		this.finWindow.hide();
	}
	/**
	 * Fit the contents of the dom to the openfin window's bounds. Also set the component's state.
	 *
	 * @memberof Linker
	 */
	componentWillMount() {

		this.finWindow.addEventListener("blurred", this.onWindowBlur.bind(this));
		LinkerStore.addListener(["stateChanged"], this.onStoreChanged);

		FSBL.Clients.WindowClient.fitToDOM();
		this.setState({
			groups: LinkerStore.getGroups(),
			attachedWindowIdentifier: LinkerStore.getAttachedWindowIdentifier()
		});
	}

	render() {
		var self = this;
		//Checkbox inside of a circle. Rendered in the center of a group if the attachedWindow is part of that group.
		let activeGroupIndicator = (<i className="active-linker-group ff-check-circle"></i>);
		/**
		 * This function iterates through all of the groups that have registered with the linkerClient. If the attachedWindow belongs to any of them, it renders a checkmark and a circle in the center of the group's rectangle.
		 **/
		let groups = FSBL.Clients.LinkerClient.allGroups.map(function (item, index) {
			//Boolean, whether the attachedWindow belongs to the group.
			let activeGroup = self.state.groups.filter(function (g) { return g.name == item.name; }).length;
			let groupClass = `linkerGroup ${item.label}`;

			if (activeGroup) {
				groupClass += " active";
			}

			let style = {
				backgroundColor: item.color,
				border: "1px solid " + item.border
			};
			//returns a group row. It's essentially a colored rectangle.
			return (<div key={item.name + index} className={groupClass} style={style} onClick={function () {
				self.groupClicked(item, activeGroup);
			}}>
				{activeGroup ? activeGroupIndicator : null}
			</div>);
		});

		return (
			<div className="linkerContainer">
				{groups}
			</div>
		);
	}
}

fin.desktop.main(function () {
	FSBL.addEventListener("onReady", function () {
		LinkerStore.initialize();
		ReactDOM.render(<Linker />, document.getElementById("main"));
	});
});