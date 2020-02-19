import * as React from "react";
import { MenuShell, MenuActivator,Menu, Preferences, SystemLog, CentralLogger, Documentation, Restart, Reset, Shutdown } from "@chartiq/finsemble-ui/lib/components";

export const FileMenu = () => {
	return (
		<MenuShell id="mymenu">
			<MenuActivator>File Menu</MenuActivator>
			<Menu>
				<Preferences>Preferences</Preferences>
				<SystemLog>System Log</SystemLog>
				<CentralLogger>Central Logger</CentralLogger>
				<Documentation>Documentation</Documentation>
				<Restart>Restart</Restart>
				<Reset>Reset</Reset>
				<Shutdown>Shut Down</Shutdown>
				{/* To add your own items to the menu, import MenuItem from
				  * "@chartiq/finsemble-ui/lib/components" and add the following:
				  * <MenuItem onClick={...}>Your Item</MenuItem>
				  */}
			</Menu>
		</MenuShell>
	);
};
