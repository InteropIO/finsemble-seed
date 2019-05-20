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
	console.log("Adding Broadcast Listener");
	FSBL.Clients.RouterClient.addListener("broadcast", function (error, response) {
		if (error) {
			console.log("Desktop Agent Broadcast Listener Error: " + JSON.stringify(error));
		} else {
			console.log("Desktop Agent Listener Received Transmit: " + JSON.stringify(response));
			console.log("Broadcast Received:", response);
		}
	});
		
}
