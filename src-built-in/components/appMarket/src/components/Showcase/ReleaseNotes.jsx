/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";

const ReleaseNotes = props => {
	return (
		<div className="app-notes release-notes">
			<span className="showcase-label">Release Notes</span>
			<div className="release-notes-content">
				<p>{props.releaseNotes}</p>
			</div>
		</div>
	);
}

export default ReleaseNotes;