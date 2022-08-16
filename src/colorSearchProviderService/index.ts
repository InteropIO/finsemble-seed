/* eslint-disable @typescript-eslint/no-unused-vars */
const Finsemble = require("@finsemble/finsemble-core");

Finsemble.Clients.Logger.start();
Finsemble.Clients.Logger.log("colorSearchProvider Service starting up");

/**
 * This service registers a new search provider with the SearchClient, providing several colors to choose from.
 * When selected, these new search results will launch a `colorComponent` corresponding to the selected search result.
 */
class colorSearchProviderService extends Finsemble.baseService {
	/**
	 * Initializes a new instance of the colorSearchProviderService class.
	 */
	constructor() {
		super({
			// Declare any service or client dependencies that must be available before your service starts up.
			startupDependencies: {},
		});

		this.readyHandler = this.readyHandler.bind(this);

		this.onBaseServiceReady(this.readyHandler);

		this.currentColor = { colorName: "White", colorHex: "#FFFFFF" };
	}

	/**
	 * Fired when the service is ready for initialization
	 * @param {function} callback
	 */
	readyHandler(callback) {
		this.createRouterEndpoints();
		this.registerCustomSearchProvider();
		Finsemble.Clients.Logger.log("colorSearchProvider Service ready");
		callback();
	}

	// Implement service functionality
	returnCurrentColor(data) {
		//return `Data passed into query: \n${JSON.stringify(data, null, "\t")}`;
		return this.currentColor;
	}

	/**
	 * Creates a router endpoint for you service.
	 * Add query responders, listeners or pub/sub topic as appropriate.
	 */
	createRouterEndpoints() {
		// Add responder for myFunction
		Finsemble.Clients.RouterClient.addResponder("colorSearchProvider.currentColor", (err, message) => {
			if (err) {
				return Finsemble.Clients.Logger.error("Failed to setup colorSearchProvider.currentColor responder", err);
			}

			Finsemble.Clients.Logger.log(`colorSearchProvider.currentColor Query: ${JSON.stringify(message)}`);

			try {
				// Data in query message can be passed as parameters to a method in the service.
				const data = this.returnCurrentColor(message.data);

				// Send query response to the function call, with optional data, back to the caller.
				message.sendQueryResponse(null, data);
			} catch (e) {
				// If there is an error, send it back to the caller
				message.sendQueryResponse(e);
			}
		});
	}

	registerCustomSearchProvider() {
		var colors = {
			Red: "#FF0000",
			Green: "#00FF00",
			Blue: "#0000FF",
			White: "#FFFFFF",
			Black: "#000000",
		};

		Finsemble.Clients.SearchClient.register(
			{
				name: "Colors",
				// This callback happens as the user types text into the search box.
				searchCallback: (params, cb) => {
					console.log("Search callback", params, cb);
					var searchQuery = params.text;
					// Convert our simple dictionary of `colors` above to a list of objects to pass into the call to `SearchClient.register()`
					// See: https://documentation.finsemble.com/tutorial-Search.html#receiving-a-search-request
					cb(
						null,
						Object.entries(colors)
							.filter(
								(color) =>
									searchQuery.toLowerCase() === "colors" || color[0].toLowerCase().startsWith(searchQuery.toLowerCase())
							)
							.map(([colorName, colorHex]) => {
								return {
									name: colorName, // Display name = name of color itself
									score: colorName.toLowerCase().startsWith(searchQuery.toLowerCase())
										? 1.0 - searchQuery.length / colorName.length
										: 100, // 0: match, 1: no match
									type: "color", // Arbitrary
									description: `The color ${colorName}`, // Arbitrary
									actions: [
										// List of clickable actions & parameters for this search provider that are available for each search result. Pass different data in for each result.
										{ name: "Launch", colorName: colorName, colorHex: colorHex },
										{ name: "Set", colorName: colorName, colorHex: colorHex },
									],
								};
							})
					);
				},
				// This callback happens when the user clicks any custom action under this search provider.
				itemActionCallback: (params) => {
					console.log("Item Action callback", params);
					const { item, action } = params;
					// Which action was clicked?
					if (action.name === "Launch") {
						// Launch a `colorComponent` for the search result that was clicked.
						Finsemble.Clients.LauncherClient.spawn(
							"colorComponent",
							{
								data: {
									colorName: action.colorName,
									colorHex: action.colorHex,
								},
							},
							console.log
						);
					} else if (action.name === "Set") {
						// Record the search result that was clicked, for later use.
						this.currentColor.colorName = action.colorName;
						this.currentColor.colorHex = action.colorHex;
					}
				},
				// This callback happens when the user clicks the title of this search provider.
				providerActionTitle: "Launch Current Color",
				providerActionCallback: (params) => {
					console.log("Provider Action callback", params);
					// Launch a `colorComponent` for the search result that was most recently "Set"
					Finsemble.Clients.LauncherClient.spawn(
						"colorComponent",
						{
							data: {
								colorName: this.currentColor.colorName,
								colorHex: this.currentColor.colorHex,
							},
						},
						console.log
					);
				},
			},
			console.log
		);
	}
}

// eslint-disable-next-line new-cap
const serviceInstance = new colorSearchProviderService();

serviceInstance.start();
module.exports = serviceInstance;