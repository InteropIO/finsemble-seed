(() => {
	// Dummy function that just dumbly accepts whatever is in the form.
	const login = () => {
		const username = $("#username").val();
		const password = $("#password").val();

		// TODO: Check whether user already exists, offer to create or retry

		// real authentication might use BasicAuth, Digest Auth, or pass off to authentication server which redirects 
		// back when authenticated below is a dummy example that just accepts credentials from the form and publishes 
		// them out.
		const data = { username: username, password: password }

		// Hide window until authorization is complete in case it needs to be re-shown.
		FSBL.Clients.WindowClient.finsembleWindow.hide();

		// In the real world, you'd get this from a server. Send joe's credentials to a server, and get back 
		// entitlements / basic config.For this example, we just accept the credentials.
		publishCredentials(data)
	}

	// Pass credentials to the application.
	const publishCredentials = (user) => {
		// The user is set by publishAuthorization, but, since we want to fetch the user's config before we call 
		// publishAuthorization, we have to manually set the user. This step is only necessary if the StorageClient is
		// used to store the user configuration.
		FSBL.Clients.StorageClient.setUser(
			{
				user: user.username
			},
			(err, data) => {
				if (err) {
					FSBL.Clients.Logger.error(err);
				}

				// Now that the user has been set, fetch the user configuration
				FSBL.Clients.StorageClient.get({ topic: "user", key: "config" }, (err, data) => {
					updateConfig(data, () => {
						// Signal finsemble authorization has completed so it will continue to load.
						FSBL.Clients.AuthenticationClient.publishAuthorization(user.username, user);

						// Close the login dialog
						FSBL.Clients.WindowClient.close({ removeFromWorkspace: false, closeWindow: true });
					});
				});
			});
	}

	const updateConfig = (config, cb) => {
		if (!config) {
			// If no user data, just load with default.
			cb();
		}

		const configSet = {}
		if (config.components) configSet["components"] = config.components;
		if (config.menuItems) configSet["menus"] = config.menuItems;
		if (config.defaultWorkspace) configSet["workspaces"] = config.defaultWorkspace.workspaces;
		if (config.overrides) configSet["cssOverridePath"] = config.overrides;

		FSBL.Clients.ConfigClient.processAndSet(
			{
				newConfig: configSet,
				overwrite: true,
				replace: true
			},
			(err => cb(err)));
	}

	const quit = () => {
		FSBL.shutdownApplication();
	}

	// For this example, the password doesn't do anything, so we are disabling it and setting a tooltip to let the user
	// know they don't need to enter a password. This should be removed in a production implementation.
	$("#password")
		.prop("disabled", true)
		.prop("title", "The password, it does nothing");

	// TODO: Saving this for create user option. Delete if not used
	// const inLogin = true;
	// $("#authAction").click(() => {
	// 	const text = inLogin ? "Sign Up" : "Login"
	// 	const actionLink = inLogin ? "Login" : "Sign Up";
	// 	inLogin = !inLogin;
	// 	$("#submitButton").html(text);
	// 	$("#authAction").html(actionLink);
	// });

	// Add events to HTML elements
	$("#submitButton").click(login);
	$("#FSBL-close").click(quit);

	// Submits credentials on enter, closes on quit.
	$(document.body).on("keydown", (e) => {
		if (e.code === "Enter" && e.shiftKey === false) {
			login();
		}

		if (e.code === "Escape") {
			quit();
		}
	});

	// On ready, check to see if the user has a valid session
	FSBL.Clients.RouterClient.onReady(() => {
		// Here, you may want to hit a server and request the user's session information. If the session is valid, log them 
		// in automatically.This sample code assumes that they are not logged in and just shows the authentication page.
		FSBL.Clients.WindowClient.finsembleWindow.show();
	});
})();