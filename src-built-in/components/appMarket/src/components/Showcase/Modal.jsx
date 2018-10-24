/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";

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