(() => {
	"use strict";

	document.addEventListener("DOMContentLoaded", () => {
		// #region Elements
		const dataType = document.getElementById("dataType");
		const data = document.getElementById("data");
		const sendButton = document.getElementById("send");
		const received = document.getElementById("received");
		// #endregion

		let currentDataType = dataType.value;

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
			dataBody.innerText = JSON.stringify(data, null, "&#9;").replace("\n", "<br/>");

			received.appendChild(titleDiv);
			received.appendChild(dataBody);
		};

		FSBL.addEventListener("onReady", () => {
			// Read component state
			FSBL.Clients.WindowClient.getComponentState(
				{
					fields: [
						"dataType",
						"data"
					],
				},
				(err, state) => {
					console.log(state);
					if (err) {
						FSBL.Clients.Logger.error(err);
						return;
					}

					if (!state || state === null) {
						return;
					}

					dataType.value = state.dataType ? state.dataType : "symbol";
					data.value = state.data ? state.data : "AAPL";
				});

			// Subscribe to default topic.
			FSBL.Clients.LinkerClient.subscribe(currentDataType, (data) => printOutput("Data received:", data));

			// Listen for data type changes
			dataType.onblur = () => {
				// Did dataType change?
				if (currentDataType != dataType.value) {
					// Unsubscribe from old dataType
					FSBL.Clients.LinkerClient.unsubscribe(currentDataType);

					// Update current data type and subscribe to it.
					currentDataType = dataType.value;
					FSBL.Clients.LinkerClient.subscribe(currentDataType, (data) => printOutput("Data received:", data));

					FSBL.Clients.WindowClient.setComponentState({ field: "dataType", value: currentDataType });
				}
			};

			data.onblur = () => {
				FSBL.Clients.WindowClient.setComponentState({ field: "data", value: data.value });
			};

			// Listen for click event to end data
			sendButton.onclick = () => {
				// Build object to publish
				const obj = {
					dataType: dataType.value,
					data: data.value
				}

				// Print it to the output
				printOutput("Publishing", JSON.stringify(obj, null, "\t"));

				// Publish data to linker channel
				FSBL.Clients.LinkerClient.publish(obj);
			};
		});
	});
})()