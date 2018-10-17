const Finsemble = require("@chartiq/finsemble");
const RouterClient = Finsemble.Clients.RouterClient;
const Logger = Finsemble.Clients.Logger;
Logger.start();
Logger.log("elasticsearch Service starting up");

const SearchClient = Finsemble.Clients.SearchClient;
SearchClient.initialize();

const LauncherClient = Finsemble.Clients.LauncherClient;
LauncherClient.initialize();

const MAX_RESULTS = 10;
// set up elasticsearch creds
// hosted env //
const es_host='https://312c4b4380a917e48285f26bfa568a1b.eu-west-1.aws.found.io:9243';
const es_creds='ZWxhc3RpY3JlYWRvbmx5OmVsYXN0aWNyZWFkb25seQ==';

// Add and initialize any other clients you need to use 
//   (services are initialised by the system, clients are not)
// let StorageClient = Finsemble.Clients.StorageClient;
// StorageClient.initialize();

/**
 * 
 * @constructor
 */
function elasticsearchService() {
	const self = this;

	this.providerSearchFunction = function(params, callback) {
		var results = [];
	
		let today = new Date();
		let lastMonth = new Date(today.getTime());
		lastMonth.setMonth(today.getMonth()-1);
		unix_startDate=lastMonth.getTime();
		unix_endDate=today.getTime();
		
		company_name = {
			"aapl" : "Apple",
			"msft" : "Microsoft",
			"cldr" : "Cloudera",
			"mdb" :	"MongoDB",
			"hdp" : "Hortonworks",
			"splk" : "Splunk",
			"googl" : "Google"
		}

		let symbol = null;
		let titleQuery = params.text.toLowerCase(); 
		if (company_name[titleQuery]) {
			symbol = titleQuery;
			titleQuery = company_name[titleQuery];
		}

		var es_query = {
			"size" : 100,
			"sort": [{
				"@timestamp": {
					"order": "desc",
					"unmapped_type": "boolean"
				}
			}],
			"query": {
				"bool": {
					"must": [{
						"query_string": {
							"analyze_wildcard": true,
							"query": "title:*" + titleQuery + "*"
						}
					}, {
						"range": {
							"@timestamp": {
								"gte": unix_startDate,
								"lte": unix_endDate,
								"format": "epoch_millis"
							}
						}
					}]
				}
			}
		}
		es_query = JSON.stringify(es_query);

		var xhr = new XMLHttpRequest();
		xhr.withCredentials = true;

		xhr.addEventListener("readystatechange", function() {
			if (this.readyState === 4) {
				if (this.status === 200) {

					var data = JSON.parse(this.responseText);
					var news_articles = data['hits']['hits'];

					var chartiq_article = [];
					for (var i = 0; i < Math.min(news_articles.length, MAX_RESULTS); i++) {
						results.push({
							//Your return results to the callback should be an array of the following:
							// {
							// 	name: resultName, // This should be the value you want displayed
							// 	score: resultScore, // This is used to help order search results from multiple providers
							// 	type: "Application", // The type of data your result returns
							// 	description: "Your description here",
							// 	actions: [{ name: "Spawn" }], // Actions can be an array of actions 
							// 	tags: [] // This can be used for adding additional identifying information to your result
							// };

							name: news_articles[i]['_source']['title'],
							score: news_articles[i].score, // This is used to help order search results from multiple providers
							type: "Application", // The type of data your result returns
							description: news_articles[i]['_source']['description'] + " Link to article: <a target='_blank' href='" + news_articles[0]['_source']['url'] + "'>here</a> Source: " + news_articles[0]['_source']['source'],
							actions: [{ name: "Spawn" }], // Actions can be an array of actions 
							tags: [], // This can be used for adding additional identifying information to your result
							symbol: symbol,
							source: news_articles[0]['_source']['url']
						});	
					}

				} else {}

				callback(null,results); // The first argument is an error;

			}
		});

		xhr.open("POST", es_host + "/news-*/_search");
		if (es_creds.length > 0){
			xhr.setRequestHeader("authorization", "Basic " + es_creds);
		}
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(es_query);
	}

	this.searchResultActionCallback = function(params) {
		console.log("Spawning chart with params: ", params);
		if (params.item.symbol) {
			LauncherClient.spawn("Advanced Chart", {data: {symbol: params.item.symbol}, addToWorkspace: true});
		} else {
			LauncherClient.spawn("blank", {data: {url: params.item.source}, addToWorkspace: true});
		}
	}

	//providerActionCallback
	this.providerActionCallback = function() {
		LauncherClient.spawn("Elastic Advanced Chart", {});
	}

	return this;
};

elasticsearchService.prototype = new Finsemble.baseService({
	startupDependencies: {
		// add any services or clients that should be started before your service
		services: ["searchService"],
		clients: [/* "storageClient" */]
	}
});
const serviceInstance = new elasticsearchService('elasticsearchService');

serviceInstance.onBaseServiceReady(function (callback) {
	
	SearchClient.register(
		{
			name: "ElasticSearch News Provider", // The name of the provider 
			searchCallback : serviceInstance.providerSearchFunction, // A function called when a search is initialized 
			itemActionCallback: serviceInstance.searchResultActionCallback, // (optional) A function that is called when an item action is fired  
			providerActionTitle: "ElasticSearch chart", // (optional) A function that is called when a provider action is fired
			providerActionCallback: serviceInstance.providerActionCallback // (optional) The title of the provider action
		},
		function (err) {
			console.log("Registration succeeded");
		}
	);

	Logger.log("elasticsearch Service ready");
	callback();
});

serviceInstance.start();
module.exports = serviceInstance;