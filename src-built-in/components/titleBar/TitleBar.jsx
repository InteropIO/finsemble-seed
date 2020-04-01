/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */
import React from "react";
// DH 4/1/2020 This is not ideal - we should import from
// hooks, not /hooks/useTitleBar; however, doing so breaks it.
// I will be investigating this, and we will fix before release.
import { useTitleBar } from "@chartiq/finsemble-ui/react/hooks/useTitleBar";
import { AlwaysOnTopButton, DockingButton, LinkerButton, ShareButton, mountTitleBar, TabRegion, CloseButton, MaximizeButton, MinimizeButton } from "@chartiq/finsemble-ui/react/components";
import "../../../assets/css/finsemble.css";
import "../../../assets/css/_titleBar.css";


/**
 * This is the Title Bar component, which is rendered at
 * the top of every Finsemble-controlled HTML window.
 * You can customize this template by adding or removing
 * elements and sytling as you see fit.
 *
 * The visibility of each of the controls is controlled by
 * config. For example, setting the
 * "foreign.components.Window Manager.showLinker" property
 * to false will hide the <LinkerButton/>.
 */
const TitleBar = () => {
	const {
		showLinkerButton,
		showShareButton,
		showDockingButton,
		showAlwaysOnTopButton,
		showMinimizeButton,
		showMaximizeButton,
		showCloseButton,
	} = useTitleBar();

	return (
		<>
			<div className="fsbl-header-left">
				{showLinkerButton && <LinkerButton />}
				{showShareButton && <ShareButton />}
			</div>
			<div className="fsbl-header-center">
				{/* If tabbing is disabled, <TabRegion/> will
					only display the title */}
				<TabRegion />
			</div>
			<div className="fsbl-header-right">
				{showDockingButton && <DockingButton />}
				{showAlwaysOnTopButton && <AlwaysOnTopButton />}
				{showMinimizeButton && <MinimizeButton />}
				{showMaximizeButton && <MaximizeButton />}
				{showCloseButton && <CloseButton />}
			</div>
		</>
	);
};

// Because the TitleBar is mounted to dynamically created
// DOM elements, you must pass in the TitleBar to this function.
// Doing will so will (asynchronously) register the TitleBar
// with Finsemble, create the DOM, and mount it.
mountTitleBar(TitleBar);
