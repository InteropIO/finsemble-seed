import React from "react";
import { MenuShell, MenuToggle, Menu, Preferences, SystemLog, CentralLogger, Documentation, Restart, Reset, Quit } from "@chartiq/finsemble-ui/react/components";

export const FileMenu = () => {

	return (
		<MenuShell id="fileMenu">
			<MenuToggle>
				<img className="finsemble-toolbar-brand-logo" src="../../../assets/img/Finsemble_Taskbar_Icon.png" />
			</MenuToggle>
			<Menu>
				<Preferences/>
				<SystemLog/>
				<CentralLogger/>
				<Documentation/>
				<Restart />
				<Reset/>
				<Quit/>
				{/* To add your own items to the menu, import MenuItem from
				  * "@chartiq/finsemble-ui/react/components" and add the following:
				  * <MenuItem onClick={...}>Your Item</MenuItem>
				  */}
			</Menu>
		</MenuShell>
	);
};
