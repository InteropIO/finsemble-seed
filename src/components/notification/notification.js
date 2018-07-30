import * as notifier from '../../services/notification/notificationClient';

var init = function () {
	FSBL.Clients.Logger.log("Initializing notification");
	console.log("Initializing notification");
	//get spawn data
	let spawnData = FSBL.Clients.WindowClient.getSpawnData();
	//setup the notification"
	FSBL.Clients.Logger.log("Got spawn data", spawnData);

	// Basic templating. Send a message with either "description" or "notification-description" and the
	// template will inject the text. Messages can be HTML if desired.
	if (typeof spawnData.message == "object") {
		for (var name in spawnData.message) {
			var element = document.querySelector(".notification-" + name);
			if (!element) element = document.querySelector("." + name);
			if (element) element.innerHTML = spawnData.message[name];
		}
	} else {
		// If a string is passed as a message then just drop it into the description of our template
		document.querySelector(".notification-description").innerHTML = spawnData.message;
	}

	let windowName = FSBL.Clients.WindowClient.getWindowIdentifier().windowName;

	FSBL.Clients.Logger.log("Setting up actions");
	console.log("Setting up actions");
	//TODO: handle action parameters and display action buttons
	let actionElement = document.querySelector("#notification-action");
	if (spawnData.action && typeof spawnData.action === "object") {
		//setup up the action buttons with call to performAction
		if (spawnData.action.buttonText) {
			actionElement.innerHTML = spawnData.action.buttonText;
		}
		actionElement.addEventListener("click", function(){ 
			notifier.performAction(windowName);
		});
	
	} else {
		//hide action buttons as theres no action
		actionElement.parentNode.removeChild(actionElement);
	}

	// //FIXME: temp code to just close the notification
	// document.querySelector("#closer").addEventListener('click', function () {
	// 	notifier.dismissNotification(windowName);
	// });

	//setup close button in header
	document.querySelector(".notification-close").addEventListener('click', function () {
		notifier.dismissNotification(windowName);
	});

	//listen for closing signals
	FSBL.Clients.RouterClient.addListener(windowName + ".close", function (error, response) {
		if (error) {
			Logger.system.log(windowName + ' close listener error: ' + JSON.stringify(error));
		} else {
			FSBL.Clients.WindowClient.getCurrentWindow().close();
		}
	});


	FSBL.Clients.Logger.log("Set up complete");
	console.log("Set up complete");
};


FSBL.addEventListener('onReady', function () {
	//grab spawn data and populate the notification
	init();

	//TODO: consider hiding notification while setup and then showing it here
});