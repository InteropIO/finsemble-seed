import * as React from "react";
import { MenuShell } from "@chartiq/finsemble-ui/lib/components/menu/menuShell";
import { MenuActivator } from "@chartiq/finsemble-ui/lib/components/menu/menuActivator";
import { Menu } from "@chartiq/finsemble-ui/lib/components/menu/menu";
import { MenuItem } from "@chartiq/finsemble-ui/lib/components/menu/menuItem";

function showPreferences() {
	FSBL.Clients.LauncherClient.showWindow(
		{
			componentType: "UserPreferences"
		},
		{
			monitor: "mine",
			left: "center",
			top: "center"
		}
	);
}

function showCentralLogger() {
	FSBL.Clients.RouterClient.transmit("CentralConsole-Show", true);
}
function showDOcumentation() {
	FSBL.System.openUrlWithBrowser(
		"https://www.chartiq.com/tutorials/?slug=finsemble-seed-project"
	);
}

function resetFinsemble() {
	FSBL.Clients.StorageClient.clearCache(() => {
		FSBL.restartApplication({ forceRestart: true });
	});
}

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
