/*!
* Copyright 2020 by ChartIQ, Inc.
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
		this.state = { hoverState: "false" };
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
	 * Invoked when the user clicks the minimize button.
	 *
	 * @memberof MinimizeButton
	 */
	onClick() {
		HeaderActions.clickMinimize();
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
	 * @memberof MinimizeButton
	 */
	render() {
		return (<div className="fsbl-icon fsbl-minimize" id="fsbl-window-minimize" data-hover={this.state.hoverState} title="Minimize" onClick={this.onClick}>
			<FinsembleHoverDetector edge="top" hoverAction={this.hoverAction} />
			<i className="ff-minimize"></i>
		</div>);
	}
}