/*!
* Copyright 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import { DEFAULT_APP_RELEASE_NOTES } from "./defaults";

/**
 * AppShowcase release notes section. Display information about app's most recent change notes
 * @param {object} props Component props
 * @param {string} props.releaseNotes The release notes
 */
const ReleaseNotes = props => {
	return (
		<div className="app-notes release-notes">
			<span className="showcase-label">Release Notes</span>
			<div className="release-notes-content">
				<div>{props.releaseNotes || DEFAULT_APP_RELEASE_NOTES}</div>
			</div>
		</div>
	);
}

export default ReleaseNotes;