/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";

const VersionNotes = props => {
	return (
		<div className="dev-notes version-update">
			<div className="version-content">
				<span className="showcase-label">Version</span>
				<div className="version">
					{props.version}
				</div>
			</div>
			<div className="updated-content">
				<span className="showcase-label">Last Updated</span>
				<div className="updated">
					Not available
				</div>
			</div>
		</div>
	);
}

export default VersionNotes;