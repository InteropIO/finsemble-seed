function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0,
		    v = c === 'x' ? r : r & 0x3 | 0x8;
		return v.toString(16);
	});
}
var myChannel = uuidv4();

function sendRPCMessage(topic, args) {
	var message = {
		args: args,
		callbackChannel: myChannel
	};
	fin.desktop.InterApplicationBus.publish(topic, message);
}

function runrpc() {
		sendRPCMessage("FSBL.Clients.LinkerClient.addToGroup", ["group1", "***null***","***cb***"]);
		sendRPCMessage("FSBL.Clients.LinkerClient.publish", [{dataType:"symbol", data:"AAPL"}, "***cb***"]);
		sendRPCMessage("FSBL.Clients.LinkerClient.subscribe", ["symbol", "***cb***"]);
	//sendRPCMessage("FSBL.Clients.LinkerClient.addToGroup", ["group1"]);
	//sendRPCMessage("FSBL.Clients.LinkerClient.publish", [{ dataType: "symbol", data: "AAPL" }]);
	//sendRPCMessage("FSBL.Clients.LinkerClient.subscribe", ["symbol"]);
}

FSBL.addEventListener('onReady', function () {
	document.querySelector("runme").onclick = runrpc;

	fin.desktop.InterApplicationBus.subscribe("*", myChannel, function (message, uuid, name) {
		console.log(message);
	});
});
