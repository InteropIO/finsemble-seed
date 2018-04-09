//replace with import when ready
const Finsemble = require("@chartiq/finsemble");
const SearchClient = Finsemble.Clients.SearchClient;
const RouterClient = Finsemble.Clients.RouterClient;
const baseService = Finsemble.baseService;
const Logger = Finsemble.Clients.Logger;
Logger.start();
SearchClient.initialize();
let scripts = require("./scripts.json");
//[ 'episode_num', 'air_date', 'text', 'title' ]
/**
 * The seinfeld Service houses the seinfeld search provider.
 * @constructor
 */
function seinfeldService() {

	var self = this;

	/**
	 * Search provider for seinfeld episodes. Searches through scripts for text in the search box.
	 */
	this.createSearchProvider = function () {
		var onSearchRequested = (params, callback) => {
			let resultItems = scripts.filter((script) => script.text.toLowerCase().includes(params.text.toLowerCase()))
			let results = resultItems.map(item => {
				let ret = {
					name: `#${item.episode_num}. ${item.title.replace("Script", " ").trim()}`,
					title: item.title,
					score: 100,
					matchs: [],
					type: "Seinfeld Episode",
					description: `Episode #${item.episode_num}. Aired ${item.air_date}`,
					actions: [{ name: "spawn" }],
					tags: [],
				}
				return ret;
			})
			callback(null, results); // The first argument is an error;
		};

		var onSearchResultClicked = (params) => {
			let url = "http://www.seinfeldscripts.com/";
			let { item } = params;
			let episodeTitle = item.title.replace(/\s/g, "").replace("Script", "").trim();
			url += episodeTitle + ".htm";
			//This website has funky URLs. Some are htm, some are html. Episodes with "Part" in the name are a crapshoot too. This is the best way to get most of them. The catch just adds "l" so it looks for an html file.
			fetch(url)
				.then(response => {
					fin.desktop.System.openUrlWithBrowser(url);
				})
				.catch(e => {
					fin.desktop.System.openUrlWithBrowser(url + "l");
				})
		};

		SearchClient.register({
			name: "Seinfeld Search Provider",
			searchCallback: onSearchRequested,
			itemActionCallback: onSearchResultClicked
		}, () => {
			console.log("Registered Search", arguments);
		})
	}
	return this;
}
seinfeldService.prototype = new baseService({
	startupDependencies: {
		clients: ["searchClient"]
	}
});
var serviceInstance = new seinfeldService('seinfeldService');

serviceInstance.onBaseServiceReady(function (callback) {
	console.debug("onConnectionCompleteCalled");
	serviceInstance.createSearchProvider();
	callback();
});


serviceInstance.start();
module.exports = serviceInstance;