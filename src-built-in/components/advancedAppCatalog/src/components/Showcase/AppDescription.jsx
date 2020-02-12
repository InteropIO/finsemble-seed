/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";

import { DEFAULT_APP_DESCRIPTION } from '../defaults';

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