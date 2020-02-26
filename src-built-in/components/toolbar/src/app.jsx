/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import ReactDOM from "react-dom";
import React from "react";
import { ToolbarShell, DragHandle, RevealAll, MinimizeAll, AutoArrange } from "@chartiq/finsemble-ui/lib/components";

import '../toolbar.css';

const Toolbar = () => {
	return (
		<ToolbarShell>
			<div className="finsemble-toolbar-section left">
				<DragHandle />
				{/* Workspace Management Menu */}
				{/* App Menu */}
			</div>
			<div className="finsemble-toolbar-section center">
				{/* Favorites Section */}
			</div>
			<div className="finsemble-toolbar-section right">
				<MinimizeAll />
				<AutoArrange />
				<RevealAll />
			</div>



		</ToolbarShell>
	)
}

ReactDOM.render(<Toolbar />, document.getElementById("toolbar_refactored"));
