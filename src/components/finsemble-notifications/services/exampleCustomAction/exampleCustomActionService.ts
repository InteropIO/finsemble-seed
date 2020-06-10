import NotificationClient from "../notification/notificationClient";
import { StandardCallback } from "../../types/FSBL-definitions/globals";

// eslint-disable-next-line
const Finsemble = require("@chartiq/finsemble");

Finsemble.Clients.Logger.start();
Finsemble.Clients.Logger.log("exampleCustomActionService Service starting up");

class ExampleCustomActionService extends Finsemble.baseService {
	nClient: NotificationClient;

	/**
	 * Initializes a new instance of the notificationsBuiltInActionsService class.
	 */
	constructor() {
		super({
			// Declare any service or client dependencies that must be available before your service starts up.
			startupDependencies: {
				// If the service is using another service directly via an event listener or a responder, that service
				// should be listed as a service start up dependency.
				services: [],
				// When ever you use a client API with in the service, it should be listed as a client startup
				// dependency. Any clients listed as a dependency must be initialized at the top of this file for your
				// service to startup.
				clients: []
			}
		});

		this.readyHandler = this.readyHandler.bind(this);
		this.queryHandler = this.queryHandler.bind(this);
		this.transmitHandler = this.transmitHandler.bind(this);
		this.publishHandler = this.publishHandler.bind(this);
		this.onBaseServiceReady(this.readyHandler);
	}

	/**
	 * Fired when the service is ready for initialization
	 * @param {function} callback
	 */
	readyHandler(callback: Function) {
		this.nClient = new NotificationClient();
		this.createRouterEndpoints();
		callback();
	}

	/**
	 * Creates a router endpoint for you service.
	 * Add query responders, listeners or pub/sub topic as appropriate.
	 */
	createRouterEndpoints() {
		Finsemble.Clients.RouterClient.addResponder("query-channel", this.queryHandler);

		Finsemble.Clients.RouterClient.addPubSubResponder("publish-channel", { State: "start" });
		Finsemble.Clients.RouterClient.subscribe("publish-channel", this.publishHandler);

		Finsemble.Clients.RouterClient.addListener("transmit-channel", this.transmitHandler);
	}

	queryHandler: StandardCallback = (error, queryMessage) => {
		Finsemble.Clients.Logger.log("Query handler got message", error, queryMessage);
		if (!error) {
			const notification = queryMessage.data.notification;
			const payload = queryMessage.data.actionPayload;
			notification.headerText = "Header Changed";
			console.log(payload);

			// Tell the notification service the message has been received. Any response is successful
			queryMessage.sendQueryResponse(null, { response: "Query handler got message" });
		}
	};

	transmitHandler: StandardCallback = (error, response) => {
		Finsemble.Clients.Logger.log("Transmit handler got message", error, response);
		if (!error) {
			// let notification = queryMessage.data;
			// notification.headerText = "Header Changed";
			// this.nClient.notify([notification]);
		}
	};

	publishHandler: StandardCallback = (error, response) => {
		Finsemble.Clients.Logger.log("Publish handler got message", error, response);
		if (!error) {
		}
	};
}

const serviceInstance = new ExampleCustomActionService();

serviceInstance.start();
module.exports = serviceInstance;
