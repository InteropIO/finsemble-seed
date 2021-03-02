import React, { useState, useEffect } from "react";
import { View } from "./View";
import { Header } from "./Header";
import { Content } from "./Content";

import * as Types from "./common/types";

import ProjectContext from "./ProjectContext";

export const UserSettings = (props: { onSaveData: Function }) => {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [company, setCompany] = useState("");
	const [email, setEmail] = useState("");

	return (
		<View>
			<Header>Welcome!</Header>

			<Content>
				<fieldset className="user-settings-fields">
					<legend>
						<h2>Create Your Project</h2>
					</legend>

					<p>
						In order to make your Finsemble experience better, we’d like to know a few details about you. This
						information is used to build your desktop and provide users with confidence.
					</p>

					<div className="user-setting-field">
						<label htmlFor="first-name">First Name*</label>
						<input
							type="text"
							id="first-name"
							onChange={(e) => {
								setFirstName(e.currentTarget.value);
							}}
						/>
					</div>

					<div className="user-setting-field">
						<label htmlFor="last-name">Last Name*</label>
						<input
							type="text"
							id="last-name"
							onChange={(e) => {
								setLastName(e.currentTarget.value);
							}}
						/>
					</div>

					<div className="user-setting-field">
						<label htmlFor="company">Company Name*</label>
						<input
							type="text"
							id="company"
							onChange={(e) => {
								setCompany(e.currentTarget.value);
							}}
						/>
					</div>

					<div className="user-setting-field">
						<label htmlFor="email">Email*</label>
						<input
							type="text"
							id="email"
							onChange={(e) => {
								setEmail(e.currentTarget.value);
							}}
						/>
					</div>
				</fieldset>
				<div className="user-settings-actions">
					<button
						className="ghost-button"
						onClick={(e) => {
							props.onSaveData({
								firstName,
								lastName,
								company,
								email,
							} as Types.UserSaveData);
						}}
					>
						Skip
					</button>

					<button
						className="save-button"
						disabled={!(firstName && lastName && company && email)}
						onClick={(e) => {
							props.onSaveData({
								firstName,
								lastName,
								company,
								email,
							} as Types.UserSaveData);
						}}
					>
						Save
					</button>
				</div>
			</Content>
		</View>
	);
};
