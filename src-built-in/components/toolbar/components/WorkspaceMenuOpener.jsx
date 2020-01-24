
import React from "react";
import { FinsembleButton } from "@chartiq/finsemble-react-controls";
import ToolbarStore from "../stores/toolbarStore";
export default class WorkspaceMenuOpener extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            workspaceMenuWindowName: ToolbarStore.Store.getValue("workspaceMenuWindowName"),
            activeWorkspaceName: ToolbarStore.Store.getValue("activeWorkspaceName")
        };
        this.bindCorrectContext();
    }
    bindCorrectContext() {
        this.receiveActiveWorkspaceName = this.receiveActiveWorkspaceName.bind(this);
        this.receiveWorkspaceMenuWindowName = this.receiveWorkspaceMenuWindowName.bind(this);
        this.addListeners = this.addListeners.bind(this);
        this.removeListeners = this.removeListeners.bind(this);
    }
    componentDidMount() {
        this.addListeners();
    }
    componentWillUnmount() {
        this.removeListeners();
    }
    receiveActiveWorkspaceName(err, data) {
        this.setState({
            activeWorkspaceName: data.value
        });
    }
    receiveWorkspaceMenuWindowName(err, data) {
        this.setState({
            workspaceMenuWindowName: data.value
        })
    }

    addListeners() {
        ToolbarStore.Store.addListener({ field: "activeWorkspaceName" }, this.receiveActiveWorkspaceName);
        ToolbarStore.Store.addListener({ field: "workspaceMenuWindowName" }, this.receiveWorkspaceMenuWindowName);
    }
    removeListeners() {
        ToolbarStore.Store.removeListener({ field: "activeWorkspaceName" }, this.receiveActiveWorkspaceName);
        ToolbarStore.Store.removeListener({ field: "workspaceMenuWindowName" }, this.receiveWorkspaceMenuWindowName);
    }
    render() {
        if (this.state.activeWorkspaceName === null) return null;
        return <FinsembleButton menuWindowName={"Workspace Management Menu"} preSpawn={true} buttonType={["MenuLauncher", "Toolbar"]} className={"finsemble-toolbar-workspace-button-label workspace-menu-button"} label={this.state.activeWorkspaceName} title={this.state.activeWorkspaceName} menuType="Workspace Management Menu" fontIcon="ff-chevron-down"/>
    }
}