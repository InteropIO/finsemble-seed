/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import { DEFAULT_APP_VERSION } from "./defaults";

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
					{props.version || DEFAULT_APP_VERSION}
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