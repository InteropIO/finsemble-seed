//'this' is bound in the containing component.
import { Actions } from "../stores/ProcessMonitorStore";
import React from "react";

export default class ExpandedApplication extends React.Component {
    constructor(props) {
        super(props);
        let DEFAULT_EXPAND = false;
        let expanded = [];
        this.state = {
            childWindows: [],
            appId: this.props.row.original.name
        };
        this.buildWidowList = this.buildWidowList.bind(this);
        this.setupListeners = this.setupListeners.bind(this);
    }
    componentWillUnmount() {// remove our application listeners
        let app = fin.desktop.Application.wrap(this.state.appId);
        app.removeEventListener("window-closed", this.windowClosed.bind(this));
        app.removeEventListener("window-created", this.windowCreated.bind(this))
    }
    windowClosed(event) {// when a window is closed remove it from our window list
        for (let i = 0; i < this.state.childWindows.length; i++) {
            let currentWindow = this.state.childWindows[i];
            if (currentWindow.window.name === event.name) {
                this.state.childWindows.splice(i, 1);
                break
            }
        }
        this.setState({ childWindows: this.state.childWindows });
    }
    windowCreated(event) {// when a window is added add it to our window list
        let self = this;
        let win = fin.desktop.Window.wrap(event.uuid, event.name);
        FSBL.Clients.LauncherClient.getActiveDescriptors(function (err, data) {
            if (data[win.name]) {
                if (!self.props.excludedWindows.includes(data[win.name].componentType)) {

                    self.state.childWindows.push({ window: win, visibility: true })
                } else {
                    self.state.childWindows.push({ window: win, visibility: false })
                }
            } else {
                if (!self.props.showAll && !self.props.excludedWindows.includes(win.name)) {
                    self.state.childWindows.push({ window: win, visibility: true })
                } else {
                    self.state.childWindows.push({ window: win, visibility: false })
                }
            }
            self.setState({ childWindows: self.state.childWindows })
        });
    }
    setupListeners() {//listen for application level events
        let app = fin.desktop.Application.wrap(this.state.appId);
        app.addEventListener("window-closed", this.windowClosed.bind(this));
        app.addEventListener("window-created", this.windowCreated.bind(this))
    }

    componentWillMount() {
        let self = this;
        this.setupListeners();
        FSBL.Clients.LauncherClient.getActiveDescriptors(function (err, data) {// get our initial list of windows and set their visibility
            fin.desktop.Application.wrap(self.state.appId).getChildWindows((cws) => {
                let newWindowList = [];
                cws.map(function (item) {
                    if (data[item.name]) {
                        if (!self.props.excludedWindows.includes(data[item.name].componentType)) {
                            newWindowList.push({ window: item, visibility: true })
                        } else {
                            newWindowList.push({ window: item, visibility: false })
                        }
                    } else {
                        if (!self.props.showAll && !self.props.excludedWindows.includes(item.name)) {
                            newWindowList.push({ window: item, visibility: true })
                        } else {
                            newWindowList.push({ window: item, visibility: false })
                        }
                    }
                })
                self.setState({ childWindows: newWindowList })
            });
        })
    }
    buildWidowList() {// build out viewable list
        let self = this;
        let returnList = [];
        for (let i = 0; i < this.state.childWindows.length; i++) {
            let windowItem = this.state.childWindows[i];
            if (self.props.showAll) {
                returnList.push(windowItem.window);
                continue;
            };
            if (windowItem.visibility) returnList.push(windowItem.window);
        }
        return returnList;
    }
    render() {
        let visibleWindows = this.buildWidowList();
        if (visibleWindows.length) {
            return (<div key={this.state.appId} className="app-details">
                <div className="app-actions">
                    <div className="window-list-label">
                        {visibleWindows.length ? "Child Windows" : "No Child Windows"}
                    </div>
                    <div className="terminate app-action" onClick={() => {
                        Actions.terminateProcess({ name: this.props.row.original.name, uuid: this.props.row.original.uuid });
                    }}>
                        Terminate Process
                    </div>
                </div>
                {visibleWindows.length &&
                    <div className="app-windows">
                        {visibleWindows.map(cw => (
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
        return <div key={this.state.appId}>There are no windows visible</div>
    }
}