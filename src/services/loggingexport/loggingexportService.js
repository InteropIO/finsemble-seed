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



class LoggingExportService extends Finsemble.baseService {

	// #region Settings
/** Transmit queued messages when their number reaches or exceeds this amount. */
	BATCH_SIZE = 100;

/** Wait at most this number of milliseconds after first message in batch is received before transmitting.*/
	TIMEOUT_MILLISECS = 30 * 1000;

/** Wait at most this number of milliseconds for batch transmission to complete */
	TRANSMIT_TIMEOUT_MILLISECS = 10 * 1000;

/** Log levels of messsages to capture. Valid values: Error, Warning, Log, Info, Debug, Verbose */
	CAPTURE_LOG_LEVELS = {
	"Log": true,
	"Warn": true,
	"Error": true
};

/** Log categories of messages to capture. Valid values: system, dev or perf */
	CAPTURE_LOG_CATEGORIES = {
	"system": true,
	"dev": true
};

/**
 * Value indicating whether log messages should be sorted by timestamp.
 *
 * Note that, due to the async nature of logging, you might still send a later batch containing messages with a lower
 * logTimestamp. Hence, it is best to avoid sorting messages in this service if messages will be sorted elsewhere.
 */
	SORT_MESSAGES = false;

/** Where to transmit the logs to. */
//TODO: Update to your logging endpoint
	LOGGING_ENDPOINT = "http://somedomain.com/loggingendpoint";

	constructor() {
		super({
			// Declare any client dependencies that must be available before your service starts up.
			startupDependencies: {
				clients: [],
			}
		});

		this.batchAllocSize = this.BATCH_SIZE + 10;   //add a small amount of leeway on batch size

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
		// start listening for logs
		this.centralLoggerLogConsumer();
		Finsemble.Clients.Logger.log("customService Service ready");
		callback();
	}
	/**
	 * Message formatting function which converts each log message from Finsemble's format to the format you wish to transmit.
	 */
	formatMessage(logMessage) {
		/* Example Incoming log message format:
*		[
*			{
*				"category": "system",				//Log message type: system, dev or perf
*				"logClientName": "Finsemble",		//The registered name of the logger instance
*				"logType": "Log",					//Log level: Error, Warning, Log, Info, Debug, Verbose
*				"logData": "[\"SERVICE LIFECYCLE: STATE CHANGE: Service initializing\",\"windowService\"]",
*													//JSON encoded array of message and data components of the log message
*													//N.B. maybe be prefixed by string "*** Logging Error: ""
*				"logTimestamp": 1544090028391.6226	//Log message timestamp for ordering use
*			},
*			{...},
*			...
*		]
*/

		//TODO: add any necessary message format changes here
		return logMessage;
	}

	/**
 * Add an incoming array of log messages to the batch and transmit if thresholds met.
 * @private
 */
	addToBatch(dataArr) {
		if (dataArr) {
			for (let i = 0; i < dataArr.length; i++) {
				const message = dataArr[i];

				// only capture the log messages that meet the category and type we set
				if (this.CAPTURE_LOG_CATEGORIES[message.category] && this.CAPTURE_LOG_LEVELS[message.logType]) {
					this.logBatch[this.currBatchSize++] = this.formatMessage(message);
				}
				else {
					// skip the logs that don't meet the requirements
					console.debug("discarding message", message);
				}
			}

			if (this.currBatchSize >= this.BATCH_SIZE) {
				this.transmitBatch();
			} else if (!this.timeout) { //always transmit batch within minimum this.timeout
				this.timeout = setTimeout(this.transmitBatch, this.TIMEOUT_MILLISECS);
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
		if (toTransmit) {
			toTransmit.splice(this.currBatchSize, this.logBatch.length - this.currBatchSize);
		}

		//reset
		this.timeout = null;
		this.logBatch = new Array(this.batchAllocSize);
		this.currBatchSize = 0;

		// Sort the batch by timestamp if necessary.
		if (this.SORT_MESSAGES) {
			toTransmit.sort((a, b) => a.logTimestamp - b.logTimestamp);
		}

		//transmit batch
		//TODO: Customize batch transmission here
		console.debug("Batch to transmit: " + JSON.stringify(toTransmit, null, 2));

		// the call to your endpoint here
		fetch(this.LOGGING_ENDPOINT, {
			method: 'POST', // or 'PUT'
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				logMessages: toTransmit
			}),
			credentials: 'include'
		})
			.then(response => response.json())
			.then(data => {
				console.log('Success:', data);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}

	/**
	 * Create a router listener for log messages.
	 * @private
	 */
	centralLoggerLogConsumer() {
		// collect the logs from the central logger and send them to be processed
		Finsemble.Clients.RouterClient.addListener("logger.service.logMessages", (error, logMessage) => {
			if (!error) {
				this.addToBatch(logMessage.data);
			} else {
				Logger.error("Failed to setup LoggingExportService listener", error);
			}
		});
	}
}

const serviceInstance = new LoggingExportService();

serviceInstance.start();
