//replace with import when ready
const Finsemble = require("@chartiq/finsemble");
const SearchClient = Finsemble.Clients.SearchClient;
const RouterClient = Finsemble.Clients.RouterClient;
const BaseService = Finsemble.baseService;
const Logger = Finsemble.Clients.Logger;
const UserNotification = Finsemble.UserNotification;

const scripts = require("./scripts.json");

Logger.start();
SearchClient.initialize();

/**
 * The seinfeld Service houses the seinfeld search provider.
 */
class SeinfeldService extends BaseService {
	/**
	 * Initializes a new instance of the SeinfeldService class.
 	 * @constructor
	 */
	constructor() {
		super({
			startupDependencies: {
				clients: ["searchClient"]
			}
		});
	}

	/**
	 * Search provider for seinfeld episodes. Searches through scripts for text in the search box.
	 */
	createSearchProvider() {
		const onSearchRequested = (params, callback) => {
			const resultItems = scripts.filter((script) => {
				// Partial search on title
				let includesTitle = script.title.toLowerCase().includes(params.text.toLowerCase());
				if (includesTitle) return true;
				// Whole word search on text
				let includesText = script.text.toLowerCase().includes(params.text.toLowerCase() + " ");
				return includesText;
			});
			const results = resultItems.map(item => {
				const ret = {
					name: `#${item.episode_num}. ${item.title.replace("Script", " ").trim()}`,
					title: item.title,
					score: 100,
					type: "Seinfeld Episode",
					description: `Episode #${item.episode_num}. Aired ${item.air_date}`,
					actions: [{ name: "spawn" }],
					tags: []
				};

				return ret;
			});

			callback(null, results); // The first argument is an error;
		};

		const onSearchResultClicked = (params) => {
			const { item } = params;

			const episodeTitle = item.title
				.replace("Script", "")
				.replace("Part 1", "")
				.replace("Part 2", "")
				.trim()
				.replace(/\s/g, "_");
			const url = `https://en.wikipedia.org/wiki/${episodeTitle}`;
			UserNotification.alert("dev", "ALWAYS", "Opening Browser", "Enjoy");

			// Check whether page exists
			fetch(url)
				.then(() => {
					// It exists open it
					fin.desktop.System.openUrlWithBrowser(url);
				})
				.catch(() => {
					// disambiguation page, so make it the Seinfeld page
					fin.desktop.System.openUrlWithBrowser(`${url}_(Seinfeld)`);
				});
		};

		SearchClient.register({
			name: "Seinfeld Search Provider",
			searchCallback: onSearchRequested,
			itemActionCallback: onSearchResultClicked
		}, () => {
			console.log("Registered Search", arguments);
		});
	}
}

const serviceInstance = new SeinfeldService("seinfeldService");

serviceInstance.onBaseServiceReady((callback) => {
	console.debug("onConnectionCompleteCalled");
	serviceInstance.createSearchProvider();
	callback();
});

serviceInstance.start();

module.exports = serviceInstance;