const Finsemble = require("@chartiq/finsemble");
const RouterClient = Finsemble.Clients.RouterClient;
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
	var historyDataArray = []


	//You can implement your code to call your own API
	this.getHistoryData = function () {
		return historyDataArray;
	}

	/**
	 * Creates a router endpoint for you service. 
	 * Add query responders, listeners or pub/sub topic as appropriate. 
	 * @private
	 */
	this.createRouterEndpoints = function () {
		//Example router integration which uses a single query responder to expose multiple functions
		RouterClient.addResponder("demoServiceResponder", function (error, queryMessage) {
			if (!error) {
				if (queryMessage.data.action === "getHistoryData") {
					try {
						queryMessage.sendQueryResponse(null, self.getHistoryData());
					} catch (err) {
						queryMessage.sendQueryResponse(err);
					}
				} else if (queryMessage.data.action === "sendOrderData") {
					try {
						var data = queryMessage.data.data;
						Logger.log("demoService receive the following data through demoTransmitChannel2:", data)
						queryMessage.sendQueryResponse(null, {result:'success'});
					} catch (err) {
						queryMessage.sendQueryResponse(err, {result:'error'});
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

	this.onDataArrive = function (data){
		// Put data into the array
		historyDataArray.push(data)
		// Send the data using router client
		RouterClient.transmit("demoDataStreamChannel", data);
	}

	/* 
		Get dummy data at a certain time inteval
	*/
	this.createDemoDataStream = function () {
		setInterval(function () {
			var tempdata = self.getExternalData();
			self.onDataArrive(tempdata)
		}, 5000);
	}


	this.getExternalData = function () {
		//Implement your own code to get your own data 
		//This could a RestfulAPI or ws, etc...
		//For demo purpose, here will only send dummy random data
		return {
			symbol: 'CIQ',
			price: Math.round((Math.random() * 100) * 100) / 100,
			dt: new Date().getTime()
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
	serviceInstance.createDemoDataStream();
	serviceInstance.createListener()
	Logger.log("demo Service ready");
	callback();
});

serviceInstance.start();
module.exports = serviceInstance;