/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useState, useEffect } from "react";
import { View } from "./View";
import { Header } from "./Header";
import { Content } from "./Content";
import { ApplicationEdit } from "./ApplicationEdit";
import { FilePath } from "./FilePath";
import { DesktopProjectClient } from "../desktopProjectClient";

export const ApplicationSetup = (props: any) => {
	const [currentAppType, setCurrentAppType] = useState("");
	const [currentAppPath, setCurrentAppPath] = useState("");
	const [currentAppFDC3Compatibility, setCurrentAppFDC3Compatibility] = useState("no");
	const [savedAppCompatibility, setSavedAppCompatibility] = useState(true);
	const [savedAppPath, setSavedAppPath] = useState(false);
	const [displayName, setDisplayName] = useState(props.data.name);
	const [isAppPathValid, setIsAppPathValid] = useState(true);

	useEffect(() => {
		setIsAppPathValid(DesktopProjectClient.checkValidURL(currentAppPath));
	}, [currentAppPath]);

	return (
		<div className="app-edit">
			<View>
				<Header
					onClickBackButton={(e: any) => {
						if (savedAppPath) {
							setSavedAppPath(false);
						} else {
							props.removeAppID?.(props.id);
							props.setCurrentSetupType?.("");
							props.setCurrentComponentID?.("new");
						}
					}}
				>
					Add New Application
				</Header>

				<Content>
					{!savedAppPath ? (
						<>
							<h2 className="setup-type-heading">Is this a web or native application?</h2>

							<div className="tile-type-buttons">
								<button
									className={["tile-type-button app-web", currentAppType === "web" ? "active" : ""].join(" ")}
									onClick={(e) => {
										setCurrentAppType?.("web");
										setCurrentAppPath?.("");
										setSavedAppPath?.(false);
									}}
								>
									<div>Web Application</div>
								</button>
								<button
									className={["tile-type-button app-native", currentAppType === "native" ? "active" : ""].join(" ")}
									onClick={(e) => {
										setCurrentAppType?.("native");
										setCurrentAppPath?.("");
										setSavedAppPath?.(false);
									}}
								>
									<div>Native Application</div>
								</button>
							</div>

							{currentAppType && !savedAppPath && (
								<>
									<div className="app-setup-url-field">
										<label htmlFor="app-url">
											{currentAppType === "web" ? (
												<>Enter the full URL of the application</>
											) : (
												<>Choose your application</>
											)}
										</label>
										{currentAppType === "web" ? (
											<div className="app-url-container">
												<input
													type="text"
													placeholder="https://..."
													id="app-url"
													value={currentAppPath}
													aria-invalid={!isAppPathValid}
													aria-errormessage="app-url-error-message"
													onChange={(e) => {
														setCurrentAppPath(e.currentTarget.value);
													}}
													onKeyUp={(e) => {
														setCurrentAppPath(e.currentTarget.value);
													}}
												/>
												{!isAppPathValid ? (
													<div id="app-url-error-message" className="invalid-message">
														URL must be valid (e.g., https://cosaic.io/). Only http and https prototcols are supported.
													</div>
												) : (
													""
												)}
											</div>
										) : (
											<FilePath
												id="app-url"
												value={currentAppPath}
												onSetValue={(value: string) => {
													setCurrentAppPath(value);
												}}
											></FilePath>
										)}
									</div>

									<div className="app-edit-actions">
										<div></div>

										<div>
											<button
												className="app-edit-next"
												disabled={
													(currentAppType === "web" && (!isAppPathValid || currentAppPath.length === 0)) ||
													(currentAppType === "native" && currentAppPath === "")
												}
												onClick={() => {
													setSavedAppPath(true);
												}}
											>
												Next
											</button>
										</div>
									</div>
								</>
							)}
						</>
					) : !savedAppCompatibility ? (
						<>
							<h2 className="setup-type-heading">Is this application FDC3 Compatible?</h2>

							<div className="tile-type-buttons">
								<button
									className={["tile-type-button", currentAppFDC3Compatibility === "yes" ? "active" : ""].join(" ")}
									onClick={(e) => {
										setCurrentAppFDC3Compatibility("yes");
										setSavedAppCompatibility(true);
									}}
								>
									Yes, it&apos;s compatible
								</button>
								<button
									className={["tile-type-button", currentAppFDC3Compatibility === "no" ? "active" : ""].join(" ")}
									onClick={(e) => {
										setCurrentAppFDC3Compatibility("no");
										setSavedAppCompatibility(true);
									}}
								>
									No, it&apos;s not compatible
								</button>
							</div>
						</>
					) : (
						<>
							<ApplicationEdit
								{...{
									...props,
									isNew: true,
									isSetupWizard: true,
									isEditMode: false,
									onSaveData: props.onSaveData,
									apps: props.apps,
									data: {
										...props.data,
										url: currentAppType === "web" ? currentAppPath : "",
										path: currentAppType === "native" ? currentAppPath : "",
									},
									onClickBackButton: (e: any) => {
										// setSavedAppCompatibility(false);
										setSavedAppPath(false);
									},
								}}
							></ApplicationEdit>
						</>
					)}
				</Content>
			</View>
		</div>
	);
};
