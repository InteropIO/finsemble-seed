//replace with import when ready
const Finsemble = require("@chartiq/finsemble");

// var RouterClient = Finsemble.Clients.RouterClient;
const baseService = Finsemble.baseService;
// var util = Finsemble.Util;

function setup() {

}

/**
 * The testfsbl Service receives calls from the testfsblClient.
 * @constructor
 */
function testfsblService() {
	const self = this;
	let fsblReady = false;
	let serviceReady = false;
	
	this.setFsblReady = function () {
		fsblReady = true;
		if (fsblReady && serviceReady) {
			this.setup();
		}
	}
	this.setServiceReady = function () {
		serviceReady = true;
		if (fsblReady && serviceReady) {
			this.setup();
		}
	}

	//searchCallback
	this.providerSearchFunction = function(params, callback) {
		let results = [
			{
				name: "Test search result", // This should be the value you want displayed
				score: 100, // This is used to help order search results from multiple providers
				type: "Application", // The type of data your result returns
				description: "Test descriptive data",
				actions: [{ name: "Spawn" }], // Actions can be an array of actions 
				tags: [] // This can be used for adding additional identifying information to your result
			}
		];
		callback(null,results); // The first argument is an error;
	}
	//Your return results to the callback should be an array of the following:
	
	//itemActionCallback
	this.searchResultActionCallback = function(params) {
		/*
		params is equal to 
		{
			item:resultItem,
			action:{name:"Spawn"}
		}
		*/
		FSBL.UserNotification.alert("dev", "ALWAYS", "my-search-notification", "Clicked on search result: " + params.item.name);
	}
	
	//providerActionCallback
	this.providerActionCallback = function() {
		FSBL.UserNotification.alert("dev", "ALWAYS", "my-search-notification", "Clicked on search provider: TEST FSBL Search Provider");
	}

	this.setup = function () {
		//do things with FSBL in here.
		const RouterClient = FSBL.Clients.RouterClient;
		const HotkeyClient = FSBL.Clients.HotkeyClient;
		const SearchClient = FSBL.Clients.SearchClient;
		const Logger = FSBL.Clients.Logger;

		Logger.log("Setting up test FSBL service...");
		
		//Setup a RouterClient query responder to expose service functions
		RouterClient.addResponder("test FSBL server", function(error, queryMessage) {
			if (!error) {
				if (queryMessage.data.query === "myFunction") {
					queryMessage.sendQueryResponse(null, serviceInstance.myFunction());
				} else {
					queryMessage.sendQueryResponse("Unknown query function: " + queryMessage, null);
					Logger.error("Unknown query function: ", queryMessage);
				}
			} else {
				Logger.error("Failed to setup query responder", error);
			}
		});

		//register a global hotkey
		Logger.log("Registering hotkey...");
		const keyMap = FSBL.Clients.HotkeyClient.keyMap,
		keys = [keyMap.ctrl, keyMap.shift, keyMap.t];
		function onHotkeyTriggered (err, response) {
			if(err){
				return Logger.error(err);
			}
			FSBL.Clients.LauncherClient.spawn("testFsblComponent");
		}
		// If there's a problem registering, it will come through this function. (e.g., you pass in a bad key).
		function onHotkeyRegistered (err, response) {
			if(err){
				return Logger.error(err);
			}
		}
		HotkeyClient.addGlobalHotkey(keys, onHotkeyTriggered, onHotkeyRegistered);

		//register another hotkey that pops a notification
		const keys2 = [keyMap.ctrl, keyMap.shift, keyMap.u];
		function onHotkey2Triggered (err, response) {
			if(err){
				return Logger.error(err);
			}
			FSBL.UserNotification.alert("dev", "ALWAYS", "my-test-notification", { description: "My what a fine notification!", title: "triggered from a hotkey in a service!" });
		}
		HotkeyClient.addGlobalHotkey(keys2, onHotkey2Triggered, onHotkeyRegistered);


		//register a search provider

		

		SearchClient.register(
			{
				name: "TEST FSBL Search Provider",
				searchCallback: serviceInstance.providerSearchFunction,
				itemActionCallback: serviceInstance.searchResultActionCallback,	
				providerActionCallback: serviceInstance.providerActionCallback,
				providerActionTitle: "Test FSBL service"
			},
			function (err) {
				console.log("TEST FSBL Search Provider registration succeeded");
			});

		Logger.log("test FSBL service ready");
	};

	return this;
}

testfsblService.prototype = new baseService({
    startupDependencies: {
        //clients: ["distributedStoreClient"],
        services: ["authenticationService", "routerService", "hotkeyService", "searchService"]
    },
    shutdownDependencies: {
        //services: ["distributedStoreService", "storageService"]
    }
});

let serviceInstance = new testfsblService('testfsblService');

serviceInstance.onBaseServiceReady(function (callback) {
	serviceInstance.setServiceReady ();
});
FSBL.addEventListener('onReady', function () {
	serviceInstance.setFsblReady();
});

serviceInstance.start();
