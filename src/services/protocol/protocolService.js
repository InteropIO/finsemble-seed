const Finsemble = require("@finsemble/finsemble-core");

Finsemble.Clients.Logger.start();
Finsemble.Clients.Logger.log("protocolService Service starting up");

// Add and initialize any other clients you need to use (services are initialized by the system, clients are not):
// Finsemble.Clients.AuthenticationClient.initialize();
// Finsemble.Clients.ConfigClient.initialize();
// Finsemble.Clients.DialogManager.initialize();
// Finsemble.Clients.DistributedStoreClient.initialize();
// Finsemble.Clients.DragAndDropClient.initialize();
// Finsemble.Clients.LauncherClient.initialize();
// Finsemble.Clients.LinkerClient.initialize();
// Finsemble.Clients.HotkeyClient.initialize();
// Finsemble.Clients.SearchClient.initialize();
// Finsemble.Clients.StorageClient.initialize();
// Finsemble.Clients.WindowClient.initialize();
// Finsemble.Clients.WorkspaceClient.initialize();

/**
 * Add service description here
 */
class protocolService extends Finsemble.baseService {
	/**
	 * Initializes a new instance of the protocolServiceService class.
	 */
	constructor() {
		super({
			// Declare any client dependencies that must be available before your service starts up.
			startupDependencies: {
				// When ever you use a client API with in the service, it should be listed as a client startup
				// dependency. Any clients listed as a dependency must be initialized at the top of this file for your
				// service to startup.
				clients: [
					// "authenticationClient",
					// "configClient",
					// "dialogManager",
					// "distributedStoreClient",
					// "dragAndDropClient",
					// "hotkeyClient",
					// "launcherClient",
					// "linkerClient",
					// "searchClient
					// "storageClient",
					// "windowClient",
					// "workspaceClient",
				],
			},
		});

		this.readyHandler = this.readyHandler.bind(this);

		this.onBaseServiceReady(this.readyHandler);
	}

	/**
	 * Fired when the service is ready for initialization
	 * @param {function} callback
	 */
	readyHandler(callback) {
		this.createRouterEndpoints();
		Finsemble.Clients.Logger.log("protocolService Service ready");
		Finsemble.System.addEventListener("protocol-handler-triggered", (data) => {
			// listen to the workspace and add it
			console.log(data.url);
			console.log("protocol-handler-triggered")
		});
		callback();
	}

	// Implement service functionality
	myFunction(data) {
		return `Data passed into query: \n${JSON.stringify(data, null, "\t")}`;
	}

	/**
	 * Creates a router endpoint for you service.
	 * Add query responders, listeners or pub/sub topic as appropriate.
	 */
	createRouterEndpoints() {
		// Add responder for myFunction
		Finsemble.Clients.RouterClient.addResponder("protocolService.myFunction", (err, message) => {
			if (err) {
				return Finsemble.Clients.Logger.error("Failed to setup protocolService.myFunction responder", err);
			}

			Finsemble.Clients.Logger.log(`protocolService Query: ${JSON.stringify(message)}`);

			try {
				// Data in query message can be passed as parameters to a method in the service.
				const data = this.myFunction(message.data);

				// Send query response to the function call, with optional data, back to the caller.
				message.sendQueryResponse(null, data);
			} catch (e) {
				// If there is an error, send it back to the caller
				message.sendQueryResponse(e);
			}
		});
	}
}

const serviceInstance = new protocolService();

serviceInstance.start();
