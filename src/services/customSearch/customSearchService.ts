const Finsemble = require("@finsemble/finsemble-core");

Finsemble.Clients.Logger.start();
Finsemble.Clients.Logger.log("customSearch Service starting up");

// Add and initialize any other clients you need to use (services are initialized by the system, clients are not):
// Finsemble.Clients.AuthenticationClient.initialize();
// Finsemble.Clients.ConfigClient.initialize();
// Finsemble.Clients.DialogManager.initialize();
// Finsemble.Clients.DistributedStoreClient.initialize();
// Finsemble.Clients.DragAndDropClient.initialize();
// Finsemble.Clients.LauncherClient.initialize();
// Finsemble.Clients.LinkerClient.initialize();
// Finsemble.Clients.HotkeyClient.initialize();
Finsemble.Clients.SearchClient.initialize();
// Finsemble.Clients.StorageClient.initialize();
// Finsemble.Clients.WindowClient.initialize();
// Finsemble.Clients.WorkspaceClient.initialize();

/**
 * Add service description here
 */
class customSearchService extends Finsemble.baseService {
	/**
	 * Initializes a new instance of the customSearchService class.
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
					"searchClient"
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
	readyHandler(callback: () => void) {
		this.customSearchFunction();
		Finsemble.Clients.Logger.log("customSearch Service ready");
		callback();
	}

	// Implement service functionality
	customSearchFunction() {

		Finsemble.Clients.SearchClient.register(
			{
				name: "MetaWeather", // The name of the provider
				searchCallback: metaWeatherSearch, // A function called when a search is initialized
				// itemActionCallback: searchResultActionCallback, // (optional) A function that is called when an item action is fired
				providerActionTitle: "My Provider action title", // (optional) The title of the provider action
				// providerActionCallback: providerActionCallback,
				//(optional) A function that is called when a provider action is fired
			},
			function (err: any) {
				if (err) { Finsemble.Clients.Logger.error(err) }
				else {

					Finsemble.Clients.Logger.log("SEARCH: MetaWeather - Registration succeeded");
				}
			}
		);

		/**
 *
 * @param params query string
 * @param callback
 */
		function metaWeatherSearch(params: { text: string, windowName: string }, callback: Function) {

			Finsemble.Clients.Logger.log("CUSTOM SEARCH PARAMS", params);

			if (params.text.toLowerCase().includes("weather:")) {
				// only get the city from the string
				const searchText = params.text.toLowerCase().replace("weather:", "")
				const city = searchText.trim()

				switch (city) {
					case "london":
						callback(null, [{
							name: "London",
							score: 100,
							type: "weather",
							description: "Get some blue skys!",
							actions: [{ name: "Spawn" }],
							tags: []
						}])
						break;
					case "new york":
						callback(null, [{
							name: "New York",
							score: 100,
							type: "weather",
							description: "Get some blue skys!",
							actions: [{ name: "Spawn" }],
							tags: []
						}])
						break;
					default:
						break;
				}
			}
		}

		/**
		 *
		 * @param params query string
		 * @param callback
		 */
		function metaWeatherSearchAPI(params: { text: string, windowName: string }, callback: Function) {

			Finsemble.Clients.Logger.log("CUSTOM SEARCH PARAMS", params);

			const resultTemplate = {
				name: "London", // This should be the value you want displayed
				score: 100, // This is used to help order search results from multiple providers
				type: "Application", // The type of data your result returns
				description: "Get some blue skys!",
				actions: [{ name: "Spawn" }], // Actions can be an array of actions
				tags: [] // This can be used for adding additional identifying information to your result
			}

			if (params.text.toLowerCase().includes("weather")) {
				const searchText = params.text.toLowerCase()
				fetch('https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/44418/', { mode: "cors" }).then(
					response => response.json()
				).then(data => {
					console.log(data)
					const result = {
						name: "London",
						score: 100,
						type: "Application",
						description: "Get some blue skys!",
						actions: [{ name: "Spawn" }],
						tags: []
					}
					callback(null, [result])
				})

			}

		}
	}


}

const serviceInstance = new customSearchService();

serviceInstance.start();
