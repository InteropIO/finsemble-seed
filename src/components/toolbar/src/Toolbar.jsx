/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import ReactDOM from "react-dom";
import React from "react";
import { ToolbarShell, FavoritesShell, DragHandle, RevealAll, MinimizeAll, AutoArrange, Search, AppLauncher, WorkspaceManagementMenu, ToolbarSection } from "@chartiq/finsemble-ui/react/components";
import { FileMenu } from "./FileMenu";

import "@chartiq/finsemble-ui/react/assets/css/finsemble.css";
import "../../../../assets/css/_themeWhitelabel.css"

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
			<ToolbarSection className="center" hideBelowWidth={115}>
				<div className="divider"/>
				<FavoritesShell />
			</ToolbarSection>
			<ToolbarSection className="right">
				<div className="divider"></div>
				<MinimizeAll />
				<RevealAll />
			</ToolbarSection>
			<div className="resize-area" ></div>
		</ToolbarShell>
	)
}

ReactDOM.render(<Toolbar />, document.getElementById("toolbar"));
