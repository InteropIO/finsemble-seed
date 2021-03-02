/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React from "react";
import { View } from "./View";
import { Header } from "./Header";
import { Content } from "./Content";
import { Tooltip } from "./Tooltip";
import { ColorPicker, FontSize } from "./AppearanceLib";
import { ProjectAssets } from "./ProjectAssets";

/**
 * Appearance View.  Handles UI for theme updates.
 *
 * @param {{ theme: any }} { theme }
 */
export const Appearance = ({ theme }: { theme: any }) => (
	<div className="theme-edit">
		<View>
			<Header>Theme</Header>
			<Content>
				<div className="theme-settings">
					<div className="theme-colors">
						<fieldset className="appearance-options">
							<div className="appearance-options-header">
								<legend>Brand Color</legend>

								<Tooltip>The primary color of buttons, icons, and favorites.</Tooltip>
							</div>

							<div className="appearance-options-field">
								<label htmlFor="accent-primary">Primary</label>

								<ColorPicker id="accent-primary" theme={theme}></ColorPicker>
							</div>

							<div className="appearance-options-field">
								<label htmlFor="accent-primary-1">On Mouse Over</label>

								<ColorPicker id="accent-primary-1" theme={theme}></ColorPicker>
							</div>
						</fieldset>

						<fieldset className="appearance-options">
							<div className="appearance-options-header">
								<legend>Background Color</legend>

								<Tooltip>Background color of desktop components like the Toolbar &amp; window titlebar.</Tooltip>
							</div>

							<div className="appearance-options-field">
								<label htmlFor="core-primary">Primary Background</label>

								<ColorPicker id="core-primary" theme={theme}></ColorPicker>
							</div>

							<div className="appearance-options-field">
								<label htmlFor="core-primary-1">Secondary Background</label>

								<ColorPicker id="core-primary-1" theme={theme}></ColorPicker>
							</div>
						</fieldset>

						<fieldset className="appearance-options">
							<div className="appearance-options-header">
								<legend>Default Navigation</legend>

								<Tooltip>Background color for most buttons used for navigation.</Tooltip>
							</div>

							<div className="appearance-options-field">
								<label htmlFor="core-primary-2">Button Color</label>

								<ColorPicker id="core-primary-2" theme={theme}></ColorPicker>
							</div>
						</fieldset>

						<fieldset className="appearance-options">
							<div className="appearance-options-header">
								<legend>Highlights &amp; Mouse Over Colors</legend>

								<Tooltip>
									Colors used to highlight particular elements or when a user mouses-over selected elements.
								</Tooltip>
							</div>

							<div className="appearance-options-field">
								<label htmlFor="core-primary-3">Primary</label>

								<ColorPicker id="core-primary-3" theme={theme}></ColorPicker>
							</div>

							<div className="appearance-options-field">
								<label htmlFor="core-primary-4">Secondary</label>

								<ColorPicker id="core-primary-4" theme={theme}></ColorPicker>
							</div>
						</fieldset>

						<fieldset className="appearance-options">
							<div className="appearance-options-header">
								<legend>Success</legend>

								<Tooltip>Color of “success” messages and affirmations, e.g., checkmark icons.</Tooltip>
							</div>

							<div className="appearance-options-field">
								<label htmlFor="accent-positive">Primary</label>

								<ColorPicker id="accent-positive" theme={theme}></ColorPicker>
							</div>

							<div className="appearance-options-field">
								<label htmlFor="accent-positive-1">On Mouse Over</label>

								<ColorPicker id="accent-positive-1" theme={theme}></ColorPicker>
							</div>
						</fieldset>

						<fieldset className="appearance-options">
							<div className="appearance-options-header">
								<legend>Reminders &amp; Warnings</legend>

								<Tooltip>Color of non-critical alerts.</Tooltip>
							</div>

							<div className="appearance-options-field">
								<label htmlFor="accent-aware">Primary</label>

								<ColorPicker id="accent-aware" theme={theme}></ColorPicker>
							</div>

							<div className="appearance-options-field">
								<label htmlFor="accent-aware-1">Secondary</label>

								<ColorPicker id="accent-aware-1" theme={theme}></ColorPicker>
							</div>
						</fieldset>

						<fieldset className="appearance-options">
							<div className="appearance-options-header">
								<legend>Errors</legend>

								<Tooltip>Color of critical errors and information.</Tooltip>
							</div>

							<div className="appearance-options-field">
								<label htmlFor="accent-negative">Primary</label>

								<ColorPicker id="accent-negative" theme={theme}></ColorPicker>
							</div>

							<div className="appearance-options-field">
								<label htmlFor="accent-negative-1">On Mouse Over</label>

								<ColorPicker id="accent-negative-1" theme={theme}></ColorPicker>
							</div>
						</fieldset>
					</div>

					<div className="theme-colors">
						<fieldset className="appearance-options">
							<div className="appearance-options-header">
								<legend>Text</legend>

								<Tooltip>Font of text in buttons, dialogs, icons, menus, title bars, and toolbars.</Tooltip>
							</div>

							<div className="appearance-options-field">
								<label htmlFor="font-color">Primary Font Color</label>

								<ColorPicker id="font-color" theme={theme}></ColorPicker>
							</div>

							<div className="appearance-options-field">
								<label htmlFor="core-primary-5">Secondary Font Color</label>

								<ColorPicker id="core-primary-5" theme={theme}></ColorPicker>
							</div>

							<div className="appearance-options-field">
								<label htmlFor="font-color-2">Contrast Color</label>

								<ColorPicker id="font-color-2" theme={theme}></ColorPicker>
							</div>

							<div className="appearance-options-field">
								<label htmlFor="font-size">Font Size</label>

								<FontSize id="font-size" theme={theme}></FontSize>
							</div>
						</fieldset>
					</div>

					<div className="theme-assets">
						<ProjectAssets></ProjectAssets>
					</div>
				</div>
			</Content>
		</View>
	</div>
);
