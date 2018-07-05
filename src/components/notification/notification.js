function onNotificationMessage(message) {
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
}

var init = function () {
	document.querySelector("#closer").addEventListener('click', function () {
		var notification = fin.desktop.Notification.getCurrent();
		notification.close();
	});
};


FSBL.addEventListener('onReady', function () {
	//grab spawn data and populate the notification

	init();

	// let spawnData = FSBL.Clients.WindowClient.getSpawnData();
	// Logger.log("Notifications spawn data: " + JSON.stringify(spawnData));
	// if (spawnData && spawnData.textContent){
	// 	$('#content').text(spawnData.textContent);
	// } else {
	// 	$('#content').text("No notification text provided!");
	// }
	// if (spawnData && spawnData.action){
	// 	$('body').click(function (event) {
	// 		let winId = WindowClient.getWindowIdentifier();
	// 		let finwin = WindowClient.getCurrentWindow();
	// 		LauncherClient.spawn(spawnData.action.componentType, spawnData.action.params, function() {

	// 			//notify the service that this notification is gone and others can move down.
	// 			clearNotification(winId);

	// 			//close the notification
	// 			finwin.close(true);
	// 		});
	// 	});
	// }


});