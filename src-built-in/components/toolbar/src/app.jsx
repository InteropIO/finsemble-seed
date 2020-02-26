/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import ReactDOM from "react-dom";
import React from "react";
import { ToolbarShell, DragHandle } from "@chartiq/finsemble-ui/lib/components";

import '../toolbar.css';
import { Search } from '@chartiq/finsemble-ui/lib/components/toolbar/search'
import { ExampleMenu, ExampleMenu2, AdvancedExample } from "./exampleMenu";
const Toolbar = () => {
	return (
		<ToolbarShell>
			<DragHandle/>
			<ExampleMenu />
			<Search/>
			<ExampleMenu2 />
			<AdvancedExample />
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
