// window.testBroadcast = function testBroadcast() {
// 	console.log("Mark, Test Broadcast Successfull.... psych..");
// }

// import {broadcast} from "../../services/desktopAgent/desktopAgentClient";
const desktopAgent = require("../../../src/services/desktopAgent/desktopAgentClient");
// var appD;
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
	// var appD
	console.log("Desktop Agent", desktopAgent);
	// FSBL.Clients.ConfigClient.getValues([{field:'finsemble.components.Welcome Sender.foreign.services.fdc3'}], function(err, values){
	// 	console.log("Component Config Values for FDC3", values);
	// 	appD = values;
	// });
	// console.log("Mark AppD", appD);
	// FSBL.Clients.RouterClient.addListener("broadcast", function (error, response) {
	// 	if (error) {
	// 		console.log("Desktop Agent Broadcast Error: " + JSON.stringify(error));
	// 	} else {
	// 		console.log("Desktop Agent Sender Received Transmit: " + JSON.stringify(response));
	// 	}
	// });
	// const callback = function callback(err, response) {
	// 	console.log("Desktop Agent Open Completed");
	// }

	testBroadcast = function testBroadcast() {
		var data = {
			"test1": "value1",
			"test2": "value2"
		};
		console.log("Testing Broadcast");
		// console.log("Mark AppD", appD);
		desktopAgent.broadcast(data).then(console.log("I resolved"));
	}

	testOpen = function testOpen() {
		var name = "Welcome Component";
		var context = {
			"test1": "value1"
		};
		console.log("Testing Desktop Agent Open Initiated");
		desktopAgent.open(name, context
			,  function callback(err, response){
			console.log("Desktop Agent Open Completed");
		});
	}

	testAddIntentListener = function testAddIntentListener() {
		var intent = "goFuckYourself";
		const handler = function intentHandler(context){
			console.log("You have received an intent: ", {'intent': intent, 'context': context})
		}
		console.log("Testing Broadcast");
		desktopAgent.addIntentListener(intent, handler);
	}

	testAddContextListener = function testAddContextListener() {
		var context = {
			"test1": "value1",
			"test2": "value2"
		};
		console.log("Testing Broadcast");
		desktopAgent.addContextListener(context);
	}

	testFindIntent = function testFindIntent() {
		var intent = "TestIntent";
		var context = {
			"TestContext": "testContext"
		};
		console.log("Testing FindIntent");
		desktopAgent.findIntent(intent, context);
	}


}
