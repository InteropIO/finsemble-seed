import * as notifier from '../../services/notification/notificationClient';

FSBL.addEventListener('onReady', function () {
	let count = 0;
	document.getElementById('notifyButton1').addEventListener('click', function (event) { 
		count++;
		notifier.notify("Test-Notification", "ALWAYS", "TEST-1", "Notification number " + count, {});
	}, false);


	let spawnAction = {
		buttonText: "welcome!",
		type: "spawn",
		component: "Welcome Component",
		params: {
			left: 0,
			top: 0,
			height: 350,
			width: 350
		}
	};
	document.getElementById('notifyButton2').addEventListener('click', function (event) { 
		count++;
		notifier.notify("Test-Actions", "ALWAYS", "TEST-2", "Notification number " + count + " (with action)", {action: spawnAction});
	}, false);
	
	let windowIdentifier = {componentType: "Welcome Component", windowName: "WelcomeSingleton"};
	let showWindowAction = {
		buttonText: "show welcome!",
		type: "showWindow",
		windowIdentifier: windowIdentifier,
		params: {
			spawnIfNotFound: true,
			left: null,
			right: 0,
			top: 0,
			height: 350,
			width: 350
		}
	};
	document.getElementById('notifyButton3').addEventListener('click', function (event) { 
		count++;
		notifier.notify("Test-Actions", "ALWAYS", "TEST-3", "Notification number " + count + " (with showWindow)", {action: showWindowAction});
	}, false);

});