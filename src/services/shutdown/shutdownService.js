const Finsemble = require("@chartiq/finsemble");
const { Clients } = Finsemble.Clients;
const { RouterClient, Logger, WorkspaceClient, DialogManager } = Clients;

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

	//Implement service functionality
	this.myFunction = function() {
		/**
		 * Saves workspace and if it is dirty then  fires off a message shutting down the application.
		 */
		const saveWorkspace = () => {
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
			if ((await saveWorkspace()) === "cancel") return;
			// code to shutdown Finsemble
			RouterClient.transmit("Application.shutdown");
		};

		const timeLeftBeforeShutdown = () => {
			const now = new Date();
			now.setDate(now.getDate() + 7);

			const daysOfTheWeek = [
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday"
			];

			const today = daysOfTheWeek[dateNow.getDay()].toLowerCase();
			const hourNow = dateNow.getHours();
			const minutesNow = dateNow.getMinutes();

			const config = {
				day: "Wednesday",
				hour: 17,
				minutes: 59
			};

			return config.day.toLowerCase() === today &&
				Number(config.hour) === hourNow &&
				Number(config.minutes) === minutesNow
				? true
				: false;
		};

		const checkTime = () => {
			console.log("checking to see if I need to shutdown");
			setTimeout(() => {
				shutdownFinsemble();
			}, timeLeftBeforeShutdown);
		};
	};

	/**
	 * Creates a router endpoint for you service.
	 * Add query responders, listeners or pub/sub topic as appropriate.
	 * @private
	 */
	this.createRouterEndpoints = function() {
		//Example router integration which uses a single query responder to expose multiple functions
		RouterClient.addResponder("shutdown functions", function(
			error,
			queryMessage
		) {
			if (!error) {
				Logger.log("shutdown Query: " + JSON.stringify(queryMessage));

				if (queryMessage.data.query === "myFunction") {
					try {
						queryMessage.sendQueryResponse(null, self.myFunction());
					} catch (err) {
						queryMessage.sendQueryResponse(err);
					}
				} else {
					queryMessage.sendQueryResponse(
						"Unknown shutdown query function: " + queryMessage,
						null
					);
					Logger.error("Unknown shutdown query function: ", queryMessage);
				}
			} else {
				Logger.error("Failed to setup shutdown query responder", error);
			}
		});
	};

	return this;
}

shutdownService.prototype = new Finsemble.baseService({
	startupDependencies: {
		// add any services or clients that should be started before your service
		services: [
			/* "dockingService", "authenticationService" */
		],
		clients: [
			/* "storageClient" */
			"RouterClient",
			"Logger",
			"WorkspaceClient",
			"DialogManager"
		]
	}
});
const serviceInstance = new shutdownService("shutdownService");

serviceInstance.onBaseServiceReady(function(callback) {
	serviceInstance.createRouterEndpoints();
	Logger.log("shutdown Service ready");
	callback();
});

serviceInstance.start();
module.exports = serviceInstance;
