/*!
* Copyright 2020 by ChartIQ, Inc.
* All rights reserved.
 * This is a single workspace. When clicked, it requests that the app switch to the clicked workspace.
 */

import React from "react";
import { FinsembleMenuItem, FinsembleMenuItemLabel } from "@chartiq/finsemble-react-controls";

export default class Workspace extends React.Component {
	constructor(props) {
		super(props);
		this.bindCorrectContext();
	}
	/**
     * This is necessary to make sure that the `this` inside of the callback is correct.
     *
     * @memberof LinkerButton
     */
	bindCorrectContext() {
		this.onClick = this.onClick.bind(this);
	}

	/**
	 * When the main body of the component is clicked, we fire off the mainAction. By default this is to switch workspaces.
	 *
	 * @memberof Workspace
	 */
	onClick() {
		this.props.mainAction({
			name: this.props.workspace.name
		});
	}

	/**
	 * Generates the buttons for the actions that are passed down from the parent. By default, those actions are delete workspace and pin workspace.
	 *
	 * @returns
	 * @memberof Workspace
	 */
	renderButtons() {
		let { workspace, itemActions } = this.props;
		//Remove trashcan for activeWorkspace. Prevents it from being deleted and causing issues.
		if (this.props.isActiveWorkspace) {
			let index = itemActions.findIndex(el => el.iconClass.includes('ff-adp-trash-outline'));
			if (index > -1) itemActions.splice(index, 1);
		}
		return itemActions.map(function (action, index) {
			let classes = "menu-item-action";
			let iconClasses = action.iconClass;
			if (workspace.isPinned && iconClasses.includes('favorite')) {
				iconClasses += " finsemble-item-pinned";
			} else {
				classes += " remove-workspace";
			}
			let title="";
			if (iconClasses.includes('favorite') && workspace.isPinned) {
				title="Unfavorite"
			} else {
				title="Favorite"
			}
			if (iconClasses.includes('trash')) {
				title="Delete"
			}
			let label = action.label || "";
			return (<div key={index} title={title} className={classes} onClick={
				() => {
					action.method(workspace);
				}
			}>
				{action.iconClass &&
					<i className={iconClasses}></i>
				}
			</div>);
		});
	}
	/**
	 * Render method.
	 *
	 * @returns
	 * @memberof Workspace
	 */
	render() {
		const { isSwitchingWorkspaces, workspace, isActiveWorkspace, dragHandle } = this.props;
		let actionButtons = null;

		//Actions are remove and pin workspace.
		if (this.props.itemActions) {
			actionButtons = this.renderButtons();
		}

		const showSpinner = isSwitchingWorkspaces && isActiveWorkspace;

		let classes = this.props.isActiveWorkspace ? "active-workspace workspace-name" : "workspace-name";
		return (
			<FinsembleMenuItem>
				{showSpinner && <div className="fsbl-loader">Loading...</div> }
				{dragHandle && dragHandle.iconClass && <div className={dragHandle.iconClass}></div>}
				<FinsembleMenuItemLabel label={workspace.name} title={workspace.name} className={classes} onClick={this.onClick}/>
				{actionButtons && <div className="menu-item-actions">
					{actionButtons}
				</div>}
			</FinsembleMenuItem>
		);
	}
}