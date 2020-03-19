import React from "react";
import { MenuShell, MenuActivator, Menu, Preferences, SystemLog, CentralLogger, Documentation, Restart, Reset, Quit } from "@chartiq/finsemble-ui/lib/components";

export const FileMenu = () => {
	return (
		<MenuShell id="fileMenu">
			<MenuActivator>
				<img className="finsemble-toolbar-brand-logo" src="../../../assets/img/Finsemble_Taskbar_Icon.png" />
			</MenuActivator>
			<Menu>
				<Preferences/>
				<SystemLog/>
				<CentralLogger/>
				<Documentation/>
				<Restart/>
				<Reset/>
				<Quit/>
				{/* To add your own items to the menu, import MenuItem from
				  * "@chartiq/finsemble-ui/lib/components" and add the following:
				  * <MenuItem onClick={...}>Your Item</MenuItem>
				  */}
			</Menu>
		</MenuShell>
	);
};
