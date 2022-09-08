/*!
 * Copyright 2022 by ChartIQ, Inc.
 * All rights reserved.
 *
 * This is a sample Finsemble Authentication Component for use with the OAuth Authorization code with PKCE flow. 
 * It is meant as a starting point for you to build your own Authentication Component. See the oAuthPKCE.ts file
 * for functionality specific to OAuth and PKCE. 
 *
 * See https://documentation.finsemble.com/tutorial-Authentication.html for a tutorial on how to use authentication.
 */

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import { useAuth } from "@finsemble/finsemble-ui/react/hooks";
import { authorize, getToken, getUserInfo, AuthTokenDetails, setupAutomatedRefresh } from './oAuthPKCE'
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "@finsemble/finsemble-ui/react/assets/css/dialogs.css";
import "@finsemble/finsemble-ui/react/assets/css/authentication.css";
import "../../../public/assets/css/theme.css";
import "./Authentication.css";
import { PublishCallback, SubscribeCallback, UnsubscribeCallback } from "@finsemble/finsemble-core/types/clients/routerClient";

const log = (...args: any) => {
	FSBL.Clients.Logger.log(...args);
	console.log(...args);
};

const error = (...args: any) => {
	FSBL.Clients.Logger.error(...args);
	console.error(...args);
};

export const Authentication = () => {
	// Make sure this dialog shows on top of the splash screen
	useEffect(() => {
		FSBL.Clients.WindowClient.bringToFront();
	}, []);

	const [status, setStatus] = useState("Authenticating");

	const { quitApplication, publishAuthorization } = useAuth();

	useEffect(() => {
		const authenticate = async () => {
			// If your OAuth provider has an SDK you can replace the code sections with code from the SDK.
			// You will still need to pass a username and credentials to publishAuthorization() as this allows Finsemble to access them
			try {
				const currentLocation = new URL(window.location.href);
				const authorizationCode = currentLocation.searchParams.get("code");

				// check for the authentication code in the search params,
				// if it doesn't exist then we need to do the authorization step else skip it and continue to get the token
				if (!authorizationCode) {
					//Note that this function accepts arguments for the scope, redirectURI, endpoint and clientID
					// which can override those set in the configuration (or the default in the case of the scope) 
					// Often a particular scope, e.g. offline_access, is required in order to receive a refresh_token
					authorize({scope: "openid profile offline_access"});
				} else {
					let token: AuthTokenDetails = await getToken();
					const accessToken = token.access_token;
					const userInfo = await getUserInfo({ accessToken });
					const username = userInfo.sub;

					let credentialsToPublish = { userInfo };
					let credentialsToProtect = { token };

					/*
					 * Publish any credentials you need to protect via a mechanism that can keep them private.
					 * For example via local storage (accessible from a particular origin), or a Finsemble Router 
					 * Pub/Sub topic with publish and subscribe callbacks.
					 * 
					 * e.g. 
					 * FSBL.Clients.RouterClient.publish("OAuth_Access_Token", credentialsToProtect);
					 * 
					 * For an example of setting up a controlled PubSub topic see RouterPubSubTools.ts
					 * Note: you'll need to do this before the first access to the topic - hence, do the
					 * setup in a storage adapter if you'll use it there (and remember to replace references to
					 * Finsemble Clients which have to imported in storage adapters).
					 */



					/*
					 * Calling  publishAuthorization() from the useAuth() hook is the final step of the startup 
					 * authentication cycle (Finsemble will continue its boot phase after this call is made). 
					 * 
					 * The first parameter (username) is required as it used by Finsemble's storage adapters. 
					 * 
					 * The second parameter (credentialsToPublish) is optional. Credentials can contain anything 
					 * that is useful for session management, such as user ID, tokens, etc..
					 * These can be retrieved by *any* application running in Finsemble using our API.
					 */
					publishAuthorization(username, credentialsToPublish);


					/*
					 * Now that we have an access token, we may wish to automatically refresh it before it expires.
					 * We can do so by examining the expiry period on the token and using a refresh_token to
					 * renew it, before republishing our credentials.
					 */
					const tokenRefreshedHandler = (err: string | null, refreshedToken: AuthTokenDetails | null) => {
						if (err) {
							error(err);
						} else if (!refreshedToken) {
							error("No token was returned!");
						} else {
							token = refreshedToken;

							//republish public credentials
							credentialsToPublish = { userInfo }; //note this has not been re-retrieved, but could be
							publishAuthorization(username, credentialsToPublish);

							//republish protected credentials
							credentialsToProtect = { token };
							/* e.g. 
							 * FSBL.Clients.RouterClient.publish("OAuth_Access_Token", credentialsToProtect);
							 */

							//set up the next refresh
							setupAutomatedRefresh({token},tokenRefreshedHandler);
						}
					}
					setupAutomatedRefresh({token},tokenRefreshedHandler);
				}
			} catch (err) {
				error(err)
				setStatus("Auth failed!")
			}

		};

		authenticate();
	}, []);

	/**
	 * What follows is a cookie-cutter form, written in React Hooks style, that is displayed before and
	 * after any redirects to your login form (if no redirect is required, only this form will be displayed 
	 * to the user). Hence, it may display a spinner or similar while requests are made and could be used
	 * to display details of any errors that occur during auth.
	 * 
	 * There is nothing here that is proprietary to Finsemble. Your form should be built as needed to support 
	 * your login process. 
	 * 
	 * CSS Styles are imported from "Authentication.css" & Finsemble's "authentication.css" (see imports).
	 */
	return (
		<>
			<div className="fsbl-auth-top">
				<div className="fsbl-close">
					<i className="ff-close" onClick={quitApplication}></i>
				</div>
			</div>
			<h1>{status}</h1>
		</>
	);
};

ReactDOM.render(
	<FinsembleProvider>
		<Authentication />
	</FinsembleProvider>,
	document.getElementById("Authentication-tsx")
);
