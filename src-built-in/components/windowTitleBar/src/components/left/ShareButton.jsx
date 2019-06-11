/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
import { FinsembleHoverDetector } from "@chartiq/finsemble-react-controls";
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
			<svg width="16px" height="14px" viewBox="0 0 16 14" version="1.1" xmlns="http://www.w3.org/2000/svg">
				<g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
					<g id="atoms/icons/share-context" transform="translate(-9.000000, -10.000000)">
						<g id="Share-Context" transform="translate(9.000000, 10.000000)">
							<path d="M7,3 L6,3 L6,1 L1,1 L1,13 L6,13 L6,10 L7,10 L7,13 C7,13.5522847 6.55228475,14 6,14 L1,14 C0.44771525,14 6.76353751e-17,13.5522847 0,13 L0,1 C-6.76353751e-17,0.44771525 0.44771525,1.01453063e-16 1,0 L6,0 C6.55228475,-1.01453063e-16 7,0.44771525 7,1 L7,3 Z" id="Combined-Shape" fill="#8E939F"></path>
							<path d="M9,11 L10,11 L10,13 L15,13 L15,1 L10,1 L10,2 L9,2 L9,1 C9,0.44771525 9.44771525,1.01453063e-16 10,0 L15,0 C15.5522847,-1.01453063e-16 16,0.44771525 16,1 L16,13 C16,13.5522847 15.5522847,14 15,14 L10,14 C9.44771525,14 9,13.5522847 9,13 L9,11 Z" id="Combined-Shape" fill="#ECEDEF"></path>
							<rect id="Rectangle" fill="#ECEDEF" x="4" y="6" width="8" height="1" rx="0.5"></rect>
							<polyline id="ic_chevron-copy-20" stroke="#ECEDEF" strokeLinecap="round" strokeLinejoin="round" transform="translate(10.500000, 6.500000) scale(-1, -1) rotate(90.000000) translate(-10.500000, -6.500000) " points="8 5 10.3477027 7.75481318 12.8721831 5.00000001"></polyline>
						</g>
					</g>
				</g>
			</svg>
			<FinsembleHoverDetector edge="top" hoverAction={this.hoverAction.bind(this)} />
		</div>);
	}
}
