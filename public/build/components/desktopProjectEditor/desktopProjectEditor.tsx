/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import "@finsemble/finsemble-ui/react/ui-assets/css/finsemble.css";
import "./css/styles.css";

import { GettingStarted } from "./src/GettingStarted";
import { Applications } from "./src/Applications";
import { Themes } from "./src/Themes";
import { Export } from "./src/Export";
import { ExportProvider } from "./src/ExportContext";
import getCSSVars from "./src/common/getCSSVars";

import { DesktopProjectClient } from "./desktopProjectClient";

/**
 * allows navigaiton change outside of root component
 * allows setting current view props outside of root component
 */
import NavigationContext from "./src/NavigationContext";

/**
 * store for config
 */
import ConfigContext from "./src/ConfigContext";

/**
 * store for theme settings
 */
import ThemeContext from "./src/ThemeContext";

/**
 * store for project name and user data
 */

import ProjectContext from "./src/ProjectContext";

/**
 * store information about desktop project server
 */

import DPServerInfoContext from "./src/DPServerInfoContext";
import { ProjectHeader } from "./src/ProjectHeader";
import { DPServerInfo } from "common/system";

declare global {
	interface Window {
		DesktopProjectClient: any;
		DesktopProjectEditor: any;
	}
}

const desktopProjectClient = new DesktopProjectClient();

declare global {
	interface Window {
		DesktopProjectClient: any;
	}
}

const views = [
	{
		id: "getting-started",
		icon: "icon-getting-started",
		name: "Getting Started",
		component: GettingStarted,
	},
	{
		id: "applications",
		icon: "icon-applications",
		name: "Applications",
		component: Applications,
		props: {
			setupType: "",
			componentID: "",
		},
	},
	{
		id: "themes",
		icon: "icon-themes",
		name: "Theme",
		component: Themes,
	},
	{
		id: "export",
		icon: "icon-export",
		name: "Publish",
		component: Export,
	},
];

const getDefaultTheme = () => {
	let globalCssVars: any = {};
	const docStyle = window.getComputedStyle(document.documentElement);
	getCSSVars(document.styleSheets).forEach((varName: any) => {
		globalCssVars[varName] = docStyle.getPropertyValue(varName).trim();
	});

	// In order to prevent the theme from affecting content of desktopProjectEditor.tsx,
	// remove the sheet after reading variables
	const themesheet = document.body.querySelector("#themesheet");
	if (themesheet) {
		document.body.removeChild(themesheet);
	}

	return globalCssVars;
};

let themeConfig = {
	currentTheme: "Default",
	defaultTheme: "Default",
	themes: {
		Default: getDefaultTheme(),
	},
};

const DesktopProjectEditor = () => {
	const [currentViewID, setCurrentViewID] = useState(views[0].id);
	const [currentViewProps, setCurrentViewProps] = useState(views[0].props);
	const [config, setConfig] = useState({});
	const [theme, setTheme] = useState(themeConfig);
	const [dpServerInfo, setDPServerInfo] = useState({ enabled: false, applicationRoot: "" } as DPServerInfo);
	const [isPublishing, setIsPublishing] = useState(false);

	const [project, setProject] = useState({
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
			toolbarIcon: "",
			installerIcon: "",
			taskbarIcon: "",
			systemTrayIcon: "",
			splashScreenImage: "",
		},
	});

	useEffect(() => {
		desktopProjectClient.updateProjectSettings({
			name: project.name,
		});
	}, [project]);

	const currentIndex = Math.max(
		0,
		views.findIndex((view) => view.id === currentViewID)
	);

	const currentView = views[currentIndex] || views[0];

	let View = currentView.component;

	const themeListenerRef = useRef((addListenerErr: any, { data }: { data: any }) => {
		const newTheme = { ...themeConfig };
		newTheme.themes.Default = { ...newTheme.themes.Default };

		for (let [key, value] of Object.entries(data)) {
			newTheme.themes.Default[key] = value;
		}
		setTheme(newTheme);
	});

	const clickResetProjectButton = () => {
		const resetProject = async () => {
			const [err] = await desktopProjectClient.resetProject();
			if (err) alert(`Project failed to reset: ${err.message}`);
		};
		FSBL.Clients.DialogManager.open(
			"yesNo",
			{
				title: "Are you sure?",
				question: `Your project will be set back to factory defaults. You will lose all customizations except the name of the project. Finsemble will then be restarted.`,
				hideModalOnClose: true,
				showNegativeButton: false,
				affirmativeResponseLabel: "Reset Project",
			},
			(err: any, response: { choice: string }) => {
				if (response.choice === "affirmative") {
					resetProject();
				}
			}
		);
	};

	const launchUserGuide = () => {
		FSBL.Clients.DialogManager.spawnDialog(
			{
				name: "User Guide",
				width: 750,
				url: "https://documentation.finsemble.com/tutorial-getting-started-with-desktop-projects.html",
			},
			{},
			() => {}
		);
	};

	// Similar to componentDidMount and componentDidUpdate:
	useEffect(() => {
		FSBL.Clients.ConfigClient.get({}, (err: any, newConfig: any) => {
			if (err) {
				FSBL.Clients.Logger.error("DesktopProjectEditor", err);
				return;
			}

			setConfig(newConfig);

			desktopProjectClient.getDPServerInfo().then((jsInfo) => {
				if (!jsInfo.enabled) {
					FSBL.Clients.Logger.error(
						"Desktop Project Editor started without the Desktop Project Server being enabled. Check FEA configuration."
					);
				} else {
					FSBL.Clients.Logger.log(`DPS application root: ${jsInfo.applicationRoot}`);
				}
				FSBL.Clients.Logger.log(`DPS info: ${JSON.stringify(jsInfo)}`);
				FSBL.Clients.Logger.log(`NewConfig info: ${JSON.stringify(newConfig)}`);

				setProject({
					...project,
					name: jsInfo?.projectConfig?.name || "",
					export: {
						...project.export,
						toolbarIcon: "/assets/img/Finsemble_Toolbar_Icon.png",
						installerIcon: "/assets/img/installer_icon.ico",
						taskbarIcon: newConfig?.startup_app?.applicationIcon,
						systemTrayIcon: newConfig?.finsemble?.systemTrayIcon,
						splashScreenImage: newConfig?.splashScreenImage,
					},
				});

				// This should be done last as its checked for initial rendering
				// Otherwise, inital values will be cached within states of sub components
				// "Untitled Project" will show as project.name since it will be "", e.g.
				setDPServerInfo(jsInfo);
			});
		});

		const removeHandler = DesktopProjectClient.onThemeUpdated(themeListenerRef.current);
		return () => {
			removeHandler();
		};
	}, []);

	return dpServerInfo.enabled ? (
		<NavigationContext.Provider
			value={{
				currentViewID,
				currentViewProps,
				setCurrentViewID,
				setCurrentViewProps,
			}}
		>
			<DPServerInfoContext.Provider value={dpServerInfo}>
				<ProjectContext.Provider value={project}>
					<ConfigContext.Provider value={config}>
						<ThemeContext.Provider value={theme}>
							<ExportProvider>
								<div className="config-container">
									<ProjectHeader
										projectName={project?.name === "default" ? "" : project?.name}
										onSaveProjectName={(name: string) => {
											desktopProjectClient.updateProjectSettings({ name: name }).then(({ err }) => {
												if (err) {
													FSBL.Clients.Logger.error(`ERROR updateProjectSettings: ${JSON.stringify(err)}`);
												} else {
													setProject({
														...project,
														name,
													});
												}
											});
										}}
									></ProjectHeader>
									<div className="project-container">
										<div className="nav-container">
											<ul className="nav">
												{views.map((view) => (
													<li
														key={view.name}
														className={["nav-item", view.name === currentView.name ? "active" : ""].join(" ")}
													>
														<a
															id={`${view.id}-nav-link`}
															href="#"
															onClick={() => {
																setCurrentViewID(view.id);
																// @ts-ignore
																setCurrentViewProps(view.props || {});
															}}
														>
															<div className={["nav-icon", view.icon].join(" ")}></div>
															{view.name}
														</a>
													</li>
												))}
											</ul>
											<div className="bottom-nav-wrapper">
												<div className="nav-anchor">
													<button onClick={launchUserGuide}>User Guide</button>
												</div>
												<div className="nav-anchor-reset">
													<button onClick={clickResetProjectButton}>Reset Project</button>
												</div>
											</div>
										</div>
										<div className="view-container">
											{/* @ts-ignore */}
											<View {...currentViewProps}></View>
										</div>
									</div>
								</div>
							</ExportProvider>
						</ThemeContext.Provider>
					</ConfigContext.Provider>
				</ProjectContext.Provider>
			</DPServerInfoContext.Provider>
		</NavigationContext.Provider>
	) : null;
};

ReactDOM.render(
	<FinsembleProvider>
		<DesktopProjectEditor />
	</FinsembleProvider>,
	document.getElementById("desktopProjectEditor")
);
