/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useState, useEffect } from "react";
import { View } from "./View";
import { Header } from "./Header";
import { Content } from "./Content";
import { UserSettings } from "./UserSettings";
import ProjectContext from "./ProjectContext";

import * as Types from "./common/types";
import NavigationContext from "./NavigationContext";

export const GettingStarted = () => {
	const [savedUserInfo, setSavedUserInfo] = useState(true);

	return (
		<NavigationContext.Consumer>
			{(navigationSettings: any) => (
				<ProjectContext.Consumer>
					{(projectSettings: any) => (
						<>
							{!savedUserInfo && !projectSettings.user.firstName ? (
								<UserSettings
									onSaveData={(data: Types.UserSaveData) => {
										projectSettings.user = data;
										setSavedUserInfo(true);
									}}
								></UserSettings>
							) : (
								<View>
									<Header>Getting Started</Header>

									<Content>
										<p>
											Use the tools below to quickly create a smart desktop for your end users. Add applications and
											customize the user experience.
										</p>

										<p>
											Once your desktop is complete, you can publish your desktop to easily share or export the project
											for additional development by a technical team.
										</p>

										<div className="getting-started-actions">
											<button
												className="tile-type-button add-application"
												onClick={(e) => {
													navigationSettings.setCurrentViewID("applications");
													navigationSettings.setCurrentViewProps({
														appID: "new",
														setupType: "",
													});
												}}
											>
												<div>Add Applications</div>
											</button>

											<button
												className="tile-type-button edit-theme"
												onClick={(e) => {
													navigationSettings.setCurrentViewID("themes");
												}}
											>
												<div>Edit Theme</div>
											</button>

											<button
												className="tile-type-button export"
												onClick={(e) => {
													navigationSettings.setCurrentViewID("export");
												}}
											>
												<div>Publish Desktop</div>
											</button>
										</div>
									</Content>
								</View>
							)}
						</>
					)}
				</ProjectContext.Consumer>
			)}
		</NavigationContext.Consumer>
	);
};
