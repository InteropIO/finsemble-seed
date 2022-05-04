/** Transmit queued messages when their number reaches or exceeds this amount. */
const BATCH_SIZE = 100;

/** Wait at most this number of milliseconds after first message in batch is received before transmitting.*/
const TIMEOUT_MILLISECS = 30 * 1000;

/** Wait at most this number of milliseconds for batch transmission to complete */
const TRANSMIT_TIMEOUT_MILLISECS = 10 * 1000;

/** Log levels of messages to capture. Valid values: Error, Warning, Log, Info, Debug, Verbose */
CAPTURE_LOG_LEVELS = {
	"Verbose": false,
	"Debug": false,
	"Info": false,
	"Log": true,
	"Warn": true,
	"Error": true
};

/** Log categories of messages to capture. Valid values: system, dev or perf */
CAPTURE_LOG_CATEGORIES = {
	"system": true,
	"dev": true,
	"perf": false
};

// Batch allocation size (add a small amount of leeway on batch size)
const BATCH_ALLOC_SIZE = BATCH_SIZE + 10;

// The timeout handle (from setTimeout)
let timeout = null;
// The batch of log messages to send
let logBatch = new Array(BATCH_ALLOC_SIZE);
// The current batch size
let currBatchSize = 0;


/**
 * Value indicating whether log messages should be sorted by timestamp.
 *
 * Note that, due to the async nature of logging, you might still send a later batch containing messages with a lower
 * logTimestamp. Hence, it is best to avoid sorting messages in this service if messages will be sorted elsewhere.
 */
SORT_MESSAGES = false;

/**
 * Message formatting function which converts each log message from Finsemble's format to the format you wish to transmit.
 */
const formatMessage = (logMessage) => {
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

	// TODO: add any necessary message format changes here
	return logMessage;
};

/**
 * Transmit the batch to the remote log collection endpoint.
 */
const transmitBatch = () => {
	clearTimeout(timeout);

	// Trim batch array to length
	let toTransmit = logBatch;
	if (toTransmit) {
		toTransmit.splice(currBatchSize, logBatch.length - currBatchSize);
	}

	// Reset
	timeout = null;
	logBatch = new Array(BATCH_ALLOC_SIZE);
	currBatchSize = 0;

	// Sort the batch by timestamp if necessary.
	if (SORT_MESSAGES) {
		toTransmit.sort((a, b) => a.logTimestamp - b.logTimestamp);
	}

	// TODO: Customize batch transmission here
	console.debug("batch to transmit: " + JSON.stringify(toTransmit, null, 2));
	// TODO: Update to your logging endpoint
	// LOGGING_ENDPOINT = "http://somedomain.com/loggingendpoint";
	//
	// fetch(LOGGING_ENDPOINT, {
	// 	method: 'POST', // or 'PUT'
	// 	headers: {
	// 		'Content-Type': 'application/json',
	// 	},
	// 	body: JSON.stringify({
	// 		logMessages: toTransmit
	// 	}),
	// 	credentials: 'include'
	// })
	// 	.then(response => response.json())
	// 	.then(data => {
	// 		console.log('Success:', data);
	// 	})
	// 	.catch((error) => {
	// 		console.error('Error:', error);
	// 	});
	console.debug("transmitted log batch");
}

/**
 * Add an incoming array of log messages to the batch and transmit if thresholds met.
 */
const addToBatch = (dataArr) => {
	if (dataArr) {
		for (let i = 0; i < dataArr.length; i++) {
			const message = dataArr[i];

			// only capture the log messages that meet the category and type we set
			if (CAPTURE_LOG_CATEGORIES[message.category] && CAPTURE_LOG_LEVELS[message.logType]) {
				logBatch[currBatchSize++] = formatMessage(message);
			}
			else {
				// skip the logs that don't meet the requirements
				console.debug("discarding message", message);
			}
		}

		if (currBatchSize >= BATCH_SIZE) {
			transmitBatch();
		} else if (!timeout) {
			// Always transmit batch within timeout
			timeout = setTimeout(transmitBatch, TIMEOUT_MILLISECS);
		}
	} else {
		console.warn("tried to add an invalid data array to log batch", dataArr);
	}
}

const FSBLReady = () => {
	try {

		/**
		 * Create a router listener for log messages.
		 */
		const centralLoggerLogConsumer = () => {
			// Collect the logs from the central logger and send them to be processed
			FSBL.Clients.RouterClient.addListener("logger.service.logMessages", (error, logMessage) => {
				if (!error) {
					addToBatch(logMessage.data);
				} else {
					FSBL.Clients.Logger.error("Failed to setup LoggingExportService listener", error);
				}
			});
		}

		// Start the consumer
		centralLoggerLogConsumer();
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
};

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}
