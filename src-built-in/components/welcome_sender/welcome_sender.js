const desktopAgent = require("../../../src/services/desktopAgent/desktopAgentClient");

window.quitFinsemble = function quitFinsemble() {
	FSBL.shutdownApplication();
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', init);
} else {
	window.addEventListener('FSBLReady', init);
}

function init() {
	console.log("Desktop Agent", desktopAgent);

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
		var context = "garbage";
		console.log("Testing Desktop Agent Open Initiated");
		desktopAgent.open(name, context
			,  function callback(err, response){
			console.log("Desktop Agent Open Completed");
		});
	}

	testAddIntentListener = function testAddIntentListener() {
		var intent = "StartChat";
		const handler = function intentHandler(context){
			console.log("You have received an intent: ", {'intent': intent, 'context': context})
		}
		console.log("Testing Broadcast");
		desktopAgent.addIntentListener(intent, handler);
	}

	testAddContextListener = function testAddContextListener() {
		var context;
		console.log("Testing Broadcast");
		desktopAgent.addContextListener(context);
	}

	testFindIntent = async function testFindIntent() {
		var intent = "SitPretty";
		var context = "garbage";
		console.log("Testing FindIntent");
		const appIntent = await desktopAgent.findIntent(intent, context);
		console.log("Here is the Intent:", appIntent);
	}

	testFindIntentsByContext = async function testFindIntentsByContext() {
		var context = "garbage";
		console.log("Testing FindIntentsByContext");
		const appIntent = await desktopAgent.findIntentsByContext(context);
		console.log("Here is the Intent:", appIntent);
	}


}
