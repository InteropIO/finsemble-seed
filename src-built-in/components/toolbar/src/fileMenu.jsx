import * as React from "react";
import { MenuShell } from "@chartiq/finsemble-ui/lib/components/menu/menuShell";
import { MenuActivator } from "@chartiq/finsemble-ui/lib/components/menu/menuActivator";
import { Menu } from "@chartiq/finsemble-ui/lib/components/menu/menu";
import { MenuItem } from "@chartiq/finsemble-ui/lib/components/menu/menuItem";

export const FileMenu = () => {
	return (
		<MenuShell id="mymenu">
			<MenuActivator>File Menu</MenuActivator>
			<Menu>
				<PreferencesItem>Preferences</PreferencesItem>
				<SystemLogItem>System Log</SystemLogItem>
				<CentralLoggerItem>Central Logger</CentralLoggerItem>
				<DocumentationItem>Documentation</DocumentationItem>
				<RestartItem>Restart</RestartItem>
				<ResetItem>Reset</ResetItem>
				<ShutdownItem>Shut Down</ShutdownItem>
				{/* Add your own menu items like so:
				 * <MenuItem onClick={...}>Custom Item</MenuItem>
				 */}
			</Menu>
		</MenuShell>
	);
};
