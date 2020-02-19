/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import ReactDOM from "react-dom";
import React from "react";
import { ToolbarShell, DragHandle } from "@chartiq/finsemble-ui/lib/components";

import '../toolbar.css';
import { FileMenu } from "./fileMenu";

const Toolbar = () => {
	return (
		<ToolbarShell>
			<DragHandle/>
			<FileMenu />
			{/* Drag Handle */}
			{/* Workspace Management Menu */}
			{/* App Menu */}
			{/* Favorites Section */}
			{/* Minimize All */}
			{/* Reveal All */}
			{/* Auto Arrange */}
		</ToolbarShell>
	)
}

ReactDOM.render(<Toolbar />, document.getElementById("toolbar_refactored"));
