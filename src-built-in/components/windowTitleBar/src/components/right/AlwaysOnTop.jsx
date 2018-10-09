/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import { FinsembleHoverDetector } from "@chartiq/finsemble-react-controls";
import { getStore, Actions as HeaderActions } from "../../stores/windowTitleBarStore";
let windowTitleBarStore;
/**
 * Always on top button. This button is hidden when the window is maximized. In its place is the restore button.
 */
export default class AlwaysOnTop extends React.Component {
	constructor(props) {
		super(props);
		this.changeAlwaysOnTop = this.changeAlwaysOnTop.bind(this);
		this.hoverAction = this.hoverAction.bind(this);
	}

	componentWillMount() {
		this.setState({
			alwaysOnTop: false
		})
		FSBL.Clients.WindowClient.finsembleWindow.getOptions((err, descriptor) => {
			this.setState({
				alwaysOnTop: descriptor.alwaysOnTop
			})
		});
	}

	changeAlwaysOnTop() {
		let newState = !this.state.alwaysOnTop;
		FSBL.Clients.WindowClient.setAlwaysOnTop(newState, () => {
			this.setState({
				alwaysOnTop: newState
			})
		});
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

	/**
	 * Render method.
	 *
	 * @returns
	 * @memberof AlwaysOnTop
	 */
	render() {
		let iconClasses = "ff-always-on-top ";
		let wrapClasses = "fsbl-icon ";
		if (this.state && this.state.alwaysOnTop) wrapClasses += "fsbl-icon-highlighted ";
		let tooltip = "Always on Top";

		return (<div className={wrapClasses} id="fsbl-window-restore" title={tooltip} data-hover={this.state.hoverState} onClick={this.changeAlwaysOnTop}>
				<FinsembleHoverDetector edge="top" hoverAction={this.hoverAction} />
			<i className={iconClasses}></i>
		</div>);
	}
}