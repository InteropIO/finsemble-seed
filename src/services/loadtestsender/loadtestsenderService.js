const Finsemble = require("@chartiq/finsemble");
const RouterClient = Finsemble.Clients.RouterClient;
const DistributedStoreClient = Finsemble.Clients.DistributedStoreClient
const Logger = Finsemble.Clients.Logger;
Logger.start();
Logger.log("loadtestsender Service starting up");

// Add and initialize any other clients you need to use 
//   (services are initialised by the system, clients are not)
// let StorageClient = Finsemble.Clients.StorageClient;
// StorageClient.initialize();

/**
 * 
 * @constructor
 */
function loadtestsenderService() {
	const self = this;
	let testStore

	this.createTestEndpoint = function () {
		//Create ds
		var values = {
			data: {
				
			}
		};

		DistributedStoreClient.createStore({
				store: "testDs",
				global: true,
				values: values
			},
			function (err, storeObject) {
				Logger.log("testDs created", storeObject)
				testStore = storeObject
			}
		);

		RouterClient.addListener('StartDsTestChannel', (err, message) => {
			if (err != null) {
				Finsemble.Clients.Logger.error(err)
			} else {
				let param = message.data
				this.distributedStoreTest(param.source, param.dataSize, param.testDuration, param.burstInterval, param.burstCount, param.msgGroupCount)
			}
		})
	}

	this.distributedStoreTest = function (source, dataSize, testDuration, burstInterval, burstCount, msgGroupCount) {
		let messageCounter = 0

		let testData = "";
		for (let i = 0; i < dataSize; i++) {
			testData = testData.concat("X");
		}

		let startMsg = {
			testState: "start",
			dataSize: dataSize,
			testDuration: testDuration,
			burstInterval: burstInterval,
			burstCount: burstCount,
			senderStartTime: new Date(),
			messageCounter: 0,
			source: source
		}
		testStore.setValue({ field: "data", value: startMsg }, function(err) {});


		let timerID = setInterval(() => {
			let msgGroup = []
			for (let i = 0; i < burstCount; i++) {
				messageCounter++
				let testRecord = {
					testState: "continuing",
					dataSize: dataSize,
					testDuration: testDuration,
					burstInterval: burstInterval,
					burstCount: burstCount,
					startTime: new Date(),
					messageCounter: messageCounter,
					testData: testData,
					source: source,
					dt: new Date().getTime()
				};
				msgGroup.push(testRecord)
				if (msgGroup.length == msgGroupCount) {
					testStore.setValue({ field: "data", value: msgGroup }, function(err) {});
					msgGroup = []
				}
			}

			let timeDiff = new Date() - startMsg.senderStartTime;
			if (timeDiff > startMsg.testDuration) {
				clearInterval(timerID);
				let endMsg = {
					testState: "done"
				}
				testStore.setValue({ field: "data", value: endMsg }, function(err) {
					RouterClient.transmit("EndDsTestChannel", {state:'end'});
				});
			}
		}, startMsg.burstInterval);
	}

	return this;
};

loadtestsenderService.prototype = new Finsemble.baseService({
	startupDependencies: {
		// add any services or clients that should be started before your service
		services: [ /* "dockingService", "authenticationService" */ ],
		clients: [ /* "storageClient" */ ]
	}
});
const serviceInstance = new loadtestsenderService('loadtestsenderService');

serviceInstance.onBaseServiceReady(function (callback) {
	serviceInstance.createTestEndpoint();
	Logger.log("loadtestsender Service ready");
	callback();
});

serviceInstance.start();
module.exports = serviceInstance;