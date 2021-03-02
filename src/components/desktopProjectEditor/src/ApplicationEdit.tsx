/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useState, useEffect } from "react";
import { View } from "./View";
import { Header } from "./Header";
import { Content } from "./Content";
import { FilePath } from "./FilePath";

import ConfigContext from "./ConfigContext";
import * as Types from "./common/types";
import { DesktopProjectClient } from "../desktopProjectClient";

const DEFAULT_WINDOW_WIDTH = 1280;
const DEFAULT_WINDOW_HEIGHT = 600;
const MINIMUM_WINDOW_WIDTH = 0;
const MINIMUM_WINDOW_HEIGHT = 0;

const toSentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Returns the last word with more than 3 characters in the url or path
 *
 * @param {*} data
 * @return {*}  {string}
 */
const getDefaultName = (data: any): string | undefined => {
	const words = (data.url || data.path || "").match(/\w{4,}/gi) ?? [""];
	return toSentenceCase(words.pop());
};

export const ApplicationEdit = (props: {
	id: string;
	isEditMode: boolean;
	isSetupWizard: boolean;
	currentSetupType: string;
	setCurrentComponentID?: Function;
	setCurrentSetupType: Function;
	onClickBackButton?: Function;
	removeAppID: Function;
	removeComponentID?: Function;
	setCurrentAppID: Function;
	onSaveData: Function;
	apps: object[];
	data: {
		name?: string;
		url?: string;
		path?: string;
		width?: number;
		height?: number;
		description?: string;
		tags?: [];
	};
}) => {
	const [displayName, setDisplayName] = useState(props.data.name || getDefaultName(props.data));
	const [windowURL, setWindowURL] = useState(props.data.url || "");
	const [nativePath, setNativePath] = useState(props.data.path || "");
	const [windowWidth, setWindowWidth] = useState(props.data.width || DEFAULT_WINDOW_WIDTH);
	const [windowHeight, setWindowHeight] = useState(props.data.height || DEFAULT_WINDOW_HEIGHT);
	const [componentDescription, setComponentDescription] = useState(props.data.description);
	const [componentTags, setComponentTags] = useState(props.data.tags);
	const [currentAppType, setCurrentAppType] = useState(props.data.path ? "native" : "web");
	const [isWindowURLValid, setIsWindowURLValid] = useState(true);
	const [isWidthValid, setIsWidthValid] = useState(true);
	const [isHeightValid, setIsHeightValid] = useState(true);
	const [isNameValid, setIsNameValid] = useState(true);

	const otherAppNames = props.apps.filter((obj: any) => obj.appId !== props.id).map((obj: any) => obj.name);
	const disableSubmit =
		(currentAppType === "web" && (!isWindowURLValid || windowURL.length === 0)) ||
		(currentAppType === "native" && (!nativePath || nativePath.length === 0)) ||
		displayName === undefined ||
		displayName === "" ||
		!isWidthValid ||
		!isHeightValid ||
		!isNameValid;
	const clickSubmit = () => {
		props?.onSaveData?.({
			name: displayName,
			url: windowURL,
			path: nativePath,
			appType: currentAppType,
			width: windowWidth,
			height: windowHeight,
			description: componentDescription,
			tags: componentTags,
		});
		props?.setCurrentSetupType?.("completed");
		if (props?.isEditMode) {
			props?.setCurrentAppID?.("");
		}
	};

	// TODO: This isn't ideal, but when we try to use the form/type=submit interaction, it acts like we pressed the back button, rather than the submit button
	const submitOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== "Enter") {
			return;
		}

		e.preventDefault();
		if (!disableSubmit) {
			clickSubmit();
		}
	};

	useEffect(() => {
		if (currentAppType === "web") {
			setIsWindowURLValid(DesktopProjectClient.checkValidURL(windowURL));
		}
	}, [windowURL]);

	useEffect(() => {
		setIsHeightValid(!(typeof windowHeight !== "number" || windowHeight < MINIMUM_WINDOW_HEIGHT));
	}, [windowHeight]);

	useEffect(() => {
		setIsWidthValid(!(typeof windowWidth !== "number" || windowWidth < MINIMUM_WINDOW_WIDTH));
	}, [windowWidth]);

	useEffect(() => {
		setIsNameValid(!otherAppNames.includes(displayName || ""));
	});

	return (
		<div className="app-edit">
			<View>
				<div>
					<form onSubmit={(e) => e.preventDefault()}>
						<fieldset className="app-edit-fieldset">
							<legend>
								<Header
									onClickBackButton={
										props.currentSetupType !== "completed" &&
										((e: any) => {
											if (typeof props.onClickBackButton === "function") {
												// we're a child of of ApplicationSetup
												return props.onClickBackButton(e);
											}

											if (!props.isEditMode) {
												props.removeAppID(props.id);

												if (props.removeComponentID) {
													props.removeComponentID(props.id);
												}

												if (props.setCurrentSetupType) {
													props.setCurrentSetupType("");
												}

												if (props.setCurrentComponentID) {
													props.setCurrentComponentID("new");
												}
											} else {
												if (props.setCurrentSetupType) {
													props.setCurrentSetupType("");
												}
												if (props.setCurrentAppID) {
													props.setCurrentAppID("");
												}
											}
										})
									}
								>
									{props.isEditMode ? <>Edit Application</> : <>Add New Application</>}
								</Header>
							</legend>

							<Content>
								{props.currentSetupType !== "completed" ? (
									<>
										<div className="app-edit-field">
											<label htmlFor="app-name">Name</label>
											<input
												type="text"
												id="app-name"
												value={displayName}
												aria-invalid={!isNameValid}
												placeholder="Untitled Application"
												onKeyDown={submitOnEnter}
												onChange={(e) => {
													setDisplayName(e.currentTarget.value);
												}}
											/>
										</div>

										{props.isSetupWizard !== true && (
											<div className="app-edit-type-fields">
												<label>Application Type</label>

												<div className="app-edit-type-field">
													<input
														type="radio"
														name="app-type"
														id="app-type-web"
														value="web"
														checked={currentAppType == "web"}
														onKeyDown={submitOnEnter}
														onChange={(e) => {
															setCurrentAppType(e.currentTarget.value);
														}}
													/>
													<label htmlFor="app-type-web">Web</label>

													<input
														type="radio"
														name="app-type"
														id="app-type-native"
														value="native"
														checked={currentAppType == "native"}
														onKeyDown={submitOnEnter}
														onChange={(e) => {
															setCurrentAppType(e.currentTarget.value);
														}}
													/>

													<label htmlFor="app-type-native">Native</label>
												</div>
											</div>
										)}

										<div className="app-edit-field">
											{currentAppType === "web" ? (
												<>
													<label htmlFor="app-url">Web URL</label>
													<input
														type="text"
														id="app-url"
														placeholder="https://..."
														value={windowURL}
														aria-invalid={!isWindowURLValid}
														onKeyDown={submitOnEnter}
														onChange={(e) => {
															setWindowURL(e.currentTarget.value);
														}}
													/>
												</>
											) : (
												<>
													<label htmlFor="app-path">File Path</label>
													<FilePath
														id="app-path"
														value={nativePath}
														onSetValue={(value: string) => {
															setNativePath(value);
														}}
													></FilePath>
												</>
											)}
										</div>

										{/* <div className="app-edit-field">
											<label htmlFor="app-tags">Tags</label>
											<input
												type="text"
												id="app-tags"
												value={componentTags}
												onChange={(e) => {
													setComponentTags(e.currentTarget.value);
												}}
											/>
										</div> */}

										<div className="app-edit-field description">
											<label htmlFor="app-description">Description</label>
											<textarea
												id="app-description"
												onChange={(e) => {
													setComponentDescription(e.currentTarget.value);
												}}
												value={componentDescription}
											></textarea>
										</div>

										<div className="app-edit-field">
											<label htmlFor="app-size">Default Window Size</label>
											<fieldset className="app-size-fieldset">
												<div className="app-size-field">
													<label htmlFor="app-width">Width</label>
													<input
														className="app-size-input"
														type="text"
														id="app-width"
														value={windowWidth}
														aria-invalid={!isWidthValid}
														onKeyDown={submitOnEnter}
														onChange={(e) => {
															setWindowWidth(parseInt(e.currentTarget.value, 10) || DEFAULT_WINDOW_WIDTH);
														}}
													/>
													<span className="unit">px</span>
												</div>
												<div className="app-size-field">
													<label htmlFor="app-height">Height</label>
													<input
														className="app-size-input"
														type="text"
														id="app-height"
														value={windowHeight}
														aria-invalid={!isHeightValid}
														onKeyDown={submitOnEnter}
														onChange={(e) => {
															setWindowHeight(parseInt(e.currentTarget.value, 10) || DEFAULT_WINDOW_HEIGHT);
														}}
													/>
													<span className="unit">px</span>
												</div>
											</fieldset>
										</div>

										<div className="app-edit-actions">
											<div>
												{props.isEditMode && (
													<button
														className="app-edit-remove"
														onClick={(e) => {
															props.removeAppID(props.id);
															props.setCurrentSetupType("");
															props.setCurrentAppID("");
															e.preventDefault();
														}}
													>
														Remove Application
													</button>
												)}
											</div>

											<div>
												<button
													className="ghost-button"
													onClick={() => {
														if (!props.isEditMode) {
															props.removeAppID(props.id);
														}

														props.setCurrentSetupType("");
														props.setCurrentAppID("");
													}}
												>
													Cancel
												</button>
												<button className="app-edit-save" disabled={disableSubmit} onClick={clickSubmit}>
													Save
												</button>
											</div>
										</div>
									</>
								) : (
									<div className="app-edit-success">
										<h2>Your application is added</h2>

										<div className="app-edit-success-content">
											<div className="app-trial-wrapper">
												<p>Want to test it out?</p>
												<button
													className="rounded"
													onClick={(e) => {
														if (props.data.name) {
															FSBL.Clients.LauncherClient.spawn(props.data.name, {}, (err: any, response: any) => {
																if (err) {
																	FSBL.Clients.Logger.error("ApplicationEdit spawn error:", err);
																} else {
																	FSBL.Clients.Logger.log("ApplicationEdit spawn response:", response);
																}
															});
															e.preventDefault();
														}
													}}
												>
													See it Now
												</button>
											</div>
											<p>Your application is now available to be launched in the toolbar under “Apps”.</p>
											<div className="app-edit-success-actions">
												<button
													onClick={(e) => {
														props.setCurrentSetupType("");
														props.setCurrentAppID("new");
													}}
												>
													Add Another Application
												</button>
												<button
													onClick={(e) => {
														props.setCurrentSetupType("completed");
														props.setCurrentAppID("");
													}}
												>
													Return to List
												</button>
											</div>
										</div>
									</div>
								)}
							</Content>
						</fieldset>
					</form>
				</div>
			</View>
		</div>
	);
};
