import * as notifier from '../../services/notification/notificationClient';

FSBL.addEventListener('onReady', function () {
	let count = 0;
	document.getElementById('notifyButton').addEventListener('click', function (event) { 
		count++;
		notifier.notify("Test-Notification", "ALWAYS", "TEST-1", "Notification number " + count, {});
	}, false);
});