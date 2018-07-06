(() => {
	"use strict";

	/**
	 * Used to keep track of the data type to determine whether a change needs to be published.
	 */
	let currentDataType;

	/**
	 * The dataType element
	 */
	let dataType;

	/**
	 * The data element
	 */
	let data;

	/**
	 * The send button
	 */
	let sendButton;

	/**
	 * The received element
	 */
	let received;

	/**
	 * Function to handle data received over the linker.
	 * 
	 * @param {any} data 
	 */
	const printOutput = (title, data) => {
		// Add received data to text field.
		const titleDiv = document.createElement("div");
		titleDiv.className = "title";
		titleDiv.appendChild(document.createTextNode(title));

		const dataBody = document.createElement("pre");
		dataBody.innerHTML = data;

		received.appendChild(titleDiv);
		received.appendChild(dataBody);
	};

	/**
	 * Initializes element variables when content is loaded.
	 */
	const contentLoadedHandler = () => {
		dataType = document.getElementById("dataType");
		data = document.getElementById("data");
		sendButton = document.getElementById("send");
		received = document.getElementById("received");

		// Set initial value from what is in the form
		currentDataType = dataType.value;
	};

	/**
	 * Handles the callback for getComponentState
	 * @param {*} err 
	 * @param {*} state 
	 */
	const componentStateHandler = (err, state) => {
		if (err) {
			FSBL.Clients.Logger.error(err);
			return;
		}

		if (!state || state === null) {
			// State not defined, return.
			return;
		}

		dataType.value = state.dataType ? state.dataType : "symbol";
		data.value = state.data ? state.data : "AAPL";
	};

	/**
	 * Handles when data is received from the linker.
	 * @param {*} data 
	 */
	const dataTypeReceivedHandler = (data) => {
		printOutput("Data received:", data);
	}

	/**
	 * Handles when the data type changes.
	 */
	const dataTypeChangedHandler = () => {
		// Did dataType change?
		if (currentDataType != dataType.value) {
			// Unsubscribe from old dataType
			FSBL.Clients.LinkerClient.unsubscribe(currentDataType);

			// Update current data type and subscribe to it.
			currentDataType = dataType.value;
			FSBL.Clients.LinkerClient.subscribe(currentDataType, dataTypeReceivedHandler);

			// Update component state
			FSBL.Clients.WindowClient.setComponentState({ field: "dataType", value: currentDataType });
		}
	};

	/**
	 * Handles when the data changes.
	 */
	const dataChangedHandler = () => {
		FSBL.Clients.WindowClient.setComponentState({ field: "data", value: data.value });
	};

	const sendClickHandler = () => {
		// Build object to publish
		const obj = {
			dataType: dataType.value,
			data: data.value
		}

		// Print it to the output
		printOutput("Publishing", JSON.stringify(obj, null, "\t"));

		// Publish data to linker channel
		FSBL.Clients.LinkerClient.publish(obj);
	}

	/**
	 * Handles the Finsemble onReady event.
	 */
	const onReadyHandler = () => {
		// Read component state
		FSBL.Clients.WindowClient.getComponentState({ fields: ["dataType", "data"], }, componentStateHandler);

		// Subscribe to default topic.
		FSBL.Clients.LinkerClient.subscribe(currentDataType, dataTypeReceivedHandler);

		// Listen for changes
		dataType.onblur = dataTypeChangedHandler;
		data.onblur = dataChangedHandler;

		// Listen for click event to end data
		sendButton.onclick = sendClickHandler;
	};

	document.addEventListener("DOMContentLoaded", contentLoadedHandler);

	FSBL.addEventListener("onReady", onReadyHandler);
})()