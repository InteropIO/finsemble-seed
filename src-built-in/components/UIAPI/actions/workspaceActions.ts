import { WorkspaceState, ActionTypes } from "../types";

/**
 * Change the ActiveWorkspace
 * @param name of the active workspace
 */
const setActiveWorkspace = (activeWorkspace: WorkspaceState['activeWorkspace']) => {
	return {
		type: ActionTypes.SET_ACTIVE_WORKSPACE,
		payload: activeWorkspace
	}
}

export {
	setActiveWorkspace
}