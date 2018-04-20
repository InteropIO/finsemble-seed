/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import { Actions as FileMenuActions } from "./stores/fileMenuStore";
import { FinsembleMenu, FinsembleMenuItem, FinsembleMenuSection, FinsembleMenuSectionLabel } from "@chartiq/finsemble-react-controls";
import "../../assets/css/finfont.css";
import "../../assets/css/finsemble.css";
import "../fileMenu.css";

class FileMenu extends React.Component {
	render() {
		let padding = {
			height: 10,
			width: 40
		};
		return (<FinsembleMenu padding={padding}>
			{/*Options in the file menu.*/}
			<FinsembleMenuSection className='menu-primary'>
				<FinsembleMenuItem label="Preferences" onClick={FileMenuActions.spawnPreferences} />
				<FinsembleMenuItem label="Central Logger" onClick={FileMenuActions.showCentralConsole} />
				<FinsembleMenuItem label="Documentation" onClick={FileMenuActions.spawnDocs} />
				{window.location.toString().includes("localhost") ?
					<FinsembleMenuItem label="Restart" onClick={FileMenuActions.restart} />
					: null
				}
				{window.location.toString().includes("localhost") ?
					<FinsembleMenuItem label="Reset" onClick={FileMenuActions.clearCacheRestart} title="Delete cache and restart" /> : null
				}
				<FinsembleMenuItem label="Logout" onClick={FileMenuActions.logout} />
				<FinsembleMenuItem label="Quit" onClick={FileMenuActions.shutdownApplication} />
			</FinsembleMenuSection>
		</FinsembleMenu>);
	}
}


FSBL.addEventListener("onReady", function () {
	ReactDOM.render(
		<FileMenu />
		, document.getElementById("FileMenu-component-wrapper"));

});