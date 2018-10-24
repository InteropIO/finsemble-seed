/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";

const AppDescription = props => {
	return (
		<div className="app-notes description">
			<span className="showcase-label">Description</span>
			<div className="description-content">
				<p>{props.description}</p>
			</div>
		</div>
	);
}

export default AppDescription;