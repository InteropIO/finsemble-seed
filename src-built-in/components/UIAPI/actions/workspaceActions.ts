import { ActionTypes } from "../types";

/**
 * Change the activeWorkspaceName
 * @param name Name of the active workspace
 */
const setActiveWorkspaceName = (name: string) => {
	return {
		type: ActionTypes.SET_ACTIVE_WORKSPACE_NAME,
		payload: {
			name: name
		}
	}
}

export {
	setActiveWorkspaceName
}