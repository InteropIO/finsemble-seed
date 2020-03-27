/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import ReactDOM from "react-dom";
import React from "react";
import { ToolbarShell, FavoritesShell, DragHandle, RevealAll, MinimizeAll, AutoArrange, Search, AppLauncher, WorkspaceManagementMenu, ToolbarSection } from "@chartiq/finsemble/ui/components";
import { FileMenu } from "./FileMenu";

import '../toolbar.css';
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";

const Toolbar = () => {
	return (
		<ToolbarShell>
			<ToolbarSection className="left">
				<DragHandle />
				<FileMenu />
				<Search />
				<WorkspaceManagementMenu />
				<AppLauncher />
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
