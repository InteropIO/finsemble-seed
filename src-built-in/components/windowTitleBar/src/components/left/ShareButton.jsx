/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
import HoverDetector from "../HoverDetector.jsx";
import { getStore, Actions as HeaderActions } from "../../stores/windowTitleBarStore";
let windowTitleBarStore;
export default class ShareButton extends React.Component {
	constructor(props) {
		super(props);
		this.bindCorrectContext();
        /**
		 * We assign in the constructor instead of via a require at the top of the file because the store is initialized asynchronously.
		 */
		windowTitleBarStore = getStore();

		this.state = {
			emitterEnabled: windowTitleBarStore.getValue({ field: "Sharer.emitterEnabled" }),
			hoverState: "false"
		};
	}
    /**
     * This is necessary to make sure that the `this` inside of the callback is correct.
     *
     * @memberof ShareButton
     */
	bindCorrectContext() {
		this.onEmitterChanged = this.onEmitterChanged.bind(this);
		this.hoverAction = this.hoverAction.bind(this);
	}

    /**
     *
     *
     * @param {any} err
     * @param {any} response
     * @memberof ShareButton
     */
	onEmitterChanged(err, response) {
		this.setState({ emitterEnabled: response.value });
	}

    /**
     * When the user starts to drag the share button, let the DragAndDropClient know.
     *
     * @param {any} ev
     * @memberof ShareButton
     */
	onDragStart(ev) {
		FSBL.Clients.DragAndDropClient.dragStart(ev);
	}

    /**
     * Add listeners to store.
     *
     * @memberof ShareButton
     */
	componentWillMount() {
		windowTitleBarStore.addListener({ field: "Sharer.emitterEnabled" }, this.onEmitterChanged);
		windowTitleBarStore.addListener({ field: "Sharer.receiverHandler" }, this.onReceiverhandler);
	}
    /**
     * Remove listeners from the store.
     *
     * @memberof ShareButton
     */
	componentWillUnmount() {
		windowTitleBarStore.removeListener({ field: "Sharer.emitterEnabled" }, this.onEmitterChanged);
		windowTitleBarStore.removeListener({ field: "Sharer.receiverHandler" }, this.onReceiverhandler);
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

	render() {
		if (!this.state.emitterEnabled) {
			return null;
		}
		return (<div className="fsbl-icon cq-no-drag ff-share" title="Drag To Share" data-hover={this.state.hoverState} draggable="true" onDragStart={this.onDragStart}>
			<HoverDetector edge="top" hoverAction = {this.hoverAction.bind(this)} />
        </div>);
	}
}