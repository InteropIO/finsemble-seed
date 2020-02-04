/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";

/**
 * AppShowcase description section
 * @param {object} props Component props
 * @param {string} props.description The app description
 */
const AppDescription = props => {

	const description = props.description === null ? "Get started by adding this component to Finsemble now!" : props.description;

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