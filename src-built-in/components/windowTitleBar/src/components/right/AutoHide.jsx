/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import { FinsembleHoverDetector } from "@chartiq/finsemble-react-controls";
import { Actions as HeaderActions } from "../../stores/windowTitleBarStore";

/**
 * Auto-hide window chrome toggle button.
 */
export default class AutoHide extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			autoHide: false,
			hoverState: false
		};
		this.changeAutoHide = this.changeAutoHide.bind(this);
		this.hoverAction = this.hoverAction.bind(this);
	}

	componentDidMount() {
		FSBL.Clients.WindowClient.getComponentState({
			field: 'autoHide',
		}, (err, state) => {
			let stateToSet = (err || !state) ? HeaderActions.getDefaultAutoHide() : state;
			this.setState({
				autoHide: stateToSet
			});
			HeaderActions.setAutoHide(stateToSet,  () => {
				FSBL.Clients.Logger.system.debug("Loaded with AutoHide state: ", stateToSet);
			});
		});
	}

	changeAutoHide() {
		const newState = !this.state.autoHide;
		return HeaderActions.setAutoHide(newState,  () => {
			FSBL.Clients.WindowClient.setComponentState({
				field: 'autoHide',
				value: newState
			}, () => {
				this.setState({
					autoHide: newState
				});
			});
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
		let iconClasses = "ff-insiders-2 ";
		let wrapClasses = "fsbl-icon ";
		if (this.state && this.state.autoHide) wrapClasses += "fsbl-icon-highlighted ";
		const tooltip = "Auto-hide window chrome";

		return (<div className={wrapClasses} 
					id="fsbl-window-autohide" title={tooltip} 
					data-hover={this.state.hoverState} 
					onClick={this.changeAutoHide} 
					style={this.props.visible ? {} : { display: "none" }}>
				<FinsembleHoverDetector edge="top" hoverAction={this.hoverAction} />
			<i className={iconClasses}></i>
		</div>);
	}
}
