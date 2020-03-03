/*!
* Copyright 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";

/**
 * The image modal (light box)
 * @param {object} props Component props
 * @param {func} props.closeModal Parent function to close the modal. Actual display is handled by CSS
 * @param {object} props.children The inner contents (elements) of the array
 */
const Modal = props => {
	let modalClassName = "modal";
	if (props.open) {
		modalClassName += " open";
	} else {
		modalClassName += " closed";
	}

	return (
		<div className={modalClassName} onClick={props.closeModal}>
			<div className="modal-main">
				{props.children}
			</div>
		</div>
	);
}

export default Modal;