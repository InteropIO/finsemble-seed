(() => {
	const inLogin = true;

	// On ready, check to see if the user has a valid session
	FSBL.Clients.RouterClient.onReady(() => {
		checkAuthorizationStatus();
	});

	$('#authAction').click(function (e) {
		const text = inLogin ? "Sign Up" : "Login"
		const actionLink = inLogin ? "Login" : "Sign Up";
		inLogin = !inLogin;
		$('#submitButton').html(text);
		$('#authAction').html(actionLink);
	});

	document.body.addEventListener('keydown', handleKeydown);

	// Submits credentials on enter, closes on quit.
	const handleKeydown = (e) => {
		if (e.code === 'Enter' && e.shiftKey === false) {
			processAuthInput();
		}

		if (e.code === 'Escape') {
			quit();
		}
	}

	// Here, you may want to hit a server and request the user's session information. If the session is valid, log them 
	// in automatically.This sample code assumes that they are not logged in and just shows the authentication page.
	const checkAuthorizationStatus = () => {
		FSBL.Clients.WindowClient.finsembleWindow.show();
	}

	// Dummy function that just dumbly accepts whatever is in the form.
	const processAuthInput = () => {
		const username = document.getElementById("username").value;
		const password = document.getElementById("password").value;

		// real authentication might use BasicAuth, Digest Auth, or pass off to authentication server which redirects 
		// back when authenticated below is a dummy example that just accepts credentials from the form and publishes 
		// them out.
		const data = { username: username, password: password }

		FSBL.Clients.WindowClient.finsembleWindow.hide();

		// In the real world, you'd get this from a server. Send joe's credentials to a server, and get back 
		// entitlements / basic config.For this example, we just accept the credentials.
		publishCredentials(data)
	}

	// Pass credentials to the application.
	const publishCredentials = (user) => {
		StorageClient.get({ topic: "user", key: "config" }, (err, data) => {
			updateConfig(data, () => {
				FSBL.Clients.AuthenticationClient.publishAuthorization(user.username, user);
				FSBL.Clients.WindowClient.close({ removeFromWorkspace: false, closeWindow: true });
			});
		});
	}

	// CLose app when the X is clicked.
	const quit = () => {
		FSBL.shutdownApplication();
	}

	const updateConfig = (config, cb) => {
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
			(err => {
				return cb(err)
			}));
	}
})();