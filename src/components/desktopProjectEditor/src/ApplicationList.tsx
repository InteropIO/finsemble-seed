/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useState, useEffect } from "react";

export const ApplicationList = ({
	apps,
	currentAppID,
	setCurrentAppID,
	setCurrentSetupType,
	removeAppID,
	setIsEditMode,
}: {
	apps: any;
	currentAppID?: string;
	setCurrentAppID: (s: string) => void;
	setCurrentSetupType: (s: string) => void;
	removeAppID: (s: string) => void;
	setIsEditMode: (b: boolean) => void;
}) => (
	<>
		<table className={["app-list-table", currentAppID ? "hidden" : ""].join(" ")}>
			<tbody>
				{apps.map((data: any) => {
					const appID = data.appId;

					return (
						<tr key={appID}>
							<td>
								<a
									href="#"
									className="app-name"
									onClick={() => {
										setIsEditMode(true);
										setCurrentSetupType("advanced");
										setCurrentAppID(appID);
									}}
								>
									{data.component?.displayName || appID}
								</a>
							</td>
							<td className="app-actions">
								<button
									className="app-delete-icon"
									title="Remove App"
									onClick={(e) => {
										removeAppID(data.component?.displayName || appID);
									}}
								></button>
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>

		{apps.length < 1 && (
			<div className="app-list-empty">There’s nothing here! Get started by clicking the “Add New” button above.</div>
		)}
	</>
);
