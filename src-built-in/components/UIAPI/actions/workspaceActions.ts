import { ActionTypes } from "../types";

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