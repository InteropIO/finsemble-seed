/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import ReactDOM from "react-dom";
import React from "react";

import { ToolbarShell, DragHandle, FavoritesShell, RevealAll, MinimizeAll, AutoArrange, Search, WorkspaceManagementMenu } from "@chartiq/finsemble-ui/lib/components";
import { FileMenu } from "./fileMenu";

import '../toolbar.css';
import { ExampleMenu, ExampleMenu2, AdvancedExample } from "./exampleMenu";
const Toolbar = () => {
	return (
		<ToolbarShell>
			<div className="finsemble-toolbar-section left">
				<DragHandle />
				<FileMenu />
				<Search/>
				<WorkspaceManagementMenu/>
				{/* Workspace Management Menu */}
				{/* App Menu */}
			</div>
			<div className="finsemble-toolbar-section center">
				<div className="divider"></div>
				<FavoritesShell />
			</div>
			<div className="finsemble-toolbar-section right">
			<div className="divider"></div>
				<MinimizeAll />
				<AutoArrange />
				<RevealAll />
			</div>
      <div className="resize-area" ></div>
		</ToolbarShell>
	)
}

ReactDOM.render(<Toolbar />, document.getElementById("toolbar_refactored"));
