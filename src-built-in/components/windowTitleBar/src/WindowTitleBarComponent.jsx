/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import { useTitleBar } from "@chartiq/finsemble-ui/react/hooks";
import {LinkerButton, ShareButton, initializeTitlebar } from "@chartiq/finsemble-ui/react/components";
import "../../../../assets/css/finsemble.css";
import "../../../../assets/css/_windowTitleBar.css";

const Titlebar = () => {
	const {
		showLinkerButton,
		showShareButton,
	} = useTitleBar();
	return (
		<>
			<div className="fsbl-header-left">
				{showLinkerButton && <LinkerButton />}
				{showShareButton && <ShareButton />}
			</div>
		</>
	);
}

initializeTitlebar(Titlebar);
