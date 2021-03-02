import React, { useState } from "react";
import { DeployInfo } from "../desktopProjectClient";

export type ExportContextType = {
	isPublishing: boolean;
	publishError: string | null;
	deployInfo: DeployInfo | null;
	setIsPublishing: (value: boolean) => void;
	setDeployInfo: (deployInfo: DeployInfo | null) => void;
	setPublishError: (error: string | null) => void;
};

export const ExportContext = React.createContext<ExportContextType>({} as ExportContextType);

ExportContext.displayName = "ExportContext";

export const ExportProvider: React.FunctionComponent = ({ children }) => {
	const [isPublishing, setIsPublishing] = useState(false);
	const [deployInfo, setDeployInfo] = useState<DeployInfo | null>(null);
	const [publishError, setPublishError] = useState<string | null>(null);

	const contextValue = {
		isPublishing,
		deployInfo: deployInfo,
		publishError: publishError,
		setIsPublishing,
		setDeployInfo,
		setPublishError,
	};

	return <ExportContext.Provider value={contextValue}>{children}</ExportContext.Provider>;
};

export default ExportContext;
