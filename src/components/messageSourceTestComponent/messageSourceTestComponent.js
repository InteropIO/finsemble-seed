//references to UI elements
let elements = {};
//references to listen/transmit channel listeners
let channels = {};
//reference to query/response responders
let responderChannels = {};

//Util functions for getting details of message senders
const clientNameToWindowName = (clientName) => {
	let index = clientName.indexOf(".");
	if (index > -1) {
		return clientName.substring(index+1);
	} else {
		return clientName;
	}
}

const  windowNameToDescriptor = async (windowName) => {
	let resp = await FSBL.Clients.LauncherClient.getActiveDescriptors();
	if (resp.err) {
		console.error("Failed to retrieve active descriptors! Error: ", resp.err);
		return null;
	} else { 
		if (resp.data[windowName]){
			return resp.data[windowName];
		} else {
			console.error(`No active descriptor for windowName '${windowName}'`, resp.err);
			return null;
		}
	}
}

const componentTypeToConfiguration = async (componentType) => {
	let resp = await FSBL.Clients.LauncherClient.getComponentDefaultConfig(componentType);
	if (resp.err) {
		console.error(`Failed to retrieve config for component type '${componentType}'! Error: `, resp.err);
		return null;
	} else { 
		return resp.data;
	}
}

//Ready function that sets up the form
const FSBLReady = () => {
	try {
		
		elements.ltHeader = document.getElementById("listenTransmitHeading");
		elements.ltColumn = document.getElementById("listenTransmitCol");
		elements.qrHeader = document.getElementById("queryResponseHeading");
		elements.qrColumn = document.getElementById("queryResponseCol");

		elements.headers = [elements.ltHeader, elements.qrHeader];
		elements.columns = [elements.ltColumn, elements.qrColumn];

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

		window.elements = elements;
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

//UI functions related to listen/transmit
const  listenHandlerFn = async (err, response) => {
	if (err) {
		elements.receivedMessage.value = "Error: " + JSON.stringify(err, null, 4);
	} else {
		elements.receivedMessage.value = JSON.stringify(response.data, null, 4);
		elements.messageEnvelope.value = JSON.stringify(response.header, null, 4);
		let myClientName = FSBL.Clients.RouterClient.getClientName();
		let origin = response.header.origin;
		let windowName = clientNameToWindowName(origin);
		let windowDescriptor = await windowNameToDescriptor(windowName);
		let componentType = null, componentConfig = null, configuredUrlOrPath = null, currentUrl = null;
		if (windowDescriptor) {
			componentType = windowDescriptor.componentType;
			currentUrl = windowDescriptor.url;
			componentConfig = componentType ? await componentTypeToConfiguration(componentType) : null;
			if (componentConfig) {
				configuredUrlOrPath =  componentConfig.window.url ? componentConfig.window.url : componentConfig.window.path;
			} else { 
				configuredUrlOrPath = null; 
			}
		}

		elements.senderDetails.value = 
`last client:         ${response.header.lastClient}
origin:              ${response.header.origin == myClientName ? "here" : origin }
windowName:          ${windowName}
componentType:       ${componentType}
config URL Or path:  ${configuredUrlOrPath}
spawned with URL:    ${currentUrl}
`
	}
}

window.listen = () => {
	let channel = elements.listenChannel.value;
	if (!channels[channel]) {
		FSBL.Clients.RouterClient.addListener(channel, listenHandlerFn);
		channels[channel] = listenHandlerFn;
		
		let li = document.createElement("li");
		li.id = "li_" + channel;
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
		
		let element = document.getElementById("li_" + channel);
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


//UI functions related to query/response
const  queryHandlerFn = async (err, queryMessage) => {
	if (err) {
		elements.qrReceivedQuery.value = "Error: " + JSON.stringify(err, null, 4);
		
	} else {
		elements.qrReceivedQuery.value = JSON.stringify(queryMessage.data, null, 4);
		elements.qrQueryEnvelope.value = JSON.stringify(queryMessage.header, null, 4);
		let myClientName = FSBL.Clients.RouterClient.getClientName();
		let origin = queryMessage.header.origin;
		let windowName = clientNameToWindowName(origin);
		let windowDescriptor = await windowNameToDescriptor(windowName);
		let componentType = null, componentConfig = null, configuredUrlOrPath = null, currentUrl = null;
		if (windowDescriptor) {
			componentType = windowDescriptor.componentType;
			currentUrl = windowDescriptor.url;
			componentConfig = componentType ? await componentTypeToConfiguration(componentType) : null;
			if (componentConfig) {
				configuredUrlOrPath =  componentConfig.window.url ? componentConfig.window.url : componentConfig.window.path;
			} else { 
				configuredUrlOrPath = null; 
			}
		}

		elements.qrQuerySenderDetails.value = 
`last client:         ${queryMessage.header.lastClient}
origin:              ${queryMessage.header.origin == myClientName ? "here" : origin }
windowName:          ${windowName}
componentType:       ${componentType}
config URL Or path:  ${configuredUrlOrPath}
spawned with URL:    ${currentUrl}
`
		//respond to query
		var response="Back at ya: " + JSON.stringify(queryMessage.data); // Responses can be objects or strings
		queryMessage.sendQueryResponse(null, response); // The callback must respond, else a timeout will occur on the querying client.
	}
}

const  responseHandlerFn = async (err, response) => {
	if (err) {
		elements.qrReceivedResponse.value = "Error: " + JSON.stringify(err, null, 4);
	} else {
		elements.qrReceivedResponse.value = JSON.stringify(response.data, null, 4);
	}
	//render results anyway
	elements.qrResponseEnvelope.value = JSON.stringify(response.header, null, 4);
	let myClientName = FSBL.Clients.RouterClient.getClientName();
	let origin = response.header.origin;
	let windowName = clientNameToWindowName(origin);
	let windowDescriptor = await windowNameToDescriptor(windowName);
	let componentType = null, componentConfig = null, configuredUrlOrPath = null, currentUrl = null;
	if (windowDescriptor) {
		componentType = windowDescriptor.componentType;
		currentUrl = windowDescriptor.url;
		componentConfig = componentType ? await componentTypeToConfiguration(componentType) : null;
		if (componentConfig) {
			configuredUrlOrPath =  componentConfig.window.url ? componentConfig.window.url : componentConfig.window.path;
		} else { 
			configuredUrlOrPath = null; 
		}
	}

	elements.qrResponseSenderDetails.value = 
`last client:         ${response.header.lastClient}
origin:              ${response.header.origin == myClientName ? "here" : origin }
windowName:          ${windowName}
componentType:       ${componentType}
config URL Or path:  ${configuredUrlOrPath}
spawned with URL:    ${currentUrl}
`

}

window.addResponder = () => {
	let channel = elements.responderChannel.value;
	if (!responderChannels[channel]) {
		FSBL.Clients.RouterClient.addResponder(channel, queryHandlerFn);
		responderChannels[channel] = responseHandlerFn;
		
		let li = document.createElement("li");
		li.id = "li_" + channel;
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
		
		let element = document.getElementById("li_" + channel);
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
	displayType(elements.qrHeader,elements.qrColumn);
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

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}