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
Finsemble.Clients.WorkspaceClient.initialize();

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
					"workspaceClient",
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
		this.workspaceShareImport()
		callback();
	}

	workspaceShareImport() {
		// listen to the incoming request from protocol URL
		Finsemble.System.addEventListener("protocol-handler-triggered", async (data) => {

			try {

				// turn this into a URL to get the query params and path
				let protocolURL = new URL(data.url)
				console.log(protocolURL);

				// check to ensure we only listen to "sharedworkspace" as the protocol handler will accept any path
				if (protocolURL.pathname.includes("sharedworkspace")) {

					// check both username and workspace have been passed as queryParams
					if (protocolURL.has("username") && protocolURL.has("workspace")) {

						const username = protocolService.get("username")
						const workspaceName = protocolService.get("workspace")
						const workspace = await fetchWorkspace({ username, workspaceName })
						if (workspace) {
							addWorkspace(workspace)
						} else {
							console.warn("no workspace found")
						}
					}

					// if you want to use a UUID instead
					else if (protocolURL.has("UUID")) {

						const UUID = protocolService.get("UUID")
						const workspace = await fetchWorkspace({ UUID })
						if (workspace) {
							addWorkspace(workspace)
						} else {
							console.warn("no workspace found")
						}
					}
				}

			} catch (error) {
				console.error(error)
			}
		});

		async function fetchWorkspace({ UUID, workspaceName, userName }) {
			// fetch from different locations depending on if we want to use our finsemble storage or UUID
			if (UUID) {
				const response = await fetch(`https://s3.console.aws.amazon.com/s3/object/cs-send.finsemble.com?region=us-east-1&prefix=files/ChrisWorkspace.json`)
				console.log(response)
				return response.json()
			} else {
				fetch(`http://example.com/finsemblestorage/${userName}/${workspaceName}`)
			}
		}

		// workspace needs to be javascript object
		function addWorkspace(workspace) {
			Finsemble.Clients.WorkspaceClient.import({ force: true, workspaceJSONDefinition: workspace }, (err, response) => {
				if (err) {
					console.error(err)
				} else {
					console.log(response);
				}
			})
		}
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
