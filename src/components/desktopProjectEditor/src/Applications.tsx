/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useState, useEffect, useContext } from "react";
import { View } from "./View";
import { Header } from "./Header";
import { Content } from "./Content";
import { ApplicationEdit } from "./ApplicationEdit";
import { ApplicationSetup } from "./ApplicationSetup";
import { ApplicationList } from "./ApplicationList";

import ConfigContext from "./ConfigContext";
import * as Types from "./common/types";

import { DesktopProjectClient as DesktopProjectClientConstructor } from "../desktopProjectClient";

const DesktopProjectClient = new DesktopProjectClientConstructor();

function appConfigToAppData(appConfig: any): Types.ApplicationSaveData {
	return {
		name: appConfig.name,
		description: appConfig.description,
		url: appConfig.manifest.window.url,
		path: appConfig.manifest.window.path,
		width: appConfig.manifest.window.width,
		height: appConfig.manifest.window.height,
	};
}

export const Applications = (props: any) => {
	const [apps, setApps] = useState([] as any);
	const [currentSetupType, setCurrentSetupType] = useState(props.setupType || "");
	const [isEditMode, setIsEditMode] = useState(false);
	const [appConfigReady, setAppConfigReady] = useState(false);
	const [currentAppID, setCurrentAppID] = useState(props.appID || "");
	const [currentAppConfig, setCurrentAppConfig] = useState({} as any);
	const [savingComponent, setSavingComponent] = useState(false);

	function updateAppList() {
		DesktopProjectClient.getApps().then((response) => {
			setApps(response.apps);
			FSBL.Clients.Logger.log("apps", response.apps);
		});
	}

	useEffect(updateAppList, []);

	useEffect(() => {
		setAppConfigReady(false);

		if (currentAppID === "new") {
			setCurrentAppID(new Date().getTime().toString());
		}

		if (currentAppID) {
			DesktopProjectClient.getAppConfigTemplate().then((res) => {
				const configTemplate = res.config;

				DesktopProjectClient.getAppConfig(currentAppID).then((res) => {
					setCurrentAppConfig({
						...configTemplate,
						...(res.config || apps.filter((app: any) => app.appId === currentAppID)[0]),
					});

					setAppConfigReady(true);
				});
			});
		}
	}, [currentAppID]);

	useEffect(() => {
		const appConfig = currentAppConfig;
		const { appId, name: appName } = appConfig;

		if (savingComponent) {
			FSBL.Clients.Logger.log(`Saving component.  ${{ appId, appName, appConfig }}`);
			if (!isEditMode) {
				DesktopProjectClient.addApp(appId, appConfig)
					.then((response) => {
						FSBL.Clients.Logger.log(`App Added.  Response: ${response}`);
						updateAppList();
					})
					.catch((e) => {
						FSBL.Clients.Logger.error(`Couldn't add app.  Error: ${e}`);
					});
			} else {
				DesktopProjectClient.updateApp(appId, appConfig)
					.then((response) => {
						FSBL.Clients.Logger.log(`App Updated.  Response: ${response}`);
						updateAppList();
					})
					.catch((e) => {
						FSBL.Clients.Logger.error(`Couldn't add app.  Error: ${e}`);
					});
			}

			setSavingComponent(false);
			setCurrentSetupType("completed");
		}
	}, [currentAppConfig]);

	const removeAppID = (id: any) => {
		// Always remove and replace component
		DesktopProjectClient.deleteApp(id).then(({ err }: { err: string }) => {
			if (err) {
				// @todo : add error handling.  Maybe react-toast-notify?
				alert(err);
			}
			updateAppList();
		});
	};

	const onSaveData = (data: Types.ApplicationSaveData) => {
		const appConfig = {
			...currentAppConfig,
			name: data.name,
			description: data.description,
			appId: data.name,
			appName: data.name,
		};

		if (data.appType == "native") {
			appConfig.manifest.window.windowType = "assimilation";
			appConfig.manifest.window.path = data.path;
			delete appConfig.manifest.window.url;
		} else {
			delete appConfig.manifest.window.windowType;
			delete appConfig.manifest.window.path;
			appConfig.manifest.window.url = data.url;
		}

		appConfig.manifest.window.width = data.width;
		appConfig.manifest.window.height = data.height;

		// Always remove and replace component
		DesktopProjectClient.deleteApp(currentAppID).then(({ err }: { err: string }) => {
			if (err) {
				// @todo : add error handling.  Maybe react-toast-notify?
				alert(err);
			}
			updateAppList();
			setSavingComponent(true);
			setCurrentAppConfig(appConfig);
		});
	};

	return (
		<View>
			<Header>Applications</Header>
			<Content>
				<button
					className="app-add-new rounded"
					onClick={() => {
						setCurrentSetupType("");
						setIsEditMode(false);
						setCurrentAppID("new");
					}}
				>
					+ Add New
				</button>

				{appConfigReady &&
					(!currentSetupType ? (
						<div className="setup-type-container">
							<View>
								<Header
									onClickBackButton={(e: any) => {
										setCurrentSetupType("");
										setCurrentAppID("");
									}}
								>
									Add New Application
								</Header>

								<Content>
									<h2 className="setup-type-heading">Choose a method to add an application</h2>
									<div className="tile-type-buttons">
										<button
											className="tile-type-button app-wizard"
											onClick={(e) => {
												setCurrentSetupType("simple");
											}}
										>
											<div>Application Wizard</div>
										</button>
										<button
											className="tile-type-button app-manual"
											onClick={(e) => {
												setCurrentSetupType("advanced");
											}}
										>
											<div>Manual Setup (Advanced)</div>
										</button>
									</div>
								</Content>
							</View>
						</div>
					) : currentSetupType === "advanced" || currentSetupType === "completed" ? (
						<ApplicationEdit
							id={currentAppID}
							data={appConfigToAppData(currentAppConfig) as Types.ApplicationSaveData}
							apps={apps}
							isSetupWizard={false}
							{...{
								currentSetupType,
								isEditMode,
								setCurrentSetupType,
								removeAppID,
								setCurrentAppID,
								onSaveData,
							}}
						></ApplicationEdit>
					) : (
						// else "application setup wizard"
						<ApplicationSetup
							id={currentAppID}
							data={appConfigToAppData(currentAppConfig) as Types.ApplicationSaveData}
							apps={apps}
							{...{
								setCurrentSetupType,
								removeAppID,
								setCurrentAppID,
								onSaveData,
							}}
						></ApplicationSetup>
					))}

				<ApplicationList
					{...{
						apps,
						setIsEditMode,
						setCurrentSetupType,
						setCurrentAppID,
						removeAppID,
						currentAppID,
					}}
				></ApplicationList>
			</Content>
		</View>
	);
};
