/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";

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