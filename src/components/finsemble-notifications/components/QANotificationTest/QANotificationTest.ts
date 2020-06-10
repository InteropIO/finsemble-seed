import NotificationClient, { ActionTypes } from "../../services/notification/notificationClient";
import Subscription from "../../types/Notification-definitions/Subscription";
import Action from "../../types/Notification-definitions/Action";
import Notification from "../../types/Notification-definitions/Notification";
import Filter from "../../types/Notification-definitions/Filter";

const notifications: any = {};

(window as any).FSBLNotifications = notifications;

const FSBLReady = () => {
	try {
		notifications["client"] = new NotificationClient();
		notifications["Notification"] = Notification;
		notifications["Action"] = Action;
		notifications["Subscription"] = Subscription;
		notifications["Filter"] = Filter;
		notifications["actionTypes"] = ActionTypes;

		// SHOULD NOW BE ABLE TO RUN
		// const notification = new FSBLNotifications.Notification();
		// const action = new FSBLNotifications.Action();
		// const sub = new FSBLNotifications.Subscription();
		// const filter = new FSBLNotifications.Filter();
		// FSBLNotifications.client.notify([notification]);
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
};

if (window.FSBL && (FSBL as any).addEventListener) {
	(FSBL as any).addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}
