/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 * This is a list of workspaces that the user can click on, loading them.
 */
import React from "react";
import { FinsembleMenuSection, FinsembleMenuSectionLabel } from "@chartiq/finsemble-react-controls";
import Workspace from "./workspace";
import WorkspaceActions from "./workspaceActions";
import { getStore, Actions as WorkspaceManagementMenuActions } from "../stores/workspaceManagementMenuStore";
let WorkspaceManagementMenuStore;

export default class WorkspaceManagementList extends React.Component {
	constructor(props) {
		super(props);
		WorkspaceManagementMenuStore = getStore();
	}

	/**
	 * Removes a workspace.
	 *
	 * @param {any} workspaceName
	 * @memberof WorkspaceManagementList
	 */
	removeWorkspace(workspaceName) {
		WorkspaceManagementMenuActions.removeWorkspace(workspaceName);
	}

	/**
	 * Pins a workspace to all of the user's toolbars.
	 *
	 * @param {any} workspaceName
	 * @memberof WorkspaceManagementList
	 */
	togglePin(workspaceName) {
		WorkspaceManagementMenuActions.togglePin(workspaceName);
	}

	/**
	 * Render method.
	 *
	 * @returns
	 * @memberof WorkspaceManagementList
	 */
	render() {
		let self = this;
		let workspaceActions = [
			{
				iconClass: "ff-delete",
				method: self.removeWorkspace
			},
			{
				iconClass: "ff-pin",
				method: self.togglePin
			}
		];
		let workspaces = this.props.workspaces.map(function (workspace, i) {
			let isActiveWorkspace = workspace.name === FSBL.Clients.WorkspaceClient.activeWorkspace.name;
			let isPinned = self.props.pinnedWorkspaces.includes(workspace.name);
			workspace.isPinned = isPinned;
			return (<Workspace isActiveWorkspace={isActiveWorkspace}
				key={i}
				workspace={workspace}
				mainAction={WorkspaceManagementMenuActions.switchToWorkspace}
				itemActions={workspaceActions} />);
		});

		return (<FinsembleMenuSection className='menu-primary'>
				<FinsembleMenuSectionLabel>
					Workspaces
				</FinsembleMenuSectionLabel>
				{workspaces}
			</FinsembleMenuSection>);
	}
}