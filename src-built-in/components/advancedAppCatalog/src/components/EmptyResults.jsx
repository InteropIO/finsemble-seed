/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";

/**
 * Empty Results to show on the search page when filters/search text apply to zero results
 * @param {*} props
 */
const EmptyResults = props => {
	return (
		<div className='app-results'>
			<h3 className='app-results-no-results'>
				No results found. Please try again.
			</h3>
		</div>
	);
}

export default EmptyResults;