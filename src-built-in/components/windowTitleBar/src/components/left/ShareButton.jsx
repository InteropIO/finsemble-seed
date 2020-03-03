/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
import { FinsembleHoverDetector } from "@chartiq/finsemble-react-controls";
import { getStore, Actions as HeaderActions } from "../../stores/windowTitleBarStore";
import { ReactComponent as ShareIcon } from '../../../../../../assets/img/titlebar/share.svg'
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
			hoverState: "false"
		};
	}
	/**
	 * This is necessary to make sure that the `this` inside of the callback is correct.
	 *
	 * @memberof ShareButton
	 */
	bindCorrectContext() {
		this.hoverAction = this.hoverAction.bind(this);
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
		windowTitleBarStore.addListener({ field: "Sharer.receiverHandler" }, this.onReceiverhandler);
	}
	/**
	 * Remove listeners from the store.
	 *
	 * @memberof ShareButton
	 */
	componentWillUnmount() {
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
		/* [Terry] was causing Sharer to never show. Deprecated?
		if (!this.state.emitterEnabled) {
			return null;
		}
		*/
		return (<div className="fsbl-icon fsbl-share" title="Drag To Share" data-hover={this.state.hoverState} draggable="true" onDragStart={this.onDragStart}>
			<ShareIcon />
			<FinsembleHoverDetector edge="top" hoverAction={this.hoverAction.bind(this)} />
		</div>);
	}
}
