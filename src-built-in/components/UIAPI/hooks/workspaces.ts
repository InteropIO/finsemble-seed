import { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState, WorkspaceState, actions } from '../types';

declare type WorkspaceUpdate = {
	data: {
		activeWorkspace: {
			name: string
		}
	}
}
/**
 * A hook for getting the ActiveWorkspace,
 * and setting the ActiveWorkspace.
 */
export const useWorkspaces = () => {
	const dispatch = useDispatch();
	const setActiveWorkspace = (activeWorkspace: WorkspaceState['activeWorkspace']) => {
		dispatch(actions.SET_ACTIVE_WORKSPACE(activeWorkspace));
	}
	// Run every time the workspace service pushes out an update.
	const onWorkspaceUpdate = (err: any, response: WorkspaceUpdate) => {
		if (response.data && response.data.activeWorkspace) {
			console.log("onWorkspaceUpdate", response.data.activeWorkspace);
			setActiveWorkspace(response.data.activeWorkspace);
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
		// When the workspace updates, update the active workspace name.
		// We will also get the active workspace as soon as we subscribe.
		const WorkspaceUpdateSubscribeID = FSBL.Clients.RouterClient.subscribe("Finsemble.WorkspaceService.update", onWorkspaceUpdate);

		return function cleanup() {
			FSBL.Clients.RouterClient.unsubscribe(WorkspaceUpdateSubscribeID);
		}
	}, []);

	return {
		activeWorkspace
	}
}