
let elements = {};

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

		window.elements = elements;
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

let channels = {};

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
configuredUrlOrPath: ${configuredUrlOrPath}
currentUrl:          ${currentUrl}
`
	}
}

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

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}