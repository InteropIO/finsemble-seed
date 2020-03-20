/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import { FinsembleHoverDetector } from "@chartiq/finsemble-react-controls";
import { getStore, Actions as HeaderActions } from "../../../../../../../finsemble-ui/src/components/windowTitlebar/stores/windowTitleBarStore";
let windowTitleBarStore;
/**
 * Maximize button. This button is hidden when the window is maximized. In its place is the restore button.
 */
export default class MaximizeButton extends React.Component {
	constructor(props) {
		super(props);
		this.bindCorrectContext();
		/**
		 * We assign in the constructor instead of via a require at the top of the file because the store is initialized asynchronously.
		 */
		windowTitleBarStore = getStore();
		this.state = {
			maximized: windowTitleBarStore.getValue({ field: "Maximize.maximized" }),
			hoverState: "false"
		};
	}
	/**
	 * This is necessary to make sure that the `this` inside of the callback is correct.
	 *
	 * @memberof MaximizeButton
	 */
	bindCorrectContext() {
		this.onMaximized = this.onMaximized.bind(this);
		this.onRestored = this.onRestored.bind(this);
		this.hoverAction = this.hoverAction.bind(this);
	}

	/**
	 * When the state changes, this listener is invoked. There are two states: Not maximized, and maximized. When the window is maximized, the button changes to an icon that denotes "Restore to previous size."
	 *
	 * @param {any} err
	 * @param {any} response
	 * @memberof MaximizeButton
	 */
	onRestored(err, response) {
		//console.log("onRestored")
		this.setState({ maximized: false });
	}
	onMaximized() {
		//console.log("onMaximized")
		this.setState({ maximized: true });
	}
	/**
	 * Invoked when the user clicks the button.
	 *
	 * @memberof MaximizeButton
	 */
	onClick() {
		HeaderActions.clickMaximize();
	}

	/**
	 * Add listeners to the store.
	 *
	 * @memberof MaximizeButton
	 */
	componentWillMount() {
		//console.log("componentWillMount")
		FSBL.Clients.WindowClient.finsembleWindow.addListener("maximized", this.onMaximized)
		FSBL.Clients.WindowClient.finsembleWindow.addListener("restored", this.onRestored);

		//windowTitleBarStore.addListener({ field: "Maximize.maximized" }, this.onMaxChange);
	}

	/**
	 * Remove listeners from the store.
	 *
	 * @memberof MaximizeButton
	 */
	componentWillUnmount() {
		//console.log("unmount this")
		FSBL.Clients.WindowClient.finsembleWindow.removeListener("maximized", this.onMaximized)
		FSBL.Clients.WindowClient.finsembleWindow.removeListener("restored", this.onRestored)
		//windowTitleBarStore.removeListener({ field: "Maximize.maximized" }, this.onMaxChange);
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
	 * @memberof MaximizeButton
	 */
	render() {
		let iconClasses = "";
		let wrapClasses = "fsbl-icon fsbl-maximize ";
		let tooltip = this.state.maximized ? "Restore" : "Maximize";

		//Classes for the maximize button.
		iconClasses += this.state.maximized ? "ff-restore" : "ff-maximize";
		//Classes for the wrap
		wrapClasses += this.state.maximized ? "window-restore" : "window-max";

		return (<div className={wrapClasses} id="fsbl-window-restore" title={tooltip} data-hover={this.state.hoverState} onClick={this.onClick}>
			<FinsembleHoverDetector edge="top" hoverAction={this.hoverAction} />
			<i className={iconClasses}></i>
		</div>);
	}
}