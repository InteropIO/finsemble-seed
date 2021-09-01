/* eslint-disable quote-props */
/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import {
	UserPreferences,
	General,
	Workspaces,
	DashbarEditor,
	Notifications,
	storeExports,
	userPreferencesStoreInitialize,
	UserPreferencesActions,
} from "@finsemble/finsemble-ui/react/components/userPreferences";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "../../../public/assets/css/theme.css";

/*
 * Put your customized preference menu components here and pass this object as a prop to the UserPreferences component.
 * Each key should be a user preference component's entry name and each value should be a React component associated with that entry name.
 * For example, if you have a customized menu component called "Sample" with entry name "My Section":
 *
 * // Import the component to this file.
 * import { Sample } from "./sample";
 *
 * const sections = {
 *   "General": General,
 *   "Workspaces": Workspaces
 *   "My section": Sample
 * };
 */
const sections = {
	General: General,
	Workspaces: Workspaces,
	Dashbar: DashbarEditor,
	Notifications: Notifications,
};

var WorkspaceManagementMenuGlobalStore: any;

const StoreWrapper: React.FunctionComponent<{}> = () => {
	const [ready, setReady] = React.useState(false);

	useEffect(() => {
		const makeReady = () => {
			storeExports.initialize(() => {
				WorkspaceManagementMenuGlobalStore = storeExports.GlobalStore;
				userPreferencesStoreInitialize(WorkspaceManagementMenuGlobalStore, () => {
					UserPreferencesActions.getWorkspaces();
				});
				setReady(true);
			});
		};
		if (window.FSBL && FSBL?.addEventListener) {
			FSBL.addEventListener("onReady", makeReady);
		} else {
			window.addEventListener("FSBLReady", makeReady);
		}
	}, []);

	return <>{ready && <UserPreferences sections={sections} />}</>;
};
ReactDOM.render(
	<FinsembleProvider>
		<StoreWrapper />
	</FinsembleProvider>,
	document.getElementById("UserPreferences-tsx")
);
