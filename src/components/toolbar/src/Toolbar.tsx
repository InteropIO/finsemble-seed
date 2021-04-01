/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { MenuObjType, MenuType } from "@finsemble/finsemble-ui/react/types/desktopProjectEditorTypes";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import {
	ToolbarShell,
	FavoritesShell,
	DragHandle,
	RevealAll,
	MinimizeAll,
	NotificationControl,
	AutoArrange,
	Search,
	Dashbar,
	AdvancedAppLauncherMenu,
	AppLauncherMenu,
	WorkspaceManagementMenu,
	ToolbarSection,
} from "@finsemble/finsemble-ui/react/components/toolbar";
import { FileMenu } from "./FileMenu";
import { useHotkey } from "@finsemble/finsemble-ui/react/hooks/useHotkey";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "../../../../public/assets/css/theme.css";

/**
 * Note: Set `FSBL.debug = true` if you need to reload the toolbar during development.
 * By default, it prevents the system from closing it so that users aren't lost without
 * a main window into finsemble functionality.
 */
const Toolbar = () => {
	useHotkey(["ctrl", "alt", "shift", "r"], () => FSBL.restartApplication());
	useHotkey(["ctrl", "alt", "up"], () => FSBL.Clients.LauncherClient.bringWindowsToFront());
	useHotkey(["ctrl", "alt", "down"], () => window.FSBL.Clients.WorkspaceClient.minimizeAll());

	const [useDOMBasedMovement, setDOMBasedMovement] = useState(true);

	const [menus, setMenus] = useState<MenuType>({});

	const updateMenu = () => {
		FSBL.Clients.ConfigClient.getValue("finsemble.toolbarMenus").then(({ data }: { err: any; data: any }) => {
			setMenus(data);
		});
	};

	useEffect(() => {
		async function fetchManifest() {
			const response = await FSBL.Clients.ConfigClient.getValue("finsemble-electron-adapter.useDOMBasedMovement");
			const { data: manifestValue } = response;
			if (manifestValue !== null) setDOMBasedMovement(manifestValue);
		}

		fetchManifest();

		updateMenu();

		// Listen for notifications that the menu has changed
		FSBL.Clients.ConfigClient.addListener({ field: "finsemble.toolbarMenus" }, updateMenu);
	}, []);

	return (
		<ToolbarShell hotkeyShow={["ctrl", "alt", "t"]} hotkeyHide={["ctrl", "alt", "h"]}>
			<ToolbarSection className="left">
				<DragHandle useDOMBasedMovement={useDOMBasedMovement} />
				<FileMenu />
				<Search openHotkey={["ctrl", "alt", "f"]} />
				<WorkspaceManagementMenu />
				{/* Uncomment the following to enable the AdvancedAppLauncherMenu*/}
				{/* <AdvancedAppLauncherMenu enableQuickComponents={true} /> */}
				<AppLauncherMenu enableQuickComponents={true} />
				{Object.values(menus)
					.filter((menuObj: MenuObjType) => menuObj.applications.length > 0)
					.sort((a: MenuObjType, b: MenuObjType) => a.position - b.position)
					.map((menuObj: MenuObjType, index: number) => (
						<AppLauncherMenu
							key={index}
							id={`AppLauncher-${index}`}
							title={menuObj.displayName}
							componentFilter={menuObj.applications}
							suppressFavorites={true}
						/>
					))}
			</ToolbarSection>
			<ToolbarSection className="center" hideBelowWidth={115}>
				<div className="divider" />
				<FavoritesShell />
			</ToolbarSection>
			<ToolbarSection className="right">
				<div className="divider"></div>
				<AutoArrange />
				<MinimizeAll />
				<RevealAll />
				<NotificationControl />
			</ToolbarSection>
			<div className="resize-area"></div>
		</ToolbarShell>
	);
};

ReactDOM.render(
	<FinsembleProvider>
		<Toolbar />
		<Dashbar />
	</FinsembleProvider>,
	document.getElementById("Toolbar-tsx")
);
