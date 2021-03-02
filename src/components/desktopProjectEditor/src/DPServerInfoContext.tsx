import { DPServerInfo } from "common/system";
import React from "react";

const Context = React.createContext({
	enabled: true,
	applicationRoot: "",
} as DPServerInfo);

Context.displayName = "DPServerInfo";

export default Context;
