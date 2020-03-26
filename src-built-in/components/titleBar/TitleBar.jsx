/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import { useTitleBar } from "@chartiq/finsemble-ui/react/hooks";
import { AlwaysOnTopButton, DockingButton, LinkerButton, ShareButton, initializeTitleBar, TabRegion, CloseButton, MaximizeButton, MinimizeButton,  } from "@chartiq/finsemble-ui/react/components";
import "../../../assets/css/finsemble.css";
import "../../../assets/css/_windowTitleBar.css";

/**
 * This is the Title Bar component, which is rendered at
 * the top of every Finsemble-controlled HTML window.
 * You can customize this template by adding or removing
 * elements and sytling as you see fit.
 * 
 * The visibility of each of the controls is controlled by
 * config. For example, setting the
 * "foreign.components.Window Manager.showLinker" property
 * to false will hide the <LinkerButton>.
 */
const TitleBar = () => {
	const {
		showLinkerButton,
		showShareButton,
		showTabRegion,
		showDockingButton,
		showAlwaysOnTopButton,
		showMinimizeButton,
		showMaximizeButton,
		showCloseButton
	} = useTitleBar();
	return (
		<>
			<div className="fsbl-header-left">
				{showLinkerButton && <LinkerButton />}
				{showShareButton && <ShareButton />}
			</div>
			<div className="fsbl-header-center">
				{showTabRegion && <TabRegion/>}
			</div>
			<div className="fsbl-header-right">
				{showDockingButton && <DockingButton />}
				{showAlwaysOnTopButton && <AlwaysOnTopButton/>}
				{showMinimizeButton && <MinimizeButton />}
				{showMaximizeButton && <MaximizeButton />}
				{showCloseButton && <CloseButton />}
			</div>
		</>
	);
}

initializeTitleBar(TitleBar);
