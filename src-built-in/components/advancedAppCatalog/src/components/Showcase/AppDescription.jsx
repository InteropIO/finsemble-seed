/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";

const DEFAULT_APP_DESCRIPTION = "Get started by adding this component to Finsemble now!";

/**
 * AppShowcase description section
 * @param {object} props Component props
 * @param {string} props.description The app description
 */
const AppDescription = props => {

	const description = props.description === undefined ? DEFAULT_APP_DESCRIPTION : props.description;

	return (
		<div className="app-notes description">
			<span className="showcase-label">Description</span>
			<div className="description-content">
				<div>{description}</div>
			</div>
		</div>
	);
}

export default AppDescription;