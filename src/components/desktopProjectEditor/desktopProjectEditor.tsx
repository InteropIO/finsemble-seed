/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */
import React from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import { DesktopProjectEditor } from "@finsemble/finsemble-ui/react/components/desktopProjectEditor/DesktopProjectEditor";
import "@finsemble/finsemble-ui/react/ui-assets/css/finsemble.css";
import views from "@finsemble/finsemble-ui/react/components/desktopProjectEditor/common/views";
import "../../../public/assets/css/theme.css";

const desktopProjectClient = new FSBL.Clients.DesktopProjectClient();

ReactDOM.render(
	<FinsembleProvider>
		<DesktopProjectEditor
			{...{
				views,
				getConfig: (params, callback) => FSBL.Clients.ConfigClient.get(params, callback),
				resetProject: () => desktopProjectClient.resetProject(),
				getDPServerInfo: () => desktopProjectClient.getDPServerInfo(),
				updateProjectSettings: (settings: any) => desktopProjectClient.updateProjectSettings(settings),
				onThemeUpdated: (callback: any) => FSBL.Clients.DesktopProjectClient.onThemeUpdated(callback),
			}}
		/>
	</FinsembleProvider>,
	document.getElementById("desktopProjectEditor")
);
