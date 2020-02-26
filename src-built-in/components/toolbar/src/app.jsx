/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import ReactDOM from "react-dom";
import React from "react";
import { ToolbarShell, DragHandle, FavoritesShell } from "@chartiq/finsemble-ui/lib/components";

import '../toolbar.css';

const Toolbar = () => {
	return (
		<ToolbarShell>
			<DragHandle/>
			{/* Workspace Management Menu */}
			{/* App Menu */}
			<FavoritesShell />
			{/* Minimize All */}
			{/* Reveal All */}
			{/* Auto Arrange */}
			<div className="resize-area" ></div>
		</ToolbarShell>
	)
}

ReactDOM.render(<Toolbar />, document.getElementById("toolbar_refactored"));
