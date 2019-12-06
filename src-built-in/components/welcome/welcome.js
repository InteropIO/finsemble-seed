const desktopAgent = require("../../../src/services/desktopAgent/desktopAgentClient");
const Finsemble = require("@chartiq/finsemble");
const LinkerClient = Finsemble.Clients.LinkerClient;

window.launchTutorial = function launchTutorial() {
}

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
	// console.log("Adding Broadcast Listener");
	// FSBL.Clients.RouterClient.addListener("broadcast", function (error, response) {
	// 	if (error) {
	// 		console.log("Desktop Agent Broadcast Listener Error: " + JSON.stringify(error));
	// 	} else {
	// 		console.log("Desktop Agent Listener Received Transmit: " + JSON.stringify(response));
	// 		console.log("Broadcast Received:", response);
	// 	}
	// });

	// console.log("Adding New IntentListener for StartChat");
	// var intent = "StartChat";
	// const handler = function intentHandler(context) {
	// 	console.log("You have received an intent: ", { 'intent': intent, 'context': context })
	// };
	// desktopAgent.addIntentListener(intent, handler);

	LinkerClient.subscribe("Welcome ComponentStartChat", function(data){
		debugger;
		console.log("New symbol received from a remote component " + data);
		});


}