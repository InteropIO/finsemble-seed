const FSBLReady = () => {
	try {
		// Do things with FSBL in here.
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

let channels = {};

const listenHandlerFn = (err, response) => {
	let receivedMessage = document.getElementById("receivedMessage");
	let messageEnvelope = document.getElementById("messageEnvelope");
	let senderDetails = document.getElementById("senderDetails");
	
	if (err) {
		receivedMessage.value = "Error: " + JSON.stringify(err, null, 4);
	} else {
		receivedMessage.value = JSON.stringify(response.data, null, 4);
		messageEnvelope.value = JSON.stringify(response.header, null, 4);
		senderDetails.value = 
`origin:          ${response.header.origin}
originated here: ${response.header.origin == FSBL.Clients.RouterClient.getClientName()}
last client:     ${response.header.lastClient}
`
	}
}

window.listen = () => {
	let channel = document.getElementById("channel").value;
	
	if (!channels[channel]) {
		FSBL.Clients.RouterClient.addListener(channel, listenHandlerFn);
		channels[channel] = listenHandlerFn;
		let listenersList = document.getElementById("listeners");
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

		listenersList.appendChild(li);

	} else {
		console.warn(`Already listening to channel '${channel}', ignoring...`);
	}
}

window.removeListener = (channel) => {
	if (channels[channel]) { 
		FSBL.Clients.RouterClient.removeListener(channel, channels[channel]);
		let listenersList = document.getElementById("listeners");
		let element = document.getElementById("li_" + channel);
		if (element) {
			listenersList.removeChild(element);
		}
		delete channels[channel];
	}
}

window.transmit = () => {
	let channel = document.getElementById("transmitChannel").value;
	let messageContent = document.getElementById("transmitContent").value;
	FSBL.Clients.RouterClient.transmit(channel, messageContent);
	console.log(`Transmitted to channel: ${channel}\nMessage: ${messageContent}`);
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}