/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import { FinsembleHoverDetector } from "@chartiq/finsemble-react-controls";

/**
 * Always on top button. This button is hidden when the window is maximized. In its place is the restore button.
 */
export default class AlwaysOnTop extends React.Component {
	constructor(props) {
		super(props);
		this.changeAlwaysOnTop = this.changeAlwaysOnTop.bind(this);
		this.alwaysOnTopListener = this.alwaysOnTopListener.bind(this);
		this.hoverAction = this.hoverAction.bind(this);
	}

	alwaysOnTopListener(event) {
		if (event.data.alwaysOnTop !== this.state.alwaysOnTop) {
			this.setState({
				alwaysOnTop: event.data.alwaysOnTop
			});
		}
	}

	componentWillMount() {
		this.setState({
			alwaysOnTop: false
		})
		finsembleWindow.isAlwaysOnTop((err, alwaysOnTop) => {
			this.setState({
				alwaysOnTop
			})
		});
		finsembleWindow.addEventListener("alwaysOnTop", this.alwaysOnTopListener);
	}

	componentWillUnmount() {
		finsembleWindow.removeEventListener("alwaysOnTop", this.alwaysOnTopListener);
	}

	changeAlwaysOnTop() {
		const newState = !this.state.alwaysOnTop;
		finsembleWindow.alwaysOnTop(newState, () => {
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