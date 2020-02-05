/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

// Static vs Dynamic Toolbar
// import Toolbar from "./staticToolbar";
// Uncomment below if you want to show the dynamic toolbar on top of the refactored toolbar.
// import Toolbar from "./dynamicToolbar";
import ToolbarRefactored from "../../toolbarRefactored/app.tsx";
import onReady from "../../UIAPI/effects/index";
import ReactDOM from "react-dom";
import React from "react";

const ToolbarShell = () => {
	return (
		<ToolbarRefactored>
			New Toolbar. Delete this line when the first component is added.
			{/* Drag Handle */}
			{/* Workspace Management Menu */}
			{/* App Menu */}
			{/* Favorites Section */}
			{/* Minimize All */}
			{/* Reveal All */}
			{/* Auto Arrange */}
		</ToolbarRefactored>
	)
}
onReady(() => ReactDOM.render(
	<ToolbarShell />,
	document.getElementById("toolbar_refactored"))
);