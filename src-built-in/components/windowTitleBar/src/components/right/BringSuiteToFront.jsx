/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
import { FinsembleHoverDetector } from "@chartiq/finsemble-react-controls";
import { getStore, Actions as HeaderActions } from "../../stores/windowTitleBarStore";
let windowTitleBarStore;

export default class MinimizeButton extends React.Component {
	constructor(props) {
		super(props);
		this.bindCorrectContext();
		/**
		 * We assign in the constructor instead of via a require at the top of the file because the store is initialized asynchronously.
		 */
		windowTitleBarStore = getStore();
		this.state = { hoverState: "false", show: false, groups: [] };
		this.onLeftClick = this.onLeftClick.bind(this);
		this.onShiftClick = this.onShiftClick.bind(this);
		this.handleClick = this.handleClick.bind(this);
	}

	/**
	 * This is necessary to make sure that the `this` inside of the callback is correct.
	 *
	 * @memberof MinimizeButton
	 */
	bindCorrectContext() {
		this.hoverAction = this.hoverAction.bind(this);
	}


	/**
     * When your mouse enters/leaves the hoverDetector, this function is invoked.
     *
     * @param {any} newHoverState
     * @memberof LinkerButton
     */
	hoverAction(newHoverState) {
		this.setState({ hoverState: newHoverState });
	}

	componentDidMount() {
		FSBL.Clients.LauncherClient.getGroupsForWindow({ windowIdentifier: FSBL.Clients.LauncherClient.myWindowIdentifier }, (err, groups) => {
			if (groups.length) {
				this.setState({
					show: true,
					groups: groups
				});
			}
		});
	}
	/**
	 * Invoked when the user clicks the minimize button.
	 *
	 * @memberof MinimizeButton
	 */
	onLeftClick() {
		this.state.groups.forEach((groupName) => {
			FSBL.Clients.LauncherClient.bringWindowsToFront({ restoreWindows: true, groupName: groupName });
		});
	}

	onShiftClick() {
		return HeaderActions.hyperFocus({
			linkerChannel: null,
			includeDockedGroups: true,
			includeAppSuites: true
		});
	}
	handleClick(e) {
		if (e.shiftKey) {
			return this.onShiftClick(e);
		}
		this.onLeftClick(e);
	}
	/**
	 * Render method.
	 *
	 * @returns
	 * @memberof MinimizeButton
	 */
	render() {
		if (!this.state.show) return null;
		return (<div className="fsbl-icon" id="fsbl-window-minimize" data-hover={this.state.hoverState} title="Reveal App Suite" onClick={this.handleClick}>
			<FinsembleHoverDetector edge="top" hoverAction={this.hoverAction} />
			<i style={{ paddingTop: "6px" }} className="ff-ungrid"></i>
		</div>);
	}
}