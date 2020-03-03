/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import { FinsembleHoverDetector } from "@chartiq/finsemble-react-controls";
import { getStore, Actions as HeaderActions } from "../../stores/windowTitleBarStore";
let windowTitleBarStore;

export default class DockingButton extends React.Component {
	constructor(props) {
		super(props);
		this.bindEventHandlers();
    /**
		 * We assign in the constructor instead of via a require at the top of the file because the store is initialized asynchronously.
		 */
		windowTitleBarStore = getStore();
		this.state = {
			showDockingTooltip: false,
			dockingIcon: windowTitleBarStore.getValue({ field: "Main.dockingIcon" }),
			hoverState: "false"
		};
	}

    /**
     * This is necessary to make sure that the `this` inside of the callback is correct.
     *
     * @memberof DockingButton
     */
    bindEventHandlers() {
        this.onClick = this.onClick.bind(this);
		this.onStoreChanged = this.onStoreChanged.bind(this);
		this.hoverAction = this.hoverAction.bind(this);
	}

    /**
     * Add listeners to the store.
     *
     * @memberof DockingButton
     */
	componentWillMount() {
		windowTitleBarStore.addListeners([{ field: "Main.dockingIcon", listener: this.onStoreChanged }]);
	}

    /**
     * Remove listeners from the store.
     *
     * @memberof DockingButton
     */
	componentWillUnmount() {
		windowTitleBarStore.removeListeners([{ field: "Main.dockingIcon", listener: this.onStoreChanged }]);
	}

    /**
     * Invoked when the store emits a change event. The icon will change. If we're grouped, we show the button that denotes group membership. If we're just snapped, we show the button that will group attached windows.
     *
     * @param {any} err
     * @param {any} response
     * @memberof DockingButton
     */
	onStoreChanged(err, response) {
		this.setState({ dockingIcon: response.value});
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
     * Invoked when the user clicks the docking button.
     *
     * @memberof DockingButton
     */

    onClick(e) {        
		HeaderActions.toggleGroup();
	}

    /**
     * Render method
     *
     * @returns
     * @memberof DockingButton
     */
	render() {
		let iconClass = "ff-";
		let wrapClasses = "fsbl-icon fsbl-icon-bordered docking-control";

		iconClass += this.state.dockingIcon === "ejector" ? "attached" : "detached";
		let toolTip = this.state.dockingIcon === "ejector" ? "Detach Window" : "Attach Windows";

		if (iconClass === "ff-attached") {
			wrapClasses += " fsbl-icon-highlighted";
		}

		return (<div className={wrapClasses} id="fsbl-window-ejector" title={toolTip} data-hover={this.state.hoverState} onClick={this.onClick}>
            <FinsembleHoverDetector edge="top" hoverAction={this.hoverAction} />
            <i className={iconClass}></i>
        </div>);
	}
}