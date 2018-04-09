//replace with import when ready
var Finsemble = require("@chartiq/finsemble");
const SearchClient = Finsemble.Clients.SearchClient;
SearchClient.initialize();
var RouterClient = Finsemble.Clients.RouterClient;
var baseService = Finsemble.baseService;
var util = Finsemble.Util;
//[ 'episode_num', 'air_date', 'text', 'title' ]
let scripts = require("./scripts.json");
/**
 * The seinfeld Service receives calls from the seinfeldClient.
 * @constructor
 */
function seinfeldService() {

	var self = this;
	/**
	 * Creates router endpoints for all of our client APIs. Add servers or listeners for requests coming from your clients.
	 * @private
	 */
	this.createRouterEndpoints = function () {

	};
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
			fin.desktop.System.openUrlWithBrowser(url);
		}
		SearchClient.register({
			name: "Seinfeld Search Provider",
			searchCallback: onSearchRequested,
			itemActionCallback: onSearchResultClicked,
			providerActionTitle: "Seinfeld Episodes",
			providerActionCallback: function () {
				debugger;
				console.log("ACTION CALLBACK", arguments);
			}
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
const Logger = Finsemble.Clients.Logger;
Logger.start();
serviceInstance.onBaseServiceReady(function (callback) {
	console.debug("onConnectionCompleteCalled");
	serviceInstance.createRouterEndpoints();
	serviceInstance.createSearchProvider();

	callback();
});


serviceInstance.start();
module.exports = serviceInstance;