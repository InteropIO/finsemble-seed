import { WorkspaceState, ActionTypes, WorskpaceActions } from '../types';
import withLogging from '../hoReducers/logging';

export const initialState: WorkspaceState = {
	activeWorkspace: {
		name: null
	}
};

export const workspaces = (state: WorkspaceState = initialState, action: WorskpaceActions) => {
	const { type, payload } = action;
	switch (type) {
		case ActionTypes.SET_ACTIVE_WORKSPACE_NAME:
			return {
				...state,
				activeWorkspace: {
					name: payload.name
				}
			}
		default:
			return state;
	}
}

export default withLogging("Workspaces", workspaces);
