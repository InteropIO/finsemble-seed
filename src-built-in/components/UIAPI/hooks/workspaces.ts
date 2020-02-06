import { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState, WorkspaceState } from '../types';
import * as Actions from '../actions/workspaceActions';


/**
 * A hook for getting the activeWorkspaceName,
 * and setting the activeWorkspaceName.
 */
export const useWorkspaces = () => {
	const dispatch = useDispatch();
	const setActiveWorkspaceName = (name:string) => {
		dispatch(Actions.setActiveWorkspaceName(name));
	}
	// Run every time the workspace service pushes out an update.
	const onWorkspaceUpdate = (err: any, response: any) => {
		if (response.data && response.data.activeWorkspace) {
			setActiveWorkspaceName(response.data.activeWorkspace.name);
		}
	}
	const state:WorkspaceState = useSelector((state: RootState) => state.workspaces);
	const { activeWorkspace } = state;

	/**
	 * On initial render, go get the active workspace
	 * from the workspace client. Then dispatch an action
	 * to change the state in the store.
	 * getInitialActiveWorkspace() is defined inside of useEffect
	 * because of a TS quirk. see article below
	 * https://medium.com/javascript-in-plain-english/how-to-use-async-function-in-react-hook-useeffect-typescript-js-6204a788a435
	 **/
	useEffect(() => {
		const setInitialActiveWorkspace = async () => {
			const { data: aws } = await FSBL.Clients.WorkspaceClient.getActiveWorkspace();
			setActiveWorkspaceName(aws.name);
		}
		// When the workspace updates, update the active workspace name.
		const listenForWorkspaceUpdates = () => {
			return FSBL.Clients.RouterClient.subscribe("Finsemble.WorkspaceService.update", onWorkspaceUpdate);
		}

		setInitialActiveWorkspace();
		const WorkspaceUpdateSubscribeID = listenForWorkspaceUpdates();

		return function cleanup() {
			FSBL.Clients.RouterClient.unsubscribe(WorkspaceUpdateSubscribeID);
		}
	}, []);

	return {
		activeWorkspaceName: activeWorkspace.name
	}
}