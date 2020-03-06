/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import ReactDOM from "react-dom";
import React from "react";
import { ToolbarShell, FavoritesShell, DragHandle, RevealAll, MinimizeAll, AutoArrange, Search, AppLauncher, WorkspaceManagementMenu } from "@chartiq/finsemble-ui/lib/components";
import { FileMenu } from "./fileMenu";

import '../toolbar.css';
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";

const Toolbar = () => {
	return (
		<ToolbarShell>
			<div className="finsemble-toolbar-section left">
				<DragHandle />
				<FileMenu />
				<Search/>
				<WorkspaceManagementMenu/>
				<AppLauncher />
			</div>
			<div className="finsemble-toolbar-section center">
				<FavoritesShell />
			</div>
			<div className="finsemble-toolbar-section right">
				<MinimizeAll />
				<AutoArrange />
				<RevealAll />
			</div>
      <div className="resize-area" ></div>
		</ToolbarShell>
	)
}

ReactDOM.render(<Toolbar />, document.getElementById("toolbar_refactored"));
