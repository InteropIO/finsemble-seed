/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useState, useEffect } from "react";
import { View } from "./View";
import { Header } from "./Header";
import { Content } from "./Content";
import { Appearance } from "./Appearance";

import ThemeContext from "./ThemeContext";

export const Themes = () => {
	const [currentThemeID, setCurrentThemeID] = useState("Default");

	return (
		<ThemeContext.Consumer>
			{(themeConfig: any) => (
				<View>
					<Header>Themes</Header>

					<Content>
						{currentThemeID ? (
							currentThemeID === "new" ? (
								<div>new theme</div>
							) : (
								<Appearance theme={themeConfig.themes[currentThemeID]}></Appearance>
							)
						) : (
							<div>
								<div className="tile-type-buttons">
									{Object.keys(themeConfig.themes).map((themeID) => {
										let theme = themeConfig.themes[themeID];
										return (
											<a
												href="#"
												className="tile-type-button"
												key={themeID}
												onClick={(e) => {
													setCurrentThemeID(themeID);
												}}
											>
												{themeID}
											</a>
										);
									})}
									<a
										href="#"
										className="tile-type-button"
										onClick={(e) => {
											setCurrentThemeID("new");
										}}
									>
										New Theme
									</a>
								</div>
							</div>
						)}
					</Content>
				</View>
			)}
		</ThemeContext.Consumer>
	);
};
