import * as notifier from '../../services/notification/notificationClient';

var init = function () {
	FSBL.Clients.Logger.log("Initializing notification");
	console.log("Initializing notification");
	//get spawn data
	let spawnData = FSBL.Clients.WindowClient.getSpawnData();
	//setup the notification
	FSBL.Clients.Logger.log("Got spawn data", spawnData);

	//disabled in favour of a simple string message / icon url / actions format for notifications
	// // Basic templating. Send a message with either "description" or "notification-description" and the
	// // template will inject the text. Messages can be HTML if desired.
	// if (typeof spawnData.message == "object") {
	// 	for (var name in spawnData.message) {
	// 		var element = document.querySelector(".notification-" + name);
	// 		if (!element) element = document.querySelector("." + name);
	// 		if (element) element.innerHTML = spawnData.message[name];
	// 	}
	// } else {
		// If a string is passed as a message then just drop it into the description of our template
		document.querySelector(".notification-description").innerHTML = spawnData.message;
	// }

	document.querySelector(".notification-logo").innerHTML = "<img src='" + spawnData.iconURL + "' width='100%' />";

	let windowName = FSBL.Clients.WindowClient.getWindowIdentifier().windowName;

	// display action buttons
	FSBL.Clients.Logger.log("Setting up actions");
	console.log("Setting up actions");
	let actionElement = document.querySelector("#notification-actions");
	if (spawnData.params && spawnData.params.actions && spawnData.params.actions.length) {
		//TODO: update to setup primary button and then populate a dropdown with the other actions
		//setup up the action buttons with call to performAction
		for (let a = 0; a < spawnData.params.actions.length; a++) {
			let action_index = a;
			var buttonnode = document.createElement('button');
			buttonnode.innerHTML = spawnData.params.actions[a].buttonText;
			buttonnode.setAttribute('id','notification-action-' + action_index);
			buttonnode.setAttribute('class','notification-action');
			actionElement.appendChild(buttonnode);
			buttonnode.addEventListener("click", function(){ 
				notifier.performAction(windowName, action_index);
			});
		}
	} else { //no actions
		actionElement.parentNode.removeChild(actionElement); 
	}

	//setup close button in header
	document.querySelector(".notification-close").addEventListener('click', function () {
		notifier.dismissNotification(windowName);
	});

	//listen for closing signals
	FSBL.Clients.RouterClient.addListener(windowName + ".close", function (error, response) {
		if (error) {
			Logger.system.log(windowName + ' close listener error: ' + JSON.stringify(error));
		} else {
			FSBL.Clients.WindowClient.close();
		}
	});

	FSBL.Clients.Logger.log("Set up complete");
	console.log("Set up complete");
};

FSBL.addEventListener('onReady', function () {
	//grab spawn data and populate the notification
	init();
	//don't show the notificiton until its initialised so it appears more nicely
	FSBL.Clients.WindowClient.getCurrentWindow().show();
});