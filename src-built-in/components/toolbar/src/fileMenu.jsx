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
				<MenuItem
					onClick={() => {
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
					}}
				>
					Preferences
				</MenuItem>
				<MenuItem onClick={FSBL.SystemManagerClient.showSystemLog}>
					System Log
				</MenuItem>
				<MenuItem
					onClick={() => {
						FSBL.Clients.RouterClient.transmit("CentralConsole-Show", true);
					}}
				>
					Central Logger
				</MenuItem>
				<MenuItem
					onClick={() => {
						FSBL.System.openUrlWithBrowser(
							"https://www.chartiq.com/tutorials/?slug=finsemble-seed-project"
						);
					}}
				>
					Documentation
				</MenuItem>
				<MenuItem onClick={FSBL.restartApplication}>Restart</MenuItem>
				<MenuItem
					onClick={() => {
						FSBL.Clients.StorageClient.clearCache(() => {
							FSBL.restartApplication({ forceRestart: true });
						});
					}}
				>
					Reset
				</MenuItem>
				<MenuItem onClick={FSBL.shutdownApplication}>Shut Down</MenuItem>
			</Menu>
		</MenuShell>
	);
};
