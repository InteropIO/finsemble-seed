import * as notifier from '../../services/notification/notificationClient';

function onNotificationMessage(message, action) {
	// Basic templating. Send a message with either "description" or "notification-description" and the
	// template will inject the text. Messages can be HTML if desired.
	if (typeof message == "object") {
		for (var name in message) {
			var element = document.querySelector(".notification-" + name);
			if (!element) element = document.querySelector("." + name);
			if (element) element.innerHTML = message[name];
		}
	} else {
		// If a string is passed as a message then just drop it into the description of our template
		document.querySelector(".notification-description").innerHTML = message;
	}

	FSBL.Clients.Logger.log("Setting up actions");
	console.log("Setting up actions");
	//TODO: handle action parameters and display action button 
	if (action && typeof action === "object") {
		//setup up the action button with call to performAction
	} else {
		//hide action button as theres no action
	}

	//FIXME: temp code to just close the notification
	document.querySelector("#closer").addEventListener('click', function () {
		notifier.dismissNotification(WindowClient.getWindowIdentifier());
	});

	//setup close button in header
	document.querySelector(".notification-close").addEventListener('click', function () {
		notifier.dismissNotification(WindowClient.getWindowIdentifier());
	});
}

var init = function () {
	FSBL.Clients.Logger.log("Initializing notification");
	console.log("Initializing notification");
	//get spawn data
	FSBL.Clients.WindowClient.getSpawnData(function (spawnData) {
		//setup the notification"
		FSBL.Clients.Logger.log("Got spawn data", spawnData);
		onNotificationMessage(spawnData.message, spawnData.action);
	});
};
FSBL.Clients.Logger.log("Set up complete");
console.log("Set up complete");

FSBL.addEventListener('onReady', function () {
	//grab spawn data and populate the notification
	init();

	//TODO: consider hiding notification while setup and then showing it here
});