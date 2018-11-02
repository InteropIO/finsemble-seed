/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";

const AppDevNotes = props => {
	return (
		<div className="app-notes developer">
			<span className="showcase-label">Developer</span>
			<div className="developer-content">
				<div>{props.publisher} - <a href="#" onClick={this.openSite} >{props.email}</a></div>
			</div>
		</div>
	);
}

export default AppDevNotes;