import React, { useEffect, useContext } from "react";
import { DesktopProjectClient as DesktopProjectClientConstructor } from "../desktopProjectClient";
import ExportContext from "./ExportContext";
import { doPublishToCosaicCloud } from "./common/cosaicCloudPublish";

const DesktopProjectClient = new DesktopProjectClientConstructor();

export const ExportLeft = () => {
	const exportContext = useContext(ExportContext);

	/**
	 * This will run once. We'll check to see if there's a current deployInfo for our
	 * project, in other words has it already been published.
	 */
	useEffect(() => {
		const getProjectConfig = async () => {
			const projectConfig = await DesktopProjectClient.projectConfig();
			const currentDeployInfo = projectConfig?.deployInfo;
			if (currentDeployInfo) exportContext.setDeployInfo(currentDeployInfo);
		};
		getProjectConfig();
	}, []);

	return (
		<div className="export-method">
			{exportContext.deployInfo ? (
				<div>
					<h2>Update Your Project</h2>
					<p>
						You may continue to update your desktop with new apps. Publish at any time to push updates to your team.
						They&apos;ll just need to restart their app to get the changes.
					</p>
				</div>
			) : (
				<div>
					<h2>Publish Your Project</h2>
					<p>
						Upload your desktop project to Cosaic&apos;s cloud service to make it available to your team. After,
						continue to make changes as desired and push updates to your team.
					</p>
				</div>
			)}

			<div className="export-method-actions">
				<button
					className="export-method-button"
					type="submit"
					onClick={() => {
						doPublishToCosaicCloud(exportContext);
					}}
				>
					Publish
				</button>
			</div>
		</div>
	);
};
