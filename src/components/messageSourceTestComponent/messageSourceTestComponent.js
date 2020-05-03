//references to UI elements
let elements = {};
//references to listen/transmit channel listeners
let channels = {};
//reference to query/response responders
let responderChannels = {};
//reference to pubSubResponderTopics
let pubSubResponderTopics = {};
//reference to pubSubSubscriberTopics
let pubSubSubscriberTopics = {};
//reference to linker dataTypes
let linkerDataTypes = {};


//-----------------------------------------------------------------------------------------
//Utility functions for getting details of message senders
const clientNameToWindowName = (clientName) => {
	let index = clientName.indexOf(".");
	if (index > -1) {
		return clientName.substring(index + 1);
	} else {
		return clientName;
	}
};

const windowNameToDescriptor = async (windowName) => {
	let resp = await FSBL.Clients.LauncherClient.getActiveDescriptors();
	if (resp.err) {
		console.error("Failed to retrieve active descriptors! Error: ", resp.err);
		return null;
	} else {
		if (resp.data[windowName]) {
			return resp.data[windowName];
		} else {
			console.error(`No active descriptor for windowName '${windowName}'`, resp.err);
			return null;
		}
	}
};

const windowIdentifierToCurrentURL = async (windowIdentifier) => {
	try {
		let resp = await FSBL.FinsembleWindow.getInstance(windowIdentifier);
		if (resp.err) {
			console.error("Failed to retrieve Finsemble Window! windowIdentifier: ", windowIdentifier, "Error: ", resp.err);
			return null;
		} else {
			return await new Promise(
				(resolve, reject) => {
					resp.wrap.getOptions((err, options) => {
						if (err) {
							reject(err);
						} else {
							resolve(options.url);
						}
					});
				}
			);
		}
	} catch (err) {
		console.error("Error occurred while trying to establish current URL! windowIdentifier: ", windowIdentifier, "Error: ", err);
		return null;
	}
};

const componentTypeToConfiguration = async (componentType) => {
	let resp = await FSBL.Clients.LauncherClient.getComponentDefaultConfig(componentType);
	if (resp.err) {
		console.error(`Failed to retrieve config for component type '${componentType}'! Error: `, resp.err);
		return null;
	} else {
		return resp.data;
	}
};

const getSenderDetails = async (origin) => {
	let windowName = clientNameToWindowName(origin);
	let windowDescriptor = await windowNameToDescriptor(windowName);
	let componentType = null, componentConfig = null, configuredUrlOrPath = null, spawnedWithUrl = null, currentUrl = null;
	if (windowDescriptor) {
		componentType = windowDescriptor.componentType;
		spawnedWithUrl = windowDescriptor.url ? windowDescriptor.url : windowDescriptor.path;
		componentConfig = componentType ? await componentTypeToConfiguration(componentType) : null;
		if (componentConfig) {
			configuredUrlOrPath = componentConfig.window.url ? componentConfig.window.url : componentConfig.window.path;
		} else {
			configuredUrlOrPath = null;
		}
	}
	if (componentType && windowName) {
		currentUrl = await windowIdentifierToCurrentURL({ componentType: componentType, windowName: windowName });
	}

	return {
		origin,
		windowName,
		componentType,
		configuredUrlOrPath,
		spawnedWithUrl,
		currentUrl
	};
};

const renderSenderDetails = (senderDetails, myClientName, lastClient) => {
	return `last client:         ${senderDetails.lastClient}
origin:              ${senderDetails.origin == myClientName ? "here" : senderDetails.origin}
windowName:          ${senderDetails.windowName}
componentType:       ${senderDetails.componentType}
config URL Or path:  ${senderDetails.configuredUrlOrPath}
spawned URL Or path: ${senderDetails.spawnedWithUrl}
current URL:         ${senderDetails.currentUrl}
	`;
};

//-----------------------------------------------------------------------------------------
//Ready function that sets up the form
const FSBLReady = () => {
	try {
		
		elements.ltHeader = document.getElementById("listenTransmitHeading");
		elements.ltColumn = document.getElementById("listenTransmitCol");
		elements.qrHeader = document.getElementById("queryResponseHeading");
		elements.qrColumn = document.getElementById("queryResponseCol");
		elements.linkerHeader = document.getElementById("linkerHeading");
		elements.linkerColumn = document.getElementById("linkerCol");
		elements.pubSubHeader = document.getElementById("pubSubHeading");
		elements.pubSubColumn = document.getElementById("pubSubCol");

		elements.headers = [elements.ltHeader, elements.qrHeader, elements.linkerHeader, elements.pubSubHeader];
		elements.columns = [elements.ltColumn, elements.qrColumn, elements.linkerColumn, elements.pubSubColumn];

		//Listen tranmit elements
		elements.listenersList = document.getElementById("listeners");
		elements.receivedMessage = document.getElementById("receivedMessage");
		elements.messageEnvelope = document.getElementById("messageEnvelope");
		elements.senderDetails = document.getElementById("senderDetails");
		elements.listenChannel = document.getElementById("channel");

		elements.transmitChannel = document.getElementById("transmitChannel");
		elements.transmitContent = document.getElementById("transmitContent");

		//query response elements
		elements.respondersList = document.getElementById("responders");

		elements.qrReceivedQuery = document.getElementById("qrReceivedQuery");
		elements.qrQueryEnvelope = document.getElementById("qrQueryEnvelope");
		elements.qrQuerySenderDetails = document.getElementById("qrQuerySenderDetails");

		elements.qrReceivedResponse = document.getElementById("qrReceivedResponse");
		elements.qrResponseEnvelope = document.getElementById("qrResponseEnvelope");
		elements.qrResponseSenderDetails = document.getElementById("qrResponseSenderDetails");

		elements.responderChannel = document.getElementById("responderChannel");

		elements.queryChannel = document.getElementById("queryChannel");
		elements.queryContent = document.getElementById("queryContent");

		//pub sub elements
		elements.pubSubRespondersList = document.getElementById("pubSubRespondersList");
		elements.pubSubSubscribersList = document.getElementById("pubSubSubscribersList");

		elements.pubSubReceivedMessage = document.getElementById("pubSubReceivedMessage");
		elements.pubSubMessageEnvelope = document.getElementById("pubSubMessageEnvelope");
		elements.pubSubSenderDetails = document.getElementById("pubSubSenderDetails");

		elements.pubSubSubscriberReceivedMessage = document.getElementById("pubSubSubscriberReceivedMessage");

		elements.pubSubResponderChannel = document.getElementById("pubSubResponderChannel");
		elements.pubSubSubscriberChannel = document.getElementById("pubSubSubscriberChannel");
		
		elements.pubSubPublishChannel = document.getElementById("pubSubPublishChannel");
		elements.pubSubPublishContent = document.getElementById("pubSubPublishContent");



		//linker elements
		elements.dataTypesList = document.getElementById("dataTypes");
		elements.linkerReceivedMessage = document.getElementById("linkerReceivedMessage");
		elements.linkerMessageEnvelope = document.getElementById("linkerMessageEnvelope");
		elements.linkerSenderDetails = document.getElementById("linkerSenderDetails");
		elements.linkerDataType = document.getElementById("datatype");

		elements.linkerPublishDataType = document.getElementById("linkerPublishDataType");
		elements.linkerPublishContent = document.getElementById("linkerPublishContent");

		window.elements = elements;
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

//-----------------------------------------------------------------------------------------
//UI functions related to listen/transmit
const  listenHandlerFn = async (err, response) => {
	if (err) {
		elements.receivedMessage.value = "Error: " + JSON.stringify(err, null, 4);
	} else {
		elements.receivedMessage.value = JSON.stringify(response.data, null, 4);
		elements.messageEnvelope.value = JSON.stringify(response.header, null, 4);
		let origin = response.header.origin;
		
		let myClientName = FSBL.Clients.RouterClient.getClientName();
		let senderDetails = await getSenderDetails(origin);
		elements.senderDetails.value = renderSenderDetails(senderDetails, myClientName, response.header.lastClient);
	}
}

window.listen = () => {
	let channel = elements.listenChannel.value;
	if (!channels[channel]) {
		FSBL.Clients.RouterClient.addListener(channel, listenHandlerFn);
		channels[channel] = listenHandlerFn;
		
		let li = document.createElement("li");
		li.id = "li_listen_" + channel;
		li.appendChild(document.createTextNode(channel));

		let removeButton = document.createElement("button");
		removeButton.className = "removeButton";
		removeButton.textContent = " X ";
		removeButton.onclick = (e) => {
			e.preventDefault();
			window.removeListener(channel);
		};

		li.appendChild(removeButton);

		elements.listenersList.appendChild(li);

	} else {
		console.warn(`Already listening to channel '${channel}', ignoring...`);
	}
}

window.removeListener = (channel) => {
	if (channels[channel]) { 
		FSBL.Clients.RouterClient.removeListener(channel, channels[channel]);
		
		let element = document.getElementById("li_listen_" + channel);
		if (element) {
			elements.listenersList.removeChild(element);
		}
		delete channels[channel];
	}
}

window.transmit = () => {
	FSBL.Clients.RouterClient.transmit(transmitChannel.value, transmitContent.value);
	console.log(`Transmitted to channel: ${transmitChannel.value}\nMessage: ${transmitContent.value}`);
}

//-----------------------------------------------------------------------------------------
//UI functions related to query/response
const queryHandlerFn = async (err, queryMessage) => {
	if (err) {
		elements.qrReceivedQuery.value = "Error: " + JSON.stringify(err, null, 4);
		
	} else {
		elements.qrReceivedQuery.value = JSON.stringify(queryMessage.data, null, 4);
		elements.qrQueryEnvelope.value = JSON.stringify(queryMessage.header, null, 4);
		let origin = queryMessage.header.origin;

		let myClientName = FSBL.Clients.RouterClient.getClientName();
		let senderDetails = await getSenderDetails(origin);
		elements.qrQuerySenderDetails.value = renderSenderDetails(senderDetails, myClientName, queryMessage.header.lastClient);

		//respond to query
		var response="Back at ya: " + JSON.stringify(queryMessage.data); // Responses can be objects or strings
		queryMessage.sendQueryResponse(null, response); // The callback must respond, else a timeout will occur on the querying client.
	}
}

const responseHandlerFn = async (err, response) => {
	if (err) {
		elements.qrReceivedResponse.value = "Error: " + JSON.stringify(err, null, 4);
	} else {
		elements.qrReceivedResponse.value = JSON.stringify(response.data, null, 4);
	}
	//render results anyway
	elements.qrResponseEnvelope.value = JSON.stringify(response.header, null, 4);
	let origin = response.header.origin;
	let myClientName = FSBL.Clients.RouterClient.getClientName();
	let senderDetails = await getSenderDetails(origin);
	elements.qrResponseSenderDetails.value = renderSenderDetails(senderDetails, myClientName, response.header.lastClient);
}

window.addResponder = () => {
	let channel = elements.responderChannel.value;
	if (!responderChannels[channel]) {
		FSBL.Clients.RouterClient.addResponder(channel, queryHandlerFn);
		responderChannels[channel] = responseHandlerFn;
		
		let li = document.createElement("li");
		li.id = "li_queryResponse_" + channel;
		li.appendChild(document.createTextNode(channel));

		let removeButton = document.createElement("button");
		removeButton.className = "removeButton";
		removeButton.textContent = " X ";
		removeButton.onclick = (e) => {
			e.preventDefault();
			window.removeResponder(channel);
		};

		li.appendChild(removeButton);

		elements.respondersList.appendChild(li);

	} else {
		console.warn(`Already responding to channel '${channel}', ignoring...`);
	}
}

window.removeResponder = (channel) => {
	if (responderChannels[channel]) { 
		FSBL.Clients.RouterClient.removeResponder(channel);
		
		let element = document.getElementById("li_queryResponse_" + channel);
		if (element) {
			elements.respondersList.removeChild(element);
		}
		delete responderChannels[channel];
	}
}

window.query = () => {
	FSBL.Clients.RouterClient.query(queryChannel.value, queryContent.value, responseHandlerFn);
	console.log(`Queried  channel: ${queryChannel.value}\nMessage: ${queryContent.value}`);
}


//-----------------------------------------------------------------------------------------
//UI functions related to pub/sub
const pubSubSubscribeHandlerFn = async (err, response) => {
	if (err) {
		elements.pubSubSubscriberReceivedMessage.value = "Error: " + JSON.stringify(err, null, 4);
	} else {
		elements.pubSubSubscriberReceivedMessage.value = JSON.stringify(response.data, null, 4);	}
}

const pubSubPublishHandlerFn = async (err, response) => {
	if (err) {
		elements.pubSubReceivedMessage.value = "Error: " + JSON.stringify(err, null, 4);
	} else {
		elements.pubSubReceivedMessage.value = JSON.stringify(response.data, null, 4);
		elements.pubSubMessageEnvelope.value = JSON.stringify(response.header, null, 4);
		let origin = response.header.origin;

		let myClientName = FSBL.Clients.RouterClient.getClientName();
		let senderDetails = await getSenderDetails(origin);
		elements.pubSubSenderDetails.value = renderSenderDetails(senderDetails, myClientName, response.header.lastClient);

		//publish on to the pubSub topic
		response.sendNotifyToAllSubscribers(null, response.data);
	}
}

window.addPubSubResponder = () => {
	let topic = elements.pubSubResponderChannel.value;
	if (!pubSubResponderTopics[topic]) {
		FSBL.Clients.RouterClient.addPubSubResponder(topic, { "State": "start" },
			{
				publishCallback: pubSubPublishHandlerFn,
			});
		pubSubResponderTopics[topic] = pubSubPublishHandlerFn;

		let li = document.createElement("li");
		li.id = "li_pubSubResponder_" + topic;
		li.appendChild(document.createTextNode(topic));

		let removeButton = document.createElement("button");
		removeButton.className = "removeButton";
		removeButton.textContent = " X ";
		removeButton.onclick = (e) => {
			e.preventDefault();
			window.removePubSubResponder(topic);
		};

		li.appendChild(removeButton);

		elements.pubSubRespondersList.appendChild(li);

	} else {
		console.warn(`Already responding to topic '${topic}', ignoring...`);
	}
}

window.removePubSubResponder = (topic) => {
	if (pubSubResponderTopics[topic]) {
		FSBL.Clients.RouterClient.removePubSubResponder(topic);

		let element = document.getElementById("li_pubSubResponder_" + topic);
		if (element) {
			elements.pubSubRespondersList.removeChild(element);
		}
		delete pubSubResponderTopics[topic];
	}
}

window.pubSubSubscribe = () => {
	let topic = elements.pubSubSubscriberChannel.value;
	if (!pubSubSubscriberTopics[topic]) {
		let subscriberId = FSBL.Clients.RouterClient.subscribe(topic, pubSubSubscribeHandlerFn);
		pubSubSubscriberTopics[topic] = subscriberId;

		let li = document.createElement("li");
		li.id = "li_pubSubSubscriber_" + topic;
		li.appendChild(document.createTextNode(topic));

		let removeButton = document.createElement("button");
		removeButton.className = "removeButton";
		removeButton.textContent = " X ";
		removeButton.onclick = (e) => {
			e.preventDefault();
			window.pubSubUnsubscribe(topic);
		};

		li.appendChild(removeButton);

		elements.listenersList.appendChild(li);

	} else {
		console.warn(`Already subscribing to pubSub topic '${topic}', ignoring...`);
	}
}

window.pubSubUnsubscribe = (topic) => {
	if (pubSubSubscriberTopics[topic]) {
		FSBL.Clients.RouterClient.unsubscribe({ topic: topic, subscribeID: pubSubSubscriberTopics[topic] } );

		let element = document.getElementById("li_pubSubSubscriber_" + topic);
		if (element) {
			elements.listenersList.removeChild(element);
		}
		delete pubSubSubscriberTopics[topic];
	}
}

window.pubSubPublish = () => {
	FSBL.Clients.RouterClient.publish(pubSubPublishChannel.value, pubSubPublishContent.value);
	console.log(`Transmitted to channel: ${pubSubPublishChannel.value}\nMessage: ${pubSubPublishContent.value}`);
}



//-----------------------------------------------------------------------------------------
//UI functions related to the Linker
const linkerSubscribeHandlerFn = async (data, envelope) => {
	elements.linkerReceivedMessage.value = JSON.stringify(data, null, 4);
	elements.linkerMessageEnvelope.value = JSON.stringify(envelope, null, 4);
	let origin = envelope.header.origin;

	let myClientName = FSBL.Clients.RouterClient.getClientName();
	let senderDetails = await getSenderDetails(origin);
	elements.linkerSenderDetails.value = renderSenderDetails(senderDetails, myClientName, envelope.header.lastClient);

}

window.linkerSubscribe = () => {
	let dataType = elements.linkerDataType.value;
	if (!linkerDataTypes[dataType]) {
		FSBL.Clients.LinkerClient.subscribe(dataType, linkerSubscribeHandlerFn);
		linkerDataTypes[dataType] = linkerSubscribeHandlerFn;

		let li = document.createElement("li");
		li.id = "li_linker_" + dataType;
		li.appendChild(document.createTextNode(dataType));

		let removeButton = document.createElement("button");
		removeButton.className = "removeButton";
		removeButton.textContent = " X ";
		removeButton.onclick = (e) => {
			e.preventDefault();
			window.linkerUnsubscribe(dataType);
		};

		li.appendChild(removeButton);

		elements.dataTypesList.appendChild(li);

	} else {
		console.warn(`Already subscribed to data type '${dataType}', ignoring...`);
	}
}

window.linkerUnsubscribe = (dataType) => {
	if (linkerDataTypes[dataType]) {
		FSBL.Clients.LinkerClient.unsubscribe(dataType);

		let element = document.getElementById("li_linker_" + dataType);
		if (element) {
			elements.dataTypesList.removeChild(element);
		}
		delete linkerDataTypes[dataType];
	}
}

window.linkerPublish = () => {
	FSBL.Clients.LinkerClient.publish({ dataType: linkerPublishDataType.value, data: linkerPublishContent.value });
	console.log(`Transmitted to channel: ${linkerPublishDataType.value}\nMessage: ${linkerPublishContent.value}`);
}

//-----------------------------------------------------------------------------------------
//Util functions for controlling which form is displayed
const displayType = (heading, column) => {
	elements.headers.forEach(aHeader => {
		if (aHeader != heading) {
			aHeader.className = "heading";
		}
	});
	heading.className = "heading active";
	
	elements.columns.forEach(aColumn => {
		if (aColumn != column) {
			aColumn.className = "column hidden";
		}
	});
	column.className = "column";
}

window.displayListenTransmit = () => {
	displayType(elements.ltHeader,elements.ltColumn);
}

window.displayQueryResponse = () => {
	displayType(elements.qrHeader, elements.qrColumn);
}

window.displayLinker = () => {
	displayType(elements.linkerHeader, elements.linkerColumn);
}

window.displayPubSub = () => {
	displayType(elements.pubSubHeader, elements.pubSubColumn);
}

window.clearTransmit = () => {
	//Listen tranmit elements
	//elements.listenersList - don't clear listeners just form elements
	elements.receivedMessage.value = "";;
	elements.messageEnvelope.value = "";
	elements.senderDetails.value = "";
	elements.listenChannel.value = "";

	elements.transmitChannel.value = "";
	elements.transmitContent.value = "";
}

window.clearQuery = () => {
	//query response elements
	//elements.respondersList - don't clear responders just form elements

	elements.qrReceivedQuery.value = "";
	elements.qrQueryEnvelope.value = "";
	elements.qrQuerySenderDetails.value = "";

	elements.qrReceivedResponse.value = "";
	elements.qrResponseEnvelope.value = "";
	elements.qrResponseSenderDetails.value = "";

	elements.responderChannel.value = "";

	elements.queryChannel.value = "";
	elements.queryContent.value = "";
}

window.clearLinkerPublish = () => {
	elements.linkerReceivedMessage.value = "";
	elements.linkerMessageEnvelope.value = "";
	elements.linkerSenderDetails.value = "";
	elements.linkerDataType.value = "";

	elements.linkerPublishDataType.value = "";
	elements.linkerPublishContent.value = "";
}

window.clearPubSub = () => {
	elements.pubSubReceivedMessage.value = "";
	elements.pubSubMessageEnvelope.value = "";
	elements.pubSubSenderDetails.value = "";

	elements.pubSubSubscriberReceivedMessage.value = "";

	elements.pubSubResponderChannel.value = "";
	elements.pubSubSubscriberChannel.value = "";

	elements.pubSubPublishChannel.value = "";
	elements.pubSubPublishContent.value = "";
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}