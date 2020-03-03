/*!
 * Copyright 2020 by ChartIQ, Inc.
 * All rights reserved.
 * This is a list of workspaces that the user can click on, loading them.
 */
import React from "react";
import { FinsembleDraggable, FinsembleDroppable, FinsembleDnDContext, FinsembleMenuSection, FinsembleMenuSectionLabel } from "@chartiq/finsemble-react-controls";
import Workspace from "./workspace";
import WorkspaceActions from "./workspaceActions";
import { getStore, Actions as WorkspaceManagementMenuActions } from "../stores/workspaceManagementMenuStore";
let WorkspaceManagementMenuStore;

export default class WorkspaceManagementList extends React.Component {
	constructor(props) {
		super(props);
		WorkspaceManagementMenuStore = getStore();
		this.onDragEnd = this.onDragEnd.bind(this);
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
	onDragEnd(changeEvent) {
		//User didn't make a valid drop.
		if (!changeEvent.destination) return;
		WorkspaceManagementMenuActions.reorderWorkspaceList(changeEvent);

	}
	/**
	 * Render method.
	 *
	 * @returns
	 * @memberof WorkspaceManagementList
	 */
	render() {
		let self = this;

		let workspaces = this.props.workspaces.map(function (workspace, i) {
			//Separate array for each workspace. This way, the activeWorkspace can be rendered without a trashcan.
			let workspaceActions = [
				{
					iconClass: "ff-adp-trash-outline",
					method: self.removeWorkspace
				},
				{
					iconClass: "ff-favorite",
					method: self.togglePin
				}
			];
			let isActiveWorkspace = workspace.name === FSBL.Clients.WorkspaceClient.activeWorkspace.name;
			let isPinned = self.props.pinnedWorkspaces.includes(workspace.name);
			const isSwitchingWorkspaces = WorkspaceManagementMenuStore.getValue("isSwitchingWorkspaces");
			workspace.isPinned = isPinned;
			const dragHandle = {iconClass: "ff-adp-hamburger"};

			return (
				<FinsembleDraggable
					index={i}
					key={i}
					draggableId={workspace.name}>
					<Workspace
						key={i}
						isActiveWorkspace={isActiveWorkspace}
						dragHandle={dragHandle}
						workspace={workspace}
						mainAction={WorkspaceManagementMenuActions.switchToWorkspace}
						isSwitchingWorkspaces={isSwitchingWorkspaces}
						itemActions={workspaceActions} />
				</FinsembleDraggable>
			);
		});

		return (
			<FinsembleDnDContext onDragEnd={this.onDragEnd}>
				<FinsembleMenuSection className='menu-primary'>
					<FinsembleDroppable direction="vertical" droppableId="workspaceList">
						{workspaces}
					</FinsembleDroppable>
				</FinsembleMenuSection>
			</FinsembleDnDContext>
		);
	}
}