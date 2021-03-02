/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useState } from "react";

export const Tooltip = (props: { type?: string; position?: string; children: string }) => {
	const [tooltipPosition, setTooltipPosition] = useState(props.position || "right");
	const [tooltipType, setTooltipType] = useState(props.type || "info");
	const [tooltipOpen, setTooltipOpen] = useState(false);

	return (
		<div
			className={["tooltip", `tooltip-position-content-${tooltipPosition}`].join(" ")}
			onMouseOver={(e) => {
				setTooltipOpen(true);
			}}
			onMouseLeave={(e) => {
				setTooltipOpen(false);
			}}
		>
			<div className={["tooltip-icon", `tooltip-icon-${tooltipType}`].join(" ")}>
				{tooltipType === "error" ? <>!</> : <>?</>}
			</div>
			<div className={["tooltip-content", tooltipOpen ? "visible" : ""].join(" ")}>{props.children}</div>
		</div>
	);
};
