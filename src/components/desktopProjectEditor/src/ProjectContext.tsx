import React from "react";

import * as Types from "./common/types";

const Context = React.createContext({
	name: "",
	user: {
		firstName: "",
		lastName: "",
		company: "",
		email: "",
	},
	export: {
		author: "",
		companyName: "",
		description: "",
		installerIcon: "",
	},
} as Types.ProjectSaveData);

Context.displayName = "ProjectContext";

export default Context;
