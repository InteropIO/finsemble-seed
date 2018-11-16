/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";

/**
 * AppShowcase version notes section.
 * @param {object} props Component props
 * @param {string} props.version The current app version
 */
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