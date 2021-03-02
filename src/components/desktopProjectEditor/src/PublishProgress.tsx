/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React from "react";

// @ts-ignore
import Progress from "react-circle-progress-bar";

export const PublishProgress: React.FunctionComponent<{
	percentComplete: number;
}> = ({ percentComplete }) => (
	<div className="publish-progress-indicator">
		<Progress
			strokeWidth={24}
			reduction={0}
			hideBall={true}
			progress={percentComplete}
			style={{ width: 24, height: 24 }}
		></Progress>
	</div>
);
