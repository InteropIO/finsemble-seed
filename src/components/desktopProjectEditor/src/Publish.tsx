/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useState, useEffect, useContext } from "react";
import { Tooltip } from "./Tooltip";
import * as Types from "./common/types";
import { PublishProgress } from "./PublishProgress";
import ExportContext from "./ExportContext";
import { ExportDeployInfo } from "./ExportDeployInfo";
import {
	DesktopProjectClient as DesktopProjectClientConstructor,
	ProgressItem,
	ProgressState,
} from "../desktopProjectClient";
import { doPublishToCosaicCloud } from "./common/cosaicCloudPublish";

const DesktopProjectClient = new DesktopProjectClientConstructor();

export const Publish = () => {
	const exportContext = useContext(ExportContext);
	const [currentStep, setCurrentStep] = useState("");
	const [stepProgress, setStepProgress] = useState([] as Array<ProgressItem>);
	const { deployInfo, publishError } = exportContext;

	const tryAgain = () => {
		setCurrentStep("");
		setStepProgress([]);
		exportContext.setDeployInfo(null);
		exportContext.setPublishError("");

		doPublishToCosaicCloud(exportContext);
	};

	const reset = () => {
		exportContext.setIsPublishing(false);
		exportContext.setPublishError(null);
	};

	const hasError = stepProgress.some((step) => step.state === ProgressState.Error);

	const didFinish =
		(stepProgress.length > 0 &&
			stepProgress.every((step) => {
				if (step.state === ProgressState.Error) exportContext.setPublishError(step.error);
				return step.state === ProgressState.Finished;
			})) ||
		hasError;

	useEffect(() => {
		let debounceTimeout: any = null;
		if (!didFinish) {
			debounceTimeout = setInterval(() => {
				DesktopProjectClient.getPublishProgress().then((data) => {
					setCurrentStep(data.currentStep);
					setStepProgress(Object.values(data.steps));

					// Finished! When the installer step reaches state "Finished"
					if (data.steps["cloud"].state === ProgressState.Finished) {
						exportContext.setIsPublishing(false);
						clearInterval(debounceTimeout);
					}
				});
			}, 5000);
		}

		return () => {
			if (debounceTimeout) {
				clearInterval(debounceTimeout);
			}
		};
	}, []);

	return (
		<div className="export-publish-container">
			<h2>Publishing...</h2>

			<div className={["export-publish-progress", hasError ? "export-publish-has-error" : ""].join(" ")}>
				{[
					{
						name: "initialize",
						description: "Creating a location for the project",
						error: "Failed to create a location for the project",
					},
					{
						name: "zip",
						description: "Zipping project",
						error: "Failed to zip the project",
					},
					{
						name: "upload",
						description: "Uploading project",
						error: "Failed to upload the project",
					},
					{
						name: "cloud",
						description: "Creating installer and site",
						error: "Failed to publish",
					},
				].map((step) => {
					let data = stepProgress.find((item) => item.step === step.name);

					return (
						data && (
							<div key={step.name} className="publish-progress-container">
								<div className="publish-progress-icon">
									{data.state === ProgressState.Started ? (
										<PublishProgress {...data}></PublishProgress>
									) : data.state === ProgressState.NotStarted ? (
										<div className="publish-progress-pending"></div>
									) : data.state === ProgressState.Error ? (
										<div className="publish-progress-error"></div>
									) : (
										<div className="publish-progress-success"></div>
									)}
								</div>
								<div className="publish-progress-text">{data.error ? step.error : step.description}</div>
							</div>
						)
					);
				})}
			</div>

			{publishError && (
				<div className="export-publish-error">
					<h3>Your project was not published</h3>

					<p>An error occurred while trying to publish.</p>
					<p className="export-publish-error-message">&quot;{publishError}&quot;</p>

					<div className="export-error-actions">
						<button className="ghost-button" onClick={reset}>
							Cancel
						</button>
						<button id="tryAgain" onClick={tryAgain}>
							Try again
						</button>
					</div>
				</div>
			)}
			{!publishError && deployInfo && (
				<div className="export-publish-uploaded">
					<h3>Project Uploaded...</h3>
					<p>
						Your project has been uploaded to the cloud but it will take several minutes to generate an installer. This
						installer link can be shared with your team. The desktop you&apos;ve created will be available shortly by
						downloading and installing from the link.
					</p>
					<ExportDeployInfo />
				</div>
			)}
		</div>
	);
};
