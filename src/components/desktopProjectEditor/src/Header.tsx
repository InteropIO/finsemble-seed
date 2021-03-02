/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useState, useEffect } from "react";

export const Header = (props: any) => (
	<div className="view-header">
		<h1 className="view-title">
			{props.onClickBackButton && (
				<button className="rounded" onClick={props.onClickBackButton}>
					&lsaquo;
					<span className="back-button-label">Back</span>
				</button>
			)}

			{props.children}
		</h1>
	</div>
);
