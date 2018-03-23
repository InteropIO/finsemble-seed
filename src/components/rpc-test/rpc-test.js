// Random string generator
function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0,
		    v = c === 'x' ? r : r & 0x3 | 0x8;
		return v.toString(16);
	});
}

var myChannel = uuidv4(); // Come up with a random channel name for responses from the RPC service
var callbackMap = {}; // Very simply proof of concept for matching responses

// Here is a simplified interface for the developer.
function sendRPCMessage(endpoint, args, cb) {
	// Use this very simple transactionID and callbackMap to match up responses to the original request
	var transactionID = uuidv4();
	if (cb) callbackMap[transactionID] = cb;
	
	// Build a message that is compatible with RPC.
	var message = {
		args: args,
		callbackChannel: myChannel,
		endpoint: endpoint,
		transactionID: transactionID // This isn't part of RPC. We use it internally here for matching.
	};
	// Send that message over the IAB on the known channel FSBL.rpc
	fin.desktop.InterApplicationBus.publish("FSBL.rpc", message);
}

// RPC messages go over openfin channel "FSBL.rpc". The endpoint(LinkerClient.addToGroup)
// is put into the message. ***cb*** indicates that a callback is expected.
// ***null*** is null for languages that don't have an equivalent.
// (We'll probably need ***windowIdentifier*** once we refactor the WindowClient so that it uses FSBLWindow.)

function linkme() {

	// Add to purple channel
	sendRPCMessage("LinkerClient.linkToChannel", ["group1", "***null***", "***cb***"], function () {
		// Then switch to APPL
		sendRPCMessage("LinkerClient.publish", [{dataType:"symbol", data:"GE"}]);
	});
	// Meanwile, subscribe to changes
	sendRPCMessage("LinkerClient.subscribe", ["symbol", "***cb***"], function () {
		console.log(arguments);
	});
}

function launchme() {
	sendRPCMessage("LauncherClient.spawn", ["chart", "***null***", "***cb***"], function () {
	});
}

function logmein() {
	sendRPCMessage("AuthenticationClient.publishAuthorization", ["test","test"]);
}

function showWindow() {
	FSBL.Clients.LauncherClient.spawn("chart", { top: 0, left: 0, width: 200, height: 200 }, function (err, obj) {
		var o = FSBL.Clients.LauncherClient.getRawWindow(obj.windowIdentifier);
		console.log(o);
	});
}

fin.desktop.main(function () {
	// Set up the openfin channel for receiving responses
	fin.desktop.InterApplicationBus.subscribe("*", myChannel, function (message, uuid, name) {
		// Handle response. Try to find the original callback and pass it the arguments returned by RPC.
		var transactionID = message.request.transactionID;
		var cb = callbackMap[transactionID];

		// Apply the callback
		if (cb) cb.apply(null, message.args);
	});

	// Click on 'runme' to invoke runrpc()
	document.querySelector("linkme").onclick = linkme;
	document.querySelector("launchme").onclick = launchme;
	document.querySelector("logmein").onclick = logmein;
	document.querySelector("showWindow").onclick = showWindow;
});