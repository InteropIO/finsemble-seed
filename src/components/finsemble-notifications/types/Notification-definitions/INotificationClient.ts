import IFilter from "./IFilter";
import INotification from "./INotification";
import IAction from "./IAction";
import ISubscription from "./ISubscription";

export default interface INotificationClient {

	/**
	 * Subscribe to a notification stream given a set of name/value pair filters. Returns subscriptionId
	 * @param {ISubscription} subscription with name value pair used to match on.
	 * @param {Function} onSubscriptionSuccess called when subscription is successfully created.
	 * @param {Function} onSubscriptionFault if there is an error creating the subscription.
	 * @throws Error
	 */
	subscribe(subscription: ISubscription, onSubscriptionSuccess: Function, onSubscriptionFault: Function): Promise<string>;

	/**
	 * Used to unsubscribe to a notification stream.
	 * @param {string} subscriptionId which was returned when subscription was created.
	 * @throws Error
	 */
	unsubscribe(subscriptionId: string): Promise<void>;

	/**
	 * Return an ISO8601 formatted date a notification matching the specified source was issued.
	 *
	 * @param {string} source identify which notification to save lastUpdated time for.
	 * @returns last issued at date string in the ISO8601 date format.
	 * @throws Error
	 */
	getLastIssuedAt(source?: string): Promise<string>;

	/**
	 * Used by UI components that need to display a list of historical notifications.
	 * @param {string} since ISO8601 formatted string to fetch notifications from.
	 * @param {IFilter} filter to match to notifications.
	 * @returns {INotification[]} array of notifications.
	 * @throws Error
	 */
	fetchHistory(since: string, filter?: IFilter): Promise<INotification[]>;

	/**
	 * Creates or updates notifications in Finsemble.
	 * @param {INotification[]} notifications Array of INotification
	 * @throws Error If no error is thrown the service has received the notifications successfully
	 */
	notify(notifications: INotification[]): Promise<void>;

	/**
	 * Tells the service to perform the action on the notification(s)
	 *
	 * @param {INotification[]} notifications Notifications to apply action to.
	 * @param {IAction} action which has been triggered by user.
	 * @throws Error If no error is thrown the service has received the request to perform the action successfully. Note a successful resolution of the promise does not mean successful completion of the action.
	 */
	performAction(notifications: INotification[], action: IAction): Promise<void>;
}
