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

Logger.start();

WorkspaceClient.initialize();
ConfigClient.initialize();
DialogManager.initialize();
DialogManager.createStore(() => {});

class ShutdownService extends BaseService {
	shutDownTimer = null;
	/**
	 * Initializes a new instance of the SeinfeldService class.
	 * @constructor
	 */
	constructor() {
		super({
			startupDependencies: {
				clients: ["configClient", "workspaceClient", "dialogManager"],
			},
		});
	}

	shutdownFunction() {
		/**
		 * Saves workspace and if it is dirty then  fires off a message shutting down the application.
		 */
		const saveWorkspace = () => {
			if (!WorkspaceClient.activeWorkspace.isDirty) {
				return Promise.resolve();
			}

			return new Promise((resolve, reject) => {
				// launch a dialog if the workspace isDirty to ensure the user can save changes
				DialogManager.onReady(() => {
					DialogManager.open(
						"yesNo",
						{
							monitor: "primary",
							title: "Scheduled Shutdown",
							question:
								"The application will shutdown in one minute. Your workspace will be saved.",
							showTimer: true,
							timerDuration: 60000,
							showNegativeButton: false,
							affirmativeResponseLabel: "Shutdown Now",
						},
						async (err, response) => {
							if (err) reject(err);
							try {
								if (response.choice === "cancel") {
									resolve(response.choice);
								} else {
									// save the workspace
									Logger.info("Saving workspace.");
									await WorkspaceClient.save();
									Logger.info("Workspace saved successfully.");
									resolve(response.choice);
								}
							} catch (error) {
								const errorMessage = `Failed to save workspace: ${error}`;
								Logger.warn(errorMessage);
								reject(errorMessage);
							}
						}
					);
				});
			});
		};

		/**
		 * set the timer to shutdown Finsemble
		 * @param {Object} config
		 * @returns {number} timeInMs - milliseconds
		 */
		const setShutdownTimer = (config) => {
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

			return timeInMsToShutdown(shutdownTime, now);
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
			} else if (config) {
				const shutdownTimer = setShutdownTimer(config);
				// countdown timer until the shutdown
				this.shutDownTimer = setTimeout(async () => {
					// if the user cancels the event then don't shutdown
					if ((await saveWorkspace()) === "cancel") return;
					// code to shutdown Finsemble
					RouterClient.transmit("Application.shutdown");
				}, shutdownTimer);
				this.shutDownTimer;
			} else {
				if (this.shutDownTimer) {
					// clear the timer just in case there is an existing one set up
					clearTimeout(this.shutDownTimer);
				}
			}
		};

		// Get the shutdown day, hour and minutes from the config
		ConfigClient.getValue(
			{ field: "finsemble.scheduledShutdown" },
			(err, config) => {
				if (config) {
					Logger.system.log(
						"APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN TIME:",
						config
					);
				} else {
					Logger.system.log(
						"APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN NOT CONFIGURED."
					);
				}
				shutdownFinsemble(err, config);
			}
		);

		// If dynamically changing the schedule shutdown, log it out, and schedule the shutdown.
		ConfigClient.addListener(
			{ field: "finsemble.scheduledShutdown" },
			(err, config) => {
				if ("value" in config && config.value) {
					Logger.system.log(
						"APPLICATION LIFECYCLE:SCHEDULED SHUTDOWN TIME CHANGED. NEW TIME:",
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
