
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

const listenHandlerFn = (err, response) => {
	if (err) {
		elements.receivedMessage.value = "Error: " + JSON.stringify(err, null, 4);
	} else {
		elements.receivedMessage.value = JSON.stringify(response.data, null, 4);
		elements.messageEnvelope.value = JSON.stringify(response.header, null, 4);
		elements.senderDetails.value = 
`origin:          ${response.header.origin}
originated here: ${response.header.origin == FSBL.Clients.RouterClient.getClientName()}
last client:     ${response.header.lastClient}
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