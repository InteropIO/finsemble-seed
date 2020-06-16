/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */
import React from "react";
import { FinsembleHoverDetector } from "@chartiq/finsemble-react-controls";
import {
	getStore,
	Actions as HeaderActions,
} from "../../stores/windowTitleBarStore";
let windowTitleBarStore;
/**
 * Close button, located on the far right of the window Manager.
 */
export default class CloseButton extends React.Component {
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
	 * @memberof CloseButton
	 */
	bindCorrectContext() {
		this.hoverAction = this.hoverAction.bind(this);
	}
	/**
	 * Listener invoked when the user clicks the close button.
	 *
	 * @memberof CloseButton
	 */
	onClick() {
		HeaderActions.clickClose();
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
	 * Render method
	 *
	 * @returns
	 * @memberof CloseButton
	 */
	render() {
		return (
			<div
				onClick={this.onClick}
				className="fsbl-icon fsbl-close"
				data-hover={this.state.hoverState}
				title="Close"
				id="fsbl-window-close"
			>
				<FinsembleHoverDetector
					edge="top right"
					hoverAction={this.hoverAction}
				/>
				<i className="ff-close"></i>
			</div>
		);
	}
}
