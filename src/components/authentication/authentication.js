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
			(err) => {
				if (err) {
					FSBL.Clients.Logger.error(err);
				}

				// Now that the user has been set, fetch the user configuration
				FSBL.Clients.StorageClient.get({ topic: "user", key: "config" }, (err, data) => {
					if (err) {
						FSBL.Clients.Logger.error(err);
					}

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
		if (config.components) configSet.components = config.components;
		if (config.menus) configSet.menus = config.menus;
		if (config.workspaces) configSet.workspaces = config.workspaces;
		if (config.cssOverridePath) configSet.cssOverridePath = config.cssOverridePath;

		FSBL.Clients.ConfigClient.processAndSet(
			{
				newConfig: configSet,
				overwrite: true,
				replace: true
			},
			(err => {
				if (err) {
					cb(err)
					return;
				}

				if (!config.services && typeof (config.services) !== "object") {
					FSBL.Clients.Logger.warn("Custom services is either undefined or is not an object");
					cb();
					return;
				}

				debugger;
				
				startServices(config.services, cb);
			}));
	}

	const startServices = (services, cb) => {
		// if the configuration contains services, start them
		// TODO: Sort the services into a start order based on dependencies. Current assumption is that services have not dependencies.
		const keys = Object.keys(services);

		// TODO: Refactor to make the startServices method smaller
		const startService = (serviceName, cb) => {
			const serviceConfig = services[serviceName];
			if (!serviceConfig) {
				FSBL.Clients.Logger.warn(`No object specified for service ${serviceName}`);
				cb();
			}

			if ((typeof (serviceConfig.active) !== "undefined") && !serviceConfig.active) {
				// If active is not defined, the default is active.
				// Service is not active, move on to the next.
				cb();
			}

			if (!serviceConfig.name) {
				FSBL.Clients.Logger.warn(`No 'name' property specified for service ${serviceName}`);
				cb();
			}

			if (!serviceConfig.html) {
				FSBL.Clients.Logger.warn(`No 'html' property specified for service ${serviceName}`);
				cb();
			}

			// TODO: Do we need to check what services have already started and make sure there isn't collision?
			// TODO: Need to make sure services don't cause issues on restart. Do we need to stop services on logout?
			FSBL.Clients.LauncherClient.spawn(
				null,
				{
					name: serviceConfig.name,
					data: serviceConfig,
					options: {
						autoShow: serviceConfig.visible ? true : false
					},
					url: serviceConfig.html
				},
				() => {
					if (serviceConfig.visible && serviceConfig.showDevConsoleOnVisible) {
						fin.desktop.System.showDeveloperTools(
							fin.desktop.Application.getCurrent().uuid,
							fin.desktop.Window.getCurrent().name,
							() => {
								const timeoutDuration = self.customData.debugServiceDelay || 0;
								if (timeoutDuration > 0) {
									FSBL.Clients.Logger.log(`APPLICATION LIFECYCLE:STARTUP:SERVICE LIFECYCLE:========>DELAYING STARTUP BY ${timeoutDuration} Milliseconds<========`);
									setTimeout(cb, timeoutDuration);
								} else {
									cb();
								}
							}
						);
					} else {
						cb();
					}
				}
			);
		};

		const startServiceCB = () => {
			i += 1;
			if (i < keys.length) {
				serviceName = keys[i];
				startService(serviceName, startServiceCB);
			} else {
				cb();
			}
		};

		let i = 0;
		let serviceName = keys[i];
		startService(serviceName, startServiceCB);
	}

	const quit = () => {
		FSBL.shutdownApplication();
	}

	// For this example, the password doesn't do anything, so we are disabling it and setting a tooltip to let the user
	// know they don't need to enter a password. This should be removed in a production implementation.
	$("#password")
		.prop("disabled", true)
		.prop("placeholder", "Demo needs no password");

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