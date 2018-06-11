//'this' is bound in the containing component.
import { Actions } from "../stores/ProcessMonitorStore";
import React from "react";

export default function ExpandedApplication(row) {
    const APPLICATION_ID = row.original.name;
    const CHILD_WINDOWS = this.appData[APPLICATION_ID];
    const APPLICATION_HAS_CHILD_WINDOWS = CHILD_WINDOWS && CHILD_WINDOWS.length > 0;

    //Async operation that retrieves child window information.
    fin.desktop.Application.wrap(APPLICATION_ID).getChildWindows((cws) => {
        this.appData[APPLICATION_ID] = cws;
    });

    //If we don't have any data about the app yet, render a div with "loading..".
    //Next time we render (~500ms later), we should have data, and we'll render the child windows.
    if (CHILD_WINDOWS) {
        return (<div key={APPLICATION_ID} className="app-details">
            <div className="app-actions">
                <div className="window-list-label">
                    {APPLICATION_HAS_CHILD_WINDOWS ? "Child Windows" : "No Child Windows"}
                </div>
                <div className="terminate app-action" onClick={() => {
                    Actions.terminateProcess({ name: row.original.name, uuid: row.original.uuid });
                }}>
                    Terminate Process
                </div>
            </div>
            {APPLICATION_HAS_CHILD_WINDOWS &&
                <div className="app-windows">
                    {CHILD_WINDOWS.map(cw => (
                        //cw == childWindow
                        <div key={cw.name} className="app-window">
                            <div className="app-actions">
                                <div className="app-action"
                                    onClick={() => {
                                        Actions.identifyWindow(cw);
                                    }}>
                                    Identify</div>
                                <div className="app-action terminate" onClick={() => {
                                    Actions.closeWindow(cw);
                                }}>Close</div>
                            </div>
                            <div className="app-name">{cw.name}</div>
                        </div>))}
                </div>
            }
        </div>)
    }
    return <div key={APPLICATION_ID}>"Loading.."</div>
}