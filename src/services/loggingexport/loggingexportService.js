/**
 * Simple log export service example which captures messages of specified categories and levels
 * and transmits them to a remote API in batch, once a certain batch size or this.timeout is reached.
 *
 * The service will come up as soon as possible during finsemble startup - but will inevitably
 * not be able to capture some of the earliest log messages.
 *
 * Look for //TODO: comments for where to customize the service to your needs
 *
 * N.B. Be wary of adding too many Logger messages within this service as it will of course receive
 * back to transmit onwards.
 */

const Finsemble = require("@finsemble/finsemble-core");

Finsemble.Clients.Logger.start();
Finsemble.Clients.Logger.log("customService Service starting up");


// #region Settings
/** Transmit queued messages when their number reaches or exceeds this amount. */
const BATCH_SIZE = 100;

/** Wait at most this number of milliseconds after first message in batch is received before transmitting.*/
const TIMEOUT_MILLISECS = 30 * 1000;

/** Wait at most this number of milliseconds for batch transmission to complete */
const TRANSMIT_TIMEOUT_MILLISECS = 10 * 1000;

/** Log levels of messsages to capture. Valid values: Error, Warning, Log, Info, Debug, Verbose */
const CAPTURE_LOG_LEVELS = {
  "Log": true,
  "Warn": true,
  "Error": true
};

/** Log categories of messages to capture. Valid values: system, dev or perf */
const CAPTURE_LOG_CATEGORIES = {
  "system": true,
  "dev": true
};

/**
 * Value indicating whether log messages should be sorted by timestamp.
 *
 * Note that, due to the async nature of logging, you might still send a later batch containing messages with a lower
 * logTimestamp. Hence, it is best to avoid sorting messages in this service if messages will be sorted elsewhere.
 */
const SORT_MESSAGES = false;

// Add and initialize any other clients you need to use (services are initialized by the system, clients are not):
// Finsemble.Clients.AuthenticationClient.initialize();
// Finsemble.Clients.ConfigClient.initialize();
// Finsemble.Clients.DialogManager.initialize();
// Finsemble.Clients.DistributedStoreClient.initialize();
// Finsemble.Clients.DragAndDropClient.initialize();
// Finsemble.Clients.LauncherClient.initialize();
// Finsemble.Clients.LinkerClient.initialize();
// Finsemble.Clients.HotkeyClient.initialize();
// Finsemble.Clients.SearchClient.initialize();
// Finsemble.Clients.StorageClient.initialize();
// Finsemble.Clients.WindowClient.initialize();
// Finsemble.Clients.WorkspaceClient.initialize();

/**
 * Add service description here
 */
class customService extends Finsemble.baseService {
	/**
	 * Initializes a new instance of the customServiceService class.
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
					// "searchClient
					// "storageClient",
					// "windowClient",
					// "workspaceClient",
				],
			},
		});

		this.batchAllocSize = BATCH_SIZE + 10;   //add a small amount of leeway on batch size

		this.timeout = null;
		this.logBatch = new Array(this.batchAllocSize); //pre-init the batch array to reduce array allocations
		this.currBatchSize = 0;

		this.readyHandler = this.readyHandler.bind(this);

		this.onBaseServiceReady(this.readyHandler);
	}

  /**
   * Fired when the service is ready for initialization
   * @param {function} callback
   */
	readyHandler(callback) {
		this.createRouterEndpoints();
		Finsemble.Clients.Logger.log("customService Service ready");
		callback();
	}


  /**
 * Add an incoming array of log messages to the batch and transmit if thresholds met.
 * @private
 */
	addToBatch(dataArr) {
    if (dataArr) {
			for (let i = 0; i < dataArr.length; i++) {
				if (CAPTURE_LOG_CATEGORIES[dataArr[i].category] && CAPTURE_LOG_LEVELS[dataArr[i].logType]) {
					this.logBatch[this.currBatchSize++] = FORMAT_MESSAGE(dataArr[i]);
        }
        else {
					console.debug("discarding message", dataArr[i]);
        }
      }

			if (this.currBatchSize >= BATCH_SIZE) {
				this.transmitBatch();
			} else if (!this.timeout) { //always transmit batch within minimum this.timeout
				this.timeout = setTimeout(this.transmitBatch, TIMEOUT_MILLISECS);
      }
    } else {
      Logger.warn("Tried to add an invalid data array to log batch", dataArr);
    }
  }

  /**
 * Transmit the batch to the remote log collection endpoint.
 * @private
 */
	transmitBatch() {
		clearTimeout(this.timeout);
    //trim batch array to length
		let toTransmit = this.logBatch;
		toTransmit.splice(this.currBatchSize, this.logBatch.length - this.currBatchSize);

    //reset
		this.timeout = null;
		this.logBatch = new Array(batchAllocSize);
		this.currBatchSize = 0;

    // Sort the batch by timestamp if necessary.
    if (SORT_MESSAGES) {
      toTransmit.sort((a, b) => a.logTimestamp - b.logTimestamp);
    }

    //transmit batch
    //TODO: Customize batch transmission here
    console.debug("Batch to transmit: " + JSON.stringify(toTransmit, null, 2));

		console.log(JSON.stringify({
      logMessages: toTransmit
		}))


		// fetch(this.LOGGING_ENDPOINT, {
		//   method: 'POST', // or 'PUT'
		//   headers: {
		//     'Content-Type': 'application/json',
		//   },
		//   body: JSON.stringify({
		//     logMessages: toTransmit
		//   }),
		//   credentials: 'include'
		// })
		//   .then(response => response.json())
		//   .then(data => {
		//     console.log('Success:', data);
		//   })
		//   .catch((error) => {
		//     console.error('Error:', error);
		//   });
	}

  /**
   * Create a router listener for log messages.
   * @private
   */
	createRouterEndpoints() {
		// Add responder for myFunction
		RouterClient.addListener("logger.service.logMessages", (error, logMessage) => {
      if (!error) {
				this.addToBatch(logMessage.data);
      } else {
        Logger.error("Failed to setup LoggingExportService listener", error);
      }
		});
	}
}

const serviceInstance = new customService();

serviceInstance.start();
