/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */
import React from "react";

/**
 * AppShowcase dev notes section. Contains developer information
 * @param {object} props Component props
 * @param {string} props.publisher The name of this app's publisher
 * @param {func} props.openSite Parent function to launch the developer's site in Finsemble window
 * @param {string} props.email The developer's contact email
 */
const AppDevNotes = (props) => {
	return (
		<div className="app-notes developer">
			<span className="showcase-label">Developer</span>
			<div className="developer-content">
				<div>
					{props.publisher} -{" "}
					<a href="#" onClick={this.openSite}>
						{props.email}
					</a>
				</div>
			</div>
		</div>
	);
};

export default AppDevNotes;
