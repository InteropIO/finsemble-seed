/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import ReactDOM from "react-dom";
import React from "react";
import { ToolbarShell, FavoritesShell, DragHandle, RevealAll, MinimizeAll, AutoArrange, Search, AppLauncher, WorkspaceManagementMenu, ToolbarSection } from "@chartiq/finsemble-ui/react/components";
import { FileMenu } from "./FileMenu";
import { useHotkey } from "@chartiq/finsemble-ui/react/hooks";

import "@chartiq/finsemble-ui/react/assets/css/finsemble.css";
import "../../../../assets/css/_themeWhitelabel.css"

const Toolbar = () => {
	useHotkey(["ctrl", "alt", "shift", "r"], () => FSBL.restartApplication() );
	useHotkey(["ctrl", "alt", "up"], () => FSBL.Clients.LauncherClient.bringWindowsToFront() );
	useHotkey(["ctrl", "alt", "down"], () => FSBL.Clients.WorkspaceClient.minimizeAll() );

	return (
		<ToolbarShell hotkeyShow={["ctrl", "alt", "t"]} hotkeyHide={["ctrl", "alt", "h"]} >
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

ReactDOM.render(<FSBL><Toolbar /></FSBL>, document.getElementById("toolbar"));

