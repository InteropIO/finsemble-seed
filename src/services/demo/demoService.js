const Finsemble = require("@chartiq/finsemble");
const RouterClient = Finsemble.Clients.RouterClient;
const DistributedStoreClient = Finsemble.Clients.DistributedStoreClient;
const Logger = Finsemble.Clients.Logger;
Logger.start();
Logger.log("demo Service starting up");

// Add and initialize any other clients you need to use 
//   (services are initialised by the system, clients are not)
// let StorageClient = Finsemble.Clients.StorageClient;
// StorageClient.initialize();

/**
 * 
 * @constructor
 */
function demoService() {
	const self = this;
	var store


	//You can implement your code to call your own API
	this.CallDemoAPI = function () {
		return "API Called";
	}

	/**
	 * Creates a router endpoint for you service. 
	 * Add query responders, listeners or pub/sub topic as appropriate. 
	 * @private
	 */
	this.createRouterEndpoints = function () {
		//Example router integration which uses a single query responder to expose multiple functions
		RouterClient.addResponder("demo functions", function (error, queryMessage) {
			if (!error) {
				Logger.log('demo Query: ' + JSON.stringify(queryMessage));

				if (queryMessage.data.query === "CallDemoAPI") {
					try {
						queryMessage.sendQueryResponse(null, self.CallDemoAPI());
					} catch (err) {
						queryMessage.sendQueryResponse(err);
					}
				} else {
					queryMessage.sendQueryResponse("Unknown demo query function: " + queryMessage, null);
					Logger.error("Unknown demo query function: ", queryMessage);
				}
			} else {
				Logger.error("Failed to setup demo query responder", error);
			}
		});
	};

	/*
		Create demo distributed store
	*/
	this.createDistributedStore = function () {
		DistributedStoreClient.createStore({
				store: "demoStore",
				global: true,
				values: {
					demoItem1: {},
					demoItem2: {}
				}
			},
			function (err, storeObject) {
				self.store = storeObject
				Logger.log("Distributed Store has been created")
			}
		);
	}

	/* 
		Get dummy data at a certain time inteval
		Put the dummy data into the distributed store
	*/
	this.createDemoGetData = function () {
		setInterval(function () {
			self.store.setValue({
				field: "demoItem1",
				value: self.getExternalData()
			}, function (err) {
				Logger.log("Distributed Store has been updated")
			});
		}, 10000);
	}


	this.getExternalData = function () {
		//Implement your own code to get your own data 
		//This could a RestfulAPI or ws, etc...
		//For demo purpose, here will only send dummy random data

		return {
			symbol: 'CIQ',
			price: Math.round((Math.random() * 100) * 100) / 100,
			dt: new Date()
		}
	}

	this.createListener = function () {
		RouterClient.addListener("demoTransmitChannel2", function (error, response) {
			if (error) {
				Logger.error(error)
			} else {
				var data = response.data;
				Logger.log("demoService receive the following data through demoTransmitChannel2:", data)
			}
		});
	}


	return this;
};

demoService.prototype = new Finsemble.baseService({
	startupDependencies: {
		// add any services or clients that should be started before your service
		services: [ /* "dockingService", "authenticationService" */ ],
		clients: [ /*"routerClient", "distributedStoreClient"*/ ]
	}
});
const serviceInstance = new demoService('demoService');

serviceInstance.onBaseServiceReady(function (callback) {
	serviceInstance.createRouterEndpoints();
	serviceInstance.createDistributedStore();
	serviceInstance.createDemoGetData();
	serviceInstance.createListener()
	Logger.log("demo Service ready");
	callback();
});

serviceInstance.start();
module.exports = serviceInstance;