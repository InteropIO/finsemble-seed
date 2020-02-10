import { WorkspaceState, actions, ACTION_TYPES } from '../types';
import withLogging from '../hoReducers/logging';
import produce from "immer";

export const initialState: WorkspaceState = {
	activeWorkspace: {
		name: null
	}
};

export const workspaces = (state: WorkspaceState = initialState, action: ACTION_TYPES) => {
	produce(state, (draft: WorkspaceState) => {
		actions.match(action, {
			SET_ACTIVE_WORKSPACE: ({ name }) => {
				draft.activeWorkspace.name = name;
			},
			default: (state) => state
		});
	});
}

// Wraps the reducer with some logging so that we can debug
// field reported bugs.
export default withLogging("Workspaces", workspaces);
