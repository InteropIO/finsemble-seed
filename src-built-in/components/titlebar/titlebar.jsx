/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import { useTitleBar } from "@chartiq/finsemble-ui/react/hooks";
import { AlwaysOnTopButton, DockingButton, LinkerButton, ShareButton, initializeTitlebar, TabRegion, CloseButton, MaximizeButton, MinimizeButton,  } from "@chartiq/finsemble-ui/react/components";
import "../../../assets/css/finsemble.css";
import "../../../assets/css/_windowTitleBar.css";

const Titlebar = () => {
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

initializeTitlebar(Titlebar);
