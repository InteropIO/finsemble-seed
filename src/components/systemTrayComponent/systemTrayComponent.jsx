/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom"
import "@chartiq/finsemble-ui/react/assets/css/finsemble.css";
import "../../../assets/css/_themeWhitelabel.css";
import { SystemTrayComponentShell, Preferences, SystemLog, CentralLogger, Documentation, Restart, Reset, Quit } from "@chartiq/finsemble-ui/react/components";

/**
 * This component will be rendered whenever the user right clicks on your application's system tray icon.
 * Feel free to add/remove anything in here. The SystemTrayComponentShell handles setting the height/width
 * of the window. It will also hide the window when it loses focus.
 */
const SystemTrayComponent = () => {
    return (
        <SystemTrayComponentShell padding={{ width: 80 }}>
            <div className="menu menu-primary">
                <Preferences />
                <SystemLog />
                <CentralLogger />
                <Documentation />
                <Restart />
                <Reset />
                <Quit />
            </div>
        </SystemTrayComponentShell>

    )
}

FSBL.addEventListener('onReady', () => {
    ReactDOM.render(<SystemTrayComponent />, document.getElementById("system-tray-component-wrapper"));
});
