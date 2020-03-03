/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
import { Actions as FileMenuActions } from "./stores/fileMenuStore";
import { FinsembleMenu, FinsembleMenuItem, FinsembleMenuSection, FinsembleMenuSectionLabel } from "@chartiq/finsemble-react-controls";
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";

class FileMenu extends React.Component {
	render() {
		let padding = {
			height: 0,
			width: 40
		};
		return (<FinsembleMenu padding={padding}>
			{/*Options in the file menu.*/}
			<FinsembleMenuSection className='menu-primary'>
				<FinsembleMenuItem label="Preferences" onClick={FileMenuActions.spawnPreferences} />
				<FinsembleMenuItem label="System Log" onClick={FileMenuActions.showSystemLog} />
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


if (window.FSBL && FSBL.addEventListener) { FSBL.addEventListener("onReady", FSBLReady); } else { window.addEventListener("FSBLReady", FSBLReady) }
function FSBLReady() {
	ReactDOM.render(
		<FileMenu />
		, document.getElementById("FileMenu-component-wrapper"));

}