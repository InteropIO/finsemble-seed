import { WorkspaceState, actions, ACTION_TYPES } from '../types';
import withLogging from '../hoReducers/logging';
import produce from "immer";

export const initialState: WorkspaceState = {
	activeWorkspace: {
		name: ''
	}
};

export const reducer = (state = initialState, action: ACTION_TYPES) => {
	return produce(state, (draft: WorkspaceState) => {
		actions.match(action, {
			SET_ACTIVE_WORKSPACE: ({ name }) => {
				draft.activeWorkspace.name = name;
			},
			default: a => draft
		});
	});
}

export const workspaces = withLogging("Workspaces", reducer);
