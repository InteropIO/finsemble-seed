import * as notifier from '../../services/notification/notificationClient';

FSBL.addEventListener('onReady', function () {
	document.getElementById('notifyButton').addEventListener('click', function (event) { 
		notifier.notify("Test-Notification", "ALWAYS", "TEST-1", "Test notification content - lets have more notifications", {});
	}, false);
});