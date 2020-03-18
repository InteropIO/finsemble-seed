/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import ReactDOM from "react-dom";
import React from "react";

import { ToolbarShell, DragHandle, FavoritesShell, RevealAll, MinimizeAll, AutoArrange, Search, WorkspaceManagementMenu, ToolbarSection } from "@chartiq/finsemble-ui/lib/components";
import { FileMenu } from "./fileMenu";

import '../toolbar.css';
const Toolbar = () => {
	return (
		<ToolbarShell>
			<ToolbarSection className="left">
				<DragHandle />
				<FileMenu />
				<Search />
				<WorkspaceManagementMenu />
				{/* Workspace Management Menu */}
				{/* App Menu */}
			</ToolbarSection>
			<ToolbarSection className="center" minWidth={115}>
				<div className="divider"/>
				<FavoritesShell />
			</ToolbarSection>
			<ToolbarSection className="right">
				<div className="divider"></div>
				<MinimizeAll />
				<AutoArrange />
				<RevealAll />
			</ToolbarSection>
			<div className="resize-area" ></div>
		</ToolbarShell>
	)
}

ReactDOM.render(<Toolbar />, document.getElementById("toolbar_refactored"));
