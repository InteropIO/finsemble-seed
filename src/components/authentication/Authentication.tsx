/*!
 * Copyright 2020 by ChartIQ, Inc.
 * All rights reserved.
 *
 * This is a sample Finsemble Authentication Component written using React hooks. It is meant as a starting point
 * for you to build your own Authentication Component. Use the `useAuth()` react hook, or the Finsemble client API
 * to interact with Finsemble's authentication capabilities.
 *
 * See https://documentation.chartiq.com/finsemble/tutorial-Authentication.html for a tutorial on how to use authentication.
 */

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@chartiq/finsemble-ui/react/components/FinsembleProvider";
import { useAuth } from "@chartiq/finsemble-ui/react/hooks/useAuth";
import { useAuthSimulator } from "@chartiq/finsemble-ui/react/hooks/useAuth";
import "@chartiq/finsemble-ui/react/assets/css/finsemble.css";
import "@chartiq/finsemble-ui/react/assets/css/dialogs.css";
import "@chartiq/finsemble-ui/react/assets/css/authentication.css";
import "../../../assets/css/theme.css";
import "./Authentication.css"

export const Authentication = () => {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [jobTitle, setJobTitle] = useState("");
	const [company, setCompany] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [payload, setPayload] = useState<{
		firstName: string;
		lastName: string;
		jobTitle: string;
		company: string;
		email: string;
		phone: string;
	} | null>(null);
	const [error, setError] = useState<string | null>(null);
	const { quitApplication, publishAuthorization } = useAuth();
	const { sendToServer } = useAuthSimulator();

	/**
	 * With React Hooks we must use `useEffect()` for effects such as server calls. Here, we use
	 * the "payload" state as a way to trigger an effect to authenticate the user against a back
	 * end server. Whenever the value of payload changes, this effect will run. The value of payload
	 * changes when the form is submitted (see <form> element in the jsx).
	 *
	 * In this example we're using Finsemble's useAuthSimulator() hook to simulate a back end server.
	 * This hook will allow any username/password combination by returning {result:"ok"}. But it will
	 * return {error: "error text"} if either username or password are left blank.
	 */
	useEffect(() => {
		// Check whether user has already registered
		const username = localStorage.getItem("username");
		if (username) {
			// User has already registered
			publishAuthorization(username, { username });
		} else {
			// Hiding splash screen because it can sometimes obscure the registration form.
			FSBL.System.hideSplashScreen();

			// Show registration form for user to register.
			FSBL.Clients.WindowClient.getCurrentWindow().show();
		}

		if (!payload) return;

		const authenticate = async () => {
			// TODO: Implement sendToServer
			alert(JSON.stringify(payload, null, "\t"));
			const response = await sendToServer(payload.firstName, payload.lastName);
			if (response.result === "ok") {
				// save username to prevent having to register again.
				localStorage.setItem("username", payload.firstName);

				/**
				 * This is the most important step. Once your back end server has authenticated the user
				 * call publishAuthorization() from the useAuth() hook. The first parameter (username) is
				 * required. The second parameter (credentials) is option. Credentials can contain anything
				 * that is useful for session management, such as user ID, tokens, etc.
				 */
				publishAuthorization(payload.firstName, { username: payload.firstName });
			} else if (response.error) {
				setError(response.error);
			}
		};

		authenticate();
	}, [payload]);

	const submit = () => {
		setPayload({
			firstName: firstName,
			lastName: lastName,
			jobTitle: jobTitle,
			company: company,
			email: email,
			phone: phone
		});
	};

	/**
	 * What follows is a cookie-cutter form written in React Hooks style. There is nothing here that
	 * is proprietary to Finsemble. Your form should be built as needed to support your login process.
	 * CSS Styles are imported from "Authentication.css" (see imports above).
	 */
	return (
		<>
			<div className="fsbl-auth-top">
				<img className="fsbl-company-logo" />
				<div className="fsbl-close">
					<i className="ff-close" onClick={quitApplication}></i>
				</div>
			</div>

			<div className="fsbl-auth-wrapper">
				<div className="fsbl-auth-logo"></div>
				<div className="fsbl-auth-welcome">Thank you for downloading Finsemble. Please register to begin your evaluation.</div>
				{error && <div className="fsbl-input-error-message">{error}</div>}
				<form
					onSubmit={(event) => {
						submit();
						event.preventDefault();
					}}
				>
					<div className="registration">
						<label>First Name*</label>
						<input
							className="fsbl-auth-input"
							type="text"
							name="first-name"
							required
							value={firstName}
							onChange={(event) => {
								setFirstName(event.target.value);
							}}
						/>
						<label>Last Name*</label>
						<input
							className="fsbl-auth-input"
							type="text"
							name="last-name"
							required
							value={lastName}
							onChange={(event) => {
								setLastName(event.target.value);
							}}
						/>

						<label>Job Title*</label>
						<input
							className="fsbl-auth-input"
							type="text"
							name="job-title"
							required
							value={jobTitle}
							onChange={(event) => {
								setJobTitle(event.target.value);
							}}
						/>

						<label>Company*</label>
						<input
							className="fsbl-auth-input"
							type="text"
							name="company"
							required
							value={company}
							onChange={(event) => {
								setCompany(event.target.value);
							}}
						/>

						<label>Email*</label>
						<input
							className="fsbl-auth-input"
							type="email"
							name="email"
							value={email}
							required
							onChange={(event) => {
								setEmail(event.target.value);
							}}
						/>

						<label>Phone</label>
						<input
							className="fsbl-auth-input"
							type="tel"
							name="phone"
							value={phone}
							onChange={(event) => {
								setPhone(event.target.value);
							}}
						/>
					</div>
					<button type="submit" className="fsbl-button fsbl-button-affirmative">
						Submit
					</button>
				</form>
				<div className="fsbl-copyright">
					© 2020 Cosaic, Inc. All Rights Reserved |
					<a onClick={() => FSBL.System.openUrlWithBrowser("https://cosaic.io/privacy-policy/")}>Privacy Policy</a> |
					<a onClick={() => FSBL.System.openUrlWithBrowser("https://cosaic.io/developer-license-agreement/")}>Developer License Agreement</a>
				</div>
			</div>
		</>
	);
};

ReactDOM.render(
	<FinsembleProvider>
		<Authentication />
	</FinsembleProvider>,
	document.getElementById("Authentication-tsx")
);
