//replace with import when ready
const Finsemble = require("@finsemble/finsemble-core");
const BaseService = Finsemble.baseService;
const {
	RouterClient,
	Logger,
	WorkspaceClient,
	DialogManager,
	ConfigClient,
} = Finsemble.Clients;

const CONFIG_LOCATION = "finsemble.custom.scheduledShutdown";

Logger.start();
WorkspaceClient.initialize();
ConfigClient.initialize();
DialogManager.initialize();
// DialogManager.createStore(() => {});

class ShutdownService extends BaseService {
	shutDownTimer = null;

	constructor() {
		super({
			startupDependencies: {
				clients: ["configClient", "workspaceClient", "dialogManager"],
			},
		});
	}

	shutdownFunction() {
		/**
		 * Offers to save workspace if it is dirty, auto-saves on a timeout and then fires off a 
		 * message shutting down the application.
		 */
		const saveWorkspace = () => {
			WorkspaceClient.isWorkspaceDirty(function(err, response) {
				if (response && response.data === false){
					//workspace is not dirty, just shutdown
					Logger.system.log("APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN - workspace is NOT dirty so NOT displaying shutdown dialog");
					RouterClient.transmit("Application.shutdown");
				} else {
					//workspace is dirty
					// launch a dialog if the workspace isDirty to ensure the user can save changes
					Logger.system.log("APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN - workspace is dirty so displaying shutdown dialog");
					DialogManager.open(
						"yesNo",
						{
							monitor: "primary",
							title: "Scheduled Shutdown",
							question:
								"The application will shutdown in one minute. Your workspace will be saved.",
							showTimer: true,
							timerDuration: 30000,
							showNegativeButton: false,
							showCancelButton: false,
							affirmativeResponseLabel: "Shutdown Now",
						},
						async (err, response) => {
							if (err) reject(err);
							Logger.log("APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN - done with shutdown dialog, response", response);
							try {
								if (response.choice === "cancel") {
									Logger.system.warn("APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN - Scheduled shutdown cancelled by user");
								} else {
									// save the workspace
									Logger.system.info("APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN - Saving workspace.");
									await WorkspaceClient.save();
									Logger.system.info("APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN - Workspace saved successfully.");
									RouterClient.transmit("Application.shutdown");
								}
							} catch (error) {
								const errorMessage = `APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN - Scheduled shutdown cancelled as we failed to save the workspace`;
								Logger.warn(errorMessage, error);
							}
						}
					);
				}
			});
		};

		/**
		 * Set the timer to shutdown Finsemble
		 * @param {Object} config
		 * @returns {number} timeInMs - milliseconds
		 */
		const setShutdownTimeout = (config) => {
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

			const now = new Date();

			const shutdownTime = new Date();
			
			if (typeof config.dayOfWeek !== "undefined"){
				// weekly shutdown - using dayOfWeek to set the date for shutdown
				shutdownTime.setDate(
					now.getDate() + daysUntilShutdown(config.dayOfWeek, now.getDay())
				);
				shutdownTime.setHours(config.hour);
				shutdownTime.setMinutes(config.minute);
				if (shutdownTime - now < 0) {
					//if the time has passed then set the day to next week (same day)
					shutdownTime.setDate(shutdownTime.getDate() + 7);
				}
				Logger.system.log("APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN - shutdown at: ", shutdownTime);
				return shutdownTime - now;
			} else {
				//daily shutdown
				shutdownTime.setHours(config.hour);
				shutdownTime.setMinutes(config.minute);
				if (shutdownTime - now < 0) {
					//if the time has passed then set the day to tomorrow
					shutdownTime.setDate(shutdownTime.getDate() + 1);
				}
				Logger.log("APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN - shutdown at: ", shutdownTime);
				return shutdownTime - now;
			}
		};

		/**
		 * The function that shuts down Finsemble
		 * @param {error} err
		 * @param {Object} config
		 */
		const shutdownFinsemble = (err, config) => {
			if (err) {
				Logger.log(err);
				return err;
			} else {
				if (this.shutDownTimer) {
					// clear the timer just in case there is an existing one set up
					clearTimeout(this.shutDownTimer);
				}
				if (config) {
					const shutdownTimeout = setShutdownTimeout(config);
					// countdown timer until the shutdown
					this.shutDownTimer = setTimeout(saveWorkspace, shutdownTimeout);
				}
			}
		};

		// Get the shutdown day, hour and minutes from the config
		ConfigClient.getValue(
			{ field: CONFIG_LOCATION },
			(err, config) => {
				if (config) {
					Logger.system.log(
						"APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN - config:",
						config
					);
				} else {
					Logger.system.log(
						"APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN - not configured."
					);
				}
				shutdownFinsemble(err, config);
			}
		);

		// If dynamically changing the schedule shutdown, log it out, and schedule the shutdown.
		ConfigClient.addListener(
			{ field: CONFIG_LOCATION },
			(err, config) => {
				if ("value" in config && config.value) {
					Logger.system.log(
						"APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN - CONFIG CHANGED. NEW CONFIG:",
						config.value
					);
				} else {
					Logger.system.log(
						"APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN DISABLED."
					);
				}
				shutdownFinsemble(err, config.value);
			}
		);
	}
}
const serviceInstance = new ShutdownService("shutdownService");
serviceInstance.onBaseServiceReady((callback) => {
	Logger.log("shutdown Service ready");
	serviceInstance.shutdownFunction();
	callback();
});

serviceInstance.start();
module.exports = serviceInstance;
