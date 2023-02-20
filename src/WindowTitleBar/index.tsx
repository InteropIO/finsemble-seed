/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
	FinsembleProvider,
	AlwaysOnTopButton,
	GroupingButton,
	LinkerButton,
	ShareButton,
	TabRegion,
	CloseButton,
	MaximizeButton,
	MinimizeButton,
	WindowTitleBarShell,
	getOrCreateWindowTitleBarContainer,
	FEAGlobals,
	System,
} from "@finsemble/finsemble-core";
import { ComponentDescriptor, } from "@finsemble/finsemble-core/dist/lib/clients/appsClient";
import { log, errorLog } from "../customFDC3/utils";

//custom titlebar component imports
import {CustomLinkerButton} from "./CustomLinkerButton";



/** Util functions for retrieving details of the component (e.g. to check its config) */
let myComponentType: string | null = null;
let myConfig: ComponentDescriptor | null = null;
const getConfiguration = async (): Promise<ComponentDescriptor | null> => {
	return new Promise((resolve, reject) => {
		if (myConfig) {
			resolve(myConfig);
		} else {		
			//N.B. WindowClient.getWindowIdentifier(); could get us component type, but you have to wait for FSBLReady (or at least WindowClient.ready)
			// lets grab it at a lower level to get there quicker.
			System.Window.getCurrent().getOptions(async (options) => {
				myComponentType = options?.customData.component.type;
				if (myComponentType) {
					const response = await FEAGlobals.FSBL.Clients.AppsClient.getComponentDefaultConfig(myComponentType);
					if (response.err || !response.data){
						errorLog("Failed to retrieve componentType and configuration! Error: ", response.err);
						reject();
					} else {
						myConfig = response.data;
						log("Got componentType ", myComponentType, " and config: ", myConfig);
						resolve(myConfig);
					}
				} else {
					errorLog("Failed to retrieve componentType and configuration! WindowOptions: ", options);
					reject();
				}		
			});
		}
	});
	
};

/** Util funciton to determine if the customFDC3 Linker should be shown. It achieves this 
 * by looking for the customFDC3 preload in the config. An alternative would be to look 
 * for a custom config setting.
*/
const shouldShowCustomLinker = async (): Promise<boolean> => {
	const config = await getConfiguration();
	const isCustomFDC3Preload = (urlString: string) => urlString.includes("customFDC3/index.js");
	return new Promise((resolve)=>{
		if (config?.component?.preload) {
			log("got preload config");
			if (Array.isArray(config.component.preload)){
				(config.component.preload as string[]).forEach((aPreload) =>{
					if (isCustomFDC3Preload(aPreload)) {
						resolve(true);
					}
				});
			} else if (typeof config.component.preload === "string") {
				resolve(isCustomFDC3Preload(config.component.preload));
			}
		} else {
			log("no preload config found");
		}
		//if in doubt return default
		resolve(false);
	});
	
	/** Alternative example based on custom config entry
	 * `return Promise.resolve(config?.custom?.customFDC3);`
	 */
}
	

/**
 * This is the Window Title Bar component, which is rendered at
 * the top of every HTML window.
 *
 * You can customize this template by adding or removing
 * elements and styling as you see fit.
 *
 * The visibility of each of the controls can be controlled by
 * config. For example, setting the
 * "foreign.components.Window Manager.showLinker" property
 * to false will hide the <LinkerButton/>. Generally, the controls
 * will determine internally whether they are shown or hidden, however,
 * custo logic can also be handled here.
 *
 * Other buttons are dynamic, such as <GroupingButton> which will only
 * appear when windows are docked or can be docked.
 */
const WindowTitleBar: React.FunctionComponent = () => {
	const [showCustomLinker, setShowCustomLinker] = useState<boolean>(false);

	//do checks for what should be shown in the titlebar
	useEffect(() => {
		shouldShowCustomLinker().then((showCustom) => { log("setting showCustomLinker", showCustom); setShowCustomLinker(showCustom)});
	}, []);

	return (
		<WindowTitleBarShell>
			<div className="fsbl-header-left">
				{showCustomLinker
					? <CustomLinkerButton />
					: <LinkerButton />
				}
				
				{/* Note: The ShareButton component relies on deprecated APIs that 
					will be removed in a future release. */}
				<ShareButton />
			</div>
			<div className="fsbl-header-center">
				{/* If tabbing is disabled, <TabRegion/> will
					only display the title */}
				<TabRegion />
			</div>
			<div className="fsbl-header-right">
				<GroupingButton />
				<AlwaysOnTopButton />
				<MinimizeButton />
				<MaximizeButton />
				<CloseButton />
			</div>
		</WindowTitleBarShell>
	);
};

/**
 * When the titlebar is injected into an app, it is critical for its rendering to be delayed until the app
 * itself has finished rendering its own DOM, otherwise the titlebar will miss the opportunity to
 * reposition the app's DOM to make room for the header.
 */
window.addEventListener("DOMContentLoaded", () => {
	ReactDOM.render(
		<FinsembleProvider floatingFocus={false}>
			<WindowTitleBar />
		</FinsembleProvider>,
		getOrCreateWindowTitleBarContainer()
	);
});
