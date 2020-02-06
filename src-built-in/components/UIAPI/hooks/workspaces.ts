import { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState, WorkspaceState } from '../types';
import * as Actions from '../actions/workspaceActions';

export const useWorkspaces = () => {
	const dispatch = useDispatch();
	const setActiveWorkspaceName = (name:string) => {
		dispatch(Actions.setActiveWorkspaceName(name));
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
		setInitialActiveWorkspace();
	}, []);

	return {
		activeWorkspaceName: activeWorkspace.name,
		setActiveWorkspaceName
	}
}