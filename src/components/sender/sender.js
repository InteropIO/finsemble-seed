const desktopAgent = require("../../services/desktopAgent/desktopAgentClient");
const Finsemble = require("@chartiq/finsemble");
const LinkerClient = Finsemble.Clients.LinkerClient;

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

	testOpen = function testOpen() {
		var name = "Welcome Component";
		var context = "garbage";
		console.log("Testing Desktop Agent Open Initiated");
		desktopAgent.open(name, context
			, function callback(err, response) {
				console.log("Desktop Agent Open Completed");
			});
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

	testBroadcast = function testBroadcast() {
		var data = {
			"test1": "value1",
			"test2": "value2"
		};
		console.log("Testing Broadcast");
		// console.log("Mark AppD", appD);
		desktopAgent.broadcast(data).then(console.log("I resolved"));
	}

	testRaiseIntent = async function testRaiseIntent() {
		debugger;
		var intent = "StartChat";
		var context = {
			"type": "fdc3.contact",
			"name": "Mark Valeiras",
			"id": {
				"email": "Mark@ChartIQ.com",
				"phone": "5551238888"
			}
		};
		console.log("Testing FindIntent");
		const appIntent = await desktopAgent.findIntent(intent, context).then((appIntent) => {
			console.log("Here is the Intent In the Then:", appIntent);
			debugger;
			desktopAgent.raiseIntent(appIntent.intent.name, context).then(console.log("WelcomeSender RaiseIntent Completed"));
		}
		);
		console.log("Here is the Intent:", appIntent);
		// debugger;
		// await desktopAgent.raiseIntent(appIntent.apps[0].name + appIntent.intent.name, context, appIntent.apps[0].name).then(console.log("WelcomeSender RaiseIntent Completed"));
		
	}

	testAddIntentListener = function testAddIntentListener() {
		var intent = "StartChat";
		const handler = function intentHandler(context) {
			console.log("You have received an intent: ", { 'intent': intent, 'context': context })
		}
		console.log("Testing Broadcast");
		desktopAgent.addIntentListener(intent, handler);
	}

	testAddContextListener = function testAddContextListener() {
		var context;
		console.log("Testing Broadcast");
		desktopAgent.addContextListener(context);
	}






}
