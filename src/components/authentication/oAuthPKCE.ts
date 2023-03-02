/**
 * Type representing the authorization details details returned after login.
 * If your auth system  returns different data please update this type to reflect it.
 */
export interface AuthTokenDetails {
	access_token: string;
	refresh_token: string;
	id_token: string;
	scope: string;
	expires_in: number;
	token_type: string;
}

/**
 * Type representing an error on attempting to retrieve the access token.
 * If your auth system returns different data please update this type to reflect it.
 */
interface AuthTokenError {
	error: string;
	error_description: string;
}

type TokenResponse = AuthTokenDetails | AuthTokenError;
const isTokenError = (tok: TokenResponse): tok is AuthTokenError => {
	return (tok as AuthTokenError).error !== undefined;
};

/**
 * Starts the authorization process.
 * We generate the URL and navigate the page to the authenication endpoint.
 * Once the authentication has been completed redirect to this page.
 *
 * @example
 * ```javascript
 * authorize({
		scope = "openid email",
		state = "SU8nskju26XowSCg3bx2LeZq7MwKcwnQ7h6vQY8twd9QJECHRKs14OwXPdpNBI58",
		redirect_uri = "https://dev-xo6vgelc.eu.auth0.com/authorize",
		endpoint = "https://dev-xo6vgelc.eu.auth0.com",
		clientID= "Az8HDa8YLNw0sKApZsPwsonOTMRRyXnl"
  })
 * ```
 */
export async function authorize(params?: {
	scope?: string;
	redirectURI?: string;
	endpoint?: string;
	clientID?: string;
}) {
	try {
		const { err, data: authConfigData } =
			await FSBL.Clients.ConfigClient.getValue({
				field: "finsemble.authentication.startup",
			});

		if (err) {
			throw new Error(
				"cannot access the config client in authentication component"
			);
		}

		const endpoint = params?.endpoint ?? authConfigData?.authorization_url;

		if (!endpoint) {
			throw new Error(
				`Data provided to authorization redirect (phase 1) is missing an endpoint URL e.g. http://AUTH_PROVIDER.com/authorize`
			);
		}

		//generate the code verifier and code challenge from it
		const codeVerifier = randomBase64Generator();
		const codeChallenge = await digestHex(codeVerifier);
		const state = randomBase64Generator();

		// save the code verifier in the window session state to save for later
		//  NOTE: the redirect URI must be on the same domain as the Authentication
		//  component first running this code or it won't be accessible
		saveStateAndVerifier(state, codeVerifier);

		const url = new URL(endpoint);
		const { searchParams } = url;

		const urlParams = {
			scope: params?.scope ?? authConfigData?.scope ?? "openid",
			response_type: "code",
			state,
			client_id: params?.clientID ?? authConfigData?.client_id,
			redirect_uri: params?.redirectURI ?? authConfigData?.redirect_uri,
			code_challenge: codeChallenge,
			code_challenge_method: "S256",
		};

		// if we are missing values for the data then we want to log an error
		if (hasMissingValues(urlParams)) {
			throw new Error(
				`Data provided to login request (phase 1) has missing values: ${hasMissingValues(
					urlParams
				)} `
			);
		}

		// set the search params for the url using the urlParams object
		Object.entries(urlParams).forEach(([key, value]: [string, any]) =>
			searchParams.set(key, value)
		);

		url.search = searchParams.toString();

		log("PKCE auth phase 1 - Redirecting to login: " + url.toString());

		// navigate to the auth endpoint with the above params
		window.location.href = url.toString();
	} catch (err) {
		errorLog(err);
		return err;
	}
}

/**
 * Retrieve the access token after authentication.
 *
 * _Note:_ Return data will be specific to your endpoint and may be different from the example below.
 * Update the type defined at the start of this file to reflect what data your endpoint returns.
 *
 * @example
 * ```javascript
	 const token =  await getToken({
		 clientID= "Az8HDa8YLNw0sKApZsPwsonOTMRRyXnl",
		 redirect_uri = "https://dev-xo6vgelc.eu.auth0.com/oauth/token",
		 endpoint = "https://dev-xo6vgelc.eu.auth0.com" ,
	 });

	 const accessToken = token.access_token;
 * ```
 */
export function getToken(params?: {
	clientID?: string;
	redirectURI?: string;
	endpoint?: string;
}): Promise<AuthTokenDetails> {
	return new Promise<AuthTokenDetails>(async (resolve, reject) => {
		try {
			const currentLocation = new URL(window.location.href);
			const authorizationCode = currentLocation.searchParams.get("code") ?? "";
			const stateFromLocation = currentLocation.searchParams.get("state") ?? "";
			const initialCodeVerifier =
				window.sessionStorage.getItem("code_verifier") ?? "";

			if (window.sessionStorage.getItem("state") !== stateFromLocation) {
				throw Error(`Probable session hijacking attack!
				state received "${stateFromLocation}" doesn't match state in storage!`);
			}

			//Retrieve authentication config from Finsemble config to use in token request
			//This portion may be moved off device to a server you control in order to
			//make use of a client secret in addition to PKCE.
			const { err, data: authConfigData } =
				await FSBL.Clients.ConfigClient.getValue({
					field: "finsemble.authentication.startup",
				});

			if (err)
				throw new Error(
					"Cannot access the config client in authentication component"
				);

			const endpoint = params?.endpoint ?? authConfigData?.token_url;

			if (!endpoint) {
				throw new Error(
					`Data provided to getToken (phase 2) is missing an endpoint URL e.g. http://localhost:3375/token`
				);
			}

			const formData = {
				grant_type: "authorization_code",
				client_id: params?.clientID ?? authConfigData?.client_id,
				code_verifier: initialCodeVerifier,
				code: authorizationCode,
				redirect_uri: params?.redirectURI ?? authConfigData?.redirect_uri,
				state: stateFromLocation,
			};

			// if we are missing values for the data then we want to log and error
			if (hasMissingValues(formData)) {
				throw new Error(
					`Data provided to getToken (phase 2) is missing values: ${hasMissingValues(
						formData
					)} `
				);
			}

			log("PKCE auth phase 2 - Access Token retrieval");

			const body = new URLSearchParams(formData).toString();

			const result = await fetch(endpoint, {
				mode: "cors",
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Accept: "application/json",
				},
				body,
			});

			const token: TokenResponse = await result.json();

			if (isTokenError(token)) {
				const errorMsg =
					token.error +
					(token.error_description ? " - " + token.error_description : "");
				errorLog("Access token retrieval failed, reason: ", errorMsg);
				reject(new Error(errorMsg));
			} else {
				debugLog("token:", token);
				resolve(token);
			}
		} catch (err) {
			errorLog(err);
			reject(err);
		}
	});
}

/**
 * Using the access token get the userInformation via your user endpoint.
 *
 * _Note:_ Return data will be specific to your endpoint and may be different from the example below.
 *
 * @example
 * ```javascript
 * const userData = await getUserInfo({ accessToken: "YOUR_ACCESS_TOKEN",
										  endpoint: "https://dev-xo6vgelc.eu.auth0.com/userinfo"})
	 const email = userData.email
 * ```
 */
export async function getUserInfo({
																		accessToken,
																		endpoint: endpointURL,
																	}: {
	accessToken: string;
	endpoint?: string;
}) {
	const { err, data: authConfigData } =
		await FSBL.Clients.ConfigClient.getValue({
			field: "finsemble.authentication.startup",
		});

	if (err) {
		throw new Error(
			"cannot access the config client in authentication component"
		);
	}

	const endpoint = endpointURL ?? authConfigData?.user_info_url;

	if (!endpoint) {
		throw new Error(
			`Data provided to getToken (phase 2) is missing an endpoint URL e.g. http://AUTH_PROVIDER.com/userInfo`
		);
	}

	log("PKCE auth phase 3 - Get User Info");

	const getUserInfo = await fetch(endpoint, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
	});

	const userInfo = await getUserInfo.json();
	debugLog("userInfo:", userInfo);

	return userInfo;
}

/**
 * Retrieve a new access_token via a refresh_token.
 * You may specify an optional reduced set of scopes for the refreshed access token,
 * if not specified most OAuth providers will use the original set of scopes.
 *
 * _Note:_ Return data will be specific to your endpoint and may be different from the example below.
 * Update the type defined at the start of this file to reflect what data your endpoint returns.
 *
 * @example
 * ```javascript
   const token =  await refreshToken({
	   clientID= "Az8HDa8YLNw0sKApZsPwsonOTMRRyXnl",
	   refreshToken
   });
   const accessToken = token.access_token;
 * ```
 */
export function refreshToken(params: {
	clientID?: string;
	refreshToken: string;
	scope?: string;
	endpoint?: string;
}): Promise<AuthTokenDetails> {
	return new Promise<AuthTokenDetails>(async (resolve, reject) => {
		try {
			//Retrieve authentication config from Finsemble config to use in token request
			//This portion may be moved off device to a server you control in order to
			//make use of a client secret in addition to PKCE.
			const { err, data: authConfigData } =
				await FSBL.Clients.ConfigClient.getValue({
					field: "finsemble.authentication.startup",
				});

			if (err)
				throw new Error(
					"Cannot access the config client in authentication component"
				);

			const endpoint = params?.endpoint ?? authConfigData?.token_url;

			if (!endpoint) {
				throw new Error(
					`Data provided to refreshToken (phase 4) is missing an endpoint URL e.g. http://localhost:3375/token`
				);
			}

			const formData: Record<string, string> = {
				grant_type: "refresh_token",
				client_id: params.clientID ?? authConfigData?.client_id,
				refresh_token: params.refreshToken,
			};
			//if a reduced scope was specified, use it.
			if (params.scope) {
				formData.scope = params.scope;
			}

			// if we are missing values for the data then we want to log and error
			if (hasMissingValues(formData)) {
				throw new Error(
					`Data provided to refreshToken (phase 4) is missing values: ${hasMissingValues(
						formData
					)} `
				);
			}

			log("PKCE auth phase 4 - Refresh Access Token");

			const body = new URLSearchParams(formData).toString();

			const result = await fetch(endpoint, {
				mode: "cors",
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Accept: "application/json",
				},
				body,
			});

			const token: TokenResponse = await result.json();

			if (isTokenError(token)) {
				const errorMsg =
					token.error +
					(token.error_description ? " - " + token.error_description : "");
				errorLog("Access token refresh failed, reason: ", errorMsg);
				reject(new Error(errorMsg));
			} else {
				debugLog("token:", token);
				resolve(token);
			}
		} catch (err) {
			errorLog(err);
			reject(err);
		}
	});
}

export function setupAutomatedRefresh(
	params: {
		token: AuthTokenDetails;
		preemptExpirySeconds?: number;
		retries?: number;
		retryDelaySeconds?: number;
	},
	refreshCompleteCallback: (
		err: string | null,
		refreshedToken: AuthTokenDetails | null
	) => void
) {
	const preemptExpiryBySecs = params.preemptExpirySeconds ?? 300;
	const numRetries = params.retries ?? 3;
	const retryDelaySecs = params.retryDelaySeconds ?? 60;

	if (params.token.expires_in && params.token.refresh_token) {
		//Note expires_in is specified in seconds, convert to millisecs and preempt to allow for retries
		const doRefreshAfterSeconds = params.token.expires_in - preemptExpiryBySecs;
		let retryNum = 0;

		log(
			`Access token expires in ${params.token.expires_in} seconds, setting up automated refresh in ${doRefreshAfterSeconds} seconds`
		);

		const doRefresh = async () => {
			try {
				let refreshedToken = await refreshToken({
					refreshToken: params.token.refresh_token,
				});
				refreshCompleteCallback(null, refreshedToken);
			} catch (err) {
				if (retryNum < numRetries) {
					retryNum++;
					log(
						`Retrying Access token refresh (retry ${retryNum} of ${numRetries}) in ${retryDelaySecs} seconds`
					);
					setTimeout(doRefresh, retryDelaySecs * 1000);
				} else {
					const failureMessage =
						"Access token refresh retries exhausted. The access token was NOT refreshed.";
					refreshCompleteCallback(failureMessage, null);
				}
			}
		};
		setTimeout(doRefresh, doRefreshAfterSeconds * 1000);
	} else {
		errorLog("Access token did not come with details needed to refresh it");
	}
}

/* Helper functions */

async function digestHex(message: string) {
	// encode as (utf-8) Uint8Array
	const msgUint8 = new TextEncoder().encode(message);
	// create the hash buffer array
	const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
	// make uint array for the buffer
	let uintArr = new Uint8Array(hashBuffer);
	// create new uint binary string by destructuring the array
	let uintString = String.fromCharCode(...uintArr);
	// convert binary string to Base64
	const binaryString = window.btoa(uintString);
	// the string can only contain unreserved characters ( [A-Z] / [a-z] / [0–9] / “-” / “.” / “_” / “~" ) with length between 43 and 128 characters
	return binaryString.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function uuid(): string {
	// @ts-ignore
	return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(
		/[018]/g,
		function (c: number) {
			return (
				c ^
				(window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
			).toString(16);
		}
	);
}

const randomBase64Generator = () => window.btoa(uuid());

function saveStateAndVerifier(state: string, codeVerifier: string) {
	// Don't overwrite our saved state if location has the state parameter.
	//  This means we got authorization from the AS, and we need to compare
	//  them later.
	if (window.location.search.includes("state")) return;
	// NOTE: the redirect URI (where this data will be accessed) must be on
	//  the same domain as the Authentication component first running this code
	//  or it won't be accessible
	const storage = window.sessionStorage;
	storage.clear();
	storage.setItem("state", state);
	storage.setItem("code_verifier", codeVerifier);
}

// check for missing values in an object
const hasMissingValues = (obj: object) => {
	const res = Object.entries(obj).filter(([, value]) => !value);

	if (res.length) {
		return res.map(([keys]) => keys);
	} else {
		return false;
	}
};

const log = (...args: any) => {
	FSBL.Clients.Logger.log(...args);
	console.log(...args);
};

const errorLog = (...args: any) => {
	FSBL.Clients.Logger.error(...args);
	//Finsemble logger will make this appear in both console and central logger
	//console.error(...args);
};

const debugLog = (...args: any) => {
	FSBL.Clients.Logger.debug(...args);
	console.debug(...args);
};

/* end helper functions */
