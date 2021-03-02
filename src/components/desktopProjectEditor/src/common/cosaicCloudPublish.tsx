import { ExportContextType } from "../ExportContext";
import { DesktopProjectClient as DesktopProjectClientConstructor, DeployInfo } from "../../desktopProjectClient";

const DesktopProjectClient = new DesktopProjectClientConstructor();

/* exportContext is the result of useContext() */
export const doPublishToCosaicCloud = (exportContext: ExportContextType) => {
	const gotDeployInfo = (deployInfo: DeployInfo) => {
		exportContext.setDeployInfo(deployInfo);
	};

	const publishError = (error: Error) => {
		exportContext.setPublishError(error.message);
	};

	exportContext.setIsPublishing(true);

	/**
	 * publishToCosaicCloud() returns when the project has been pushed up to Cosaic Cloud, but then there are further
	 * steps occurring in the cloud to generate an installer.
	 */
	DesktopProjectClient.publishToCosaicCloud()
		.then((deployInfo) => {
			gotDeployInfo(deployInfo);
		})
		.catch((error) => {
			publishError(error);
		});
};
