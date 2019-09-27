const Finsemble = require("@chartiq/finsemble");
const {
	RouterClient,
	Logger,
	WorkspaceClient,
	DialogManager,
	ConfigClient
} = Finsemble.Clients;

Logger.start();
Logger.log("shutdown Service starting up");

// Add and initialize any other clients you need to use
//   (services are initialised by the system, clients are not)
// let StorageClient = Finsemble.Clients.StorageClient;
// StorageClient.initialize();

/**
 *
 * @constructor
 */
function shutdownService() {
	const self = this;

	this.shutdownFunction = function() {
		ConfigClient.getValue(
			{ field: "finsemble.scheduledShutdown" },
			(err, config) => {
				//Allow the timeout for the restart dialog to be driven by config. See checkForScheduledRestart comments for format.
				let scheduledShutdownTimeout = 60000;
				//If the dialogTimeout property exists and is a number, override our default.
				if (config && !isNaN(config.dialogTimeout)) {
					scheduledShutdownTimeout = config.dialogTimeout;
				}
				//create an object for the 2nd arg so that the scheduleRestart function doesn't have to change.
				scheduleShutdown(err, config);
			}
		);

		//If the user changes it via the preferences API, we catch the change here, log it out, and schedule the restart.
		ConfigClient.addListener(
			{ field: "finsemble.scheduledShutdown" },
			(err, config) => {
				if (config.value) {
					Logger.system.log(
						"APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN TIME CHANGED. NEW TIME:",
						config.value
					);
				} else {
					Logger.system.log(
						"APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN DISABLED."
					);
				}
				scheduleShutdown(err, config.value);
			}
		);

		/**
		 * Saves workspace and if it is dirty then  fires off a message shutting down the application.
		 */
		const saveWorkspace = () => {
			Logger.log(WorkspaceClient);
			if (!WorkspaceClient.activeWorkspace.isDirty) {
				return Promise.resolve();
			}

			return new Promise((resolve, reject) => {
				DialogManager.open(
					"yesNo",
					{
						question:
							'Your workspace "' +
							WorkspaceClient.activeWorkspace.name +
							'" has unsaved changes, would you like to save?'
					},
					async (err, response) => {
						if (err || response.choice === "affirmative") {
							try {
								await WorkspaceClient.save();
							} catch (error) {
								reject(error);
							}
						}
						resolve(response.choice);
					}
				);
			});
		};

		const shutdownFinsemble = async () => {
			// if the user cancels the event then don't shutdown
			if ((await saveWorkspace()) === "cancel") return;
			// code to shutdown Finsemble
			RouterClient.transmit("Application.shutdown");
		};

		function scheduleShutdown(err, config) {
			const daysUntilShutdown = (restartDay, today) => {
				const shutdownIsToday = restartDay - today === 0;
				const shutdownIsNextWeek = restartDay - today < 0;

				if (shutdownIsToday) {
					return 0;
				} else if (shutdownIsNextWeek) {
					// 6 is how many full days until the same day next week
					return restartDay - today + 6;
				} else {
					// shutdown day is coming up soon this week
					return restartDay - today;
				}
			};

			const timeInMsToShutdown = (shutdownTime, now) => {
				// ensure the time has not passed
				if (shutdownTime - now < 0) {
					//if the time has passed then set the day to next week (same day)
					shutdownTime.setDate(shutdownTime.getDate() + 7);
				}
				return shutdownTime - now;
			};

			const now = new Date();

			const shutdownTime = new Date();
			// using days to set the date for shutdown
			shutdownTime.setDate(
				now.getDate() + daysUntilShutdown(config.day, now.getDay())
			);
			shutdownTime.setHours(config.hour);
			shutdownTime.setMinutes(config.minute);

			const countdownTillShutdown = timeInMsToShutdown(shutdownTime, now);

			// countdown timer until the shutdown
			const shutDownTimer = setTimeout(() => {
				shutdownFinsemble();
			}, countdownTillShutdown);
			// clearTimeout(shutDownTimer);
			// clear the timer just in case there is an existing one set up
			shutDownTimer;
		}
	};

shutdownService.prototype = new Finsemble.baseService({
	startupDependencies: {
		// add any services or clients that should be started before your service
		services: [],
		clients: []
	}
});
const serviceInstance = new shutdownService("shutdownService");

serviceInstance.onBaseServiceReady(function(callback) {
	// serviceInstance.createRouterEndpoints();
	Logger.log("shutdown Service ready");
	serviceInstance.shutdownFunction();
	callback();
});

serviceInstance.start();
module.exports = serviceInstance;
