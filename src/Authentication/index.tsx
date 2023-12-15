/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { createRoot } from "react-dom/client";

// This line imports type declarations for Finsemble's globals such as FSBL and fdc3. You can ignore any warnings that it is defined but never used.
// Please use global FSBL and fdc3 objects instead of importing from finsemble-core.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { types } from "@finsemble/finsemble-core";

import { FinsembleProvider, FinsembleCSS } from "@finsemble/finsemble-core";


const Authentication = () => {
	const [username, setUsername] = React.useState("auth-form-username");
	const [password, setPassword] = React.useState("auth-form-password");

	const authenticate = async () => {
		await FSBL.Clients.AuthenticationClient.publishAuthorization(username, { password });
		finsembleWindow.hide();
	}

	return (
		<div>
			<div><label>Username:</label> <input type="text" id="username" name="username" placeholder="Username" onChange={(event) => setUsername(event.target.value)}></input></div>
			<div><label>Password:</label> <input type="password" id="password" name="password" placeholder="" onChange={(event) => setPassword(event.target.value)}></input></div>
			<div><button onClick={authenticate}>Login</button></div>
		</div>
	);
}

const container = document.getElementsByTagName("div")[0];

createRoot(container).render(
	<FinsembleProvider>
		<FinsembleCSS />
		<Authentication />
	</FinsembleProvider>
);
