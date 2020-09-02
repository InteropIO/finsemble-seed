/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */
import React from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@cosaic/finsemble-ui/react/components/FinsembleProvider";
import { SystemTrayComponentShell } from "@cosaic/finsemble-ui/react/components/System";
import { Preferences } from "@cosaic/finsemble-ui/react/components/System";
import { SystemLog } from "@cosaic/finsemble-ui/react/components/System";
import { CentralLogger } from "@cosaic/finsemble-ui/react/components/System";
import { Documentation } from "@cosaic/finsemble-ui/react/components/System";
import { Restart } from "@cosaic/finsemble-ui/react/components/System";
import { Reset } from "@cosaic/finsemble-ui/react/components/System";
import { Quit } from "@cosaic/finsemble-ui/react/components/System";
import "@cosaic/finsemble-ui/react/assets/css/finsemble.css";
import "@cosaic/finsemble-ui/react/assets/css/menus.css";
import "../../../assets/css/theme.css";

/**
 * This component displays on right-click in your application's system tray icon.
 * Feel free to add/remove content or react components.
 * The SystemTrayComponentShell will automatically adjust the height of the window as necessary to display its content.
 * Use the component's config setting to adjust the window width if necessary.
 * This component will be hidden when it loses focus but will remain invisibly active.
 */
const SystemTrayComponent = () => (
	<SystemTrayComponentShell>
		<Preferences />
		<SystemLog />
		<CentralLogger />
		<Documentation />
		<Restart />
		<Reset />
		<Quit />
	</SystemTrayComponentShell>
);

ReactDOM.render(
	<FinsembleProvider>
		<SystemTrayComponent />
	</FinsembleProvider>,
	document.getElementById("SystemTrayComponent-tsx")
);
