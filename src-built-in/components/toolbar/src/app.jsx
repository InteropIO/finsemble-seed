/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

// Static vs Dynamic Toolbar
// import Toolbar from "./staticToolbar";
// Uncomment below if you want to show the dynamic toolbar on top of the refactored toolbar.
// import Toolbar from "./dynamicToolbar";
import ReactDOM from "react-dom";
import React from "react";
import { ToolbarShell } from "@chartiq/finsemble-ui/lib/components/toolbar/ToolbarShell";
import { onReady } from "@chartiq/finsemble-ui/lib/effects/onReadyEffects";
import { DragHandle } from '@chartiq/finsemble-ui/lib/components/toolbar/DragHandle'
import { RevealAll } from '@chartiq/finsemble-ui/lib/components/toolbar/revealAll';
import { DummyExport } from '@chartiq/finsemble-ui/lib/components/dummyExport'
import '../toolbar.css';
const Toolbar = () => {
	return (
		<ToolbarShell>
			<DragHandle />
			<RevealAll />
			<DummyExport/>
			{/* Drag Handle */}
			{/* Workspace Management Menu */}
			{/* App Menu */}
			{/* Favorites Section */}
			{/* Minimize All */}
			{/* Reveal All */}
			{/* Auto Arrange */}
		</ToolbarShell>
	)
}

onReady(() => ReactDOM.render(
	<Toolbar />,
	document.getElementById("toolbar_refactored"))
);