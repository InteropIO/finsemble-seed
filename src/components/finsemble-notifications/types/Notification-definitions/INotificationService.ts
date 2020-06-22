import INotification from "./INotification";
import IAction from "./IAction";
import ISubscription from "./ISubscription";

export default interface INotificationService {

	/**
	 * Creates or updates notifications in Finsemble.
	 * @param {INotification[]} notifications from external source to be created or updated in Finsemble.
	 */
	notify(notifications: INotification[]): void;

	/**
	 * Delete a notification as part of a purge.
	 * @param {string} id of a notification
	 * @private
	 */
	deleteNotification(id: string): void;

	/**
	 * Stores the time when a notification arrived from a specific source in finsemble.
	 *
	 * @param {string} source a notification that was updated. This notification can then be matched on using a filter to find out when different notifications were last updated.
	 * @param {string} issuedAt ISO8601 format string. When a notification was last delivered to Finsemble.
	 * @private
	 */
	saveLastIssuedAt(source: string, issuedAt: string): void;

	/**
	 * Called in response to a user action VIA a NotificationClient router transmit.
	 * @private
	 */
	performAction(notifications: INotification[], action: IAction): void;

	/**
	 * When incoming notification arrive, lookup matching subscriptions and call necessary
	 * callbacks on subscription.
	 * @param {INotification} notification of INotification objects to broadcast.
	 * @private
	 */
	broadcastNotification(notification: INotification): void;

	/**
	 *
	 * @param {ISubscription} subscription
	 * @return {string} a router channel on which notifications for this subscription will be sent.
	 */
	subscribe(subscription: ISubscription): Object;
}
