import React, { useState, useEffect, useContext } from "react";
import { DesktopProjectClient as DesktopProjectClientConstructor, ProjectConfig } from "../desktopProjectClient";
import ProjectContext from "./ProjectContext";

const DesktopProjectClient = new DesktopProjectClientConstructor();

export const ExportRight = () => {
	const projectSettings = useContext(ProjectContext);
	const [isZipping, setIsZipping] = useState(false);

	const openFileDialog = (projectName: any, targetPath: any | undefined = undefined) => {
		DesktopProjectClient.createProjectZip(projectName || "default", targetPath)
			.then((file) => {
				setIsZipping(true);
				FSBL.Clients.Logger.log("created zip file", file);
			})
			.catch((e) => {
				FSBL.Clients.Logger.log("createProjectZip Error", e.message);
			})
			.finally(() => {
				setIsZipping(false);
			});
	};

	return (
		<div className="export-method">
			<div>
				<h2>Take One Step Further</h2>

				<p>So much more can be done to create powerful desktops. Share with a developer or IT team to get started.</p>
			</div>

			<div className="export-method-actions">
				{!isZipping ? (
					// data-target-upload-path
					// native dialog bypass mechanism
					// a path for automated UI tests, since they can't access the native dialog
					<button
						className="export-method-button"
						type="submit"
						data-target-upload-path=""
						onClick={(e) => {
							openFileDialog(projectSettings.name, e.currentTarget.dataset.targetUploadPath);
						}}
					>
						Export .Zip File
					</button>
				) : (
					<div>Creating Zip...</div>
				)}
				{/* <button type="submit">Share to Github</button> */}
			</div>
		</div>
	);
};
