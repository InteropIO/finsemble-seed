/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";

/**
 * AppShowcase description section
 * @param {object} props Component props
 * @param {string} props.description The app description
 */
const AppDescription = props => {
	return (
		<div className="app-notes description">
			<span className="showcase-label">Description</span>
			<div className="description-content">
				<div>{props.description || DEFAULT_APP_DESCRIPTION}</div>
			</div>
		</div>
	);
}

export default AppDescription;