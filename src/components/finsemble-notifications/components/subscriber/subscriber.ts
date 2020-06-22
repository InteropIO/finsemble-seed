/* eslint-disable @typescript-eslint/ban-ts-ignore */
import NotificationClient from "../../services/notification/notificationClient";
import Subscription from "../../types/Notification-definitions/Subscription";
import INotification from "../../types/Notification-definitions/INotification";
import Filter from "../../types/Notification-definitions/Filter";
import IAction from "../../types/Notification-definitions/IAction";

/**
 * Basic example of a getting a component to subscribe to notifications
 */

let nClient: NotificationClient = null;

let subscriptionId: string = null;

/**
 * Example for setting up button clicks
 *
 * @param notification
 * @param action
 */
const doAction = (notification: INotification, action: IAction) => {
	try {
		nClient.performAction([notification], action).then(() => {
			// NOTE: The request to perform the action has be sent to the notifications service successfully
			// The action itself has not necessarily been perform successfully
			console.log("success");
		});
	} catch (e) {
		// NOTE: The request to perform the action has failed
		console.log("fail");
	}
};

const addToList = (notification: INotification) => {
	const actions: HTMLButtonElement[] = [];

	notification.actions.forEach(action => {
		const button = document.createElement("button");
		button.innerText = action.buttonText;
		button.onclick = () => {
			doAction(notification, action);
		};
		actions.push(button);
	});

	const divElement = document.createElement("div");
	divElement.setAttribute("id", notification.id);
	divElement.className = "notification";
	divElement.innerHTML = `<h5>${notification.headerText}</h5>
                            <div class="actions-container"></div>`;

	if (notification.isSnoozed) {
		divElement.className += " snoozed";
	}

	if (notification.isRead) {
		divElement.className += " dismissed";
	}

	const actionContainer = divElement.getElementsByClassName("actions-container");
	actions.forEach(action => {
		actionContainer.item(0).appendChild(action);
	});

	const existingElement = document.getElementById(notification.id);
	if (existingElement) {
		existingElement.replaceWith(divElement);
	} else {
		document.getElementById("notification-list").appendChild(divElement);
	}
};

function init() {
	nClient = new NotificationClient();
	const subscription = new Subscription();

	// Set the filter to match INotification fields
	subscription.filter = new Filter();
	// subscription.filter.include.push({"type": "chat"});

	subscription.onNotification = function(notification: INotification) {
		// This function will be called when a notification arrives
		addToList(notification);
	};

	nClient.subscribe(subscription).then(subId => {
		subscriptionId = subId;
		console.log(subId);
	});

	(document.getElementById("fetch-from-date") as HTMLInputElement).value = new Date().toISOString();

	document.getElementById("clear-list").addEventListener("click", () => {
		document.getElementById("notification-list").innerText = "";
	});

	document.getElementById("fetch-history").addEventListener("click", () => {
		nClient.fetchHistory((document.getElementById("fetch-from-date") as HTMLInputElement).value).then(notifications => {
			notifications.forEach(notification => {
				addToList(notification);
			});
		});
	});

	document.getElementById("unsubscribe").addEventListener("click", () => {
		try {
			nClient.unsubscribe(subscriptionId).then(() => {
				// Unsubscribed
			});
		} catch (e) {}
	});
}

// @ts-ignore
if (window.FSBL && FSBL.addEventListener) {
	// @ts-ignore
	FSBL.addEventListener("onReady", init);
} else {
	window.addEventListener("FSBLReady", init);
}
