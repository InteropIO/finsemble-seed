// window.testBroadcast = function testBroadcast() {
// 	console.log("Mark, Test Broadcast Successfull.... psych..");
// }

// import {broadcast} from "../../services/desktopAgent/desktopAgentClient";
const dektopAgent = require("../../../src/services/desktopAgent/desktopAgentClient");

window.quitFinsemble = function quitFinsemble() {
	//console.log("Quit button successfully triggered");
	FSBL.shutdownApplication();
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', init);
} else {
	window.addEventListener('FSBLReady', init);
}

function init() {


	FSBL.Clients.RouterClient.addListener("broadcast", function (error, response) {
		if (error) {
			console.log("Desktop Agent Broadcast Error: " + JSON.stringify(error));
		} else {
			console.log("Desktop Agent Sender Received Transmit: " + JSON.stringify(response));
		}
	});

	testBroadcast = function testBroadcast() {
		var context = {
			"test1": "value1",
			"test2": "value2"
		};
		console.log("Testing Broadcast");
		dektopAgent.broadcast(context);
	}


}
