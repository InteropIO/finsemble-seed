/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useState, useEffect, useContext } from "react";
import { FileInput } from "./FileInput";
import { Tooltip } from "./Tooltip";
import ProjectContext from "./ProjectContext";
import * as Types from "./common/types";
import DPServerInfo from "./DPServerInfoContext";
import { DesktopProjectClient as DesktopProjectClientConstructor } from "../desktopProjectClient";
import { DPServerInfo as DPServerInfoType } from "common/system";
import { Header } from "./Header";

const DesktopProjectClient = new DesktopProjectClientConstructor();

const getAssetUrl = (dpServerInfo: DPServerInfoType, assetUrl: string, iconsChanged: number | undefined) => {
	const baseUrl = assetUrl.startsWith(dpServerInfo.applicationRoot ?? "")
		? assetUrl
		: `${dpServerInfo.applicationRoot}/${assetUrl}`;
	return iconsChanged ? `${baseUrl}?${iconsChanged}` : baseUrl;
};

export const ProjectAssets = (props: any) => {
	const dpServerInfo = useContext(DPServerInfo);
	const project = useContext(ProjectContext);
	const [toolbarIcon, setToolbarIcon] = useState(project.export.toolbarIcon);
	const [installerIcon, setInstallerIcon] = useState(project.export.installerIcon);
	const [taskbarIcon, setTaskbarIcon] = useState(project.export.taskbarIcon);
	const [systemTrayIcon, setSystemTrayIcon] = useState(project.export.systemTrayIcon);
	const [splashScreenImage, setSplashScreenImage] = useState(project.export.splashScreenImage);
	const [iconsChanged, setIconsChanged] = useState(0);

	useEffect(() => {
		project.export.toolbarIcon = toolbarIcon;
		project.export.installerIcon = installerIcon;
		project.export.taskbarIcon = taskbarIcon;
		project.export.systemTrayIcon = systemTrayIcon;
		project.export.splashScreenImage = splashScreenImage;

		if (typeof props.onSetValue === "function") {
			props.onSetValue({
				toolbarIcon,
				installerIcon,
				taskbarIcon,
				systemTrayIcon,
				splashScreenImage,
			});
		}
	});

	return (
		<div className="images-section">
			<Header>Images & Icons</Header>
			<fieldset className="project-assets">
				<div className="project-assets-field">
					<label htmlFor="export-splash-screen">
						<span>Splash Screen</span>

						<Tooltip>
							The Splash screen should be 600px X 400px (W x H). Supported formats are PNG, JPG, and GIF.
						</Tooltip>
					</label>

					<div className="project-splash-screen-field">
						<FileInput
							value={splashScreenImage}
							onSetValue={(value: any) => {
								setSplashScreenImage(value);
								setIconsChanged(new Date().getTime());
							}}
							uploadFunction={(file: File) => DesktopProjectClient.updateSplashScreen(file)}
							acceptTypes={["image/png", "image/jpeg", "image/gif"]}
						></FileInput>

						{!splashScreenImage ? (
							<div className="empty-preview">Image Preview</div>
						) : (
							<div className="filled-preview">
								<img src={getAssetUrl(dpServerInfo, splashScreenImage, iconsChanged)} />
							</div>
						)}
					</div>
				</div>

				<div className="project-assets-field">
					<label htmlFor="export-splash-screen">
						<span>Toolbar Icon</span>

						<Tooltip>Toolbar icon should be 200px X 200px. Supported formats are PNG, JPG, and GIF.</Tooltip>
					</label>

					<div className="project-icon-field">
						<FileInput
							value={toolbarIcon}
							onSetValue={(value: any) => {
								setToolbarIcon(value);
								setIconsChanged(new Date().getTime());
							}}
							uploadFunction={(file: File) => DesktopProjectClient.updateToolbarIcon(file)}
							acceptTypes={["image/png", "image/jpeg", "image/gif"]}
						></FileInput>

						{!toolbarIcon ? (
							<div className="empty-preview"></div>
						) : (
							<div className="filled-preview">
								<img src={getAssetUrl(dpServerInfo, toolbarIcon, iconsChanged)} />
							</div>
						)}
					</div>
				</div>

				<div className="project-assets-field">
					<label htmlFor="export-taskbar-icon">
						<span>Taskbar Icon</span>

						<Tooltip>Toolbar icon should be 400px X 400px. Supported formats are PNG and JPG</Tooltip>
					</label>

					<div className="project-icon-field">
						<FileInput
							value={taskbarIcon}
							onSetValue={(value: any) => {
								setTaskbarIcon(value);
								setIconsChanged(new Date().getTime());
							}}
							uploadFunction={(file: File) => DesktopProjectClient.updateTaskbarIcon(file)}
							acceptTypes={["image/png", "image/jpeg"]}
						></FileInput>

						{!taskbarIcon ? (
							<div className="empty-preview"></div>
						) : (
							<div className="filled-preview">
								<img src={getAssetUrl(dpServerInfo, taskbarIcon, iconsChanged)} />
							</div>
						)}
					</div>
				</div>

				<div className="project-assets-field">
					<label htmlFor="export-system-tray-icon">
						<span>System Tray Icon</span>

						<Tooltip>System Tray icon should be 100px X 100px. Supported formats are PNG and JPG.</Tooltip>
					</label>

					<div className="project-icon-field">
						<FileInput
							value={systemTrayIcon}
							onSetValue={(value: any) => {
								setSystemTrayIcon(value);
								setIconsChanged(new Date().getTime());
							}}
							uploadFunction={(file: File) => DesktopProjectClient.updateSystemTrayIcon(file)}
							acceptTypes={["image/png", "image/jpeg"]}
						></FileInput>

						{!systemTrayIcon ? (
							<div className="empty-preview"></div>
						) : (
							<div className="filled-preview">
								<img src={getAssetUrl(dpServerInfo, systemTrayIcon, iconsChanged)} />
							</div>
						)}
					</div>
				</div>

				<div className="project-assets-field">
					<label htmlFor="export-installer-icon">
						<span>Installer Icon</span>

						<Tooltip>
							Installer icons must be ICO format. ICO images are easily created from PNG files using free online
							services. Please see the User Guide for more information.
						</Tooltip>
					</label>

					<div className="project-icon-field">
						<FileInput
							value={installerIcon}
							onSetValue={(value: any) => {
								setInstallerIcon(value);
								setIconsChanged(new Date().getTime());
							}}
							uploadFunction={(file: File) => DesktopProjectClient.updateInstallerIcon(file)}
							acceptTypes={["image/x-icon"]}
						></FileInput>

						{!installerIcon ? (
							<div className="empty-preview"></div>
						) : (
							<div className="filled-preview">
								<img src={getAssetUrl(dpServerInfo, installerIcon, iconsChanged)} />
							</div>
						)}
					</div>
				</div>
			</fieldset>
		</div>
	);
};
