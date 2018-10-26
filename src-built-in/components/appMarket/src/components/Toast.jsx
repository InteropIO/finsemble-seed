/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";

const Toast = props => {
	let classes = "toast-content";
	let icon = null, messageContent = null;

	switch (props.installationActionTaken) {
		case "add":
			icon = 'ff-check-mark';
			messageContent = "Added to My Apps";
			classes += " success";
			break;
		case "remove":
			icon = 'ff-close';
			messageContent = "Removed from My Apps";
			classes += " error";
			break;
		default:
			classes += " not-shown";
			break;
	}

	if (messageContent !== null) {
		return (
			<div className={classes}>
				<span className='toast'>
					<i className={icon} />
					&nbsp;&nbsp;{messageContent}
				</span>
			</div>
		);
	} else {
		return null;
	}
}

export default Toast;